# Elite-Cloud Mining Company - Crypto Trading Platform

A comprehensive cryptocurrency trading platform built with Node.js, Express, MongoDB, and Socket.io. Features include crypto trading, wallet management, cloud mining simulation, P2P trading, and real-time notifications.

## 🚀 Features

### Core Features
- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Wallet Management**: Multi-currency wallet support (BTC, ETH, USDT)
- **Cloud Mining**: Mining plans with daily returns and automated payouts
- **Crypto Trading**: Real-time trading with order matching
- **P2P Trading**: Peer-to-peer crypto exchange marketplace
- **Transaction Management**: Deposits, withdrawals, and transaction history

### New Features (Latest Release)
- ✅ **Email Notifications**: Automated emails for user registration, KYC updates, and transactions
- ✅ **Admin Notifications**: Real-time email alerts when new users register
- ✅ **Live Chat Integration**: Support for Tawk.to, Intercom, Crisp, and Facebook Messenger
- ✅ **Socket.io Real-time Updates**: Live notifications for user registrations, KYC updates, and transactions
- ✅ **Enhanced Admin Dashboard**: Recent user registrations, transaction monitoring

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/AGWU662/micro.git
cd micro
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- MongoDB connection string
- JWT secret key
- Admin credentials
- Email server settings (Gmail, SendGrid, etc.)
- Live chat provider credentials

4. **Start MongoDB**
```bash
# Make sure MongoDB is running on your system
mongod
```

5. **Run the application**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📧 Email Configuration

### Gmail Setup (Recommended for Testing)
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Add to `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
PLATFORM_NAME=Elite-Cloud Mining Company
```

### Email Features
- **Welcome Emails**: Sent automatically when users register
- **Admin Alerts**: Notifications when new users sign up
- **KYC Status Updates**: Email notifications for KYC approval/rejection
- **Transaction Notifications**: Updates for deposits, withdrawals, and bonuses

## 💬 Live Chat Setup

### Option 1: Tawk.to (Free & Recommended)
1. Sign up at [Tawk.to](https://www.tawk.to/)
2. Create a property and get your Property ID and Widget ID
3. Add to `.env`:
```env
CHAT_PROVIDER=tawk
TAWK_PROPERTY_ID=your_property_id
TAWK_WIDGET_ID=your_widget_id
```

### Option 2: Intercom
```env
CHAT_PROVIDER=intercom
INTERCOM_APP_ID=your_app_id
```

### Option 3: Crisp Chat
```env
CHAT_PROVIDER=crisp
CRISP_WEBSITE_ID=your_website_id
```

### Option 4: Facebook Messenger
```env
CHAT_PROVIDER=facebook
FACEBOOK_PAGE_ID=your_page_id
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Admin
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - List all users
- `GET /api/admin/user/:id` - Get user details
- `PUT /api/admin/user/:id/status` - Activate/deactivate user
- `PUT /api/admin/user/:id/kyc` - Update KYC status
- `GET /api/admin/transactions` - List all transactions
- `PUT /api/admin/transaction/:id/approve` - Approve transaction
- `PUT /api/admin/transaction/:id/reject` - Reject transaction
- `POST /api/admin/adjust-balance` - Manually adjust user balance

### Live Chat
- `GET /api/chat/config` - Get chat widget configuration
- `GET /api/chat/status` - Check chat availability

### Wallet
- `GET /api/wallet` - Get user wallet
- `POST /api/wallet/deposit` - Request deposit
- `POST /api/wallet/withdraw` - Request withdrawal

### Mining
- `GET /api/mining/plans` - Get mining plans
- `POST /api/mining/invest` - Invest in mining plan
- `GET /api/mining/investments` - Get user investments

### Trading
- `POST /api/trading/order` - Place trading order
- `GET /api/trading/orders` - Get user orders
- `GET /api/trading/market-data` - Get market data

### P2P Trading
- `POST /api/p2p/offer` - Create P2P offer
- `GET /api/p2p/offers` - List P2P offers
- `POST /api/p2p/trade/:offerId` - Initiate trade

## 🔄 Real-time Events (Socket.io)

### Client Events
```javascript
// Connect to Socket.io
const socket = io('http://localhost:5000');

// Listen for new user registrations (Admin only)
socket.on('new_user_registration', (data) => {
  console.log('New user:', data.user);
});

// Listen for KYC status updates (User)
socket.on(`kyc_status_${userId}`, (data) => {
  console.log('KYC Status:', data.status);
});

// Listen for transaction updates (User)
socket.on(`transaction_${userId}`, (data) => {
  console.log('Transaction:', data.transaction);
});

// Chat namespace
const chatSocket = io('http://localhost:5000/chat');
chatSocket.emit('join_chat', userId);
chatSocket.on('admin_reply', (message) => {
  console.log('Admin message:', message);
});
```

## 👨‍💼 Admin Features

### Dashboard Statistics
- Total and active users
- Transaction counts and pending withdrawals
- Active mining investments
- Platform balance (BTC, ETH, USDT)
- Recent user registrations
- Recent transactions

### User Management
- View all users with search and filters
- Activate/deactivate user accounts
- Approve/reject KYC submissions
- View user details and transaction history

### Transaction Management
- Approve/reject deposits and withdrawals
- Manual balance adjustments
- Transaction history with filters

### Mining Management
- Create and manage mining plans
- Set returns and durations
- Activate/deactivate plans

## 🔐 Security Features

- JWT authentication with secure token generation
- Password hashing with bcryptjs
- Rate limiting on API endpoints
- Helmet.js for security headers
- CORS configuration
- Input validation with express-validator
- Environment variable protection

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linter
npm run lint
```

## 📊 Database Models

- **User**: User accounts with authentication and KYC
- **Wallet**: Multi-currency wallet balances
- **Transaction**: Deposits, withdrawals, and transfers
- **Mining**: Mining plans and user investments
- **Trade**: Trading orders and executions
- **P2PTrade**: Peer-to-peer trading offers and trades

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact via the integrated live chat
- Email: admin@elite-cloud.com

## 🎉 Acknowledgments

- Built with Express.js and MongoDB
- Real-time features powered by Socket.io
- Email service using Nodemailer
- Live chat integrations: Tawk.to, Intercom, Crisp, Facebook Messenger
