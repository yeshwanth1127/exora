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
      />

      <div className="about-container">
        <motion.div
          className="about-hero"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="about-title">About Exora</h1>
          <p className="about-subtitle">
            Building the future of intelligent automation, one agent at a time.
          </p>
        </motion.div>

        <motion.section
          className="about-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="content-card">
            <h2 className="section-title">Our Story</h2>
            <p className="section-text">
              Exora was born from a simple observation: businesses waste countless hours on repetitive tasks that could be automated, 
              yet most automation tools require armies of developers and months of implementation.
            </p>
            <p className="section-text">
              We set out to change that. Founded by a team of AI researchers and enterprise software veterans, Exora brings 
              cutting-edge AI agent technology to businesses of all sizes—without the complexity, without the overhead, 
              and without compromising on power.
            </p>
            <p className="section-text">
              Today, we're helping hundreds of companies reclaim thousands of hours, reduce costs by up to 90%, and scale operations 
              that would otherwise require massive teams.
            </p>
          </div>
        </motion.section>

        <motion.section
          className="about-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="content-card">
            <h2 className="section-title">Our Mission</h2>
            <p className="section-text">
              To democratize AI automation and make intelligent agents accessible to every business—from solopreneurs 
              to enterprises—empowering teams to focus on what truly matters: innovation, strategy, and growth.
            </p>
          </div>
        </motion.section>

        <motion.section
          className="about-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="content-card">
            <h2 className="section-title">What Makes Us Different</h2>
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">🧠</div>
                <h3 className="feature-title">True Intelligence</h3>
                <p className="feature-text">
                  Our agents don't just follow scripts—they reason, adapt, and make contextual decisions in real-time.
                </p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">⚡</div>
                <h3 className="feature-title">Rapid Deployment</h3>
                <p className="feature-text">
                  Go from concept to production in days, not months. No massive dev teams required.
                </p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🔒</div>
                <h3 className="feature-title">Enterprise Security</h3>
                <p className="feature-text">
                  Bank-level encryption, private deployments, and complete data sovereignty.
                </p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📈</div>
                <h3 className="feature-title">Continuous Learning</h3>
                <p className="feature-text">
                  Agents that improve with every interaction, getting smarter over time.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="about-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="content-card">
            <h2 className="section-title">Leadership Team</h2>
            <div className="team-grid">
              <div className="team-member">
                <div className="team-avatar">👨‍💼</div>
                <h3 className="team-name">Alex Chen</h3>
                <p className="team-role">Co-Founder & CEO</p>
                <p className="team-bio">
                  Former Head of AI at TechCorp. PhD in Machine Learning from Stanford. 15 years building enterprise software.
                </p>
              </div>
              <div className="team-member">
                <div className="team-avatar">👩‍💻</div>
                <h3 className="team-name">Sarah Mitchell</h3>
                <p className="team-role">Co-Founder & CTO</p>
                <p className="team-bio">
                  Ex-Google AI researcher. Led teams building production AI systems used by millions. MIT Computer Science.
                </p>
              </div>
              <div className="team-member">
                <div className="team-avatar">👨‍💻</div>
                <h3 className="team-name">Marcus Johnson</h3>
                <p className="team-role">VP of Engineering</p>
                <p className="team-bio">
                  Previously at Amazon Web Services. Expert in distributed systems and scalable architectures. Carnegie Mellon alumnus.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="about-cta-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="cta-card">
            <h2 className="cta-title">Ready to Transform Your Business?</h2>
            <p className="cta-text">
              Join hundreds of companies already automating with Exora.
            </p>
            <button className="cta-button" onClick={() => navigate('/auth')}>
              Get Started Today
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default About;


