import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  FiBriefcase,
  FiLink,
  FiShield,
  FiBarChart2,
  FiSettings,
  FiUsers,
  FiLayers,
  FiLock,
} from 'react-icons/fi';
import './Products.css';
import CardNav from '../components/CardNav';

const CircularProgress = ({ value }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (start === end) return;
    
    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, 20);
    
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="circular-progress-container">
      <svg viewBox="0 0 100 100" className="circular-progress-svg">
        <circle className="circle-bg" cx="50" cy="50" r="45" />
        <motion.circle 
          className="circle-fill" 
          cx="50" cy="50" r="45"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: value / 100 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="progress-text">{count}%</div>
    </div>
  );
};

const SpeedLines = () => (
  <div className="speed-lines-container">
    {[1, 2, 3].map((i) => (
      <motion.div
        key={i}
        className={`speed-line line-${i}`}
        animate={{ x: ['100%', '-200%'] }}
        transition={{ 
          duration: 0.8 + (i * 0.2), 
          repeat: Infinity, 
          ease: "linear",
          delay: i * 0.1
        }}
      />
    ))}
  </div>
);

const CARD_NAV_ITEMS = [
  { label: 'About', bgColor: '#0D0716', textColor: '#fff', links: [{ label: 'About', ariaLabel: 'About page', href: '/about' }, { label: 'Career', ariaLabel: 'Career info', href: '/career' }] },
  { label: 'Products', bgColor: '#170D27', textColor: '#fff', links: [{ label: 'Products', ariaLabel: 'Products page', href: '/products' }, { label: 'Solutions', ariaLabel: 'Solutions', href: '/solutions' }] },
  { label: 'Contact', bgColor: '#271E37', textColor: '#fff', links: [{ label: 'Contact', ariaLabel: 'Contact us', href: '/contact#contact' }] },
];

const Products = () => {
  const navigate = useNavigate();

  const b2bFeatures = [
    {
      icon: <FiBriefcase />,
      title: 'Enterprise Scale',
      description: 'Deploy hundreds of agents across your organization with centralized management.'
    },
    {
      icon: <FiLink />,
      title: 'Seamless Integration',
      description: 'Connect with 1000+ tools—Salesforce, HubSpot, Slack, Microsoft 365, and more.'
    },
    {
      icon: <FiShield />,
      title: 'Enterprise Security',
      description: 'SOC 2, GDPR, HIPAA compliant. Private cloud deployments available.'
    },
    {
      icon: <FiBarChart2 />,
      title: 'Advanced Analytics',
      description: 'Real-time dashboards, ROI tracking, and performance monitoring.'
    },
    {
      icon: <FiSettings />,
      title: 'Custom Workflows',
      description: 'Build complex, multi-step automations tailored to your business processes.'
    },
    {
      icon: <FiUsers />,
      title: 'Team Collaboration',
      description: 'Role-based access, team workspaces, and collaborative agent development.'
    }
  ];

  const b2bBenefits = [
    { stat: '85%', label: 'Cost Reduction' },
    { stat: '10x', label: 'Faster Deployment' },
    { stat: '24/7', label: 'Always On' },
    { stat: '93%', label: 'Uptime SLA' }
  ];

  const qlixFeatures = [
    {
      icon: <FiShield />,
      title: 'Human-verified owners',
      description: 'Every agent links to a verified human — device binding, passkeys, and identity you can trust.'
    },
    {
      icon: <FiSettings />,
      title: 'Scoped permissions',
      description: 'Fine-grained capability controls. Define exactly what each agent can and cannot do.'
    },
    {
      icon: <FiLock />,
      title: 'JIT approvals',
      description: 'Just-in-time human oversight for high-risk actions with role-based governance.'
    },
    {
      icon: <FiLayers />,
      title: 'AI Brain coordination',
      description: 'Orchestrate multi-agent workflows, route tasks, and learn from outcomes at scale.'
    },
    {
      icon: <FiBarChart2 />,
      title: 'Audit & proof',
      description: 'Tamper-proof ledger with cryptographic proof of every agent action.'
    },
    {
      icon: <FiUsers />,
      title: 'Agent ecosystem',
      description: 'Create, register, and govern AI agents across your organization from one control plane.'
    }
  ];

  const qlixBenefits = [
    { stat: '100%', label: 'Verified humans' },
    { stat: '6', label: 'Control layers' },
    { stat: '24/7', label: 'Always governed' },
    { stat: '∞', label: 'Agents at scale' }
  ];

  return (
    <div className="products-page">
      <CardNav items={CARD_NAV_ITEMS} baseColor="rgba(255,255,255,0.08)" menuColor="#fff" buttonBgColor="rgba(17,17,17,0.75)" buttonTextColor="#fff" ease="power3.out" />

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
                  className={`benefit-card ${benefit.label === 'Faster Deployment' || benefit.label === 'Uptime SLA' ? 'has-line' : ''}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="benefit-stat">
                    {benefit.label === 'Always On' ? (
                      <div className="animated-clock-container">
                        <div className="clock-outer">
                          <motion.div 
                            className="clock-hand hour"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                          />
                          <motion.div 
                            className="clock-hand minute"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          />
                        </div>
                        <span className="always-on-text">{benefit.stat}</span>
                      </div>
                    ) : benefit.label === 'Cost Reduction' ? (
                      <CircularProgress value={85} />
                    ) : benefit.label === 'Faster Deployment' ? (
                      <div className="stat-with-speed">
                        <span className="speed-stat-number">{benefit.stat}</span>
                        <SpeedLines />
                      </div>
                    ) : benefit.stat}
                  </div>
                  <div className="benefit-label">{benefit.label}</div>
                  {(benefit.label === 'Faster Deployment' || benefit.label === 'Uptime SLA') && (
                    <div className="stat-line-wrapper">
                      <motion.div 
                        className="stat-line"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </div>
                  )}
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
                <span className="cta-dot-pulsing" />
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

          {/* Qlix Section (Personal) */}
          <motion.section
            className="product-category"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
          <div className="category-header">
            <div className="category-badge ghost-badge">Personal</div>
            <h2 className="category-title">Qlix — Agent Ecosystem</h2>
            <p className="category-subtitle">
              Create AI agents, link each one to a verified human, and coordinate them with the AI Brain
              while Qlix enforces permissions, approvals, and audit trails.
            </p>
            <p className="category-highlight">
              Governed. Verifiable. Built to scale.
            </p>
          </div>

          <div className="benefits-grid">
            {qlixBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                className={`benefit-card ghost-benefit ${benefit.label === 'Always governed' ? 'has-line' : ''}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="benefit-stat">
                  {benefit.label === 'Always governed' ? (
                    <div className="animated-clock-container">
                      <div className="clock-outer">
                        <motion.div
                          className="clock-hand hour"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                        />
                        <motion.div
                          className="clock-hand minute"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        />
                      </div>
                      <span className="always-on-text">{benefit.stat}</span>
                    </div>
                  ) : (
                    benefit.stat
                  )}
                </div>
                <div className="benefit-label">{benefit.label}</div>
                {benefit.label === 'Always governed' && (
                  <div className="stat-line-wrapper">
                    <motion.div
                      className="stat-line"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="features-grid">
            {qlixFeatures.map((feature, index) => (
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
            <button className="cta-button ghost-cta" onClick={() => navigate('/qlix')}>
              <span className="cta-dot-pulsing" />
              Explore Qlix
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
                <span className="cta-dot-pulsing" />
                Start Free Trial
              </button>
              <button className="cta-button secondary" onClick={() => navigate('/contact')}>
                <span className="cta-dot-pulsing" />
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
