const express = require('express');
const router = express.Router();
const { P2POffer, P2PTrade } = require('../models/P2PTrade');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

// @route   GET /api/p2p/offers
// @desc    Get all P2P offers
// @access  Public
router.get('/offers', async (req, res) => {
  try {
    const { currency, fiatCurrency, paymentMethod } = req.query;
    
    let query = { status: 'active' };
    
    if (currency) query.currency = currency.toUpperCase();
    if (fiatCurrency) query.fiatCurrency = fiatCurrency.toUpperCase();
    if (paymentMethod) query.paymentMethods = paymentMethod;

    const offers = await P2POffer.find(query)
      .populate('seller', 'firstName lastName')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: offers.length,
      offers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/p2p/offer
// @desc    Create P2P offer
// @access  Private
router.post('/offer', protect, async (req, res) => {
  try {
    const { 
      currency, 
      fiatCurrency, 
      amount, 
      minLimit, 
      maxLimit, 
      price, 
      paymentMethods, 
      terms,
      timeLimit
    } = req.body;

    if (!currency || !fiatCurrency || !amount || !price || !minLimit || !maxLimit) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Check wallet balance
    const wallet = await Wallet.findOne({ user: req.user.id });
    const balance = wallet.getBalance(currency);

    if (balance.available < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Lock the amount
    await wallet.updateBalance(currency, -amount, 'available');
    await wallet.updateBalance(currency, amount, 'locked');

    // Create offer
    const offer = await P2POffer.create({
      seller: req.user.id,
      currency: currency.toUpperCase(),
      fiatCurrency: fiatCurrency.toUpperCase(),
      amount,
      minLimit,
      maxLimit,
      price,
      paymentMethods: paymentMethods || [],
      terms,
      timeLimit: timeLimit || 30,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'P2P offer created successfully',
      offer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/p2p/trade
// @desc    Create P2P trade
// @access  Private
router.post('/trade', protect, async (req, res) => {
  try {
    const { offerId, amount, paymentMethod } = req.body;

    if (!offerId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Offer ID, amount, and payment method are required'
      });
    }

    // Get offer
    const offer = await P2POffer.findById(offerId);
    
    if (!offer || offer.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Offer not found or inactive'
      });
    }

    // Validate amount
    if (amount < offer.minLimit || amount > offer.maxLimit) {
      return res.status(400).json({
        success: false,
        message: `Amount must be between ${offer.minLimit} and ${offer.maxLimit} ${offer.fiatCurrency}`
      });
    }

    // Calculate crypto amount
    const cryptoAmount = amount / offer.price;

    // Check if seller has enough balance
    const sellerWallet = await Wallet.findOne({ user: offer.seller });
    const sellerBalance = sellerWallet.getBalance(offer.currency);

    if (sellerBalance.locked < cryptoAmount) {
      return res.status(400).json({
        success: false,
        message: 'Seller has insufficient locked balance'
      });
    }

    // Create P2P trade
    const trade = await P2PTrade.create({
      offer: offerId,
      buyer: req.user.id,
      seller: offer.seller,
      amount,
      cryptoAmount,
      price: offer.price,
      currency: offer.currency,
      fiatCurrency: offer.fiatCurrency,
      paymentMethod,
      status: 'payment_pending'
    });

    // Emit socket event
    const io = req.app.get('io');
    io.emit('newP2PTrade', trade);

    res.status(201).json({
      success: true,
      message: 'P2P trade created successfully. Please make payment.',
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

// @route   GET /api/p2p/trades
// @desc    Get user P2P trades
// @access  Private
router.get('/trades', protect, async (req, res) => {
  try {
    const trades = await P2PTrade.find({
      $or: [
        { buyer: req.user.id },
        { seller: req.user.id }
      ]
    })
      .populate('buyer', 'firstName lastName')
      .populate('seller', 'firstName lastName')
      .populate('offer')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: trades.length,
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

// @route   POST /api/p2p/confirm-payment/:id
// @desc    Confirm payment made
// @access  Private
router.post('/confirm-payment/:id', protect, async (req, res) => {
  try {
    const { paymentProof } = req.body;

    const trade = await P2PTrade.findOne({
      _id: req.params.id,
      buyer: req.user.id
    });

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found'
      });
    }

    if (trade.status !== 'payment_pending') {
      return res.status(400).json({
        success: false,
        message: 'Invalid trade status'
      });
    }

    trade.status = 'payment_confirmed';
    trade.paymentProof = paymentProof;
    await trade.save();

    // Notify seller
    const io = req.app.get('io');
    io.emit('paymentConfirmed', { tradeId: trade._id, sellerId: trade.seller });

    res.status(200).json({
      success: true,
      message: 'Payment confirmed. Waiting for seller to release crypto.',
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

// @route   POST /api/p2p/release/:id
// @desc    Release crypto to buyer
// @access  Private
router.post('/release/:id', protect, async (req, res) => {
  try {
    const trade = await P2PTrade.findOne({
      _id: req.params.id,
      seller: req.user.id
    });

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found'
      });
    }

    if (trade.status !== 'payment_confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Payment must be confirmed first'
      });
    }

    // Transfer crypto from seller to buyer
    const sellerWallet = await Wallet.findOne({ user: trade.seller });
    const buyerWallet = await Wallet.findOne({ user: trade.buyer });

    await sellerWallet.updateBalance(trade.currency, -trade.cryptoAmount, 'locked');
    await buyerWallet.updateBalance(trade.currency, trade.cryptoAmount, 'available');

    trade.status = 'completed';
    trade.completedAt = Date.now();
    await trade.save();

    // Update offer
    const offer = await P2POffer.findById(trade.offer);
    offer.completedTrades += 1;
    offer.amount -= trade.cryptoAmount;
    
    if (offer.amount <= 0) {
      offer.status = 'completed';
    }
    await offer.save();

    // Create transaction records
    await Transaction.create([
      {
        user: trade.seller,
        type: 'p2p',
        currency: trade.currency,
        amount: -trade.cryptoAmount,
        status: 'completed',
        description: `P2P sale to buyer`,
        relatedP2P: trade._id,
        completedAt: Date.now()
      },
      {
        user: trade.buyer,
        type: 'p2p',
        currency: trade.currency,
        amount: trade.cryptoAmount,
        status: 'completed',
        description: `P2P purchase from seller`,
        relatedP2P: trade._id,
        completedAt: Date.now()
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Crypto released successfully',
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

// @route   POST /api/p2p/dispute/:id
// @desc    Open dispute for P2P trade
// @access  Private
router.post('/dispute/:id', protect, async (req, res) => {
  try {
    const { reason } = req.body;

    const trade = await P2PTrade.findOne({
      _id: req.params.id,
      $or: [{ buyer: req.user.id }, { seller: req.user.id }]
    });

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found'
      });
    }

    trade.status = 'disputed';
    trade.dispute = {
      reason,
      initiatedBy: req.user.id,
      createdAt: Date.now()
    };
    await trade.save();

    res.status(200).json({
      success: true,
      message: 'Dispute opened. Admin will review.',
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
