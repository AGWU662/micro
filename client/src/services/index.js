import api from './api';

// Authentication services
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/update-profile', userData);
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  changePassword: async (passwords) => {
    const response = await api.put('/auth/change-password', passwords);
    return response.data;
  },
};

// Wallet services
export const walletService = {
  getWallet: async () => {
    const response = await api.get('/wallet');
    return response.data;
  },

  deposit: async (depositData) => {
    const response = await api.post('/wallet/deposit', depositData);
    return response.data;
  },

  withdraw: async (withdrawData) => {
    const response = await api.post('/wallet/withdraw', withdrawData);
    return response.data;
  },

  getAddresses: async () => {
    const response = await api.get('/wallet/addresses');
    return response.data;
  },

  generateAddress: async (currency, network) => {
    const response = await api.post('/wallet/generate-address', { currency, network });
    return response.data;
  },
};

// Trading services
export const tradingService = {
  getTradingPairs: async () => {
    const response = await api.get('/trading/pairs');
    return response.data;
  },

  placeOrder: async (orderData) => {
    const response = await api.post('/trading/order', orderData);
    return response.data;
  },

  getOrders: async (status) => {
    const response = await api.get(`/trading/orders?status=${status || ''}`);
    return response.data;
  },

  cancelOrder: async (orderId) => {
    const response = await api.delete(`/trading/order/${orderId}`);
    return response.data;
  },

  getTradingHistory: async (page = 1, limit = 50) => {
    const response = await api.get(`/trading/history?page=${page}&limit=${limit}`);
    return response.data;
  },
};

// Mining services
export const miningService = {
  getMiningPlans: async () => {
    const response = await api.get('/mining/plans');
    return response.data;
  },

  getInvestments: async () => {
    const response = await api.get('/mining/investments');
    return response.data;
  },

  invest: async (planId, amount) => {
    const response = await api.post('/mining/invest', { planId, amount });
    return response.data;
  },

  getEarnings: async () => {
    const response = await api.get('/mining/earnings');
    return response.data;
  },

  claimReturns: async (investmentId) => {
    const response = await api.post(`/mining/claim/${investmentId}`);
    return response.data;
  },
};

// P2P services
export const p2pService = {
  getOffers: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    const response = await api.get(`/p2p/offers?${queryString}`);
    return response.data;
  },

  createOffer: async (offerData) => {
    const response = await api.post('/p2p/offer', offerData);
    return response.data;
  },

  getTrades: async () => {
    const response = await api.get('/p2p/trades');
    return response.data;
  },

  createTrade: async (tradeData) => {
    const response = await api.post('/p2p/trade', tradeData);
    return response.data;
  },

  confirmPayment: async (tradeId, paymentProof) => {
    const response = await api.post(`/p2p/confirm-payment/${tradeId}`, { paymentProof });
    return response.data;
  },

  releaseCrypto: async (tradeId) => {
    const response = await api.post(`/p2p/release/${tradeId}`);
    return response.data;
  },

  openDispute: async (tradeId, reason) => {
    const response = await api.post(`/p2p/dispute/${tradeId}`, { reason });
    return response.data;
  },
};

// Transaction services
export const transactionService = {
  getTransactions: async (page = 1, limit = 20, type, status) => {
    const params = new URLSearchParams({ page, limit });
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    
    const response = await api.get(`/transactions?${params}`);
    return response.data;
  },

  getTransaction: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  getTransactionStats: async () => {
    const response = await api.get('/transactions/stats/summary');
    return response.data;
  },
};

// User services
export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  getReferrals: async () => {
    const response = await api.get('/users/referrals');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },
};