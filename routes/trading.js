const express = require('express');
const router = express.Router();
const Trade = require('../models/Trade');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');
const priceService = require('../utils/priceService');

// @route   GET /api/trading/pairs
// @desc    Get available trading pairs
// @access  Public
router.get('/pairs', async (req, res) => {
  try {
    const pairs = priceService.getTradingPairs();

    res.status(200).json({
      success: true,
      pairs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/trading/order
// @desc    Place a trading order
// @access  Private
router.post('/order', protect, async (req, res) => {
  try {
    const { type, orderType, pair, amount, price, stopPrice } = req.body;

    if (!type || !pair || !amount || !price) {
      return res.status(400).json({
        success: false,
        message: 'Type, pair, amount, and price are required'
      });
    }

    // Split pair into base and quote
    const [baseCurrency, quoteCurrency] = pair.split('/');

    // Get wallet
    const wallet = await Wallet.findOne({ user: req.user.id });

    if (type === 'buy') {
      // Check if user has enough quote currency
      const quoteBalance = wallet.getBalance(quoteCurrency);
      const total = amount * price;
      
      if (quoteBalance.available < total) {
        return res.status(400).json({
          success: false,
          message: `Insufficient ${quoteCurrency} balance`
        });
      }

      // Lock the quote currency
      await wallet.updateBalance(quoteCurrency, -total, 'available');
      await wallet.updateBalance(quoteCurrency, total, 'locked');

    } else {
      // Check if user has enough base currency
      const baseBalance = wallet.getBalance(baseCurrency);
      
      if (baseBalance.available < amount) {
        return res.status(400).json({
          success: false,
          message: `Insufficient ${baseCurrency} balance`
        });
      }

      // Lock the base currency
      await wallet.updateBalance(baseCurrency, -amount, 'available');
      await wallet.updateBalance(baseCurrency, amount, 'locked');
    }

    // Create trade order
    const trade = await Trade.create({
      user: req.user.id,
      type,
      orderType: orderType || 'market',
      pair,
      baseCurrency,
      quoteCurrency,
      amount,
      price,
      stopPrice,
      status: orderType === 'market' ? 'filled' : 'open'
    });

    // If market order, execute immediately
    if (orderType === 'market' || !orderType) {
      trade.filled = amount;
      trade.status = 'filled';
      trade.executedAt = Date.now();
      await trade.save();

      // Update wallet balances
      if (type === 'buy') {
        const total = amount * price;
        const fee = total * 0.001;
        
        await wallet.updateBalance(quoteCurrency, -(total + fee), 'locked');
        await wallet.updateBalance(baseCurrency, amount, 'available');
      } else {
        const total = amount * price;
        const fee = total * 0.001;
        
        await wallet.updateBalance(baseCurrency, -amount, 'locked');
        await wallet.updateBalance(quoteCurrency, total - fee, 'available');
      }

      // Create transaction record
      await Transaction.create({
        user: req.user.id,
        type: 'trade',
        currency: baseCurrency,
        amount: type === 'buy' ? amount : -amount,
        fee: trade.fee,
        status: 'completed',
        description: `${type.toUpperCase()} ${amount} ${baseCurrency} at ${price} ${quoteCurrency}`,
        relatedTrade: trade._id,
        completedAt: Date.now()
      });
    }

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.emit('newTrade', trade);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
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

// @route   GET /api/trading/orders
// @desc    Get user orders
// @access  Private
router.get('/orders', protect, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { user: req.user.id };
    if (status) {
      query.status = status;
    }

    const orders = await Trade.find(query).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/trading/order/:id
// @desc    Cancel an order
// @access  Private
router.delete('/order/:id', protect, async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (trade.status === 'filled' || trade.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this order'
      });
    }

    // Release locked funds
    const wallet = await Wallet.findOne({ user: req.user.id });
    
    if (trade.type === 'buy') {
      const total = trade.amount * trade.price;
      await wallet.updateBalance(trade.quoteCurrency, -total, 'locked');
      await wallet.updateBalance(trade.quoteCurrency, total, 'available');
    } else {
      await wallet.updateBalance(trade.baseCurrency, -trade.amount, 'locked');
      await wallet.updateBalance(trade.baseCurrency, trade.amount, 'available');
    }

    trade.status = 'cancelled';
    await trade.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
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

// @route   GET /api/trading/history
// @desc    Get trading history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    
    const trades = await Trade.find({ 
      user: req.user.id,
      status: 'filled'
    })
      .sort('-executedAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Trade.countDocuments({ 
      user: req.user.id,
      status: 'filled'
    });

    res.status(200).json({
      success: true,
      count: trades.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      trades
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
