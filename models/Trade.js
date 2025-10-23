const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['buy', 'sell'],
    required: true
  },
  orderType: {
    type: String,
    enum: ['market', 'limit', 'stop'],
    default: 'market'
  },
  pair: {
    type: String,
    required: true // e.g., BTC/USDT
  },
  baseCurrency: {
    type: String,
    required: true // e.g., BTC
  },
  quoteCurrency: {
    type: String,
    required: true // e.g., USDT
  },
  amount: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stopPrice: {
    type: Number // For stop orders
  },
  filled: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  fee: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'open', 'filled', 'partially_filled', 'cancelled', 'rejected'],
    default: 'pending'
  },
  executedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Calculate total before saving
TradeSchema.pre('save', function(next) {
  if (this.isNew) {
    this.total = this.amount * this.price;
    this.fee = this.total * 0.001; // 0.1% trading fee
  }
  next();
});

module.exports = mongoose.model('Trade', TradeSchema);
