const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  // Check if email configuration is available
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    console.warn('⚠️  Email configuration not found. Email notifications disabled.');
    return null;
  }

  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send welcome email to new user
exports.sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();
    if (!transporter) return false;

    const mailOptions = {
      from: `"${process.env.PLATFORM_NAME || 'Crypto Platform'}" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Welcome to Elite-Cloud Mining Company! 🚀',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .highlight { background: #fff; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Elite-Cloud Mining! 🎉</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.firstName} ${user.lastName}!</h2>
              <p>Thank you for joining Elite-Cloud Mining Company, the premier cryptocurrency trading and mining platform.</p>
              
              <div class="highlight">
                <strong>Your account has been successfully created!</strong><br>
                Email: ${user.email}<br>
                Referral Code: ${user.referralCode}
              </div>

              <h3>What's Next?</h3>
              <ul>
                <li>✅ Complete your KYC verification</li>
                <li>💰 Claim your welcome bonus (1000 USDT)</li>
                <li>⛏️ Start mining with our cloud mining plans</li>
                <li>📈 Trade cryptocurrencies with ease</li>
                <li>🤝 Earn from P2P trading</li>
              </ul>

              <p style="text-align: center;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" class="button">
                  Go to Dashboard
                </a>
              </p>

              <p>If you have any questions, our 24/7 support team is here to help via live chat!</p>

              <p>Best regards,<br>
              <strong>The Elite-Cloud Mining Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Elite-Cloud Mining Company. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message);
    return false;
  }
};

// Send admin notification for new user registration
exports.sendAdminNewUserNotification = async (user) => {
  try {
    const transporter = createTransporter();
    if (!transporter) return false;

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.warn('⚠️  Admin email not configured');
      return false;
    }

    const mailOptions = {
      from: `"${process.env.PLATFORM_NAME || 'Crypto Platform'}" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: '🆕 New User Registration Alert',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-table { width: 100%; background: white; border-collapse: collapse; margin: 20px 0; }
            .info-table td { padding: 12px; border-bottom: 1px solid #ddd; }
            .info-table td:first-child { font-weight: bold; width: 40%; }
            .button { display: inline-block; padding: 12px 30px; background: #2c3e50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🆕 New User Registration</h2>
            </div>
            <div class="content">
              <p>A new user has registered on the platform:</p>
              
              <table class="info-table">
                <tr>
                  <td>Name</td>
                  <td>${user.firstName} ${user.lastName}</td>
                </tr>
                <tr>
                  <td>Email</td>
                  <td>${user.email}</td>
                </tr>
                <tr>
                  <td>Phone</td>
                  <td>${user.phone || 'Not provided'}</td>
                </tr>
                <tr>
                  <td>Country</td>
                  <td>${user.country || 'Not provided'}</td>
                </tr>
                <tr>
                  <td>Referral Code</td>
                  <td>${user.referralCode}</td>
                </tr>
                <tr>
                  <td>Registration Date</td>
                  <td>${new Date(user.createdAt).toLocaleString()}</td>
                </tr>
              </table>

              <p style="text-align: center;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/users/${user._id}" class="button">
                  View User Profile
                </a>
              </p>

              <p style="color: #666; font-size: 12px;">
                This is an automated notification from the Elite-Cloud Mining platform.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Admin notification sent for new user: ${user.email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending admin notification:', error.message);
    return false;
  }
};

// Send KYC status update email
exports.sendKYCStatusEmail = async (user, status) => {
  try {
    const transporter = createTransporter();
    if (!transporter) return false;

    const statusMessages = {
      approved: {
        title: 'KYC Verification Approved ✅',
        message: 'Congratulations! Your KYC verification has been approved. You now have full access to all platform features.',
        color: '#28a745'
      },
      rejected: {
        title: 'KYC Verification Rejected ❌',
        message: 'Unfortunately, your KYC verification was rejected. Please contact support for more information or resubmit your documents.',
        color: '#dc3545'
      },
      pending: {
        title: 'KYC Verification Pending ⏳',
        message: 'Your KYC documents have been received and are being reviewed. We\'ll notify you once the review is complete.',
        color: '#ffc107'
      }
    };

    const statusInfo = statusMessages[status] || statusMessages.pending;

    const mailOptions = {
      from: `"${process.env.PLATFORM_NAME || 'Crypto Platform'}" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: statusInfo.title,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${statusInfo.color}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: ${statusInfo.color}; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${statusInfo.title}</h2>
            </div>
            <div class="content">
              <h3>Hello ${user.firstName},</h3>
              <p>${statusInfo.message}</p>
              
              <p style="text-align: center;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" class="button">
                  Go to Dashboard
                </a>
              </p>

              <p>Best regards,<br>
              <strong>The Elite-Cloud Mining Team</strong></p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ KYC status email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending KYC status email:', error.message);
    return false;
  }
};

// Send transaction notification email
exports.sendTransactionEmail = async (user, transaction) => {
  try {
    const transporter = createTransporter();
    if (!transporter) return false;

    const typeLabels = {
      deposit: '💰 Deposit',
      withdrawal: '💸 Withdrawal',
      bonus: '🎁 Bonus',
      fee: '📝 Fee'
    };

    const statusColors = {
      pending: '#ffc107',
      completed: '#28a745',
      failed: '#dc3545'
    };

    const mailOptions = {
      from: `"${process.env.PLATFORM_NAME || 'Crypto Platform'}" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `${typeLabels[transaction.type] || transaction.type} ${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${statusColors[transaction.status] || '#667eea'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .info-box p { margin: 10px 0; }
            .amount { font-size: 24px; font-weight: bold; color: ${statusColors[transaction.status] || '#667eea'}; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Transaction ${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</h2>
            </div>
            <div class="content">
              <h3>Hello ${user.firstName},</h3>
              <p>Your ${transaction.type} transaction has been ${transaction.status}.</p>
              
              <div class="info-box">
                <p><strong>Type:</strong> ${typeLabels[transaction.type] || transaction.type}</p>
                <p><strong>Amount:</strong> <span class="amount">${transaction.amount} ${transaction.currency}</span></p>
                <p><strong>Status:</strong> ${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</p>
                <p><strong>Date:</strong> ${new Date(transaction.createdAt).toLocaleString()}</p>
                ${transaction.txHash ? `<p><strong>Transaction Hash:</strong> ${transaction.txHash}</p>` : ''}
              </div>

              <p>Best regards,<br>
              <strong>The Elite-Cloud Mining Team</strong></p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Transaction email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending transaction email:', error.message);
    return false;
  }
};
