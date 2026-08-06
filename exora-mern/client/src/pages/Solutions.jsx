import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Solutions.css';
import CardNav from '../components/CardNav';
import { SITE_NAV_ITEMS } from '../data/siteNavigation';

const Solutions = () => {
  const navigate = useNavigate();

  const solutions = [
    {
      id: 1,
      name: 'Customer Service Agents',
      tagline: 'Support across configured channels',
      description: 'AI agents that handle customer inquiries, resolve issues, and escalate complex cases — all while maintaining your brand voice.',
      features: [
        'Multi-channel support (email, chat, phone)',
        'Sentiment analysis & smart escalation',
        'Automatic ticket categorization',
        'Response in 50+ languages'
      ],
      stats: [
        { num: 'Less', desc: 'Manual triage', label: 'Efficiency' },
        { num: 'Clear', desc: 'Escalation paths', label: 'Control' },
        { num: 'Visible', desc: 'Case history', label: 'Review' }
      ]
    },
    {
      id: 2,
      name: 'Sales Automation Agents',
      tagline: 'Never miss a lead',
      description: 'Qualify prospects, schedule meetings, send personalized follow-ups, and update your CRM through configured workflows.',
      features: [
        'Lead qualification & scoring',
        'Automated email sequences',
        'Meeting scheduling & reminders',
        'CRM auto-sync (Salesforce, HubSpot, etc.)'
      ],
      stats: [
        { num: 'Defined', desc: 'Lead criteria', label: 'Control' },
        { num: 'Faster', desc: 'Lead routing', label: 'Speed' },
        { num: 'Synced', desc: 'CRM activity', label: 'Review' }
      ]
    },
    {
      id: 3,
      name: 'Operations Management',
      tagline: 'Coordinate operational work',
      description: 'Coordinate tasks, allocate resources, predict bottlenecks, and optimize workflows across your entire operation.',
      features: [
        'Task assignment & tracking',
        'Resource optimization',
        'Bottleneck prediction',
        'Performance analytics'
      ],
      stats: [
        { num: 'Less', desc: 'Manual coordination', label: 'Efficiency' },
        { num: 'Visible', desc: 'Workflow state', label: 'Control' },
        { num: 'Clear', desc: 'Task ownership', label: 'Review' }
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
        { num: 'Unified', desc: 'Data context', label: 'Efficiency' },
        { num: 'Current', desc: 'Operational signals', label: 'Speed' },
        { num: 'Traceable', desc: 'Insight sources', label: 'Review' }
      ]
    },
    {
      id: 5,
      name: 'Workflow Automation',
      tagline: 'Connect everything, automate anything',
      description: 'Build complex workflows that span multiple tools and systems. Our agents handle the heavy lifting.',
      features: [
        'Business system integrations',
        'Custom workflow builder',
        'Error handling & retry logic',
        'Audit logs & compliance'
      ],
      stats: [
        { num: 'Connected', desc: 'Business systems', label: 'Efficiency' },
        { num: 'Scoped', desc: 'Workflow actions', label: 'Control' },
        { num: 'Logged', desc: 'Execution history', label: 'Review' }
      ]
    },
    {
      id: 6,
      name: 'Qlix Governance',
      tagline: 'Keep people accountable and in control',
      description: 'Apply ownership, access boundaries, approval requirements, and operational visibility across Qlix agent workflows.',
      features: [
        'Clear agent ownership',
        'Scoped access boundaries',
        'Human approval checkpoints',
        'Activity and outcome review'
      ],
      stats: [
        { num: 'Clear', desc: 'Accountability', label: 'Ownership' },
        { num: 'Scoped', desc: 'Agent boundaries', label: 'Control' },
        { num: 'Visible', desc: 'Operational history', label: 'Review' }
      ]
    }
  ];

  return (
    <div className="solutions-page">
      <CardNav items={SITE_NAV_ITEMS} baseColor="rgba(255,255,255,0.08)" menuColor="#fff" buttonBgColor="rgba(17,17,17,0.75)" buttonTextColor="#fff" ease="power3.out" />

      <div className="solutions-container">
        <motion.div
          className="solutions-hero"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="solutions-title">Qlix Agent Capabilities</h1>
          <p className="solutions-subtitle">
            Practical ways businesses can deploy agents through Qlix—with ownership, boundaries, approvals, and review built into the operating model.
          </p>
          <p className="solutions-subtitle">Illustrative capabilities; availability depends on configured workflows and integrations.</p>
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
            <h2 className="cta-title">Explore what Qlix can support</h2>
            <p className="cta-text">
              Start with the workflow that matters most, then define the controls your team needs.
            </p>
            <div className="cta-buttons">
              <button className="cta-button primary" onClick={() => navigate('/contact')}>
                <span className="cta-dot-pulsing" />
                Request a Demo
              </button>
              <button className="cta-button secondary" onClick={() => navigate('/contact')}>
                <span className="cta-dot-pulsing" />
                Contact Exora
              </button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Solutions;
