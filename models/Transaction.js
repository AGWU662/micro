const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'trade', 'mining', 'p2p', 'transfer', 'fee', 'bonus'],
    required: true
  },
  currency: {
    type: String,
    required: true,
    uppercase: true
  },
  amount: {
    type: Number,
    required: true
  },
  fee: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  description: {
    type: String
  },
  // For deposits/withdrawals
  address: {
    type: String
  },
  txHash: {
    type: String
  },
  network: {
    type: String
  },
  confirmations: {
    type: Number,
    default: 0
  },
  requiredConfirmations: {
    type: Number,
    default: 3
  },
  // For internal transfers
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Reference to related entities
  relatedTrade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trade'
  },
  relatedMining: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MiningInvestment'
  },
  relatedP2P: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'P2PTrade'
  },
  // Admin actions
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processingNote: {
    type: String
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
TransactionSchema.index({ user: 1, createdAt: -1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ type: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
