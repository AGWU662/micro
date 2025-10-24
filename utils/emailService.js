const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Send welcome email to new user
  async sendWelcomeEmail(userEmail, userName) {
    const mailOptions = {
      from: `"Elite-cloud Mining" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Welcome to Elite-cloud Mining - Account Created Successfully',
      html: this.getWelcomeEmailTemplate(userName, userEmail)
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully to:', userEmail);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  // Send admin notification when new user registers
  async sendAdminNotification(userDetails) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.warn('Admin email not configured');
      return;
    }

    const mailOptions = {
      from: `"Elite-cloud Mining System" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: 'New User Registration - Elite-cloud Mining',
      html: this.getAdminNotificationTemplate(userDetails)
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Admin notification sent successfully');
    } catch (error) {
      console.error('Error sending admin notification:', error);
      throw error;
    }
  }

  // Welcome email template
  getWelcomeEmailTemplate(userName, userEmail) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Elite-cloud Mining</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f39c12, #e74c3c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
          .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .content { padding: 20px 0; }
          .highlight { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f39c12; }
          .button { display: inline-block; background: linear-gradient(45deg, #f39c12, #e74c3c); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
          .services { display: flex; flex-wrap: wrap; justify-content: space-around; margin: 20px 0; }
          .service { text-align: center; margin: 10px; flex: 1; min-width: 150px; }
          .service-icon { font-size: 30px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⛏️ Elite-cloud Mining</div>
            <h1>Welcome to the Future of Crypto Mining!</h1>
          </div>
          
          <div class="content">
            <h2>Hello ${userName}! 👋</h2>
            
            <p>Congratulations! Your Elite-cloud Mining account has been successfully created. You're now part of our global community of crypto miners and traders.</p>
            
            <div class="highlight">
              <strong>Your Account Details:</strong><br>
              📧 Email: ${userEmail}<br>
              🌐 Website: coinscloud.net<br>
              📅 Registration Date: ${new Date().toLocaleDateString()}
            </div>
            
            <h3>What You Can Do Now:</h3>
            
            <div class="services">
              <div class="service">
                <div class="service-icon">⛏️</div>
                <h4>Cloud Mining</h4>
                <p>Start mining Bitcoin, Ethereum, and other cryptocurrencies</p>
              </div>
              <div class="service">
                <div class="service-icon">🤝</div>
                <h4>P2P Trading</h4>
                <p>Trade directly with other users worldwide</p>
              </div>
              <div class="service">
                <div class="service-icon">💰</div>
                <h4>Crypto Loans</h4>
                <p>Get instant loans using crypto as collateral</p>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="https://coinscloud.net/login" class="button">Access Your Dashboard</a>
            </div>
            
            <h3>Important Security Reminders:</h3>
            <ul>
              <li>✅ Never share your login credentials with anyone</li>
              <li>✅ Enable two-factor authentication (2FA)</li>
              <li>✅ Use a strong, unique password</li>
              <li>✅ Always verify URLs before entering sensitive information</li>
            </ul>
            
            <p>Need help? Our 24/7 support team is here to assist you. Use the live chat on our website or contact us directly.</p>
          </div>
          
          <div class="footer">
            <p><strong>Elite-cloud Mining Company</strong><br>
            🌐 coinscloud.net | 📧 support@coinscloud.net<br>
            Follow us: Twitter | Telegram | Discord</p>
            
            <p>This email was sent to ${userEmail}. If you didn't create this account, please contact our support immediately.</p>
            
            <p>&copy; 2024 Elite-cloud Mining Company (coinscloud.net). All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Admin notification template
  getAdminNotificationTemplate(userDetails) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New User Registration Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
          .alert { background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .user-details { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #007bff; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 5px 0; border-bottom: 1px solid #eee; }
          .label { font-weight: bold; color: #495057; }
          .value { color: #007bff; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
          .button { display: inline-block; background: linear-gradient(45deg, #007bff, #0056b3); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 New User Registration Alert</h1>
            <p>Elite-cloud Mining Admin Panel</p>
          </div>
          
          <div class="alert">
            <strong>📝 A new user has successfully registered on Elite-cloud Mining platform!</strong>
          </div>
          
          <div class="user-details">
            <h3>👤 User Information:</h3>
            
            <div class="detail-row">
              <span class="label">Full Name:</span>
              <span class="value">${userDetails.name || 'Not provided'}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Email Address:</span>
              <span class="value">${userDetails.email}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Country:</span>
              <span class="value">${userDetails.country || 'Not specified'}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Registration Date:</span>
              <span class="value">${new Date().toLocaleString()}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">User ID:</span>
              <span class="value">${userDetails._id}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Account Status:</span>
              <span class="value">Active</span>
            </div>
            
            <div class="detail-row">
              <span class="label">KYC Status:</span>
              <span class="value">${userDetails.kyc?.status || 'Pending'}</span>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://coinscloud.net/admin/users" class="button">View User in Admin Panel</a>
          </div>
          
          <h3>📊 Quick Stats:</h3>
          <ul>
            <li>Total Users: Loading...</li>
            <li>Today's Registrations: Loading...</li>
            <li>Platform Status: Active</li>
          </ul>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>⚠️ Admin Action Required:</strong>
            <p>Please review the new user account and verify their information. Consider sending a welcome message or setting up their initial mining configuration.</p>
          </div>
          
          <div class="footer">
            <p><strong>Elite-cloud Mining Admin System</strong><br>
            🌐 coinscloud.net | 📧 admin@coinscloud.net</p>
            
            <p>This is an automated notification from the Elite-cloud Mining registration system.</p>
            
            <p>&copy; 2024 Elite-cloud Mining Company. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send deposit/withdrawal receipt
  async sendTransactionReceipt(userEmail, transactionDetails) {
    const mailOptions = {
      from: `"Elite-cloud Mining" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Transaction Receipt - ${transactionDetails.type.toUpperCase()} - Elite-cloud Mining`,
      html: this.getTransactionReceiptTemplate(transactionDetails)
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Transaction receipt sent successfully to:', userEmail);
    } catch (error) {
      console.error('Error sending transaction receipt:', error);
      throw error;
    }
  }

  // Transaction receipt template
  getTransactionReceiptTemplate(transaction) {
    const isDeposit = transaction.type === 'deposit';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Transaction Receipt - Elite-cloud Mining</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          .header { background: ${isDeposit ? 'linear-gradient(135deg, #27ae60, #2ecc71)' : 'linear-gradient(135deg, #e74c3c, #c0392b)'}; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
          .receipt { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${isDeposit ? '#27ae60' : '#e74c3c'}; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 5px 0; border-bottom: 1px solid #eee; }
          .label { font-weight: bold; }
          .value { color: ${isDeposit ? '#27ae60' : '#e74c3c'}; }
          .amount { font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; color: ${isDeposit ? '#27ae60' : '#e74c3c'}; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isDeposit ? '💰' : '📤'} Transaction Receipt</h1>
            <p>Elite-cloud Mining</p>
          </div>
          
          <div class="amount">
            ${isDeposit ? '+' : '-'}$${transaction.amount}
          </div>
          
          <div class="receipt">
            <h3>${isDeposit ? '💰 Deposit' : '📤 Withdrawal'} Receipt</h3>
            
            <div class="detail-row">
              <span class="label">Transaction ID:</span>
              <span class="value">${transaction._id}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Amount:</span>
              <span class="value">$${transaction.amount}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Currency:</span>
              <span class="value">${transaction.currency || 'USD'}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Date & Time:</span>
              <span class="value">${new Date().toLocaleString()}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Status:</span>
              <span class="value">${transaction.status || 'Completed'}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Processing Fee:</span>
              <span class="value">$${transaction.fee || '0.00'}</span>
            </div>
          </div>
          
          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>✅ Transaction ${isDeposit ? 'Deposit' : 'Withdrawal'} Successful!</strong>
            <p>Your ${isDeposit ? 'deposit has been credited to' : 'withdrawal has been processed from'} your Elite-cloud Mining account.</p>
          </div>
          
          <div class="footer">
            <p><strong>Elite-cloud Mining Company</strong><br>
            🌐 coinscloud.net | 📧 support@coinscloud.net</p>
            
            <p>This is an automated receipt. Please keep this for your records.</p>
            
            <p>&copy; 2024 Elite-cloud Mining Company. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();