const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/users/referrals
// @desc    Get user referrals
// @access  Private
router.get('/referrals', protect, async (req, res) => {
  try {
    const referrals = await User.find({ referredBy: req.user.id })
      .select('firstName lastName email createdAt')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: referrals.length,
      referrals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const Wallet = require('../models/Wallet');
    const Transaction = require('../models/Transaction');
    const { MiningInvestment } = require('../models/Mining');
    const Trade = require('../models/Trade');

    const wallet = await Wallet.findOne({ user: req.user.id });
    const transactions = await Transaction.countDocuments({ user: req.user.id });
    const miningInvestments = await MiningInvestment.countDocuments({ 
      user: req.user.id, 
      status: 'active' 
    });
    const trades = await Trade.countDocuments({ user: req.user.id });
    const referrals = await User.countDocuments({ referredBy: req.user.id });

    // Calculate total portfolio value (simplified)
    let totalValue = 0;
    if (wallet) {
      wallet.balances.forEach(balance => {
        totalValue += balance.total;
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalValue: totalValue.toFixed(2),
        totalTransactions: transactions,
        activeMining: miningInvestments,
        totalTrades: trades,
        totalReferrals: referrals,
        wallet: wallet ? wallet.balances : []
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

module.exports = router;
