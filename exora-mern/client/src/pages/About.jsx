import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiLink2,
  FiCpu,
  FiZap,
  FiLayers,
  FiBox,
  FiShield,
  FiUsers,
  FiArrowRight,
} from 'react-icons/fi';
import './About.css';
import CardNav from '../components/CardNav';

const CARD_NAV_ITEMS = [
  {
    label: 'About',
    bgColor: '#0D0716',
    textColor: '#fff',
    links: [
      { label: 'About', ariaLabel: 'About page', href: '/about' },
      { label: 'Career', ariaLabel: 'Career info', href: '/career' },
    ],
  },
  {
    label: 'Products',
    bgColor: '#170D27',
    textColor: '#fff',
    links: [
      { label: 'Products', ariaLabel: 'Products page', href: '/products' },
      { label: 'Solutions', ariaLabel: 'Solutions', href: '/solutions' },
    ],
  },
  {
    label: 'Contact',
    bgColor: '#271E37',
    textColor: '#fff',
    links: [{ label: 'Contact', ariaLabel: 'Contact us', href: '/contact#contact' }],
  },
];

const PILLARS = [
  {
    icon: FiLink2,
    title: 'Connect everything',
    text: 'Your CRM, ERP, inboxes, spreadsheets, and custom tools — wired into one coherent system.',
  },
  {
    icon: FiCpu,
    title: 'Encode how you work',
    text: 'Your approvals, exceptions, and decision logic become software — not tribal knowledge.',
  },
  {
    icon: FiZap,
    title: 'Run without friction',
    text: 'Workflows execute continuously. Tasks move forward while your team focuses on judgment and growth.',
  },
  {
    icon: FiLayers,
    title: 'Orchestrate agents',
    text: 'Specialized AI agents operate as persistent operators inside your stack — not one-off chat sessions.',
  },
  {
    icon: FiBox,
    title: 'Own the operating layer',
    text: 'Exora becomes the core infrastructure your company runs on — the layer above tools, below strategy.',
  },
];

const BUILD_STEPS = [
  {
    num: '01',
    title: 'Infrastructure mapping',
    text: 'We map your processes, data flows, tools, and decision points — how work actually moves today.',
  },
  {
    num: '02',
    title: 'System architecture',
    text: 'We design a purpose-built operating architecture for your business — not a generic template.',
  },
  {
    num: '03',
    title: 'Core build',
    text: 'Data layer, workflow engines, agent layer, integrations, and control surfaces — built together.',
  },
  {
    num: '04',
    title: 'Deploy & migrate',
    text: 'You transition from scattered tools to a unified infrastructure — with continuity, not disruption.',
  },
  {
    num: '05',
    title: 'Continuous evolution',
    text: 'Your infrastructure grows as your company grows. New agents, workflows, and rules — without starting over.',
  },
];

const OFFERINGS = [
  {
    tag: 'For business',
    title: 'AI employees & agents',
    text: 'End-to-end tailored agents for support, operations, inventory, compliance, and more — embedded in how you run.',
    href: '/products',
    cta: 'View products',
  },
  {
    tag: 'For you',
    title: 'IRA — personal AI',
    text: 'An AI agent inside your daily tools and systems. Assistance that follows your work — not the other way around.',
    href: '/personal-ai',
    cta: 'Meet IRA',
  },
  {
    tag: 'For control',
    title: 'Qlix — agent ecosystem',
    text: 'Create agents, link verified humans, enforce permissions, approvals, and audit trails — at scale.',
    href: '/qlix',
    cta: 'Explore Qlix',
  },
];

