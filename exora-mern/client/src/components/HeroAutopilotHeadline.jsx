import BlurText from './BlurText';

const LINES = {
  desktop: ['YOUR', 'BUSINESS.', 'ON AUTOPILOT.'],
  mobile: ['YOUR', 'BUSINESS', 'ON AUTO-', 'PILOT.'],
};

export default function HeroAutopilotHeadline({ variant = 'desktop' }) {
  const lines = LINES[variant] ?? LINES.desktop;
  const headingClass = variant === 'mobile' ? 'editorial-headline' : 'hero-heading-line';

  return (
    <h1 className={headingClass}>
      <div className="hero-heading-blur">
        {lines.map((line, index) => (
          <BlurText
            key={`${line}-${index}`}
            text={line}
            className={
              variant === 'mobile' && index >= 2
                ? 'hero-heading-blur-line hero-heading-blur-line--outline'
                : 'hero-heading-blur-line'
            }
            delay={120}
            animateBy="words"
            direction="top"
            stepDuration={0.35}
            threshold={0.15}
            rootMargin="-40px"
          />
        ))}
      </div>
    </h1>
  );
}
