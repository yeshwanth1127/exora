import React, { useEffect, useState } from 'react'
import { useNavigate, Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import './MobileLayout.css'
import CardNav from './CardNav'
import Particles from './Particles'
import Chatbot from './Chatbot'
import HeroSection from './HeroSection'
import DotGrid from './DotGrid'
import FlowingMenu from './FlowingMenu'
import AnimatedHalfBox from './AnimatedHalfBox'
import WaitlistPopup from './WaitlistPopup'
import AuthPage from '../pages/AuthPage'
import BusinessDashboard from '../pages/BusinessDashboard'
import PersonalDashboard from '../pages/PersonalDashboard'
import WorkflowActivation from '../pages/WorkflowActivation'
import OAuthCallback from '../pages/OAuthCallback'
import BusinessSolutions from '../pages/BusinessSolutions'
import PersonalAI from '../pages/PersonalAI'
import About from '../pages/About'
import Products from '../pages/Products'
import Solutions from '../pages/Solutions'
import JoinUs from '../pages/JoinUs'

const MobileLayout = ({ isChatbotOpen, onChatbotToggle }) => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)

  useEffect(() => {
    console.log('Mobile Layout rendered!')
    
    // Same intersection observer setup as desktop
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
  }, [])

  // Mobile Home Component - Same content as desktop, responsive styling
  const MobileHome = () => (
    <main className="landing-wrap mobile-centered" style={{ position: 'relative', zIndex: 10, width: '100%', margin: '0 auto', textAlign: 'center' }}>
      <HeroSection 
        onOpenChat={() => onChatbotToggle()}
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
            <AnimatedHalfBox 
              text={`• Adaptability to Complex, Dynamic Environments
• Contextual Understanding and Decision-Making
• Self-Improvement and Learning Capabilities
• Reduced Maintenance Overhead
• 90% cost reduction for your business
• Real-time problem solving and optimization`}
              triggerId="products"
            />
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

      <section id="join" className="section section--cta reveal-on-scroll" data-delay="0ms">
        <div className="cta-card">
          <h3>Automate what you do every day—at OS speed</h3>
          <p>Join Scribe AI's waitlist to get early access.</p>
          <button className="waitlist-button" onClick={() => setIsWaitlistOpen(true)}>Join the Waitlist</button>
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
      
      {/* Waitlist Popup */}
      <WaitlistPopup isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} />
    </main>
  )

  return (
    <div className="mobile-layout-wrapper" style={{ position: 'relative', width: '100%', minHeight: '100vh', background: '#000000' }}>
      {/* Same background as desktop */}
      <div className="bg-radials" />
      
      {/* Same particles as desktop */}
      <Particles
        particleColors={[ '#c084fc', '#a855f7', '#7c3aed' ]}
        particleCount={200}
        particleSpread={8}
        speed={0.04}
        particleBaseSize={60}
        moveParticlesOnHover={true}
        alphaParticles={false}
        disableRotation={false}
      />
      
      {/* Same CardNav as desktop */}
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

      {/* Mobile Routes */}
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
        <Route path="/" element={<MobileHome />} />
      </Routes>
      
      {/* Chatbot */}
      <Chatbot isOpen={isChatbotOpen} onToggle={onChatbotToggle} hideFloatingButton={true} />
    </div>
  )
}

export default MobileLayout