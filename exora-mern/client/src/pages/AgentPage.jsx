import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './AgentPage.css';
import CardNav from '../components/CardNav';
import { getAgentBySlug } from '../data/agents';

const AgentPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const agent = getAgentBySlug(slug);

  if (!agent) {
    return (
      <div className="agent-page">
        <CardNav
          items={[
            { 
              label: 'About', 
              bgColor: '#0D0716', 
              textColor: '#fff', 
              links: [
                { label: 'About', ariaLabel: 'About page', href: '/about' },
                { label: 'Career', ariaLabel: 'Career info', href: '/career' }
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
              label: 'Contact', 
              bgColor: '#271E37', 
              textColor: '#fff', 
              links: [
                { label: 'Contact', ariaLabel: 'Contact page', href: '/contact' }
              ]
            },
          ]}
          baseColor="rgba(255,255,255,0.08)"
          menuColor="#fff"
          buttonBgColor="rgba(17,17,17,0.75)"
          buttonTextColor="#fff"
          ease="power3.out"
        />
        <div className="agent-container">
          <p className="agent-not-found">Agent not found.</p>

        </div>
      </div>
    );
  }

  const subtitle = agent.features
    ? [...(agent.features || []), agent.problemSolved ? `Problem solved: ${agent.problemSolved}` : ''].filter(Boolean).join(' • ')
    : agent.description || '';

  return (
    <div className="agent-page">
      <CardNav
        items={[
          { label: 'About', bgColor: '#0D0716', textColor: '#fff', links: [{ label: 'About', ariaLabel: 'About', href: '/about' }, { label: 'Career', ariaLabel: 'Company', href: '/contact' }] },
          { label: 'Products', bgColor: '#170D27', textColor: '#fff', links: [{ label: 'Products', ariaLabel: 'Products', href: '/products' }, { label: 'Solutions', ariaLabel: 'Solutions', href: '/solutions' }] },
          { label: 'Contact', bgColor: '#271E37', textColor: '#fff', links: [{ label: 'Contact', ariaLabel: 'Contact page', href: '/contact' }] },
        ]}
        baseColor="rgba(255,255,255,0.08)"
        menuColor="#fff"
        buttonBgColor="rgba(17,17,17,0.75)"
        buttonTextColor="#fff"
        ease="power3.out"
      />
      <div className="agent-container">
        <motion.div
          className="agent-content"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >

          <h1 className="agent-title">{agent.title}</h1>
          {subtitle && <p className="agent-subtitle">{subtitle}</p>}
          {agent.features && agent.features.length > 0 && (
            <div className="agent-features">
              <h2 className="agent-section-heading">Capabilities</h2>
              <ul className="agent-features-list">
                {agent.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}
          {agent.problemSolved && (
            <div className="agent-problem">
              <h2 className="agent-section-heading">Problem solved</h2>
              <p className="agent-problem-text">{agent.problemSolved}</p>
            </div>
          )}
          {agent.description && !agent.features && (
            <p className="agent-description">{agent.description}</p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AgentPage;
