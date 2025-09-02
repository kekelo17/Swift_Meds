import React, { useState, useEffect } from 'react';
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
              <li><a href="#home" className="nav-link">Home</a></li>
              <li><a href="#about" className="nav-link">About</a></li>
              <li><a href="#services" className="nav-link">Services</a></li>
              <li><a href="#contact" className="nav-link">Contact</a></li>
            </ul>

            <div className="nav-buttons">
              <a href="../auth/signin" className="btn-signin">Sign In</a>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                The Future of Healthcare
                <span className="hero-subtitle">with Latest Technology</span>
              </h1>
              <p className="hero-description">
                Expert tech to elevate your medication. Let's take your business further.
              </p>
              <div className="hero-buttons">
                <a href="../auth/signup" className="btn-primary">Get Started</a>
                <a href="#" className="btn-secondary">Try Demo</a>
              </div>
              <div className="hero-rating">
                <div className="stars">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <span className="rating-text">4.8</span>
                </div>
                <p className="rating-description">5K+ reviews</p>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-cards">
                <div className="stat-card large">
                  <div className="stat-visual">
                    <div className="pills-visual">
                      <div className="pill pill-1"></div>
                      <div className="pill pill-2"></div>
                      <div className="pill pill-3"></div>
                      <div className="pill pill-4"></div>
                    </div>
                  </div>
                </div>

                <div className="stat-card dark">
                  <div className="stat-number">100+</div>
                  <div className="stat-label">
                    <span>Pharmacies</span>
                    <span>Connected</span>
                  </div>
                  <div className="stat-trend">
                    <i className="fas fa-arrow-up"></i>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-info">
                    <div className="stat-icon">
                      <i className="fas fa-calendar"></i>
                    </div>
                    <div>
                      <div className="stat-number">1951+</div>
                      <div className="stat-desc">Appointments Scheduled</div>
                    </div>
                  </div>
                  <div className="chart-mini">
                    <div className="chart-bar"></div>
                    <div className="chart-bar"></div>
                    <div className="chart-bar"></div>
                  </div>
                </div>

                <div className="stat-card success">
                  <div className="success-number">6+</div>
                  <div className="success-label">
                    <span>Years of</span>
                    <span>Experience</span>
                  </div>
                </div>

                <div className="stat-card premium">
                  <div className="premium-icon">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <div className="premium-text">
                    <span>HIPAA Compliant</span>
                    <span>Security & Performance</span>
                    <span>Guaranteed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services" id="services">
        <div className="container">
          <div className="services-header">
            <h2 className="section-title">
              Efficient and Integrated
              <span>Healthcare Services</span>
            </h2>
            <p className="section-description">
              Simply operations with our AI-driven, quality-focused services
            </p>
          </div>

          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-cogs"></i>
              </div>
              <h3 className="service-title">Prescription Management</h3>
              <p className="service-description">
                Automated prescription processing with real-time inventory management and delivery.
              </p>
              <a href="#" className="service-link">
                <i className="fas fa-arrow-right"></i>
              </a>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-palette"></i>
              </div>
              <h3 className="service-title">Custom Healthcare Solutions</h3>
              <p className="service-description">
                Lorem ipsum dolor sit amet and consectetur adipiscing elit velit.
              </p>
              <a href="#" className="service-link">
                <i className="fas fa-arrow-right"></i>
              </a>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3 className="service-title">Quality Control</h3>
              <p className="service-description">
                Procedures and systems in place to ensure medication safety and efficacy.
              </p>
              <a href="#" className="service-link">
                <i className="fas fa-arrow-right"></i>
              </a>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-lightbulb"></i>
              </div>
              <h3 className="service-title">Technology and Innovation</h3>
              <p className="service-description">
                Staying on the latest trends with delivering technology driven outcomes.
              </p>
              <a href="#" className="service-link">
                <i className="fas fa-arrow-right"></i>
              </a>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-refresh"></i>
              </div>
              <h3 className="service-title">Packaging and Logistics</h3>
              <p className="service-description">
                Packaging and logistics for shipping to anywhere in the nation!
              </p>
              <a href="#" className="service-link">
                <i className="fas fa-arrow-right"></i>
              </a>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="service-title">Consulting Market Research</h3>
              <p className="service-description">
                Services to help companies understand market needs and user behaviors.
              </p>
              <a href="#" className="service-link">
                <i className="fas fa-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <div className="container">
          <div className="benefits-content">
            <div className="benefits-visual">
              <div className="chart-container">
                <div className="chart-header">
                  <h4>User Progress</h4>
                  <span className="chart-period">MAY - JUN</span>
                </div>
                <div className="chart-stats">
                  <div className="chart-bars">
                    <div className="bar bar-1"></div>
                    <div className="bar bar-2"></div>
                    <div className="bar bar-3"></div>
                    <div className="bar bar-4"></div>
                    <div className="bar bar-5"></div>
                  </div>
                  <div className="chart-growth">
                    <div className="growth-indicator">
                      <i className="fas fa-arrow-up"></i>
                      <span>1951+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="benefits-text">
              <h2 className="section-title">
                Key Benefits of Our System for
                <span>Your Business Efficiency</span>
              </h2>
              <p className="section-description">
                Our system ensures productivity, continuity, and faster service
              </p>

              <div className="benefits-list">
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <i className="fas fa-check"></i>
                  </div>
                  <div className="benefit-content">
                    <h4>Boosting Quality with Tech</h4>
                    <p>Streamlines med systems with advanced AI that automatically checks for drug interactions.</p>
                  </div>
                </div>

                <div className="benefit-item">
                  <div className="benefit-icon">
                    <i className="fas fa-check"></i>
                  </div>
                  <div className="benefit-content">
                    <h4>Optimization Production Process</h4>
                    <p>Our system helps reduce waste and improve quality through smart analytics and reporting.</p>
                  </div>
                </div>

                <div className="benefit-item">
                  <div className="benefit-icon">
                    <i className="fas fa-check"></i>
                  </div>
                  <div className="benefit-content">
                    <h4>AI-Driven Production</h4>
                    <p>Reducing risks and errors efficiency using AI algorithms that optimize medication delivery.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing" id="pricing">
        <div className="container">
          <div className="pricing-header">
            <h2 className="section-title">
              Tailored Plans for Your
              <span>Healthcare Scale</span>
            </h2>
            <p className="section-description">
              Choose the plan that fits your needs perfectly
            </p>
          </div>

          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-header-card">
                <h3 className="pricing-title">Starter</h3>
                <p className="pricing-description">
                  The perfect way to get started and take yourself to the next level.
                </p>
                <div className="pricing-price">
                  <span className="currency">$</span>
                  <span className="amount">39</span>
                  <span className="period">/month</span>
                </div>
                <a href="../auth/signup" className="btn-outline">Get Started</a>
              </div>
              
              <div className="pricing-features">
                <h4>Features</h4>
                <ul>
                  <li><i className="fas fa-check"></i> Professional up to 15 Network per month</li>
                  <li><i className="fas fa-check"></i> API Technical Support</li>
                  <li><i className="fas fa-check"></i> Advance Analytics</li>
                  <li><i className="fas fa-check"></i> Email onling guide</li>
                </ul>
              </div>
            </div>

            <div className="pricing-card">
              <div className="pricing-header-card">
                <h3 className="pricing-title">Enterprise</h3>
                <p className="pricing-description">
                  The perfect way to take your pharmacy to an enterprise level organization.
                </p>
                <div className="pricing-price">
                  <span className="currency">$</span>
                  <span className="amount">99</span>
                  <span className="period">/month</span>
                </div>
                <a href="../auth/signup" className="btn-outline">Get Started</a>
              </div>
              
              <div className="pricing-features">
                <h4>Features</h4>
                <ul>
                  <li><i className="fas fa-check"></i> Unlimited pharmaceutical</li>
                  <li><i className="fas fa-check"></i> Advance technical support</li>
                  <li><i className="fas fa-check"></i> Advance Analytics</li>
                  <li><i className="fas fa-check"></i> Business production optimization</li>
                </ul>
              </div>
            </div>

            <div className="pricing-card featured">
              <div className="pricing-header-card">
                <h3 className="pricing-title">Professional</h3>
                <p className="pricing-description">
                  Designed for professional scale healthcare providing team to better efficiency.
                </p>
                <a href="../auth/signup" className="btn-primary">Get Started</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="integration">
        <div className="container">
          <div className="integration-content">
            <div className="integration-text">
              <h2 className="section-title">
                Empowering Top Companies
                <span>with Seamless Integrations</span>
              </h2>
              <p className="section-description">
                Our unified platform is crafted to streamline operations, reduce costs, enhance efficiency, and promote sustainable practices across various business functions.
              </p>
              <a href="#" className="btn-primary">Start With Us</a>
            </div>

            <div className="integration-visual">
              <div className="integration-map">
                <div className="integration-point point-1">
                  <div className="point-icon">
                    <i className="fas fa-hospital"></i>
                  </div>
                </div>
                <div className="integration-point point-2">
                  <div className="point-icon">
                    <i className="fas fa-pills"></i>
                  </div>
                </div>
                <div className="integration-point point-3">
                  <div className="point-icon">
                    <i className="fas fa-user-md"></i>
                  </div>
                </div>
                <div className="integration-point point-4">
                  <div className="point-icon">
                    <i className="fas fa-ambulance"></i>
                  </div>
                </div>
                <div className="integration-point point-5">
                  <div className="point-icon">
                    <i className="fas fa-heartbeat"></i>
                  </div>
                </div>
                <div className="integration-lines">
                  <svg width="100%" height="100%" viewBox="0 0 400 300">
                    <path d="M100,100 Q200,50 300,100" stroke="#10b981" strokeWidth="2" fill="none" opacity="0.6"/>
                    <path d="M100,150 Q200,100 300,150" stroke="#10b981" strokeWidth="2" fill="none" opacity="0.6"/>
                    <path d="M150,200 Q200,150 250,200" stroke="#10b981" strokeWidth="2" fill="none" opacity="0.6"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">From Idea to Production in Days</h2>
            <p className="cta-description">
              Contact us today to discover how our technology can transform your healthcare delivery approach.
            </p>
            <a href="#" className="btn-primary">Work With Us</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-main">
              <div className="footer-brand">
                <div className="logo">
                  <div className="logo-icon">
                    <i className="fas fa-pills"></i>
                  </div>
                  <span className="logo-text">SwiftMeds</span>
                </div>
                <p className="footer-description">
                  Our automated cloud distribution platform allows brands and retailers to accelerate their digital transformation.
                </p>
              </div>

              <div className="footer-links">
                <div className="footer-column">
                  <h4>Company</h4>
                  <ul>
                    <li><a href="#">About Us</a></li>
                    <li><a href="#">Leadership</a></li>
                    <li><a href="#">Careers</a></li>
                    <li><a href="#">News</a></li>
                  </ul>
                </div>

                <div className="footer-column">
                  <h4>Industries</h4>
                  <ul>
                    <li><a href="#">Precision Manufacturing</a></li>
                    <li><a href="#">Food and Beverage</a></li>
                    <li><a href="#">Automotive</a></li>
                    <li><a href="#">Aerospace</a></li>
                  </ul>
                </div>

                <div className="footer-column">
                  <h4>Products</h4>
                  <ul>
                    <li><a href="#">Manufacturing Execution Systems</a></li>
                    <li><a href="#">SCADA Solutions</a></li>
                    <li><a href="#">Quality Management</a></li>
                    <li><a href="#">Supply Chain Planning</a></li>
                  </ul>
                </div>

                <div className="footer-column">
                  <h4>Get In Touch</h4>
                  <div className="contact-info">
                    <p>Near Lycée Anguisa, Yaoundé<br/>Cameroon</p>
                    <p>All Days - 10am to 6pm</p>
                    <div className="social-links">
                      <a href="#"><i className="fab fa-linkedin"></i></a>
                      <a href="#"><i className="fab fa-twitter"></i></a>
                      <a href="#"><i className="fab fa-facebook"></i></a>
                      <a href="#"><i className="fab fa-instagram"></i></a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="footer-bottom">
              <div className="footer-legal">
                <p>&copy; 2024 SwiftMeds. All rights reserved.</p>
                <div className="footer-legal-links">
                  <a href="#">Terms & Conditions</a>
                  <a href="#">Privacy Policy</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;