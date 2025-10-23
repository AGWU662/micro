const mongoose = require('mongoose');

const MiningPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    required: true,
    uppercase: true
  },
  minInvestment: {
    type: Number,
    required: true
  },
  maxInvestment: {
    type: Number,
    required: true
  },
  dailyReturn: {
    type: Number,
    required: true // Percentage (e.g., 2.5 for 2.5%)
  },
  duration: {
    type: Number,
    required: true // In days
  },
  description: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const MiningInvestmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MiningPlan',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    uppercase: true
  },
  dailyReturn: {
    type: Number,
    required: true
  },
  totalReturn: {
    type: Number,
    required: true
  },
  returnReceived: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  lastPayoutDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  autoReinvest: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Calculate total return before saving
MiningInvestmentSchema.pre('save', function(next) {
  if (this.isNew) {
    const duration = (this.endDate - this.startDate) / (1000 * 60 * 60 * 24);
    this.totalReturn = this.amount * (this.dailyReturn / 100) * duration;
  }
  next();
});

const MiningPlan = mongoose.model('MiningPlan', MiningPlanSchema);
const MiningInvestment = mongoose.model('MiningInvestment', MiningInvestmentSchema);

module.exports = { MiningPlan, MiningInvestment };
