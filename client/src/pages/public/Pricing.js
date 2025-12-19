import React from 'react';
import './Pricing.css';

const Pricing = () => {
  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for beginners exploring crypto mining',
      features: [
        'Basic cloud mining access',
        'Up to $100 monthly mining',
        'Standard mining pools',
        'Email support',
        'Basic wallet features',
        'Mining statistics dashboard'
      ],
      limitations: [
        'Limited to Bitcoin mining only',
        'Standard withdrawal fees',
        'Basic customer support'
      ],
      popular: false,
      buttonText: 'Start Free',
      buttonClass: 'btn-secondary'
    },
    {
      name: 'Professional',
      price: '$49/month',
      description: 'Advanced features for serious miners',
      features: [
        'All Starter features',
        'Up to $2,000 monthly mining',
        'Multi-coin mining (BTC, ETH, LTC)',
        'Priority customer support',
        'Advanced analytics dashboard',
        'P2P trading access',
        'Reduced withdrawal fees',
        'Mining contract customization'
      ],
      limitations: [
        'Limited to 5 concurrent mining contracts',
        'Standard loan interest rates'
      ],
      popular: true,
      buttonText: 'Upgrade to Pro',
      buttonClass: 'btn-primary'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'Unlimited mining power for large operations',
      features: [
        'All Professional features',
        'Unlimited mining capacity',
        'All supported cryptocurrencies',
        'Dedicated account manager',
        'Custom mining contracts',
        'White-label solutions',
        'API access and integration',
        'Institutional-grade security',
        'Crypto loan services',
        'Custom fee structures'
      ],
      limitations: [
        'Requires minimum $10,000 monthly commitment'
      ],
      popular: false,
      buttonText: 'Contact Sales',
      buttonClass: 'btn-secondary'
    }
  ];

  const comparisonFeatures = [
    { feature: 'Cloud Mining Access', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Mining Dashboard', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Bitcoin Mining', starter: '✓', pro: '✓', enterprise: '✓' },
    { feature: 'Altcoin Mining', starter: '✗', pro: '✓', enterprise: '✓' },
    { feature: 'P2P Trading', starter: '✗', pro: '✓', enterprise: '✓' },
    { feature: 'Crypto Loans', starter: '✗', pro: 'Limited', enterprise: '✓' },
    { feature: 'API Access', starter: '✗', pro: '✗', enterprise: '✓' },
    { feature: 'Dedicated Support', starter: '✗', pro: '✗', enterprise: '✓' },
    { feature: 'Custom Contracts', starter: '✗', pro: '✗', enterprise: '✓' },
    { feature: 'White-label Solutions', starter: '✗', pro: '✗', enterprise: '✓' }
  ];

  const faqs = [
    {
      question: 'What is cloud mining?',
      answer: 'Cloud mining allows you to mine cryptocurrencies without owning physical mining hardware. We provide the infrastructure, and you receive the mining rewards.'
    },
    {
      question: 'How do I receive my mining rewards?',
      answer: 'Mining rewards are automatically credited to your account daily. You can withdraw them anytime to your personal wallet or use them for trading.'
    },
    {
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at the next billing cycle.'
    },
    {
      question: 'Is there a minimum mining period?',
      answer: 'No, there are no long-term contracts. You can start and stop mining at any time, though we recommend mining for at least 30 days for optimal returns.'
    },
    {
      question: 'What cryptocurrencies can I mine?',
      answer: 'Starter plan includes Bitcoin only. Professional and Enterprise plans support Bitcoin, Ethereum, Litecoin, and many other cryptocurrencies.'
    },
    {
      question: 'Are there any hidden fees?',
      answer: 'No hidden fees. All costs are transparent. The only additional fees are withdrawal fees, which vary by cryptocurrency and are clearly displayed.'
    }
  ];

  return (
    <div className="pricing-page">
      {/* Hero Section */}
      <section className="pricing-hero">
        <div className="hero-container">
          <h1>Choose Your Mining Plan</h1>
          <p className="hero-subtitle">
            Transparent pricing with no hidden fees. Start mining today and scale as you grow.
          </p>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="pricing-plans">
        <div className="section-container">
          <div className="plans-grid">
            {plans.map((plan, index) => (
              <div key={index} className={`plan-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <div className="popular-badge">Most Popular</div>}
                
                <div className="plan-header">
                  <h3>{plan.name}</h3>
                  <div className="plan-price">
                    <span className="price">{plan.price}</span>
                    {plan.price !== 'Free' && plan.price !== 'Custom' && <span className="period">/month</span>}
                  </div>
                  <p className="plan-description">{plan.description}</p>
                </div>

                <div className="plan-features">
                  <h4>What's Included:</h4>
                  <ul className="features-list">
                    {plan.features.map((feature, idx) => (
                      <li key={idx}>
                        <span className="check-icon">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  {plan.limitations.length > 0 && (
                    <>
                      <h4>Limitations:</h4>
                      <ul className="limitations-list">
                        {plan.limitations.map((limitation, idx) => (
                          <li key={idx}>
                            <span className="limit-icon">⚠️</span>
                            {limitation}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                <button className={`plan-button ${plan.buttonClass}`}>
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="feature-comparison">
        <div className="section-container">
          <h2>Feature Comparison</h2>
          <div className="comparison-table">
            <div className="table-header">
              <div className="feature-col">Features</div>
              <div className="plan-col">Starter</div>
              <div className="plan-col">Professional</div>
              <div className="plan-col">Enterprise</div>
            </div>
            
            {comparisonFeatures.map((item, index) => (
              <div key={index} className="table-row">
                <div className="feature-col">{item.feature}</div>
                <div className={`plan-col ${item.starter === '✓' ? 'included' : 'not-included'}`}>
                  {item.starter}
                </div>
                <div className={`plan-col ${item.pro === '✓' ? 'included' : item.pro === 'Limited' ? 'limited' : 'not-included'}`}>
                  {item.pro}
                </div>
                <div className={`plan-col ${item.enterprise === '✓' ? 'included' : 'not-included'}`}>
                  {item.enterprise}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="roi-calculator">
        <div className="section-container">
          <h2>Mining Profitability Calculator</h2>
          <div className="calculator-container">
            <div className="calculator-inputs">
              <div className="input-group">
                <label>Monthly Investment ($)</label>
                <input type="number" defaultValue="500" min="0" step="100" />
              </div>
              <div className="input-group">
                <label>Mining Duration (months)</label>
                <input type="number" defaultValue="12" min="1" max="60" />
              </div>
              <div className="input-group">
                <label>Cryptocurrency</label>
                <select>
                  <option value="btc">Bitcoin (BTC)</option>
                  <option value="eth">Ethereum (ETH)</option>
                  <option value="ltc">Litecoin (LTC)</option>
                </select>
              </div>
            </div>
            
            <div className="calculator-results">
              <div className="result-card">
                <h4>Projected Monthly Revenue</h4>
                <p className="result-value">$75.00</p>
                <span className="result-note">Based on current difficulty</span>
              </div>
              <div className="result-card">
                <h4>Total Investment</h4>
                <p className="result-value">$6,000</p>
                <span className="result-note">Over 12 months</span>
              </div>
              <div className="result-card">
                <h4>Projected ROI</h4>
                <p className="result-value positive">18.2%</p>
                <span className="result-note">Annual return</span>
              </div>
            </div>
          </div>
          
          <div className="calculator-disclaimer">
            <p><strong>Disclaimer:</strong> These calculations are estimates based on current network conditions. 
            Actual returns may vary due to market volatility, network difficulty changes, and other factors.</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pricing-faq">
        <div className="section-container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <h4>{faq.question}</h4>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pricing-cta">
        <div className="section-container">
          <div className="cta-content">
            <h2>Ready to Start Mining?</h2>
            <p>Join thousands of miners earning passive income with Elite-cloud Mining</p>
            <div className="cta-buttons">
              <button className="btn-primary">Start Free Trial</button>
              <button className="btn-secondary">Schedule Demo</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;