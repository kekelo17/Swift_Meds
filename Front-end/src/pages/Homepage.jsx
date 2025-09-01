import { useState, useEffect } from 'react';
import './CSS/homepage.css';

const Homepage = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="swiftmeds-app">
      <div className="bg-shapes">
        <div className="bg-shape bg-shape-1"></div>
        <div className="bg-shape bg-shape-2"></div>
      </div>

      {/* Header */}
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <nav className="nav">
            <a href="#" className="logo">
              <div className="logo-icon">
                <i className="fas fa-pills"></i>
              </div>
              <span className="logo-text">SwiftMeds</span>
            </a>
            
            <ul className="nav-links">
              <li><a href="#features" className="nav-link">Features</a></li>
              <li><a href="#testimonials" className="nav-link">Reviews</a></li>
              <li><a href="#pricing" className="nav-link">Pricing</a></li>
            </ul>

            <div className="nav-buttons">
              <a href="../auth/signin" className="nav-link">
                <i className="fas fa-sign-in-alt"></i> Sign In
              </a>
              <a href="../auth/signup" className="btn-primary">
                <i className="fas fa-user-plus"></i> Get Started
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="trust-badge">
                <i className="fas fa-star"></i>
                Trusted by 50,000+ users
              </div>
              
              <h1 className="hero-title">
                Your Health,
                <span className="gradient-text">Simplified</span>
              </h1>
              
              <p className="hero-description">
                Revolutionary pharmacy management platform that connects patients, pharmacies, and healthcare providers in one seamless ecosystem.
              </p>
              
              <div className="hero-buttons">
                <a href="#" className="btn-primary">
                  Start Free Trial
                  <i className="fas fa-arrow-right"></i>
                </a>
                <a href="#" className="btn-secondary">
                  <i className="fas fa-play"></i>
                  Watch Demo
                </a>
              </div>

              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="stat-number">50K+</div>
                  <div className="stat-label">Active Users</div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div className="stat-number">1000+</div>
                  <div className="stat-label">Partner Pharmacies</div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div className="stat-number">99.9%</div>
                  <div className="stat-label">Uptime</div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">
                    <i className="fas fa-heart"></i>
                  </div>
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Support</div>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="dashboard-mockup">
                <div className="dashboard-header">
                  <h3 className="dashboard-title">Dashboard</h3>
                  <p className="dashboard-subtitle">Welcome back, Sarah!</p>
                </div>
                
                <div className="dashboard-content">
                  <div className="notification-item">
                    <div className="notification-info">
                      <div className="notification-icon blue">
                        <i className="fas fa-calendar"></i>
                      </div>
                      <div>
                        <div className="notification-title">Prescription Ready</div>
                        <div className="notification-subtitle">CVS Pharmacy - 2:30 PM</div>
                      </div>
                    </div>
                    <div className="status-dot green"></div>
                  </div>
                  
                  <div className="notification-item">
                    <div className="notification-info">
                      <div className="notification-icon yellow">
                        <i className="fas fa-pills"></i>
                      </div>
                      <div>
                        <div className="notification-title">Refill Reminder</div>
                        <div className="notification-subtitle">Due in 3 days</div>
                      </div>
                    </div>
                    <div className="status-dot yellow"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <i className="fas fa-bolt"></i>
              Powerful Features
            </div>
            <h2 className="section-title">
              Everything you need for
              <span className="gradient-text">modern healthcare</span>
            </h2>
            <p className="section-description">
              Discover how SwiftMeds revolutionizes medication management with cutting-edge technology and user-friendly design.
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-pills"></i>
              </div>
              <h3 className="feature-title">Smart Medication Tracking</h3>
              <p className="feature-description">
                AI-powered medication management with automated refill alerts and comprehensive prescription history.
              </p>
              <ul className="benefit-list">
                <li className="benefit-item">
                  <i className="fas fa-check check-icon"></i>
                  Automated refill reminders
                </li>
                <li className="benefit-item">
                  <i className="fas fa-check check-icon"></i>
                  Drug interaction alerts
                </li>
                <li className="benefit-item">
                  <i className="fas fa-check check-icon"></i>
                  Prescription history tracking
                </li>
              </ul>
              <a href="#" className="feature-link">
                Learn more <i className="fas fa-chevron-right"></i>
              </a>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <h3 className="feature-title">Intelligent Pharmacy Network</h3>
              <p className="feature-description">
                Connect with verified pharmacies in real-time, check inventory, and compare prices instantly.
              </p>
              <ul className="benefit-list">
                <li className="benefit-item">
                  <i className="fas fa-check check-icon"></i>
                  Real-time inventory
                </li>
                <li className="benefit-item">
                  <i className="fas fa-check check-icon"></i>
                  Price comparison
                </li>
                <li className="benefit-item">
                  <i className="fas fa-check check-icon"></i>
                  Verified pharmacy network
                </li>
              </ul>
              <a href="#" className="feature-link">
                Learn more <i className="fas fa-chevron-right"></i>
              </a>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <h3 className="feature-title">Advanced Reservation System</h3>
              <p className="feature-description">
                Schedule pickups, receive notifications, and manage appointments with seamless calendar integration.
              </p>
              <ul className="benefit-list">
                <li className="benefit-item">
                  <i className="fas fa-check check-icon"></i>
                  Smart scheduling
                </li>
                <li className="benefit-item">
                  <i className="fas fa-check check-icon"></i>
                  Automated notifications
                </li>
                <li className="benefit-item">
                  <i className="fas fa-check check-icon"></i>
                  Calendar sync integration
                </li>
              </ul>
              <a href="#" className="feature-link">
                Learn more <i className="fas fa-chevron-right"></i>
              </a>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3 className="feature-title">HIPAA Compliant Security</h3>
              <p className="feature-description">
                Enterprise-grade security with end-to-end encryption and full HIPAA compliance for patient data protection.
              </p>
              <ul className="benefit-list">
                <li className="benefit-item">
                  <i className="fas fa-check check-icon"></i>
                  End-to-end encryption
                </li>
                <li className="benefit-item">
                  <i className="fas fa-check check-icon"></i>
                  HIPAA compliant storage
                </li>
                <li className="benefit-item">
                  <i className="fas fa-check check-icon"></i>
                  Multi-factor authentication
                </li>
              </ul>
              <a href="#" className="feature-link">
                Learn more <i className="fas fa-chevron-right"></i>
              </a>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <h3 className="feature-title">Mobile-First Experience</h3>
              <p className="feature-description">
                Native mobile apps with offline capabilities and real-time sync across all your devices.
              </p>
              <ul className="benefit-list">
                <li className="benefit-item">
                  <i className="fas fa-check check-icon"></i>
                  Native iOS & Android apps
                </li>
                <li className="benefit-item">
                  <i className="fas fa-check check-icon"></i>
                  Offline functionality
                </li>
                <li className="benefit-item">
                  <i className="fas fa-check check-icon"></i>
                  Cross-device synchronization
                </li>
              </ul>
              <a href="#" className="feature-link">
                Learn more <i className="fas fa-chevron-right"></i>
              </a>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-chart-bar"></i>
              </div>
              <h3 className="feature-title">Health Analytics Dashboard</h3>
              <p className="feature-description">
                Comprehensive health insights with medication adherence tracking and personalized health reports.
              </p>
              <ul className="benefit-list">
                <li className="benefit-item">
                  <i className="fas fa-check check-icon"></i>
                  Medication adherence tracking
                </li>
                <li className="benefit-item">
                  <i className="fas fa-check check-icon"></i>
                  Health trend analysis
                </li>
                <li className="benefit-item">
                  <i className="fas fa-check check-icon"></i>
                  Personalized insights
                </li>
              </ul>
              <a href="#" className="feature-link">
                Learn more <i className="fas fa-chevron-right"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <i className="fas fa-heart"></i>
              Customer Stories
            </div>
            <h2 className="section-title">
              Loved by patients and healthcare providers
            </h2>
            <p className="section-description">
              Join thousands of satisfied users who have transformed their healthcare experience with SwiftMeds.
            </p>
          </div>
          
          <div className="testimonial-container">
            <div className="rating">
              <i className="fas fa-star star"></i>
              <i className="fas fa-star star"></i>
              <i className="fas fa-star star"></i>
              <i className="fas fa-star star"></i>
              <i className="fas fa-star star"></i>
            </div>
            
            <blockquote className="testimonial-quote">
              "SwiftMeds has completely revolutionized how I manage my family's medications. The automated reminders and pharmacy network integration have saved us countless hours and eliminated missed doses."
            </blockquote>
            
            <div className="testimonial-author">Dr. Sarah Johnson</div>
            <div className="testimonial-role">Family Medicine Physician</div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <i className="fas fa-tag"></i>
              Simple Pricing
            </div>
            <h2 className="section-title">
              Choose the perfect plan for your needs
            </h2>
            <p className="section-description">
              Transparent pricing with no hidden fees. Start free and upgrade as you grow.
            </p>
          </div>

          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-header">
                <h3 className="pricing-title">Basic</h3>
                <div className="pricing-price">
                  <span className="currency">$</span>
                  <span className="amount">0</span>
                  <span className="period">/month</span>
                </div>
                <p className="pricing-description">Perfect for individuals</p>
              </div>
              
              <ul className="pricing-features">
                <li className="pricing-feature">
                  <i className="fas fa-check"></i>
                  Up to 5 medications
                </li>
                <li className="pricing-feature">
                  <i className="fas fa-check"></i>
                  Basic refill reminders
                </li>
                <li className="pricing-feature">
                  <i className="fas fa-check"></i>
                  Pharmacy locator
                </li>
                <li className="pricing-feature">
                  <i className="fas fa-check"></i>
                  Mobile app access
                </li>
              </ul>
              
              <a href="#" className="btn-secondary">Start Free Trial</a>
            </div>

            <div className="pricing-card featured">
              <div className="pricing-badge">Most Popular</div>
              <div className="pricing-header">
                <h3 className="pricing-title">Pro</h3>
                <div className="pricing-price">
                  <span className="currency">$</span>
                  <span className="amount">19</span>
                  <span className="period">/month</span>
                </div>
                <p className="pricing-description">Great for families</p>
              </div>
              
              <ul className="pricing-features">
                <li className="pricing-feature">
                  <i className="fas fa-check"></i>
                  Unlimited medications
                </li>
                <li className="pricing-feature">
                  <i className="fas fa-check"></i>
                  Advanced analytics
                </li>
                <li className="pricing-feature">
                  <i className="fas fa-check"></i>
                  Drug interaction alerts
                </li>
                <li className="pricing-feature">
                  <i className="fas fa-check"></i>
                  Priority support
                </li>
                <li className="pricing-feature">
                  <i className="fas fa-check"></i>
                  Family management
                </li>
              </ul>
              
              <a href="#" className="btn-primary">Get Started</a>
            </div>

            <div className="pricing-card">
              <div className="pricing-header">
                <h3 className="pricing-title">Enterprise</h3>
                <div className="pricing-price">
                  <span className="amount">Custom</span>
                </div>
                <p className="pricing-description">For healthcare providers</p>
              </div>
              
              <ul className="pricing-features">
                <li className="pricing-feature">
                  <i className="fas fa-check"></i>
                  Custom integration
                </li>
                <li className="pricing-feature">
                  <i className="fas fa-check"></i>
                  Advanced security
                </li>
                <li className="pricing-feature">
                  <i className="fas fa-check"></i>
                  Dedicated support
                </li>
                <li className="pricing-feature">
                  <i className="fas fa-check"></i>
                  Custom reporting
                </li>
                <li className="pricing-feature">
                  <i className="fas fa-check"></i>
                  API access
                </li>
              </ul>
              
              <a href="#" className="btn-secondary">Contact Sales</a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Ready to transform your healthcare experience?
            </h2>
            <p className="section-description">
              Join thousands of users who trust SwiftMeds for their medication management needs.
            </p>
          </div>
          
          <div className="cta-buttons">
            <a href="#" className="btn-primary">
              Start Free Trial
              <i className="fas fa-arrow-right"></i>
            </a>
            <a href="#" className="btn-secondary">
              <i className="fas fa-phone"></i>
              Schedule Demo
            </a>
          </div>

          <div className="trust-indicators">
            <div className="trust-item">
              <i className="fas fa-shield-alt"></i>
              HIPAA Compliant
            </div>
            <div className="trust-item">
              <i className="fas fa-lock"></i>
              256-bit SSL Encryption
            </div>
            <div className="trust-item">
              <i className="fas fa-award"></i>
              SOC 2 Certified
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-column">
              <div className="footer-brand">
                <div className="logo-icon">
                  <i className="fas fa-pills"></i>
                </div>
                <span className="logo-text">SwiftMeds</span>
              </div>
              <p className="footer-description">
                Revolutionary pharmacy management platform connecting patients, pharmacies, and healthcare providers.
              </p>
            </div>

            <div className="footer-column">
              <h4 className="footer-title">Product</h4>
              <ul className="footer-links">
                <li><a href="#" className="footer-link">Features</a></li>
                <li><a href="#" className="footer-link">Pricing</a></li>
                <li><a href="#" className="footer-link">API</a></li>
                <li><a href="#" className="footer-link">Integrations</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-title">Company</h4>
              <ul className="footer-links">
                <li><a href="#" className="footer-link">About</a></li>
                <li><a href="#" className="footer-link">Careers</a></li>
                <li><a href="#" className="footer-link">Press</a></li>
                <li><a href="#" className="footer-link">Contact</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-title">Support</h4>
              <ul className="footer-links">
                <li><a href="#" className="footer-link">Help Center</a></li>
                <li><a href="#" className="footer-link">Privacy Policy</a></li>
                <li><a href="#" className="footer-link">Terms of Service</a></li>
                <li><a href="#" className="footer-link">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-copyright">
              © 2024 SwiftMeds. All rights reserved.
            </div>
            <div className="footer-meta">
              Built with care for better healthcare
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;