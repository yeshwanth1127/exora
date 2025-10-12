import './App.css'
import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
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
import JoinUs from './pages/JoinUs'

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
            <Route path="/join" element={<JoinUs />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </ActivationProvider>
      </AuthProvider>
    </Router>
  )
}

function HomePage() {
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)
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
                      { label: 'Solutions', ariaLabel: 'Solutions', href: '/products#solutions' } 
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
          <div className="section-header" style={{ marginBottom: '40px', background: 'none', backdropFilter: 'none' }}>
            <div className="powers-exora-title-container">
              <div className="powers-exora-title-single">
                <div className="marquee-single">
                  <div className="marquee__inner-single">
                    <span>What Powers Exora&nbsp;&nbsp;*&nbsp;&nbsp;</span>
                    <span>What Powers Exora&nbsp;&nbsp;*&nbsp;&nbsp;</span>
                    <span>What Powers Exora&nbsp;&nbsp;*&nbsp;&nbsp;</span>
                    <span>What Powers Exora&nbsp;&nbsp;*&nbsp;&nbsp;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                <p className="card-description">Born from a simple belief — AI should think like your business, not just automate it. Exora was built to bridge human insight with machine precision, helping teams move faster, smarter, and effortlessly.</p>
                <p className="card-tagline">"Built for those who want their AI to understand, not just execute."</p>
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
                <p className="card-description">To empower businesses and individuals with intelligent agents that feel less like tools and more like teammates. Exora's mission is to make AI collaboration as natural as working with a human expert — only faster, scalable, and available 24/7.</p>
                <p className="card-tagline">"AI that works with you, not just for you."</p>
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
                <p className="card-description">A world where every business, from startup to enterprise, runs on personalized AI agents — amplifying human potential and redefining productivity. We see AI not as a replacement for people, but as the most powerful partner they've ever had.</p>
                <p className="card-tagline">"AI that scales human ambition."</p>
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
                <p className="card-description">Innovation that never stops learning. Partnerships built on trust. Transparency in every process. And an unshakable focus on the people and businesses we serve. These values power every solution we create — and every automation we deliver.</p>
                <p className="card-tagline">"Built on intelligence. Driven by integrity."</p>
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
                <p className="card-description">Tailored to your business. Designed to think, decide, and act — just like your best employee would. Whether it's a desktop assistant or a web agent, Exora builds task-specific AI that integrates seamlessly into your daily operations.</p>
                <p className="card-tagline">"Your business, powered by purpose-built AI."</p>
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
                <p className="card-description">Your data is your edge — we make sure it stays that way. From ETL and RAG pipelines to secure integrations and private vector search, Exora ensures your AI has context, accuracy, and complete security.</p>
                <p className="card-tagline">"Intelligence powered by your data — protected, connected, perfected."</p>
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
      <Chatbot isOpen={isChatbotOpen} onToggle={() => setIsChatbotOpen(!isChatbotOpen)} />
      
      {/* Waitlist Popup */}
      <WaitlistPopup isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} />
    </div>
  )
}

export default App
