import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Particles from '../components/Particles';
import CardNav from '../components/CardNav';
import DotGrid from '../components/DotGrid';
import { API_BASE_URL, SOCKET_URL } from '../config/api';
import './BusinessDashboard.css';

const BusinessDashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
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
          console.log('Dashboard data received:', data.data);
          console.log('User agents:', data.data.userAgents);
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
        // refetch on update
        fetchDashboardData();
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
      <div className="dashboard">
        <div className="dashboard-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-content">
          <div className="error-container">
            <h2>Error loading dashboard</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  // Convert templates to product format for display
  const products = productTemplates.map(template => ({
    id: template.id,
    name: template.name,
    description: template.description,
    icon: template.icon,
    status: 'Available',
    features: template.features || []
  }));

  // Use dynamic data from API
  const stats = dashboardData ? [
    { label: 'Active Agents', value: dashboardData.stats.activeAgents.toString(), change: dashboardData.changes.activeAgents },
    { label: 'Automated Tasks', value: dashboardData.stats.automatedTasks.toLocaleString(), change: dashboardData.changes.automatedTasks },
    { label: 'Time Saved', value: `${dashboardData.stats.timeSaved}h`, change: dashboardData.changes.timeSaved },
    { label: 'Success Rate', value: `${dashboardData.stats.successRate}%`, change: dashboardData.changes.successRate }
  ] : [];

  const recentActivity = dashboardData ? dashboardData.recentActivities : [];

  return (
    <div className="dashboard">
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

      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-welcome">
            <h1 className="dashboard-title">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="dashboard-subtitle">
              Here's what's happening with your AI automation solutions
            </p>
          </div>
          <div className="dashboard-user-info">
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
        <div className="dashboard-stats">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-change">{stat.change}</div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="dashboard-main">
          {/* Products Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">AI Automation Solutions</h2>
              <p className="section-subtitle">Deploy intelligent agents across your business</p>
            </div>
            
            <div className="products-grid">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-header">
                    <div className="product-icon">{product.icon}</div>
                    <div className="product-status">{product.status}</div>
                  </div>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-features">
                    {product.features.map((feature, index) => (
                      <span key={index} className="feature-tag">{feature}</span>
                    ))}
                  </div>
                  <button className="product-action">
                    Learn More
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* AI Agents Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Your AI Agents</h2>
              <p className="section-subtitle">Active agents deployed across your business</p>
            </div>
            
            <div className="agents-grid">
              {userAgents.length > 0 ? userAgents.map((agent) => (
                <div key={agent.id} className="agent-card">
                  <div className="agent-header">
                    <div className="agent-icon">
                      {agent.agentType === 'customer_service' && '🤖'}
                      {agent.agentType === 'sales' && '💼'}
                      {agent.agentType === 'operations' && '⚙️'}
                      {agent.agentType === 'data_intelligence' && '📊'}
                      {agent.agentType === 'consulting' && '🔍'}
                      {agent.agentType === 'customer_experience' && '🎯'}
                    </div>
                    <div className={`agent-status ${agent.status}`}>
                      {agent.status}
                    </div>
                  </div>
                  <h3 className="agent-name">{agent.name}</h3>
                  <p className="agent-type">{agent.agentType.replace('_', ' ').toUpperCase()}</p>
                  <div className="agent-meta">
                    <span className="agent-created">
                      Created {new Date(agent.createdAt).toLocaleDateString()}
                    </span>
                    <span className="agent-activity">
                      Last active {new Date(agent.lastActivityAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="no-agents">
                  <div className="no-agents-icon">🤖</div>
                  <h3>No agents deployed yet</h3>
                  <p>Deploy your first AI agent to get started with automation</p>
                  <button className="deploy-agent-btn">
                    Deploy Agent
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="dashboard-sidebar">
            {/* Recent Activity */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">Recent Activity</h3>
              <div className="activity-list">
                {recentActivity.length > 0 ? recentActivity.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      {activity.type === 'agent_created' && '🤖'}
                      {activity.type === 'task_completed' && '✅'}
                      {activity.type === 'error' && '❌'}
                      {activity.type === 'status_change' && '🔄'}
                      {activity.type === 'interaction' && '💬'}
                    </div>
                    <div className="activity-content">
                      <p className="activity-message">{activity.message}</p>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </div>
                )) : (
                  <div className="no-activities">
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">Quick Actions</h3>
              <div className="quick-actions">
                <button className="quick-action-btn">
                  <span className="action-icon">➕</span>
                  Deploy New Agent
                </button>
                <button className="quick-action-btn">
                  <span className="action-icon">📊</span>
                  View Analytics
                </button>
                <button className="quick-action-btn">
                  <span className="action-icon">⚙️</span>
                  Settings
                </button>
                <button className="quick-action-btn">
                  <span className="action-icon">📞</span>
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
