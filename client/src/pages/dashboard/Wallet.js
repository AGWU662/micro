import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './Wallet.css';

const Wallet = () => {
  const [wallet, setWallet] = useState({ balances: [] });
  const [transactions, setTransactions] = useState([]);
  const [currentTab, setCurrentTab] = useState('overview');
  const [depositData, setDepositData] = useState({ currency: 'USDT', amount: '' });
  const [withdrawData, setWithdrawData] = useState({ currency: 'USDT', amount: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [depositAddress, setDepositAddress] = useState('');

  const cryptoInfo = {
    BTC: { name: 'Bitcoin', icon: '₿', color: '#f7931a' },
    ETH: { name: 'Ethereum', icon: 'Ξ', color: '#627eea' },
    USDT: { name: 'Tether', icon: '₮', color: '#26a17b' },
    LTC: { name: 'Litecoin', icon: 'Ł', color: '#bfbbbb' },
    ADA: { name: 'Cardano', icon: '₳', color: '#0033ad' },
    DOT: { name: 'Polkadot', icon: '●', color: '#e6007a' }
  };

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
  }, []);

  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/wallet', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setWallet(data.wallet || { balances: [] });
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/transactions?limit=20', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleDeposit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(depositData)
      });

      const result = await response.json();
      if (result.success) {
        setDepositAddress(result.address);
        setQrCode(result.qrCode);
        toast.success('Deposit address generated successfully!');
      } else {
        toast.error(result.message || 'Failed to generate deposit address');
      }
    } catch (error) {
      toast.error('Error processing deposit request');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawData.amount || !withdrawData.address) {
      toast.error('Please fill in all withdrawal details');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(withdrawData)
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Withdrawal request submitted successfully!');
        setWithdrawData({ currency: 'USDT', amount: '', address: '' });
        fetchWalletData();
        fetchTransactions();
      } else {
        toast.error(result.message || 'Withdrawal failed');
      }
    } catch (error) {
      toast.error('Error processing withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const getBalance = (currency) => {
    const balance = wallet.balances.find(b => b.currency === currency);
    return balance ? balance.available : 0;
  };

  const getLockedBalance = (currency) => {
    const balance = wallet.balances.find(b => b.currency === currency);
    return balance ? balance.locked : 0;
  };

  const getTotalBalance = (currency) => {
    const balance = wallet.balances.find(b => b.currency === currency);
    return balance ? balance.total : 0;
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    }
    
    return parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    const icons = {
      deposit: '↓',
      withdrawal: '↑',
      trade: '↔️',
      mining: '⛏️',
      bonus: '🎁',
      fee: '💸'
    };
    return icons[type] || '📝';
  };

  const getTransactionColor = (type) => {
    const colors = {
      deposit: 'success',
      withdrawal: 'warning',
      trade: 'info',
      mining: 'mining',
      bonus: 'success',
      fee: 'danger'
    };
    return colors[type] || 'secondary';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    });
  };

  return (
    <div className="wallet-page">
      <div className="wallet-header">
        <h1>Your Wallet</h1>
        <p>Manage your cryptocurrency assets securely</p>
      </div>

      {/* Wallet Overview */}
      <div className="wallet-overview">
        <div className="total-balance">
          <h3>Total Portfolio Value</h3>
          <p className="total-value">
            {formatCurrency(
              wallet.balances.reduce((total, balance) => {
                // Mock price calculation - in real app, you'd fetch current prices
                const mockPrices = { BTC: 45000, ETH: 3000, USDT: 1, LTC: 150, ADA: 0.5, DOT: 25 };
                return total + (balance.total * (mockPrices[balance.currency] || 0));
              }, 0)
            )}
          </p>
          <span className="balance-change positive">+2.5% (24h)</span>
        </div>

        <div className="balances-grid">
          {Object.entries(cryptoInfo).map(([currency, info]) => {
            const available = getBalance(currency);
            const locked = getLockedBalance(currency);
            const total = getTotalBalance(currency);
            
            return (
              <div key={currency} className="balance-card">
                <div className="balance-header">
                  <div className="crypto-icon" style={{ color: info.color }}>
                    {info.icon}
                  </div>
                  <div className="crypto-info">
                    <h4>{currency}</h4>
                    <p>{info.name}</p>
                  </div>
                </div>
                
                <div className="balance-amounts">
                  <div className="balance-row">
                    <span>Available</span>
                    <span className="amount">{formatCurrency(available)} {currency}</span>
                  </div>
                  <div className="balance-row">
                    <span>Locked</span>
                    <span className="amount locked">{formatCurrency(locked)} {currency}</span>
                  </div>
                  <div className="balance-row total">
                    <span>Total</span>
                    <span className="amount">{formatCurrency(total)} {currency}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="wallet-tabs">
        <button 
          className={`tab ${currentTab === 'overview' ? 'active' : ''}`}
          onClick={() => setCurrentTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${currentTab === 'deposit' ? 'active' : ''}`}
          onClick={() => setCurrentTab('deposit')}
        >
          Deposit
        </button>
        <button 
          className={`tab ${currentTab === 'withdraw' ? 'active' : ''}`}
          onClick={() => setCurrentTab('withdraw')}
        >
          Withdraw
        </button>
        <button 
          className={`tab ${currentTab === 'history' ? 'active' : ''}`}
          onClick={() => setCurrentTab('history')}
        >
          Transaction History
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {currentTab === 'overview' && (
          <div className="overview-content">
            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction._id} className="activity-item">
                    <div className="activity-icon">
                      <span className={`icon ${getTransactionColor(transaction.type)}`}>
                        {getTransactionIcon(transaction.type)}
                      </span>
                    </div>
                    <div className="activity-details">
                      <div className="activity-main">
                        <span className="activity-type">{transaction.type}</span>
                        <span className="activity-amount">
                          {transaction.type === 'deposit' ? '+' : '-'}
                          {formatCurrency(transaction.amount)} {transaction.currency}
                        </span>
                      </div>
                      <div className="activity-meta">
                        <span className="activity-date">{formatDate(transaction.createdAt)}</span>
                        <span className={`activity-status ${transaction.status}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="wallet-actions">
              <h3>Quick Actions</h3>
              <div className="actions-grid">
                <button 
                  className="action-btn deposit"
                  onClick={() => setCurrentTab('deposit')}
                >
                  <span className="action-icon">↓</span>
                  <span>Deposit Funds</span>
                </button>
                <button 
                  className="action-btn withdraw"
                  onClick={() => setCurrentTab('withdraw')}
                >
                  <span className="action-icon">↑</span>
                  <span>Withdraw Funds</span>
                </button>
                <button className="action-btn trade">
                  <span className="action-icon">↔️</span>
                  <span>Start Trading</span>
                </button>
                <button className="action-btn mining">
                  <span className="action-icon">⛏️</span>
                  <span>Join Mining</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Deposit Tab */}
        {currentTab === 'deposit' && (
          <div className="deposit-content">
            <div className="deposit-form">
              <h3>Deposit Cryptocurrency</h3>
              <p>Select the cryptocurrency you want to deposit and generate a deposit address.</p>

              <div className="form-group">
                <label>Select Currency</label>
                <select 
                  value={depositData.currency}
                  onChange={(e) => setDepositData({...depositData, currency: e.target.value})}
                  className="currency-select"
                >
                  {Object.entries(cryptoInfo).map(([currency, info]) => (
                    <option key={currency} value={currency}>
                      {info.icon} {currency} - {info.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Amount (Optional)</label>
                <input
                  type="number"
                  value={depositData.amount}
                  onChange={(e) => setDepositData({...depositData, amount: e.target.value})}
                  placeholder="Enter amount to deposit"
                  min="0"
                  step="0.00000001"
                />
              </div>

              <button 
                className="generate-btn"
                onClick={handleDeposit}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Deposit Address'}
              </button>

              {depositAddress && (
                <div className="deposit-address">
                  <h4>Deposit Address</h4>
                  <div className="address-container">
                    <div className="address-field">
                      <input 
                        type="text" 
                        value={depositAddress} 
                        readOnly 
                        className="address-input"
                      />
                      <button 
                        className="copy-btn"
                        onClick={() => copyToClipboard(depositAddress)}
                      >
                        📋
                      </button>
                    </div>
                    {qrCode && (
                      <div className="qr-code">
                        <img src={qrCode} alt="QR Code" />
                        <p>Scan QR code with your wallet</p>
                      </div>
                    )}
                  </div>

                  <div className="deposit-info">
                    <div className="info-item">
                      <span className="info-label">Network</span>
                      <span className="info-value">{depositData.currency} Network</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Min Deposit</span>
                      <span className="info-value">0.001 {depositData.currency}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Confirmations</span>
                      <span className="info-value">3 confirmations required</span>
                    </div>
                  </div>

                  <div className="deposit-warning">
                    <h5>⚠️ Important Notice</h5>
                    <ul>
                      <li>Only send {depositData.currency} to this address</li>
                      <li>Minimum deposit amount is 0.001 {depositData.currency}</li>
                      <li>Deposits will be credited after 3 network confirmations</li>
                      <li>Do not send funds from exchange accounts</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Withdraw Tab */}
        {currentTab === 'withdraw' && (
          <div className="withdraw-content">
            <div className="withdraw-form">
              <h3>Withdraw Cryptocurrency</h3>
              <p>Send your cryptocurrency to an external wallet address.</p>

              <div className="form-group">
                <label>Select Currency</label>
                <select 
                  value={withdrawData.currency}
                  onChange={(e) => setWithdrawData({...withdrawData, currency: e.target.value})}
                  className="currency-select"
                >
                  {Object.entries(cryptoInfo).map(([currency, info]) => (
                    <option key={currency} value={currency}>
                      {info.icon} {currency} - {info.name} (Available: {formatCurrency(getBalance(currency))})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Withdrawal Address</label>
                <input
                  type="text"
                  value={withdrawData.address}
                  onChange={(e) => setWithdrawData({...withdrawData, address: e.target.value})}
                  placeholder="Enter destination wallet address"
                  required
                />
                <small>Double-check the address. Transactions cannot be reversed.</small>
              </div>

              <div className="form-group">
                <label>Amount</label>
                <div className="amount-input">
                  <input
                    type="number"
                    value={withdrawData.amount}
                    onChange={(e) => setWithdrawData({...withdrawData, amount: e.target.value})}
                    placeholder="0.00"
                    min="0"
                    step="0.00000001"
                    max={getBalance(withdrawData.currency)}
                    required
                  />
                  <button 
                    className="max-btn"
                    onClick={() => setWithdrawData({
                      ...withdrawData, 
                      amount: getBalance(withdrawData.currency).toString()
                    })}
                  >
                    MAX
                  </button>
                </div>
                <div className="balance-info">
                  Available: {formatCurrency(getBalance(withdrawData.currency))} {withdrawData.currency}
                </div>
              </div>

              <div className="withdrawal-summary">
                <div className="summary-row">
                  <span>Amount</span>
                  <span>{formatCurrency(withdrawData.amount || 0)} {withdrawData.currency}</span>
                </div>
                <div className="summary-row">
                  <span>Network Fee</span>
                  <span>0.0005 {withdrawData.currency}</span>
                </div>
                <div className="summary-row total">
                  <span>Total Deduction</span>
                  <span>{formatCurrency((parseFloat(withdrawData.amount) || 0) + 0.0005)} {withdrawData.currency}</span>
                </div>
              </div>

              <button 
                className="withdraw-btn"
                onClick={handleWithdraw}
                disabled={loading || !withdrawData.amount || !withdrawData.address}
              >
                {loading ? 'Processing...' : 'Withdraw Funds'}
              </button>

              <div className="withdrawal-info">
                <h5>Withdrawal Information</h5>
                <ul>
                  <li>Minimum withdrawal: 0.01 {withdrawData.currency}</li>
                  <li>Processing time: 5-30 minutes</li>
                  <li>Daily withdrawal limit: 100 {withdrawData.currency}</li>
                  <li>All withdrawals require email verification</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Transaction History Tab */}
        {currentTab === 'history' && (
          <div className="history-content">
            <div className="history-header">
              <h3>Transaction History</h3>
              <div className="history-filters">
                <select className="filter-select">
                  <option value="all">All Types</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdrawal">Withdrawals</option>
                  <option value="trade">Trades</option>
                  <option value="mining">Mining</option>
                </select>
                <select className="filter-select">
                  <option value="all">All Currencies</option>
                  {Object.keys(cryptoInfo).map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
                <input type="date" className="date-filter" />
              </div>
            </div>

            <div className="transactions-table">
              <div className="table-header">
                <span>Date</span>
                <span>Type</span>
                <span>Currency</span>
                <span>Amount</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              {transactions.map((transaction) => (
                <div key={transaction._id} className="table-row">
                  <span className="date">
                    {formatDate(transaction.createdAt)}
                  </span>
                  <span className={`type ${getTransactionColor(transaction.type)}`}>
                    <span className="type-icon">{getTransactionIcon(transaction.type)}</span>
                    {transaction.type}
                  </span>
                  <span className="currency">
                    <span className="currency-icon" style={{ color: cryptoInfo[transaction.currency]?.color }}>
                      {cryptoInfo[transaction.currency]?.icon}
                    </span>
                    {transaction.currency}
                  </span>
                  <span className={`amount ${transaction.type === 'deposit' ? 'positive' : 'negative'}`}>
                    {transaction.type === 'deposit' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </span>
                  <span className={`status ${transaction.status}`}>
                    <span className="status-dot"></span>
                    {transaction.status}
                  </span>
                  <span className="actions">
                    <button className="view-btn" title="View Details">👁️</button>
                    {transaction.txHash && (
                      <button 
                        className="external-btn" 
                        title="View on Blockchain"
                        onClick={() => window.open(`https://blockchain.info/tx/${transaction.txHash}`, '_blank')}
                      >
                        🔗
                      </button>
                    )}
                  </span>
                </div>
              ))}

              {transactions.length === 0 && (
                <div className="empty-transactions">
                  <div className="empty-icon">📝</div>
                  <h4>No Transactions Yet</h4>
                  <p>Your transaction history will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;