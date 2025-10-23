const express = require('express');
const router = express.Router();
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

// @route   GET /api/wallet
// @desc    Get user wallet
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet) {
      // Create wallet if doesn't exist
      wallet = await Wallet.create({
        user: req.user.id,
        balances: [
          { currency: 'BTC', available: 0, locked: 0 },
          { currency: 'ETH', available: 0, locked: 0 },
          { currency: 'USDT', available: 0, locked: 0 }
        ]
      });
    }

    res.status(200).json({
      success: true,
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

// @route   POST /api/wallet/deposit
// @desc    Create deposit request
// @access  Private
router.post('/deposit', protect, async (req, res) => {
  try {
    const { currency, amount, address, txHash, network } = req.body;

    if (!currency || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Currency and amount are required'
      });
    }

    // Create deposit transaction
    const transaction = await Transaction.create({
      user: req.user.id,
      type: 'deposit',
      currency: currency.toUpperCase(),
      amount,
      address,
      txHash,
      network,
      status: 'pending',
      description: `Deposit ${amount} ${currency.toUpperCase()}`
    });

    res.status(201).json({
      success: true,
      message: 'Deposit request created. Awaiting confirmation.',
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

// @route   POST /api/wallet/withdraw
// @desc    Create withdrawal request
// @access  Private
router.post('/withdraw', protect, async (req, res) => {
  try {
    const { currency, amount, address, network } = req.body;

    if (!currency || !amount || !address) {
      return res.status(400).json({
        success: false,
        message: 'Currency, amount, and address are required'
      });
    }

    // Get wallet
    const wallet = await Wallet.findOne({ user: req.user.id });
    const balance = wallet.getBalance(currency);

    // Check if sufficient balance
    if (balance.available < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Calculate withdrawal fee (1%)
    const fee = amount * 0.01;
    const totalAmount = amount + fee;

    if (balance.available < totalAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Fee: ${fee} ${currency.toUpperCase()}`
      });
    }

    // Lock the amount
    await wallet.updateBalance(currency, -totalAmount, 'available');
    await wallet.updateBalance(currency, totalAmount, 'locked');

    // Create withdrawal transaction
    const transaction = await Transaction.create({
      user: req.user.id,
      type: 'withdrawal',
      currency: currency.toUpperCase(),
      amount,
      fee,
      address,
      network,
      status: 'pending',
      description: `Withdraw ${amount} ${currency.toUpperCase()} to ${address}`
    });

    res.status(201).json({
      success: true,
      message: 'Withdrawal request created. Awaiting admin approval.',
      transaction,
      fee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/wallet/addresses
// @desc    Get wallet addresses
// @access  Private
router.get('/addresses', protect, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    res.status(200).json({
      success: true,
      addresses: wallet.addresses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/wallet/generate-address
// @desc    Generate new wallet address
// @access  Private
router.post('/generate-address', protect, async (req, res) => {
  try {
    const { currency, network } = req.body;

    if (!currency) {
      return res.status(400).json({
        success: false,
        message: 'Currency is required'
      });
    }

    const wallet = await Wallet.findOne({ user: req.user.id });

    // Generate a dummy address (in production, integrate with actual blockchain)
    const address = `${currency.toUpperCase()}_${req.user.id}_${Date.now()}`;

    wallet.addresses.push({
      currency: currency.toUpperCase(),
      address,
      network: network || 'mainnet',
      isActive: true
    });

    await wallet.save();

    res.status(201).json({
      success: true,
      message: 'Address generated successfully',
      address: wallet.addresses[wallet.addresses.length - 1]
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
