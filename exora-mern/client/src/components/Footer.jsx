import React from 'react';
import { Link } from 'react-router-dom';
import { MoveUpRight } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="exora-footer">
      <div className="footer-container">
        <div className="footer-main">
          {/* Logo & Tagline Column */}
          <div className="footer-column brand-column">
            <h2 className="footer-logo">Exora</h2>
            <p className="footer-tagline">
              Transforming business with AI.
              Building what's next.
            </p>
            <div className="footer-emails">
              <a href="mailto:support@exora.solutions" className="footer-email">support@exora.solutions</a>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="footer-nav-group">
            <div className="footer-column">
              <h3 className="footer-label">ABOUT</h3>
              <ul className="footer-links">
                <li>
                  <Link to="/about">
                    <MoveUpRight size={14} className="link-icon" />
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/career">
                    <MoveUpRight size={14} className="link-icon" />
                    Career
                  </Link>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="footer-label">PRODUCTS</h3>
              <ul className="footer-links">
                <li>
                  <Link to="/products">
                    <MoveUpRight size={14} className="link-icon" />
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/solutions">
                    <MoveUpRight size={14} className="link-icon" />
                    Solutions
                  </Link>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="footer-label">CONTACT</h3>
              <ul className="footer-links">
                <li>
                  <Link to="/contact">
                    <MoveUpRight size={14} className="link-icon" />
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear}{' '}
            <span className="footer-exora-brand">Exora</span>. All rights reserved.
          </p>
          <a href="https://exora.solutions" target="_blank" rel="noopener noreferrer" className="footer-site-link">
            exora.solutions
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
