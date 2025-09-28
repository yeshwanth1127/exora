import './App.css'
import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Particles from './components/Particles'
import CardNav from './components/CardNav'
import Hero from './components/Hero'
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
import AuthPage from './pages/AuthPage'
import BusinessDashboard from './pages/BusinessDashboard'
import PersonalDashboard from './pages/PersonalDashboard'
import BusinessDiscoveryChat from './components/BusinessDiscoveryChat'

function App() {
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768
      console.log('Screen width:', window.innerWidth, 'Is mobile:', mobile)
      setIsMobile(mobile)
      setIsLoading(false)
    }
    
    // Check immediately
    checkMobile()
    
    // Add resize listener
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
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

  // Show mobile layout for devices 768px and below
  if (isMobile) {
    console.log('Rendering mobile layout')
    return <MobileLayout isChatbotOpen={isChatbotOpen} onChatbotToggle={() => setIsChatbotOpen(!isChatbotOpen)} />
  }

  console.log('Rendering desktop layout - Screen width:', window.innerWidth)

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/get-started" element={<BusinessDiscoveryChat />} />
          <Route path="/dashboard" element={<BusinessDashboard />} />
          <Route path="/personal-dashboard" element={<PersonalDashboard />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

function HomePage() {
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768
      console.log('Screen width:', window.innerWidth, 'Is mobile:', mobile)
      setIsMobile(mobile)
      setIsLoading(false)
    }
    
    // Check immediately
    checkMobile()
    
    // Add resize listener
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
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

  // Show mobile layout for devices 768px and below
  if (isMobile) {
    console.log('Rendering mobile layout')
    return <MobileLayout isChatbotOpen={isChatbotOpen} onChatbotToggle={() => setIsChatbotOpen(!isChatbotOpen)} />
  }

  console.log('Rendering desktop layout - Screen width:', window.innerWidth)

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', background: '#000000' }}>
      <TargetCursor targetSelector={'.cursor-target, .waitlist-button, .button-secondary'} spinDuration={2} hideDefaultCursor={true} />
      <div className="bg-radials" />
      {/* Global orb removed to avoid duplicate with hero's right-side orb */}
              <CardNav
                items={[
                  { label: 'About', bgColor: '#0D0716', textColor: '#fff', links: [ { label: 'Company', ariaLabel: 'About Company', href: '#company' }, { label: 'Careers', ariaLabel: 'About Careers', href: '#company' } ] },
                  { label: 'Products', bgColor: '#170D27', textColor: '#fff', links: [ { label: 'Featured', ariaLabel: 'Featured Projects', href: '#products' }, { label: 'Case Studies', ariaLabel: 'Project Case Studies', href: '#solutions' } ] },
                  { label: 'Join us', bgColor: '#271E37', textColor: '#fff', links: [ { label: 'Email', ariaLabel: 'Email us', href: '#join' }, { label: 'Twitter', ariaLabel: 'Twitter', href: '#join' }, { label: 'LinkedIn', ariaLabel: 'LinkedIn', href: '#join' } ] }
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
        <Hero 
          onOpenChat={() => setIsChatbotOpen(true)}
          showDashboardButton={isAuthenticated}
          onDashboardClick={() => {
            const dashboardPath = user?.usageType === 'personal' ? '/personal-dashboard' : '/dashboard';
            navigate(dashboardPath);
          }}
        />

        <div className="scroll-indicator">
          <span className="dot" />
          <span className="label">Scroll</span>
        </div>

        <section id="products" className="section reveal-on-scroll" data-delay="0ms">
          <div className="section-header">
            <h2>Why Choose Agentic AI?</h2>
            <p>Traditional automation follows rules. Our agents adapt, reason, and decide in real time.</p>
          </div>
          <AnimatedHalfBox 
            text={`• Adaptability to Complex, Dynamic Environments
• Contextual Understanding and Decision-Making
• Self-Improvement and Learning Capabilities
• Reduced Maintenance Overhead
• 90% cost reduction for your business
• Real-time problem solving and optimization`}
            triggerId="products"
          />
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
          <div className="futuristic-grid">
            <div className="futuristic-card" data-card="1">
              <div className="card-glow"></div>
              <div className="card-dotgrid">
                <DotGrid
                  dotSize={4}
                  gap={16}
                  baseColor="rgba(168, 85, 247, 0.2)"
                  activeColor="rgba(168, 85, 247, 0.6)"
                  proximity={80}
                  shockRadius={120}
                  shockStrength={2}
                  resistance={900}
                  returnDuration={1.0}
                />
              </div>
              <div className="card-content">
                <h3 className="card-title">Our Story</h3>
                <p className="card-description">Founded to deliver AI that truly understands your business—not just automate it.</p>
              </div>
              <div className="card-border"></div>
            </div>
            <div className="futuristic-card" data-card="2">
              <div className="card-glow"></div>
              <div className="card-dotgrid">
                <DotGrid
                  dotSize={4}
                  gap={16}
                  baseColor="rgba(168, 85, 247, 0.2)"
                  activeColor="rgba(168, 85, 247, 0.6)"
                  proximity={80}
                  shockRadius={120}
                  shockStrength={2}
                  resistance={900}
                  returnDuration={1.0}
                />
              </div>
              <div className="card-content">
                <h3 className="card-title">Our Mission</h3>
                <p className="card-description">Empower teams with intelligent agents that operate as seamlessly as humans.</p>
              </div>
              <div className="card-border"></div>
            </div>
            <div className="futuristic-card" data-card="3">
              <div className="card-glow"></div>
              <div className="card-dotgrid">
                <DotGrid
                  dotSize={4}
                  gap={16}
                  baseColor="rgba(168, 85, 247, 0.2)"
                  activeColor="rgba(168, 85, 247, 0.6)"
                  proximity={80}
                  shockRadius={120}
                  shockStrength={2}
                  resistance={900}
                  returnDuration={1.0}
                />
              </div>
              <div className="card-content">
                <h3 className="card-title">Our Vision</h3>
                <p className="card-description">AI agents that amplify human potential for every business, at any scale.</p>
              </div>
              <div className="card-border"></div>
            </div>
            <div className="futuristic-card" data-card="4">
              <div className="card-glow"></div>
              <div className="card-dotgrid">
                <DotGrid
                  dotSize={4}
                  gap={16}
                  baseColor="rgba(168, 85, 247, 0.2)"
                  activeColor="rgba(168, 85, 247, 0.6)"
                  proximity={80}
                  shockRadius={120}
                  shockStrength={2}
                  resistance={900}
                  returnDuration={1.0}
                />
              </div>
              <div className="card-content">
                <h3 className="card-title">Core Values</h3>
                <p className="card-description">Innovation, Business‑centricity, Transparency, and Partnership in every engagement.</p>
              </div>
              <div className="card-border"></div>
            </div>
            <div className="futuristic-card" data-card="5">
              <div className="card-glow"></div>
              <div className="card-dotgrid">
                <DotGrid
                  dotSize={4}
                  gap={16}
                  baseColor="rgba(168, 85, 247, 0.2)"
                  activeColor="rgba(168, 85, 247, 0.6)"
                  proximity={80}
                  shockRadius={120}
                  shockStrength={2}
                  resistance={900}
                  returnDuration={1.0}
                />
              </div>
              <div className="card-content">
                <h3 className="card-title">Custom AI Agents</h3>
                <p className="card-description">Task‑specific desktop or web agents with human‑in‑the‑loop controls.</p>
              </div>
              <div className="card-border"></div>
            </div>
            <div className="futuristic-card" data-card="6">
              <div className="card-glow"></div>
              <div className="card-dotgrid">
                <DotGrid
                  dotSize={4}
                  gap={16}
                  baseColor="rgba(168, 85, 247, 0.2)"
                  activeColor="rgba(168, 85, 247, 0.6)"
                  proximity={80}
                  shockRadius={120}
                  shockStrength={2}
                  resistance={900}
                  returnDuration={1.0}
                />
              </div>
              <div className="card-content">
                <h3 className="card-title">Data & Integration</h3>
                <p className="card-description">ETL, vector search, RAG pipelines and secure integrations into your stack.</p>
              </div>
              <div className="card-border"></div>
            </div>
          </div>
        </section>

        <section className="section futuristic-section reveal-on-scroll" data-delay="40ms">
          <div className="futuristic-grid">
            <div className="futuristic-card" data-card="7">
              <div className="card-glow"></div>
              <div className="card-dotgrid">
                <DotGrid
                  dotSize={4}
                  gap={16}
                  baseColor="rgba(168, 85, 247, 0.2)"
                  activeColor="rgba(168, 85, 247, 0.6)"
                  proximity={80}
                  shockRadius={120}
                  shockStrength={2}
                  resistance={900}
                  returnDuration={1.0}
                />
              </div>
              <div className="card-content">
                <h3 className="card-title">Automation Consulting</h3>
                <p className="card-description">Identify high‑ROI workflows and ship pilots in weeks, not months.</p>
              </div>
              <div className="card-border"></div>
            </div>
            <div className="futuristic-card" data-card="8">
              <div className="card-glow"></div>
              <div className="card-dotgrid">
                <DotGrid
                  dotSize={4}
                  gap={16}
                  baseColor="rgba(168, 85, 247, 0.2)"
                  activeColor="rgba(168, 85, 247, 0.6)"
                  proximity={80}
                  shockRadius={120}
                  shockStrength={2}
                  resistance={900}
                  returnDuration={1.0}
                />
              </div>
              <div className="card-content">
                <h3 className="card-title">Customer Experience</h3>
                <p className="card-description">Self‑serve assistants, knowledge search and proactive support tooling.</p>
              </div>
              <div className="card-border"></div>
            </div>
          </div>
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
      <Chatbot isOpen={isChatbotOpen} onToggle={() => setIsChatbotOpen(!isChatbotOpen)} hideFloatingButton={true} />
    </div>
  )
}

export default App
