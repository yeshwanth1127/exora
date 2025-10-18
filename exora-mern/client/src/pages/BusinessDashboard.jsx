import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useActivation } from '../contexts/ActivationContext';
import Particles from '../components/Particles';
import CardNav from '../components/CardNav';
import DotGrid from '../components/DotGrid';
import DashboardAlex from '../components/DashboardAlex';
import WorkflowStatsModal from '../components/WorkflowStatsModal';
import ActivationWizard from '../components/ActivationWizard';
import WorkflowExecutionModal from '../components/WorkflowExecutionModal';
import { API_BASE_URL, SOCKET_URL } from '../config/api';
import './BusinessDashboard.css';

const BusinessDashboard = () => {
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { startActivation, activationSession, isActivating } = useActivation();
  const [activeTab, setActiveTab] = useState('overview');
  const [showActivationWizard, setShowActivationWizard] = useState(false);
  const [activatingWorkflow, setActivatingWorkflow] = useState(null);
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [executingWorkflow, setExecutingWorkflow] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    businessInfo: {},
    workflows: [],
    recommendations: [],
    metrics: {},
    isConfigured: false
  });
  const [userAgents, setUserAgents] = useState([]);
  const [productTemplates, setProductTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAlex, setShowAlex] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [selectedWorkflowStats, setSelectedWorkflowStats] = useState(null);
  const [statsData, setStatsData] = useState({
    activeWorkflows: 0,
    automatedTasks: 0,
    timeSaved: '0 hours',
    successRate: '0%'
  });
  const [crmActivated, setCrmActivated] = useState(false);

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

  // Fetch aggregated workflow statistics
  const fetchAggregatedStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/workflow-stats/aggregated`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatsData(data.data);
      }
    } catch (error) {
      console.error('Stats fetch error:', error);
    }
  };

  // Check if CRM workflow exists and is activated
  const checkCRMActivation = () => {
    // CRM is activated if there's a workflow with "CRM" in the name that's active
    const crmWorkflow = dashboardData.workflows?.find(w => 
      w.name?.toLowerCase().includes('crm') && w.status === 'active'
    );
    setCrmActivated(!!crmWorkflow);
    return crmWorkflow;
  };

  // Handle Open CRM button click
  const handleOpenCRM = () => {
    // Get JWT token from localStorage
    const token = localStorage.getItem('token');
    
    // Determine CRM URL based on environment
    const CRM_URL = import.meta.env.VITE_CRM_URL || 
                    (window.location.hostname === 'localhost' 
                      ? 'http://localhost:3001' 
                      : 'https://crm.exora.solutions');
    
    // Open CRM in new tab with token for authentication
    window.open(`${CRM_URL}?token=${token}`, '_blank');
  };

  // Handle CRM card click - Same logic as Alex chat
  const handleCRMClick = async () => {
    const crmWorkflow = checkCRMActivation();
    
    if (crmActivated && crmWorkflow) {
      // CRM is already activated - open CRM frontend
      // Production: https://crm.exora.solutions
      // Development: http://localhost:3001
      const CRM_FRONTEND_URL = import.meta.env.VITE_CRM_URL || 
                                (window.location.hostname === 'localhost' 
                                  ? 'http://localhost:3001' 
                                  : 'https://crm.exora.solutions');
      const token = localStorage.getItem('token');
      window.open(`${CRM_FRONTEND_URL}?token=${token}`, '_blank');
    } else {
      // Add CRM workflow to dashboard - same logic as Alex chat
      try {
        // Fetch all workflows to find CRM template
        const response = await fetch(`${API_BASE_URL}/workflows`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch workflows');
        }

        const result = await response.json();
        const workflows = result.workflows || result;
        
        // Find the CRM workflow by ID or name
        const CRM_WORKFLOW_ID = 'X2PlE5wehzaBCdSe';
        const crmWorkflowTemplate = workflows.find(w => 
          w.id === CRM_WORKFLOW_ID || w.name?.toLowerCase().includes('crm')
        );
        
        if (!crmWorkflowTemplate) {
          alert('CRM workflow not found. Please import the CRM workflow template to n8n first.');
          return;
        }
        
        // Add workflow to dashboard - exact same as Alex chat
        const addResponse = await fetch(`${API_BASE_URL}/dashboard/workflows`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            workflows: [{ ...crmWorkflowTemplate, isCRM: true }]  // Mark as CRM
          })
        });
        
        if (addResponse.ok) {
          const addResult = await addResponse.json();
          console.log('CRM workflow added:', addResult);
          
          // Reload to show updated dashboard
          window.location.reload();
        } else {
          const error = await addResponse.json();
          alert(error.message || 'Failed to add CRM workflow');
        }
        
      } catch (error) {
        console.error('Error adding CRM:', error);
        alert('Failed to add CRM. Please try again.');
      }
    }
  };

  // Show individual workflow statistics
  const showWorkflowStats = async (workflowId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedWorkflowStats(data.data);
        setStatsModalOpen(true);
      } else {
        alert('Failed to load workflow statistics. Make sure the workflow is activated.');
      }
    } catch (error) {
      console.error('Failed to fetch workflow stats:', error);
      alert('Failed to load workflow statistics');
    }
  };

  // Redirect if not authenticated (but wait for initial load)
  useEffect(() => {
    // Don't redirect if still loading auth state
    if (authLoading) return;
    
    // Don't redirect if coming back from OAuth callback
    const params = new URLSearchParams(window.location.search);
    if (params.has('workflowActivated') || params.has('error')) {
      // Let the OAuth callback handler deal with it
      return;
    }
    
    // Only redirect to auth if genuinely not authenticated
    if (!isAuthenticated && !authLoading) {
      console.log('Not authenticated, redirecting to login');
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Handle OAuth callback success/error messages
  useEffect(() => {
    // Skip if auth still loading
    if (authLoading) return;
    
    const params = new URLSearchParams(window.location.search);
    const workflowActivated = params.get('workflowActivated');
    const clonedWorkflowId = params.get('clonedWorkflowId');
    const workflowName = params.get('workflowName');
    const error = params.get('error');
    const errorDetails = params.get('details');

    if (workflowActivated === 'true' && clonedWorkflowId) {
      const name = workflowName ? decodeURIComponent(workflowName) : 'Workflow';
      alert(`✅ Success! ${name} has been activated and is now running for you.\n\nWorkflow ID: ${clonedWorkflowId}`);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Refresh dashboard data
      window.location.reload();
    } else if (error) {
      const details = errorDetails ? decodeURIComponent(errorDetails) : error;
      console.error('❌ Activation error:', error, details);
      alert(`❌ Activation failed: ${details}\n\nPlease try again or contact support if the issue persists.`);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // NEW: Handle resumeActivation query parameter (after OAuth redirect)
    const resumeActivation = params.get('resumeActivation');
    if (resumeActivation === 'true' && activationSession) {
      console.log('[NEW] Resuming activation session after OAuth callback');
      setShowActivationWizard(true);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [isAuthenticated, authLoading, activationSession]);

  // Handle dashboard updates from Alex
  const handleDashboardUpdate = (newData) => {
    setDashboardData(newData);
  };

  // Workflow management functions - Handle Activation Flow
  const toggleWorkflowStatus = async (workflowId, currentStatus) => {
    try {
      // If deactivating, handle workflow deactivation
      if (currentStatus === 'active') {
        const confirmed = window.confirm('Are you sure you want to deactivate this workflow? The workflow will stop running completely.');
        if (!confirmed) {
          return;
        }

        const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}/status`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'inactive' })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✓ Workflow deactivated:', data);
          
          // Update local state
          setDashboardData(prev => ({
            ...prev,
            workflows: prev.workflows.map(w => 
              w.id === workflowId ? { ...w, status: 'inactive' } : w
            )
          }));
          
          // Show success message
          alert('✓ Workflow deactivated successfully! The workflow has been stopped.');
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          alert(`Failed to deactivate workflow: ${errorData.error || 'Please try again'}`);
        }
        return;
      }

      // ACTIVATING: First, fetch what credential types this workflow needs
      console.log(`Checking required credentials for workflow ${workflowId}...`);
      
      const backendBaseUrl = API_BASE_URL.replace('/api', '');
      const credCheckResponse = await fetch(`${backendBaseUrl}/workflow-required-creds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ workflowId })
      });

      if (!credCheckResponse.ok) {
        const errorData = await credCheckResponse.json().catch(() => ({ message: 'Failed to fetch credential requirements' }));
        alert(`Failed to check workflow credentials: ${errorData.message || 'Unknown error'}`);
        return;
      }

      const credInfo = await credCheckResponse.json();
      
      if (!credInfo.success) {
        alert(`Failed to fetch required credentials for this workflow: ${credInfo.message || 'Unknown error'}`);
        return;
      }

      // Show the user what credential types will be provisioned
      const allCreds = credInfo.credentialTypes || [];
      const oauthCreds = credInfo.oauthCredentialTypes || [];
      const manualCreds = credInfo.manualCredentialTypes || [];

      console.log('Workflow credential requirements:', {
        all: allCreds,
        oauth: oauthCreds,
        manual: manualCreds,
        scopes: credInfo.scopes
      });

      // Build confirmation message
      let message = `This automation requires the following credentials:\n\n`;
      
      if (oauthCreds.length > 0) {
        message += `📱 Google OAuth (Automatic):\n${oauthCreds.map(c => `  • ${c}`).join('\n')}\n\n`;
      }
      
      if (manualCreds.length > 0) {
        message += `🔑 Manual Configuration (Future):\n${manualCreds.map(c => `  • ${c}`).join('\n')}\n\n`;
      }

      if (oauthCreds.length > 0) {
        message += `Click OK to connect your Google account and automatically set up these credentials.`;
      } else {
        message += `This workflow requires manual credential configuration (not yet implemented).`;
        alert(message);
        return;
      }

      const proceed = window.confirm(message);
      if (!proceed) {
        console.log('User cancelled activation');
        return;
      }

      // Call activate-workflow to build the OAuth URL and redirect
      console.log('Initiating OAuth flow...');
      
      // Find the workflow to check if it's CRM
      const workflow = dashboardData.workflows.find(w => w.id === workflowId);
      const isCRM = workflow?.isCRM || false;
      
      const response = await fetch(`${backendBaseUrl}/activate-workflow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          userId: user.id, 
          workflowId: workflowId,
          isCRM: isCRM  // Pass CRM flag
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Activation request failed' }));
        alert(`Activation initiation failed: ${err.message || JSON.stringify(err)}`);
        return;
      }

      const data = await response.json();
      
      // NEW: Multi-provider activation flow
      if (data.success && data.requiresActivation) {
        console.log('[NEW] Starting multi-provider activation...');
        console.log('[NEW] Provider data:', data.providersByType);
        
        // Find the workflow to get its name
        const workflow = dashboardData.workflows.find(w => w.id === workflowId);
        
        // Use OAuth2 providers which have authorizationUrl attached
        const providersWithAuth = data.providersByType?.oauth2 || data.providers;
        
        console.log('[NEW] Providers with auth:', providersWithAuth);
        
        // Store activation session in context
        startActivation({
          sessionId: data.sessionId,
          workflowId: workflowId,
          providers: providersWithAuth, // Use providers with authorizationUrl
          providersCompleted: [],
          workflowName: workflow?.name || 'Workflow'
        });

        // Set the current activating workflow
        setActivatingWorkflow(workflow);
        
        // Show ActivationWizard modal
        setShowActivationWizard(true);
      } else if (data.success && !data.requiresActivation) {
        // No OAuth required
        alert(data.message || 'This workflow does not require OAuth credentials.');
      } else {
        console.error('Failed to initiate activation:', data);
        alert(`Failed to prepare activation: ${data.message || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error('Error toggling workflow status:', error);
      alert(`An error occurred during activation: ${error.message || 'Please try again.'}`);
    }
  };

  // NEW: Handle running automation
  const handleRunAutomation = (workflow) => {
    console.log('[NEW] Opening execution modal for workflow:', workflow.id);
    setExecutingWorkflow(workflow);
    setShowExecutionModal(true);
  };

  const removeWorkflow = async (workflowId) => {
    // Confirm deletion
    const workflow = dashboardData.workflows.find(w => w.id === workflowId);
    const confirmed = window.confirm(
      `Are you sure you want to delete "${workflow?.name || 'this workflow'}"?\n\nThis will remove it from your dashboard. The workflow template will still be available to add again later.`
    );
    
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update local state
        setDashboardData(prev => ({
          ...prev,
          workflows: prev.workflows.filter(w => w.id !== workflowId)
        }));
        
        alert(`✅ Workflow removed from your dashboard successfully!`);
      } else {
        const error = await response.json();
        alert(`Failed to remove workflow: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error removing workflow:', error);
      alert('Failed to remove workflow. Please try again.');
    }
  };

  // Check CRM status when workflows change
  useEffect(() => {
    if (dashboardData.workflows) {
      checkCRMActivation();
    }
  }, [dashboardData.workflows]);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        
        // Check if user has existing dashboard data
        const response = await fetch(`${API_BASE_URL}/dashboard/overview`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.isConfigured) {
          setDashboardData(data.data);
          setUserAgents(data.data.userAgents || []);
        } else {
            // First time user - show setup
            setShowAlex(true);
          }
        } else {
          // API error - show error, don't force setup
          setError('Failed to load dashboard. Please try again.');
        }
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        // Network error - show error, don't force setup
        setError('Unable to connect to server. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
    fetchProductTemplates();
    
    // Fetch aggregated stats if authenticated
    if (isAuthenticated) {
      fetchAggregatedStats();
    }
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

  // Show empty state if dashboard is not configured
  if (!dashboardData.isConfigured) {
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
          <div className="empty-dashboard">
            <div className="empty-dashboard-content">
              <div className="empty-dashboard-icon">🤖</div>
              <h1 className="empty-dashboard-title">
                Welcome to your Business Dashboard, {user?.firstName}!
              </h1>
              <p className="empty-dashboard-subtitle">
                Let me help you set up your personalized dashboard by learning about your business.
              </p>
              <button 
                className="empty-dashboard-cta"
                onClick={() => setShowAlex(true)}
              >
                <span className="cta-icon">💬</span>
                Start with Alex
              </button>
              <p className="empty-dashboard-hint">
                Alex will ask you a few questions about your business and automatically configure your dashboard with relevant automations and insights.
              </p>
            </div>
          </div>
        </div>

        <DashboardAlex 
          isOpen={showAlex}
          onToggle={() => setShowAlex(!showAlex)}
          onDashboardUpdate={handleDashboardUpdate}
          currentDashboardData={dashboardData}
        />
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

  // Use dynamic data from aggregated stats API
  const stats = [
    { label: 'Active Workflows', value: statsData.activeWorkflows?.toString() || '0', change: '+0' },
    { label: 'Automated Tasks', value: statsData.automatedTasks?.toLocaleString() || '0', change: '+0' },
    { label: 'Time Saved', value: statsData.timeSaved || '0 hours', change: '+0' },
    { label: 'Success Rate', value: statsData.successRate || '0%', change: '+0' }
  ];

  const recentActivity = dashboardData ? dashboardData.recentActivities || [] : [];

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
        {/* Left Navigation Panel */}
        <div className="dashboard-left-panel">
          {/* User Profile */}
          <div className="left-panel-user">
            <div className="left-panel-avatar">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="left-panel-name">{user?.firstName} {user?.lastName}</div>
            <div className="left-panel-email">{user?.email}</div>
          </div>

          {/* Quick Stats */}
          <div>
            <div className="nav-section-title">Overview</div>
            <div className="left-panel-stats">
              {stats.map((stat, index) => (
                <div key={index} className="left-stat-card">
                  <div className="left-stat-label">{stat.label}</div>
                  <div className="left-stat-value">{stat.value}</div>
                  {stat.change && <div className="left-stat-change">{stat.change}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div>
            <div className="nav-section-title">Sections</div>
            <div className="nav-buttons">
              <button className="nav-button active" onClick={() => document.querySelector('.workflows-section')?.scrollIntoView({ behavior: 'smooth' })}>
                <span className="nav-button-icon">⚡</span>
                <span>Active Workflows</span>
              </button>
              <button className="nav-button" onClick={() => document.querySelector('.products-section')?.scrollIntoView({ behavior: 'smooth' })}>
                <span className="nav-button-icon">🚀</span>
                <span>AI Solutions</span>
              </button>
              <button className="nav-button" onClick={() => document.querySelector('.agents-section')?.scrollIntoView({ behavior: 'smooth' })}>
                <span className="nav-button-icon">🤖</span>
                <span>AI Agents</span>
              </button>
              <button className="nav-button" onClick={handleCRMClick}>
                <span className="nav-button-icon">📊</span>
                <span>CRM {crmActivated && '✓'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Main Content Panel */}
        <div className="dashboard-right-panel">
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
          </div>

          {/* Main Content Sections */}
          {/* Workflows Section */}
          {dashboardData.workflows && dashboardData.workflows.length > 0 && (
            <div className="dashboard-section workflows-section">
              <div className="section-header">
                <h2 className="section-title">Your Workflows</h2>
                <p className="section-subtitle">Automation workflows for you.</p>
              </div>
              
              <div className="workflows-grid">
                {dashboardData.workflows.map((workflow) => (
                  <div key={workflow.id} className="workflow-card">
                    <div className="workflow-header">
                      <div className="workflow-icon">{workflow.icon}</div>
                      <div className={`workflow-status ${workflow.status}`}>
                        {workflow.status}
                      </div>
                    </div>
                    <h3 className="workflow-name">{workflow.name}</h3>
                    <p className="workflow-category">{workflow.category}</p>
                    <p className="workflow-description">{workflow.description}</p>
                    <div className="workflow-stats">
                      <div className="workflow-stat">
                        <span className="stat-label">Nodes:</span>
                        <span className="stat-value">{workflow.nodes}</span>
                      </div>
                      <div className="workflow-stat">
                        <span className="stat-label">Connections:</span>
                        <span className="stat-value">{workflow.connections}</span>
                      </div>
                    </div>
                    <div className="workflow-actions">
                      {workflow.status !== 'active' ? (
                        <>
                          {/* Inactive workflow: Show Activate and Delete */}
                          <button 
                            className="workflow-toggle activate"
                            onClick={() => toggleWorkflowStatus(workflow.id, workflow.status)}
                          >
                            Activate
                          </button>
                          <button 
                            className="workflow-delete-btn"
                            onClick={() => removeWorkflow(workflow.id)}
                          >
                            🗑️ Delete
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Active workflow: Show Deactivate, Show Stats, and Execute/Open CRM */}
                          <button 
                            className="workflow-toggle deactivate"
                            onClick={() => toggleWorkflowStatus(workflow.id, workflow.status)}
                          >
                            Deactivate
                          </button>
                          <button 
                            className="workflow-stats-btn" 
                            onClick={() => showWorkflowStats(workflow.id)}
                          >
                            📊 Show Stats
                          </button>
                          {workflow.isCRM || workflow.name?.toLowerCase().includes('crm') ? (
                            <button 
                              className="workflow-crm-btn"
                              onClick={() => handleOpenCRM()}
                            >
                              🏢 Open CRM
                            </button>
                          ) : (
                            <button 
                              className="workflow-run-btn"
                              onClick={() => handleRunAutomation(workflow)}
                            >
                              ⚡ Execute
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products Section */}
          <div className="dashboard-section products-section">
            <div className="section-header">
              <h2 className="section-title">AI Automation Solutions</h2>
              <p className="section-subtitle">Deploy intelligent agents across your business</p>
            </div>
            
            <div className="products-grid">
              {/* CRM Card */}
              <div 
                className={`product-card crm-card ${crmActivated ? 'activated' : ''}`}
                onClick={handleCRMClick}
                style={{ cursor: 'pointer' }}
              >
                <div className="product-header">
                  <div className="product-icon">📊</div>
                  <div className={`product-status ${crmActivated ? 'active' : 'available'}`}>
                    {crmActivated ? 'Active' : 'Available'}
                  </div>
                </div>
                <h3 className="product-name">AI-First CRM</h3>
                <p className="product-description">
                  Complete customer relationship management with AI-powered conversations,
                  WhatsApp automation, and smart scheduling
                </p>
                <div className="product-features">
                  <span className="feature-tag">WhatsApp</span>
                  <span className="feature-tag">AI Assistant</span>
                  <span className="feature-tag">Calendar</span>
                  <span className="feature-tag">Telegram</span>
                  <span className="feature-tag">Auto Reminders</span>
                </div>
                <button className="product-action">
                  {crmActivated ? 'Open CRM →' : 'Add Workflow'}
                </button>
              </div>

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
          <div className="dashboard-section agents-section">
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
        </div>
      </div>

      {/* Alex floating chat button for configured dashboard */}
      <DashboardAlex 
        isOpen={showAlex}
        onToggle={() => setShowAlex(!showAlex)}
        onDashboardUpdate={handleDashboardUpdate}
        currentDashboardData={dashboardData}
        isSidebar={false}
      />

      {/* Workflow Statistics Modal */}
      <WorkflowStatsModal 
        isOpen={statsModalOpen}
        onClose={() => setStatsModalOpen(false)}
        stats={selectedWorkflowStats || {}}
      />

      {/* NEW: Activation Wizard Modal */}
      <ActivationWizard
        isOpen={showActivationWizard}
        onClose={() => setShowActivationWizard(false)}
        workflowName={activatingWorkflow?.name}
      />

      {/* NEW: Workflow Execution Modal */}
      <WorkflowExecutionModal
        isOpen={showExecutionModal}
        onClose={() => {
          setShowExecutionModal(false);
          setExecutingWorkflow(null);
        }}
        workflow={executingWorkflow}
      />
    </div>
  );
};

export default BusinessDashboard;
