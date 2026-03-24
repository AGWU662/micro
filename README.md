# Elite-cloud Mining | Crypto Trading Platform

A comprehensive cryptocurrency trading platform with cloud mining, P2P trading, spot trading, wallet management, and KYC verification.

## Features

- **Cloud Mining** – Invest in mining plans and earn daily returns
- **Spot Trading** – Trade crypto pairs with real-time prices
- **P2P Trading** – Buy and sell crypto peer-to-peer
- **Secure Wallet** – Multi-currency wallet with deposit/withdrawal
- **KYC Verification** – Compliance with identity verification
- **Real-time Prices** – Live price updates via WebSocket

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Socket.IO
- **Frontend**: React 19, Tailwind CSS, React Router v7
- **Auth**: JWT, bcryptjs
- **Deployment**: Render (full-stack)

## Deployment to Render

### Prerequisites

1. A [Render](https://render.com) account
2. A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or other MongoDB URI)

### Steps

1. **Fork or push this repo to GitHub**
2. **In Render Dashboard**, click **New → Web Service**
3. **Connect your GitHub repo**
4. Configure with these settings:
   - **Environment**: Node
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. **Set Environment Variables**:
   - `NODE_ENV` = `production`
   - `MONGO_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = a strong random secret
   - `ADMIN_EMAIL` = admin email address
   - `ADMIN_PASSWORD` = admin password
   - `CLIENT_URL` = your Render app URL (e.g. `https://your-app.onrender.com`)
   - Optional: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`
6. **Deploy!**

### Local Development

```bash
# Install all dependencies
npm run install:all

# Start backend (port 5000) + frontend (port 3000) concurrently
npm run dev:full
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

## License

MIT
