import Noise from './Noise';
import './AppBackground.css';

export default function AppBackground() {
  return (
    <div className="app-background" aria-hidden="true">
      <div className="bg-radials" />
      <Noise
        patternSize={250}
        patternScaleX={1}
        patternScaleY={1}
        patternRefreshInterval={2}
        patternAlpha={20}
      />
    </div>
  );
}
