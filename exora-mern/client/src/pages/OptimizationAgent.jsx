import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CardNav from '../components/CardNav';
import HowItWorks from '../components/HowItWorks';
import SeeHowItWorksButton from '../components/SeeHowItWorksButton';
import './InventoryProcurementAgent.css';
import './AgentThemes.css';

/* ─── Workflow step data ─── */
const STEPS = [
  { t: 'Data collection', d: 'The agent streams event data from every connected system — ERP, HRMS, ticketing, production floors — creating a unified timeline of every operation.' },
  { t: 'Pattern mining', d: 'Process mining algorithms replay event logs to reconstruct actual workflows, comparing them against the designed process to spot divergence.' },
  { t: 'Gap identification', d: 'Statistical models identify the steps with the highest latency, highest error rates, and greatest resource waste — ranked by opportunity value.' },
  { t: 'Recommendations', d: 'For each bottleneck, the agent generates a ranked set of interventions with projected business impact, implementation complexity, and risk context.' },
  { t: 'Change application', d: 'Approved changes can be applied to configured controls or presented as a deployment-ready playbook for engineering.' },
  { t: 'Impact measurement', d: 'Post-change metrics are tracked against the pre-change baseline. A/B tests confirm statistical significance before the change is fully promoted.' },
  { t: 'Model refinement', d: 'Outcomes feed back into the agent\'s improvement model, increasing recommendation accuracy with every cycle. The system gets smarter the longer it runs.' },
];

/* ─── The 4 loop steps ─── */
const LOOP_STEPS = [
  { label: 'Observe',    angle: -90  },  /* top    */
  { label: 'Analyse',   angle:   0  },  /* right  */
  { label: 'Implement', angle:  90  },  /* bottom */
  { label: 'Recommend', angle: 180  },  /* left   */
];

/* ─── Capability icons ─── */
const IconProcessMining = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#6ee7b7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 14l4-4 3 3 4-5 3 3" />
  </svg>
);
const IconBottleneck = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#6ee7b7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="7" /><path d="M9 5v4" /><circle cx="9" cy="13" r="1" fill="#6ee7b7" />
  </svg>
);
const IconAB = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#6ee7b7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9h5l2-5 2 10 2-5h1" />
  </svg>
);
const IconKPI = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#6ee7b7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="10" width="3" height="6" rx="1" /><rect x="7" y="6" width="3" height="10" rx="1" /><rect x="12" y="2" width="3" height="14" rx="1" />
  </svg>
);
const IconAutoTune = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#6ee7b7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 9a4 4 0 008 0 4 4 0 00-8 0z" /><path d="M9 2v2M9 14v2M2 9h2M14 9h2" />
  </svg>
);
const IconFeedback = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#6ee7b7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14c0-4.4 3.6-8 8-8" /><path d="M14 4c0 4.4-3.6 8-8 8" />
    <circle cx="4" cy="14" r="1.5" fill="#6ee7b7" /><circle cx="14" cy="4" r="1.5" fill="#6ee7b7" />
  </svg>
);
const IconAlert = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#D85A30" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="9" /><path d="M11 4v7M11 15v1" />
  </svg>
);

/* ─── Workflow node icons ─── */
const WF_NODES = [
  <svg key="0" width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="#6ee7b7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="7" /><path d="M9 5v4l2 1" />
  </svg>,
  <svg key="1" width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="#6ee7b7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 14l4-4 3 3 4-5 3 3" />
  </svg>,
  <svg key="2" width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="#6ee7b7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="3" /><path d="M9 2v2M9 14v2M2 9h2M14 9h2" />
  </svg>,
  <svg key="3" width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="#6ee7b7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 9l4 4 6-7" />
  </svg>,
  <svg key="4" width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="#6ee7b7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9h8M8 6l3 3-3 3" /><rect x="12" y="7" width="3" height="4" rx="1" />
  </svg>,
  <svg key="5" width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="#6ee7b7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="10" width="3" height="6" rx="1" /><rect x="7" y="6" width="3" height="10" rx="1" /><rect x="12" y="2" width="3" height="14" rx="1" />
  </svg>,
  <svg key="6" width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="#6ee7b7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14c0-4.4 3.6-8 8-8M14 4c0 4.4-3.6 8-8 8" />
  </svg>,
];

const WF_LABELS = ['Collect data', 'Mine patterns', 'Find gaps', 'Recommend', 'Apply change', 'Measure', 'Learn & loop'];

const METRICS = [
  { id: 'm1', val: 'Tracked', label: 'Cycle time', bar: 62 },
  { id: 'm2', val: 'Compared',  label: 'Throughput', bar: 83 },
  { id: 'm3', val: 'Flagged', label: 'Error rate', bar: 74 },
  { id: 'm4', val: 'Measured', label: 'Cost per unit', bar: 44 },
  { id: 'm5', val: 'Reviewed', label: 'SLA compliance', bar: 99 },
  { id: 'm6', val: 'Scoped',  label: 'Automation rate', bar: 71 },
];

