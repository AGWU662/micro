const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide first name'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Please provide last name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
    select: false
  },
  phone: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  avatar: {
    type: String,
    default: ''
  },
  kycStatus: {
    type: String,
    enum: ['not_submitted', 'pending', 'approved', 'rejected'],
    default: 'not_submitted'
  },
  kycDocuments: [{
    type: String
  }],
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    select: false
  },
  referralCode: {
    type: String,
    unique: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastLogin: {
    type: Date
  },
  loginHistory: [{
    ip: String,
    device: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Generate referral code before saving
UserSchema.pre('save', function(next) {
  if (!this.referralCode) {
    this.referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  }
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get user without sensitive data
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.twoFactorSecret;
  return user;
};

module.exports = mongoose.model('User', UserSchema);
