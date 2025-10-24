import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './P2PTrade.css';

const P2PTrade = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('buy');
  const [selectedCurrency, setSelectedCurrency] = useState('BTC');
  const [orders, setOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [filters, setFilters] = useState({
    minAmount: '',
    maxAmount: '',
    paymentMethod: 'all',
    country: 'all'
  });
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [newOrder, setNewOrder] = useState({
    type: 'sell',
    currency: 'BTC',
    amount: '',
    price: '',
    minTrade: '',
    maxTrade: '',
    paymentMethod: 'bank_transfer',
    description: '',
    country: 'US'
  });
  const [loading, setLoading] = useState(true);

  const currencies = ['BTC', 'ETH', 'USDT', 'LTC', 'ADA'];
  const paymentMethods = [
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'cash', label: 'Cash' },
    { value: 'mobile_money', label: 'Mobile Money' },
    { value: 'gift_cards', label: 'Gift Cards' }
  ];

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'AU', name: 'Australia' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' }
  ];

  useEffect(() => {
    fetchOrders();
    fetchMyOrders();
  }, [activeTab, selectedCurrency]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/p2p/orders?type=${activeTab}&currency=${selectedCurrency}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.data?.orders || mockOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/p2p/my-orders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMyOrders(data.data?.orders || []);
      }
    } catch (error) {
      console.error('Error fetching my orders:', error);
    }
  };

  // Mock data for demonstration
  const mockOrders = [
    {
      _id: '1',
      seller: { name: 'CryptoTrader01', rating: 4.8, trades: 145 },
      currency: 'BTC',
      amount: 0.5,
      price: 43500,
      minTrade: 1000,
      maxTrade: 10000,
      paymentMethod: 'bank_transfer',
      country: 'US',
      online: true
    },
    {
      _id: '2',
      seller: { name: 'BitcoinPro', rating: 4.9, trades: 289 },
      currency: 'BTC',
      amount: 1.2,
      price: 43450,
      minTrade: 500,
      maxTrade: 5000,
      paymentMethod: 'paypal',
      country: 'UK',
      online: true
    },
    {
      _id: '3',
      seller: { name: 'CoinMaster', rating: 4.7, trades: 97 },
      currency: 'BTC',
      amount: 0.8,
      price: 43600,
      minTrade: 2000,
      maxTrade: 15000,
      paymentMethod: 'cash',
      country: 'CA',
      online: false
    }
  ];

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/p2p/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newOrder)
      });

      if (response.ok) {
        setShowCreateOrder(false);
        setNewOrder({
          type: 'sell',
          currency: 'BTC',
          amount: '',
          price: '',
          minTrade: '',
          maxTrade: '',
          paymentMethod: 'bank_transfer',
          description: '',
          country: 'US'
        });
        fetchMyOrders();
        alert('Order created successfully!');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order. Please try again.');
    }
  };

  const handleTrade = (orderId) => {
    // Implement trade initiation
    alert('Trade functionality will be implemented with Socket.io');
  };

  const filteredOrders = orders.filter(order => {
    if (filters.minAmount && order.minTrade < parseFloat(filters.minAmount)) return false;
    if (filters.maxAmount && order.maxTrade > parseFloat(filters.maxAmount)) return false;
    if (filters.paymentMethod !== 'all' && order.paymentMethod !== filters.paymentMethod) return false;
    if (filters.country !== 'all' && order.country !== filters.country) return false;
    return true;
  });

  return (
    <div className="p2p-trade-page">
      <div className="p2p-header">
        <h1>P2P Trading</h1>
        <p>Trade directly with other users at the best rates</p>
        <button 
          className="create-order-btn"
          onClick={() => setShowCreateOrder(true)}
        >
          Create Order
        </button>
      </div>

      {/* Currency and Tab Selection */}
      <div className="trade-controls">
        <div className="currency-selector">
          {currencies.map(currency => (
            <button
              key={currency}
              className={`currency-btn ${selectedCurrency === currency ? 'active' : ''}`}
              onClick={() => setSelectedCurrency(currency)}
            >
              {currency}
            </button>
          ))}
        </div>
        
        <div className="trade-tabs">
          <button
            className={`tab-btn ${activeTab === 'buy' ? 'active' : ''}`}
            onClick={() => setActiveTab('buy')}
          >
            Buy {selectedCurrency}
          </button>
          <button
            className={`tab-btn ${activeTab === 'sell' ? 'active' : ''}`}
            onClick={() => setActiveTab('sell')}
          >
            Sell {selectedCurrency}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters">
          <div className="filter-group">
            <label>Min Amount ($)</label>
            <input
              type="number"
              value={filters.minAmount}
              onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
              placeholder="0"
            />
          </div>
          <div className="filter-group">
            <label>Max Amount ($)</label>
            <input
              type="number"
              value={filters.maxAmount}
              onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
              placeholder="No limit"
            />
          </div>
          <div className="filter-group">
            <label>Payment Method</label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => setFilters({...filters, paymentMethod: e.target.value})}
            >
              <option value="all">All Methods</option>
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Country</label>
            <select
              value={filters.country}
              onChange={(e) => setFilters({...filters, country: e.target.value})}
            >
              <option value="all">All Countries</option>
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="orders-section">
        <div className="orders-header">
          <h2>{activeTab === 'buy' ? 'Sellers' : 'Buyers'}</h2>
          <span className="orders-count">{filteredOrders.length} orders available</span>
        </div>

        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading orders...</p>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map(order => (
              <div key={order._id} className="order-card">
                <div className="trader-info">
                  <div className="trader-details">
                    <div className="trader-name">
                      {order.seller.name}
                      {order.online && <span className="online-indicator">●</span>}
                    </div>
                    <div className="trader-stats">
                      <span className="rating">⭐ {order.seller.rating}</span>
                      <span className="trades">{order.seller.trades} trades</span>
                    </div>
                  </div>
                </div>

                <div className="order-details">
                  <div className="price-info">
                    <div className="price">${order.price.toLocaleString()}</div>
                    <div className="currency">{order.currency}</div>
                  </div>
                  
                  <div className="trade-limits">
                    <div className="limit-info">
                      <span>Available: {order.amount} {order.currency}</span>
                      <span>Limit: ${order.minTrade.toLocaleString()} - ${order.maxTrade.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="payment-info">
                    <div className="payment-method">
                      {paymentMethods.find(pm => pm.value === order.paymentMethod)?.label}
                    </div>
                    <div className="country">{order.country}</div>
                  </div>
                </div>

                <div className="order-actions">
                  <button
                    className="trade-btn"
                    onClick={() => handleTrade(order._id)}
                  >
                    {activeTab === 'buy' ? 'Buy' : 'Sell'} {order.currency}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Orders Section */}
      <div className="my-orders-section">
        <h2>My Orders</h2>
        {myOrders.length > 0 ? (
          <div className="my-orders-list">
            {myOrders.map(order => (
              <div key={order._id} className="my-order-card">
                <div className="order-info">
                  <span className="order-type">{order.type}</span>
                  <span className="order-currency">{order.currency}</span>
                  <span className="order-amount">{order.amount}</span>
                  <span className="order-price">${order.price}</span>
                </div>
                <div className="order-status">
                  <span className={`status-badge ${order.status}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-orders">
            <p>You don't have any active orders.</p>
            <button onClick={() => setShowCreateOrder(true)}>
              Create your first order
            </button>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {showCreateOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create P2P Order</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCreateOrder(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateOrder}>
              <div className="form-group">
                <label>Order Type</label>
                <select
                  value={newOrder.type}
                  onChange={(e) => setNewOrder({...newOrder, type: e.target.value})}
                  required
                >
                  <option value="sell">Sell</option>
                  <option value="buy">Buy</option>
                </select>
              </div>

              <div className="form-group">
                <label>Currency</label>
                <select
                  value={newOrder.currency}
                  onChange={(e) => setNewOrder({...newOrder, currency: e.target.value})}
                  required
                >
                  {currencies.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Amount ({newOrder.currency})</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={newOrder.amount}
                    onChange={(e) => setNewOrder({...newOrder, amount: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price (USD)</label>
                  <input
                    type="number"
                    value={newOrder.price}
                    onChange={(e) => setNewOrder({...newOrder, price: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Min Trade (USD)</label>
                  <input
                    type="number"
                    value={newOrder.minTrade}
                    onChange={(e) => setNewOrder({...newOrder, minTrade: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Max Trade (USD)</label>
                  <input
                    type="number"
                    value={newOrder.maxTrade}
                    onChange={(e) => setNewOrder({...newOrder, maxTrade: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select
                  value={newOrder.paymentMethod}
                  onChange={(e) => setNewOrder({...newOrder, paymentMethod: e.target.value})}
                  required
                >
                  {paymentMethods.map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Country</label>
                <select
                  value={newOrder.country}
                  onChange={(e) => setNewOrder({...newOrder, country: e.target.value})}
                  required
                >
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  value={newOrder.description}
                  onChange={(e) => setNewOrder({...newOrder, description: e.target.value})}
                  placeholder="Add any additional terms or requirements..."
                  rows="3"
                ></textarea>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowCreateOrder(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default P2PTrade;