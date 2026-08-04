import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheck, FiCpu, FiBarChart2, FiSettings, FiTrendingUp } from 'react-icons/fi';
import './BusinessSolutions.css';

const BusinessSolutions = () => {
  const navigate = useNavigate();

  const solutions = [
    {
      icon: <FiCpu />,
      title: 'Customer Service Agents',
      description: 'Handle complex inquiries, bookings, and appointment scheduling autonomously. Escalate only when needed.',
      features: ['24/7 Availability', 'Multi-language Support', 'Context-aware Responses', 'Smart Escalation']
    },
    {
      icon: <FiBarChart2 />,
      title: 'Sales Process Automation',
      description: 'Qualify leads, nurture prospects, schedule meetings, and negotiate within your parameters.',
      features: ['Lead Qualification', 'Automated Follow-ups', 'Meeting Scheduling', 'Pipeline Management']
    },
    {
      icon: <FiSettings />,
      title: 'Operations Management',
      description: 'Predict bottlenecks, allocate resources, and coordinate teams with intelligent automation.',
      features: ['Resource Optimization', 'Bottleneck Detection', 'Team Coordination', 'Real-time Monitoring']
    },
    {
      icon: <FiTrendingUp />,
      title: 'Data Intelligence Agents',
      description: 'Analyze data, spot trends, and surface actionable recommendations for your business.',
      features: ['Trend Analysis', 'Predictive Insights', 'Custom Reports', 'Actionable Alerts']
    }
  ];

  const benefits = [
    { stat: '90%', label: 'Cost Reduction' },
    { stat: '10x', label: 'Faster Processing' },
    { stat: '24/7', label: 'Always Available' },
    { stat: '99.9%', label: 'Accuracy Rate' }
  ];

  return (
    <div className="business-solutions-page">
      {/* Header */}
      <motion.div 
        className="solutions-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <button className="back-button" onClick={() => navigate('/')}>
          <FiArrowLeft className="back-icon" /> Back to Home
        </button>
        <h1 className="solutions-title">Business Automation Solutions</h1>
        <p className="solutions-subtitle">
          Transform your operations with AI-powered agents that work 24/7
        </p>
      </motion.div>

      {/* Benefits Section */}
      <motion.div 
        className="benefits-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {benefits.map((benefit, index) => (
          <motion.div 
            key={index}
            className="benefit-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
          >
            <div className="benefit-stat">{benefit.stat}</div>
            <div className="benefit-label">{benefit.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Solutions Grid */}
      <div className="solutions-grid">
        {solutions.map((solution, index) => (
          <motion.div 
            key={index}
            className="solution-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <div className="solution-icon">{solution.icon}</div>
            <h3 className="solution-title">{solution.title}</h3>
            <p className="solution-description">{solution.description}</p>
            <ul className="solution-features">
              {solution.features.map((feature, idx) => (
                <li key={idx}>
                  <span className="feature-check"><FiCheck /></span>
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* CTA Section */}
      <motion.div 
        className="solutions-cta"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2>Ready to Transform Your Business?</h2>
        <p>Get started with Exora's AI automation platform today</p>
        <div className="cta-buttons">
          <motion.button 
            className="cta-btn-primary"
            onClick={() => window.location.href = 'https://exora.solutions/contact#contact'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Now
          </motion.button>
          <motion.button 
            className="cta-btn-secondary"
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Demo
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default BusinessSolutions;

