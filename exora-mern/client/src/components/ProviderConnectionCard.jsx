// client/src/components/ProviderConnectionCard.jsx

import React, { useState } from 'react';
import './ProviderConnectionCard.css';
import { 
  getScopeDescription, 
  groupScopesByService,
  getProviderIcon,
  getProviderDisplayName 
} from '../utils/scopeDescriptions';

/**
 * Provider Connection Card Component
 * Displays a single provider with its scopes and connection status
 */
function ProviderConnectionCard({ 
  provider, 
  status = 'pending', 
  onConnect,
  isCurrentStep = false,
  showButton = true
}) {
  const [expanded, setExpanded] = useState(false);

  const statusIcons = {
    pending: '⏸️',
    connecting: '🔄',
    connected: '✅',
    error: '❌'
  };

  const statusLabels = {
    pending: 'Pending',
    connecting: 'Connecting...',
    connected: 'Connected',
    error: 'Failed'
  };

  const statusColors = {
    pending: '#6c757d',
    connecting: '#0d6efd',
    connected: '#28a745',
    error: '#dc3545'
  };

  const handleConnect = () => {
    if (provider.authorizationUrl) {
      // OAuth2: redirect to provider
      window.location.href = provider.authorizationUrl;
    } else {
      // Manual/API Key: trigger manual entry
      if (onConnect) {
        onConnect(provider);
      }
    }
  };

  const scopeGroups = groupScopesByService(provider.scopes || []);
  const scopeCount = provider.scopes?.length || 0;

  return (
    <div className={`provider-connection-card ${isCurrentStep ? 'current-step' : ''} ${status}`}>
      <div className="card-header">
        <div className="provider-info">
          <span className="provider-icon">{getProviderIcon(provider.provider)}</span>
          <div>
            <h3 className="provider-name">{getProviderDisplayName(provider.provider)}</h3>
            <p className="credential-type">{provider.credentialType}</p>
          </div>
        </div>
        
        <div className="status-indicator">
          <span 
            className="status-badge" 
            style={{ backgroundColor: statusColors[status] }}
          >
            {statusIcons[status]} {statusLabels[status]}
          </span>
        </div>
      </div>

      <div className="card-body">
        {provider.nodes && provider.nodes.length > 0 && (
          <div className="provider-nodes">
            <small className="text-muted">
              Used by: {provider.nodes.slice(0, 2).join(', ')}
              {provider.nodes.length > 2 && ` +${provider.nodes.length - 2} more`}
            </small>
          </div>
        )}

        {provider.autoDetected && (
          <div className="auto-detected-badge">
            <span>🤖 Auto-detected</span>
          </div>
        )}

        {scopeCount > 0 && (
          <div className="scopes-section">
            <button 
              className="scopes-toggle"
              onClick={() => setExpanded(!expanded)}
            >
              <span>{expanded ? '▼' : '▶'} {scopeCount} permission{scopeCount !== 1 ? 's' : ''} required</span>
            </button>

            {expanded && (
              <div className="scopes-list">
                {Object.entries(scopeGroups).map(([service, scopes]) => (
                  <div key={service} className="scope-group">
                    <div className="scope-group-title">{service.toUpperCase()}</div>
                    {scopes.map(scope => {
                      const desc = getScopeDescription(scope);
                      return (
                        <div key={scope} className="scope-item">
                          <span className="scope-icon">{desc.icon}</span>
                          <div className="scope-details">
                            <div className="scope-title">{desc.title}</div>
                            <div className="scope-description">{desc.description}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {status === 'pending' && isCurrentStep && showButton && (
        <div className="card-footer">
          <button 
            className="connect-button"
            onClick={handleConnect}
            disabled={!provider.authorizationUrl && provider.type === 'oauth2'}
          >
            {provider.type === 'oauth2' ? '🔐 Connect with OAuth' : '🔑 Enter Credentials'}
          </button>
          
          {provider.error && (
            <div className="provider-error">
              ⚠️ {provider.error}
            </div>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="card-footer error">
          <p className="error-message">Failed to connect. Please try again.</p>
          <button className="retry-button" onClick={handleConnect}>
            🔄 Retry
          </button>
        </div>
      )}
    </div>
  );
}

export default ProviderConnectionCard;

