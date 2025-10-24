import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    
    this.socket = io(socketUrl, {
      transports: ['websocket'],
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Trading real-time events
  onNewTrade(callback) {
    if (this.socket) {
      this.socket.on('newTrade', callback);
    }
  }

  onPriceUpdate(callback) {
    if (this.socket) {
      this.socket.on('priceUpdate', callback);
    }
  }

  // P2P real-time events
  onNewP2PTrade(callback) {
    if (this.socket) {
      this.socket.on('newP2PTrade', callback);
    }
  }

  onPaymentConfirmed(callback) {
    if (this.socket) {
      this.socket.on('paymentConfirmed', callback);
    }
  }

  // Wallet real-time events
  onBalanceUpdate(callback) {
    if (this.socket) {
      this.socket.on('balanceUpdate', callback);
    }
  }

  // Join user-specific room for notifications
  joinUserRoom(userId) {
    if (this.socket && userId) {
      this.socket.emit('join', `user_${userId}`);
    }
  }

  // Generic event listener
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Generic event emitter
  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;