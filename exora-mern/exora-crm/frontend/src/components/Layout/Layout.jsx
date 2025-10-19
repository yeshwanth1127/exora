import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getIndustryConfig } from '../../services/api';
import './Layout.css';

const Layout = ({ children, user }) => {
  const location = useLocation();
  const [industryConfig, setIndustryConfig] = useState(null);

  useEffect(() => {
    loadIndustryConfig();
  }, []);

  const loadIndustryConfig = async () => {
    try {
      const config = await getIndustryConfig();
      setIndustryConfig(config);
    } catch (error) {
      console.error('Failed to load industry config:', error);
    }
  };

  const getLabel = (key) => {
    if (!industryConfig) return key;
    return industryConfig.template?.[key] || key;
  };

  const navItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/contacts', icon: '👥', label: getLabel('contact_label_plural') || 'Contacts' },
    { path: '/pipeline', icon: '🎯', label: 'Pipeline' },
    { path: '/calendar', icon: '📅', label: 'Calendar' },
    { path: '/inbox', icon: '💬', label: 'Inbox' },
    { path: '/automations', icon: '⚡', label: 'Automations' },
    { path: '/automation-history', icon: '🤖', label: 'History' },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">Exora CRM</h1>
          {industryConfig && (
            <span className="industry-badge">{industryConfig.template?.name}</span>
          )}
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;

