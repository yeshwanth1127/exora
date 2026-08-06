import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CardNav from '../components/CardNav';
import HeroAutopilotHeadline from '../components/HeroAutopilotHeadline';
import { SITE_NAV_ITEMS } from '../data/siteNavigation';
import { AGENTS_DATA } from '../data/agents';
import './HomePage.css';

const PRODUCT_PILLARS = [
  { number: '01', title: 'Deploy', text: 'Configure agents around defined business responsibilities.' },
  { number: '02', title: 'Coordinate', text: 'Connect agents into controlled, cross-system workflows.' },
  { number: '03', title: 'Govern', text: 'Apply ownership, scoped permissions, policies, and approval checkpoints.' },
  { number: '04', title: 'Review', text: 'Inspect outcomes, exceptions, and cryptographically immutable audit entries.' },
];

const IMPLEMENTATION_STEPS = [
  { number: '01', title: 'Connect', text: 'Select the business systems and data sources required for the workflow.' },
  { number: '02', title: 'Define', text: 'Set responsibilities, permissions, policies, and approval requirements.' },
  { number: '03', title: 'Deploy', text: 'Introduce agents into controlled workflows with clear human ownership.' },
  { number: '04', title: 'Review', text: 'Monitor activity, handle exceptions, and improve the operating model.' },
];

const GOVERNANCE_ITEMS = [
  'Scoped agent permissions',
  'Human approval checkpoints',
  'Named operational ownership',
  'Activity and exception visibility',
  'Cryptographically immutable recorded audit entries',
];

const AUDIENCES = [
  'Companies deploying multiple AI agents',
  'Operations teams coordinating cross-system workflows',
  'Leaders who require clear ownership and oversight',
  'Regulated or audit-sensitive operating environments',
];

const FAQS = [
  ['What is Qlix?', 'Qlix is Exora’s platform for deploying, coordinating, governing, and reviewing business AI agents.'],
  ['Does Qlix include AI agents?', 'Qlix supports purpose-built agents that work within configured responsibilities, permissions, workflows, and escalation rules.'],
  ['Can Qlix connect to our existing systems?', 'Qlix workflows can be designed around selected business systems and integrations. Availability depends on the systems and access configured for each deployment.'],
  ['How are agent permissions controlled?', 'Teams can define scoped access boundaries, ownership, policies, and human approval requirements for sensitive actions.'],
  ['How does Qlix create immutable audit records?', 'Recorded Qlix audit entries are cryptographically protected. Once recorded, a Qlix audit entry is cryptographically impossible to modify.'],
  ['How do we get started?', 'Start with a discovery session to identify a suitable workflow, its systems, governance requirements, and a controlled implementation path.'],
];

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6 },
};

