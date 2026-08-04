import { Link } from 'react-router-dom';
import './GlassIcons.css';

const GlassIcons = ({ items, className }) => {
  const renderContent = (item) => (
    <>
      <span className="icon-btn__back" />
      <span className="icon-btn__front">
        <span className="icon-btn__icon" aria-hidden="true">
          {item.icon}
        </span>
        <span className="icon-btn__label">{item.label}</span>
      </span>
    </>
  );

  return (
    <div className={`icon-btns ${className || ''}`}>
      {items.map((item, index) =>
        item.to ? (
          <Link
            key={index}
            to={item.to}
            className={`icon-btn icon-btn--link ${item.customClass || ''}`}
            aria-label={item.label}
          >
            {renderContent(item)}
          </Link>
        ) : (
          <button
            key={index}
            className={`icon-btn ${item.customClass || ''}`}
            aria-label={item.label}
            type="button"
          >
            {renderContent(item)}
          </button>
        )
      )}
    </div>
  );
};

export default GlassIcons;
