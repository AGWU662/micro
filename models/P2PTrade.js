const mongoose = require('mongoose');

const P2POfferSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currency: {
    type: String,
    required: true,
    uppercase: true
  },
  fiatCurrency: {
    type: String,
    required: true,
    uppercase: true
  },
  amount: {
    type: Number,
    required: true
  },
  minLimit: {
    type: Number,
    required: true
  },
  maxLimit: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  paymentMethods: [{
    type: String
  }],
  terms: {
    type: String
  },
  timeLimit: {
    type: Number,
    default: 30 // Minutes
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed'],
    default: 'active'
  },
  completedTrades: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const P2PTradeSchema = new mongoose.Schema({
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'P2POffer',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  cryptoAmount: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    uppercase: true
  },
  fiatCurrency: {
    type: String,
    required: true,
    uppercase: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'payment_pending', 'payment_confirmed', 'completed', 'disputed', 'cancelled'],
    default: 'pending'
  },
  paymentProof: {
    type: String
  },
  dispute: {
    reason: String,
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolution: String,
    createdAt: Date,
    resolvedAt: Date
  },
  expiresAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  chat: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Set expiration time before saving
P2PTradeSchema.pre('save', function(next) {
  if (this.isNew) {
    const timeLimit = 30; // Default 30 minutes
    this.expiresAt = new Date(Date.now() + timeLimit * 60 * 1000);
  }
  next();
});

const P2POffer = mongoose.model('P2POffer', P2POfferSchema);
const P2PTrade = mongoose.model('P2PTrade', P2PTradeSchema);

module.exports = { P2POffer, P2PTrade };
