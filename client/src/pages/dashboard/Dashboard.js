import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBalance: 0,
    todayPnL: 0,
    totalTrades: 0,
    activeMining: false
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchPrices();
    
    // Set up price updates
    const priceInterval = setInterval(fetchPrices, 30000);
    
    return () => clearInterval(priceInterval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch wallet balance
      const walletResponse = await fetch('http://localhost:5000/api/wallet/balance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch recent transactions
      const transactionsResponse = await fetch('http://localhost:5000/api/transactions?limit=5', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (walletResponse.ok) {
        const walletData = await walletResponse.json();
        setStats(prev => ({
          ...prev,
          totalBalance: walletData.data?.balance || 0
        }));
      }
      
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setRecentTransactions(transactionsData.data?.transactions || []);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/trading/prices');
      if (response.ok) {
        const data = await response.json();
        setCryptoPrices(data.data || {});
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-overview">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name || user?.email}!</h1>
        <p>Here's your trading overview for today</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Total Balance</h3>
            <p className="stat-value">{formatCurrency(stats.totalBalance)}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <h3>Today's P&L</h3>
            <p className={`stat-value ${stats.todayPnL >= 0 ? 'positive' : 'negative'}`}>
              {stats.todayPnL >= 0 ? '+' : ''}{formatCurrency(stats.todayPnL)}
            </p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-info">
            <h3>Total Trades</h3>
            <p className="stat-value">{stats.totalTrades}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⛏️</div>
          <div className="stat-info">
            <h3>Mining Status</h3>
            <p className={`stat-value ${stats.activeMining ? 'positive' : 'neutral'}`}>
              {stats.activeMining ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Live Prices */}
        <div className="dashboard-section">
          <h2>Live Crypto Prices</h2>
          <div className="prices-grid">
            {Object.entries(cryptoPrices).slice(0, 6).map(([symbol, price]) => (
              <div key={symbol} className="price-card">
                <div className="crypto-info">
                  <span className="crypto-symbol">{symbol.toUpperCase()}</span>
                  <span className="crypto-name">{symbol === 'btc' ? 'Bitcoin' : symbol === 'eth' ? 'Ethereum' : symbol.toUpperCase()}</span>
                </div>
                <div className="crypto-price">
                  <span className="price-value">{formatCurrency(parseFloat(price))}</span>
                  <span className="price-change positive">+2.5%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="dashboard-section">
          <h2>Recent Transactions</h2>
          <div className="transactions-list">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div key={transaction._id} className="transaction-item">
                  <div className="transaction-info">
                    <div className="transaction-type">
                      <span className={`type-badge ${transaction.type}`}>
                        {transaction.type}
                      </span>
                      <span className="transaction-amount">
                        {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                    </div>
                    <div className="transaction-details">
                      <span className="transaction-currency">{transaction.currency}</span>
                      <span className="transaction-date">{formatDate(transaction.createdAt)}</span>
                    </div>
                  </div>
                  <div className={`transaction-status ${transaction.status}`}>
                    {transaction.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No recent transactions</p>
                <span>Start trading to see your transaction history</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <div className="action-card">
              <div className="action-icon">💸</div>
              <h3>Deposit Funds</h3>
              <p>Add money to your wallet</p>
              <button className="action-btn primary">Deposit</button>
            </div>
            
            <div className="action-card">
              <div className="action-icon">📈</div>
              <h3>Start Trading</h3>
              <p>Place your first trade</p>
              <button className="action-btn primary">Trade Now</button>
            </div>
            
            <div className="action-card">
              <div className="action-icon">⛏️</div>
              <h3>Join Mining</h3>
              <p>Start earning rewards</p>
              <button className="action-btn secondary">Start Mining</button>
            </div>
            
            <div className="action-card">
              <div className="action-icon">🤝</div>
              <h3>P2P Trading</h3>
              <p>Trade with other users</p>
              <button className="action-btn secondary">Browse P2P</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;