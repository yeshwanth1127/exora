// client/src/contexts/ActivationContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';

const ActivationContext = createContext();

/**
 * Activation Context Provider
 * Manages global state for multi-provider workflow activation
 */
export function ActivationProvider({ children }) {
  const [activationSession, setActivationSession] = useState(null);
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState(null);

  // Load session from localStorage on mount (for OAuth redirect recovery)
  useEffect(() => {
    const savedSession = localStorage.getItem('activation_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        // Check if session is not expired (30 minutes)
        if (parsed.expiresAt && new Date(parsed.expiresAt) > new Date()) {
          setActivationSession(parsed);
        } else {
          localStorage.removeItem('activation_session');
        }
      } catch (err) {
        console.error('Failed to parse saved activation session:', err);
        localStorage.removeItem('activation_session');
      }
    }
  }, []);

  /**
   * Start a new activation session
   * @param {object} session - Session data from backend
   */
  const startActivation = (session) => {
    const sessionWithExpiry = {
      ...session,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
    };

    setActivationSession(sessionWithExpiry);
    setIsActivating(true);
    setError(null);

    // Persist to localStorage for OAuth redirect recovery
    localStorage.setItem('activation_session', JSON.stringify(sessionWithExpiry));
  };

  /**
   * Mark a provider as completed
   * @param {string} credentialType - Credential type that was completed
   */
  const markProviderCompleted = (credentialType) => {
    if (!activationSession) return;

    const updated = {
      ...activationSession,
      providersCompleted: [
        ...(activationSession.providersCompleted || []),
        {
          credentialType,
          completedAt: new Date().toISOString()
        }
      ]
    };

    setActivationSession(updated);
    localStorage.setItem('activation_session', JSON.stringify(updated));
  };

  /**
   * Get remaining providers that need to be connected
   * @returns {array} - Array of remaining provider objects
   */
  const getRemainingProviders = () => {
    if (!activationSession || !activationSession.providers) return [];

    const completedTypes = new Set(
      (activationSession.providersCompleted || []).map(p => p.credentialType)
    );

    return activationSession.providers.filter(
      p => !completedTypes.has(p.credentialType)
    );
  };

  /**
   * Get next provider to connect
   * @returns {object|null} - Next provider or null
   */
  const getNextProvider = () => {
    const remaining = getRemainingProviders();
    // Prioritize OAuth2 providers first
    return remaining.find(p => p.type === 'oauth2') || remaining[0] || null;
  };

  /**
   * Check if all providers are completed
   * @returns {boolean}
   */
  const isComplete = () => {
    const remaining = getRemainingProviders();
    return remaining.length === 0;
  };

  /**
   * Complete the activation session
   */
  const completeActivation = () => {
    setActivationSession(null);
    setIsActivating(false);
    localStorage.removeItem('activation_session');
  };

  /**
   * Cancel the activation session
   */
  const cancelActivation = () => {
    setActivationSession(null);
    setIsActivating(false);
    setError(null);
    localStorage.removeItem('activation_session');
  };

  /**
   * Set activation error
   * @param {string} errorMessage - Error message
   */
  const setActivationError = (errorMessage) => {
    setError(errorMessage);
    setIsActivating(false);
  };

  /**
   * Update session from server
   * @param {object} updatedSession - Updated session data
   */
  const updateSession = (updatedSession) => {
    const merged = {
      ...activationSession,
      ...updatedSession,
      expiresAt: activationSession?.expiresAt || new Date(Date.now() + 30 * 60 * 1000).toISOString()
    };

    setActivationSession(merged);
    localStorage.setItem('activation_session', JSON.stringify(merged));
  };

  const value = {
    activationSession,
    isActivating,
    error,
    startActivation,
    markProviderCompleted,
    getRemainingProviders,
    getNextProvider,
    isComplete,
    completeActivation,
    cancelActivation,
    setActivationError,
    updateSession
  };

  return (
    <ActivationContext.Provider value={value}>
      {children}
    </ActivationContext.Provider>
  );
}

/**
 * Hook to use activation context
 * @returns {object} - Activation context value
 */
export function useActivation() {
  const context = useContext(ActivationContext);
  if (!context) {
    throw new Error('useActivation must be used within ActivationProvider');
  }
  return context;
}

export default ActivationContext;

