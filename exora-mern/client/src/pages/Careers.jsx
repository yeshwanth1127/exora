import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import CardNav from '../components/CardNav';
import '../components/Footer.css';

/* ─── icons ─── */
const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const CheckIcon = () => <Icon d="M20 6L9 17l-5-5" size={16} />;
const ArrowIcon = () => <Icon d="M5 12h14M12 5l7 7-7 7" size={15} />;
const PinIcon  = () => <Icon d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z M12 6.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" size={14} />;
const BagIcon  = () => <Icon d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2 M2 7h20v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" size={14} />;
const ClockIcon= () => <Icon d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2" size={14} />;

/* ─────────────────── NAV DATA ─────────────────── */
const CARD_NAV_ITEMS = [
  { label: 'About', bgColor: '#0D0716', textColor: '#fff', links: [{ label: 'About', ariaLabel: 'About page', href: '/about' }, { label: 'Career', ariaLabel: 'Career info', href: '/career' }] },
  { label: 'Products', bgColor: '#170D27', textColor: '#fff', links: [{ label: 'Products', ariaLabel: 'Products page', href: '/products' }, { label: 'Solutions', ariaLabel: 'Solutions', href: '/solutions' }] },
  { label: 'Contact', bgColor: '#271E37', textColor: '#fff', links: [{ label: 'Contact', ariaLabel: 'Contact us', href: '/contact#contact' }] },
];

