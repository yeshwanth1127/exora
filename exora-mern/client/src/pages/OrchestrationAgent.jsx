import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CardNav from '../components/CardNav';
import HowItWorks from '../components/HowItWorks';
import SeeHowItWorksButton from '../components/SeeHowItWorksButton';
import './InventoryProcurementAgent.css';

/* ─── Workflow step data ─── */
const STEPS = [
  {
    t: 'Workflow trigger',
    d: 'A workflow is initiated — either on a schedule, via an external event, or manually. The orchestrator parses the goal and maps out which agents and steps are required.',
  },
  {
    t: 'Agent delegation',
    d: 'The orchestrator assigns each sub-task to the most appropriate specialised agent, passing the right context and parameters so every agent starts with exactly what it needs.',
  },
  {
    t: 'Live monitoring',
    d: 'As agents execute their tasks, the orchestrator tracks status in real time — maintaining a dependency graph and ensuring upstream outputs are ready before downstream steps begin.',
  },
  {
    t: 'Error recovery',
    d: 'If an agent fails, times out, or returns an unexpected result, the orchestrator automatically retries, reroutes to a fallback agent, or escalates to a human with full context.',
  },
  {
    t: 'Output sequencing',
    d: 'Results from all agents are collected, validated, and assembled in the correct order. The orchestrator resolves conflicts and ensures the final output is coherent and complete.',
  },
  {
    t: 'Completion & audit',
    d: 'The workflow is marked complete and all agent actions, decisions, and outcomes are logged in a structured audit trail — ready for review, compliance, or process optimisation.',
  },
];

/* ─── Capability icons ─── */
const IconMultiAgent = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#a89fef" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="4.5" r="2" />
    <circle cx="3.5" cy="13" r="2" />
    <circle cx="14.5" cy="13" r="2" />
    <path d="M9 6.5v3" />
    <path d="M9 9.5l-4 2" />
    <path d="M9 9.5l4 2" />
  </svg>
);
const IconPulse = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#a89fef" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9h3l2-5.5 3.5 11 2-5.5h3.5" />
  </svg>
);
const IconClockMonitor = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#a89fef" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="6.5" />
    <path d="M9 5.5v4l2.5 1.5" />
  </svg>
);
const IconRefresh = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#a89fef" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 9a6.5 6.5 0 1 1 2.2 4.9" />
    <path d="M2.5 13.5V9H7" />
  </svg>
);
const IconCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#a89fef" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="14" height="11" rx="2" />
    <path d="M6 4V2.5M12 4V2.5M2 8h14" />
  </svg>
);
const IconAuditLog = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#a89fef" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 4.5L6.5 12 3.5 9" />
  </svg>
);
const IconAlert = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#D85A30" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="9" />
    <path d="M11 6v6" />
    <path d="M11 16v0.5" />
  </svg>
);

/* ─── Workflow node icons ─── */
const WF_NODES = [
  /* 0 — Trigger: pulse/wave */
  <svg key="0" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c4bdf5" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 10h3.5l2.5-6 4 12 2.5-6H20" />
  </svg>,
  /* 1 — Delegate: tree nodes */
  <svg key="1" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c4bdf5" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="5" r="2.5" />
    <circle cx="4.5" cy="15" r="2.5" />
    <circle cx="15.5" cy="15" r="2.5" />
    <path d="M10 7.5v3.5" />
    <path d="M10 11l-4.5 2" />
    <path d="M10 11l4.5 2" />
  </svg>,
  /* 2 — Monitor: clock */
  <svg key="2" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c4bdf5" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="7.5" />
    <path d="M10 6v4.5l3 2" />
  </svg>,
  /* 3 — Recover: refresh */
  <svg key="3" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c4bdf5" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10a7 7 0 1 1 2.5 5.3" />
    <path d="M3 14.5V10H7.5" />
  </svg>,
  /* 4 — Sequence: arrow sequence */
  <svg key="4" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c4bdf5" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10h14" />
    <path d="M11 6l5 4-5 4" />
  </svg>,
  /* 5 — Complete: checkmark */
  <svg key="5" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c4bdf5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 10.5l4 4L15.5 7" />
  </svg>,
];

const WF_LABELS = ['Trigger', 'Delegate', 'Monitor', 'Recover', 'Sequence', 'Complete'];

const CARD_NAV_ITEMS = [
  { label: 'About', bgColor: '#0D0716', textColor: '#fff', links: [{ label: 'About', ariaLabel: 'About page', href: '/about' }, { label: 'Career', ariaLabel: 'Career info', href: '/career' }] },
  { label: 'Products', bgColor: '#170D27', textColor: '#fff', links: [{ label: 'Products', ariaLabel: 'Products page', href: '/products' }, { label: 'Solutions', ariaLabel: 'Solutions', href: '/solutions' }] },
  { label: 'Contact', bgColor: '#271E37', textColor: '#fff', links: [{ label: 'Contact', ariaLabel: 'Contact us', href: '/contact#contact' }] },
];

