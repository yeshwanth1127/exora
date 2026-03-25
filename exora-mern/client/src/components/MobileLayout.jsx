import React, { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './MobileLayout.css'
import CardNav from './CardNav'
import Particles from './Particles'
import TypewriterText from './TypewriterText'
import GlassIcons from './GlassIcons'
import { FiLink2, FiCpu, FiZap, FiLayers, FiBox } from 'react-icons/fi'
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

  const WHY_US_GLASS_ITEMS = [
    { icon: <FiLink2 />, color: 'blue', label: 'Connects all your systems' },
    { icon: <FiCpu />, color: 'purple', label: 'Encodes your business logic' },
    { icon: <FiZap />, color: 'orange', label: 'Automates execution' },
    { icon: <FiLayers />, color: 'indigo', label: 'Orchestrates AI agents' },
    { icon: <FiBox />, color: 'green', label: 'Becomes the core operating layer of your company' },
  ]

  // Mobile Home: hero section + Why Us with GlassIcons (same as desktop)
  const MobileHome = () => {
    const [startTypewriter, setStartTypewriter] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
      const t = setTimeout(() => setStartTypewriter(true), 400)
      return () => clearTimeout(t)
    }, [])

    return (
      <>
        <section className="mobile-hero">
          <div className="mobile-hero-content">
            <h1 className="mobile-hero-title">Your Business. On Autopilot.</h1>
            <div className="mobile-hero-subtitle-wrapper">
              <TypewriterText
                text="AI agents that execute, optimize, and scale your operations 24/7."
                speed={30}
                isActive={startTypewriter}
                className="mobile-hero-typewriter-subtitle"
              />
            </div>
            <div className="mobile-hero-buttons">
              <button
                type="button"
                className="mobile-primary-button large"
                onClick={() => navigate('/join')}
              >
                Book a Free Automation Audit
              </button>
              <button
                type="button"
                className="mobile-secondary-button large"
                onClick={() => navigate('/personal-ai')}
              >
                See How Ghost Works
              </button>
            </div>
            {/* Two-column block: same copy as PC (stacked on mobile) */}
            <div className="mobile-hero-two-columns">
              <div className="mobile-hero-column mobile-hero-column-left">
                <h2 className="mobile-hero-column-title">For Your Business</h2>
                <p className="mobile-hero-column-text">End To End Tailored AI Employee that works 24/7</p>
              </div>
              <div className="mobile-hero-central-icon">
                <img src="/logo_solo.png" alt="EXORA" className="mobile-hero-logo-separator" />
              </div>
              <div className="mobile-hero-column mobile-hero-column-right">
                <h2 className="mobile-hero-column-title">For Your Life</h2>
                <p className="mobile-hero-column-text">AI Agent For Your Daily Work. In Your System</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Us section with GlassIcons (same as desktop) */}
        <section className="why-us-section-mobile">
          <div className="why-us-container-mobile">
            <h2 className="why-us-title-mobile">Why Us?</h2>
            <h3 className="why-us-main-heading-mobile">We Provide Software Infrastructure, Not a Tool</h3>
            <p className="why-us-intro-mobile">
              Most companies today run on a fragile mix of tools, people, spreadsheets, and manual coordination.
            </p>
            <p className="why-us-subheading-mobile">
              Exora replaces this with a unified, purpose-built software infrastructure that:
            </p>
            <div className="why-us-glass-icons-wrapper why-us-glass-icons-mobile">
              <GlassIcons items={WHY_US_GLASS_ITEMS} className="why-us-glass-icons" colorful={false} />
            </div>
            <div className="why-us-closing-mobile">
              <p className="why-us-closing-line-mobile">We don&apos;t sell features.</p>
              <p className="why-us-closing-line-mobile">We install digital infrastructure.</p>
            </div>
          </div>
        </section>
      </>
    )
  }


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
      
    </div>
  )
}

export default MobileLayout