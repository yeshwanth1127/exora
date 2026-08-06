import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CardNav from '../components/CardNav';
import HowItWorks from '../components/HowItWorks';
import SeeHowItWorksButton from '../components/SeeHowItWorksButton';
import './InventoryProcurementAgent.css';

/* ─── Workflow step data ─── */
const STEPS = [
  { t: 'Event capture', d: 'Configured agent and workflow events are captured with their relevant context, including access, approvals, and configuration changes.' },
  { t: 'Immutable logging', d: 'Each recorded event is hashed, signed, and written to Qlix\'s append-only audit record. Once recorded, an audit entry is cryptographically impossible to modify.' },
  { t: 'Policy check', d: 'The event is evaluated against your active compliance policies. Pass results are logged silently; violations trigger an immediate alert with full event context.' },
  { t: 'Anomaly flagging', d: 'Behavioural models detect unusual patterns — access outside working hours, sudden privilege escalations, abnormal data volumes — and surface them before they become incidents.' },
  { t: 'Report generation', d: 'Compliance reports are assembled automatically on a schedule or on demand. Every report includes signed log references so findings can be traced back to raw events.' },
  { t: 'Evidence preparation', d: 'Evidence packages can be structured for external review from configured records. Framework requirements remain specific to each organisation and deployment.' },
];

/* ─── Capability icons ─── */
const IconImmutable = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 5h10M4 9h10M4 13h6" /><rect x="2" y="2" width="14" height="14" rx="2.5" />
  </svg>
);
const IconTrace = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="14" height="11" rx="2" /><path d="M6 4V3a3 3 0 016 0v1" /><path d="M9 9v2" /><circle cx="9" cy="8" r="1" fill="#fde047" />
  </svg>
);
const IconReport = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 2l2 5h5l-4 3 1.5 5L9 12l-4.5 3L6 10 2 7h5z" />
  </svg>
);
const IconAnomaly = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="7" /><path d="M9 5v4" /><circle cx="9" cy="13" r="1" fill="#fde047" />
  </svg>
);
const IconRetention = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h12v12H3zM7 3v12M3 7h12" />
  </svg>
);
const IconEvidence = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 9l3 3 5-5" /><rect x="2" y="2" width="14" height="14" rx="3" />
  </svg>
);
const IconAlert = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#D85A30" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="9" /><path d="M11 6v6" /><path d="M11 16v0.5" />
  </svg>
);

/* ─── Workflow node icons ─── */
const WF_NODES = [
  <svg key="0" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c4bdf5" strokeWidth="1.6"><circle cx="10" cy="10" r="7.5" /><path d="M10 6v4.5l3 2" /></svg>,
  <svg key="1" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c4bdf5" strokeWidth="1.6"><path d="M4 10h12M10 4l6 6-6 6" /></svg>,
  <svg key="2" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c4bdf5" strokeWidth="1.6"><path d="M15 5l-8 8-4-4" /></svg>,
  <svg key="3" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c4bdf5" strokeWidth="1.6"><circle cx="10" cy="10" r="7" /></svg>,
  <svg key="4" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c4bdf5" strokeWidth="1.6"><path d="M10 3v14M3 10h14" /></svg>,
  <svg key="5" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c4bdf5" strokeWidth="2"><path d="M4.5 10.5l4 4L15.5 7" /></svg>,
];

const WF_LABELS = ['Capture', 'Log & Sign', 'Check Policy', 'Flag Anomaly', 'Report', 'Certify'];

const CAPS = [
  { Icon: IconImmutable, title: 'Immutable audit logs', desc: 'Recorded Qlix audit entries are hashed, signed, and cryptographically impossible to alter after they are written.' },
  { Icon: IconTrace, title: 'Access traceability', desc: 'Tracks configured access events with identity, timing, and available session context.' },
  { Icon: IconReport, title: 'Structured reporting', desc: 'Generates structured reports from recorded events and configured policies.' },
  { Icon: IconAnomaly, title: 'Anomaly flagging', desc: 'Surfaces unusual recorded patterns such as bulk exports or privilege escalations.' },
  { Icon: IconRetention, title: 'Data retention', desc: 'Applies configured retention and deletion schedules; legal requirements remain deployment-specific.' },
  { Icon: IconEvidence, title: 'Evidence packages', desc: 'Organises selected evidence for human and auditor review.' },
];

