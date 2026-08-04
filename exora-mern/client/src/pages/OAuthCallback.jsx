// client/src/pages/OAuthCallback.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useActivation } from '../contexts/ActivationContext';
import './OAuthCallback.css';

/**
 * OAuth Callback Handler Page
 * Processes OAuth redirects and updates activation session state
 */
function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { 
    activationSession,
    markProviderCompleted,
    updateSession,
    completeActivation,
    setActivationError 
  } = useActivation();

  const [status, setStatus] = useState('processing'); // processing, partial, complete, error
  const [message, setMessage] = useState('Processing OAuth callback...');
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    // Prevent multiple processing
    if (!hasProcessed) {
      setHasProcessed(true);
      processCallback();
    }
  }, [hasProcessed]);

  const processCallback = async () => {
    try {
      // Check for error in query params
      const error = searchParams.get('error');
      if (error) {
        const details = searchParams.get('details');
        setStatus('error');
        setMessage(`Authentication failed: ${details || error}`);
        setActivationError(`OAuth error: ${error}`);
        
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 3000);
        return;
      }

      // Check for success status
      const success = searchParams.get('success');
      const sessionId = searchParams.get('sessionId');
      const remaining = searchParams.get('remaining');
      const workflowId = searchParams.get('workflowId');
      const workflowName = searchParams.get('workflowName');

      if (success === 'partial') {
        // One provider connected, but more remaining
        setStatus('partial');
        setMessage(`Provider connected! ${remaining} more to go...`);
        
        // Update session and redirect back to wizard after 1.5 seconds
        setTimeout(() => {
          navigate('/dashboard?resumeActivation=true', { replace: true });
        }, 1500);
      } else if (success === 'complete') {
        // All providers completed!
        setStatus('complete');
        setMessage('All providers connected successfully!');
        
        // Mark activation as complete
        setTimeout(() => {
          completeActivation();
          navigate(`/dashboard?workflowActivated=true&workflowId=${workflowId}&workflowName=${encodeURIComponent(workflowName || 'Workflow')}`, { replace: true });
        }, 2000);
      } else {
        // Unknown state - check if we have a session in context
        if (activationSession && sessionId) {
          setStatus('processing');
          setMessage('Updating activation status...');
          
          setTimeout(() => {
            navigate('/dashboard?resumeActivation=true', { replace: true });
          }, 1500);
        } else {
          setStatus('error');
          setMessage('Invalid callback state. Please try again.');
          
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 3000);
        }
      }
    } catch (err) {
      console.error('OAuth callback processing error:', err);
      setStatus('error');
      setMessage('Failed to process OAuth callback');
      setActivationError(err.message);
      
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 3000);
    }
  };

  return (
    <div className="oauth-callback-page">
      <div className="callback-container">
        <div className={`callback-status ${status}`}>
          {status === 'processing' && (
            <div className="status-icon spinner">
              <div className="spinner-circle"></div>
            </div>
          )}
          
          {status === 'partial' && (
            <div className="status-icon">⚡</div>
          )}
          
          {status === 'complete' && (
            <div className="status-icon success">✓</div>
          )}
          
          {status === 'error' && (
            <div className="status-icon error">✕</div>
          )}
        </div>

        <h2 className="callback-title">{message}</h2>
        
        <div className="callback-subtitle">
          {status === 'processing' && 'Please wait...'}
          {status === 'partial' && 'Returning to activation wizard...'}
          {status === 'complete' && 'Redirecting to dashboard...'}
          {status === 'error' && 'Redirecting back...'}
        </div>

        {status === 'processing' && (
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}

        {status === 'error' && (
          <button 
            className="retry-button"
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}

export default OAuthCallback;