/* ─────────────────── DATA ─────────────────── */
const roles = {
  intern: {
    sales: {
      title: 'Sales Intern',
      location: 'Bangalore',
      area: 'AECS Layout, Brookfield',
      commute: 'Within 20 km',
      type: 'Internship · Full-time',
      joining: 'Immediate',
      languages: 'EN / KN / HI',
      applyLink: 'https://lnkd.in/g6GgEFMS',
      eyebrow: 'Open Position',
      tag: 'Now Hiring',
      hero: 'Sales Intern',
      heroBold: 'Bangalore',
      sub: 'Join a growing team, build real sales skills, and grow your career — with hands-on exposure from day one.',
      about: {
        label: 'About the Role',
        title: 'Make an impact from day one',
        body: `We're looking for an energetic, confident, and self-driven individual to join our Bangalore sales team as an intern. You'll work directly on live sales activities, interact with real clients, and gain the kind of hands-on experience that most roles don't offer until years in. At Exora, our AI automation platform is reshaping how businesses operate — and our sales team is the engine that brings that transformation to clients. If you have a growth mindset and thrive in a target-oriented environment, this is where you belong.`,
      },
      requirements: [
        'Handle sales activities and support internal company tools',
        'Strong communication skills in English, Kannada & Hindi',
        'Comfortable with cold calling and direct client interactions',
        'Self-driven, eager to learn, and target-oriented',
        'Positive attitude with a growth mindset',
      ],
      benefits: [
        { icon: 'M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z', title: 'Real Sales Exposure', desc: 'Work on live deals and client interactions — not mock exercises.' },
        { icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z', title: 'Hands-on Experience', desc: 'Industry-grade experience that accelerates your career trajectory.' },
        { icon: 'M2 3h20v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z M8 21h8M12 17v4', title: 'CRM & Business Tools', desc: 'Skill development in CRM platforms, Google Workspace & modern sales tools.' },
        { icon: 'M22 12h-4l-3 9L9 3l-3 9H2', title: 'Grow With Us', desc: 'Real opportunity to transition into a full-time role as the company scales.' },
      ],
      skills: ['Cold Calling','CRM','Google Workspace','Client Relations','Communication','Lead Generation','Sales Strategy'],
    },
    software: {
      title: 'Software Dev Intern',
      location: 'Bangalore',
      area: 'AECS Layout, Brookfield',
      commute: 'Within 20 km / Remote considered',
      type: 'Internship · Full-time',
      joining: 'Immediate',
      languages: 'EN',
      applyLink: 'https://lnkd.in/g6GgEFMS',
      eyebrow: 'Open Position',
      tag: 'Now Hiring',
      hero: 'Software Dev',
      heroBold: 'Intern',
      sub: 'Ship real features on Exora\'s AI automation platform. No toy projects — you\'ll build, break, and fix production-grade code from week one.',
      about: {
        label: 'About the Role',
        title: 'Build AI products that matter',
        body: `Exora is an AI automation and assistance hub — we build intelligent agents that amplify human potential for businesses at any scale. As a Software Dev Intern, you'll be embedded in our core product team, contributing to real features, squashing real bugs, and shipping to real users. You'll get mentorship, code reviews, and ownership over meaningful tasks. If you can think in systems and love turning ideas into working software, we want you on our team.`,
      },
      requirements: [
        'Proficient in JavaScript/TypeScript or Python (or both)',
        'Familiarity with React, Node.js, or FastAPI',
        'Basic understanding of APIs, databases, and version control (Git)',
        'Curiosity about AI/ML tooling and automation workflows',
        'Ability to read documentation and debug independently',
        'Strong written communication for async collaboration',
      ],
      benefits: [
        { icon: 'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18', title: 'Production Codebase', desc: 'Contribute to a live AI platform — not a sandbox project.' },
        { icon: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 8v4l3 3', title: 'Mentored Growth', desc: 'Weekly code reviews and 1-on-1 mentorship from senior engineers.' },
        { icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', title: 'AI-First Stack', desc: 'Hands-on with LLMs, agent frameworks, and automation pipelines.' },
        { icon: 'M22 12h-4l-3 9L9 3l-3 9H2', title: 'Path to Full-Time', desc: 'Strong performers get offers — we grow from within.' },
      ],
      skills: ['React','TypeScript','Python','Node.js','REST APIs','Git','AI Agents','LLM Tools'],
    },
  },
  fulltime: {
    sales: {
      title: 'Sales Executive',
      location: 'Bangalore',
      area: 'AECS Layout, Brookfield',
      commute: 'Within 25 km preferred',
      type: 'Full-time · Permanent',
      joining: 'Immediately',
      languages: 'EN / KN / HI',
      applyLink: 'https://lnkd.in/g6GgEFMS',
      eyebrow: 'Full-Time Role',
      tag: 'Hiring',
      hero: 'Sales Executive',
      heroBold: 'Bangalore',
      sub: 'Own your pipeline, exceed targets, and help businesses unlock AI automation — with uncapped commission and room to lead.',
      about: {
        label: 'About the Role',
        title: 'Own the revenue line',
        body: `As a Sales Executive at Exora, you will be a key driver of our growth. You'll identify and close new business for our AI automation platform, build lasting client relationships, and help shape sales strategy from the front lines. This is a hunter role for someone who loves the thrill of the close and the satisfaction of real client impact. Exora's AI agents help businesses automate repetitive workflows and scale intelligently — your job is to put that power in the right hands. You'll report directly to leadership and have visibility across the full sales funnel.`,
      },
      requirements: [
        '1–3 years of B2B or SaaS sales experience',
        'Proven track record of meeting or exceeding quotas',
        'Strong fluency in English; Kannada and Hindi a strong plus',
        'Experience with CRM tools (HubSpot, Salesforce, or similar)',
        'Excellent negotiation, objection-handling, and closing skills',
        'Comfortable operating in a fast-paced, early-stage environment',
        'Self-starter who can manage a full sales cycle independently',
      ],
      benefits: [
        { icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', title: 'Uncapped Commission', desc: 'Competitive base + uncapped commission tied to your results.' },
        { icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75', title: 'Leadership Track', desc: 'High performers move to Sales Lead or Head of Sales roles quickly.' },
        { icon: 'M22 12h-4l-3 9L9 3l-3 9H2', title: 'Cutting-Edge Product', desc: 'Sell an AI automation platform that genuinely solves business problems.' },
        { icon: 'M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z', title: 'Real Ownership', desc: 'Shape territory strategy, messaging, and go-to-market with leadership.' },
      ],
      skills: ['B2B Sales','SaaS Sales','CRM','Negotiation','Pipeline Management','Cold Outreach','Account Management','AI Products'],
    },
    software: {
      title: 'Software Engineer',
      location: 'Bangalore',
      area: 'AECS Layout, Brookfield',
      commute: 'Hybrid (2–3 days on-site)',
      type: 'Full-time · Permanent',
      joining: 'Immediately',
      languages: 'EN',
      applyLink: 'https://lnkd.in/g6GgEFMS',
      eyebrow: 'Full-Time Role',
      tag: 'Hiring',
      hero: 'Software Engineer',
      heroBold: 'Bangalore',
      sub: 'Architect and ship the AI automation infrastructure powering Exora\'s platform — with full ownership and a talented team behind you.',
      about: {
        label: 'About the Role',
        title: 'Build the AI layer of modern business',
        body: `Exora is building an AI automation and assistance hub — intelligent agents that amplify human potential for every business at any scale. As a Software Engineer, you will design, build, and own core parts of our platform: from agent orchestration pipelines to client-facing APIs to the product features that our customers use daily. You'll work with a lean, high-ownership team where your decisions matter and your code ships. We value engineers who think product-first, write clean maintainable systems, and love the challenge of building in an AI-native codebase.`,
      },
      requirements: [
        '2+ years of professional software development experience',
        'Strong in TypeScript/JavaScript or Python — preferably both',
        'Experience building and deploying REST or GraphQL APIs',
        'Comfortable with cloud infrastructure (AWS, GCP, or Azure)',
        'Familiarity with LLM APIs, agent frameworks, or AI tooling is a major plus',
        'Solid understanding of databases (SQL and/or NoSQL)',
        'Strong grasp of software design patterns and system architecture',
        'Excellent debugging skills and engineering judgment',
      ],
      benefits: [
        { icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', title: 'AI-Native Stack', desc: 'Build with LLMs, vector stores, and agent orchestration from day one.' },
        { icon: 'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18', title: 'Full Ownership', desc: 'Own features end-to-end — from design through deployment.' },
        { icon: 'M22 12h-4l-3 9L9 3l-3 9H2', title: 'Competitive Package', desc: 'Market-rate salary, equity conversation, and performance bonuses.' },
        { icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87', title: 'Small, Sharp Team', desc: 'Work directly with founders — no bureaucracy, high impact.' },
      ],
      skills: ['TypeScript','Python','React','Node.js','FastAPI','AWS','LLM APIs','System Design','PostgreSQL','Docker'],
    },
  },
};

/* ─────────────────── ROLE PAGE ─────────────────── */
const RolePage = ({ role, onBack }) => {
  const cv = {
    hidden:   { opacity: 0 },
    visible:  { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const iv = {
    hidden:  { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
  };
  return (
    <motion.div className="careers-content" variants={cv} initial="hidden" animate="visible">
      {/* hero */}
      <div className="careers-hero">
        <motion.div className="careers-breadcrumb" variants={iv}>
          <div className="careers-breadcrumb-text">
            <button className="crumb-btn" onClick={onBack}>Careers</button>
            <span>/</span>
            <span className="crumb-active">{role.title}</span>
          </div>
          <div className="nav-tag">{role.tag}</div>
        </motion.div>

        <motion.div className="hero-eyebrow" variants={iv}>{role.eyebrow}</motion.div>
        <motion.h1 className="hero-title" variants={iv}>
          {role.hero}<br /><strong>{role.heroBold}</strong>
        </motion.h1>
        <motion.p className="hero-sub" variants={iv}>{role.sub}</motion.p>

        <motion.div className="meta-row" variants={iv}>
          <div className="meta-pill"><PinIcon /><strong>{role.area}</strong>&nbsp;· {role.commute}</div>
          <div className="meta-pill"><BagIcon /><strong>{role.type}</strong></div>
          <div className="meta-pill"><ClockIcon /><strong>{role.joining} Joining</strong></div>
        </motion.div>

        <motion.div className="cta-row" variants={iv}>
          <a href={role.applyLink} target="_blank" rel="noopener noreferrer" className="btn-primary-career">
            Apply Now <ArrowIcon />
          </a>
          <a href="#details" className="btn-secondary-career">View Details</a>
        </motion.div>
      </div>

      <hr className="careers-divider" />

      {/* body */}
      <div className="careers-body-grid" id="details">
        {/* left */}
        <div>
          <motion.div className="careers-section" variants={iv}>
            <div className="careers-section-label">{role.about.label}</div>
            <h2 className="careers-section-title">{role.about.title}</h2>
            <p className="careers-section-body">{role.about.body}</p>
          </motion.div>

          <motion.div className="careers-section" variants={iv}>
            <div className="careers-section-label">Role Requirements</div>
            <h2 className="careers-section-title">What we're looking for</h2>
            <ul className="req-list">
              {role.requirements.map((r, i) => (
                <li key={i}>
                  <span className="req-check"><CheckIcon /></span>
                  {r}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div className="careers-section" variants={iv}>
            <div className="careers-section-label">Why Join Us</div>
            <h2 className="careers-section-title">What you'll get</h2>
            <div className="careers-benefits-grid">
              {role.benefits.map((b, i) => (
                <div className="benefit-card" key={i}>
                  <svg className="benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    {b.icon.split(' M').map((seg, j) => <path key={j} d={j === 0 ? seg : 'M' + seg} />)}
                  </svg>
                  <div className="benefit-title">{b.title}</div>
                  <div className="benefit-desc">{b.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* sidebar */}
        <aside className="careers-sidebar">
          <motion.div className="sidebar-card" variants={iv}>
            <div className="sidebar-card-head">
              <div className="sidebar-card-head-title">Ready to apply?</div>
              <div className="sidebar-card-head-sub">Takes less than 2 minutes</div>
            </div>
            <div className="sidebar-card-body">
              <a href={role.applyLink} target="_blank" rel="noopener noreferrer" className="btn-primary-career" style={{width:'100%',justifyContent:'center',marginBottom:16}}>
                Apply Now <ArrowIcon />
              </a>
              <ul className="job-detail-list">
                {[
                  ['Role', role.title],
                  ['Type', role.type],
                  ['Location', role.location],
                  ['Area', role.area],
                  ['Commute', role.commute],
                  ['Languages', role.languages],
                ].map(([l, v]) => (
                  <li key={l} className="job-detail-item">
                    <span className="job-detail-label">{l}</span>
                    <span className="job-detail-value">{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div className="skills-card" variants={iv}>
            <div className="skills-label">Skills you'll develop</div>
            <div className="skills-tags">
              {role.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
            </div>
          </motion.div>
        </aside>
      </div>

      <hr className="careers-divider" />
      <footer className="careers-footer">
        <p className="footer-text">© 2026 · <span className="footer-exora-brand">Exora</span> · {role.title} · Bangalore</p>
        <a href={role.applyLink} target="_blank" rel="noopener noreferrer" className="footer-link">Apply via LinkedIn →</a>
      </footer>
    </motion.div>
  );
};

/* ─────────────────── MAIN LISTING ─────────────────── */
const ListingCard = ({ track, roleKey, role, onClick }) => (
  <motion.div
    className="listing-card"
    whileHover={{ y: -3, borderColor: 'rgba(168,85,247,0.55)' }}
    transition={{ duration: 0.2 }}
    onClick={() => onClick(track, roleKey)}
  >
    <div className="listing-card-top">
      <div>
        <div className="listing-eyebrow">{track === 'intern' ? 'Internship' : 'Full-Time'}</div>
        <div className="listing-title">{role.title}</div>
        <div className="listing-sub">{role.location} · {role.area}</div>
      </div>
      <div className="listing-tag">{role.tag}</div>
    </div>
    <p className="listing-desc">{role.sub}</p>
    <div className="listing-skills">
      {role.skills.slice(0, 4).map(s => <span key={s} className="skill-tag">{s}</span>)}
      {role.skills.length > 4 && <span className="skill-tag-more">+{role.skills.length - 4}</span>}
    </div>
    <div className="listing-footer">
      <div className="listing-meta">
        <span><BagIcon /> {role.type}</span>
        <span><ClockIcon /> {role.joining}</span>
      </div>
      <button className="listing-cta">View Role <ArrowIcon /></button>
    </div>
  </motion.div>
);

/* ─────────────────── CAREERS PAGE ─────────────────── */
const Careers = () => {
  const [view, setView] = useState('listing'); // 'listing' | {track, role}
  const [activeTrack, setActiveTrack] = useState('intern');

  useEffect(() => {
    const tag = document.createElement('style');
    tag.id = 'careers-styles';
    tag.textContent = CSS;
    if (!document.getElementById('careers-styles')) {
      document.head.appendChild(tag);
    }
    return () => { const el = document.getElementById('careers-styles'); if (el) el.remove(); };
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  const openRole = (track, roleKey) => setView({ track, roleKey });
  const goBack   = () => setView('listing');

  if (view !== 'listing') {
    const role = roles[view.track][view.roleKey];
    return (
      <div className="careers-page">
        <CardNav items={CARD_NAV_ITEMS} baseColor="rgba(255,255,255,0.08)" menuColor="#fff" buttonBgColor="rgba(17,17,17,0.75)" buttonTextColor="#fff" ease="power3.out" />
        <div style={{ marginTop: '20px' }}>
          <RolePage role={role} onBack={goBack} />
        </div>
      </div>
    );
  }

  const trackRoles = roles[activeTrack];

  return (
    <div className="careers-page">
      <CardNav items={CARD_NAV_ITEMS} baseColor="rgba(255,255,255,0.08)" menuColor="#fff" buttonBgColor="rgba(17,17,17,0.75)" buttonTextColor="#fff" ease="power3.out" />

      <motion.div
        className="careers-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* listing hero */}
        <div className="listing-hero">
          <motion.div className="hero-eyebrow" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
            Open Positions
          </motion.div>
          <motion.h1 className="hero-title" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.18 }}>
            Join Exora<br /><strong>Build what's next</strong>
          </motion.h1>
          <motion.p className="hero-sub" style={{ maxWidth: 540 }} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.26 }}>
            We're a lean, ambitious team building AI agents that transform how businesses operate. Find your role below.
          </motion.p>

          {/* track toggle */}
          <motion.div className="track-toggle" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.34 }}>
            <button
              className={`track-btn${activeTrack === 'intern' ? ' active' : ''}`}
              onClick={() => setActiveTrack('intern')}
            >
              Internship
            </button>
            <button
              className={`track-btn${activeTrack === 'fulltime' ? ' active' : ''}`}
              onClick={() => setActiveTrack('fulltime')}
            >
              Full-Time
            </button>
          </motion.div>
        </div>

        {/* role cards */}
        <div className="listing-grid">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTrack}
              className="listing-inner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <div className="track-label">
                {activeTrack === 'intern' ? '🎓 Internship Roles' : '💼 Full-Time Roles'}
                <span className="track-count">{Object.keys(trackRoles).length} open</span>
              </div>
              <div className="listing-cards">
                {Object.entries(trackRoles).map(([key, role]) => (
                  <ListingCard key={key} track={activeTrack} roleKey={key} role={role} onClick={openRole} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <hr className="careers-divider" />
        <footer className="careers-footer">
          <p className="footer-text">© 2026 · <span className="footer-exora-brand">Exora</span> · Bangalore</p>
          <span className="footer-text">AI Automation & Assistance Hub</span>
        </footer>
      </motion.div>

    </div>
  );
};

/* ─────────────────── CSS ─────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.careers-page {
  --bg: #07070f;
  --surface: rgba(16,16,24,0.6);
  --surface2: rgba(31,31,48,0.85);
  --border: rgba(168,85,247,0.2);
  --border2: rgba(168,85,247,0.4);
  --text: #f4f4f4;
  --text2: #a8a8a8;
  --text3: #6f6f6f;
  --accent: #a855f7;
  --accent2: #c084fc;
  --green: #24a148;
  --green-bg: #071908;
  --mono: 'IBM Plex Mono', monospace;
  --sans: 'IBM Plex Sans', sans-serif;

  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  font-size: 16px;
  line-height: 1.6;
  min-height: 100vh;
  position: relative;
}

/* ── NAV (CardNav used instead of careers-nav) ── */

/* ── CONTENT WRAPPER ── */
.careers-content { position: relative; z-index: 1; }

/* ── LISTING HERO ── */
.listing-hero {
  padding: 100px 48px 64px;
  max-width: 1100px; margin: 0 auto;
}

/* ── HERO ── */
.careers-hero {
  padding: 100px 48px 64px;
  max-width: 1100px; margin: 0 auto;
}
.hero-eyebrow {
  font-family: var(--mono); font-size: 11px; color: var(--accent2);
  letter-spacing: .15em; text-transform: uppercase; margin-bottom: 20px;
  display: flex; align-items: center; gap: 10px;
}
.hero-eyebrow::before {
  content:''; display:inline-block; width:24px; height:1px; background: var(--accent2);
}
.hero-title {
  font-size: clamp(32px, 4.5vw, 52px); font-weight: 300;
  line-height: 1.12; letter-spacing: -.02em; color: var(--text); margin-bottom: 24px;
}
.hero-title strong { font-weight: 600; color: #fff; }
.hero-sub {
  font-size: 17px; font-weight: 300; color: var(--text2);
  max-width: 520px; margin-bottom: 40px; line-height: 1.7;
}

/* ── TRACK TOGGLE ── */
.track-toggle {
  display: inline-flex; gap: 0;
  border: 1px solid var(--border2); border-radius: 3px; overflow: hidden;
  margin-bottom: 0;
}
.track-btn {
  font-family: var(--mono); font-size: 12px; letter-spacing: .08em;
  text-transform: uppercase; color: var(--text2);
  background: transparent; border: none; padding: 10px 28px;
  cursor: pointer; transition: background .2s, color .2s;
}
.track-btn.active { background: var(--accent); color: #fff; }
.track-btn:not(.active):hover { background: var(--surface2); color: var(--text); }

/* ── LISTING GRID ── */
.listing-grid {
  max-width: 1100px; margin: 0 auto; padding: 48px 48px 64px;
}
.listing-inner {}
.track-label {
  font-family: var(--mono); font-size: 12px; color: var(--text3);
  letter-spacing: .1em; text-transform: uppercase;
  margin-bottom: 20px; display: flex; align-items: center; gap: 16px;
}
.track-count {
  font-size: 11px; background: var(--surface); border: 1px solid var(--border);
  color: var(--accent2); padding: 2px 10px; border-radius: 20px;
}
.listing-cards {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
}

/* ── LISTING CARD ── */
.listing-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 3px; padding: 28px; cursor: pointer;
  transition: border-color .2s, background .2s, transform .2s;
  display: flex; flex-direction: column; gap: 16px;
}
.listing-card:hover { background: var(--surface2); }
.listing-card-top { display: flex; justify-content: space-between; align-items: flex-start; }
.listing-eyebrow {
  font-family: var(--mono); font-size: 10px; color: var(--text3);
  letter-spacing: .12em; text-transform: uppercase; margin-bottom: 6px;
}
.listing-title { font-size: 20px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
.listing-sub { font-size: 12px; color: var(--text3); font-family: var(--mono); }
.listing-tag {
  font-family: var(--mono); font-size: 10px; color: var(--green);
  background: var(--green-bg); border: 1px solid rgba(36,161,72,.25);
  padding: 4px 10px; border-radius: 2px; letter-spacing: .06em;
  white-space: nowrap; display: flex; align-items: center; gap: 5px;
  flex-shrink: 0; margin-left: 12px;
}
.listing-tag::before {
  content:''; width:5px; height:5px; border-radius:50%;
  background: var(--green); box-shadow: 0 0 6px var(--green);
}
.listing-desc { font-size: 14px; color: var(--text2); line-height: 1.65; }
.listing-skills { display: flex; flex-wrap: wrap; gap: 6px; }
.listing-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 12px; border-top: 1px solid var(--border);
}
.listing-meta {
  display: flex; gap: 16px; font-size: 12px; color: var(--text3);
}
.listing-meta span { display: flex; align-items: center; gap: 5px; }
.listing-meta svg { flex-shrink: 0; }
.listing-cta {
  font-family: var(--sans); font-size: 13px; color: var(--accent2);
  background: none; border: 1px solid rgba(168,85,247,.3);
  padding: 7px 16px; border-radius: 2px; cursor: pointer;
  display: inline-flex; align-items: center; gap: 7px;
  transition: background .2s, border-color .2s, color .2s;
}
.listing-cta:hover { background: rgba(168,85,247,.1); border-color: var(--accent2); color: #fff; }

/* ── BREADCRUMB ── */
.careers-breadcrumb {
  display: flex; align-items: center; justify-content: space-between;
  font-family: var(--mono); font-size: 13px; color: var(--text3);
  text-transform: uppercase; letter-spacing: .1em;
  margin-bottom: 40px; padding-bottom: 16px; border-bottom: 1px solid var(--border);
}
.careers-breadcrumb-text { display: flex; gap: 10px; align-items: center; }
.crumb-btn {
  font-family: var(--mono); font-size: 13px; color: var(--text2);
  background: none; border: none; cursor: pointer; letter-spacing: .1em;
  text-transform: uppercase; transition: color .2s;
}
.crumb-btn:hover { color: var(--accent2); }
.crumb-active { color: var(--accent2); }
.nav-tag {
  font-family: var(--mono); font-size: 11px; color: var(--green);
  background: var(--green-bg); border: 1px solid rgba(36,161,72,.25);
  padding: 4px 12px; border-radius: 2px; letter-spacing: .06em;
  display: flex; align-items: center; gap: 6px;
}
.nav-tag::before {
  content:''; width:6px; height:6px; background: var(--green);
  border-radius: 50%; box-shadow: 0 0 8px var(--green);
}

/* ── META PILLS ── */
.meta-row { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 48px; }
.meta-pill {
  display: flex; align-items: center; gap: 7px;
  font-size: 13px; color: var(--text2);
  background: var(--surface); border: 1px solid var(--border);
  padding: 8px 16px; border-radius: 2px;
}
.meta-pill svg { flex-shrink: 0; }
.meta-pill strong { color: var(--text); font-weight: 500; }

/* ── CTA ── */
.cta-row { display: flex; gap: 12px; flex-wrap: wrap; }
.btn-primary-career {
  display: inline-flex; align-items: center; gap: 10px;
  background: var(--accent); color: #fff !important;
  font-family: var(--sans); font-size: 15px; font-weight: 500;
  padding: 14px 28px; border: none; border-radius: 2px;
  cursor: pointer; text-decoration: none;
  transition: background .3s, transform .2s;
}
.btn-primary-career:hover { background: #9333ea; transform: translateY(-1px); }
.btn-secondary-career {
  display: inline-flex; align-items: center; gap: 8px;
  background: transparent; color: var(--text2);
  font-family: var(--sans); font-size: 15px; font-weight: 400;
  padding: 14px 28px; border: 1px solid var(--border2);
  border-radius: 2px; cursor: pointer; text-decoration: none;
  transition: border-color .2s, color .2s;
}
.btn-secondary-career:hover { border-color: var(--text2); color: var(--text); }

/* ── DIVIDER ── */
.careers-divider { border: none; border-top: 1px solid var(--border); margin: 0 48px; }

/* ── BODY GRID ── */
.careers-body-grid {
  max-width: 1100px; margin: 0 auto; padding: 64px 48px;
  display: grid; grid-template-columns: 1fr 340px; gap: 56px; align-items: start;
}
.careers-section { margin-bottom: 52px; }
.careers-section:last-child { margin-bottom: 0; }
.careers-section-label {
  font-family: var(--mono); font-size: 10px; color: var(--text3);
  letter-spacing: .14em; text-transform: uppercase;
  margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid var(--border);
}
.careers-section-title { font-size: 22px; font-weight: 500; color: var(--text); margin-bottom: 14px; }
.careers-section-body { font-size: 15px; color: var(--text2); line-height: 1.75; text-align: justify; hyphens: auto; }

/* ── REQ LIST ── */
.req-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
.req-list li {
  display: flex; align-items: flex-start; gap: 12px;
  font-size: 15px; color: var(--text2); padding: 13px 16px;
  background: var(--surface); border: 1px solid var(--border);
  border-left: 3px solid var(--accent); border-radius: 0 2px 2px 0;
  transition: background .2s;
}
.req-list li:hover { background: var(--surface2); }
.req-check { flex-shrink: 0; margin-top: 2px; color: var(--accent2); }

/* ── BENEFITS ── */
.careers-benefits-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.benefit-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 2px; padding: 22px 18px;
  display: flex; flex-direction: column;
  transition: border-color .2s, background .2s;
}
.benefit-card:hover { border-color: var(--accent); background: var(--surface2); }
.benefit-icon { width: 26px; height: 26px; color: var(--accent2); margin-bottom: 10px; }
.benefit-title { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 5px; }
.benefit-desc { font-size: 12px; color: var(--text3); line-height: 1.6; }

/* ── SIDEBAR ── */
.careers-sidebar { position: sticky; top: 76px; }
.sidebar-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 2px; overflow: hidden; margin-bottom: 14px;
}
.sidebar-card-head {
  background: linear-gradient(135deg, var(--accent), #7e22ce);
  padding: 18px 20px;
}
.sidebar-card-head-title { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 3px; }
.sidebar-card-head-sub { font-size: 12px; color: rgba(255,255,255,.7); }
.sidebar-card-body { padding: 20px; }
.job-detail-list { list-style: none; display: flex; flex-direction: column; }
.job-detail-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 13px;
}
.job-detail-item:last-child { border-bottom: none; }
.job-detail-label { color: var(--text3); }
.job-detail-value { color: var(--text); font-weight: 500; text-align: right; max-width: 60%; }

/* ── SKILLS ── */
.skills-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 2px; padding: 18px;
}
.skills-label {
  font-family: var(--mono); font-size: 10px; color: var(--text3);
  letter-spacing: .14em; text-transform: uppercase; margin-bottom: 12px;
}
.skills-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.skill-tag {
  font-family: var(--mono); font-size: 11px; color: var(--accent2);
  background: rgba(168,85,247,.08); border: 1px solid rgba(168,85,247,.2);
  padding: 3px 9px; border-radius: 2px; letter-spacing: .04em;
}
.skill-tag-more {
  font-family: var(--mono); font-size: 11px; color: var(--text3);
  background: var(--surface2); border: 1px solid var(--border);
  padding: 3px 9px; border-radius: 2px;
}

/* ── FOOTER ── */
.careers-footer {
  padding: 28px 48px; display: flex; justify-content: space-between;
  align-items: center; flex-wrap: wrap; gap: 12px;
  max-width: 1100px; margin: 0 auto;
}
.footer-text { font-size: 12px; color: var(--text3); }
.footer-link { font-size: 12px; color: var(--accent2); text-decoration: none; }
.footer-link:hover { text-decoration: underline; }

/* ── RESPONSIVE ── */
@media (max-width: 860px) {
  .careers-nav { padding: 0 20px; }
  .careers-hero, .listing-hero { padding: 80px 24px 40px; }
  .careers-divider { margin: 0 24px; }
  .careers-body-grid { grid-template-columns: 1fr; padding: 40px 24px; gap: 32px; }
  .careers-sidebar { position: static; }
  .careers-benefits-grid { grid-template-columns: 1fr; }
  .listing-grid { padding: 32px 24px 48px; }
  .listing-cards { grid-template-columns: 1fr; }
  .careers-footer { padding: 24px; }
}
`;

export default Careers;
