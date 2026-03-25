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
        run your busiiness on autopilot with exora systems
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
            Meet Ghost — The AI That Lives With You.
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
            <motion.button 
              className="hero-btn-download cursor-target"
              onClick={() => {}}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Download</span>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {/* Windows Icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.9 }}>
                  <path d="M3 12V6.75l6-1.313v6.563L3 12zm17-9v8.75l-10 .15V5.21L20 3zM3 13l6 .094v6.563l-6-1.313V13zm17 .25V22l-10-1.8v-7.15l10 .15z"/>
                </svg>
                {/* Mac Icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.9 }}>
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.98 3.24-3.28 1.52-1.05 3.31-.96 4.52-.96 1.21 0 3.01-.13 4.5.98.62.49 1.75 1.85 1.48 3.31-.98 5.22-5.7 10.11-7.73 10.06zm-7.27-18.35c-1.14.13-2.58.88-3.41 2.02-1.47 2.01-1.15 5.54.41 7.35.94 1.08 2.19 1.88 3.59 1.84 1.42-.04 2.93-.84 3.7-1.93 1.39-1.69 1.51-4.26.14-6.01-1.25-1.59-3.26-2.55-4.43-2.27z"/>
                </svg>
                {/* Linux Icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.9 }}>
                  <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.26-.7.69-1.305 1.728-1.1 1.869-2.073 4.1-1.618 6.477.468 2.466 2.348 4.418 4.897 5.145 1.38.395 2.88.4 4.287.018 2.282-.613 4.186-2.343 5.043-4.527.666-1.677.637-3.326.637-3.33 0-.01.017-.016.022-.007.006.008 0 .015-.006.023-.093.112-2.269 2.704-5.268 2.704-2.979 0-4.833-1.94-5.493-2.598a.996.996 0 01-.127-1.232c.017-.03.027-.063.033-.097.14-1.072.785-2.058 1.597-2.915 1.008-1.064 2.32-1.744 3.616-2.25.086-.034.17-.068.253-.1.742-.29 2.03-.73 2.03-1.479 0-.41-.303-.775-.863-1.08-.29-.16-.65-.272-1.06-.333-.897-.135-2.134.018-2.968.59-.28.194-.525.438-.7.734a3.1 3.1 0 00-.193.38c-.002.003 0 .007.003.01a.006.006 0 00.005.002.006.006 0 00.005-.003c.023-.032 1.74-2.436 3.613-2.128 1.694.28 3.003 1.824 3.211 3.52 0 0 .013.095.02.18.003.037.01.074.01.11 0 .05-.005.1-.013.15 0 .006-.003.011 0 .017.002.005.006.008.011.006a.014.014 0 00.008-.013c.033-1.185-.302-2.344-1.004-3.316C15.415 1.178 13.842.075 12.504 0z"/>
                </svg>
              </div>
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

