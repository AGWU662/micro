const express = require('express');
const router = express.Router();
const { MiningPlan, MiningInvestment } = require('../models/Mining');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

// @route   GET /api/mining/plans
// @desc    Get all mining plans
// @access  Public
router.get('/plans', async (req, res) => {
  try {
    const plans = await MiningPlan.find({ isActive: true }).sort('minInvestment');

    res.status(200).json({
      success: true,
      count: plans.length,
      plans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/mining/investments
// @desc    Get user mining investments
// @access  Private
router.get('/investments', protect, async (req, res) => {
  try {
    const investments = await MiningInvestment.find({ user: req.user.id })
      .populate('plan', 'name currency')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: investments.length,
      investments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/mining/invest
// @desc    Create new mining investment
// @access  Private
router.post('/invest', protect, async (req, res) => {
  try {
    const { planId, amount } = req.body;

    if (!planId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Plan and amount are required'
      });
    }

    // Get mining plan
    const plan = await MiningPlan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Mining plan not found or inactive'
      });
    }

    // Validate investment amount
    if (amount < plan.minInvestment || amount > plan.maxInvestment) {
      return res.status(400).json({
        success: false,
        message: `Investment must be between ${plan.minInvestment} and ${plan.maxInvestment} ${plan.currency}`
      });
    }

    // Get user wallet
    const wallet = await Wallet.findOne({ user: req.user.id });
    const balance = wallet.getBalance(plan.currency);

    // Check if sufficient balance
    if (balance.available < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Deduct amount from wallet
    await wallet.updateBalance(plan.currency, -amount, 'available');

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + plan.duration * 24 * 60 * 60 * 1000);

    // Create mining investment
    const investment = await MiningInvestment.create({
      user: req.user.id,
      plan: planId,
      amount,
      currency: plan.currency,
      dailyReturn: plan.dailyReturn,
      startDate,
      endDate,
      status: 'active'
    });

    // Create transaction record
    await Transaction.create({
      user: req.user.id,
      type: 'mining',
      currency: plan.currency,
      amount: -amount,
      status: 'completed',
      description: `Mining investment in ${plan.name}`,
      relatedMining: investment._id,
      completedAt: Date.now()
    });

    res.status(201).json({
      success: true,
      message: 'Mining investment created successfully',
      investment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/mining/earnings
// @desc    Get mining earnings summary
// @access  Private
router.get('/earnings', protect, async (req, res) => {
  try {
    const investments = await MiningInvestment.find({ 
      user: req.user.id,
      status: 'active'
    });

    let totalInvested = 0;
    let totalEarned = 0;
    let dailyEarnings = 0;

    investments.forEach(investment => {
      totalInvested += investment.amount;
      totalEarned += investment.returnReceived;
      
      // Calculate daily earnings
      const dailyReturn = investment.amount * (investment.dailyReturn / 100);
      dailyEarnings += dailyReturn;
    });

    res.status(200).json({
      success: true,
      earnings: {
        totalInvested,
        totalEarned,
        dailyEarnings,
        activeInvestments: investments.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/mining/claim/:id
// @desc    Claim mining returns
// @access  Private
router.post('/claim/:id', protect, async (req, res) => {
  try {
    const investment = await MiningInvestment.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    if (investment.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Investment is not active'
      });
    }

    // Calculate claimable amount
    const now = new Date();
    const lastPayout = investment.lastPayoutDate || investment.startDate;
    const daysSinceLastPayout = Math.floor((now - lastPayout) / (1000 * 60 * 60 * 24));

    if (daysSinceLastPayout < 1) {
      return res.status(400).json({
        success: false,
        message: 'No returns available to claim yet'
      });
    }

    const claimableAmount = investment.amount * (investment.dailyReturn / 100) * daysSinceLastPayout;

    // Add to wallet
    const wallet = await Wallet.findOne({ user: req.user.id });
    await wallet.updateBalance(investment.currency, claimableAmount, 'available');

    // Update investment
    investment.returnReceived += claimableAmount;
    investment.lastPayoutDate = now;

    // Check if investment is completed
    if (now >= investment.endDate) {
      investment.status = 'completed';
      // Return principal
      await wallet.updateBalance(investment.currency, investment.amount, 'available');
    }

    await investment.save();

    // Create transaction record
    await Transaction.create({
      user: req.user.id,
      type: 'mining',
      currency: investment.currency,
      amount: claimableAmount,
      status: 'completed',
      description: `Mining returns claimed`,
      relatedMining: investment._id,
      completedAt: Date.now()
    });

    res.status(200).json({
      success: true,
      message: 'Mining returns claimed successfully',
      amount: claimableAmount,
      investment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
