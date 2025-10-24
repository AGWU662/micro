const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { MiningPlan, MiningInvestment } = require('../models/Mining');
const Trade = require('../models/Trade');
const { P2POffer, P2PTrade } = require('../models/P2PTrade');
const { protect, isAdmin } = require('../middleware/auth');
const { sendKYCStatusEmail, sendTransactionEmail } = require('../utils/emailService');

// Apply admin middleware to all routes
router.use(protect);
router.use(isAdmin);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', isActive: true });
    const totalTransactions = await Transaction.countDocuments();
    const pendingWithdrawals = await Transaction.countDocuments({ 
      type: 'withdrawal', 
      status: 'pending' 
    });
    const activeMining = await MiningInvestment.countDocuments({ status: 'active' });
    const totalTrades = await Trade.countDocuments({ status: 'filled' });
    const activeP2PTrades = await P2PTrade.countDocuments({ 
      status: { $in: ['payment_pending', 'payment_confirmed'] } 
    });

    // Calculate total platform balance
    const wallets = await Wallet.find();
    let totalBalance = { BTC: 0, ETH: 0, USDT: 0 };
    
    wallets.forEach(wallet => {
      wallet.balances.forEach(balance => {
        if (totalBalance[balance.currency] !== undefined) {
          totalBalance[balance.currency] += balance.total;
        }
      });
    });

    // Recent activities
    const recentTransactions = await Transaction.find()
      .populate('user', 'firstName lastName email')
      .sort('-createdAt')
      .limit(10);

    const recentUsers = await User.find({ role: 'user' })
      .select('firstName lastName email createdAt isVerified kycStatus')
      .sort('-createdAt')
      .limit(10);

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers
        },
        transactions: {
          total: totalTransactions,
          pendingWithdrawals
        },
        mining: {
          activeInvestments: activeMining
        },
        trading: {
          totalTrades,
          activeP2P: activeP2PTrades
        },
        platformBalance: totalBalance
      },
      recentTransactions,
      recentUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;

    let query = { role: 'user' };
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.isActive = status === 'active';
    }

    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/admin/user/:id
