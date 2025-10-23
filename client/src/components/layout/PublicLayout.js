import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PublicLayout.css';

const PublicLayout = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="public-layout">
      {/* Navigation Header */}
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <span className="logo-icon">₿</span>
            CryptoTrader
          </Link>
          
          <div className="nav-menu">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/features" className="nav-link">Features</Link>
            <Link to="/pricing" className="nav-link">Pricing</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </div>
          
          <div className="nav-auth">
            <button 
              className="btn-secondary"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button 
              className="btn-primary"
              onClick={() => navigate('/register')}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <h3>CryptoTrader</h3>
            <p>Your trusted cryptocurrency trading platform with advanced features and secure transactions.</p>
            <div className="social-links">
              <a href="#" className="social-link">Twitter</a>
              <a href="#" className="social-link">Telegram</a>
              <a href="#" className="social-link">Discord</a>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Platform</h4>
            <Link to="/features" className="footer-link">Features</Link>
            <Link to="/pricing" className="footer-link">Pricing</Link>
            <Link to="/about" className="footer-link">About Us</Link>
            <Link to="/contact" className="footer-link">Contact</Link>
          </div>
          
          <div className="footer-section">
            <h4>Trading</h4>
            <a href="#" className="footer-link">Spot Trading</a>
            <a href="#" className="footer-link">P2P Trading</a>
            <a href="#" className="footer-link">Mining Pool</a>
            <a href="#" className="footer-link">Wallet</a>
          </div>
          
          <div className="footer-section">
            <h4>Support</h4>
            <a href="#" className="footer-link">Help Center</a>
            <a href="#" className="footer-link">API Docs</a>
            <a href="#" className="footer-link">Security</a>
            <a href="#" className="footer-link">Privacy Policy</a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 CryptoTrader. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;