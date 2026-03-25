import './App.css'
import { useEffect, useState, useMemo } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthProvider } from './contexts/AuthContext'
import { ActivationProvider } from './contexts/ActivationContext'
import Particles from './components/Particles'
import CardNav from './components/CardNav'
import TypewriterText from './components/TypewriterText'
import ShinyText from './components/ShinyText'
import SplitText from './components/SplitText'
import LiquidChrome from './components/LiquidChrome'
import FlowingMenu from './components/FlowingMenu'
import GlassIcons from './components/GlassIcons'
import Orb from './components/Orb'
import { FiLink2, FiCpu, FiZap, FiLayers, FiBox, FiPackage, FiHeadphones, FiSettings, FiFileText, FiShield, FiTrendingUp } from 'react-icons/fi'
import { AGENTS_DATA } from './data/agents'
import AuthPage from './pages/AuthPage'
import BusinessDashboard from './pages/BusinessDashboard'
import PersonalDashboard from './pages/PersonalDashboard'
import WorkflowActivation from './pages/WorkflowActivation'
import OAuthCallback from './pages/OAuthCallback'
import BusinessSolutions from './pages/BusinessSolutions'
import PersonalAI from './pages/PersonalAI'
import About from './pages/About'
import Products from './pages/Products'
import Solutions from './pages/Solutions'
import JoinUs from './pages/JoinUs'
import AgentPage from './pages/AgentPage'

