# Elite-Cloud Mining Platform - Usage Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Email Notifications](#email-notifications)
3. [Live Chat Integration](#live-chat-integration)
4. [Admin Panel Features](#admin-panel-features)
5. [Real-time Notifications](#real-time-notifications)
6. [API Usage Examples](#api-usage-examples)

---

## Getting Started

### First Time Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB**
   ```bash
   mongod
   ```

4. **Run the Application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Access the API**
   - API Base URL: `http://localhost:5000/api`
   - Health Check: `GET http://localhost:5000/api`

---

## Email Notifications

### Configuration

#### Using Gmail (Recommended for Testing)

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Update `.env`:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   PLATFORM_NAME=Elite-Cloud Mining Company
   ```

#### Using Other SMTP Services

**SendGrid:**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
```

**Mailgun:**
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASSWORD=your_mailgun_password
```

### Email Features

#### 1. Welcome Email
Automatically sent when a new user registers.

**Includes:**
- Personalized greeting
- Welcome bonus information (1000 USDT)
- Quick start guide
- Referral code
- Dashboard link

#### 2. Admin New User Notification
Sent to admin email when a new user registers.

**Includes:**
- User's full information
- Registration timestamp
- Direct link to user profile in admin panel

#### 3. KYC Status Email
Sent when admin updates a user's KYC status.

**Statuses:**
- ✅ Approved
- ❌ Rejected
- ⏳ Pending

#### 4. Transaction Notifications
Sent for:
- Deposit completed
- Withdrawal approved
- Withdrawal rejected
- Bonus credited

### Testing Email Notifications

```bash
# Test user registration with email
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

---

## Live Chat Integration

### Option 1: Tawk.to (FREE - Recommended)

**Setup:**
1. Visit https://www.tawk.to/ and create a free account
2. Create a property for your website
3. Get your Property ID and Widget ID from the dashboard
4. Update `.env`:
   ```env
   CHAT_PROVIDER=tawk
   TAWK_PROPERTY_ID=your_property_id_here
   TAWK_WIDGET_ID=your_widget_id_here
   ```

**Features:**
- ✅ Free forever
- ✅ Unlimited agents
- ✅ Mobile apps
- ✅ Visitor monitoring
- ✅ Customizable widget

### Option 2: Intercom

**Setup:**
```env
CHAT_PROVIDER=intercom
INTERCOM_APP_ID=your_app_id
```

**Features:**
- User messaging
- Product tours
- Help center
- Analytics

### Option 3: Crisp Chat

**Setup:**
```env
CHAT_PROVIDER=crisp
CRISP_WEBSITE_ID=your_website_id
```

**Features:**
- Free tier available
- Multi-channel support
- Chatbots
- Screen sharing

### Option 4: Facebook Messenger

**Setup:**
```env
CHAT_PROVIDER=facebook
FACEBOOK_PAGE_ID=your_page_id
```

**Features:**
- Facebook integration
- Familiar interface
- Mobile support

### Get Chat Configuration

**Endpoint:** `GET /api/chat/config`

**Response:**
```json
{
  "success": true,
  "enabled": true,
  "provider": "Tawk.to",
  "script": "<!-- Chat widget script -->",
  "widget": null
}
```

**Frontend Integration:**
```javascript
// Fetch chat configuration
fetch('http://localhost:5000/api/chat/config')
  .then(res => res.json())
  .then(data => {
    if (data.enabled) {
      // Inject chat script
      const script = document.createElement('script');
      script.innerHTML = data.script;
      document.body.appendChild(script);
    }
  });
```

### Socket.io Chat (Custom)

**Client-side:**
```javascript
import io from 'socket.io-client';

// Connect to chat namespace
const chatSocket = io('http://localhost:5000/chat');

// Join chat room
chatSocket.emit('join_chat', userId);

// Send message
chatSocket.emit('user_message', {
  userId: '123',
  userName: 'John Doe',
  message: 'Hello, I need help!'
});

// Receive admin replies
chatSocket.on('admin_reply', (data) => {
  console.log(`${data.adminName}: ${data.message}`);
});
```

**Admin-side:**
```javascript
// Admin joins admin room
chatSocket.emit('join_admin');

// Listen for user messages
chatSocket.on('new_user_message', (data) => {
  console.log(`New message from ${data.userName}: ${data.message}`);
});

// Reply to user
chatSocket.emit('admin_message', {
  userId: '123',
  adminName: 'Support Agent',
  message: 'How can I help you?'
});
```

---

## Admin Panel Features

### Dashboard Statistics

**Endpoint:** `GET /api/admin/dashboard`

**Authentication:** Required (Admin only)

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "users": {
      "total": 150,
      "active": 145
    },
    "transactions": {
      "total": 523,
      "pendingWithdrawals": 12
    },
    "mining": {
      "activeInvestments": 45
    },
    "trading": {
      "totalTrades": 230,
      "activeP2P": 8
    },
    "platformBalance": {
      "BTC": 12.5,
      "ETH": 180.3,
      "USDT": 50000
    }
  },
  "recentTransactions": [...],
  "recentUsers": [...]
}
```

### User Management

#### Get All Users
```bash
GET /api/admin/users?page=1&limit=20&search=john&status=active
```

#### Get User Details
```bash
GET /api/admin/user/:id
```

#### Update User Status
```bash
PUT /api/admin/user/:id/status
Content-Type: application/json

{
  "isActive": false
}
```

#### Update KYC Status
```bash
PUT /api/admin/user/:id/kyc
Content-Type: application/json

{
  "kycStatus": "approved"
}
```
**Note:** This will automatically send an email notification to the user.

### Transaction Management

#### Approve Transaction
```bash
PUT /api/admin/transaction/:id/approve
Content-Type: application/json

{
  "txHash": "0x1234567890abcdef...",
  "note": "Verified and approved"
}
```
**Note:** Sends email notification and Socket.io event to user.

#### Reject Transaction
```bash
PUT /api/admin/transaction/:id/reject
Content-Type: application/json

{
  "reason": "Invalid wallet address"
}
```

### Manual Balance Adjustment

```bash
POST /api/admin/adjust-balance
Content-Type: application/json

{
  "userId": "user_id_here",
  "currency": "USDT",
  "amount": 100,
  "reason": "Promotion bonus"
}
```

---

## Real-time Notifications

### Socket.io Events

#### Client Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to server');
});
```

#### Admin Events

**New User Registration:**
```javascript
socket.on('new_user_registration', (data) => {
  console.log('New user registered:', data.user);
  // Show notification in admin panel
  showNotification(`${data.user.name} just registered!`);
});
```

#### User Events

**KYC Status Update:**
```javascript
socket.on(`kyc_status_${userId}`, (data) => {
  console.log('KYC Status:', data.status);
  // Update UI
  updateKYCStatus(data.status);
});
```

**Transaction Update:**
```javascript
socket.on(`transaction_${userId}`, (data) => {
  console.log('Transaction update:', data.transaction);
  // Show notification
  showNotification(`Your ${data.transaction.type} has been ${data.transaction.status}`);
});
```

---

## API Usage Examples

### User Registration

```javascript
const registerUser = async () => {
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      phone: '+1234567890',
      country: 'USA'
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Save token
    localStorage.setItem('token', data.token);
    // User receives welcome email automatically
    console.log('Registration successful!');
  }
};
```

### Admin Login

```javascript
const adminLogin = async () => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@cryptoplatform.com',
      password: 'Admin@123456'
    })
  });
  
  const data = await response.json();
  
  if (data.success && data.user.role === 'admin') {
    localStorage.setItem('adminToken', data.token);
    console.log('Admin logged in successfully');
  }
};
```

### Approve User KYC

```javascript
const approveKYC = async (userId) => {
  const token = localStorage.getItem('adminToken');
  
  const response = await fetch(`http://localhost:5000/api/admin/user/${userId}/kyc`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      kycStatus: 'approved'
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Email notification sent automatically
    console.log('KYC approved, email sent to user');
  }
};
```

---

## Troubleshooting

### Email Issues

**Problem:** Emails not being sent

**Solutions:**
1. Check email credentials in `.env`
2. Verify SMTP settings
3. Check console for error messages
4. For Gmail, ensure App Password is used (not regular password)
5. Check spam folder

**Check email service status:**
```javascript
// The application will log warnings if email is not configured
// Look for: "⚠️ Email configuration not found"
```

### Chat Widget Not Showing

**Problem:** Chat widget doesn't appear

**Solutions:**
1. Verify `CHAT_PROVIDER` is set in `.env`
2. Check provider credentials (Property ID, App ID, etc.)
3. Ensure chat script is injected in frontend
4. Check browser console for errors

**Test chat configuration:**
```bash
curl http://localhost:5000/api/chat/config
```

### Socket.io Connection Issues

**Problem:** Real-time notifications not working

**Solutions:**
1. Ensure Socket.io is properly initialized
2. Check CORS settings
3. Verify client is connected to correct URL
4. Check browser console for connection errors

---

## Best Practices

### Email Notifications
- ✅ Use environment variables for sensitive data
- ✅ Implement email queuing for high volume
- ✅ Test emails in development before production
- ✅ Monitor email delivery rates
- ✅ Provide unsubscribe options for marketing emails

### Live Chat
- ✅ Set up chat hours and auto-responses
- ✅ Train support team on platform features
- ✅ Monitor response times
- ✅ Use canned responses for common questions
- ✅ Collect feedback on chat experience

### Admin Panel
- ✅ Regularly review pending transactions
- ✅ Monitor new user registrations
- ✅ Verify KYC documents thoroughly
- ✅ Keep audit logs of all admin actions
- ✅ Set up alerts for suspicious activities

---

## Support

For additional help:
- 📧 Email: admin@elite-cloud.com
- 💬 Live Chat: Available 24/7
- 📖 Documentation: See README.md
- 🐛 Bug Reports: Create GitHub issue

---

**Last Updated:** October 2025
**Version:** 1.0.0
