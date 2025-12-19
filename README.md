# Crypto Trading Platform

A comprehensive cryptocurrency trading platform built with Node.js, Express, React, and MongoDB. Features include crypto trading, wallet management, mining simulation, P2P trading, and transaction management.

## Features

- 🔐 User Authentication & Authorization (JWT)
- 👤 User Profile Management & KYC Verification
- 💰 Multi-cryptocurrency Wallet Management
- 📊 Real-time Trading & Market Data
- ⛏️ Mining Pool & Rewards System
- 🤝 Peer-to-Peer Trading Marketplace
- 📈 Transaction History & Analytics
- 👨‍💼 Admin Dashboard & Management
- 💬 Live Chat Support
- 📱 Responsive Design

## Technology Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT Authentication
- Socket.io for real-time features
- Multer for file uploads
- Nodemailer for emails

### Frontend
- React 18
- React Router for navigation
- React Hook Form for form handling
- React Toastify for notifications
- CSS3 for styling

### Security
- Helmet for security headers
- Express Rate Limiting
- CORS configuration
- Bcrypt password hashing

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/AGWU662/micro.git
cd micro
```

### 2. Install dependencies
```bash
# Install all dependencies (server + client)
npm run install:all

# Or install separately:
# Server dependencies
npm install

# Client dependencies
cd client && npm install
```

### 3. Set up environment variables

#### Server Environment (.env)
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```

Update the values as needed:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/crypto-platform
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
ADMIN_EMAIL=admin@cryptoplatform.com
ADMIN_PASSWORD=Admin@123456
CLIENT_URL=http://localhost:3000
```

#### Client Environment (client/.env)
Copy `client/.env.example` to `client/.env`:
```bash
cd client
cp .env.example .env
```

The default values should work for local development:
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_APP_NAME=Crypto Trading Platform
```

### 4. Start MongoDB

Ensure MongoDB is running:
```bash
# Linux/Mac
sudo systemctl start mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Running the Application

### Development Mode

#### Run both server and client concurrently:
```bash
npm run dev:full
```

#### Or run them separately:

**Terminal 1 - Start the server:**
```bash
npm run dev
```

**Terminal 2 - Start the client:**
```bash
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api

### Production Mode

```bash
# Build the client
cd client
npm run build

# Start the server
cd ..
npm start
```

## Default Credentials

An admin user is automatically created on first server start:
- Email: `admin@cryptoplatform.com`
- Password: `Admin@123456`

**⚠️ Important:** Change these credentials in production!

## Project Structure

```
/
├── config/              # Configuration files
│   ├── db.js           # Database connection
│   └── initAdmin.js    # Admin initialization
├── middleware/          # Express middleware
│   ├── auth.js         # Authentication
│   ├── errorHandler.js # Error handling
│   └── validators.js   # Input validation
├── models/             # Mongoose schemas
│   ├── User.js
│   ├── Wallet.js
│   ├── Transaction.js
│   ├── Trade.js
│   ├── P2PTrade.js
│   └── Mining.js
├── routes/             # API routes
│   ├── auth.js
│   ├── users.js
│   ├── wallet.js
│   ├── trading.js
│   ├── p2p.js
│   ├── mining.js
│   ├── transactions.js
│   └── admin.js
├── utils/              # Utility functions
├── client/             # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── App.js
├── server.js           # Main server file
├── .env.example        # Environment variables template
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/kyc` - Submit KYC verification
- `POST /api/users/change-password` - Change password

### Wallet Operations
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/deposit` - Deposit funds
- `POST /api/wallet/withdraw` - Withdraw funds
- `GET /api/wallet/transactions` - Transaction history

### Trading
- `GET /api/trading/prices` - Get market prices
- `POST /api/trading/buy` - Buy cryptocurrency
- `POST /api/trading/sell` - Sell cryptocurrency
- `GET /api/trading/orders` - Get user orders

### P2P Trading
- `GET /api/p2p/trades` - Browse P2P trades
- `POST /api/p2p/create` - Create trade offer
- `POST /api/p2p/accept/:id` - Accept trade
- `POST /api/p2p/complete/:id` - Complete trade

### Mining
- `GET /api/mining/stats` - Get mining statistics
- `POST /api/mining/start` - Start mining
- `POST /api/mining/claim` - Claim rewards

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/stats` - Platform statistics
- `PUT /api/admin/user/:id` - Update user
- `POST /api/admin/kyc/:id/approve` - Approve KYC

## Troubleshooting

If you encounter any issues, please refer to [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common problems and solutions.

Common issues:
- **Missing dependencies**: Run `npm run install:all`
- **Port already in use**: Change PORT in `.env` or kill the process
- **MongoDB connection failed**: Ensure MongoDB is running
- **Module not found errors**: Delete `node_modules` and reinstall

## Development

### Code Style
- Follow the existing code style
- Use async/await for asynchronous operations
- Always handle errors with try-catch blocks
- Use meaningful variable and function names

### Testing
```bash
# Run server tests
npm test

# Run client tests
cd client && npm test
```

## Security

- All passwords are hashed using bcrypt
- JWT tokens for authentication
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS protection
- Helmet security headers

**Never commit sensitive data or secrets to the repository!**

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or contributions, please open an issue on GitHub.

## Authors

- AGWU662

---

**Note:** This is a demonstration project. Do not use in production without proper security audits and modifications.