const CAPS = [
  { Icon: IconProcessMining, title: 'Process mining', desc: 'Discovers your actual end-to-end process flows from event logs — not what you think happens, but what actually happens.' },
  { Icon: IconBottleneck, title: 'Bottleneck detection', desc: 'Pinpoints the exact steps where work piles up, throughput drops, or latency spikes — with root cause analysis included.' },
  { Icon: IconAB, title: 'A/B experiments', desc: 'Proposes and runs controlled experiments on process variants, measuring impact before committing to any change.' },
  { Icon: IconKPI, title: 'KPI tracking', desc: 'Monitors configured metrics and surfaces alerts when a KPI drifts outside its defined bounds.' },
  { Icon: IconAutoTune, title: 'Guided tuning', desc: 'Recommends parameter, threshold, and configuration changes for review and approval.' },
  { Icon: IconFeedback, title: 'Feedback loops', desc: 'Learns from every optimization cycle, refining its models so improvement recommendations get sharper over time.' },
];

const CARD_NAV_ITEMS = [
  { label: 'About', bgColor: '#0D0716', textColor: '#fff', links: [{ label: 'About', ariaLabel: 'About page', href: '/about' }, { label: 'Career', ariaLabel: 'Career info', href: '/career' }] },
  { label: 'Products', bgColor: '#170D27', textColor: '#fff', links: [{ label: 'Products', ariaLabel: 'Products page', href: '/products' }, { label: 'Solutions', ariaLabel: 'Solutions', href: '/solutions' }] },
  { label: 'Contact', bgColor: '#271E37', textColor: '#fff', links: [{ label: 'Contact', ariaLabel: 'Contact us', href: '/contact#contact' }] },
];

