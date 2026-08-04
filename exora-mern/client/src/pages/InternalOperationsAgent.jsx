import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CardNav from '../components/CardNav';
import HowItWorks from '../components/HowItWorks';
import SeeHowItWorksButton from '../components/SeeHowItWorksButton';
// Reuse same shared CSS (ip-* class system)
import './InventoryProcurementAgent.css';

/* ─── Workflow step data ─── */
const STEPS = [
  {
    t: 'Request intake',
    d: 'Every internal request — from IT tickets to budget approvals — is captured in a single unified queue, regardless of where it originated.',
  },
  {
    t: 'Classify & prioritise',
    d: 'The agent reads the request, determines its type and urgency, and tags it with the right category so nothing gets misrouted or deprioritised.',
  },
  {
    t: 'Smart task routing',
    d: 'Based on team capacity, expertise, and SLA targets, the task is assigned to the right person or queue instantly — no manual triage needed.',
  },
  {
    t: 'Approval workflows',
    d: 'If sign-off is required, the agent fires an approval request to the correct stakeholder, tracks the response, and sends escalation nudges if it goes unanswered.',
  },
  {
    t: 'Cross-department coordination',
    d: 'When a task spans multiple teams, the agent manages handoffs — notifying the next party, syncing timelines, and keeping everyone on the same page.',
  },
  {
    t: 'Completion & audit log',
    d: 'Once resolved, the agent marks the task complete, updates relevant systems, and logs the full timeline for compliance and future process improvement.',
  },
];

/* ─── Capability icons ─── */
const IconRoutingArrow = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#a89fef" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9h12" /><path d="M10 5l4 4-4 4" />
  </svg>
);
const IconApproveCheck = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#a89fef" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="14" height="14" rx="3" />
    <path d="M5.5 9l2.5 2.5 4.5-4.5" />
  </svg>
);
const IconDeptNodes = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#a89fef" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="9" r="2.5" />
    <circle cx="13" cy="5" r="2.5" />
    <circle cx="13" cy="13" r="2.5" />
    <path d="M7.5 8l3-2" />
    <path d="M7.5 10l3 2" />
  </svg>
);
const IconAlert = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#D85A30" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="9" />
    <path d="M11 6v6" />
    <path d="M11 16v0.5" />
  </svg>
);

/* ─── Workflow node icons (explicit size for visibility) ─── */
const WF_NODES = [
  /* 0 — Request in: plus in rect */
  <svg key="0" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c4bdf5" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="14" height="14" rx="2.5" />
    <path d="M7 10h6M10 7v6" />
  </svg>,
  /* 1 — Classify: circle with inner arrow */
  <svg key="1" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c4bdf5" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="7" />
    <path d="M7 10h6" />
    <path d="M10 7l3 3-3 3" />
  </svg>,
  /* 2 — Route: arrow right */
  <svg key="2" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c4bdf5" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10h12" />
    <path d="M12 6l4 4-4 4" />
  </svg>,
  /* 3 — Approve: calendar */
  <svg key="3" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c4bdf5" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4.5" width="14" height="12" rx="2" />
    <path d="M7 4.5V3M13 4.5V3M3 8.5h14" />
  </svg>,
  /* 4 — Coordinate: 3 circles connected */
  <svg key="4" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c4bdf5" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="7" r="2" />
    <circle cx="14.5" cy="7" r="2" />
    <circle cx="10" cy="14.5" r="2" />
    <path d="M7.5 7h5" />
    <path d="M7 8.5l-1 4" />
    <path d="M13 8.5l1 4" />
  </svg>,
  /* 5 — Complete: checkmark */
  <svg key="5" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c4bdf5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 10.5l4 4L15.5 7" />
  </svg>,
];

const WF_LABELS = ['Request in', 'Classify', 'Route', 'Approve', 'Coordinate', 'Complete'];

const CARD_NAV_ITEMS = [
  { label: 'About', bgColor: '#0D0716', textColor: '#fff', links: [{ label: 'About', ariaLabel: 'About page', href: '/about' }, { label: 'Career', ariaLabel: 'Career info', href: '/career' }] },
  { label: 'Products', bgColor: '#170D27', textColor: '#fff', links: [{ label: 'Products', ariaLabel: 'Products page', href: '/products' }, { label: 'Solutions', ariaLabel: 'Solutions', href: '/solutions' }] },
  { label: 'Contact', bgColor: '#271E37', textColor: '#fff', links: [{ label: 'Contact', ariaLabel: 'Contact us', href: '/contact#contact' }] },
];

