import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './JoinUs.css';
import Particles from '../components/Particles';
import CardNav from '../components/CardNav';

const JoinUs = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', company: '', message: '' });
    }, 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="join-page">
      <Particles
        particleColors={['#c084fc', '#a855f7', '#7c3aed']}
        particleCount={150}
        particleSpread={8}
        speed={0.04}
        particleBaseSize={60}
      />

      <CardNav
        items={[
          { 
            label: 'About', 
            bgColor: '#0D0716', 
            textColor: '#fff', 
            links: [
              { label: 'About', ariaLabel: 'About page', href: '/about' },
              { label: 'Company', ariaLabel: 'Company info', href: '/about#company' }
            ]
          },
          { 
            label: 'Products', 
            bgColor: '#170D27', 
            textColor: '#fff', 
            links: [
              { label: 'Products', ariaLabel: 'Products page', href: '/products' },
              { label: 'Solutions', ariaLabel: 'Solutions', href: '/products#solutions' }
            ]
          },
          { 
            label: 'Join us', 
            bgColor: '#271E37', 
            textColor: '#fff', 
            links: [
              { label: 'Join', ariaLabel: 'Join page', href: '/join' },
              { label: 'Contact', ariaLabel: 'Contact us', href: '/join#contact' }
            ]
          }
        ]}
      />

      <div className="join-container">
        <motion.div
          className="join-hero"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="join-title">Join the AI Revolution</h1>
          <p className="join-subtitle">
            Get in touch with our team to start your automation journey.
          </p>
        </motion.div>

        <div className="join-content">
          <motion.div
            className="contact-form-section"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="form-card">
              <h2 className="form-title">Get Started Today</h2>
              <p className="form-description">
                Fill out the form below and our team will reach out within 24 hours.
              </p>

              {submitted ? (
                <div className="success-message">
                  <div className="success-icon">✓</div>
                  <h3>Thank you!</h3>
                  <p>We've received your message and will be in touch soon.</p>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
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
                      placeholder="john@company.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="company">Company Name</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Your Company"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">How can we help? *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      placeholder="Tell us about your automation needs..."
                    ></textarea>
                  </div>

                  <button type="submit" className="submit-button">
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </motion.div>

          <motion.div
            className="contact-info-section"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="info-card">
              <h2 className="info-title">Other Ways to Connect</h2>

              <div className="contact-method">
                <div className="method-icon">📧</div>
                <div className="method-content">
                  <h3>Email Us</h3>
                  <p>hello@exora.ai</p>
                  <p>support@exora.ai</p>
                </div>
              </div>

              <div className="contact-method">
                <div className="method-icon">💬</div>
                <div className="method-content">
                  <h3>Live Chat</h3>
                  <p>Available Mon-Fri, 9AM-6PM EST</p>
                  <button className="chat-button" onClick={() => navigate('/')}>
                    Start Chat
                  </button>
                </div>
              </div>

              <div className="contact-method">
                <div className="method-icon">📞</div>
                <div className="method-content">
                  <h3>Schedule a Call</h3>
                  <p>Book a 30-minute consultation</p>
                  <button className="schedule-button" onClick={() => navigate('/auth')}>
                    Book Now
                  </button>
                </div>
              </div>

              <div className="social-links">
                <h3 className="social-title">Follow Us</h3>
                <div className="social-icons">
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                    𝕏
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                    in
                  </a>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                    gh
                  </a>
                </div>
              </div>
            </div>

            <div className="quick-start-card">
              <h3 className="quick-start-title">Want to Try It First?</h3>
              <p className="quick-start-text">
                Start with our free trial—no credit card required.
              </p>
              <button className="trial-button" onClick={() => navigate('/auth')}>
                Start Free Trial
              </button>
            </div>
          </motion.div>
        </div>

        <motion.section
          className="faq-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="faq-title">Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3 className="faq-question">How quickly can I get started?</h3>
              <p className="faq-answer">
                Most customers are up and running within 48 hours. Our team handles the setup—you just provide the requirements.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Do you offer custom solutions?</h3>
              <p className="faq-answer">
                Absolutely! Our Enterprise plan includes custom agent development tailored to your specific workflows.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">What kind of support do you provide?</h3>
              <p className="faq-answer">
                We offer 24/7 email support, priority Slack channels for Pro+ customers, and dedicated account managers for Enterprise.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Is my data secure?</h3>
              <p className="faq-answer">
                Yes. We're SOC 2 Type II certified, GDPR compliant, and offer private cloud deployments for sensitive data.
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default JoinUs;


