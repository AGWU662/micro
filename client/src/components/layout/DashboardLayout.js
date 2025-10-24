import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LiveChat from '../LiveChat';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarItems = [
    { path: '/dashboard', icon: '📊', label: 'Overview', exact: true },
    { path: '/dashboard/trading', icon: '📈', label: 'Trading' },
    { path: '/dashboard/wallet', icon: '💰', label: 'Wallet' },
    { path: '/dashboard/mining', icon: '⛏️', label: 'Mining' },
    { path: '/dashboard/p2p', icon: '🤝', label: 'P2P Trading' },
    { path: '/dashboard/transactions', icon: '📋', label: 'Transactions' },
    { path: '/dashboard/profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <div className="dashboard-layout">
      {/* Top Navigation */}
      <nav className="dashboard-nav">
        <div className="nav-left">
          <Link to="/" className="nav-logo">
            <span className="logo-icon">⛏️</span>
            Elite-cloud Mining
          </Link>
        </div>
        
        <div className="nav-right">
          <div className="user-info">
            <span className="welcome-text">Welcome, {user?.name || user?.email}</span>
            <div className="user-actions">
              <Link to="/dashboard/profile" className="profile-link">
                <span className="profile-icon">👤</span>
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-content">
            {sidebarItems.map((item) => {
              const isActive = item.exact 
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path) && item.path !== '/dashboard';
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-label">{item.label}</span>
                </Link>
              );
            })}
          </div>
          
          <div className="sidebar-footer">
            <div className="user-balance">
              <h4>Quick Stats</h4>
              <div className="stat-item">
                <span>Total Balance</span>
                <span className="stat-value">$0.00</span>
              </div>
              <div className="stat-item">
                <span>Today's P&L</span>
                <span className="stat-value positive">+$0.00</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          <div className="dashboard-content">
            {children}
          </div>
        </main>
      </div>
      
      {/* Live Chat Widget */}
      <LiveChat />
    </div>
  );
};

export default DashboardLayout;