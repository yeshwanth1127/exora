import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Products.css';
import Particles from '../components/Particles';
import CardNav from '../components/CardNav';

const Products = () => {
  const navigate = useNavigate();

  const products = [
    {
      id: 1,
      icon: '🤖',
      name: 'Customer Service Agents',
      tagline: 'Your 24/7 Support Team',
      description: 'AI agents that handle customer inquiries, resolve issues, and escalate complex cases—all while maintaining your brand voice.',
      features: [
        'Multi-channel support (email, chat, phone)',
        'Sentiment analysis & smart escalation',
        'Automatic ticket categorization',
        'Response in 50+ languages'
      ],
      metrics: {
        efficiency: '95% automation rate',
        speed: '< 30s avg response time',
        satisfaction: '4.8/5 CSAT score'
      }
    },
    {
      id: 2,
      icon: '📊',
      name: 'Sales Automation Agents',
      tagline: 'Never Miss a Lead',
      description: 'Qualify prospects, schedule meetings, send personalized follow-ups, and update your CRM—automatically.',
      features: [
        'Lead qualification & scoring',
        'Automated email sequences',
        'Meeting scheduling & reminders',
        'CRM auto-sync (Salesforce, HubSpot, etc.)'
      ],
      metrics: {
        efficiency: '70% time saved',
        speed: 'Instant lead response',
        satisfaction: '3x more meetings booked'
      }
    },
    {
      id: 3,
      icon: '💼',
      name: 'Operations Management Agents',
      tagline: 'Run Your Business on Autopilot',
      description: 'Coordinate tasks, allocate resources, predict bottlenecks, and optimize workflows across your entire operation.',
      features: [
        'Task assignment & tracking',
        'Resource optimization',
        'Bottleneck prediction',
        'Performance analytics'
      ],
      metrics: {
        efficiency: '60% cost reduction',
        speed: '40% faster execution',
        satisfaction: '99.5% uptime'
      }
    },
    {
      id: 4,
      icon: '📈',
      name: 'Data Intelligence Agents',
      tagline: 'Turn Data into Decisions',
      description: 'Analyze data, spot trends, generate reports, and surface actionable insights—without a data team.',
      features: [
        'Automated report generation',
        'Anomaly detection',
        'Predictive analytics',
        'Natural language queries'
      ],
      metrics: {
        efficiency: '10x faster analysis',
        speed: 'Real-time insights',
        satisfaction: '92% forecast accuracy'
      }
    },
    {
      id: 5,
      icon: '🔄',
      name: 'Workflow Automation Agents',
      tagline: 'Connect Everything, Automate Anything',
      description: 'Build complex workflows that span multiple tools and systems. Our agents handle the heavy lifting.',
      features: [
        '1000+ app integrations',
        'Custom workflow builder',
        'Error handling & retry logic',
        'Audit logs & compliance'
      ],
      metrics: {
        efficiency: '85% manual work eliminated',
        speed: '24/7 execution',
        satisfaction: 'ROI in < 2 months'
      }
    },
    {
      id: 6,
      icon: '🔐',
      name: 'Enterprise AI Platform',
      tagline: 'Built for Scale, Security & Compliance',
      description: 'Full-featured platform with private deployments, custom models, and enterprise-grade security.',
      features: [
        'Private cloud deployment',
        'Custom model training',
        'SSO & role-based access',
        'SOC 2 & GDPR compliant'
      ],
      metrics: {
        efficiency: 'Unlimited agents',
        speed: 'Dedicated support',
        satisfaction: '99.99% SLA'
      }
    }
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
              { label: 'Solutions', ariaLabel: 'Solutions', href: '/products#solutions' }
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
          <h1 className="products-title">Our AI Agents</h1>
          <p className="products-subtitle">
            Purpose-built agents for every business function. Deploy in minutes, scale instantly.
          </p>
        </motion.div>

        <div className="products-grid">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              className="product-card"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className="product-icon">{product.icon}</div>
              <h2 className="product-name">{product.name}</h2>
              <p className="product-tagline">{product.tagline}</p>
              <p className="product-description">{product.description}</p>

              <div className="product-features">
                <h3 className="features-title">Key Features:</h3>
                <ul className="features-list">
                  {product.features.map((feature, i) => (
                    <li key={i} className="feature-item">
                      <span className="feature-bullet">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="product-metrics">
                <div className="metric">
                  <div className="metric-value">{product.metrics.efficiency}</div>
                  <div className="metric-label">Efficiency</div>
                </div>
                <div className="metric">
                  <div className="metric-value">{product.metrics.speed}</div>
                  <div className="metric-label">Speed</div>
                </div>
                <div className="metric">
                  <div className="metric-value">{product.metrics.satisfaction}</div>
                  <div className="metric-label">Results</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

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
              Choose your agent, customize to your needs, and deploy in minutes.
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


