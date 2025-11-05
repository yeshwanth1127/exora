import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Products.css';
import Particles from '../components/Particles';
import CardNav from '../components/CardNav';

const Products = () => {
  const navigate = useNavigate();

  const b2bFeatures = [
    {
      icon: '🏢',
      title: 'Enterprise Scale',
      description: 'Deploy hundreds of agents across your organization with centralized management.'
    },
    {
      icon: '🔗',
      title: 'Seamless Integration',
      description: 'Connect with 1000+ tools—Salesforce, HubSpot, Slack, Microsoft 365, and more.'
    },
    {
      icon: '🛡️',
      title: 'Enterprise Security',
      description: 'SOC 2, GDPR, HIPAA compliant. Private cloud deployments available.'
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Real-time dashboards, ROI tracking, and performance monitoring.'
    },
    {
      icon: '⚙️',
      title: 'Custom Workflows',
      description: 'Build complex, multi-step automations tailored to your business processes.'
    },
    {
      icon: '👥',
      title: 'Team Collaboration',
      description: 'Role-based access, team workspaces, and collaborative agent development.'
    }
  ];

  const ghostFeatures = [
    {
      icon: '🧠',
      title: 'Context-Aware Intelligence',
      description: 'Understands your workflow and adapts to your unique patterns.'
    },
    {
      icon: '⚡',
      title: 'Real-Time Action',
      description: 'Executes tasks instantly when you need them, without delays.'
    },
    {
      icon: '🪶',
      title: 'Seamless System Integration',
      description: 'Native integration with your OS, apps, and files.'
    },
    {
      icon: '🧭',
      title: 'Proactive Assistance',
      description: 'Anticipates your needs and acts before you ask.'
    },
    {
      icon: '🔒',
      title: 'Private by Design',
      description: 'All data stays on your device. No cloud required.'
    },
    {
      icon: '🎯',
      title: 'Focused Productivity',
      description: 'Simplifies your digital life by handling routine tasks automatically.'
    }
  ];

  const b2bBenefits = [
    { stat: '90%', label: 'Cost Reduction' },
    { stat: '10x', label: 'Faster Deployment' },
    { stat: '24/7', label: 'Always On' },
    { stat: '99.9%', label: 'Uptime SLA' }
  ];

  const ghostBenefits = [
    { stat: '100%', label: 'Private & Local' },
    { stat: '0', label: 'Cloud Dependency' },
    { stat: '<1s', label: 'Response Time' },
    { stat: '∞', label: 'Customizable' }
  ];

  return (
    <div className="products-page">
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

      <div className="products-container">
        <motion.div
          className="products-hero"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="products-title">Choose Your Path</h1>
          <p className="products-subtitle">
            Tailored AI solutions for businesses and individuals
          </p>
        </motion.div>

        {/* Products Dual Layout */}
        <div className="products-dual-layout">
          {/* B2B Section */}
          <motion.section
            className="product-category"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="category-header">
              <div className="category-badge">Business</div>
              <h2 className="category-title">B2B Agentic Automation</h2>
              <p className="category-subtitle">
                Powerful AI agents that transform your entire organization. 
                Scale operations, reduce costs, and automate complex business workflows.
              </p>
            </div>

            <div className="benefits-grid">
              {b2bBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="benefit-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="benefit-stat">{benefit.stat}</div>
                  <div className="benefit-label">{benefit.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="features-grid">
              {b2bFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  className="feature-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.3 } }}
                >
                  <div className="feature-icon">{feature.icon}</div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="category-cta">
              <button className="cta-button primary" onClick={() => navigate('/solutions')}>
                Explore Business Solutions
              </button>
            </div>
          </motion.section>

          {/* Divider */}
          <motion.div
            className="products-divider"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="divider-line"></div>
            <div className="divider-text">OR</div>
            <div className="divider-line"></div>
          </motion.div>

          {/* Ghost Section */}
          <motion.section
            className="product-category"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
          <div className="category-header">
            <div className="category-badge ghost-badge">Personal</div>
            <h2 className="category-title">Ghost — Your Sixth Sense</h2>
            <p className="category-subtitle">
              A local, context-aware AI that lives within your system. 
              It learns your habits, acts where you need it, and stays invisible when you don't.
            </p>
            <p className="category-highlight">
              Private. Intelligent. Effortless.
            </p>
          </div>

          <div className="benefits-grid">
            {ghostBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="benefit-card ghost-benefit"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="benefit-stat">{benefit.stat}</div>
                <div className="benefit-label">{benefit.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="features-grid">
            {ghostFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card ghost-feature"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="category-cta">
            <button className="cta-button ghost-cta" onClick={() => navigate('/personal-ai')}>
              Explore Ghost
            </button>
          </div>
        </motion.section>
        </div>

        {/* Bottom CTA */}
        <motion.section
          className="products-cta-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="cta-card">
            <h2 className="cta-title">Ready to Get Started?</h2>
            <p className="cta-text">
              Choose the right solution for you and transform how you work.
            </p>
            <div className="cta-buttons">
              <button className="cta-button primary" onClick={() => navigate('/auth')}>
                Start Free Trial
              </button>
              <button className="cta-button secondary" onClick={() => navigate('/join')}>
                Talk to Sales
              </button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Products;
