import React from 'react';
import { motion } from 'framer-motion';
import './HeroSection.css';

const HeroSection = ({ onOpenChat, showDashboardButton, onDashboardClick, onOpenWaitlist }) => {
  return (
    <section className="hero-section-new">
      {/* Subtle gradient background */}
      <div className="hero-gradient-bg"></div>
      
      {/* Main Headline - Centered Above */}
      <motion.h1 
        className="hero-main-headline"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        Automate Everything That Slows You Down
      </motion.h1>

      {/* Two Columns - Side by Side */}
      <motion.div 
        className="hero-dual-columns"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Left: Business Automation */}
        <div className="hero-column">
          <h2 className="column-title">For Your Business</h2>
          <p className="column-description">
            AI-driven workflow automation for SMBs and startups. Save hours every day — no code required.
          </p>
          <div className="hero-button-group">
            <motion.button 
              className="hero-btn-primary cursor-target"
              onClick={showDashboardButton ? onDashboardClick : () => window.location.href = '/auth'}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              {showDashboardButton ? 'Go to Dashboard' : 'Get Started'}
            </motion.button>
            <motion.button 
              className="hero-btn-secondary cursor-target"
              onClick={() => window.location.href = '/business-solutions'}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Learn More →
            </motion.button>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hero-vertical-divider"></div>

        {/* Right: Personal AI */}
        <div className="hero-column">
          <h2 className="column-title">For Your Life</h2>
          <p className="column-description">
            OS-level AI agent on your device. Knows your apps, files, and preferences — helps with anything, instantly.
          </p>
          <div className="hero-button-group">
            <motion.button 
              className="hero-btn-primary cursor-target"
              onClick={onOpenWaitlist}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Join the Waitlist
            </motion.button>
            <motion.button 
              className="hero-btn-secondary cursor-target"
              onClick={() => window.location.href = '/personal-ai'}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Learn More →
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Simple scroll indicator */}
      <motion.div 
        className="scroll-indicator-hero"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          y: [0, 8, 0]
        }}
        transition={{
          opacity: { delay: 1, duration: 0.6 },
          y: { 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        <div className="scroll-arrow">↓</div>
        <span>Scroll</span>
      </motion.div>
    </section>
  );
};

export default HeroSection;

