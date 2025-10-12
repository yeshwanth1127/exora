import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './PersonalAI.css';

const PersonalAI = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: '🧠',
      title: 'Context-Aware Intelligence',
      description: 'Your AI agent knows your apps, files, calendar, and preferences. It understands what you\'re working on and adapts to help you.',
      highlights: ['Learns your workflow', 'Contextual suggestions', 'Proactive assistance']
    },
    {
      icon: '⚡',
      title: 'OS-Level Integration',
      description: 'Works seamlessly across all your applications. No switching between tools—your AI is always there.',
      highlights: ['Cross-app coordination', 'Universal shortcuts', 'Native performance']
    },
    {
      icon: '🔒',
      title: 'Privacy First',
      description: 'Everything runs locally on your device. Your data stays yours—never uploaded to cloud servers.',
      highlights: ['Local processing', 'End-to-end encrypted', 'Zero data collection']
    },
    {
      icon: '🎯',
      title: 'Task Automation',
      description: 'From scheduling to file management, let your AI handle repetitive tasks while you focus on what matters.',
      highlights: ['Smart scheduling', 'File organization', 'Email management']
    }
  ];

  const useCases = [
    {
      title: 'Daily Planning',
      description: 'Your AI reviews your calendar, prioritizes tasks, and suggests optimal time blocks for deep work.'
    },
    {
      title: 'Research Assistant',
      description: 'Ask questions and get instant answers pulled from your documents, notes, and browsing history.'
    },
    {
      title: 'Content Creation',
      description: 'Draft emails, write documents, or create presentations with AI that matches your writing style.'
    },
    {
      title: 'Smart Reminders',
      description: 'Never miss important tasks. Your AI proactively reminds you based on context and urgency.'
    }
  ];

  return (
    <div className="personal-ai-page">
      {/* Header */}
      <motion.div 
        className="pai-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1 className="pai-title">Your Personal AI Agent</h1>
        <p className="pai-subtitle">
          An OS-level AI assistant that lives on your device and understands your entire digital life
        </p>
      </motion.div>

      {/* Hero Visual */}
      <motion.div 
        className="pai-hero-visual"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="visual-orb"></div>
        <div className="visual-text">
          <p className="visual-tagline">Always There. Always Aware.</p>
          <p className="visual-description">
            Your AI agent runs locally on your device, understands your context, and helps with anything—instantly.
          </p>
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="pai-features-grid">
        {features.map((feature, index) => (
          <motion.div 
            key={index}
            className="pai-feature-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <div className="pai-feature-icon">{feature.icon}</div>
            <h3 className="pai-feature-title">{feature.title}</h3>
            <p className="pai-feature-description">{feature.description}</p>
            <ul className="pai-feature-highlights">
              {feature.highlights.map((highlight, idx) => (
                <li key={idx}>
                  <span className="highlight-dot">•</span>
                  {highlight}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Use Cases Section */}
      <motion.div 
        className="pai-use-cases"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="use-cases-title">What You Can Do</h2>
        <div className="use-cases-grid">
          {useCases.map((useCase, index) => (
            <motion.div 
              key={index}
              className="use-case-card"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h4 className="use-case-title">{useCase.title}</h4>
              <p className="use-case-description">{useCase.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div 
        className="pai-cta"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2>Be Among the First</h2>
        <p>Join the waitlist to get early access to your personal AI agent</p>
        <motion.button 
          className="pai-cta-button"
          onClick={() => window.location.href = '#join'}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Join the Waitlist →
        </motion.button>
        <p className="pai-cta-note">
          Limited spots available for early access • Launching Q2 2025
        </p>
      </motion.div>
    </div>
  );
};

export default PersonalAI;

