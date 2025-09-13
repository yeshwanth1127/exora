import './App.css'
import { useEffect } from 'react'
import Particles from './components/Particles'
import ExoraLogo from './components/ExoraLogo'
import Hero from './components/Hero'
import DemoPanel from './components/DemoPanel'
import InfiniteMenu from './components/InfiniteMenu'
import Features from './components/Features'
import BrandRow from './components/BrandRow'

function App() {
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
      <div className="bg-radials" />
      <ExoraLogo />
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
        <Hero />

        <div className="scroll-indicator">
          <span className="dot" />
          <span className="label">Scroll</span>
        </div>

        <section className="section section--bento reveal-on-scroll" data-delay="0ms">
          <div className="section-header">
            <h2>Build workflows from everyday actions</h2>
            <p>Dark, elegant, and fast — Exora turns what you do into reliable automations.</p>
          </div>
          <div style={{ position: 'relative', height: '60vh', width: '100%' }}>
            <InfiniteMenu items={[
              { image: 'https://picsum.photos/300/300?grayscale', link: 'https://google.com/', title: 'AI Automation', description: 'Intelligent task automation' },
              { image: 'https://picsum.photos/400/400?grayscale', link: 'https://google.com/', title: 'Screen Capture', description: 'High‑fidelity capture' },
              { image: 'https://picsum.photos/500/500?grayscale', link: 'https://google.com/', title: 'Workflow Builder', description: 'Compose robust flows' },
              { image: 'https://picsum.photos/600/600?grayscale', link: 'https://google.com/', title: 'Privacy First', description: 'Local, secure runs' }
            ]} />
          </div>
        </section>

        <div className="reveal-on-scroll" data-delay="120ms">
          <DemoPanel />
        </div>

        <section className="section reveal-on-scroll" data-delay="0ms">
          <div className="section-header">
            <h2>Why Exora</h2>
            <p>Purpose‑built to understand your computer and turn it into an API.</p>
          </div>
          <Features />
        </section>

        <section className="section section--brand reveal-on-scroll" data-delay="40ms">
          <BrandRow />
        </section>

        <section className="section section--stats reveal-on-scroll" data-delay="0ms">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number countup" data-target="12000" data-suffix="+" data-duration="1400">0</div>
              <div className="stat-label">Events captured / minute</div>
            </div>
            <div className="stat-card">
              <div className="stat-number countup" data-target="98" data-suffix="%" data-duration="1200">0</div>
              <div className="stat-label">Workflow reliability</div>
            </div>
            <div className="stat-card">
              <div className="stat-number countup" data-target="300" data-suffix="ms" data-duration="1600">0</div>
              <div className="stat-label">Avg response time</div>
            </div>
            <div className="stat-card">
              <div className="stat-number countup" data-target="40" data-suffix="%" data-duration="1500">0</div>
              <div className="stat-label">Time saved weekly</div>
            </div>
          </div>
        </section>

        <section className="section section--testimonials reveal-on-scroll" data-delay="80ms">
          <div className="section-header">
            <h2>Loved by fast-moving teams</h2>
            <p>Engineers, ops and analysts ship more by automating the repetitive.</p>
          </div>
          <div className="testimonial-grid">
            <div className="testimonial">
              <p>“Exora turned our quarterly reports from a 3-hour slog into a 6‑minute run.”</p>
              <div className="author">— Avery, Operations</div>
            </div>
            <div className="testimonial">
              <p>“The capture fidelity is wild. Steps are reusable and robust.”</p>
              <div className="author">— Dev, Engineering</div>
            </div>
            <div className="testimonial">
              <p>“We went from copy‑pasting to building real workflows without code.”</p>
              <div className="author">— Mia, Analytics</div>
            </div>
          </div>
        </section>

        <section className="section section--cta reveal-on-scroll" data-delay="0ms">
          <div className="cta-card">
            <h3>Start automating the work you do every day</h3>
            <p>Join the waitlist and be first to try Exora.</p>
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
    </div>
  )
}

export default App