function HomePage() {
  return (
    <main className="p1-home">
      <CardNav
        items={SITE_NAV_ITEMS}
        baseColor="rgba(8, 8, 12, 0.9)"
        menuColor="#fff"
        buttonBgColor="rgba(17,17,17,0.75)"
        buttonTextColor="#fff"
        ease="power3.out"
      />

      <section className="p1-hero" aria-labelledby="home-title">
        <motion.div className="p1-hero-copy" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="p1-qlix-kicker"><img src="/logo_solo.png" alt="" /><span>EXORA PRESENTS QLIX</span></div>
          <div className="p1-product-name" aria-label="Qlix">QLIX</div>
          <div id="home-title"><HeroAutopilotHeadline variant="desktop" /></div>
          <p className="p1-hero-lede">Qlix is Exora’s governed platform for deploying, coordinating, and controlling business AI agents.</p>
          <div className="p1-cta-row">
            <Link className="p1-button p1-button-primary" to="/contact">Request a Demo</Link>
            <a className="p1-button p1-button-secondary" href="https://qlix.exora.solutions">Explore Qlix</a>
          </div>
        </motion.div>
        <motion.div className="p1-hero-visual" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }} aria-label="Qlix governance overview">
          <div className="p1-product-mark"><img src="/logo_solo.png" alt="" /><div><strong>QLIX</strong><span>THE GOVERNED AI OPERATING PLATFORM</span></div></div>
          <div className="p1-control-grid">
            <span>OWNERSHIP</span><span>PERMISSIONS</span><span>APPROVALS</span><span>AUDIT</span>
          </div>
          <p>One control layer for business AI operations.</p>
        </motion.div>
      </section>

      <motion.section className="p1-section p1-problem" {...reveal}>
        <div className="p1-section-heading"><span className="p1-eyebrow">THE OPERATING PROBLEM</span><h2>AI agents need accountability, not just capability.</h2></div>
        <div className="p1-problem-copy">
          <p>Agents can act across systems, data, and teams. Without clear ownership and operating boundaries, that power becomes difficult to manage.</p>
          <ul><li>Who is responsible for each agent?</li><li>What can it access and change?</li><li>Which actions require human approval?</li><li>How can teams review what happened?</li></ul>
        </div>
      </motion.section>

      <motion.section className="p1-section" {...reveal}>
        <div className="p1-section-heading"><span className="p1-eyebrow">THE QLIX PLATFORM</span><h2>Deploy agents with control built in.</h2><p>Qlix brings execution and governance into one operating model.</p></div>
        <div className="p1-card-grid p1-pillar-grid">
          {PRODUCT_PILLARS.map((item) => <article className="p1-card" key={item.title}><span>{item.number}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}
        </div>
        <Link className="p1-text-link" to="/qlix">Explore the Qlix platform <span aria-hidden>→</span></Link>
      </motion.section>

      <motion.section className="p1-section p1-tinted" {...reveal}>
        <div className="p1-section-heading"><span className="p1-eyebrow">HOW QLIX WORKS</span><h2>From workflow selection to controlled operation.</h2><p>Illustrative implementation sequence; each deployment is configured around the business and its systems.</p></div>
        <ol className="p1-steps">{IMPLEMENTATION_STEPS.map((item) => <li key={item.title}><span>{item.number}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></li>)}</ol>
      </motion.section>

      <motion.section className="p1-section" {...reveal}>
        <div className="p1-section-heading"><span className="p1-eyebrow">AGENT CAPABILITIES</span><h2>Purpose-built agents. One governed platform.</h2><p>Explore illustrative Qlix agent capabilities for common business workflows.</p></div>
        <div className="p1-agent-grid">
          {AGENTS_DATA.map((agent) => <Link className="p1-agent-card" to={`/agents/${agent.slug}`} key={agent.slug}><h3>{agent.title}</h3><p>{agent.description || agent.features?.join(' · ')}</p><span>Explore capability →</span></Link>)}
        </div>
      </motion.section>

      <motion.section className="p1-section p1-governance" {...reveal}>
        <div className="p1-section-heading"><span className="p1-eyebrow">GOVERNANCE & AUDITABILITY</span><h2>Know who owns each agent, what it can do, and what it did.</h2><p>Once recorded, a Qlix audit entry is cryptographically impossible to modify.</p></div>
        <ul className="p1-check-list">{GOVERNANCE_ITEMS.map((item) => <li key={item}>{item}</li>)}</ul>
      </motion.section>

      <motion.section className="p1-section" {...reveal}>
        <div className="p1-section-heading"><span className="p1-eyebrow">WHO QLIX IS FOR</span><h2>Built for organisations moving from AI experiments to operations.</h2></div>
        <div className="p1-audience-grid">{AUDIENCES.map((item, index) => <div key={item}><span>0{index + 1}</span><p>{item}</p></div>)}</div>
      </motion.section>

      <motion.section className="p1-section p1-tinted" {...reveal}>
        <div className="p1-section-heading"><span className="p1-eyebrow">ENGAGEMENT PROCESS</span><h2>Start with one valuable, governable workflow.</h2></div>
        <ol className="p1-steps p1-engagement"><li><span>01</span><div><h3>Discover</h3><p>Select the workflow and define the desired business outcome.</p></div></li><li><span>02</span><div><h3>Design</h3><p>Map systems, permissions, policies, ownership, and approval points.</p></div></li><li><span>03</span><div><h3>Implement</h3><p>Deploy into a controlled environment and validate the workflow.</p></div></li><li><span>04</span><div><h3>Expand</h3><p>Review outcomes and extend Qlix to additional workflows when ready.</p></div></li></ol>
      </motion.section>

      <motion.section className="p1-section p1-faq" {...reveal}>
        <div className="p1-section-heading"><span className="p1-eyebrow">FAQ</span><h2>Questions about Qlix.</h2></div>
        <div className="p1-faq-list">{FAQS.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden>+</span></summary><p>{answer}</p></details>)}</div>
      </motion.section>

      <motion.section className="p1-final-cta" {...reveal}>
        <span className="p1-eyebrow">START WITH QLIX</span><h2>Deploy AI agents with control built in.</h2><p>Identify the right workflow, define its operating boundaries, and build a controlled path to deployment.</p>
        <div className="p1-cta-row"><Link className="p1-button p1-button-primary" to="/contact">Request a Demo</Link><a className="p1-button p1-button-secondary" href="https://qlix.exora.solutions">Explore Qlix</a></div>
      </motion.section>
    </main>
  );
}

export default HomePage;
