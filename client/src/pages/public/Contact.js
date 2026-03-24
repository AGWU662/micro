import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    department: 'general'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const contactInfo = [
    {
      icon: '📧',
      title: 'Email Support',
      content: 'support@coinscloud.net',
      description: 'Get help with your account and mining operations',
      available: '24/7 Support'
    },
    {
      icon: '📞',
      title: 'Phone Support',
      content: '+1 (555) 123-4567',
      description: 'Speak directly with our mining experts',
      available: 'Mon-Fri 9AM-6PM EST'
    },
    {
      icon: '💬',
      title: 'Live Chat',
      content: 'Chat with us now',
      description: 'Instant support for urgent questions',
      available: 'Online now'
    },
    {
      icon: '🏢',
      title: 'Business Inquiries',
      content: 'business@coinscloud.net',
      description: 'Enterprise solutions and partnerships',
      available: 'Mon-Fri 9AM-5PM EST'
    }
  ];

  const departments = [
    { value: 'general', label: 'General Support' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'business', label: 'Business Inquiries' },
    { value: 'partnership', label: 'Partnerships' },
    { value: 'media', label: 'Media & Press' }
  ];

  const faqs = [
    {
      question: 'How quickly do you respond to support requests?',
      answer: 'We typically respond to email inquiries within 2-4 hours during business hours and within 24 hours during weekends and holidays.'
    },
    {
      question: 'Do you offer phone support for all customers?',
      answer: 'Phone support is available for Professional and Enterprise plan customers. Starter plan users can access email and live chat support.'
    },
    {
      question: 'Can I schedule a call with your team?',
      answer: 'Yes! Enterprise customers and prospective business clients can schedule calls with our dedicated account managers.'
    },
    {
      question: 'Is there a knowledge base or help center?',
      answer: 'Yes, we maintain a comprehensive help center with tutorials, guides, and troubleshooting information accessible from your dashboard.'
    }
  ];

  const offices = [
    {
      city: 'New York',
      address: '123 Mining Plaza, Suite 500',
      cityState: 'New York, NY 10001',
      phone: '+1 (555) 123-4567',
      email: 'ny@coinscloud.net'
    },
    {
      city: 'San Francisco',
      address: '456 Crypto Street, Floor 12',
      cityState: 'San Francisco, CA 94105',
      phone: '+1 (555) 234-5678',
      email: 'sf@coinscloud.net'
    },
    {
      city: 'London',
      address: '789 Blockchain Avenue',
      cityState: 'London, UK EC1A 1BB',
      phone: '+44 20 7123 4567',
      email: 'london@coinscloud.net'
    }
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="hero-container">
          <h1>Get in Touch</h1>
          <p className="hero-subtitle">
            Have questions about cloud mining? Our expert team is here to help you succeed.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="contact-methods">
        <div className="section-container">
          <h2>How Can We Help You?</h2>
          <div className="contact-grid">
            {contactInfo.map((contact, index) => (
              <div key={index} className="contact-card">
                <div className="contact-icon">{contact.icon}</div>
                <h3>{contact.title}</h3>
                <p className="contact-content">{contact.content}</p>
                <p className="contact-description">{contact.description}</p>
                <span className="availability">{contact.available}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="contact-form-section">
        <div className="section-container">
          <div className="form-container">
            <div className="form-header">
              <h2>Send us a Message</h2>
              <p>Fill out the form below and we'll get back to you as soon as possible.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    {departments.map((dept) => (
                      <option key={dept.value} value={dept.value}>
                        {dept.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Brief description of your inquiry"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Please provide details about your inquiry..."
                ></textarea>
              </div>

              <button type="submit" className="submit-button">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="office-locations">
        <div className="section-container">
          <h2>Our Global Offices</h2>
          <div className="offices-grid">
            {offices.map((office, index) => (
              <div key={index} className="office-card">
                <h3>{office.city}</h3>
                <div className="office-details">
                  <p className="address">
                    <span className="icon">📍</span>
                    {office.address}<br />
                    {office.cityState}
                  </p>
                  <p className="phone">
                    <span className="icon">📞</span>
                    {office.phone}
                  </p>
                  <p className="email">
                    <span className="icon">📧</span>
                    {office.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="contact-faq">
        <div className="section-container">
          <h2>Support FAQ</h2>
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

      {/* Emergency Support */}
      <section className="emergency-support">
        <div className="section-container">
          <div className="emergency-card">
            <h3>🚨 Emergency Support</h3>
            <p>
              If you're experiencing critical issues with your mining operations or account security,
              please contact our emergency support line immediately.
            </p>
            <div className="emergency-contact">
              <strong>Emergency Hotline: +1 (555) 911-MINE</strong>
              <span>Available 24/7 for critical issues only</span>
            </div>
          </div>
        </div>
      </section>

      {/* Business Hours */}
      <section className="business-hours">
        <div className="section-container">
          <h2>Support Hours</h2>
          <div className="hours-grid">
            <div className="hours-card">
              <h4>🌍 24/7 Support</h4>
              <ul>
                <li>Live Chat Support</li>
                <li>Emergency Hotline</li>
                <li>System Monitoring</li>
                <li>Critical Issue Response</li>
              </ul>
            </div>
            <div className="hours-card">
              <h4>📞 Phone Support</h4>
              <ul>
                <li>Monday - Friday: 9:00 AM - 6:00 PM EST</li>
                <li>Saturday: 10:00 AM - 4:00 PM EST</li>
                <li>Sunday: Closed (Emergency only)</li>
                <li>Holiday Schedule may vary</li>
              </ul>
            </div>
            <div className="hours-card">
              <h4>💼 Business Inquiries</h4>
              <ul>
                <li>Monday - Friday: 9:00 AM - 5:00 PM EST</li>
                <li>Partnership meetings by appointment</li>
                <li>Enterprise demos available daily</li>
                <li>International calls welcomed</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;