const InternalOperationsAgent = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="ip-page">
      <CardNav items={CARD_NAV_ITEMS} baseColor="rgba(255,255,255,0.08)" menuColor="#fff" buttonBgColor="rgba(17,17,17,0.75)" buttonTextColor="#fff" ease="power3.out" />

      <div className="ip-content">

        {/* HERO */}
        <motion.div className="ip-hero w-full max-w-7xl mx-auto px-6" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-32 items-center w-full">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-[850px]">
              <h1 className="ip-hero-title">Internal Operations<br />Agent</h1>
              <p className="ip-hero-sub">Streamline every internal process — from task routing to cross-department approvals — with an AI agent that keeps your org moving without the bottlenecks.</p>
              <div className="flex gap-4 mt-10 flex-wrap justify-center lg:justify-start">
                <SeeHowItWorksButton />
              </div>
            </div>

            {/* Operations Dashboard Mockup */}
            <div className="w-full">
              <div className="bg-[#09090b] border border-white/10 rounded-[20px] md:rounded-[24px] p-5 md:p-8 shadow-[0_0_30px_rgba(168,85,247,0.1)] hover:shadow-[0_0_50px_rgba(168,85,247,0.2)] transition-all duration-500 w-full text-left font-sans">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                  <h3 className="text-[17px] md:text-[18px] font-bold text-white tracking-tight">Operations Flow</h3>
                  <div className="flex gap-1.5 md:gap-2">
                    <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-[#E56A5B]"></div>
                    <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-[#E3B052]"></div>
                    <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-[#5FB87B]"></div>
                  </div>
                </div>
                
                <div className="space-y-2.5 md:space-y-3 mb-8 md:mb-10">
                  <div className="flex justify-between items-center p-3 md:p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/[0.08] transition-colors">
                    <span className="text-[#C4C4D4] text-[13px] md:text-[15px] font-medium">IT Support Ticket #402</span>
                    <span className="px-2 md:px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[9px] md:text-[11px] font-bold rounded-lg uppercase tracking-wider">Routed</span>
                  </div>
                  <div className="flex justify-between items-center p-3 md:p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/[0.08] transition-colors">
                    <span className="text-[#C4C4D4] text-[13px] md:text-[15px] font-medium">Marketing Approval</span>
                    <span className="px-2 md:px-3 py-1 bg-amber-500/20 text-amber-400 text-[9px] md:text-[11px] font-bold rounded-lg uppercase tracking-wider">Pending</span>
                  </div>
                  <div className="flex justify-between items-center p-3 md:p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/[0.08] transition-colors">
                    <span className="text-[#C4C4D4] text-[13px] md:text-[15px] font-medium">Budget Sign-off</span>
                    <span className="px-2 md:px-3 py-1 bg-purple-500/20 text-purple-400 text-[9px] md:text-[11px] font-bold rounded-lg uppercase tracking-wider">Processing</span>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                  <div className="text-[11px] text-[#71718A] font-bold mb-6 tracking-[0.2em] uppercase text-center">Process Efficiency Index</div>
                  <div className="flex items-end gap-3 h-[80px] w-full px-2">
                    {[50, 70, 40, 85, 60, 90, 55].map((h, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-purple-600/80 hover:bg-purple-500 transition-all duration-300 rounded-t-md cursor-pointer ip-graph-bar" 
                        style={{ 
                          height: `${h}%`,
                          animationDelay: `${i * 0.15}s`,
                          animationDuration: `${2.5 + Math.random()}s`
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CAPABILITIES */}
        <motion.section className="ip-section" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }}>
          <p className="ip-section-label">Capabilities</p>
          <div className="ip-caps-grid">
            <div className="ip-cap-card">
              <div className="ip-cap-icon"><IconRoutingArrow /></div>
              <div className="ip-cap-title">Task routing</div>
              <div className="ip-cap-desc">Automatically assigns incoming tasks to the right team or individual based on type, priority, and workload.</div>
            </div>
            <div className="ip-cap-card">
              <div className="ip-cap-icon"><IconApproveCheck /></div>
              <div className="ip-cap-title">Approvals</div>
              <div className="ip-cap-desc">Routes approval requests to the correct stakeholder, sends reminders, and logs every decision with a full audit trail.</div>
            </div>
            <div className="ip-cap-card">
              <div className="ip-cap-icon"><IconDeptNodes /></div>
              <div className="ip-cap-title">Inter-department coordination</div>
              <div className="ip-cap-desc">Bridges communication gaps between teams — syncing updates, handoffs, and deliverables across the org in real time.</div>
            </div>
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

        {/* PROBLEM SOLVED */}
        <motion.section className="ip-section ip-section--last" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }}>
          <p className="ip-section-label">Problem solved</p>
          <div className="ip-problem-card">
            <div className="ip-problem-icon" aria-hidden="true"><IconAlert /></div>
            <div>
              <div className="ip-problem-title">Slow internal execution</div>
              <p className="ip-problem-desc">Tasks sit idle waiting for the right person. Approvals bounce between inboxes for days. This agent eliminates the drag — routing, escalating, and closing loops automatically so your team can focus on actual work.</p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default InternalOperationsAgent;
