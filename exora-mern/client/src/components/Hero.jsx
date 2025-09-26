import React from 'react';
import ShinyText from './ShinyText';
import HeroScrollTitle from './HeroScrollTitle';
import ElectricBorder from './ElectricBorder';
import Orb from './Orb';

const Hero = ({ onOpenChat }) => {
  const handleOpenChat = () => {
    if (onOpenChat) {
      onOpenChat();
    } else {
      console.log('Open chatbot');
    }
  };

  return (
    <section className="landing-hero">
      <div className="hero-orb-container">
        <div className="hero-content">
          <div className="hero-split">
            <div className="hero-left">
              <div className="hero-title-container">
                <HeroScrollTitle text="Your automation + assistance hub" className="hero-title-text" />
              </div>
              <div className="hero-ctas">
                <a href="#solutions" className="button-secondary cursor-target">
                  <ShinyText text="What We Do" speed={3} />
                </a>
              </div>
            </div>
            
            <div className="hero-divider" style={{ width: '2px', minHeight: '220px', alignSelf: 'stretch', display: 'flex', alignItems: 'center' }}>
              <ElectricBorder 
                color="#a855f7" 
                speed={1.2}
                thickness={2}
                className="electric-divider"
              >
                <div className="divider-content" style={{ width: '2px', height: '100%', background: 'transparent' }}></div>
              </ElectricBorder>
            </div>

            <div className="hero-right" style={{ display: 'grid', placeItems: 'center', textAlign: 'center', gap: '16px' }}>
              <h2 style={{ fontSize: 'clamp(18px, 3.2vw, 32px)', margin: 0 }}>Talk to our chatbot to understand what we do</h2>
              <div style={{ marginTop: '8px' }}>
                <Orb onClick={handleOpenChat} style={{ position: 'static', left: 'auto', top: 'auto', transform: 'none' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero


