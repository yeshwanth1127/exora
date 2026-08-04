import React from 'react';
import ShinyText from './ShinyText';
import HeroScrollTitle from './HeroScrollTitle';
import ElectricBorder from './ElectricBorder';
import Orb from './Orb';

const Hero = ({ onOpenChat, showDashboardButton, onDashboardClick }) => {
  const handleOpenChat = () => {
    if (onOpenChat) {
      onOpenChat();
    } else {
      console.log('Open chatbot');
    }
  };

  const handleDashboardClick = () => {
    if (onDashboardClick) {
      onDashboardClick();
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
                {showDashboardButton && (
                  <button 
                    onClick={handleDashboardClick}
                    className="button-primary cursor-target"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      marginLeft: '16px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    Go to Dashboard
                  </button>
                )}
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


