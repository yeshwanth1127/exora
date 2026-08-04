import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, MessageSquare, Phone, Check } from 'lucide-react';
import { FiInstagram, FiLinkedin } from 'react-icons/fi';
import './Contact.css';
import CardNav from '../components/CardNav';
import SeeHowItWorksButton from '../components/SeeHowItWorksButton';
const CARD_NAV_ITEMS = [
  { label: 'About', bgColor: '#0D0716', textColor: '#fff', links: [{ label: 'About', ariaLabel: 'About page', href: '/about' }, { label: 'Career', ariaLabel: 'Career info', href: '/career' }] },
  { label: 'Products', bgColor: '#170D27', textColor: '#fff', links: [{ label: 'Products', ariaLabel: 'Products page', href: '/products' }, { label: 'Solutions', ariaLabel: 'Solutions', href: '/solutions' }] },
  { label: 'Contact', bgColor: '#271E37', textColor: '#fff', links: [{ label: 'Contact', ariaLabel: 'Contact us', href: '/contact#contact' }] },
];

const Contact = () => {
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
      <CardNav items={CARD_NAV_ITEMS} baseColor="rgba(255,255,255,0.08)" menuColor="#fff" buttonBgColor="rgba(17,17,17,0.75)" buttonTextColor="#fff" ease="power3.out" />

      <div className="contact-container">
        <motion.div
          className="contact-hero"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className="contact-title"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Get in Touch
          </motion.h1>
          <motion.p 
            className="contact-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Have questions? Our team is here to help you transform your business with AI.
          </motion.p>
          <SeeHowItWorksButton />
        </motion.div>

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
            <motion.div className="bot-header-container" variants={itemVariants}>
              <div className="bot-header-content">
                <div className="form-text-column">
                  <motion.h2 className="form-title">
                    Get Started Today
                  </motion.h2>
                  <motion.p className="form-description">
                    Fill out the form below and our team will reach out within 24 hours.
                  </motion.p>
                </div>
                <div className="ira-bot-small-wrapper">
                  <span className="ira-bot-name">IRA</span>
                  <img src="/ira-bot.png" alt="IRA Bot" className="ira-bot-img" />
                </div>
              </div>
            </motion.div>

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
                  <Check size={24} color="#fff" />
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
                  <span className="cta-dot-pulsing" />
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
          <div id="contact" style={{ background: '#0e0d1a', borderRadius: '16px', padding: '2rem 2rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '500', textAlign: 'center', margin: '0 0 2rem' }}>Other ways to connect</h2>

            <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)' }}>

              {/* Email */}
              <div 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 0', borderBottom: '0.5px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'background 0.2s' }} 
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} 
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                onClick={() => window.location.href = 'mailto:support@exora.solutions'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '0.5px solid rgba(127,119,221,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={16} color="#7F77DD" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: '500', color: '#fff' }}>Email us</p>
                    <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>support@exora.solutions</p>
                  </div>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '18px' }}>›</span>
              </div>

              {/* Live Chat */}
              <div 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 0', borderBottom: '0.5px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'background 0.2s' }} 
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} 
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                onClick={() => navigate('/')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '0.5px solid rgba(127,119,221,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MessageSquare size={16} color="#7F77DD" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: '500', color: '#fff' }}>Live chat</p>
                    <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>Mon–Fri, 9AM–6PM EST</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', background: 'rgba(29,158,117,0.15)', color: '#5DCAA5', padding: '4px 12px', borderRadius: '999px' }}>Online now</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '18px' }}>›</span>
                </div>
              </div>

              {/* Schedule */}
              <div 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 0', cursor: 'pointer', transition: 'background 0.2s' }} 
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} 
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                onClick={() => navigate('/auth')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '0.5px solid rgba(127,119,221,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={16} color="#7F77DD" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: '500', color: '#fff' }}>Schedule a call</p>
                    <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>Book a 30-minute consultation</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', background: 'rgba(127,119,221,0.15)', color: '#AFA9EC', padding: '4px 12px', borderRadius: '999px' }}>30 min</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '18px' }}>›</span>
                </div>
              </div>
            </div>

            <div className="social-links" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '0.5px solid rgba(255,255,255,0.1)' }}>
              <motion.h3 
                className="social-title"
                style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', fontWeight: '500', marginBottom: '1rem', textAlign: 'center' }}
              >
                Follow Us
              </motion.h3>
              <div className="social-icons" style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <motion.a 
                  href="https://www.instagram.com/exora.autopilot?igsh=NThjYXB5OGQ5ZHRv" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-icon"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiInstagram size={20} color="rgba(255,255,255,0.6)" />
                </motion.a>
                <motion.a 
                  href="https://www.linkedin.com/company/exora_solutions/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-icon"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiLinkedin size={20} color="rgba(255,255,255,0.6)" />
                </motion.a>
              </div>
            </div>
          </div>


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
              <span className="cta-dot-pulsing" />
              Start Free Trial
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
