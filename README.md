# CryptoTrade Platform

A comprehensive cryptocurrency trading, mining, and P2P exchange platform built with Django and Jazzmin admin.

## Features

- **User Management**: Registration, authentication, KYC verification
- **Wallets**: Multi-currency crypto wallets (BTC, ETH, USDT, etc.)
- **Trading**: Spot trading with market and limit orders
- **Mining**: Cloud mining plans and contracts
- **P2P Exchange**: Peer-to-peer trading with escrow
- **Deposits/Withdrawals**: Crypto and fiat transactions
- **Admin Dashboard**: Beautiful Jazzmin-powered admin panel
- **Support System**: Ticket-based customer support

## Tech Stack

- Python 3.12+
- Django 6.0+
- Django Jazzmin (Admin UI)
- PostgreSQL (Production)
- Cloudinary (Media Storage)
- Render (Deployment)

## Quick Start

```bash
# Clone the repo
git clone https://github.com/AGWU662/micro.git
cd micro

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run server
python manage.py runserver
```

## Environment Variables

Create a `.env` file:

```
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgres://user:pass@host:5432/dbname
```

## Deployment

This project is configured for Render deployment. See `render.yaml`.

## License

MIT
