import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <footer className="mx-footer">
      <div className="mx-footer-top">
        <div><div className="mx-brand mx-footer-brand"><img src="/logo_solo.png" alt="" /><span>EXORA</span></div><p>Qlix gives people and businesses a governed way to create, run, and review AI agents.</p></div>
        <div className="mx-footer-links"><div><span>PRODUCT</span><Link to="/qlix">Qlix</Link><Link to="/solutions">Business solutions</Link></div><div><span>COMPANY</span><Link to="/about">About</Link><Link to="/career">Careers</Link><Link to="/contact">Contact</Link></div><div><span>CONNECT</span><a href="mailto:support@exora.solutions">support@exora.solutions</a><a href="https://www.linkedin.com/company/exora_solutions/" target="_blank" rel="noreferrer">LinkedIn</a></div></div>
      </div>
      <div className="mx-footer-bottom"><span>© {new Date().getFullYear()} Exora</span><span>Qlix · Build agents. Keep control.</span></div>
    </footer>
  );
}
