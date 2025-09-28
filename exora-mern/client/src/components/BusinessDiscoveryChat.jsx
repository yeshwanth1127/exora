import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';
import Particles from './Particles';
import CardNav from './CardNav';
import './BusinessDiscoveryChat.css';

const BusinessDiscoveryChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [discoverySession, setDiscoverySession] = useState(null);
  const [currentPhase, setCurrentPhase] = useState('Phase 1: Business Overview');
  const [discoveredInfo, setDiscoveredInfo] = useState({});
  const [recommendedWorkflows, setRecommendedWorkflows] = useState([]);
  const [isDiscoveryComplete, setIsDiscoveryComplete] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initializeDiscoverySession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeDiscoverySession = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setMessages([{
          id: Date.now(),
          type: 'ai',
          content: "I need to authenticate you first. Please sign in to continue with the business discovery.",
          timestamp: new Date()
        }]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/discovery/start-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (response.ok && (result.id || result.success)) {
        setDiscoverySession({ id: result.id, status: result.status });
        setCurrentPhase(result.phase);

        // Add welcome message
        setMessages([{
          id: Date.now(),
          type: 'ai',
          content: `Hi there! I'm Alex, your AI business consultant. I'm excited to learn about your business and help you discover powerful automations that could save you hours each week.

Let's start with the basics - what type of business are you running? For example, are you in healthcare, marketing, retail, consulting, or something else?`,
          timestamp: new Date()
        }]);
      } else {
        console.error('Failed to start session:', result);
        setMessages([{
          id: Date.now(),
          type: 'ai',
          content: "I apologize, but I'm having trouble starting our discovery session. Please try refreshing the page or contact support if the issue persists.",
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Failed to initialize discovery session:', error);
      setMessages([{
        id: Date.now(),
        type: 'ai',
        content: "I apologize, but I encountered a technical issue. Please try refreshing the page or contact support if the problem continues.",
        timestamp: new Date()
      }]);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isThinking) return;

    // Check if we have a valid session
    if (!discoverySession || !discoverySession.id) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'ai',
        content: "I need to initialize our discovery session first. Please wait a moment...",
        timestamp: new Date()
      }]);
      
      // Try to initialize session again
      await initializeDiscoverySession();
      return;
    }

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
      const response = await fetch(`${API_BASE_URL}/discovery/process-message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: discoverySession.id,
          message: inputValue,
          currentContext: {
            businessInfo: discoveredInfo,
            currentPhase,
            history: messages.slice(-10)
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update state with AI response
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: result.message,
          timestamp: new Date(),
          nextQuestions: result.nextQuestions,
          discoveredInfo: result.discoveredInfo
        };

        setMessages(prev => [...prev, aiMessage]);
        setCurrentPhase(result.currentPhase);
        setDiscoveredInfo(prev => ({ ...prev, ...result.discoveredInfo }));
        
        if (result.isComplete) {
          setIsDiscoveryComplete(true);
          if (result.recommendedWorkflows) {
            setRecommendedWorkflows(result.recommendedWorkflows);
            showWorkflowRecommendations();
          }
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        content: "I apologize, but I encountered an issue. Could you please try again?",
        timestamp: new Date()
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const showWorkflowRecommendations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/discovery/generate-workflows`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: discoverySession.id,
          businessProfile: discoveredInfo
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const recommendationMessage = {
          id: Date.now() + 2,
          type: 'ai',
          content: `Fantastic! Based on our conversation, I've identified ${result.workflows.length} powerful automation opportunities for your business. These could save you significant time and reduce manual work.

Let me show you what I recommend:`,
          timestamp: new Date(),
          workflows: result.workflows
        };

        setMessages(prev => [...prev, recommendationMessage]);
      }
    } catch (error) {
      console.error('Error generating workflow recommendations:', error);
    }
  };

  const approveWorkflow = async (workflow) => {
    setIsThinking(true);

    try {
      const response = await fetch(`${API_BASE_URL}/discovery/deploy-workflow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workflowId: workflow.id
        })
      });

      const result = await response.json();

      if (result.success) {
        const successMessage = {
          id: Date.now(),
          type: 'ai',
          content: `🎉 Excellent! I've successfully deployed "${workflow.name}" for you. 

**Status:** Active and running
**Webhook URL:** ${result.webhookUrl || 'Internal workflow'}
**Expected Impact:** ${workflow.expectedImpact}

This automation is now working in the background to save you time. You can see all your active automations in your dashboard.

Would you like me to set up another automation from the list?`,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, successMessage]);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Workflow deployment failed:', error);
      const errorMessage = {
        id: Date.now(),
        type: 'ai',
        content: `I encountered an issue deploying "${workflow.name}". Let me try a different approach or we can set this up manually. The error was: ${error.message}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const WorkflowCard = ({ workflow }) => (
    <div className="workflow-recommendation-card">
      <div className="workflow-header">
        <h4>{workflow.name}</h4>
        <span className={`priority priority-${workflow.priority > 75 ? 'high' : workflow.priority > 50 ? 'medium' : 'low'}`}>
          Priority: {workflow.priority}/100
        </span>
      </div>
      
      <p className="workflow-description">{workflow.description}</p>
      
      <div className="workflow-details">
        <div className="detail-item">
          <strong>Expected Impact:</strong> {workflow.expectedImpact}
        </div>
        <div className="detail-item">
          <strong>Setup Time:</strong> {workflow.estimatedSetupTime}
        </div>
        <div className="detail-item">
          <strong>Complexity:</strong> 
          <span className="complexity-stars">
            {'★'.repeat(workflow.setupComplexity) + '☆'.repeat(5 - workflow.setupComplexity)}
          </span>
        </div>
      </div>

      <div className="workflow-actions">
        <button 
          onClick={() => approveWorkflow(workflow)}
          className="btn-primary"
          disabled={isThinking}
        >
          Deploy This Automation
        </button>
        <button className="btn-secondary">
          Learn More
        </button>
      </div>
    </div>
  );

  const QuickReplyButtons = ({ suggestions }) => (
    <div className="quick-replies">
      {suggestions?.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => setInputValue(suggestion)}
          className="quick-reply-btn"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );

  return (
    <div className="business-discovery-chat">
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

      <div className="chat-container">
        <div className="chat-header">
          <div className="avatar">
            <span>🤖</span>
          </div>
          <div className="header-info">
            <h2>Business Discovery with Alex</h2>
            <p className="phase-indicator">{currentPhase}</p>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map(message => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-content">
                <div className="message-text">
                  {message.content}
                </div>
                
                {message.workflows && (
                  <div className="workflow-recommendations">
                    <h3>Recommended Automations:</h3>
                    {message.workflows.map((workflow, index) => (
                      <WorkflowCard key={index} workflow={workflow} />
                    ))}
                  </div>
                )}

                {message.nextQuestions && (
                  <QuickReplyButtons suggestions={message.nextQuestions} />
                )}
              </div>
              <div className="message-timestamp">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
          
          {isThinking && (
            <div className="message ai">
              <div className="message-content">
                <div className="thinking-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  Alex is thinking...
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Tell me about your business..."
              disabled={isThinking}
              className="message-input"
            />
            <button 
              onClick={sendMessage}
              disabled={!inputValue.trim() || isThinking}
              className="send-button"
            >
              <span>Send</span>
            </button>
          </div>
        </div>

        {/* Progress indicator */}
        {discoveredInfo && Object.keys(discoveredInfo).length > 0 && (
          <div className="discovery-progress">
            <h4>What I've learned about your business:</h4>
            <div className="discovered-items">
              {discoveredInfo.industry && <span className="tag">Industry: {discoveredInfo.industry}</span>}
              {discoveredInfo.businessSize && <span className="tag">Size: {discoveredInfo.businessSize}</span>}
              {discoveredInfo.painPoints?.length > 0 && (
                <span className="tag">Pain Points: {discoveredInfo.painPoints.length} identified</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDiscoveryChat;

