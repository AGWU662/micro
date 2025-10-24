const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const priceService = require('./utils/priceService');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully');
  // Initialize admin user
  require('./config/initAdmin')();
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  process.exit(1);
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Send current prices to new client
  socket.emit('priceUpdate', priceService.getCurrentPrices());
  
  // Handle user joining their room for notifications
  socket.on('join', (room) => {
    socket.join(room);
    console.log(`Client ${socket.id} joined room: ${room}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Start price monitoring service
priceService.startPriceMonitoring(io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/mining', require('./routes/mining'));
app.use('/api/trading', require('./routes/trading'));
app.use('/api/p2p', require('./routes/p2p'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/kyc', require('./routes/kyc'));

// Welcome route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Welcome to Crypto Trading Platform API',
    version: '1.0.0',
    status: 'Active'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});
