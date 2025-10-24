# Security Setup Guide

## Environment Variables
Create a `.env` file in the root directory with the following variables:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/crypto-platform

# JWT Secret (Generate a strong secret!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Admin Credentials (First Time Setup)
ADMIN_EMAIL=admin@cryptoplatform.com
ADMIN_PASSWORD=Admin@123456

# Email Configuration (Optional - for email verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Client URL
CLIENT_URL=http://localhost:3000

# Crypto API (Optional - for real crypto prices)
CRYPTO_API_KEY=your_crypto_api_key
```

## API Key Security
- Never commit API keys to version control
- Use environment variables or secure vaults
- Rotate keys regularly
- Use different keys for development/production

## Continue.dev Configuration
- Copy `continue.yaml.example` to `continue.yaml`
- Add your API keys to the copied file
- The actual config file is gitignored for security

## Dependencies Security
- Run `npm audit` regularly
- Update dependencies monthly
- Monitor security advisories

## Current Status
✅ Nodemailer updated to v7.0.10 (vulnerability fixed)
✅ Multer updated to v2.0.2 (vulnerabilities fixed)
⚠️  Validator vulnerability exists but no fix available (moderate severity)