const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  balances: [{
    currency: {
      type: String,
      required: true,
      uppercase: true
    },
    available: {
      type: Number,
      default: 0
    },
    locked: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  }],
  addresses: [{
    currency: {
      type: String,
      required: true,
      uppercase: true
    },
    address: {
      type: String,
      required: true
    },
    network: {
      type: String,
      default: 'mainnet'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  miningBalance: {
    type: Number,
    default: 0
  },
  totalDeposits: {
    type: Number,
    default: 0
  },
  totalWithdrawals: {
    type: Number,
    default: 0
  },
  totalTrading: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate total balance before saving
WalletSchema.pre('save', function(next) {
  this.balances.forEach(balance => {
    balance.total = balance.available + balance.locked;
  });
  next();
});

// Method to get balance for specific currency
WalletSchema.methods.getBalance = function(currency) {
  const balance = this.balances.find(b => b.currency === currency.toUpperCase());
  return balance || { currency: currency.toUpperCase(), available: 0, locked: 0, total: 0 };
};

// Method to update balance
WalletSchema.methods.updateBalance = async function(currency, amount, type = 'available') {
  const currencyUpper = currency.toUpperCase();
  let balance = this.balances.find(b => b.currency === currencyUpper);
  
  if (!balance) {
    balance = { currency: currencyUpper, available: 0, locked: 0, total: 0 };
    this.balances.push(balance);
  }
  
  if (type === 'available') {
    balance.available += amount;
  } else if (type === 'locked') {
    balance.locked += amount;
  }
  
  balance.total = balance.available + balance.locked;
  
  await this.save();
  return balance;
};

module.exports = mongoose.model('Wallet', WalletSchema);
