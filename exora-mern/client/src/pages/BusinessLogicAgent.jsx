import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CardNav from '../components/CardNav';
import HowItWorks from '../components/HowItWorks';
import SeeHowItWorksButton from '../components/SeeHowItWorksButton';
import './InventoryProcurementAgent.css';
import './AgentThemes.css';

/* ─── Workflow step data ─── */
const STEPS = [
  { t: 'Event ingestion', d: 'Every business event — a new order, a contract submission, a discount request — is captured and passed to the rule engine with full context attached.' },
  { t: 'Rule matching', d: 'The engine scans your active rule library and identifies which rules apply to the incoming event based on type, value, user role, and metadata.' },
  { t: 'Condition evaluation', d: 'Each matched rule is evaluated against the event\'s data. Complex multi-condition rules are resolved in a single pass with consistent priority ordering.' },
  { t: 'Decision output', d: 'A structured decision is produced: approve, reject, escalate, or flag. The decision includes the rule ID and rationale for full traceability.' },
  { t: 'Action routing', d: 'The decision is dispatched to the appropriate system or team — automatically. Approved actions proceed; escalations land in the right inbox instantly.' },
  { t: 'Enforcement logged', d: 'Every decision is written to the audit log with timestamp, rule version, input data, and outcome — ready for compliance review at any time.' },
];

/* ─── Capability icons ─── */
const IconRuleEngine = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#a89fef" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 9l3 3 7-6" /><rect x="2" y="2" width="14" height="14" rx="3" />
  </svg>
);
const IconRouting = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#a89fef" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 2v4M9 12v4M2 9h4M12 9h4" /><circle cx="9" cy="9" r="3" />
  </svg>
);
const IconVersioning = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#a89fef" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 5h12M3 9h9M3 13h6" />
  </svg>
);
const IconRealtime = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#a89fef" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="7" /><path d="M9 5v5l3 2" />
  </svg>
);
const IconException = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#a89fef" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l10 10M14 4L4 14" /><circle cx="9" cy="9" r="7" />
  </svg>
);
const IconSync = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#a89fef" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="14" height="11" rx="2" /><path d="M6 3v12M12 3v12" />
  </svg>
);
const IconAlert = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#D85A30" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="9" /><path d="M11 4v7M11 15v1" />
  </svg>
);

/* ─── Workflow node icons ─── */
const WF_NODES = [
  <svg key="0" width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="#c4bdf5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 9h10M9 4v10" /><circle cx="9" cy="9" r="6" />
  </svg>,
  <svg key="1" width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="#c4bdf5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 5h12M3 9h9M3 13h6" />
  </svg>,
  <svg key="2" width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="#c4bdf5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3v6l4 2" /><circle cx="9" cy="11" r="5" />
  </svg>,
  <svg key="3" width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="#c4bdf5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 9l3 3 5-5" /><rect x="2" y="2" width="14" height="14" rx="3" />
  </svg>,
  <svg key="4" width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="#c4bdf5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9h8M8 6l3 3-3 3" /><rect x="12" y="7" width="3" height="4" rx="1" />
  </svg>,
  <svg key="5" width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="#c4bdf5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 9l3.5 3.5L14 6" />
  </svg>,
];

const WF_LABELS = ['Input event', 'Match rules', 'Evaluate', 'Decide', 'Route action', 'Enforce'];

const CARD_NAV_ITEMS = [
  { label: 'About', bgColor: '#0D0716', textColor: '#fff', links: [{ label: 'About', ariaLabel: 'About page', href: '/about' }, { label: 'Career', ariaLabel: 'Career info', href: '/career' }] },
  { label: 'Products', bgColor: '#170D27', textColor: '#fff', links: [{ label: 'Products', ariaLabel: 'Products page', href: '/products' }, { label: 'Solutions', ariaLabel: 'Solutions', href: '/solutions' }] },
  { label: 'Contact', bgColor: '#271E37', textColor: '#fff', links: [{ label: 'Contact', ariaLabel: 'Contact us', href: '/contact#contact' }] },
];

const CAPS = [
  { Icon: IconRuleEngine, title: 'Rule engine', desc: 'Define complex if-then-else logic, multi-condition rules, and nested policies in plain language or structured format.' },
  { Icon: IconRouting, title: 'Dynamic routing', desc: 'Routes decisions, approvals, and exceptions to the right teams automatically based on rule outcomes and thresholds.' },
  { Icon: IconVersioning, title: 'Policy versioning', desc: 'Track every rule change with full version history. Roll back policies instantly when business requirements shift.' },
  { Icon: IconRealtime, title: 'Real-time decisions', desc: 'Evaluates requests against active rules in under 50ms — no queuing, no batch processing, no lag.' },
  { Icon: IconException, title: 'Exception handling', desc: 'Captures edge cases, escalates anomalies, and logs every exception with full context for audit and review.' },
  { Icon: IconSync, title: 'Multi-system sync', desc: 'Pushes rule outcomes to ERP, CRM, and databases simultaneously — one source of truth, everywhere.' },
];

const SCENARIOS = [
  { num: '01', title: 'Discount approval gates', desc: 'Discounts below 10% auto-approve. 10–25% routes to team lead. Above 25% escalates to CFO — automatically, no manual triage needed.' },
  { num: '02', title: 'Contract spend limits', desc: 'Purchase contracts over $50K trigger dual-sign-off. Contracts exceeding annual vendor budget flag for reallocation review.' },
  { num: '03', title: 'Employee access tiers', desc: 'Role-based access enforced on every request. New employee accounts are auto-provisioned at base tier and escalated post-onboarding approval.' },
  { num: '04', title: 'Regional pricing rules', desc: 'Applies geo-specific pricing, tax rules, and compliance constraints automatically based on customer location and product category.' },
];

