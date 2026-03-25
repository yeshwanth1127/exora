import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import CardNav from '../components/CardNav';
import MagicBento from '../components/MagicBento';
import './PersonalAI.css';

const useCases = [
  { icon: 'calendar', title: 'Intelligent Daily Planning', description: 'Ghost reviews your calendar, task load, and historical patterns to create realistic schedules that adapt as your day changes.' },
  { icon: 'search', title: 'Research Using Your Own Knowledge', description: 'Ask questions and get answers grounded in your files, notes, and history—not generic internet text.' },
  { icon: 'edit', title: 'Writing That Matches You', description: 'Ghost drafts emails, documents, and notes in your voice, using your prior work as context.' },
  { icon: 'clock', title: 'Contextual Reminders', description: 'Ghost reminds you when it matters: when you\'re free, when a dependency is resolved, when urgency increases. Not just at arbitrary times.' }
];

function UseCaseIcon({ name }) {
  const size = 28;
  const icons = {
    calendar: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>,
    clock: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
  };
  return icons[name] || null;
}

const PersonalAI = () => {
  const navigate = useNavigate();
  const aboveFoldRef = useRef(null);

  /* Fade out above-fold (hero + purple) as user scrolls */
  const { scrollY } = useScroll();
  const aboveFoldOpacity = useTransform(scrollY, [0, 280], [1, 0.25]);
  const aboveFoldY = useTransform(scrollY, [0, 200], [0, -24]);

  /* Fade-in on scroll for cards and CTA */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.pai-fade-in').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="personal-ai-page">
      <CardNav
        items={[
          { label: 'About', bgColor: '#0D0716', textColor: '#fff', links: [{ label: 'About', ariaLabel: 'About page', href: '/about' }, { label: 'Company', ariaLabel: 'Company info', href: '/about#company' }] },
          { label: 'Products', bgColor: '#170D27', textColor: '#fff', links: [{ label: 'Products', ariaLabel: 'Products page', href: '/products' }, { label: 'Solutions', ariaLabel: 'Solutions', href: '/solutions' }] },
          { label: 'Join us', bgColor: '#271E37', textColor: '#fff', links: [{ label: 'Join', ariaLabel: 'Join page', href: '/join' }, { label: 'Contact', ariaLabel: 'Contact us', href: '/join#contact' }] }
        ]}
        baseColor="rgba(255,255,255,0.08)"
        menuColor="#fff"
        buttonBgColor="rgba(17,17,17,0.75)"
        buttonTextColor="#fff"
        ease="power3.out"
      />

      {/* Above-the-fold: hero + purple section (fills viewport; rest on scroll) */}
      <motion.div
        ref={aboveFoldRef}
        className="pai-above-fold"
        style={{ opacity: aboveFoldOpacity, y: aboveFoldY }}
      >
        {/* Hero: Always Running. [robot] Always Aware. – fade in on load */}
        <motion.section
          className="pai-hero"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="pai-hero-top-row">
            <span className="pai-hero-phrase">Always Running.</span>
            <div className="pai-hero-robot-wrap">
              <img
                src="/ghost-robot.png"
                alt="Ghost"
                className="pai-hero-robot"
              />
            </div>
            <span className="pai-hero-phrase">Always Aware.</span>
          </div>

          <div className="pai-hero-copy-wrap">
            <p className="pai-hero-line pai-hero-agent">Your OS-Native AI Agent</p>
            <p className="pai-hero-line pai-hero-not-app">Ghost isn&apos;t an app.</p>
            <p className="pai-hero-line pai-hero-desc">A built-in AI that learns your intent and completes tasks for you—locally and privately.</p>
          </div>
        </motion.section>

        {/* Purple section: What Can GHOST Do? – fade in on load */}
        <motion.section
          className="pai-ghost-banner"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
        >
          <div className="pai-ghost-banner-inner">
            <h2 className="pai-ghost-banner-title">
              What Can <span className="pai-ghost-word">GHOST</span> Do?
            </h2>
            <p className="pai-ghost-banner-scroll-hint">scroll</p>
          </div>
        </motion.section>
      </motion.div>

      {/* Magic Bento – animated capability cards under "What Can GHOST Do?" */}
      <section className="pai-magic-bento-section pai-fade-in">
        <MagicBento
          textAutoHide={true}
          enableStars
          enableSpotlight
          enableBorderGlow={true}
          enableTilt={false}
          enableMagnetism={false}
          clickEffect
          spotlightRadius={400}
          particleCount={12}
          glowColor="132, 0, 255"
          disableAnimations={false}
        />
      </section>

      {/* What you can do – cards (below the fold, fade in on scroll) */}
      <section className="pai-use-cases">
        <div className="use-cases-grid">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="use-case-card pai-fade-in"
              style={{ transitionDelay: `${index * 60}ms` }}
            >
              <span className="use-case-icon" aria-hidden="true">
                <UseCaseIcon name={useCase.icon} />
              </span>
              <h4 className="use-case-title">{useCase.title}</h4>
              <p className="use-case-description">{useCase.description}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="pai-cta pai-fade-in" style={{ transitionDelay: '240ms' }}>
        <p>Join the waitlist for early access to Ghost.</p>
        <motion.button
          className="pai-cta-button"
          onClick={() => navigate('/join')}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.98 }}
        >
          Join the Waitlist →
        </motion.button>
      </div>
    </div>
  );
};

export default PersonalAI;
