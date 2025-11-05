import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './About.css';
import Particles from '../components/Particles';
import CardNav from '../components/CardNav';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      <Particles
        particleColors={['#c084fc', '#a855f7', '#7c3aed']}
        particleCount={150}
        particleSpread={8}
        speed={0.04}
        particleBaseSize={60}
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
      />

      <div className="about-container">
        {/* Hero Section */}
        <motion.div
          className="about-hero"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-core"></div>
            <div className="hero-ring ring-1"></div>
            <div className="hero-ring ring-2"></div>
            <div className="hero-ring ring-3"></div>
          </div>
          <h1 className="about-title">Shaping the Future of Human–AI Collaboration</h1>
          <p className="about-subtitle">
            At Exora, we’re building tools that think, act, and create — so you can move faster.
          </p>
          <button
            className="about-hero-button"
            onClick={() => {
              const el = document.querySelector('#our-vision');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            Discover Our Mission
          </button>
        </motion.div>

        {/* Our Vision - split layout */}
        <motion.section
          id="our-vision"
          className="about-section vision-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="vision-wrapper">
            <div className="vision-text">
              <h2 className="section-title">Our Vision</h2>
              <p className="section-text">
                We believe in an intelligent world — one where every repetitive task disappears,
                and humans focus on creation.
              </p>
              <p className="section-text">
                Agentic AI unlocks a new era of productivity: adaptive, context-aware, and truly collaborative.
              </p>
            </div>
            <div className="vision-visual" aria-hidden="true">
              <div className="globe"></div>
              <div className="globe-orbit orbit-1"></div>
              <div className="globe-orbit orbit-2"></div>
              <div className="globe-orbit orbit-3"></div>
            </div>
          </div>
        </motion.section>

        {/* The Technology - interactive cards */}
        <motion.section
          className="about-section tech-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="content-card transparent-card">
            <h2 className="section-title">The Technology</h2>
            <div className="tech-grid">
              <div className="tech-card">
                <div className="tech-icon">🧩</div>
                <h3>AI Understanding</h3>
                <p>Natural language meets precision logic.</p>
              </div>
              <div className="tech-card">
                <div className="tech-icon">🧭</div>
                <h3>Context Engine</h3>
                <p>Understands your intent beyond words.</p>
              </div>
              <div className="tech-card">
                <div className="tech-icon">⚙️</div>
                <h3>Automation Core</h3>
                <p>Executes with real‑world awareness.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Our Journey - timeline */}
        <motion.section
          className="about-section journey-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="content-card transparent-card">
            <h2 className="section-title">Our Journey</h2>
            <div className="timeline">
              <div className="milestone">
                <div className="dot"></div>
                <div className="year">2022</div>
                <p className="milestone-text">Founding year — agentic prototypes in the lab.</p>
              </div>
              <div className="milestone">
                <div className="dot"></div>
                <div className="year">2023</div>
                <p className="milestone-text">First enterprise deployments across ops and support.</p>
              </div>
              <div className="milestone">
                <div className="dot"></div>
                <div className="year">2024</div>
                <p className="milestone-text">Context Engine v2 — real‑time reasoning at scale.</p>
              </div>
              <div className="milestone future">
                <div className="dot"></div>
                <div className="year">Future</div>
                <p className="milestone-text">Ambient AI — assistants that feel invisible but helpful.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Our Ecosystem */}
        <motion.section
          className="about-section ecosystem-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="content-card transparent-card">
            <h2 className="section-title">Our Ecosystem</h2>
            <p className="section-text" style={{ marginTop: '-8px' }}>
              An interconnected AI ecosystem built for the future.
            </p>

            <div className="ecosystem-map">
              {/* SVG links */}
              <svg className="eco-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <g stroke="#a855f7" strokeWidth="0.6" strokeLinecap="round" opacity="0.6">
                  {/* core (50,50) connections */}
                  <line x1="50" y1="50" x2="20" y2="30" />
                  <line x1="50" y1="50" x2="80" y2="28" />
                  <line x1="50" y1="50" x2="18" y2="70" />
                  <line x1="50" y1="50" x2="82" y2="72" />
                  <line x1="50" y1="50" x2="50" y2="12" />
                </g>
              </svg>

              {/* Nodes */}
              <div className="eco-node core" title="Assistant">Assistant</div>
              <div className="eco-node automation" title="Automation Core">Automation Core</div>
              <div className="eco-node speech" title="Speech Engine">Speech Engine</div>
              <div className="eco-node workspace" title="AI Workspace">AI Workspace</div>
              <div className="eco-node context" title="Context AI">Context AI</div>
              <div className="eco-node sdks" title="SDKs & APIs">SDKs & APIs</div>
            </div>
          </div>
        </motion.section>

        {/* Philosophy */}
        <motion.section
          className="about-section philosophy-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="philosophy-card">
            <p className="philosophy-quote">“AI is not replacing you — it’s redefining how you create.”</p>
            <div className="ambient-particles" aria-hidden="true"></div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          className="about-cta-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="cta-card">
            <h2 className="cta-title">Join the future — today.</h2>
            <p className="cta-text">
              Explore the platform and see what agentic AI can unlock.
            </p>
            <button className="cta-button" onClick={() => navigate('/products')}>
              Explore the Platform
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default About;


