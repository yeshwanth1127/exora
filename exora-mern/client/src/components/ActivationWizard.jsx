// client/src/components/ActivationWizard.jsx

import React, { useState, useEffect } from 'react';
import './ActivationWizard.css';
import ProviderConnectionCard from './ProviderConnectionCard';
import { useActivation } from '../contexts/ActivationContext';

/**
 * Activation Wizard Component
 * Multi-step modal for connecting providers during workflow activation
 */
function ActivationWizard({ isOpen, onClose, workflowName }) {
  const {
    activationSession,
    getRemainingProviders,
    getNextProvider,
    isComplete,
    cancelActivation
  } = useActivation();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  useEffect(() => {
    if (activationSession) {
      // Determine current step based on progress
      const remaining = getRemainingProviders();
      if (remaining.length === 0) {
        setCurrentStep(3); // Success step
      } else {
        setCurrentStep(2); // Connection step
      }
    } else {
      setCurrentStep(1); // Overview step
    }
  }, [activationSession, getRemainingProviders]);

  if (!isOpen || !activationSession) return null;

  const providers = activationSession.providers || [];
  const providersCompleted = activationSession.providersCompleted || [];
  const remaining = getRemainingProviders();
  const nextProvider = getNextProvider();

  const getProviderStatus = (provider) => {
    const completed = providersCompleted.find(
      p => p.credentialType === provider.credentialType
    );
    if (completed) return 'connected';
    if (nextProvider && nextProvider.credentialType === provider.credentialType) {
      return 'pending';
    }
    return 'pending';
  };

  const handleClose = () => {
    if (window.confirm('Are you sure you want to cancel activation?')) {
      cancelActivation();
      onClose();
    }
  };

  const progressPercentage = providers.length > 0
    ? ((providersCompleted.length / providers.length) * 100)
    : 0;

  return (
    <div className="activation-wizard-overlay">
      <div className="activation-wizard-modal">
        <div className="wizard-header">
          <div>
            <h2 className="wizard-title">
              {currentStep === 3 ? '🎉 Activation Complete!' : '🚀 Activate Workflow'}
            </h2>
            <p className="wizard-subtitle">
              {workflowName || 'Unnamed Workflow'}
            </p>
          </div>
          <button className="close-button" onClick={handleClose}>
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="progress-text">
            {providersCompleted.length} of {providers.length} provider{providers.length !== 1 ? 's' : ''} connected
          </div>
        </div>

        <div className="wizard-body">
          {/* Step 1: Overview */}
          {currentStep === 1 && (
            <div className="step-content overview-step">
              <div className="step-icon">🔌</div>
              <h3>Connect Your Accounts</h3>
              <p className="step-description">
                This workflow requires access to {providers.length} service{providers.length !== 1 ? 's' : ''}.
                You'll need to connect each one to activate the workflow.
              </p>
              
              <div className="providers-overview">
                {providers.map(provider => (
                  <div key={provider.credentialType} className="provider-chip">
                    <span className="provider-chip-icon">
                      {provider.provider === 'google' ? '🔵' : '🔌'}
                    </span>
                    <span>{provider.credentialType}</span>
                  </div>
                ))}
              </div>

              <button 
                className="wizard-button primary"
                onClick={() => setCurrentStep(2)}
              >
                Get Started →
              </button>
            </div>
          )}

          {/* Step 2: Provider Connections */}
          {currentStep === 2 && !isComplete() && (
            <div className="step-content connection-step">
              <div className="providers-list">
                {providers.map(provider => (
                  <ProviderConnectionCard
                    key={provider.credentialType}
                    provider={provider}
                    status={getProviderStatus(provider)}
                    isCurrentStep={false}
                    showButton={false}
                  />
                ))}
              </div>

              {/* Single unified Connect button for all Google providers */}
              {remaining.length > 0 && (
                <div className="step-footer">
                  <div className="connection-info">
                    <p className="info-text">
                      ✨ <strong>One-Click Connection:</strong> Grant access to all {providers.length} service{providers.length !== 1 ? 's' : ''} with a single OAuth flow
                    </p>
                  </div>
                  
                  <button 
                    className="unified-connect-button"
                    onClick={() => {
                      // Get the first OAuth2 provider with authorizationUrl (they all have the same URL now)
                      const oauthProvider = providers.find(p => p.type === 'oauth2' && p.authorizationUrl);
                      if (oauthProvider && oauthProvider.authorizationUrl) {
                        window.location.href = oauthProvider.authorizationUrl;
                      } else {
                        console.error('No OAuth URL found');
                      }
                    }}
                    disabled={!providers.some(p => p.type === 'oauth2' && p.authorizationUrl)}
                  >
                    🔐 Connect All Google Services
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Success */}
          {(currentStep === 3 || isComplete()) && (
            <div className="step-content success-step">
              <div className="success-animation">
                <div className="checkmark-circle">
                  <div className="checkmark">✓</div>
                </div>
              </div>
              
              <h3>Workflow Activated!</h3>
              <p className="success-message">
                All providers have been connected successfully.
                Your workflow is now active and ready to use.
              </p>

              <div className="success-details">
                <div className="detail-item">
                  <span className="detail-icon">📊</span>
                  <div>
                    <div className="detail-label">Workflow</div>
                    <div className="detail-value">{workflowName}</div>
                  </div>
                </div>
                
                <div className="detail-item">
                  <span className="detail-icon">🔌</span>
                  <div>
                    <div className="detail-label">Providers Connected</div>
                    <div className="detail-value">{providersCompleted.length}</div>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">⚡</span>
                  <div>
                    <div className="detail-label">Status</div>
                    <div className="detail-value">Active</div>
                  </div>
                </div>
              </div>

              <button 
                className="wizard-button primary"
                onClick={() => {
                  onClose();
                  window.location.reload(); // Refresh to show updated status
                }}
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Footer with session info */}
        <div className="wizard-footer">
          <small className="session-info">
            Session ID: {activationSession.sessionId?.substring(0, 8)}...
            {activationSession.expiresAt && (
              <span> • Expires in {Math.floor((new Date(activationSession.expiresAt) - new Date()) / 60000)} min</span>
            )}
          </small>
        </div>
      </div>
    </div>
  );
}

export default ActivationWizard;

