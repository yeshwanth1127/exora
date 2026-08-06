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
    t: 'Stock monitoring',
    d: 'The agent scans every SKU continuously, building a live picture of your inventory levels, consumption rate, and projected runway for each item.',
  },
  {
    t: 'Low stock detection',
    d: 'When any item drops below its reorder threshold, the agent flags it immediately — no waiting for a manual audit or end-of-day report.',
  },
  {
    t: 'Purchase order triggered',
    d: 'A purchase order can be generated when a configured threshold is breached. Quantity can account for lead time, demand forecasts, and storage capacity.',
  },
  {
    t: 'Vendor matching',
    d: 'The agent contacts pre-approved vendors, requests quotes, and selects the best combination of price, quality rating, and estimated delivery time.',
  },
  {
    t: 'Approval & confirmation',
    d: 'A one-click approval notification goes to the relevant stakeholder. Once approved, the PO is dispatched to the vendor with all line item details.',
  },
  {
    t: 'Shipment & dispatch',
    d: 'The agent tracks available shipment updates, surfaces delays, and flags when an expedited option may be needed.',
  },
  {
    t: 'Restocked & updated',
    d: 'After a configured receipt confirmation, connected inventory counts can be updated. The agent logs the cycle and prepares the next reorder window.',
  },
];

/* ─── Capability card icons ─── */
const IconClock = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#a89fef" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="7" />
    <path d="M9 5v4l2.5 1.5" />
  </svg>
);

const IconArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#a89fef" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9h12" />
    <path d="M10 5l4 4-4 4" />
  </svg>
);

const IconVendor = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#a89fef" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="13" cy="13" r="2.5" />
    <path d="M8 6h3.5" />
    <path d="M7 13H4.5" />
  </svg>
);

const IconAlert = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#D85A30" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="9" />
    <path d="M11 6v6" />
    <path d="M11 16v0.5" />
  </svg>
);

/* ─── Workflow node icons (explicit width/height for visibility) ─── */
const WF_NODES = [
  /* 0 — Monitor: clock */
  <svg key="0" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c4bdf5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="7.5" />
    <path d="M10 6v4.5l3 2" />
  </svg>,
  /* 1 — Detect low: download-to-tray */
  <svg key="1" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c4bdf5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 4v7.5" />
    <path d="M7 9l3 3 3-3" />
    <path d="M4 14.5h12" />
  </svg>,
  /* 2 — Trigger PO: arrow right */
  <svg key="2" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c4bdf5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10h12" />
    <path d="M12 6l4 4-4 4" />
  </svg>,
  /* 3 — Match vendor: two nodes */
  <svg key="3" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c4bdf5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6.5" r="2.5" />
    <circle cx="14" cy="13.5" r="2.5" />
    <path d="M8.5 6.5H11" />
    <path d="M9 13.5H6.5" />
  </svg>,
  /* 4 — Approve: calendar */
  <svg key="4" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c4bdf5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4.5" width="14" height="12" rx="2" />
    <path d="M7 4.5V3M13 4.5V3" />
    <path d="M3 8.5h14" />
  </svg>,
  /* 5 — Dispatch: truck/arrow with box */
  <svg key="5" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c4bdf5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10h9" />
    <path d="M9 7l3 3-3 3" />
    <rect x="13" y="8" width="4" height="4" rx="1" />
  </svg>,
  /* 6 — Restock: checkmark */
  <svg key="6" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c4bdf5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 10.5l4 4L15.5 7" />
  </svg>,
];

const WF_LABELS = ['Monitor', 'Detect low', 'Trigger PO', 'Match vendor', 'Approve', 'Dispatch', 'Restock'];

/* ─── CardNav items (same structure as homepage) ─── */
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
    links: [
      { label: 'Contact', ariaLabel: 'Contact us', href: '/contact#contact' },
    ],
  },
];

