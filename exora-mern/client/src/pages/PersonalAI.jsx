import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiEdit, FiClock, FiCheck } from 'react-icons/fi';
import './PersonalAI.css';
import CardNav from '../components/CardNav';

const features = [
  { 
    icon: <FiCalendar />, 
    title: 'Intelligent Daily Planning', 
    description: 'Ira reviews your calendar, task load, and historical patterns to create realistic schedules that adapt as your day changes.' 
  },
  { 
    icon: <FiEdit />, 
    title: 'Writing That Matches You', 
    description: 'Ira drafts emails, documents, and notes in your voice, using your prior work as context.' 
  },
  { 
    icon: <FiClock />, 
    title: 'Contextual Reminders', 
    description: "Ira reminds you when it matters: when you're free, when a dependency is resolved, when urgency increases. Not just at arbitrary times." 
  }
];

const PersonalAI = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="personal-ai-page">
      <CardNav 
        items={[
          { label: 'About', bgColor: '#0D0716', links: [{ label: 'About', href: '/about' }] },
          { label: 'Products', bgColor: '#170D27', links: [{ label: 'Products', href: '/products' }] },
          { label: 'Contact', bgColor: '#271E37', links: [{ label: 'Contact', href: '/contact#contact' }] }
        ]}
      />

      <section className="pai-hero">
        <div className="pai-hero-bg"></div>
        <motion.div 
          className="pai-hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="pai-hero-eyebrow">Ira — Your Sixth Sense</p>
          <h1 className="pai-hero-title">AI That Lives <br /> With You.</h1>
          <p className="pai-hero-not-app">Ira isn't an app.</p>
          <div className="pai-visual">
            {/* Visual representation of IRA */}
            <div className="ira-glow-sphere"></div>
          </div>
        </motion.div>
      </section>

      <section className="pai-features">
        <div className="section-container">
          <motion.h2 
            className="pai-section-title"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            What Can <span className="pai-ghost-word">IRA</span> Do?
          </motion.h2>

          <div className="pai-features-grid">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                className="pai-feature-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="pai-feature-icon">{feature.icon}</div>
                <h3 className="pai-feature-title">{feature.title}</h3>
                <p className="pai-feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pai-cta">
        <div className="pai-cta-card">
          <h2>Join the future today.</h2>
          <p>Join the waitlist for early access to Ira.</p>
          <button className="pai-cta-btn" onClick={() => window.location.href = '/contact'}>
            Join the Waitlist →
          </button>
        </div>
      </section>
    </div>
  );
};

export default PersonalAI;
