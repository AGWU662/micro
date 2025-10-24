import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [cryptoPrices, setCryptoPrices] = useState({});

  useEffect(() => {
    // Fetch live crypto prices for display
    const fetchPrices = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/trading/prices');
        if (response.ok) {
          const data = await response.json();
          setCryptoPrices(data.data || {});
        }
      } catch (error) {
        console.log('Could not fetch prices for display');
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: '⛏️',
      title: 'Cloud Mining',
      description: 'Professional cloud mining infrastructure with 99.9% uptime and competitive mining rates for Bitcoin, Ethereum, and more.'
    },
    {
      icon: '🔒',
      title: 'Secure Platform',
      description: 'Enterprise-grade security with multi-signature wallets, cold storage, and advanced encryption protocols.'
    },
    {
      icon: '💰',
      title: 'Crypto Loans',
      description: 'Get instant crypto loans using your digital assets as collateral with competitive interest rates.'
    },
    {
      icon: '🤝',
      title: 'P2P Trading',
      description: 'Direct peer-to-peer cryptocurrency trading with escrow protection and global liquidity.'
    },
    {
      icon: '�',
      title: 'Market Trading',
      description: 'Advanced spot trading with real-time charts, technical indicators, and professional trading tools.'
    },
    {
      icon: '🌍',
      title: 'Global Platform',
      description: '24/7 mining operations and trading access from 150+ countries with multilingual support.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Professional Trader',
      content: 'The best crypto platform I\'ve used. The interface is intuitive and the security features give me peace of mind.',
      avatar: '👩‍💼'
    },
    {
      name: 'Michael Chen',
      role: 'Mining Enthusiast',
      content: 'Mining pool payouts are consistent and the dashboard provides excellent insights into my mining performance.',
      avatar: '👨‍💻'
    },
    {
      name: 'Emma Davis',
      role: 'DeFi Investor',
      content: 'P2P trading feature is game-changing. I can trade directly with other users with complete security.',
      avatar: '👩‍🎓'
    }
  ];

  const partners = [
    { name: 'CoinGecko', logo: '🦎' },
    { name: 'Blockchain.info', logo: '⛓️' },
    { name: 'CryptoCompare', logo: '📈' },
    { name: 'CoinMarketCap', logo: '💹' }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Free',
      features: [
        'Basic trading features',
        'Wallet management',
        'Transaction history',
        'Email support'
      ],
      popular: false
    },
    {
      name: 'Pro',
      price: '$29/month',
      features: [
        'Advanced trading tools',
        'Mining pool access',
        'P2P trading',
        'Priority support',
        'Advanced analytics'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Contact us',
      features: [
        'All Pro features',
        'Dedicated account manager',
        'Custom integrations',
        'White-label solutions',
        'API access'
      ],
      popular: false
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Elite Cloud Mining
              <span className="gradient-text"> & Trading Platform</span>
            </h1>
            <p className="hero-description">
              Join thousands of investors worldwide on our advanced cloud mining platform. 
              Mine cryptocurrencies, trade on P2P markets, get crypto loans, and manage digital assets with enterprise-grade security.
            </p>
            <div className="hero-actions">
              <button 
                className="cta-primary"
                onClick={() => navigate('/register')}
              >
                Start Trading Now
              </button>
              <button 
                className="cta-secondary"
                onClick={() => navigate('/features')}
              >
                Explore Features
              </button>
            </div>
            
            {/* Live Prices Ticker */}
            <div className="price-ticker">
              <h3>Live Prices</h3>
              <div className="price-list">
                {Object.entries(cryptoPrices).slice(0, 4).map(([symbol, price]) => (
                  <div key={symbol} className="price-item">
                    <span className="crypto-symbol">{symbol.toUpperCase()}</span>
                    <span className="crypto-price">${parseFloat(price).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="trading-mockup">
              <div className="mockup-header">
                <div className="mockup-controls">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="mockup-content">
                <div className="chart-area">
                  <div className="chart-placeholder">📈</div>
                  <div className="chart-data">
                    <div className="data-point"></div>
                    <div className="data-point"></div>
                    <div className="data-point"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="section-container">
          <div className="section-header">
            <h2>Powerful Features for Modern Trading</h2>
            <p>Everything you need to succeed in cryptocurrency trading</p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="section-container">
          <div className="section-header">
            <h2>What Our Users Say</h2>
            <p>Join thousands of satisfied traders</p>
          </div>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-content">
                  <p>"{testimonial.content}"</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">{testimonial.avatar}</div>
                  <div className="author-info">
                    <h4>{testimonial.name}</h4>
                    <span>{testimonial.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="partners">
        <div className="section-container">
          <h2>Trusted Partners</h2>
          <div className="partners-grid">
            {partners.map((partner, index) => (
              <div key={index} className="partner-card">
                <div className="partner-logo">{partner.logo}</div>
                <span>{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing">
        <div className="section-container">
          <div className="section-header">
            <h2>Choose Your Plan</h2>
            <p>Start free, upgrade when you need more</p>
          </div>
          
          <div className="pricing-grid">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <div className="popular-badge">Most Popular</div>}
                <h3>{plan.name}</h3>
                <div className="price">{plan.price}</div>
                <ul className="features-list">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex}>✓ {feature}</li>
                  ))}
                </ul>
                <button 
                  className={`plan-btn ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => navigate('/register')}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="section-container">
          <div className="cta-content">
            <h2>Ready to Start Trading?</h2>
            <p>Join our community of successful crypto traders today</p>
            <div className="cta-actions">
              <button 
                className="cta-primary"
                onClick={() => navigate('/register')}
              >
                Create Account
              </button>
              <button 
                className="cta-secondary"
                onClick={() => navigate('/contact')}
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;