const OrchestrationAgent = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

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
              <h1 className="ip-hero-title">Orchestration<br />Agent</h1>
              <p className="ip-hero-sub">The central brain of your Exora setup — coordinates every agent and workflow so your entire operation runs in sync, without you lifting a finger.</p>
              <div className="flex gap-4 mt-10 flex-wrap justify-center lg:justify-start">
                <SeeHowItWorksButton />
              </div>
            </div>

            {/* Orchestration Dashboard Mockup */}
            <div className="w-full">
              <div className="bg-[#09090b] border border-white/10 rounded-[20px] md:rounded-[24px] p-5 md:p-8 shadow-[0_0_30px_rgba(168,85,247,0.1)] hover:shadow-[0_0_50px_rgba(168,85,247,0.2)] transition-all duration-500 w-full text-left font-sans relative overflow-hidden">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                  <h3 className="text-[17px] md:text-[18px] font-bold text-white tracking-tight">Workflow Orchestration</h3>
                  <div className="flex gap-1.5 md:gap-2">
                    <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-[#E56A5B]"></div>
                    <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-[#E3B052]"></div>
                    <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-[#5FB87B]"></div>
                  </div>
                </div>
                
                <div className="space-y-4 md:space-y-4 mb-8 md:mb-10">
                  <div className="relative pl-5 md:pl-6 border-l md:border-l-2 border-purple-500/30">
                    <div className="absolute top-0 -left-[5px] md:-left-[6px] w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></div>
                    <div className="text-[#C4C4D4] text-[13px] md:text-[15px] font-medium mb-1">Trigger: Order Received</div>
                    <div className="text-[#71718A] text-[10px] md:text-[12px]">Processing in 2ms...</div>
                  </div>
                  <div className="relative pl-5 md:pl-6 border-l md:border-l-2 border-purple-500/30">
                    <div className="absolute top-0 -left-[5px] md:-left-[6px] w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                    <div className="text-[#C4C4D4] text-[13px] md:text-[15px] font-medium mb-1">Agent: Customer Support</div>
                    <div className="text-[#71718A] text-[10px] md:text-[12px]">Status: Replied to query</div>
                  </div>
                  <div className="relative pl-5 md:pl-6 border-l md:border-l-2 border-purple-500/30">
                    <div className="absolute top-0 -left-[5px] md:-left-[6px] w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
                    <div className="text-[#C4C4D4] text-[13px] md:text-[15px] font-medium mb-1">Agent: Inventory</div>
                    <div className="text-[#71718A] text-[10px] md:text-[12px]">Status: Checking stock levels</div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                  <div className="text-[11px] text-[#71718A] font-bold mb-6 tracking-[0.2em] uppercase">Active Neural Threads</div>
                  <div className="flex items-end gap-3 h-[80px] w-full px-2">
                    {[70, 45, 90, 65, 40, 75, 55].map((h, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-purple-600/80 hover:bg-purple-500 transition-all duration-300 rounded-t-md cursor-pointer ip-graph-bar" 
                        style={{ 
                          height: `${h}%`,
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: `${2.8 + Math.random()}s`
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CAPABILITIES — 6 cards, 3-col grid */}
        <motion.section className="ip-section" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }}>
          <p className="ip-section-label">Capabilities</p>
          <div className="ip-caps-grid ip-caps-grid--wide">
            <div className="ip-cap-card">
              <div className="ip-cap-icon"><IconMultiAgent /></div>
              <div className="ip-cap-title">Multi-agent coordination</div>
              <div className="ip-cap-desc">Delegates tasks to specialised agents, tracks their progress, and assembles results into a single coherent output.</div>
            </div>
            <div className="ip-cap-card">
              <div className="ip-cap-icon"><IconPulse /></div>
              <div className="ip-cap-title">Workflow sequencing</div>
              <div className="ip-cap-desc">Defines the order of operations across your entire pipeline — ensuring dependencies are respected and nothing runs out of turn.</div>
            </div>
            <div className="ip-cap-card">
              <div className="ip-cap-icon"><IconClockMonitor /></div>
              <div className="ip-cap-title">Real-time monitoring</div>
              <div className="ip-cap-desc">Maintains a live status view of every running agent and task — flagging delays, failures, or bottlenecks the moment they occur.</div>
            </div>
            <div className="ip-cap-card">
              <div className="ip-cap-icon"><IconRefresh /></div>
              <div className="ip-cap-title">Error recovery</div>
              <div className="ip-cap-desc">When an agent fails or stalls, the orchestrator retries, reroutes, or escalates — automatically keeping the workflow on track.</div>
            </div>
            <div className="ip-cap-card">
              <div className="ip-cap-icon"><IconCalendar /></div>
              <div className="ip-cap-title">Scheduled triggers</div>
              <div className="ip-cap-desc">Kicks off workflows on a schedule or in response to events — no manual intervention required to start a run.</div>
            </div>
            <div className="ip-cap-card">
              <div className="ip-cap-icon"><IconAuditLog /></div>
              <div className="ip-cap-title">Audit &amp; reporting</div>
              <div className="ip-cap-desc">Logs every decision, handoff, and outcome across all agents — giving you full visibility and a complete paper trail.</div>
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
              <div className="ip-problem-title">Fragmented agent workflows</div>
              <p className="ip-problem-desc">Individual agents working in isolation miss context, duplicate effort, and produce inconsistent results. The Orchestration Agent ties every agent together into a single, intelligent pipeline — so your automation actually works as a system, not a collection of silos.</p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default OrchestrationAgent;