const LoopWheel = () => {
  const SIZE = 340;
  const R    = 118;
  const CX   = SIZE / 2;
  const CY   = SIZE / 2;
  const NODE_R = 46;

  const wheelRef      = useRef(null);
  const rotRef        = useRef(0);
  const autoRef       = useRef(null);
  const dragRef       = useRef({ active: false, startAngle: 0, startRot: 0 });
  const [rot, setRot] = useState(0);
  const [active, setActive] = useState(null);
  const [dragging, setDragging] = useState(false);

  const startAutoSpin = useCallback(() => {
    const tick = () => {
      rotRef.current = (rotRef.current + 0.18) % 360;
      setRot(rotRef.current);
      autoRef.current = requestAnimationFrame(tick);
    };
    autoRef.current = requestAnimationFrame(tick);
  }, []);

  const stopAutoSpin = useCallback(() => {
    if (autoRef.current) cancelAnimationFrame(autoRef.current);
  }, []);

  useEffect(() => {
    startAutoSpin();
    return () => stopAutoSpin();
  }, [startAutoSpin, stopAutoSpin]);

  const getAngle = (e, el) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.touches ? e.touches[0].clientX : e.clientX) - cx;
    const dy = (e.touches ? e.touches[0].clientY : e.clientY) - cy;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  const onPointerDown = (e) => {
    stopAutoSpin();
    setDragging(true);
    dragRef.current = {
      active: true,
      startAngle: getAngle(e, wheelRef.current),
      startRot: rotRef.current,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragRef.current.active) return;
    const delta = getAngle(e, wheelRef.current) - dragRef.current.startAngle;
    rotRef.current = (dragRef.current.startRot + delta + 360) % 360;
    setRot(rotRef.current);
  };

  const onPointerUp = () => {
    dragRef.current.active = false;
    setDragging(false);
    startAutoSpin();
  };

  const nodes = LOOP_STEPS.map((s, i) => {
    const angleDeg = s.angle + rot;
    const rad = (angleDeg * Math.PI) / 180;
    return {
      ...s,
      x: CX + R * Math.cos(rad),
      y: CY + R * Math.sin(rad),
      isActive: active === s.label,
    };
  });

  const arcPath = (a, b) => {
    return `M ${a.x} ${a.y} A ${R} ${R} 0 0 1 ${b.x} ${b.y}`;
  };

  return (
    <div className="opt-wheel-wrap">


      <svg
        ref={wheelRef}
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="opt-wheel-svg"
        style={{ cursor: dragging ? 'grabbing' : 'grab', overflow: 'visible' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <defs>
          <filter id="opt-glow">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="opt-centre-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="opt-arc-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        <circle cx={CX} cy={CY} r={R + 30} fill="url(#opt-centre-grad)" />

        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke="rgba(52,211,153,0.12)"
          strokeWidth="1.5"
          strokeDasharray="6 8"
        />

        {nodes.map((n, i) => {
          const next = nodes[(i + 1) % nodes.length];
          return (
            <g key={`arc-${i}`}>
              <motion.path
                d={arcPath(n, next)}
                fill="none"
                stroke="url(#opt-arc-grad)"
                strokeWidth="1.8"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.8 + i * 0.2, ease: "easeInOut" }}
              />
            </g>
          );
        })}

        <circle cx={CX} cy={CY} r={6} fill="#34d399" opacity={0.8} filter="url(#opt-glow)">
          <animate attributeName="r" values="5;8;5" dur="2.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2.2s" repeatCount="indefinite" />
        </circle>
        <circle cx={CX} cy={CY} r={4} fill="#fff" opacity={0.9} />

        {nodes.map((n, i) => {
          const isHov = n.isActive;
          const totalAngle = n.angle + rot;
          return (
            <g
              key={n.label}
              transform={`translate(${n.x}, ${n.y})`}
              onMouseEnter={() => setActive(n.label)}
              onMouseLeave={() => setActive(null)}
              style={{ cursor: 'pointer' }}
            >
              {isHov && (
                <circle cx={0} cy={0} r={NODE_R + 6} fill="rgba(52,211,153,0.12)" stroke="rgba(52,211,153,0.3)" strokeWidth="1" />
              )}
              <circle
                cx={0} cy={0} r={NODE_R}
                fill={isHov ? '#0b261a' : '#000000'}
                stroke={isHov ? '#34d399' : 'rgba(52,211,153,0.4)'}
                strokeWidth={isHov ? 1.8 : 1}
                filter={isHov ? 'url(#opt-glow)' : undefined}
                style={{ transition: 'all 0.25s' }}
              />
              <text
                x={0} y={0}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="12"
                fill={isHov ? '#fff' : 'rgba(255,255,255,0.9)'}
                fontFamily="system-ui, sans-serif"
                fontWeight="700"
                letterSpacing="-0.02em"
                style={{ transition: 'fill 0.2s', pointerEvents: 'none' }}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const OptimizationAgent = () => {
  const navigate = useNavigate();
  const themeColor = '#34d399';
  const [activeStep, setActiveStep]     = useState(0);
  const [metricsVisible, setMetricsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMetricsVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="ip-page">
      <CardNav items={CARD_NAV_ITEMS} baseColor="rgba(255,255,255,0.08)" menuColor="#fff" buttonBgColor="rgba(17,17,17,0.75)" buttonTextColor="#fff" ease="power3.out" />

      <div className="ip-content">


        <motion.div
          className="opt-hero-row"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="opt-hero-text">
            <div className="opt-badge">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 9l3-3 2 2 5-5" />
              </svg>
              AGENT · OPTIMIZATION
            </div>
            <h1 className="ip-hero-title">Optimization<br />Agent</h1>
            <p className="ip-hero-sub">
              Analyses configured operations, identifies inefficiencies, and recommends data-driven improvements for review and controlled application.
            </p>
            <div className="opt-cta-row mt-6" style={{ justifyContent: 'flex-start' }}>
              <SeeHowItWorksButton />
            </div>
          </div>

          <motion.div
            className="opt-hero-wheel"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <LoopWheel />
          </motion.div>
        </motion.div>

        <motion.div className="opt-stats-bar" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
          {[
            { num: 'Tracked', label: 'Process baselines' },
            { num: 'Compared',  label: 'Workflow variants' },
            { num: 'Scoped', label: 'Metrics monitored' },
            { num: 'Reviewed',   label: 'Recommendations' },
          ].map((s, i) => (
            <div className="opt-stat-item" key={i}>
              <div className="opt-stat-num">{s.num}</div>
              <div className="opt-stat-label">{s.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.section className="ip-section" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }}>
          <p className="ip-section-label" style={{ color: '#34d399' }}>Capabilities</p>
          <div className="ip-caps-grid ip-caps-grid--wide">
            {CAPS.map(({ Icon, title, desc }) => (
              <div className="ip-cap-card opt-cap-card" key={title}>
                <div className="ip-cap-icon opt-cap-icon"><Icon /></div>
                <div className="ip-cap-title">{title}</div>
                <div className="ip-cap-desc">{desc}</div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section className="ip-section" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }}>
          <p className="ip-section-label" style={{ color: '#34d399' }}>Metrics we optimise</p>
          <div className="opt-metrics-grid">
            {METRICS.map(({ id, val, label, bar }) => (
              <div className="opt-metric-card" key={id}>
                <div className="opt-metric-val">{val}</div>
                <div className="opt-metric-name">{label}</div>
                <div className="opt-metric-bar-wrap">
                  <motion.div 
                    className="opt-metric-bar" 
                    initial={{ width: '0%' }}
                    whileInView={{ width: `${bar}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.1, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section id="how-it-works" className="ip-section" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }}>
          <p className="ip-section-label" style={{ color: themeColor }}>How it works</p>
          <HowItWorks 
            steps={STEPS.map((s, i) => ({ ...s, label: WF_LABELS[i], title: s.t, description: s.d }))}
            nodes={WF_NODES}
            themeColor={themeColor}
          />
        </motion.section>

        <motion.section className="ip-section ip-section--last" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }}>
          <p className="ip-section-label" style={{ color: '#34d399' }}>Problem solved</p>
          <div className="ip-problem-card">
            <div className="ip-problem-icon" aria-hidden="true"><IconAlert /></div>
            <div>
              <div className="ip-problem-title">Stagnant processes that never improve</div>
              <p className="ip-problem-desc">
                Most organisations review processes periodically. The Optimization Agent monitors configured processes, surfaces drift, and helps teams close the gap between current and target performance.
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default OptimizationAgent;