/* ═══════════════════════════════════════
   Main Component
═══════════════════════════════════════ */
const InventoryProcurementAgent = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="ip-page">
      {/* ── Particle background (same as homepage) ── */}
      {/* ── Top nav (same CardNav as homepage) ── */}
      <CardNav
        items={CARD_NAV_ITEMS}
        baseColor="rgba(255,255,255,0.08)"
        menuColor="#fff"
        buttonBgColor="rgba(17,17,17,0.75)"
        buttonTextColor="#fff"
        ease="power3.out"
      />

      {/* ── Page content (sits above particles) ── */}
      <div className="ip-content">

        {/* ── HERO ── */}
        <motion.div
          className="ip-hero w-full max-w-7xl mx-auto px-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-32 items-center w-full">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-[850px]">
              <h1 className="ip-hero-title">
                Inventory &amp; Procurement<br />Agent
              </h1>
              <p className="ip-hero-sub">
                Help reduce stockouts and overstocking with an AI agent that monitors configured inventory feeds and coordinates purchasing workflows.
              </p>
              <div className="flex gap-4 mt-10 flex-wrap justify-center lg:justify-start">
                <SeeHowItWorksButton />
              </div>
            </div>

            <div className="w-full">
              <div className="bg-[#09090b] border border-white/10 rounded-[20px] md:rounded-[24px] p-5 md:p-8 shadow-[0_0_30px_rgba(168,85,247,0.1)] hover:shadow-[0_0_50px_rgba(168,85,247,0.2)] transition-all duration-500 w-full text-left font-sans relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 md:mb-8">
                  <div className="flex flex-col">
                    <h3 className="text-[18px] md:text-[20px] font-bold text-white tracking-tight">Inventory Dashboard · Illustrative</h3>
                    <p className="text-[10px] md:text-[12px] text-gray-500 mt-0.5 md:mt-1">Configured agent monitoring</p>
                  </div>
                  <div className="flex gap-1.5 md:gap-2">
                    <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-red-500/50"></div>
                    <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-amber-500/50"></div>
                    <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-emerald-500/50"></div>
                  </div>
                </div>
                
                {/* Rows as Cards */}
                <div className="space-y-2.5 md:space-y-3 relative mb-8 md:mb-10 z-10">
                  <div className="flex justify-between items-center p-3 md:p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/[0.08] transition-colors">
                    <span className="text-[#C4C4D4] text-[13px] md:text-[15px] font-medium">Raw Steel (Coil)</span>
                    <span className="px-2 md:px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[9px] md:text-[11px] font-bold rounded-lg uppercase tracking-wider">In Stock</span>
                  </div>
                  <div className="flex justify-between items-center p-3 md:p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/[0.08] transition-colors">
                    <span className="text-[#C4C4D4] text-[13px] md:text-[15px] font-medium">Circuit Board A7</span>
                    <span className="px-2 md:px-3 py-1 bg-amber-500/20 text-amber-400 text-[9px] md:text-[11px] font-bold rounded-lg uppercase tracking-wider">Low Stock</span>
                  </div>
                  <div className="flex justify-between items-center p-3 md:p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/[0.08] transition-colors">
                    <span className="text-[#C4C4D4] text-[13px] md:text-[15px] font-medium">Hydraulic Fluid</span>
                    <span className="px-2 md:px-3 py-1 bg-purple-500/20 text-purple-400 text-[9px] md:text-[11px] font-bold rounded-lg uppercase tracking-wider">Reordering</span>
                  </div>
                </div>

                {/* User Provided Graph Visual (The 'GIF') */}
                <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/5">
                  <div className="text-[10px] md:text-[11px] text-[#A1A1C1] font-bold mb-4 md:mb-6 tracking-[0.2em] uppercase text-center">Weekly Stock Levels</div>
                  <div className="flex items-center justify-center min-h-[140px] w-full overflow-hidden rounded-xl bg-black/40 border border-white/10 relative p-2">
                    <img 
                      src="https://www.unterfreiemhimmel.net/site/assets/files/1163/balkendiagramm-schen.gif" 
                      alt="Inventory Stock Levels" 
                      className="max-w-full h-auto object-contain opacity-90 mix-blend-screen"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── CAPABILITIES ── */}
        <motion.section
          className="ip-section"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <p className="ip-section-label">Capabilities</p>
          <div className="ip-caps-grid">
            <div className="ip-cap-card">
              <div className="ip-cap-icon"><IconClock /></div>
              <div className="ip-cap-title">Real-time stock tracking</div>
              <div className="ip-cap-desc">Monitors every SKU continuously — no manual counts or batch updates.</div>
            </div>
            <div className="ip-cap-card">
              <div className="ip-cap-icon"><IconArrowRight /></div>
              <div className="ip-cap-title">Auto-reorder materials</div>
              <div className="ip-cap-desc">Creates or routes purchase orders when stock reaches a configured threshold.</div>
            </div>
            <div className="ip-cap-card">
              <div className="ip-cap-icon"><IconVendor /></div>
              <div className="ip-cap-title">Vendor coordination</div>
              <div className="ip-cap-desc">Coordinates vendor outreach and quote comparison, with selection governed by configured rules and approvals.</div>
            </div>
          </div>
        </motion.section>

        {/* ── HOW IT WORKS ── */}
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

        {/* ── PROBLEM SOLVED ── */}
        <motion.section
          className="ip-section ip-section--last"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <p className="ip-section-label">Problem solved</p>
          <div className="ip-problem-card">
            <div className="ip-problem-icon" aria-hidden="true">
              <IconAlert />
            </div>
            <div>
              <div className="ip-problem-title">Stockouts and overstocking</div>
              <p className="ip-problem-desc">
                Running out of materials halts production, while overstocking ties up capital and space. This agent helps teams maintain inventory within configured operating ranges.
              </p>
            </div>
          </div>
        </motion.section>

      </div>{/* /ip-content */}
    </div>
  );
};

export default InventoryProcurementAgent;
