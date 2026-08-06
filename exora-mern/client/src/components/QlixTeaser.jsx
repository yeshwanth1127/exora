import MagicRings from './MagicRings';
import './Qlix.css';

const QlixTeaser = () => {
  const goToQlix = () => window.location.assign('https://qlix.exora.solutions');

  return (
    <section className="qlix-teaser-section" aria-label="Qlix teaser">
      <div
        className="qlix-teaser-magic"
        onClick={goToQlix}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            goToQlix();
          }
        }}
        role="link"
        aria-label="Explore Qlix at qlix.exora.solutions"
        tabIndex={0}
      >
        <div className="qlix-teaser-magic-canvas" aria-hidden="true">
          <MagicRings
            color="#a855f7"
            colorTwo="#6366f1"
            ringCount={6}
            speed={1}
            attenuation={10}
            lineThickness={2}
            baseRadius={0.35}
            radiusStep={0.1}
            scaleRate={0.1}
            opacity={1}
            blur={0}
            noiseAmount={0.1}
            rotation={0}
            ringGap={1.5}
            fadeIn={0.7}
            fadeOut={0.5}
            followMouse
            mouseInfluence={0.2}
            hoverScale={1.2}
            parallax={0.05}
            clickBurst
          />
        </div>
        <div className="qlix-teaser-magic-label">
          <div className="qlix-teaser-magic-title">
            <span className="qlix-teaser-magic-line">explore</span>
            <span className="qlix-teaser-magic-line qlix-teaser-magic-line--brand">QLIX</span>
          </div>
          <span className="qlix-teaser-magic-by">— by Exora</span>
        </div>
      </div>
    </section>
  );
};

export default QlixTeaser;