function App() {
  // Better mobile detection - check synchronously first, then enhance with matchMedia
  const getIsMobile = () => {
    // Check viewport width
    const widthCheck = window.innerWidth <= 768
    // Check for touch capability (better mobile detection)
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    // Use matchMedia for more reliable detection
    const mediaQuery = window.matchMedia('(max-width: 768px)')
    // Combine checks - if media query matches OR (width check AND touch capability)
    return mediaQuery.matches || (widthCheck && hasTouch) || widthCheck
  }
  
  // Initialize with synchronous check to avoid flash
  const initialMobile = typeof window !== 'undefined' ? getIsMobile() : false
  const [isMobile, setIsMobile] = useState(initialMobile)
  const [isLoading, setIsLoading] = useState(false) // Set to false since we have initial detection

  useEffect(() => {
    // Double-check on mount to catch any edge cases
    const checkMobile = () => {
      const mobile = getIsMobile()
      console.log('Mobile detection - Screen width:', window.innerWidth, 'Is mobile:', mobile, 'Touch:', 'ontouchstart' in window)
      setIsMobile(mobile)
      setIsLoading(false)
    }
    
    // Check immediately
    checkMobile()
    
    // Use matchMedia listener for better performance and reliability
    const mediaQuery = window.matchMedia('(max-width: 768px)')
    const handleMediaChange = (e) => {
      const mobile = e.matches || getIsMobile()
      console.log('Media query changed - Is mobile:', mobile)
      setIsMobile(mobile)
    }
    
    // Modern browsers support addEventListener on MediaQueryList
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleMediaChange)
    }
    
    // Also listen to resize as fallback
    window.addEventListener('resize', checkMobile)
    
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange)
      } else {
        mediaQuery.removeListener(handleMediaChange)
      }
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const delay = target.getAttribute('data-delay') || '0ms';
          target.style.transitionDelay = delay;
          target.classList.add('is-visible');
          io.unobserve(target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => io.observe(el));

    const handler = () => {
      const y = window.scrollY || 0;
      const bg = document.querySelector('.bg-radials');
      if (bg) {
        bg.style.transform = `translateY(${y * -0.05}px)`;
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    handler();

    // Count-up animation for stats
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target') || '0', 10);
        const duration = parseInt(el.getAttribute('data-duration') || '1200', 10);
        const start = 0;
        const startTime = performance.now();
        const format = el.getAttribute('data-suffix') || '';
        const step = (t) => {
          const p = Math.min(1, (t - startTime) / duration);
          const val = Math.floor(start + (target - start) * (1 - Math.pow(1 - p, 3)));
          el.textContent = val.toLocaleString() + format;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        statObserver.unobserve(el);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('.countup').forEach((el) => statObserver.observe(el));

    return () => {
      window.removeEventListener('scroll', handler);
      io.disconnect();
      statObserver.disconnect();
    };
  }, []);

  // Show loading state briefly to prevent flash
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        background: '#000',
        color: '#fff'
      }}>
        Loading...
      </div>
    )
  }

  console.log('Rendering app - Screen width:', window.innerWidth, 'Is mobile:', isMobile)

  return (
    <Router>
      <AuthProvider>
        <ActivationProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<BusinessDashboard />} />
            <Route path="/personal-dashboard" element={<PersonalDashboard />} />
            <Route path="/workflow-activation" element={<WorkflowActivation />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            <Route path="/business-solutions" element={<BusinessSolutions />} />
            <Route path="/personal-ai" element={<PersonalAI />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/join" element={<JoinUs />} />
            <Route path="/agents/:slug" element={<AgentPage />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </ActivationProvider>
      </AuthProvider>
    </Router>
  )
}

const WHY_US_GLASS_ITEMS = [
  { icon: <FiLink2 />, color: 'blue', label: 'Connects all your systems' },
  { icon: <FiCpu />, color: 'purple', label: 'Encodes your business logic' },
  { icon: <FiZap />, color: 'orange', label: 'Automates execution' },
  { icon: <FiLayers />, color: 'indigo', label: 'Orchestrates AI agents' },
  { icon: <FiBox />, color: 'green', label: 'Becomes the core operating layer of your company' },
];

const TERMINAL_STEPS = [
  { step: 1, title: 'Infrastructure Mapping', desc: 'We map your processes, data, tools, and decision flows.' },
  { step: 2, title: 'System Architecture', desc: 'We design a custom operating architecture for your business.' },
  { step: 3, title: 'Core Infrastructure Build', desc: 'We build:', list: ['Data layer', 'Workflow engines', 'AI agent layer', 'Integration layer', 'Control & visibility layer'] },
  { step: 4, title: 'Deployment & Migration', desc: 'Your business transitions from tools to infrastructure.' },
  { step: 5, title: 'Continuous Evolution', desc: 'Your infrastructure grows as your company grows.' },
];

function buildTerminalFullText(item) {
  let s = `${item.step}\n\n${item.title}\n\n${item.desc}`;
  if (item.list && item.list.length) {
    s += '\n\n' + item.list.map(l => `• ${l}`).join('\n');
  }
  return s;
}

const TERMINAL_FULL_TEXTS = TERMINAL_STEPS.map(buildTerminalFullText);

const AGENT_ICONS = [FiPackage, FiHeadphones, FiSettings, FiLayers, FiFileText, FiShield, FiTrendingUp];
const AGENT_COLORS = ['blue', 'purple', 'red', 'indigo', 'orange', 'green', 'blue'];

function buildFlowingMenuItems(agents) {
  return agents.map((agent) => {
    const subtitle = agent.features
      ? [...agent.features, agent.problemSolved ? `Problem solved: ${agent.problemSolved}` : ''].filter(Boolean).join(' • ')
      : agent.description || '';
    return { link: `/agents/${agent.slug}`, title: agent.title, subtitle };
  });
}

const FLOWING_MENU_ITEMS = buildFlowingMenuItems(AGENTS_DATA);

function buildAgentsGlassItems(agents) {
  return agents.map((agent, i) => {
    const Icon = AGENT_ICONS[i] ?? FiBox;
    return {
      icon: <Icon />,
      color: AGENT_COLORS[i] ?? 'purple',
      label: agent.title,
      to: `/agents/${agent.slug}`,
    };
  });
}

const AGENTS_GLASS_ITEMS = buildAgentsGlassItems(AGENTS_DATA);

function HomePage() {
  const [showLogo, setShowLogo] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [startTypewriter, setStartTypewriter] = useState(false);
  const [activeTerminal, setActiveTerminal] = useState(0);
  const [terminalCharIndex, setTerminalCharIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false);

  // Stable ref so LiquidChrome doesn't re-init WebGL every render (stops blinking)
  const liquidChromeBaseColor = useMemo(() => [0.35, 0.15, 0.5], []);
  const navigate = useNavigate();

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = () => setIsMobile(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    // Show logo for 2 seconds, then hide splash and show content
    const logoTimer = setTimeout(() => {
      setShowLogo(false);
      setShowContent(true);
      // Start typewriter animation after a short delay
      setTimeout(() => {
        setStartTypewriter(true);
      }, 300);
    }, 2000);

    return () => clearTimeout(logoTimer);
  }, []);

  useEffect(() => {
    if (!showContent || activeTerminal >= TERMINAL_STEPS.length) return;
    const fullText = TERMINAL_FULL_TEXTS[activeTerminal];
    if (terminalCharIndex >= fullText.length) {
      const nextTimer = setTimeout(() => {
        setActiveTerminal((prev) => prev + 1);
        setTerminalCharIndex(0);
      }, 400);
      return () => clearTimeout(nextTimer);
    }
    const tick = setInterval(() => {
      setTerminalCharIndex((prev) => prev + 1);
    }, 28);
    return () => clearInterval(tick);
  }, [showContent, activeTerminal, terminalCharIndex]);

  return (
    <div className="home-page">
      {/* LOGO SPLASH SCREEN */}
      <AnimatePresence>
        {showLogo && (
          <motion.div
            className="logo-splash-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.img
              src="/logo_solo.png"
              alt="EXORA Logo"
              className="logo-splash-image"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0
              }}
              transition={{ 
                duration: 0.5, 
                ease: [0.4, 0, 0.2, 1]
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Particles
        particleColors={['#c084fc', '#a855f7', '#7c3aed']}
        particleCount={300}
        particleSpread={10}
        speed={0.06}
        particleBaseSize={90}
        moveParticlesOnHover={true}
        alphaParticles={false}
        disableRotation={false}
      />
      <CardNav
        items={[
          { 
            label: 'About', 
            bgColor: '#0D0716', 
            textColor: '#fff', 
            links: [ 
              { label: 'About', ariaLabel: 'About page', href: '/about' }, 
              { label: 'Company', ariaLabel: 'Company info', href: '/about#company' } 
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
            label: 'Join us', 
            bgColor: '#271E37', 
            textColor: '#fff', 
            links: [ 
              { label: 'Join', ariaLabel: 'Join page', href: '/join' }, 
              { label: 'Contact', ariaLabel: 'Contact us', href: '/join#contact' } 
            ] 
          }
        ]}
        baseColor="rgba(255,255,255,0.08)"
        menuColor="#fff"
        buttonBgColor="rgba(17,17,17,0.75)"
        buttonTextColor="#fff"
        ease="power3.out"
      />

      {/* HERO SECTION - Based on Image Layout */}
      {showContent && (
        <motion.div
          className="hero-section-new"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Main Heading - 2-3 Lines */}
          <div className="hero-main-heading">
            <h1 className="hero-heading-line">Your Business. On Autopilot.</h1>
            <div className="hero-heading-subtitle-wrapper">
              <TypewriterText
                text="AI agents that execute, optimize, and scale your operations 24/7."
                speed={30}
                isActive={startTypewriter}
                className="hero-typewriter-subtitle"
              />
            </div>
            <div className="hero-cta-buttons">
              <motion.button 
                className="hero-cta-button hero-cta-primary"
                onClick={() => window.location.href = '/join'}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Book a Free Automation Audit
              </motion.button>
              <motion.button 
                className="hero-cta-button hero-cta-secondary"
                onClick={() => window.location.href = '/personal-ai'}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                See How Ghost Works
              </motion.button>
            </div>
          </div>

          {/* Two Column Section */}
          <div className="hero-two-columns">
            {/* Left Column - Business */}
            <div className="hero-column hero-column-left">
              <h2 className="hero-column-title">For Your Business</h2>
              <p className="hero-column-text">End To End Tailored AI Employee that works 24/7</p>
            </div>

            {/* Central Logo Separator */}
            <div className="hero-central-icon">
              <img 
                src="/logo_solo.png" 
                alt="EXORA Logo" 
                className="hero-logo-separator"
              />
            </div>

            {/* Right Column - Life */}
            <div className="hero-column hero-column-right">
              <h2 className="hero-column-title">For Your Life</h2>
              <p className="hero-column-text">AI Agent For Your Daily Work. In Your System</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Shining Divider Line */}
      {showContent && (
        <div className="section-divider-line"></div>
      )}

      {/* Why Us Section */}
      {showContent && (
        <motion.section
          className="why-us-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="why-us-container">
            <div className="why-us-title-wrapper">
              <h2 className="why-us-title">
                <span className="why-us-line-1">
                  <ShinyText
                    text="Why"
                    speed={2}
                    delay={0}
                    color="rgba(255, 255, 255, 0.85)"
                    shineColor="#ffffff"
                    spread={120}
                    direction="left"
                    yoyo={false}
                    pauseOnHover={false}
                  />
                </span>
                <span className="why-us-line-2">
                  <ShinyText
                    text="Us?"
                    speed={2}
                    delay={0}
                    color="rgba(255, 255, 255, 0.85)"
                    shineColor="#ffffff"
                    spread={120}
                    direction="left"
                    yoyo={false}
                    pauseOnHover={false}
                  />
                </span>
              </h2>
              <SplitText
                text="We Provide Software Infrastructure, Not a Tool"
                tag="h3"
                className="why-us-subtitle"
                delay={30}
                duration={1}
                ease="power3.out"
                splitType="words"
                from={{ opacity: 0, y: 20 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-50px"
                textAlign="left"
              />
            </div>
            
            <div className="why-us-content">
              
              <SplitText
                text="Most companies today run on a fragile mix of tools, people, spreadsheets, and manual coordination."
                tag="p"
                className="why-us-intro"
                delay={40}
                duration={0.8}
                ease="power3.out"
                splitType="words"
                from={{ opacity: 0, y: 20 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-50px"
                textAlign="left"
              />
              
              <SplitText
                text="Exora replaces this with a unified, purpose-built software infrastructure that:"
                tag="p"
                className="why-us-subheading"
                delay={40}
                duration={0.8}
                ease="power3.out"
                splitType="words"
                from={{ opacity: 0, y: 20 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-50px"
                textAlign="left"
              />
              
              <div className="why-us-glass-icons-wrapper">
                <GlassIcons items={WHY_US_GLASS_ITEMS} className="why-us-glass-icons" colorful={false} />
              </div>
              
              <div className="why-us-closing">
                <SplitText
                  text="We don't sell features."
                  tag="p"
                  className="why-us-closing-line"
                  delay={40}
                  duration={0.8}
                  ease="power3.out"
                  splitType="words"
                  from={{ opacity: 0, y: 20 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  rootMargin="-50px"
                  textAlign="left"
                />
                <SplitText
                  text="We install digital infrastructure."
                  tag="p"
                  className="why-us-closing-line"
                  delay={40}
                  duration={0.8}
                  ease="power3.out"
                  splitType="words"
                  from={{ opacity: 0, y: 20 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  rootMargin="-50px"
                  textAlign="left"
                />
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* How we work Section - terminals only */}
      {showContent && (
        <motion.section
          className="how-we-work-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="how-we-work-inner">
            <h2 className="how-we-work-section-title">How we work?</h2>
            <div className="how-we-work-terminals-container">
              <div className="how-we-work-terminals-label">~bash</div>
              <div className="how-we-work-terminals-grid">
                {TERMINAL_STEPS.map((item, i) => {
                  const fullText = TERMINAL_FULL_TEXTS[i];
                  const isActive = i === activeTerminal;
                  const isDone = i < activeTerminal;
                  const visibleText = isDone ? fullText : (isActive ? fullText.slice(0, terminalCharIndex) : '');
                  const col = i < 3 ? i + 1 : i - 2;
                  const row = i < 3 ? 1 : 2;
                  const isThird = i === 2;
                  return (
                    <div
                      key={item.step}
                      className="how-we-work-terminal"
                      style={{
                        gridColumn: col,
                        gridRow: isThird ? '1 / 3' : row,
                      }}
                    >
                      <div className="how-we-work-terminal-header">
                        <span className="how-we-work-terminal-dots">
                          <span className="how-we-work-terminal-dot how-we-work-terminal-dot-red" />
                          <span className="how-we-work-terminal-dot how-we-work-terminal-dot-yellow" />
                          <span className="how-we-work-terminal-dot how-we-work-terminal-dot-green" />
                        </span>
                      </div>
                      <div className="how-we-work-terminal-body">
                        <span className="how-we-work-terminal-sparkle how-we-work-terminal-sparkle-tl" aria-hidden>✦</span>
                        <pre className="how-we-work-terminal-ruler" aria-hidden>{fullText}</pre>
                        <pre className="how-we-work-terminal-typing">
                          {visibleText}
                          {isActive && <span className="how-we-work-terminal-cursor" aria-hidden>▌</span>}
                        </pre>
                        <span className="how-we-work-terminal-sparkle how-we-work-terminal-sparkle-br" aria-hidden>✦</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Blob section - blob left, Our Agents + scroll to explore right */}
      {showContent && (
        <motion.section
          className="how-we-work-blob-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="how-we-work-blob-section-inner">
            <div className="how-we-work-blob-wrap">
              <div className="how-we-work-blob-glow" />
              <LiquidChrome
                baseColor={liquidChromeBaseColor}
                speed={0.15}
                amplitude={0.35}
                frequencyX={3}
                frequencyY={3}
                interactive={true}
                className="how-we-work-blob"
              />
            </div>
            <div className="how-we-work-blob-section-right">
              <h2 className="how-we-work-blob-section-heading">
                <span className="how-we-work-blob-section-line">Our</span>
                <span className="how-we-work-blob-section-line">Agents</span>
              </h2>
              <div className="how-we-work-blob-section-scroll">
                <ShinyText
                  text="scroll to explore"
                  speed={2}
                  delay={0}
                  color="rgba(255, 255, 255, 0.7)"
                  shineColor="#ffffff"
                  spread={80}
                  direction="left"
                  yoyo={false}
                  pauseOnHover={false}
                />
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Flowing menu (desktop) / Glass icons (mobile) - agents */}
      {showContent && (
        <motion.section
          className="flowing-menu-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flowing-menu-container">
            <div className={`flowing-menu-wrapper ${isMobile ? 'flowing-menu-wrapper--mobile-glass' : ''}`}>
              {isMobile ? (
                <div className="agents-glass-wrapper">
                  <GlassIcons items={AGENTS_GLASS_ITEMS} className="agents-glass-icons" colorful={true} />
                </div>
              ) : (
                <FlowingMenu items={FLOWING_MENU_ITEMS} />
              )}
            </div>
            <p className="flowing-menu-shiny-wrap">
              <ShinyText
                text="These agents are not tools or chatbots. They are persistent software operators embedded into the company's infrastructure, running 24/7."
                speed={2}
                delay={0}
                color="rgba(255, 255, 255, 0.85)"
                shineColor="#ffffff"
                spread={120}
                direction="left"
                yoyo={false}
                pauseOnHover={false}
              />
            </p>
          </div>
        </motion.section>
      )}

      {/* Meet GHOST EXORA section */}
      {showContent && (
        <motion.section
          className="meet-ghost-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="meet-ghost-inner">
            <p className="meet-ghost-meet">Meet</p>
            <p className="meet-ghost-ghost">GHOST</p>
            <div className="meet-ghost-orb-wrap">
              <Orb
                onClick={() => navigate('/personal-ai')}
                className="meet-ghost-orb"
                aria-label="Go to Ghost"
              />
              <span className="meet-ghost-orb-hint">press me</span>
            </div>
            <motion.p
              className="meet-ghost-exora"
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              EXORA
            </motion.p>
          </div>
        </motion.section>
      )}
    </div>
  )
}

export default App
