import { useEffect, useRef } from 'react';
import { animate, text, stagger } from 'animejs';
import Orb from './Orb';
import CurvedLoop from './CurvedLoop';

const Hero = () => {
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      const textElement = textRef.current;
      
      text.split(textElement, {
        lines: { wrap: 'clip' },
      })
      .addEffect(({ lines }) => animate(lines, {
        y: [
          { to: ['100%', '0%'] },
          { to: '-100%', delay: 750, ease: 'in(3)' }
        ],
        duration: 750,
        ease: 'out(3)',
        delay: stagger(200),
        loop: true,
        loopDelay: 500,
      }));
    }
  }, []);

  return (
    <section className="landing-hero">
      <div className="hero-orb-container">
        <div className="orb-wrapper">
          <Orb
            hoverIntensity={0.8}
            rotateOnHover={true}
            hue={0}
            forceHoverState={false}
          />
        </div>
        <div className="hero-content">
          <CurvedLoop 
            marqueeText="Exora — AI that lives inside your OS and springs to life with your startup."
            speed={2}
            curveAmount={0}
            direction="left"
            interactive={true}
            className="hero-title"
          />
          <p ref={textRef}>
            Scribe watches your screen with high‑fidelity event capture and turns repetitive computer tasks
            into secure, privacy‑first automations. Build powerful workflows from everyday actions.
          </p>
          <button className="waitlist-button">
            Enter Waitlist
          </button>
        </div>
      </div>
    </section>
  )
}

export default Hero


