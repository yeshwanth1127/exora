import React, { useState, useEffect, useRef } from 'react';
import './DashboardAlex.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const DashboardAlex = ({ isOpen, onToggle, onDashboardUpdate, isSidebar = false }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [discoverySession, setDiscoverySession] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    businessInfo: {},
    workflows: [],
    recommendations: [],
    metrics: {},
    isConfigured: false
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // If in sidebar mode, never initialize discovery session
      if (isSidebar) {
        console.log('Alex in sidebar mode - adding welcome message');
        setMessages([{
          id: Date.now(),
          type: 'ai',
          content: "Hello! I'm Alex, your AI assistant. I'm here to help you manage your workflows and dashboard. What would you like to know?",
          timestamp: new Date()
        }]);
      } else {
        // Only initialize discovery session for popup mode
        initializeAlex();
      }
    }
  }, [isOpen, isSidebar]);

  const initializeAlex = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // If in sidebar mode, use simple chat mode (never initialize discovery session)
      if (isSidebar) {
        console.log('Alex in sidebar mode - initializing simple chat');
        setMessages([{
          id: Date.now(),
          type: 'ai',
          content: "Hello! I'm Alex, your AI assistant. I'm here to help you manage your workflows and dashboard. What would you like to know?",
          timestamp: new Date()
        }]);
        return;
      }

      // Initialize discovery session for popup mode or unconfigured dashboard
      const response = await fetch(`${API_BASE_URL}/discovery/start-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (response.ok && (result.id || result.success)) {
        setDiscoverySession({ id: result.id, status: result.status || 'active' });
        
        // Add welcome message
        setMessages([{
          id: Date.now(),
          type: 'ai',
          content: "Hi! I'm Alex, your AI business consultant. I'm here to help you set up your dashboard by learning about your business. Let's start with the basics - what type of business do you run?",
          timestamp: new Date()
        }]);
      } else {
        console.error('Failed to initialize discovery session:', result);
        setMessages([{
          id: Date.now(),
          type: 'ai',
          content: "I'm having trouble initializing our session. Please try refreshing the page.",
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error initializing Alex:', error);
      setMessages([{
        id: Date.now(),
        type: 'ai',
        content: "I'm experiencing some technical difficulties. Please try again in a moment.",
        timestamp: new Date()
      }]);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isThinking) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsThinking(true);

    try {
      // Check if user is asking about workflows
      const workflowKeywords = ['workflow', 'automation', 'template', 'n8n', 'existing', 'available'];
      const isWorkflowRequest = workflowKeywords.some(keyword => 
        inputValue.toLowerCase().includes(keyword)
      );

      if (isWorkflowRequest) {
        // Fetch and display workflows in selectable format
        try {
          const response = await fetch(`${API_BASE_URL}/workflows`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            const workflows = data.workflows || [];
            
            setMessages(prev => [...prev, {
              id: Date.now(),
              type: 'ai',
              content: "Here are your available workflow templates. Click on any workflow to add it to your dashboard:",
              timestamp: new Date(),
              workflows: workflows // Store workflows data for rendering
            }]);
          } else {
            setMessages(prev => [...prev, {
              id: Date.now(),
              type: 'ai',
              content: "I couldn't fetch the workflow templates right now. Please try again later.",
              timestamp: new Date()
            }]);
          }
        } catch (error) {
          console.error('Error fetching workflows:', error);
          setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'ai',
            content: "I encountered an error while fetching workflow templates. Please try again later.",
            timestamp: new Date()
          }]);
        }
        setIsThinking(false);
        return;
      }

      // If in sidebar mode, ALWAYS use simple chat mode (never use discovery session)
      if (isSidebar) {
        console.log('Alex in sidebar mode - using simple chat responses');
        
        // Simple AI responses for sidebar mode
        const responses = {
          'hello': "Hello! I'm here to help you manage your workflows and dashboard. What would you like to know?",
          'hi': "Hi there! I can help you with your workflows, automations, or any questions about your dashboard.",
          'help': "I can help you with:\n• Managing your workflows\n• Adding new automations\n• Dashboard customization\n• General business automation advice\n\nWhat would you like to know?",
          'workflows': "I can show you your current workflows or help you add new ones. Just ask me to 'show workflows' or 'add workflows'!",
          'dashboard': "Your dashboard is looking great! I can help you customize it further or add new automations.",
          'default': "I'm here to help you with your business automation and dashboard management. You can ask me about workflows, automations, or any other questions!"
        };

        const lowerMessage = inputValue.toLowerCase();
        let response = responses.default;

        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
          response = responses.hello;
        } else if (lowerMessage.includes('help')) {
          response = responses.help;
        } else if (lowerMessage.includes('workflow')) {
          response = responses.workflows;
        } else if (lowerMessage.includes('dashboard')) {
          response = responses.dashboard;
        }

        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'ai',
          content: response,
          timestamp: new Date()
        }]);

        setIsThinking(false);
        return;
      }

      if (!discoverySession || !discoverySession.id) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'ai',
          content: "I need to initialize our session first. Please wait a moment...",
          timestamp: new Date()
        }]);
        await initializeAlex();
        return;
      }

      const response = await fetch(`${API_BASE_URL}/discovery/process-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sessionId: discoverySession.id,
          message: inputValue
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const aiMessage = {
          id: Date.now(),
          type: 'ai',
          content: result.data.message,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);

        // Update dashboard data based on discovered information
        if (result.data.discoveredInfo) {
          await updateDashboardDataViaAPI(result.data.discoveredInfo, result.data.message);
        }

        // Check if discovery is complete
        if (result.data.isComplete) {
          setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'ai',
            content: "Perfect! I've gathered all the information I need. Your dashboard is now configured with your business details. You can close this chat and explore your personalized dashboard, or ask me any questions about your automations!",
            timestamp: new Date()
          }]);
        }
      } else {
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'ai',
          content: result.message || "I apologize, but I encountered an issue. Could you please try again?",
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'ai',
        content: "I'm having trouble processing your message. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const updateDashboardDataViaAPI = async (discoveredInfo, message) => {
    try {
      const newDashboardData = { ...dashboardData };

      // Update business information
      if (discoveredInfo.industry) {
        newDashboardData.businessInfo.industry = discoveredInfo.industry;
      }
      if (discoveredInfo.businessSize) {
        newDashboardData.businessInfo.size = discoveredInfo.businessSize;
      }
      if (discoveredInfo.services) {
        newDashboardData.businessInfo.services = discoveredInfo.services;
      }
      if (discoveredInfo.challenges) {
        newDashboardData.businessInfo.challenges = discoveredInfo.challenges;
      }

      // Mark as configured if we have basic info
      if (discoveredInfo.industry && discoveredInfo.businessSize) {
        newDashboardData.isConfigured = true;
      }

      // Generate recommendations based on discovered info
      if (discoveredInfo.industry) {
        newDashboardData.recommendations = generateRecommendations(discoveredInfo);
      }

      // Update metrics based on business info
      newDashboardData.metrics = generateMetrics(discoveredInfo);

      // Save to database via API
      const response = await fetch(`${API_BASE_URL}/dashboard/data`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newDashboardData)
      });

      if (response.ok) {
        setDashboardData(newDashboardData);
        onDashboardUpdate(newDashboardData);
        console.log('Dashboard data saved successfully');
      } else {
        console.error('Failed to save dashboard data');
      }
    } catch (error) {
      console.error('Error updating dashboard data:', error);
    }
  };

  const generateRecommendations = (discoveredInfo) => {
    const recommendations = [];
    
    if (discoveredInfo.industry === 'retail' || discoveredInfo.industry === 'ecommerce') {
      recommendations.push({
        title: 'Inventory Management Automation',
        description: 'Automate stock tracking and reorder notifications',
        priority: 'high',
        category: 'operations'
      });
      recommendations.push({
        title: 'Customer Service Chatbot',
        description: 'Handle common customer inquiries automatically',
        priority: 'medium',
        category: 'customer-service'
      });
    }

    if (discoveredInfo.industry === 'real-estate') {
      recommendations.push({
        title: 'Lead Qualification System',
        description: 'Automatically score and prioritize leads',
        priority: 'high',
        category: 'sales'
      });
      recommendations.push({
        title: 'Property Listing Automation',
        description: 'Sync listings across multiple platforms',
        priority: 'medium',
        category: 'marketing'
      });
    }

    if (discoveredInfo.businessSize === 'small' || discoveredInfo.businessSize === 'startup') {
      recommendations.push({
        title: 'Email Marketing Automation',
        description: 'Set up automated email campaigns',
        priority: 'high',
        category: 'marketing'
      });
    }

    return recommendations;
  };

  const generateMetrics = (discoveredInfo) => {
    return {
      totalWorkflows: 0,
      activeWorkflows: 0,
      timeSaved: '0 hours',
      efficiency: '0%',
      lastActivity: 'Never',
      ...(discoveredInfo.industry && {
        industryInsights: `Based on ${discoveredInfo.industry} industry standards`
      })
    };
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Helper functions for workflow display
  const getWorkflowIcon = (workflow) => {
    const name = workflow.name.toLowerCase();
    if (name.includes('whatsapp') || name.includes('chatbot')) return '💬';
    if (name.includes('booking') || name.includes('calendar')) return '📅';
    if (name.includes('email')) return '📧';
    if (name.includes('data') || name.includes('sync')) return '🔄';
    return '⚡';
  };

  const getWorkflowCategory = (workflow) => {
    const name = workflow.name.toLowerCase();
    if (name.includes('whatsapp') || name.includes('chatbot')) return 'Communication';
    if (name.includes('booking') || name.includes('calendar')) return 'Scheduling';
    if (name.includes('email')) return 'Email Automation';
    if (name.includes('data') || name.includes('sync')) return 'Data Management';
    return 'General Automation';
  };

  const isWorkflowAlreadyAdded = (workflow) => {
    return dashboardData.workflows.some(w => w.id === workflow.id);
  };

  const handleWorkflowSelected = async (workflow) => {
    try {
      // Add workflow to dashboard via API
      const response = await fetch(`${API_BASE_URL}/dashboard/workflows`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ workflows: [workflow] })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Workflow selection response:', result);
        
        // Check if there are duplicate workflows or no new workflows added
        if ((result.data.duplicateWorkflows && result.data.duplicateWorkflows.length > 0) || 
            (result.data.addedWorkflows && result.data.addedWorkflows.length === 0)) {
          // Show duplicate message
          setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'ai',
            content: `ℹ️ ${result.message}`,
            timestamp: new Date()
          }]);
        } else {
          // Show success message
          setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'ai',
            content: `✅ ${result.message}`,
            timestamp: new Date()
          }]);
        }
        
        // Only update dashboard data if new workflows were added
        if (result.data.addedWorkflows && result.data.addedWorkflows.length > 0) {
          const newDashboardData = {
            ...dashboardData,
            workflows: [...dashboardData.workflows, ...result.data.addedWorkflows],
            isConfigured: true
          };
          
          setDashboardData(newDashboardData);
          onDashboardUpdate(newDashboardData);
        }
      } else {
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'ai',
          content: "❌ Sorry, I couldn't add that workflow to your dashboard. Please try again later.",
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error adding workflow:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'ai',
        content: "❌ Sorry, I encountered an error while adding the workflow. Please try again later.",
        timestamp: new Date()
      }]);
    }
  };

  if (!isOpen) return null;

  if (isSidebar) {
    return (
      <div className="dashboard-alex-sidebar">
        <div className="dashboard-alex-sidebar-content">
          <div className="dashboard-alex-header">
            <div className="dashboard-alex-title">
              <div className="dashboard-alex-avatar">🤖</div>
              <div>
                <h3>Alex</h3>
                <p>AI Assistant</p>
              </div>
            </div>
            <button className="dashboard-alex-close" onClick={onToggle}>
              ✕
            </button>
          </div>

        <div className="dashboard-alex-messages">
          {messages.map((message) => (
            <div key={message.id} className={`dashboard-alex-message ${message.type}`}>
              <div className="dashboard-alex-message-content">
                {message.content}
                
                {/* Render workflows if present */}
                {message.workflows && message.workflows.length > 0 && (
                  <div className="workflow-selection-grid">
                    {message.workflows.map((workflow) => {
                      const isAlreadyAdded = isWorkflowAlreadyAdded(workflow);
                      return (
                        <div 
                          key={workflow.id} 
                          className={`workflow-selection-card ${isAlreadyAdded ? 'already-added' : ''}`}
                          onClick={() => handleWorkflowSelected(workflow)}
                        >
                          <div className="workflow-card-header">
                            <div className="workflow-icon">
                              {getWorkflowIcon(workflow)}
                            </div>
                            <div className={`workflow-status ${isAlreadyAdded ? 'added' : (workflow.active ? 'active' : 'inactive')}`}>
                              {isAlreadyAdded ? '✅ Added' : (workflow.active ? '🟢 Active' : '🔴 Inactive')}
                            </div>
                          </div>
                        
                        <div className="workflow-card-content">
                          <h4 className="workflow-name">{workflow.name}</h4>
                          <p className="workflow-category">{getWorkflowCategory(workflow)}</p>
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
                          
                          {workflow.triggers && workflow.triggers.length > 0 && (
                            <div className="workflow-triggers">
                              <strong>Triggers:</strong>
                              <div className="trigger-tags">
                                {workflow.triggers.slice(0, 2).map((trigger, index) => (
                                  <span key={index} className="trigger-tag">
                                    {typeof trigger === 'string' ? trigger.replace('n8n-nodes-base.', '') : trigger.type?.replace('n8n-nodes-base.', '') || 'Unknown'}
                                  </span>
                                ))}
                                {workflow.triggers.length > 2 && (
                                  <span className="trigger-tag more">+{workflow.triggers.length - 2} more</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="workflow-card-footer">
                          <span className="select-hint">
                            {isAlreadyAdded ? 'Already added to dashboard' : 'Click to add to dashboard'}
                          </span>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                )}
              </div>
              <div className="dashboard-alex-message-time">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="dashboard-alex-message ai">
              <div className="dashboard-alex-message-content">
                <div className="dashboard-alex-thinking">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                Alex is thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="dashboard-alex-input">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tell me about your business..."
            disabled={isThinking}
          />
          <button 
            onClick={sendMessage} 
            disabled={!inputValue.trim() || isThinking}
            className="dashboard-alex-send"
          >
            Send
          </button>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-alex-overlay">
      <div className="dashboard-alex-popup">
        <div className="dashboard-alex-header">
          <div className="dashboard-alex-title">
            <div className="dashboard-alex-avatar">🤖</div>
            <div>
              <h3>Alex - Your AI Business Consultant</h3>
              <p>Let me help you set up your dashboard</p>
            </div>
          </div>
          <button className="dashboard-alex-close" onClick={onToggle}>
            ✕
          </button>
        </div>

        <div className="dashboard-alex-messages">
          {messages.map((message) => (
            <div key={message.id} className={`dashboard-alex-message ${message.type}`}>
              <div className="dashboard-alex-message-content">
                {message.content}
                
                {/* Render workflows if present */}
                {message.workflows && message.workflows.length > 0 && (
                  <div className="workflow-selection-grid">
                    {message.workflows.map((workflow) => {
                      const isAlreadyAdded = isWorkflowAlreadyAdded(workflow);
                      return (
                        <div 
                          key={workflow.id} 
                          className={`workflow-selection-card ${isAlreadyAdded ? 'already-added' : ''}`}
                          onClick={() => handleWorkflowSelected(workflow)}
                        >
                          <div className="workflow-card-header">
                            <div className="workflow-icon">
                              {getWorkflowIcon(workflow)}
                            </div>
                            <div className={`workflow-status ${isAlreadyAdded ? 'added' : (workflow.active ? 'active' : 'inactive')}`}>
                              {isAlreadyAdded ? '✅ Added' : (workflow.active ? '🟢 Active' : '🔴 Inactive')}
                            </div>
                          </div>
                        
                        <div className="workflow-card-content">
                          <h4 className="workflow-name">{workflow.name}</h4>
                          <p className="workflow-category">{getWorkflowCategory(workflow)}</p>
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
                          
                          {workflow.triggers && workflow.triggers.length > 0 && (
                            <div className="workflow-triggers">
                              <strong>Triggers:</strong>
                              <div className="trigger-tags">
                                {workflow.triggers.slice(0, 2).map((trigger, index) => (
                                  <span key={index} className="trigger-tag">
                                    {typeof trigger === 'string' ? trigger.replace('n8n-nodes-base.', '') : trigger.type?.replace('n8n-nodes-base.', '') || 'Unknown'}
                                  </span>
                                ))}
                                {workflow.triggers.length > 2 && (
                                  <span className="trigger-tag more">+{workflow.triggers.length - 2} more</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="workflow-card-footer">
                          <span className="select-hint">
                            {isAlreadyAdded ? 'Already added to dashboard' : 'Click to add to dashboard'}
                          </span>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                )}
              </div>
              <div className="dashboard-alex-message-time">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="dashboard-alex-message ai">
              <div className="dashboard-alex-message-content">
                <div className="dashboard-alex-thinking">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                Alex is thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="dashboard-alex-input">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tell me about your business..."
            disabled={isThinking}
          />
          <button 
            onClick={sendMessage} 
            disabled={!inputValue.trim() || isThinking}
            className="dashboard-alex-send"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardAlex;