// @desc    Get user details
// @access  Private/Admin
router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const wallet = await Wallet.findOne({ user: req.params.id });
    const transactions = await Transaction.find({ user: req.params.id })
      .sort('-createdAt')
      .limit(10);
    const miningInvestments = await MiningInvestment.find({ user: req.params.id })
      .populate('plan');

    res.status(200).json({
      success: true,
      user,
      wallet,
      transactions,
      miningInvestments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/user/:id/status
// @desc    Update user status
// @access  Private/Admin
router.put('/user/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
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

// @route   PUT /api/admin/user/:id/kyc
// @desc    Update user KYC status
// @access  Private/Admin
router.put('/user/:id/kyc', async (req, res) => {
  try {
    const { kycStatus } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(kycStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid KYC status'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { kycStatus },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Send KYC status email notification
    sendKYCStatusEmail(user, kycStatus).catch(err => console.error('Email error:', err));

    // Emit Socket.io event for real-time notification
    const io = req.app.get('io');
    if (io) {
      io.emit(`kyc_status_${user._id}`, {
        status: kycStatus,
        message: `Your KYC verification has been ${kycStatus}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'KYC status updated successfully',
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

// @route   GET /api/admin/transactions
// @desc    Get all transactions
// @access  Private/Admin
router.get('/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 50, type, status } = req.query;

    let query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .populate('user', 'firstName lastName email')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/transaction/:id/approve
// @desc    Approve deposit/withdrawal
// @access  Private/Admin
router.put('/transaction/:id/approve', async (req, res) => {
  try {
    const { txHash, note } = req.body;

    const transaction = await Transaction.findById(req.params.id)
      .populate('user', 'firstName lastName email');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Transaction is not pending'
      });
    }

    const wallet = await Wallet.findOne({ user: transaction.user._id });

    if (transaction.type === 'deposit') {
      // Add to available balance
      await wallet.updateBalance(transaction.currency, transaction.amount, 'available');
      wallet.totalDeposits += transaction.amount;
      await wallet.save();
    } else if (transaction.type === 'withdrawal') {
      // Remove from locked balance
      await wallet.updateBalance(transaction.currency, -(transaction.amount + transaction.fee), 'locked');
      wallet.totalWithdrawals += transaction.amount;
      await wallet.save();
    }

    transaction.status = 'completed';
    transaction.txHash = txHash;
    transaction.processedBy = req.user.id;
    transaction.processingNote = note;
    transaction.completedAt = Date.now();
    await transaction.save();

    // Send transaction notification email
    sendTransactionEmail(transaction.user, transaction).catch(err => console.error('Email error:', err));

    // Emit Socket.io event for real-time notification
    const io = req.app.get('io');
    if (io) {
      io.emit(`transaction_${transaction.user._id}`, {
        type: 'transaction_completed',
        transaction: {
          id: transaction._id,
          type: transaction.type,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction approved successfully',
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/transaction/:id/reject
// @desc    Reject deposit/withdrawal
// @access  Private/Admin
router.put('/transaction/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Transaction is not pending'
      });
    }

    // If withdrawal, unlock the funds
    if (transaction.type === 'withdrawal') {
      const wallet = await Wallet.findOne({ user: transaction.user });
      await wallet.updateBalance(transaction.currency, -(transaction.amount + transaction.fee), 'locked');
      await wallet.updateBalance(transaction.currency, transaction.amount + transaction.fee, 'available');
    }

    transaction.status = 'failed';
    transaction.processedBy = req.user.id;
    transaction.processingNote = reason;
    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Transaction rejected',
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/admin/mining-plan
// @desc    Create mining plan
// @access  Private/Admin
router.post('/mining-plan', async (req, res) => {
  try {
    const { name, currency, minInvestment, maxInvestment, dailyReturn, duration, description } = req.body;

    const plan = await MiningPlan.create({
      name,
      currency: currency.toUpperCase(),
      minInvestment,
      maxInvestment,
      dailyReturn,
      duration,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Mining plan created successfully',
      plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/admin/mining-plans
// @desc    Get all mining plans
// @access  Private/Admin
router.get('/mining-plans', async (req, res) => {
  try {
    const plans = await MiningPlan.find().sort('-createdAt');

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

// @route   PUT /api/admin/mining-plan/:id
// @desc    Update mining plan
// @access  Private/Admin
router.put('/mining-plan/:id', async (req, res) => {
  try {
    const plan = await MiningPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Mining plan not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Mining plan updated successfully',
      plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/mining-plan/:id
// @desc    Delete mining plan
// @access  Private/Admin
router.delete('/mining-plan/:id', async (req, res) => {
  try {
    const plan = await MiningPlan.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Mining plan not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Mining plan deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/admin/adjust-balance
// @desc    Manually adjust user balance
// @access  Private/Admin
router.post('/adjust-balance', async (req, res) => {
  try {
    const { userId, currency, amount, reason } = req.body;

    if (!userId || !currency || !amount) {
      return res.status(400).json({
        success: false,
        message: 'User ID, currency, and amount are required'
      });
    }

    const wallet = await Wallet.findOne({ user: userId });
    
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    await wallet.updateBalance(currency, amount, 'available');

    // Create transaction record
    await Transaction.create({
      user: userId,
      type: amount > 0 ? 'bonus' : 'fee',
      currency: currency.toUpperCase(),
      amount,
      status: 'completed',
      description: reason || `Manual balance adjustment by admin`,
      processedBy: req.user.id,
      completedAt: Date.now()
    });

    res.status(200).json({
      success: true,
      message: 'Balance adjusted successfully',
      wallet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/admin/p2p-disputes
// @desc    Get all P2P disputes
// @access  Private/Admin
router.get('/p2p-disputes', async (req, res) => {
  try {
    const disputes = await P2PTrade.find({ status: 'disputed' })
      .populate('buyer', 'firstName lastName email')
      .populate('seller', 'firstName lastName email')
      .populate('offer')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: disputes.length,
      disputes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/admin/resolve-dispute/:id
// @desc    Resolve P2P dispute
// @access  Private/Admin
router.post('/resolve-dispute/:id', async (req, res) => {
  try {
    const { resolution, winner } = req.body; // winner: 'buyer' or 'seller'

    const trade = await P2PTrade.findById(req.params.id);

    if (!trade || trade.status !== 'disputed') {
      return res.status(404).json({
        success: false,
        message: 'Disputed trade not found'
      });
    }

    const sellerWallet = await Wallet.findOne({ user: trade.seller });
    const buyerWallet = await Wallet.findOne({ user: trade.buyer });

    if (winner === 'buyer') {
      // Release crypto to buyer
      await sellerWallet.updateBalance(trade.currency, -trade.cryptoAmount, 'locked');
      await buyerWallet.updateBalance(trade.currency, trade.cryptoAmount, 'available');
      trade.status = 'completed';
    } else {
      // Return crypto to seller
      await sellerWallet.updateBalance(trade.currency, -trade.cryptoAmount, 'locked');
      await sellerWallet.updateBalance(trade.currency, trade.cryptoAmount, 'available');
      trade.status = 'cancelled';
    }

    trade.dispute.resolvedBy = req.user.id;
    trade.dispute.resolution = resolution;
    trade.dispute.resolvedAt = Date.now();
    await trade.save();

    res.status(200).json({
      success: true,
      message: 'Dispute resolved successfully',
      trade
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
