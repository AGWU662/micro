import React from 'react';
import './Features.css';

const FeaturesPage = () => {
  const features = [
    {
      icon: '⛏️',
      title: 'Cloud Mining Infrastructure',
      description: 'Professional mining hardware hosted in our secure data centers worldwide',
      details: [
        'Latest generation ASIC miners',
        'GPU mining rigs for Ethereum and altcoins',
        'Redundant power systems',
        'Industrial cooling solutions',
        '24/7 monitoring and maintenance'
      ],
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&h=300&fit=crop'
    },
    {
      icon: '🤝',
      title: 'P2P Trading Platform',
      description: 'Trade cryptocurrencies directly with other users in a secure environment',
      details: [
        'Escrow-protected transactions',
        'Multiple payment methods',
        'Global liquidity pool',
        'Real-time dispute resolution',
        'Advanced verification system'
      ],
      image: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=500&h=300&fit=crop'
    },
    {
      icon: '💰',
      title: 'Crypto Loan Services',
      description: 'Get instant loans using your cryptocurrency as collateral',
      details: [
        'Competitive interest rates',
        'No credit checks required',
        'Instant approval process',
        'Flexible repayment terms',
        'Multiple cryptocurrencies accepted'
      ],
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&h=300&fit=crop'
    },
    {
      icon: '📈',
      title: 'Advanced Trading Tools',
      description: 'Professional-grade trading interface with advanced charting',
      details: [
        'Real-time market data',
        'Advanced order types',
        'Technical analysis tools',
        'Portfolio management',
        'Risk management features'
      ],
      image: 'https://images.unsplash.com/photo-1642265606494-04a834b38ce7?w=500&h=300&fit=crop'
    },
    {
      icon: '🔒',
      title: 'Enterprise Security',
      description: 'Military-grade security protecting your digital assets',
      details: [
        'Multi-signature wallets',
        'Cold storage solutions',
        'Two-factor authentication',
        'Regular security audits',
        'Insurance coverage'
      ],
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&h=300&fit=crop'
    },
    {
      icon: '📱',
      title: 'Mobile Application',
      description: 'Manage your mining and trading activities on the go',
      details: [
        'iOS and Android apps',
        'Real-time notifications',
        'Biometric authentication',
        'Offline transaction signing',
        'Push notifications for market changes'
      ],
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=300&fit=crop'
    }
  ];

  const techSpecs = [
    {
      category: 'Mining Hardware',
      specs: [
        'Antminer S19 Pro+ (110 TH/s)',
        'Whatsminer M50S (126 TH/s)',
        'RTX 4090 GPU Rigs',
        'ASIC L7 Litecoin Miners'
      ]
    },
    {
      category: 'Supported Cryptocurrencies',
      specs: [
        'Bitcoin (BTC)',
        'Ethereum (ETH)',
        'Litecoin (LTC)',
        'Bitcoin Cash (BCH)',
        'Dogecoin (DOGE)',
        '50+ Altcoins'
      ]
    },
    {
      category: 'Security Features',
      specs: [
        'Multi-signature wallets',
        'Hardware security modules',
        'End-to-end encryption',
        'Regular penetration testing',
        'Cold storage integration'
      ]
    },
    {
      category: 'Global Infrastructure',
      specs: [
        'Data centers in 12 countries',
        '99.9% uptime guarantee',
        'Renewable energy powered',
        '24/7 technical support',
        'Redundant internet connections'
      ]
    }
  ];

  return (
    <div className="features-page">
      {/* Hero Section */}
      <section className="features-hero">
        <div className="hero-container">
          <h1>Platform Features</h1>
          <p className="hero-subtitle">
            Comprehensive suite of mining, trading, and financial services for the modern crypto investor
          </p>
        </div>
      </section>

      {/* Main Features */}
      <section className="main-features">
        <div className="section-container">
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-image">
                  <img src={feature.image} alt={feature.title} />
                  <div className="feature-overlay">
                    <span className="feature-icon">{feature.icon}</span>
                  </div>
                </div>
                <div className="feature-content">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <ul className="feature-details">
                    {feature.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="tech-specs">
        <div className="section-container">
          <h2>Technical Specifications</h2>
          <div className="specs-grid">
            {techSpecs.map((category, index) => (
              <div key={index} className="spec-category">
                <h3>{category.category}</h3>
                <ul>
                  {category.specs.map((spec, idx) => (
                    <li key={idx}>{spec}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="performance-metrics">
        <div className="section-container">
          <h2>Platform Performance</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">⚡</div>
              <h3>Hash Rate</h3>
              <p className="metric-value">2.5 EH/s</p>
              <span>Total network hash rate</span>
            </div>
            <div className="metric-card">
              <div className="metric-icon">🌍</div>
              <h3>Global Reach</h3>
              <p className="metric-value">150+</p>
              <span>Countries served</span>
            </div>
            <div className="metric-card">
              <div className="metric-icon">⏱️</div>
              <h3>Uptime</h3>
              <p className="metric-value">99.9%</p>
              <span>Platform availability</span>
            </div>
            <div className="metric-card">
              <div className="metric-icon">💰</div>
              <h3>Total Payouts</h3>
              <p className="metric-value">$500M+</p>
              <span>Paid to miners</span>
            </div>
          </div>
        </div>
      </section>

      {/* API & Integration */}
      <section className="api-integration">
        <div className="section-container">
          <div className="api-content">
            <div className="api-text">
              <h2>Developer API & Integration</h2>
              <p>
                Build custom applications and integrate with our platform using our comprehensive REST API. 
                Perfect for institutional clients and advanced users.
              </p>
              <div className="api-features">
                <div className="api-feature">
                  <h4>🔗 RESTful API</h4>
                  <p>Complete access to all platform functions</p>
                </div>
                <div className="api-feature">
                  <h4>📊 Real-time Data</h4>
                  <p>WebSocket feeds for live market data</p>
                </div>
                <div className="api-feature">
                  <h4>🔐 Secure Authentication</h4>
                  <p>API keys and OAuth 2.0 support</p>
                </div>
                <div className="api-feature">
                  <h4>📚 Comprehensive Docs</h4>
                  <p>Detailed documentation and code examples</p>
                </div>
              </div>
              <button className="api-btn">View API Documentation</button>
            </div>
            <div className="api-visual">
              <div className="code-mockup">
                <div className="code-header">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="code-content">
                  <pre>{`{
  "status": "success",
  "data": {
    "mining_stats": {
      "hash_rate": "125.5 TH/s",
      "earnings_today": "0.00142 BTC",
      "efficiency": "98.7%"
    },
    "portfolio": {
      "total_balance": "$12,450.00",
      "btc_balance": "0.4523 BTC"
    }
  }
}`}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="features-cta">
        <div className="section-container">
          <div className="cta-content">
            <h2>Ready to Start Mining?</h2>
            <p>Join thousands of satisfied miners and traders on our platform</p>
            <div className="cta-actions">
              <button className="btn-primary">Start Mining Now</button>
              <button className="btn-secondary">View Pricing Plans</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;