const LOG_ROWS = [
  { time: '15:42:08', badge: 'PASS', badgeColor: 'rgba(34, 197, 94, 0.2)', textColor: '#4ade80', event: 'User login — MFA verified', user: 'a.sharma@corp' },
  { time: '15:41:53', badge: 'PASS', badgeColor: 'rgba(34, 197, 94, 0.2)', textColor: '#4ade80', event: 'Contract #8821 approved', user: 'finance-bot' },
  { time: '15:40:17', badge: 'WARN', badgeColor: 'rgba(234, 179, 8, 0.2)', textColor: '#facc15', event: 'Bulk export: 4,200 records', user: 'r.patel@corp' },
  { time: '15:39:44', badge: 'PASS', badgeColor: 'rgba(34, 197, 94, 0.2)', textColor: '#4ade80', event: 'Vendor payment $12,400', user: 'procurement-agent' },
  { time: '15:38:02', badge: 'FAIL', badgeColor: 'rgba(239, 68, 68, 0.2)', textColor: '#f87171', event: 'Permission escalation rejected', user: 'm.jones@corp' },
  { time: '15:37:29', badge: 'INFO', badgeColor: 'rgba(59, 130, 246, 0.2)', textColor: '#60a5fa', event: 'Data retention applied', user: 'system' },
];

const CARD_NAV_ITEMS = [
  { label: 'About', bgColor: '#0D0716', textColor: '#fff', links: [{ label: 'About', href: '/about' }, { label: 'Career', href: '/contact' }] },
  { label: 'Products', bgColor: '#170D27', textColor: '#fff', links: [{ label: 'Products', href: '/products' }, { label: 'Solutions', href: '/solutions' }] },
  { label: 'Contact', bgColor: '#271E37', textColor: '#fff', links: [{ label: 'Contact', href: '/contact#contact' }] },
];

/* ─── Main Component ─── */
const AuditComplianceAgent = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="ip-page">
      <CardNav
        items={CARD_NAV_ITEMS}
        baseColor="rgba(255,255,255,0.08)"
        menuColor="#fff"
        buttonBgColor="rgba(17,17,17,0.75)"
        buttonTextColor="#fff"
        ease="power3.out"
      />

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
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-xs font-bold tracking-[0.2em] uppercase mb-8">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                   <path d="M6 1l1.5 3H11L8.5 6l1 3L6 7.5 2.5 9l1-3L1 4h3.5z" />
                </svg>
                Agent • Audit & Compliance
              </div>
              <h1 className="ip-hero-title">
                Audit &amp; Compliance<br />Agent
              </h1>
              <p className="ip-hero-sub">
                Creates cryptographically immutable audit records for configured events, supports on-demand reporting, and improves operational traceability.
              </p>
              <div className="flex gap-4 flex-wrap pb-10">
                <SeeHowItWorksButton />
              </div>
            </div>

            <div className="w-full">
              <div className="bg-[#09090b] border border-white/10 rounded-[20px] md:rounded-[2rem] p-5 md:p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <div className="flex items-center justify-between mb-6 md:mb-8 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 01-2.5-2.5z"/></svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white leading-none mb-1">Audit Trail · Illustrative</h3>
                      <div className="flex items-center gap-1.5">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                         <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Security Stream</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2.5 md:space-y-3">
                  {LOG_ROWS.map((row, i) => (
                    <div key={i} className="flex items-center justify-between p-3 md:p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.07] transition-all duration-300 group/row">
                      <div className="flex items-center gap-3 md:gap-4">
                        <span className="text-[11px] md:text-[13px] font-mono text-white/30">{row.time}</span>
                        <div className="px-2 md:px-3 py-1 rounded-lg text-[9px] md:text-[10px] font-extrabold tracking-tighter" style={{ backgroundColor: row.badgeColor, color: row.textColor }}>
                          {row.badge}
                        </div>
                        <span className="text-[13px] md:text-[14px] text-white/80 font-medium group-hover/row:text-white transition-colors">{row.event}</span>
                      </div>
                      <span className="text-[11px] md:text-[12px] text-white/20 font-mono hidden lg:block">{row.user}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CAPABILITIES */}
        <motion.section
          className="ip-section"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <p className="ip-section-label">Capabilities</p>
          <div className="ip-caps-grid">
            {CAPS.map(({ Icon, title, desc }) => (
              <div className="ip-cap-card" key={title}>
                <div className="ip-cap-icon"><Icon /></div>
                <div className="ip-cap-title">{title}</div>
                <div className="ip-cap-desc">{desc}</div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="how-it-works"
          className="ip-section"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <p className="ip-section-label">How it works</p>
          <HowItWorks 
            steps={STEPS.map((s, i) => ({ ...s, label: WF_LABELS[i], title: s.t, description: s.d }))}
            nodes={WF_NODES}
            themeColor="#a855f7"
          />
        </motion.section>

        {/* PROBLEM SOLVED */}
        <motion.section
          className="ip-section ip-section--last"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <p className="ip-section-label">Problem Solved</p>
          <div className="ip-problem-card">
            <div className="ip-problem-icon" aria-hidden="true"><IconAlert /></div>
            <div>
              <div className="ip-problem-title">Audit season chaos and compliance gaps</div>
              <p className="ip-problem-desc">
                Preparing for audits typically takes weeks of manual evidence collection. Compliance gaps go undetected until it's too late. The Audit & Compliance Agent maintains a continuous, provable compliance record — so every audit is a quick formality, not a fire drill.
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default AuditComplianceAgent;
