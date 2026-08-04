import { useLocation } from 'react-router-dom';
import AppBackground from './AppBackground';
import SoftAurora from './SoftAurora';
import './AppBackgroundSwitcher.css';

export default function AppBackgroundSwitcher() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  if (isHome) {
    return (
      <div className="home-landing-background" aria-hidden="true">
        <div className="home-landing-background__aurora">
          <SoftAurora
            speed={0.6}
            scale={1.5}
            brightness={0.75}
            color1="#f7f7f7"
            color2="#a855f7"
            noiseFrequency={2.5}
            noiseAmplitude={1.0}
            bandHeight={0.5}
            bandSpread={1.0}
            octaveDecay={0.1}
            layerOffset={0}
            colorSpeed={1.0}
            enableMouseInteraction
            mouseInfluence={0.25}
          />
        </div>
      </div>
    );
  }

  return <AppBackground />;
}