/* ═══════════════════════════════════════
   Main Component
═══════════════════════════════════════ */
const BusinessLogicAgent = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="ip-page">
      <CardNav items={CARD_NAV_ITEMS} baseColor="rgba(255,255,255,0.08)" menuColor="#fff" buttonBgColor="rgba(17,17,17,0.75)" buttonTextColor="#fff" ease="power3.out" />

      <div className="ip-content">


        {/* HERO */}
        <motion.div 
          className="ip-hero w-full max-w-7xl mx-auto px-6" 
          initial={{ opacity: 0, y: 24 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
        >
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-32 items-center w-full">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-[850px]">
              <div className="blg-badge">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#a89fef" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 6h3l1-4 2 8 1-4h3" />
                </svg>
                AGENT · BUSINESS LOGIC
              </div>
              <h1 className="ip-hero-title">Business Logic<br />Agent</h1>
              <p className="ip-hero-sub">
                Encode your company's rules, policies, and decision frameworks into an intelligent agent that enforces them consistently — across every workflow, every time.
              </p>
              <div className="blg-cta-row mt-6 justify-center lg:justify-start">
                <SeeHowItWorksButton />
              </div>
            </div>

            {/* Decision Console Mockup */}
            <div className="w-full">
              <div className="bg-[#09090b] border border-white/10 rounded-[20px] md:rounded-[24px] p-5 md:p-8 shadow-[0_0_30px_rgba(127,119,221,0.1)] hover:shadow-[0_0_50px_rgba(127,119,221,0.2)] transition-all duration-500 w-full text-left font-sans">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                  <h3 className="text-[17px] md:text-[18px] font-bold text-white tracking-tight">Policy Decision Hub</h3>
                  <div className="flex gap-1.5 md:gap-2">
                    <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-[#E56A5B]"></div>
                    <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-[#E3B052]"></div>
                    <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-[#5FB87B]"></div>
                  </div>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                  {[
                    { label: 'Discount_Request', val: '15%', match: 'Rule_Tier2_Auth', res: 'ROUTE_MANAGER', color: '#a89fef' },
                    { label: 'Contract_Spend', val: '$52,000', match: 'Rule_DualSignOff', res: 'ROUTE_CFO', color: '#c084fc' },
                    { label: 'Access_Role', val: 'DevOps', match: 'RoleBasedAccess', res: 'ALLOW_SSH', color: '#34d399' }
                  ].map((row, i) => (
                    <div key={i} className="p-3 md:p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/[0.08] transition-all group">
                      <div className="flex justify-between items-center mb-1.5 md:mb-2">
                        <span className="text-[9px] md:text-[11px] text-white/40 font-bold uppercase tracking-wider">{row.label}</span>
                        <span className="text-[9px] md:text-[11px] font-mono text-purple-400">{row.match}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[14px] md:text-white font-medium">{row.val}</span>
                        <span className="px-1.5 md:px-2 py-0.5 bg-white/10 rounded text-[9px] md:text-[10px] font-bold text-white group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors">
                          {row.res}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[11px] text-white/40 font-bold uppercase tracking-wider">Evaluation Latency</span>
                    <span className="text-[11px] text-emerald-400 font-mono">42ms</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-500"
                      initial={{ width: '0%' }}
                      animate={{ width: '92%' }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* STATS */}
        <motion.div className="blg-stats-bar" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
          {[
            { num: '99.8%', label: 'Policy accuracy' },
            { num: '<50ms', label: 'Decision latency' },
            { num: '500+', label: 'Rules supported' },
            { num: '24/7', label: 'Enforcement' },
          ].map((s, i) => (
            <div className="blg-stat-item" key={i}>
              <div className="blg-stat-num">{s.num}</div>
              <div className="blg-stat-label">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* CAPABILITIES */}
        <motion.section className="ip-section" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }}>
          <p className="ip-section-label">Capabilities</p>
          <div className="ip-caps-grid ip-caps-grid--wide">
            {CAPS.map(({ Icon, title, desc }) => (
              <div className="ip-cap-card" key={title}>
                <div className="ip-cap-icon"><Icon /></div>
                <div className="ip-cap-title">{title}</div>
                <div className="ip-cap-desc">{desc}</div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section id="how-it-works" className="ip-section" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }}>
          <p className="ip-section-label">How it works</p>
          <HowItWorks 
            steps={STEPS.map((s, i) => ({ ...s, label: WF_LABELS[i], title: s.t, description: s.d }))}
            nodes={WF_NODES}
            themeColor="#a855f7"
          />
        </motion.section>

        {/* RULE SCENARIOS */}
        <motion.section className="ip-section" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }}>
          <p className="ip-section-label">Example rule scenarios</p>
          <div className="blg-rules-grid">
            {SCENARIOS.map(({ num, title, desc }) => (
              <div className="blg-rule-card" key={num}>
                <div className="blg-rule-num">SCENARIO {num}</div>
                <div className="blg-rule-title">{title}</div>
                <div className="blg-rule-desc">{desc}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* PROBLEM SOLVED */}
        <motion.section className="ip-section ip-section--last" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }}>
          <p className="ip-section-label">Problem solved</p>
          <div className="ip-problem-card">
            <div className="ip-problem-icon" aria-hidden="true"><IconAlert /></div>
            <div>
              <div className="ip-problem-title">Inconsistent policy enforcement</div>
              <p className="ip-problem-desc">
                Manual rule enforcement leads to human error, inconsistent decisions, and compliance gaps. The Business Logic Agent applies your exact rules at machine speed — every time, with zero drift.
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default BusinessLogicAgent;
