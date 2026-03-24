# Troubleshooting Guide

This document provides solutions to common issues you may encounter while setting up and running the Crypto Trading Platform.

## Table of Contents
- [Installation Issues](#installation-issues)
- [Server Issues](#server-issues)
- [Client Issues](#client-issues)
- [Database Issues](#database-issues)
- [Common Errors](#common-errors)

---

## Installation Issues

### Error: Cannot find module after cloning

**Problem:** After cloning the repository, you get "Cannot find module" errors.

**Solution:**
```bash
# Install dependencies for both server and client
npm run install:all

# Or install them separately:
# Server dependencies
npm install

# Client dependencies
cd client && npm install
```

### Error: Missing .env.example file in client directory

**Problem:** Running `cp .env.example .env` in the client directory fails.

**Solution:**
The `.env.example` file now exists in the client directory. If it's missing:
```bash
cd client
cat > .env.example << 'EOF'
# React Client Environment Variables
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_APP_NAME=Crypto Trading Platform

# Optional: For deployment
# REACT_APP_API_BASE_URL=https://your-backend-domain.com/api
# REACT_APP_SOCKET_URL=https://your-backend-domain.com
EOF
```

---

## Server Issues

### Error: Cannot find module 'socks'

**Problem:** Server fails to start with module not found errors.

**Solution:**
```bash
# Remove corrupted node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Error: MongoDB connection failed

**Problem:** Server cannot connect to MongoDB.

**Solution:**
1. Ensure MongoDB is running:
   ```bash
   # On Linux/Mac
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. Check your `.env` file has the correct MongoDB URI:
   ```
   MONGO_URI=mongodb://localhost:27017/crypto-platform
   ```

### Error: Port 5000 already in use

**Problem:** Server fails to start because port 5000 is in use.

**Solution:**
1. Find and kill the process using port 5000:
   ```bash
   # Linux/Mac
   lsof -ti:5000 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

2. Or change the port in `.env`:
   ```
   PORT=3001
   ```

---

## Client Issues

### Error: Cannot find module 'jest-worker'

**Problem:** Client fails to start with missing jest-worker module.

**Solution:**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

### Error: Cannot find module 'react-hook-form' or 'postcss-preset-env'

**Problem:** Client fails to compile due to missing dependencies.

**Solution:**
```bash
cd client
npm install react-hook-form postcss-preset-env
```

### Error: Module not found for CSS files

**Problem:** Client shows errors like "Cannot resolve './AboutPage.css'".

**Solution:**
This was fixed in recent updates. Ensure you have the latest code:
```bash
git pull origin main
```

The CSS imports in the JavaScript files should match the actual CSS filenames:
- `About.js` should import `'./About.css'`
- `Features.js` should import `'./Features.css'`

### Error: Port 3000 already in use

**Problem:** React dev server fails to start.

**Solution:**
1. Kill the process using port 3000:
   ```bash
   # Linux/Mac
   lsof -ti:3000 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. Or set a different port:
   ```bash
   PORT=3001 npm start
   ```

---

## Database Issues

### Error: Admin user not created

**Problem:** Cannot login with default admin credentials.

**Solution:**
The admin user is created automatically on first server start. Ensure:
1. MongoDB is running
2. Server started successfully
3. Check server logs for admin creation message
4. Default credentials (can be changed in `.env`):
   - Email: admin@cryptoplatform.com
   - Password: Admin@123456

### Error: Database validation errors

**Problem:** Mongoose validation errors when saving data.

**Solution:**
Check the model schemas in the `/models` directory to ensure your data matches the required format.

---

## Common Errors

### Blank screen on client

**Problem:** Client loads but shows a blank screen.

**Possible Solutions:**
1. Check browser console for JavaScript errors
2. Ensure the server is running on the correct port
3. Verify `REACT_APP_API_BASE_URL` in client `.env` matches server URL
4. Clear browser cache and reload

### CORS errors

**Problem:** API requests blocked by CORS policy.

**Solution:**
1. Ensure `CLIENT_URL` in server `.env` matches your frontend URL:
   ```
   CLIENT_URL=http://localhost:3000
   ```

2. For development, the client `proxy` in `package.json` should be:
   ```json
   "proxy": "http://localhost:5000"
   ```

### WebSocket connection failed

**Problem:** Real-time features not working, Socket.io errors.

**Solution:**
1. Ensure server is running
2. Check `REACT_APP_SOCKET_URL` in client `.env`:
   ```
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

3. Verify no firewall blocking WebSocket connections

---

## Getting Help

If you encounter an issue not covered here:

1. Check the console/terminal output for specific error messages
2. Review the [README.md](README.md) for setup instructions
3. Ensure all environment variables are set correctly in `.env` files
4. Try a fresh installation:
   ```bash
   # Clean everything
   rm -rf node_modules client/node_modules
   rm -f package-lock.json client/package-lock.json
   
   # Reinstall
   npm run install:all
   ```

5. Create an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - Your environment (OS, Node version, etc.)
