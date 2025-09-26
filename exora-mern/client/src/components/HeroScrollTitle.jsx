import './HeroScrollTitle.css';

const HeroScrollTitle = ({ text = 'Your automation + assistance hub', className = '', speed = 30 }) => {
  const styleVars = { ['--marquee-duration']: `${speed}s` };
  return (
    <div className={`hero-scroll-title ${className}`} style={styleVars}>
      <div className="marquee marquee--left">
        <div className="marquee__inner" aria-hidden="true">
          <span>{text}.&nbsp;</span>
          <span>{text}&nbsp;</span>
          <span>{text}&nbsp;</span>
          <span>{text}&nbsp;</span>
        </div>
      </div>
      <div className="marquee marquee--right">
        <div className="marquee__inner" aria-hidden="true">
          <span>{text}.&nbsp;</span>
          <span>{text}&nbsp;</span>
          <span>{text}&nbsp;</span>
          <span>{text}&nbsp;</span>
        </div>
      </div>
    </div>
  );
};

export default HeroScrollTitle;


