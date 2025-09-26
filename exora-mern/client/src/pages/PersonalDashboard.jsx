import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Particles from '../components/Particles';
import CardNav from '../components/CardNav';
import { API_BASE_URL, SOCKET_URL } from '../config/api';
import './PersonalDashboard.css';

const PersonalDashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [userAgents, setUserAgents] = useState([]);
  const [productTemplates, setProductTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API base URL is imported from config

  // Fetch product templates
  const fetchProductTemplates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/templates`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProductTemplates(data.data.templates || []);
      }
    } catch (error) {
      console.error('Templates fetch error:', error);
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/dashboard/overview`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setDashboardData(data.data);
          setUserAgents(data.data.userAgents || []);
        } else {
          throw new Error('Failed to fetch dashboard data');
        }
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    fetchProductTemplates();

    // Realtime subscription
    let socket;
    try {
      socket = io(SOCKET_URL, { transports: ['websocket'] });
      socket.on('connect', () => {
        if (user?.id) socket.emit('subscribe:dashboard', user.id);
      });
      socket.on('dashboard:update', () => {
        fetchDashboardData();
        fetchProductTemplates();
      });
    } catch (_) {}

    return () => {
      if (socket) socket.disconnect();
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null; // Prevent flash of content
  }

  if (loading) {
    return (
      <div className="personal-dashboard">
        <div className="personal-dashboard-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your personal dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="personal-dashboard">
        <div className="personal-dashboard-content">
          <div className="error-container">
            <h2>Error loading dashboard</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  // Personal-focused stats
  const stats = dashboardData ? [
    { label: 'Personal Agents', value: dashboardData.stats.activeAgents.toString(), change: dashboardData.changes.activeAgents },
    { label: 'Tasks Completed', value: dashboardData.stats.automatedTasks.toLocaleString(), change: dashboardData.changes.automatedTasks },
    { label: 'Time Saved', value: `${dashboardData.stats.timeSaved}h`, change: dashboardData.changes.timeSaved },
    { label: 'Success Rate', value: `${dashboardData.stats.successRate}%`, change: dashboardData.changes.successRate }
  ] : [];

  const recentActivity = dashboardData ? dashboardData.recentActivities : [];

  // Convert templates to product format for display
  const personalProducts = productTemplates.map(template => ({
    id: template.id,
    name: template.name,
    description: template.description,
    icon: template.icon,
    status: 'Available',
    features: template.features || []
  }));

  return (
    <div className="personal-dashboard">
      <Particles
        particleColors={['#c084fc', '#a855f7', '#7c3aed']}
        particleCount={150}
        particleSpread={6}
        speed={0.03}
        particleBaseSize={40}
        moveParticlesOnHover={false}
        alphaParticles={false}
        disableRotation={false}
      />
      
      {/* Navigation */}
      <CardNav
        items={[
          { label: 'About', bgColor: '#0D0716', textColor: '#fff', links: [ { label: 'Company', ariaLabel: 'About Company', href: '#company' }, { label: 'Careers', ariaLabel: 'About Careers', href: '#company' } ] },
          { label: 'Products', bgColor: '#170D27', textColor: '#fff', links: [ { label: 'Featured', ariaLabel: 'Featured Projects', href: '#products' }, { label: 'Case Studies', ariaLabel: 'Project Case Studies', href: '#solutions' } ] },
          { label: 'Join us', bgColor: '#271E37', textColor: '#fff', links: [ { label: 'Email', ariaLabel: 'Email us', href: '#join' }, { label: 'Twitter', ariaLabel: 'Twitter', href: '#join' }, { label: 'LinkedIn', ariaLabel: 'LinkedIn', href: '#join' } ] }
        ]}
        baseColor="rgba(255,255,255,0.08)"
        menuColor="#fff"
        buttonBgColor="rgba(17,17,17,0.75)"
        buttonTextColor="#fff"
        ease="power3.out"
      />

      <div className="personal-dashboard-content">
        <h1 className="personal-title">personal</h1>
        {/* Header */}
        <div className="personal-dashboard-header">
          <div className="personal-dashboard-welcome">
            <h1 className="personal-dashboard-title">
              Welcome to your personal space, {user?.firstName}!
            </h1>
            <p className="personal-dashboard-subtitle">
              Your personal AI assistants are here to make your life easier
            </p>
          </div>
          <div className="personal-dashboard-user-info">
            <div className="user-avatar">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.firstName} {user?.lastName}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="personal-dashboard-stats">
          {stats.map((stat, index) => (
            <div key={index} className="personal-stat-card">
              <div className="personal-stat-value">{stat.value}</div>
              <div className="personal-stat-label">{stat.label}</div>
              <div className="personal-stat-change">{stat.change}</div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="personal-dashboard-main">
          {/* Personal Products Section */}
          <div className="personal-dashboard-section">
            <div className="personal-section-header">
              <h2 className="personal-section-title">Personal AI Assistants</h2>
              <p className="personal-section-subtitle">AI tools designed for your personal life</p>
            </div>
            
            <div className="personal-products-grid">
              {personalProducts.map((product) => (
                <div key={product.id} className="personal-product-card">
                  <div className="personal-product-header">
                    <div className="personal-product-icon">{product.icon}</div>
                    <div className="personal-product-status">{product.status}</div>
                  </div>
                  <h3 className="personal-product-name">{product.name}</h3>
                  <p className="personal-product-description">{product.description}</p>
                  <div className="personal-product-features">
                    {product.features.map((feature, index) => (
                      <span key={index} className="personal-feature-tag">{feature}</span>
                    ))}
                  </div>
                  <button className="personal-product-action">
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* AI Agents Section */}
          <div className="personal-dashboard-section">
            <div className="personal-section-header">
              <h2 className="personal-section-title">Your AI Agents</h2>
              <p className="personal-section-subtitle">Personal AI assistants working for you</p>
            </div>
            
            <div className="personal-agents-grid">
              {userAgents.length > 0 ? userAgents.map((agent) => (
                <div key={agent.id} className="personal-agent-card">
                  <div className="personal-agent-header">
                    <div className="personal-agent-icon">
                      {agent.agentType === 'personal_assistant' && '🤖'}
                      {agent.agentType === 'note_taking' && '📝'}
                      {agent.agentType === 'health' && '💊'}
                      {agent.agentType === 'data_intelligence' && '📊'}
                      {agent.agentType === 'customer_experience' && '🎯'}
                    </div>
                    <div className={`personal-agent-status ${agent.status}`}>
                      {agent.status}
                    </div>
                  </div>
                  <h3 className="personal-agent-name">{agent.name}</h3>
                  <p className="personal-agent-type">{agent.agentType.replace('_', ' ').toUpperCase()}</p>
                  <div className="personal-agent-meta">
                    <span className="personal-agent-created">
                      Created {new Date(agent.createdAt).toLocaleDateString()}
                    </span>
                    <span className="personal-agent-activity">
                      Last active {new Date(agent.lastActivityAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="personal-no-agents">
                  <div className="personal-no-agents-icon">🤖</div>
                  <h3>No personal agents yet</h3>
                  <p>Deploy your first personal AI assistant to get started</p>
                  <button className="personal-deploy-agent-btn">
                    Deploy Agent
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="personal-dashboard-sidebar">
            {/* Recent Activity */}
            <div className="personal-sidebar-section">
              <h3 className="personal-sidebar-title">Recent Activity</h3>
              <div className="personal-activity-list">
                {recentActivity.length > 0 ? recentActivity.map((activity) => (
                  <div key={activity.id} className="personal-activity-item">
                    <div className="personal-activity-icon">
                      {activity.type === 'agent_created' && '🤖'}
                      {activity.type === 'task_completed' && '✅'}
                      {activity.type === 'error' && '❌'}
                      {activity.type === 'status_change' && '🔄'}
                      {activity.type === 'interaction' && '💬'}
                    </div>
                    <div className="personal-activity-content">
                      <p className="personal-activity-message">{activity.message}</p>
                      <span className="personal-activity-time">{activity.time}</span>
                    </div>
                  </div>
                )) : (
                  <div className="personal-no-activities">
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="personal-sidebar-section">
              <h3 className="personal-sidebar-title">Quick Actions</h3>
              <div className="personal-quick-actions">
                <button className="personal-quick-action-btn">
                  <span className="personal-action-icon">➕</span>
                  Add Personal Assistant
                </button>
                <button className="personal-quick-action-btn">
                  <span className="personal-action-icon">📊</span>
                  View Progress
                </button>
                <button className="personal-quick-action-btn">
                  <span className="personal-action-icon">⚙️</span>
                  Settings
                </button>
                <button className="personal-quick-action-btn">
                  <span className="personal-action-icon">📞</span>
                  Get Help
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDashboard;
