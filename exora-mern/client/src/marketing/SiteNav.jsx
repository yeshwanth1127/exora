import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Arrow = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 12 12 4m0 0H6.5M12 4v5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const links = [
  { n: '01', label: 'Qlix', note: 'Desktop AI system', to: '/' },
  { n: '02', label: 'Assistant', note: 'Included with Qlix', to: '/#assistant' },
  { n: '03', label: 'Catalogue', note: 'Complete capabilities', to: '/master-catalogue' },
  { n: '04', label: 'For business', note: 'Operational AI systems', to: '/solutions' },
  { n: '05', label: 'Company', note: 'About Exora', to: '/about' },
  { n: '06', label: 'Contact', note: 'Start a conversation', to: '/contact' },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <header className={`ex-nav-shell${open ? ' is-open' : ''}`}>
      <nav className="ex-nav-bar" aria-label="Main navigation">
        <button className="ex-nav-toggle" type="button" aria-expanded={open} aria-controls="ex-nav-panel" onClick={() => setOpen((value) => !value)}>
          <span className="ex-nav-toggle-icon" aria-hidden><i /><i /></span>
          <span>{open ? 'Close' : 'Menu'}</span>
        </button>

        <Link className="ex-nav-wordmark" to="/" onClick={() => setOpen(false)} aria-label="Exora home"><span>EXORA</span></Link>

        <Link className="ex-nav-contact" to="/contact" onClick={() => setOpen(false)}>
          <span>Start a project</span><Arrow />
        </Link>
      </nav>

      <div id="ex-nav-panel" className="ex-nav-panel" aria-hidden={!open}>
        <div className="ex-nav-panel-intro">
          <span>EXORA / NAVIGATION</span>
          <p>AI products and operational systems designed to put intelligence to work.</p>
          <small>INDIA · BUILDING GLOBALLY</small>
        </div>
        <div className="ex-nav-links">
          {links.map((item) => (
            <Link key={item.n} to={item.to} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>
              <span>{item.n}</span>
              <div><b>{item.label}</b><small>{item.note}</small></div>
              <Arrow />
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
