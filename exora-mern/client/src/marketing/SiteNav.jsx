import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const [brandText, setBrandText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    const full = 'EXORA';
    const delay = deleting ? 90 : 135;
    const timer = setTimeout(() => {
      if (!deleting && brandText === full) {
        setTimeout(() => setDeleting(true), 1100);
      } else if (deleting && brandText === '') {
        setDeleting(false);
      } else {
        setBrandText(deleting ? full.slice(0, brandText.length - 1) : full.slice(0, brandText.length + 1));
      }
    }, brandText === full || (deleting && brandText === '') ? 450 : delay);
    return () => clearTimeout(timer);
  }, [brandText, deleting]);
  return (
    <header className="mx-nav-wrap">
      <nav className="mx-nav" aria-label="Main navigation">
        <button className="mx-menu-button" type="button" aria-expanded={open} aria-controls="mx-menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}><span /> <span /></button>
        <Link className="mx-brand" to="/" onClick={close} aria-label="Exora home">
          <span aria-hidden>{brandText}</span><i className="mx-brand-caret" aria-hidden />
        </Link>
        <div id="mx-menu" className={`mx-menu ${open ? 'is-open' : ''}`}>
          <NavLink to="/qlix" onClick={close}>Qlix</NavLink>
          <NavLink to="/solutions" onClick={close}>For business</NavLink>
          <NavLink to="/about" onClick={close}>Company</NavLink>
          <NavLink to="/security" onClick={close}>Security</NavLink>
          <NavLink to="/career" onClick={close}>Careers</NavLink>
          <Link className="mx-nav-cta" to="/contact" onClick={close}>Talk to Exora <svg className="mx-arrow-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 12L12 4M12 4H6.5M12 4V9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></Link>
        </div>
      </nav>
    </header>
  );
}
