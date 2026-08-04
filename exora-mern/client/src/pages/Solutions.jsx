import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Solutions.css';
import CardNav from '../components/CardNav';

const CARD_NAV_ITEMS = [
  { label: 'About', bgColor: '#0D0716', textColor: '#fff', links: [{ label: 'About', ariaLabel: 'About page', href: '/about' }, { label: 'Career', ariaLabel: 'Career info', href: '/career' }] },
  { label: 'Products', bgColor: '#170D27', textColor: '#fff', links: [{ label: 'Products', ariaLabel: 'Products page', href: '/products' }, { label: 'Solutions', ariaLabel: 'Solutions', href: '/solutions' }] },
  { label: 'Contact', bgColor: '#271E37', textColor: '#fff', links: [{ label: 'Contact', ariaLabel: 'Contact us', href: '/contact#contact' }] },
];

const Solutions = () => {
  const navigate = useNavigate();

  const solutions = [
    {
      id: 1,
      name: 'Customer Service Agents',
      tagline: 'Your 24/7 support team',
      description: 'AI agents that handle customer inquiries, resolve issues, and escalate complex cases — all while maintaining your brand voice.',
      features: [
        'Multi-channel support (email, chat, phone)',
        'Sentiment analysis & smart escalation',
        'Automatic ticket categorization',
        'Response in 50+ languages'
      ],
      stats: [
        { num: '80%', desc: 'Automation rate', label: 'Efficiency' },
        { num: '<60s', desc: 'Avg response time', label: 'Speed' },
        { num: '4.6/5', desc: 'CSAT score', label: 'Results' }
      ]
    },
    {
      id: 2,
      name: 'Sales Automation Agents',
      tagline: 'Never miss a lead',
      description: 'Qualify prospects, schedule meetings, send personalized follow-ups, and update your CRM — automatically.',
      features: [
        'Lead qualification & scoring',
        'Automated email sequences',
        'Meeting scheduling & reminders',
        'CRM auto-sync (Salesforce, HubSpot, etc.)'
      ],
      stats: [
        { num: '55%', desc: 'Time saved', label: 'Efficiency' },
        { num: '<1min', desc: 'Lead response', label: 'Speed' },
        { num: '2x', desc: 'More meetings booked', label: 'Results' }
      ]
    },
    {
      id: 3,
      name: 'Operations Management',
      tagline: 'Run your business on autopilot',
      description: 'Coordinate tasks, allocate resources, predict bottlenecks, and optimize workflows across your entire operation.',
      features: [
        'Task assignment & tracking',
        'Resource optimization',
        'Bottleneck prediction',
        'Performance analytics'
      ],
      stats: [
        { num: '45%', desc: 'Cost reduction', label: 'Efficiency' },
        { num: '35%', desc: 'Faster execution', label: 'Speed' },
        { num: '93%', desc: 'Uptime', label: 'Results' }
      ]
    },
    {
      id: 4,
      name: 'Data Intelligence',
      tagline: 'Turn data into decisions',
      description: 'Analyze data, spot trends, generate reports, and surface actionable insights — without a data team.',
      features: [
        'Automated report generation',
        'Anomaly detection',
        'Predictive analytics',
        'Natural language queries'
      ],
      stats: [
        { num: '6x', desc: 'Faster analysis', label: 'Efficiency' },
        { num: 'Live', desc: 'Real-time insights', label: 'Speed' },
        { num: '88%', desc: 'Forecast accuracy', label: 'Results' }
      ]
    },
    {
      id: 5,
      name: 'Workflow Automation',
      tagline: 'Connect everything, automate anything',
      description: 'Build complex workflows that span multiple tools and systems. Our agents handle the heavy lifting.',
      features: [
        '1000+ app integrations',
        'Custom workflow builder',
        'Error handling & retry logic',
        'Audit logs & compliance'
      ],
      stats: [
        { num: '70%', desc: 'Manual work cut', label: 'Efficiency' },
        { num: '24/7', desc: 'Execution', label: 'Speed' },
        { num: '<4mo', desc: 'ROI', label: 'Results' }
      ]
    },
    {
      id: 6,
      name: 'Enterprise AI Platform',
      tagline: 'Built for scale, security & compliance',
      description: 'Full-featured platform with private deployments, custom models, and enterprise-grade security.',
      features: [
        'Private cloud deployment',
        'Custom model training',
        'SSO & role-based access',
        'SOC 2 & GDPR compliant'
      ],
      stats: [
        { num: '∞', desc: 'Unlimited agents', label: 'Scale' },
        { num: '24/7', desc: 'Dedicated support', label: 'Speed' },
        { num: '93%', desc: 'SLA', label: 'Results' }
      ]
    }
  ];

  return (
    <div className="solutions-page">
      <CardNav items={CARD_NAV_ITEMS} baseColor="rgba(255,255,255,0.08)" menuColor="#fff" buttonBgColor="rgba(17,17,17,0.75)" buttonTextColor="#fff" ease="power3.out" />

      <div className="solutions-container">
        <motion.div
          className="solutions-hero"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="solutions-title">Our AI Agent Solutions</h1>
          <p className="solutions-subtitle">
            Purpose-built agents for every business function. Deploy in minutes, scale instantly.
          </p>
        </motion.div>

        <div className="solutions-grid-new">
          {solutions.map((solution, index) => (
            <motion.div
              key={solution.id}
              className={`card card-${index + 1}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="accent-bar"></div>
              <div className="card-num">{`0${index + 1}`}</div>
              <div className="card-head">
                <div className="dot-head"></div>
                <div className="card-title">{solution.name}</div>
              </div>
              <div className="card-tagline">{solution.tagline}</div>
              <div className="card-desc">{solution.description}</div>
              
              <div className="feats">
                {solution.features.map((feature, i) => (
                  <div key={i} className="feat">
                    <div className="feat-dot"></div>
                    <div className="feat-text">{feature}</div>
                  </div>
                ))}
              </div>

              <div className="stats">
                {solution.stats.map((stat, i) => (
                  <div key={i} className="stat">
                    <div className="stat-num">{stat.num}</div>
                    <div className="stat-desc">{stat.desc}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.section
          className="solutions-cta-section"
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

export default Solutions;