const PRINCIPLES = [
  {
    icon: FiUsers,
    title: 'Humans stay in command',
    text: 'AI amplifies execution. Judgment, relationships, and creativity stay with your people.',
  },
  {
    icon: FiLayers,
    title: 'Operators, not chatbots',
    text: 'Our agents are persistent software operators running 24/7 inside your infrastructure — not disposable prompts.',
  },
  {
    icon: FiShield,
    title: 'Governed by design',
    text: 'Scoped permissions, just-in-time approvals, and audit proof — especially through Qlix for multi-agent environments.',
  },
  {
    icon: FiZap,
    title: 'Built to evolve',
    text: 'Infrastructure is never finished. Exora is designed to extend as your operations and ambitions expand.',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
};

const About = () => {
  return (
    <div className="about-page">
      <CardNav
        items={CARD_NAV_ITEMS}
        baseColor="rgba(255,255,255,0.08)"
        menuColor="#fff"
        buttonBgColor="rgba(17,17,17,0.75)"
        buttonTextColor="#fff"
        ease="power3.out"
      />

      <main className="about-container">
        <motion.header className="about-hero" {...fadeUp}>
          <p className="about-eyebrow">About Exora</p>
          <h1 className="about-title">
            Your business runs on <span className="about-title-accent">infrastructure</span> — not on tools.
          </h1>
          <p className="about-lead">
            Exora is an automation and assistance hub. We replace the fragile mix of apps, spreadsheets,
            and manual handoffs with a unified software layer — AI agents, workflows, and control built
            for how your company actually operates.
          </p>
        </motion.header>

        <motion.blockquote className="about-manifesto" {...fadeUp}>
          <p>We don&apos;t sell features. We install digital infrastructure.</p>
        </motion.blockquote>

        <motion.section className="about-block" {...fadeUp}>
          <div className="about-block-head">
            <span className="about-index">01</span>
            <h2 className="about-heading">The problem we solve</h2>
          </div>
          <div className="about-split">
            <div className="about-panel about-panel--dim">
              <h3>Today</h3>
              <p>
                Most companies run on disconnected tools, overloaded teams, and coordination held
                together by spreadsheets and memory. Automation is bolted on. Agents are experiments.
                Nothing talks to everything else.
              </p>
            </div>
            <div className="about-panel about-panel--accent">
              <h3>With Exora</h3>
              <p>
                One purpose-built operating layer: systems connected, logic encoded, execution
                automated, agents orchestrated. Your business moves on autopilot — with humans still
                in control.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section className="about-block" {...fadeUp}>
          <div className="about-block-head">
            <span className="about-index">02</span>
            <h2 className="about-heading">What we install</h2>
            <p className="about-block-desc">
              Software infrastructure that connects, encodes, automates, orchestrates, and becomes
              the core layer of your company.
            </p>
          </div>
          <ul className="about-pillars">
            {PILLARS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="about-pillar">
                <span className="about-pillar-icon" aria-hidden="true">
                  <Icon size={22} />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.section>

        <motion.section className="about-block" {...fadeUp}>
          <div className="about-block-head">
            <span className="about-index">03</span>
            <h2 className="about-heading">How we build it</h2>
            <p className="about-block-desc">
              Every engagement follows the same discipline — from discovery to infrastructure that
              keeps evolving.
            </p>
          </div>
          <ol className="about-steps">
            {BUILD_STEPS.map((step) => (
              <li key={step.num} className="about-step">
                <span className="about-step-num">{step.num}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </motion.section>

        <motion.section className="about-block" {...fadeUp}>
          <div className="about-block-head">
            <span className="about-index">04</span>
            <h2 className="about-heading">What runs on Exora</h2>
          </div>
          <div className="about-offerings">
            {OFFERINGS.map((item) => (
              <article key={item.title} className="about-offering">
                <span className="about-offering-tag">{item.tag}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <Link to={item.href} className="about-offering-link">
                  {item.cta}
                  <FiArrowRight size={16} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section className="about-block" {...fadeUp}>
          <div className="about-block-head">
            <span className="about-index">05</span>
            <h2 className="about-heading">What we believe</h2>
          </div>
          <div className="about-principles">
            {PRINCIPLES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="about-principle">
                <Icon size={20} className="about-principle-icon" aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section className="about-cta" {...fadeUp}>
          <h2>Ready to move off tools — onto infrastructure?</h2>
          <p>
            Start with a free automation audit. We&apos;ll map where you are and what an Exora layer
            could look like for your business.
          </p>
          <div className="about-cta-actions">
            <Link to="/contact" className="about-btn about-btn--primary">
              Book a free audit
            </Link>
            <Link to="/solutions" className="about-btn about-btn--ghost">
              See solutions
            </Link>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default About;
