import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return <footer className="mx-footer">
    <div className="mx-footer-top">
      <div><Link className="mx-brand mx-footer-brand" to="/"><img src="/logo_solo.png" alt=""/><span>EXORA</span></Link><p>Exora builds Qlix and the intelligent systems that digitalise how modern businesses work.</p></div>
      <div className="mx-footer-links">
        <div><span>PRODUCT</span><Link to="/">Qlix Desktop</Link><a href="#assistant">Assistant</a><Link to="/solutions">Use cases</Link></div>
        <div><span>COMPANY</span><Link to="/about">About</Link><Link to="/career">Careers</Link><Link to="/contact">Contact</Link></div>
        <div><span>TRUST</span><Link to="/security">Security</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></div>
        <div><span>CONNECT</span><a href="mailto:support@exora.solutions">support@exora.solutions</a><a href="https://www.linkedin.com/company/exora_solutions/" target="_blank" rel="noreferrer">LinkedIn</a></div>
      </div>
    </div>
    <div className="mx-footer-word">EXORA</div>
    <div className="mx-footer-bottom"><span>© {new Date().getFullYear()} Exora Solutions</span><span>QLIX · AI PRODUCTS · DIGITAL SYSTEMS</span></div>
  </footer>;
}
