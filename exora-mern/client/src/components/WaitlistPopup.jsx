import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config/api';
import './WaitlistPopup.css';

const WaitlistPopup = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+91'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const countryCodes = [
    { code: '+91', country: 'IN' },
    { code: '+1', country: 'US/CA' },
    { code: '+44', country: 'UK' },
    { code: '+61', country: 'AU' },
    { code: '+49', country: 'DE' },
    { code: '+33', country: 'FR' },
    { code: '+81', country: 'JP' },
    { code: '+86', country: 'CN' },
    { code: '+55', country: 'BR' },
    { code: '+7', country: 'RU' },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear message when user types
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/waitlist/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          countryCode: '+91'
        });
        // Close popup after 2 seconds
        setTimeout(() => {
          onClose();
          setMessage({ type: '', text: '' });
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage({ type: 'error', text: 'Failed to join waitlist. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="waitlist-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Popup */}
          <motion.div
            className="waitlist-popup"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              x: '-50%',
              y: '-50%'
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <button className="popup-close" onClick={onClose}>×</button>

            <div className="popup-header">
              <h2 className="popup-title">Join the Waitlist</h2>
              <p className="popup-subtitle">
                Be among the first to experience the future of AI automation
              </p>
            </div>

            <form onSubmit={handleSubmit} className="waitlist-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="John"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Doe"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="john.doe@example.com"
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number (Optional)</label>
                <div className="phone-input-group">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="country-code-select"
                    disabled={isSubmitting}
                  >
                    {countryCodes.map(({ code, country }) => (
                      <option key={code} value={code}>
                        {code} ({country})
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="555-0123"
                    className="phone-input"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {message.text && (
                <motion.div
                  className={`form-message ${message.type}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {message.type === 'success' ? '✓ ' : '⚠ '}
                  {message.text}
                </motion.div>
              )}

              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Joining...' : 'Join the Waitlist'}
              </button>

              <p className="form-note">
                We'll notify you when we launch. No spam, ever.
              </p>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WaitlistPopup;

