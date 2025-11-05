import './App.css'
import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ActivationProvider } from './contexts/ActivationContext'
import Particles from './components/Particles'
import CardNav from './components/CardNav'
import HeroSection from './components/HeroSection'
import Features from './components/Features'
import CircularGallery from './components/CircularGallery'
import BrandRow from './components/BrandRow'
// import MagicBento from './components/MagicBento'
import LiquidChrome from './components/LiquidChrome'
import TopNav from './components/TopNav'
import Orb from './components/Orb'
import TargetCursor from './components/TargetCursor'
import DotGrid from './components/DotGrid'
import FlowingMenu from './components/FlowingMenu'
import MobileLayout from './components/MobileLayout'
import Chatbot from './components/Chatbot'
import AnimatedHalfBox from './components/AnimatedHalfBox'
import WaitlistPopup from './components/WaitlistPopup'
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
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

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
          {/* Show mobile layout for devices 768px and below */}
          {isMobile ? (
            <MobileLayout isChatbotOpen={isChatbotOpen} onChatbotToggle={() => setIsChatbotOpen(!isChatbotOpen)} />
          ) : (
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
              <Route path="/" element={<HomePage />} />
            </Routes>
          )}
        </ActivationProvider>
      </AuthProvider>
    </Router>
  )
}

function HomePage() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

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

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', background: '#000000' }}>
      <TargetCursor targetSelector={'.cursor-target, .waitlist-button, .button-secondary'} spinDuration={2} hideDefaultCursor={true} />
      <div className="bg-radials" />
      {/* Global orb removed to avoid duplicate with hero's right-side orb */}
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
      <Particles
        particleColors={[ '#c084fc', '#a855f7', '#7c3aed' ]}
        particleCount={300}
        particleSpread={10}
        speed={0.06}
        particleBaseSize={90}
        moveParticlesOnHover={true}
        alphaParticles={false}
        disableRotation={false}
      />
      <main className="landing-wrap" style={{ position: 'relative', zIndex: 10 }}>
        <HeroSection 
          onOpenChat={() => setIsChatbotOpen(true)}
          showDashboardButton={isAuthenticated}
          onDashboardClick={() => {
            const dashboardPath = user?.usageType === 'personal' ? '/personal-dashboard' : '/dashboard';
            navigate(dashboardPath);
          }}
          onOpenWaitlist={() => setIsWaitlistOpen(true)}
        />

        <section id="products" className="section reveal-on-scroll" data-delay="0ms">
          <motion.div 
            className="products-dual-columns"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Left: Why Choose Agentic AI */}
            <div className="products-column">
              <div className="products-column-header">
                <h2 className="products-column-title">Why Choose Agentic AI?</h2>
                <p className="products-column-subtitle">Traditional automation follows rules. Our agents adapt, reason, and decide in real time.</p>
              </div>
              <div className="agentic-cards">
                {[
                  { icon: '🧠', title: 'Adaptability', text: 'Thrives in complex, changing environments.' },
                  { icon: '🎯', title: 'Reasoning', text: 'Decides with context — not just rules.' },
                  { icon: '📈', title: 'Self‑Improving', text: 'Learns from every interaction.' },
                  { icon: '⚡', title: 'Real‑Time', text: 'Understands and acts instantly.' }
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    className="agentic-card"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: 0.08 * i }}
                    whileHover={{ y: -6 }}
                  >
                    <div className="agentic-card-icon">{item.icon}</div>
                    <div className="agentic-card-body">
                      <h3 className="agentic-card-title">{item.title}</h3>
                      <p className="agentic-card-text">{item.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="products-vertical-divider"></div>

            {/* Right: Ghost */}
            <div className="products-column">
              <div className="products-column-header">
                <h2 className="products-column-title">Ghost — Your Computer's Sixth Sense</h2>
                <p className="products-column-subtitle">A local, context-aware AI that lives within your system.</p>
                <p className="products-column-subtitle" style={{ marginTop: '12px' }}>It learns your habits, acts where you need it, and stays invisible when you don't.</p>
                <p className="products-column-subtitle" style={{ marginTop: '16px', fontWeight: '600', color: '#c084fc' }}>Private. Intelligent. Effortless.</p>
              </div>
              <div className="ghost-content">
                <div className="ghost-features">
                  <div className="ghost-feature-item">
                    <span className="ghost-feature-icon">🧠</span>
                    <h3>Context-Aware Intelligence</h3>
                  </div>
                  <div className="ghost-feature-item">
                    <span className="ghost-feature-icon">⚡</span>
                    <h3>Real-Time Action</h3>
                  </div>
                  <div className="ghost-feature-item">
                    <span className="ghost-feature-icon">🪶</span>
                    <h3>Seamless System Integration</h3>
                  </div>
                  <div className="ghost-feature-item">
                    <span className="ghost-feature-icon">🧭</span>
                    <h3>Proactive Assistance</h3>
                  </div>
                  <div className="ghost-feature-item">
                    <span className="ghost-feature-icon">🔒</span>
                    <h3>Private by Design</h3>
                  </div>
                  <div className="ghost-feature-item">
                    <span className="ghost-feature-icon">🎯</span>
                    <h3>Focused Productivity</h3>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="solutions" className="section reveal-on-scroll" data-delay="20ms">
          <div className="section-header">
            <h2>Comprehensive AI Agent Solutions</h2>
            <p>End‑to‑end agents across your customer, sales, operations, and data teams.</p>
          </div>
          <div style={{ height: '520px', position: 'relative' }}>
            <FlowingMenu
              items={[
                { link: '#', title: 'Customer Service Agents', subtitle: 'Handle complex inquiries, bookings and appointment scheduling, autonomously; escalate only when needed.' },
                { link: '#', title: 'Sales Process Automation', subtitle: 'Qualify, nurture, schedule, and negotiate within your parameters.' },
                { link: '#', title: 'Operations Management', subtitle: 'Predict bottlenecks, allocate resources, and coordinate teams.' },
                { link: '#', title: 'Data Intelligence Agents', subtitle: 'Analyze data, spot trends, and surface actionable recommendations.' }
              ]}
            />
          </div>
        </section>


        <section id="company" className="section futuristic-section reveal-on-scroll" data-delay="0ms">
          {/* Intentionally left empty for future content */}
          <div style={{ minHeight: '40px' }} />
        </section>


        {/* Removed BrandRow animated EXORA logo section as requested */}


        <section id="join" className="section section--cta reveal-on-scroll" data-delay="0ms">
          <div className="cta-card">
            <h3>Automate what you do every day—at OS speed</h3>
            <p>Join Scribe AI's waitlist to get early access.</p>
            <button className="waitlist-button">Join the Waitlist</button>
          </div>
        </section>

        <footer className="footer">
          <div className="footer-inner">
            <div className="brand">Exora</div>
            <div className="links">
              <a href="#">Docs</a>
              <a href="#">Security</a>
              <a href="#">Contact</a>
            </div>
            <div className="copy">© {new Date().getFullYear()} Exora, Inc.</div>
          </div>
        </footer>
      </main>
      
      {/* Chatbot */}
      <Chatbot isOpen={isChatbotOpen} onToggle={() => setIsChatbotOpen(!isChatbotOpen)} />
      
      {/* Waitlist Popup */}
      <WaitlistPopup isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} />
    </div>
  )
}

export default App
