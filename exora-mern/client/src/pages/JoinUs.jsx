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

  const formVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const iconVariants = {
    hover: { 
      scale: 1.1, 
      rotate: 5,
      transition: { duration: 0.3 }
    }
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
              { label: 'Solutions', ariaLabel: 'Solutions', href: '/solutions' }
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
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className="join-title"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join the AI Revolution
          </motion.h1>
          <motion.p 
            className="join-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Get in touch with our team to start your automation journey.
          </motion.p>
        </motion.div>

        {/* Contact Form Section */}
        <motion.div
          className="contact-form-section"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="form-card"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ 
              borderColor: 'rgba(168, 85, 247, 0.4)',
              boxShadow: '0 20px 60px rgba(168, 85, 247, 0.15)'
            }}
          >
            <motion.h2 className="form-title" variants={itemVariants}>
              Get Started Today
            </motion.h2>
            <motion.p className="form-description" variants={itemVariants}>
              Fill out the form below and our team will reach out within 24 hours.
            </motion.p>

            {submitted ? (
              <motion.div 
                className="success-message"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <motion.div 
                  className="success-icon"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  ✓
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Thank you!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  We've received your message and will be in touch soon.
                </motion.p>
              </motion.div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <motion.div className="form-group" variants={itemVariants}>
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
                </motion.div>

                <motion.div className="form-group" variants={itemVariants}>
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
                </motion.div>

                <motion.div className="form-group" variants={itemVariants}>
                  <label htmlFor="company">Company Name</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your Company"
                  />
                </motion.div>

                <motion.div className="form-group" variants={itemVariants}>
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
                </motion.div>

                <motion.button 
                  type="submit" 
                  className="submit-button"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Send Message
                </motion.button>
              </form>
            )}
          </motion.div>
        </motion.div>

        {/* Other Ways to Connect */}
        <motion.div
          className="contact-info-section"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.div 
            className="info-card"
            whileHover={{ 
              borderColor: 'rgba(168, 85, 247, 0.4)',
              boxShadow: '0 20px 60px rgba(168, 85, 247, 0.15)'
            }}
          >
            <motion.h2 
              className="info-title"
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Other Ways to Connect
            </motion.h2>

            <div className="contact-methods-grid">
              <motion.div 
                className="contact-method"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.div 
                  className="method-icon"
                  variants={iconVariants}
                  whileHover="hover"
                >
                  📧
                </motion.div>
                <div className="method-content">
                  <h3>Email Us</h3>
                  <p>hello@exora.ai</p>
                  <p>support@exora.ai</p>
                </div>
              </motion.div>

              <motion.div 
                className="contact-method"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.div 
                  className="method-icon"
                  variants={iconVariants}
                  whileHover="hover"
                >
                  💬
                </motion.div>
                <div className="method-content">
                  <h3>Live Chat</h3>
                  <p>Available Mon-Fri, 9AM-6PM EST</p>
                  <motion.button 
                    className="chat-button" 
                    onClick={() => navigate('/')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start Chat
                  </motion.button>
                </div>
              </motion.div>

              <motion.div 
                className="contact-method"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.div 
                  className="method-icon"
                  variants={iconVariants}
                  whileHover="hover"
                >
                  📞
                </motion.div>
                <div className="method-content">
                  <h3>Schedule a Call</h3>
                  <p>Book a 30-minute consultation</p>
                  <motion.button 
                    className="schedule-button" 
                    onClick={() => navigate('/auth')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Book Now
                  </motion.button>
                </div>
              </motion.div>
            </div>

            <div className="social-links">
              <motion.h3 
                className="social-title"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Follow Us
              </motion.h3>
              <div className="social-icons">
                <motion.a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-icon"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  𝕏
                </motion.a>
                <motion.a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-icon"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  in
                </motion.a>
                <motion.a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-icon"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  gh
                </motion.a>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="quick-start-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ 
              borderColor: 'rgba(168, 85, 247, 0.5)',
              boxShadow: '0 20px 60px rgba(168, 85, 247, 0.2)'
            }}
          >
            <h3 className="quick-start-title">Want to Try It First?</h3>
            <p className="quick-start-text">
              Start with our free trial—no credit card required.
            </p>
            <motion.button 
              className="trial-button" 
              onClick={() => navigate('/auth')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Free Trial
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default JoinUs;
