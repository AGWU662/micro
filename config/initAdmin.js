const User = require('../models/User');
const Wallet = require('../models/Wallet');

module.exports = async () => {
  try {
    // Check if admin exists
    const adminExists = await User.findOne({ role: 'admin' });

    if (!adminExists) {
      // Create admin user
      const admin = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: process.env.ADMIN_EMAIL || 'admin@cryptoplatform.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123456',
        role: 'admin',
        isVerified: true,
        isActive: true,
        kycStatus: 'approved'
      });

      // Create admin wallet
      await Wallet.create({
        user: admin._id,
        balances: [
          { currency: 'BTC', available: 0, locked: 0 },
          { currency: 'ETH', available: 0, locked: 0 },
          { currency: 'USDT', available: 0, locked: 0 }
        ]
      });

      console.log('✅ Admin user created successfully');
      console.log('📧 Email:', admin.email);
      console.log('🔑 Password:', process.env.ADMIN_PASSWORD || 'Admin@123456');
      console.log('⚠️  Please change the default password after first login!');
    }
  } catch (error) {
    console.error('❌ Error initializing admin:', error.message);
  }
};
