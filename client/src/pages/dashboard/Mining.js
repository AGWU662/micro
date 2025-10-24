import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './Mining.css';

const Mining = () => {
  const [activePlans, setActivePlans] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [miningStats, setMiningStats] = useState({
    totalHashes: 0,
    totalEarnings: 0,
    activePlans: 0,
    hashRate: 0
  });
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('overview');

  useEffect(() => {
    fetchMiningData();
    const interval = setInterval(fetchMiningStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchMiningData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch available mining plans
      const plansRes = await fetch('/api/mining/plans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setAvailablePlans(plansData.plans || []);
      }

      // Fetch user's active investments
      const investmentsRes = await fetch('/api/mining/investments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (investmentsRes.ok) {
        const investmentsData = await investmentsRes.json();
        setActivePlans(investmentsData.investments || []);
      }

      // Fetch mining statistics
      fetchMiningStats();

    } catch (error) {
      console.error('Error fetching mining data:', error);
    }
  };

  const fetchMiningStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/mining/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMiningStats(data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching mining stats:', error);
    }
  };

  const handleInvestInPlan = async (plan) => {
    if (!investmentAmount || parseFloat(investmentAmount) < plan.minInvestment) {
      toast.error(`Minimum investment is $${plan.minInvestment}`);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/mining/invest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          planId: plan._id,
          amount: parseFloat(investmentAmount)
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Investment successful! Mining started.');
        setInvestmentAmount('');
        setSelectedPlan(null);
        fetchMiningData();
      } else {
        toast.error(result.message || 'Investment failed');
      }
    } catch (error) {
      toast.error('Error processing investment');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawEarnings = async (investmentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/mining/withdraw/${investmentId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Earnings withdrawn successfully!');
        fetchMiningData();
      } else {
        toast.error(result.message || 'Withdrawal failed');
      }
    } catch (error) {
      toast.error('Error withdrawing earnings');
    }
  };

  const formatHash = (hashRate) => {
    if (hashRate >= 1000000000000) {
      return `${(hashRate / 1000000000000).toFixed(2)} TH/s`;
    } else if (hashRate >= 1000000000) {
      return `${(hashRate / 1000000000).toFixed(2)} GH/s`;
    } else if (hashRate >= 1000000) {
      return `${(hashRate / 1000000).toFixed(2)} MH/s`;
    } else if (hashRate >= 1000) {
      return `${(hashRate / 1000).toFixed(2)} KH/s`;
    }
    return `${hashRate.toFixed(2)} H/s`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPlanIcon = (planName) => {
    const icons = {
      'Starter': '🚀',
      'Professional': '⚡',
      'Enterprise': '💎',
      'Bitcoin': '₿',
      'Ethereum': 'Ξ',
      'Multi-Coin': '🪙'
    };
    return icons[planName] || '⛏️';
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'success',
      'pending': 'warning',
      'completed': 'info',
      'cancelled': 'danger'
    };
    return colors[status] || 'secondary';
  };

  return (
    <div className="mining-page">
      <div className="mining-header">
        <h1>Elite-cloud Mining</h1>
        <p>Professional cryptocurrency mining made simple</p>
      </div>

      {/* Navigation Tabs */}
      <div className="mining-tabs">
        <button 
          className={`tab ${currentTab === 'overview' ? 'active' : ''}`}
          onClick={() => setCurrentTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${currentTab === 'plans' ? 'active' : ''}`}
          onClick={() => setCurrentTab('plans')}
        >
          Mining Plans
        </button>
        <button 
          className={`tab ${currentTab === 'active' ? 'active' : ''}`}
          onClick={() => setCurrentTab('active')}
        >
          Active Mining
        </button>
        <button 
          className={`tab ${currentTab === 'history' ? 'active' : ''}`}
          onClick={() => setCurrentTab('history')}
        >
          History
        </button>
      </div>

      {/* Overview Tab */}
      {currentTab === 'overview' && (
        <div className="mining-overview">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">⛏️</div>
              <div className="stat-info">
                <h3>Total Hash Power</h3>
                <p className="stat-value">{formatHash(miningStats.hashRate)}</p>
                <span className="stat-change positive">+15% this week</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h3>Total Earnings</h3>
                <p className="stat-value">{formatCurrency(miningStats.totalEarnings)}</p>
                <span className="stat-change positive">+${(miningStats.totalEarnings * 0.05).toFixed(2)} today</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <h3>Active Plans</h3>
                <p className="stat-value">{miningStats.activePlans}</p>
                <span className="stat-change neutral">Currently mining</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-info">
                <h3>Efficiency</h3>
                <p className="stat-value">98.5%</p>
                <span className="stat-change positive">Excellent performance</span>
              </div>
            </div>
          </div>

          {/* Mining Pool Status */}
          <div className="pool-status">
            <h3>Mining Pool Status</h3>
            <div className="pools-grid">
              <div className="pool-card">
                <div className="pool-header">
                  <span className="pool-icon">₿</span>
                  <div className="pool-info">
                    <h4>Bitcoin Pool</h4>
                    <p>SHA-256 Algorithm</p>
                  </div>
                  <div className="pool-status active">Online</div>
                </div>
                <div className="pool-stats">
                  <div className="pool-stat">
                    <span>Hashrate</span>
                    <span>2.5 EH/s</span>
                  </div>
                  <div className="pool-stat">
                    <span>Miners</span>
                    <span>1,247</span>
                  </div>
                  <div className="pool-stat">
                    <span>Fee</span>
                    <span>1.5%</span>
                  </div>
                </div>
              </div>

              <div className="pool-card">
                <div className="pool-header">
                  <span className="pool-icon">Ξ</span>
                  <div className="pool-info">
                    <h4>Ethereum Pool</h4>
                    <p>Ethash Algorithm</p>
                  </div>
                  <div className="pool-status active">Online</div>
                </div>
                <div className="pool-stats">
                  <div className="pool-stat">
                    <span>Hashrate</span>
                    <span>850 GH/s</span>
                  </div>
                  <div className="pool-stat">
                    <span>Miners</span>
                    <span>892</span>
                  </div>
                  <div className="pool-stat">
                    <span>Fee</span>
                    <span>1.0%</span>
                  </div>
                </div>
              </div>

              <div className="pool-card">
                <div className="pool-header">
                  <span className="pool-icon">Ł</span>
                  <div className="pool-info">
                    <h4>Litecoin Pool</h4>
                    <p>Scrypt Algorithm</p>
                  </div>
                  <div className="pool-status active">Online</div>
                </div>
                <div className="pool-stats">
                  <div className="pool-stat">
                    <span>Hashrate</span>
                    <span>120 TH/s</span>
                  </div>
                  <div className="pool-stat">
                    <span>Miners</span>
                    <span>456</span>
                  </div>
                  <div className="pool-stat">
                    <span>Fee</span>
                    <span>1.2%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mining Plans Tab */}
      {currentTab === 'plans' && (
        <div className="mining-plans">
          <div className="plans-header">
            <h3>Choose Your Mining Plan</h3>
            <p>Start earning cryptocurrency with our professional mining infrastructure</p>
          </div>

          <div className="plans-grid">
            {availablePlans.map((plan) => (
              <div key={plan._id} className={`plan-card ${plan.featured ? 'featured' : ''}`}>
                {plan.featured && (
                  <div className="featured-badge">Most Popular</div>
                )}
                
                <div className="plan-header">
                  <div className="plan-icon">{getPlanIcon(plan.name)}</div>
                  <h4>{plan.name}</h4>
                  <p className="plan-description">{plan.description}</p>
                </div>

                <div className="plan-pricing">
                  <div className="plan-price">
                    <span className="price-label">Starting from</span>
                    <span className="price-value">{formatCurrency(plan.minInvestment)}</span>
                  </div>
                  <div className="plan-returns">
                    <span>Expected Daily Return: {plan.dailyReturn}%</span>
                  </div>
                </div>

                <div className="plan-features">
                  <ul>
                    {plan.features?.map((feature, index) => (
                      <li key={index}>✓ {feature}</li>
                    )) || [
                      '✓ Professional mining hardware',
                      '✓ 24/7 monitoring and maintenance',
                      '✓ Daily payouts',
                      '✓ Real-time statistics'
                    ]}
                  </ul>
                </div>

                <div className="plan-stats">
                  <div className="stat">
                    <span>Hash Rate</span>
                    <span>{formatHash(plan.hashRate || 1000000000)}</span>
                  </div>
                  <div className="stat">
                    <span>Duration</span>
                    <span>{plan.duration || 365} days</span>
                  </div>
                  <div className="stat">
                    <span>Min Investment</span>
                    <span>{formatCurrency(plan.minInvestment)}</span>
                  </div>
                </div>

                <button 
                  className="invest-btn"
                  onClick={() => setSelectedPlan(plan)}
                >
                  Start Mining
                </button>
              </div>
            ))}
          </div>

          {/* Investment Modal */}
          {selectedPlan && (
            <div className="modal-overlay" onClick={() => setSelectedPlan(null)}>
              <div className="investment-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Invest in {selectedPlan.name}</h3>
                  <button 
                    className="close-btn"
                    onClick={() => setSelectedPlan(null)}
                  >
                    ×
                  </button>
                </div>

                <div className="modal-content">
                  <div className="plan-summary">
                    <div className="summary-item">
                      <span>Plan</span>
                      <span>{selectedPlan.name}</span>
                    </div>
                    <div className="summary-item">
                      <span>Daily Return</span>
                      <span>{selectedPlan.dailyReturn}%</span>
                    </div>
                    <div className="summary-item">
                      <span>Min Investment</span>
                      <span>{formatCurrency(selectedPlan.minInvestment)}</span>
                    </div>
                  </div>

                  <div className="investment-form">
                    <label>Investment Amount (USD)</label>
                    <input
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      placeholder={`Minimum ${formatCurrency(selectedPlan.minInvestment)}`}
                      min={selectedPlan.minInvestment}
                    />
                    
                    {investmentAmount && (
                      <div className="investment-preview">
                        <div className="preview-item">
                          <span>Investment Amount</span>
                          <span>{formatCurrency(investmentAmount)}</span>
                        </div>
                        <div className="preview-item">
                          <span>Expected Daily Return</span>
                          <span>{formatCurrency(investmentAmount * selectedPlan.dailyReturn / 100)}</span>
                        </div>
                        <div className="preview-item">
                          <span>Expected Monthly Return</span>
                          <span>{formatCurrency(investmentAmount * selectedPlan.dailyReturn / 100 * 30)}</span>
                        </div>
                      </div>
                    )}

                    <button 
                      className="confirm-btn"
                      onClick={() => handleInvestInPlan(selectedPlan)}
                      disabled={loading || !investmentAmount}
                    >
                      {loading ? 'Processing...' : 'Confirm Investment'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Mining Tab */}
      {currentTab === 'active' && (
        <div className="active-mining">
          <div className="active-header">
            <h3>Your Active Mining Operations</h3>
            <p>Monitor and manage your current mining investments</p>
          </div>

          {activePlans.length > 0 ? (
            <div className="active-plans-grid">
              {activePlans.map((investment) => (
                <div key={investment._id} className="active-plan-card">
                  <div className="plan-status">
                    <div className={`status-indicator ${getStatusColor(investment.status)}`}></div>
                    <span className="status-text">{investment.status?.toUpperCase()}</span>
                  </div>

                  <div className="plan-details">
                    <h4>{investment.plan?.name || 'Mining Plan'}</h4>
                    <p>Started: {new Date(investment.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="mining-stats">
                    <div className="stat-row">
                      <span>Investment</span>
                      <span>{formatCurrency(investment.amount)}</span>
                    </div>
                    <div className="stat-row">
                      <span>Total Earnings</span>
                      <span className="positive">{formatCurrency(investment.totalEarnings || 0)}</span>
                    </div>
                    <div className="stat-row">
                      <span>Available</span>
                      <span className="positive">{formatCurrency(investment.availableEarnings || 0)}</span>
                    </div>
                    <div className="stat-row">
                      <span>Hash Rate</span>
                      <span>{formatHash(investment.hashRate || 0)}</span>
                    </div>
                  </div>

                  <div className="plan-actions">
                    {investment.availableEarnings > 0 && (
                      <button 
                        className="withdraw-btn"
                        onClick={() => handleWithdrawEarnings(investment._id)}
                      >
                        Withdraw Earnings
                      </button>
                    )}
                    <button className="details-btn">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">⛏️</div>
              <h3>No Active Mining Operations</h3>
              <p>Start your first mining investment to see your operations here</p>
              <button 
                className="start-mining-btn"
                onClick={() => setCurrentTab('plans')}
              >
                Browse Mining Plans
              </button>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {currentTab === 'history' && (
        <div className="mining-history">
          <div className="history-header">
            <h3>Mining History</h3>
            <div className="history-filters">
              <select className="filter-select">
                <option value="all">All Transactions</option>
                <option value="earnings">Earnings</option>
                <option value="withdrawals">Withdrawals</option>
                <option value="investments">Investments</option>
              </select>
              <input type="date" className="date-filter" />
            </div>
          </div>

          <div className="history-table">
            <div className="table-header">
              <span>Date</span>
              <span>Type</span>
              <span>Plan</span>
              <span>Amount</span>
              <span>Status</span>
            </div>
            
            {/* Sample history data */}
            <div className="table-row">
              <span>Oct 24, 2025</span>
              <span className="type earning">Earning</span>
              <span>Bitcoin Pro</span>
              <span className="positive">+$12.45</span>
              <span className="status completed">Completed</span>
            </div>
            
            <div className="table-row">
              <span>Oct 23, 2025</span>
              <span className="type withdrawal">Withdrawal</span>
              <span>-</span>
              <span className="negative">-$150.00</span>
              <span className="status completed">Completed</span>
            </div>
            
            <div className="table-row">
              <span>Oct 20, 2025</span>
              <span className="type investment">Investment</span>
              <span>Bitcoin Pro</span>
              <span className="negative">-$500.00</span>
              <span className="status completed">Completed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mining;