import React from 'react';
import './About.css';

const AboutPage = () => {
  const team = [
    {
      name: 'Alex Johnson',
      role: 'CEO & Founder',
      avatar: '👨‍💼',
      description: '10+ years in fintech and blockchain technology'
    },
    {
      name: 'Sarah Chen',
      role: 'CTO',
      avatar: '👩‍💻',
      description: 'Former senior engineer at major crypto exchanges'
    },
    {
      name: 'Michael Davis',
      role: 'Head of Security',
      avatar: '👨‍🔬',
      description: 'Cybersecurity expert with blockchain specialization'
    },
    {
      name: 'Emma Wilson',
      role: 'Head of Operations',
      avatar: '👩‍💼',
      description: 'Scaling operations for global crypto platforms'
    }
  ];

  const values = [
    {
      icon: '🔒',
      title: 'Security First',
      description: 'Your mining rewards and assets are protected with enterprise-grade security and cold storage solutions.'
    },
    {
      icon: '🌍',
      title: 'Global Mining Network',
      description: 'Distributed mining facilities across multiple continents with 24/7 operations and support.'
    },
    {
      icon: '⚡',
      title: 'High Performance',
      description: 'Latest ASIC and GPU mining hardware with optimal efficiency and maximum profitability.'
    },
    {
      icon: '🤝',
      title: 'Transparent Operations',
      description: 'Real-time mining statistics, transparent fee structure, and honest profit sharing.'
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1>About Elite-cloud Mining</h1>
            <p className="hero-subtitle">
              Empowering miners and traders worldwide with cutting-edge cloud mining, P2P trading, and crypto loan solutions
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission">
        <div className="section-container">
          <div className="mission-content">
            <div className="mission-text">
              <h2>Our Mission</h2>
              <p>
                At Elite-cloud Mining, we believe everyone should have access to professional-grade 
                cloud mining infrastructure and cryptocurrency services. Our mission is to democratize 
                crypto mining by providing enterprise-level mining power, P2P trading, and crypto loans 
                with unmatched security and transparency.
              </p>
              <p>
                Founded in 2020, we've grown from a small mining operation to serving thousands of 
                miners and traders globally. Our commitment to innovation, sustainable mining practices, 
                and customer success drives everything we do.
              </p>
            </div>
            <div className="mission-stats">
              <div className="stat-item">
                <h3>25K+</h3>
                <p>Active Miners</p>
              </div>
              <div className="stat-item">
                <h3>$500M+</h3>
                <p>Mining Volume</p>
              </div>
              <div className="stat-item">
                <h3>99.9%</h3>
                <p>Uptime</p>
              </div>
              <div className="stat-item">
                <h3>150+</h3>
                <p>Countries</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values">
        <div className="section-container">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team">
        <div className="section-container">
          <h2>Meet Our Team</h2>
          <p className="section-subtitle">
            Experienced professionals dedicated to building the future of crypto trading
          </p>
          <div className="team-grid">
            {team.map((member, index) => (
              <div key={index} className="team-card">
                <div className="member-avatar">{member.avatar}</div>
                <h3>{member.name}</h3>
                <p className="member-role">{member.role}</p>
                <p className="member-description">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="timeline">
        <div className="section-container">
          <h2>Our Journey</h2>
          <div className="timeline-container">
            <div className="timeline-item">
              <div className="timeline-year">2020</div>
              <div className="timeline-content">
                <h3>Company Founded</h3>
                <p>CryptoTrader was established with a vision to simplify crypto trading</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">2021</div>
              <div className="timeline-content">
                <h3>Platform Launch</h3>
                <p>Launched our trading platform with advanced security features</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">2022</div>
              <div className="timeline-content">
                <h3>Mining Pool Added</h3>
                <p>Introduced mining pool services and P2P trading features</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">2023</div>
              <div className="timeline-content">
                <h3>Global Expansion</h3>
                <p>Expanded services to 150+ countries with 24/7 support</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">2024</div>
              <div className="timeline-content">
                <h3>Advanced Analytics</h3>
                <p>Launched comprehensive portfolio analytics and mobile app</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="contact-cta">
        <div className="section-container">
          <div className="cta-content">
            <h2>Ready to Join Us?</h2>
            <p>Start your crypto trading journey with CryptoTrader today</p>
            <div className="cta-actions">
              <button className="btn-primary">Get Started</button>
              <button className="btn-secondary">Contact Us</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;