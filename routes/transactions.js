const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

// @route   GET /api/transactions
// @desc    Get user transactions
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;

    let query = { user: req.user.id };
    
    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
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

// @route   GET /api/transactions/:id
// @desc    Get transaction by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
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

// @route   GET /api/transactions/stats/summary
// @desc    Get transaction statistics
// @access  Private
router.get('/stats/summary', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id });

    let stats = {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalTrading: 0,
      totalMining: 0,
      totalP2P: 0,
      pending: 0,
      completed: 0,
      failed: 0
    };

    transactions.forEach(tx => {
      // Count by type
      if (tx.type === 'deposit' && tx.status === 'completed') {
        stats.totalDeposits += tx.amount;
      } else if (tx.type === 'withdrawal' && tx.status === 'completed') {
        stats.totalWithdrawals += tx.amount;
      } else if (tx.type === 'trade') {
        stats.totalTrading += Math.abs(tx.amount);
      } else if (tx.type === 'mining') {
        stats.totalMining += tx.amount;
      } else if (tx.type === 'p2p') {
        stats.totalP2P += Math.abs(tx.amount);
      }

      // Count by status
      if (tx.status === 'pending') stats.pending++;
      else if (tx.status === 'completed') stats.completed++;
      else if (tx.status === 'failed') stats.failed++;
    });

    res.status(200).json({
      success: true,
      stats
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
