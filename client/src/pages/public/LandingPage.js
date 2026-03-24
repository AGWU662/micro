import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [dynamicTestimonials, setDynamicTestimonials] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');

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

  useEffect(() => {
    // Fetch dynamic testimonials from Ollama API
    const fetchDynamicTestimonials = async () => {
      try {
        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama2',
            prompt: `Generate 3 realistic cryptocurrency trading platform testimonials in JSON format. Each should have name, role, content (2-3 sentences), and rating (4-5 stars). Make them diverse and authentic. Response format: [{"name": "...", "role": "...", "content": "...", "rating": 5}]`,
            stream: false
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          try {
            const testimonials = JSON.parse(data.response);
            if (Array.isArray(testimonials)) {
              setDynamicTestimonials(testimonials);
            }
          } catch (parseError) {
            console.log('Could not parse testimonials from Ollama');
          }
        }
      } catch (error) {
        console.log('Could not fetch testimonials from Ollama API');
      }
    };

    fetchDynamicTestimonials();
  }, []);

  // Language detection and auto-switching
  useEffect(() => {
    const detectLanguage = async () => {
      try {
        const userLang = navigator.language || navigator.userLanguage;
        const langCode = userLang.split('-')[0];
        
        if (['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'ru', 'pt', 'ar'].includes(langCode)) {
          setSelectedLanguage(langCode);
        }
      } catch (error) {
        console.log('Language detection failed');
      }
    };

    detectLanguage();
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

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'BTC', name: 'Bitcoin', symbol: '₿' },
    { code: 'ETH', name: 'Ethereum', symbol: 'Ξ' }
  ];

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    try {
      const response = await fetch('http://localhost:5000/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newsletterEmail })
      });

      if (response.ok) {
        alert('Successfully subscribed to newsletter!');
        setNewsletterEmail('');
      } else {
        alert('Subscription failed. Please try again.');
      }
    } catch (error) {
      console.log('Newsletter subscription error:', error);
      alert('Subscription failed. Please try again.');
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      {/* Sticky Navigation */}
      <nav className="sticky-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-icon">⛏️</span>
            <span className="logo-text">Elite Mining</span>
          </div>
          
          <div className="nav-links">
            <button onClick={() => scrollToSection('features')}>Features</button>
            <button onClick={() => scrollToSection('mining-details')}>Mining</button>
            <button onClick={() => scrollToSection('p2p-details')}>P2P Trading</button>
            <button onClick={() => scrollToSection('testimonials')}>Reviews</button>
            <button onClick={() => scrollToSection('pricing')}>Pricing</button>
          </div>

          <div className="nav-controls">
            <div className="language-selector">
              <select 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="selector-dropdown"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="currency-selector">
              <select 
                value={selectedCurrency} 
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="selector-dropdown"
              >
                {currencies.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.code}
                  </option>
                ))}
              </select>
            </div>

            <button 
              className="nav-cta"
              onClick={() => navigate('/register')}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="hero">
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
      <section className="features" id="features">
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

      {/* Mining Details Section */}
      <section className="mining-details" id="mining-details">
        <div className="section-container">
          <div className="details-grid">
            <div className="details-content">
              <h2>Professional Cloud Mining</h2>
              <div className="feature-highlights">
                <div className="highlight-item">
                  <span className="highlight-icon">⚡</span>
                  <div>
                    <h4>99.9% Uptime Guarantee</h4>
                    <p>Enterprise-grade infrastructure with redundant systems</p>
                  </div>
                </div>
                <div className="highlight-item">
                  <span className="highlight-icon">🏭</span>
                  <div>
                    <h4>Industrial Scale Mining</h4>
                    <p>Access to the latest ASIC miners and GPU farms</p>
                  </div>
                </div>
                <div className="highlight-item">
                  <span className="highlight-icon">💰</span>
                  <div>
                    <h4>Daily Payouts</h4>
                    <p>Automatic daily mining rewards directly to your wallet</p>
                  </div>
                </div>
                <div className="highlight-item">
                  <span className="highlight-icon">📊</span>
                  <div>
                    <h4>Real-time Analytics</h4>
                    <p>Track your mining performance with detailed statistics</p>
                  </div>
                </div>
              </div>
              <button 
                className="cta-primary"
                onClick={() => navigate('/register')}
              >
                Start Mining Now
              </button>
            </div>
            <div className="details-visual">
              <div className="mining-animation">
                <div className="mining-rig">
                  <div className="rig-display">⛏️</div>
                  <div className="hash-rate">
                    <span>Mining BTC</span>
                    <div className="rate-display">125.5 TH/s</div>
                  </div>
                  <div className="mining-stats">
                    <div className="stat-item">
                      <span>Power: 3250W</span>
                    </div>
                    <div className="stat-item">
                      <span>Efficiency: 26 J/TH</span>
                    </div>
                    <div className="stat-item">
                      <span>Pool: BTC.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* P2P Trading Details Section */}
      <section className="p2p-details" id="p2p-details">
        <div className="section-container">
          <div className="details-grid reverse">
            <div className="details-visual">
              <div className="p2p-mockup">
                <div className="p2p-header">
                  <h4>P2P Trading</h4>
                  <div className="online-status">🟢 2,847 traders online</div>
                </div>
                <div className="p2p-orders">
                  <div className="order-item">
                    <div className="trader-info">
                      <span className="trader-name">Alex M.</span>
                      <span className="trader-rate">98.5% ⭐</span>
                    </div>
                    <div className="order-details">
                      <span className="amount">Buy BTC</span>
                      <span className="price">$43,250</span>
                    </div>
                  </div>
                  <div className="order-item">
                    <div className="trader-info">
                      <span className="trader-name">Sarah K.</span>
                      <span className="trader-rate">99.2% ⭐</span>
                    </div>
                    <div className="order-details">
                      <span className="amount">Sell ETH</span>
                      <span className="price">$2,680</span>
                    </div>
                  </div>
                  <div className="order-item">
                    <div className="trader-info">
                      <span className="trader-name">Mike R.</span>
                      <span className="trader-rate">97.8% ⭐</span>
                    </div>
                    <div className="order-details">
                      <span className="amount">Buy USDT</span>
                      <span className="price">$1.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="details-content">
              <h2>Secure P2P Trading</h2>
              <div className="feature-highlights">
                <div className="highlight-item">
                  <span className="highlight-icon">🔒</span>
                  <div>
                    <h4>Escrow Protection</h4>
                    <p>Funds held in secure escrow until trade completion</p>
                  </div>
                </div>
                <div className="highlight-item">
                  <span className="highlight-icon">⚡</span>
                  <div>
                    <h4>Instant Settlements</h4>
                    <p>Fast trade execution with automated dispute resolution</p>
                  </div>
                </div>
                <div className="highlight-item">
                  <span className="highlight-icon">🌍</span>
                  <div>
                    <h4>Global Liquidity</h4>
                    <p>Trade with users from 150+ countries worldwide</p>
                  </div>
                </div>
                <div className="highlight-item">
                  <span className="highlight-icon">📱</span>
                  <div>
                    <h4>Mobile Trading</h4>
                    <p>Trade on-the-go with our mobile-optimized platform</p>
                  </div>
                </div>
              </div>
              <button 
                className="cta-primary"
                onClick={() => navigate('/register')}
              >
                Start P2P Trading
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials" id="testimonials">
        <div className="section-container">
          <div className="section-header">
            <h2>What Our Users Say</h2>
            <p>Join thousands of satisfied traders</p>
          </div>
          
          <div className="testimonials-grid">
            {(dynamicTestimonials.length > 0 ? dynamicTestimonials : testimonials).map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-content">
                  <p>"{testimonial.content}"</p>
                  {testimonial.rating && (
                    <div className="testimonial-rating">
                      {'⭐'.repeat(testimonial.rating)}
                    </div>
                  )}
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">{testimonial.avatar || '👤'}</div>
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
      <section className="pricing" id="pricing">
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

      {/* Newsletter Section */}
      <section className="newsletter">
        <div className="section-container">
          <div className="newsletter-content">
            <div className="newsletter-info">
              <h2>Stay Updated</h2>
              <p>Get the latest crypto market insights, mining updates, and platform news delivered to your inbox.</p>
              <div className="newsletter-benefits">
                <div className="benefit-item">
                  <span className="benefit-icon">📈</span>
                  <span>Market Analysis & Trends</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">⛏️</span>
                  <span>Mining Performance Reports</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">🎁</span>
                  <span>Exclusive Offers & Bonuses</span>
                </div>
              </div>
            </div>
            <div className="newsletter-form">
              <form onSubmit={handleNewsletterSubmit}>
                <div className="form-group">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="newsletter-input"
                    required
                  />
                  <button type="submit" className="newsletter-btn">
                    Subscribe
                  </button>
                </div>
                <p className="newsletter-disclaimer">
                  By subscribing, you agree to our privacy policy. Unsubscribe at any time.
                </p>
              </form>
            </div>
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

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-section">
              <div className="footer-logo">
                <span className="logo-icon">⛏️</span>
                <span className="logo-text">Elite Mining</span>
              </div>
              <p>Leading cryptocurrency trading and mining platform with enterprise-grade security and global reach.</p>
              <div className="social-links">
                <a href="#" aria-label="Twitter">🐦</a>
                <a href="#" aria-label="Telegram">✈️</a>
                <a href="#" aria-label="Discord">💬</a>
                <a href="#" aria-label="LinkedIn">💼</a>
              </div>
            </div>

            <div className="footer-section">
              <h4>Platform</h4>
              <ul>
                <li><a href="#" onClick={() => navigate('/trading')}>Trading</a></li>
                <li><a href="#" onClick={() => navigate('/mining')}>Mining</a></li>
                <li><a href="#" onClick={() => navigate('/p2p')}>P2P Trading</a></li>
                <li><a href="#" onClick={() => navigate('/wallet')}>Wallet</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Press Kit</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">API Documentation</a></li>
                <li><a href="#">Security</a></li>
                <li><a href="#">Bug Bounty</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Cookie Policy</a></li>
                <li><a href="#">Compliance</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-info">
              <p>&copy; 2025 Elite Mining Platform. All rights reserved.</p>
              <p>Licensed and regulated in multiple jurisdictions worldwide.</p>
            </div>
            <div className="footer-badges">
              <div className="security-badge">🔒 SSL Secured</div>
              <div className="security-badge">🛡️ Insured</div>
              <div className="security-badge">✅ KYC Compliant</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;