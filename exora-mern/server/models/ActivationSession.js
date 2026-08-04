// server/models/ActivationSession.js

const { pool } = require('../config/db');

/**
 * ActivationSession model for managing multi-provider activation sessions
 * Stores temporary state during OAuth flow when multiple providers need to be connected
 */
class ActivationSession {
  
  /**
   * Create a new activation session
   * @param {object} data - Session data
   * @returns {object} - Created session
   */
  static async create({ userId, workflowId, providersRequired, sessionData = {} }) {
    const query = `
      INSERT INTO activation_sessions 
        (user_id, workflow_id, providers_required, session_data, status, expires_at, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '30 minutes', NOW(), NOW())
      RETURNING *
    `;
    
    const values = [
      userId,
      workflowId,
      JSON.stringify(providersRequired),
      JSON.stringify(sessionData),
      'pending'
    ];
    
    try {
      const result = await pool.query(query, values);
      return this._transformRow(result.rows[0]);
    } catch (error) {
      console.error('Error creating activation session:', error);
      throw error;
    }
  }

  /**
   * Find session by ID
   * @param {string} sessionId - UUID of session
   * @returns {object|null} - Session or null
   */
  static async findById(sessionId) {
    const query = 'SELECT * FROM activation_sessions WHERE id = $1';
    
    try {
      const result = await pool.query(query, [sessionId]);
      return result.rows.length > 0 ? this._transformRow(result.rows[0]) : null;
    } catch (error) {
      console.error('Error finding activation session:', error);
      throw error;
    }
  }

  /**
   * Find active sessions for a user
   * @param {number} userId - User ID
   * @returns {Array} - Array of active sessions
   */
  static async findActiveByUserId(userId) {
    const query = `
      SELECT * FROM activation_sessions 
      WHERE user_id = $1 
        AND status IN ('pending', 'in_progress')
        AND expires_at > NOW()
      ORDER BY created_at DESC
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows.map(row => this._transformRow(row));
    } catch (error) {
      console.error('Error finding user sessions:', error);
      throw error;
    }
  }

  /**
   * Mark a provider as completed in the session
   * @param {string} sessionId - Session ID
   * @param {string} credentialType - Credential type that was completed
   * @param {object} credentialData - Data about created credential (optional)
   * @returns {object} - Updated session
   */
  static async markProviderCompleted(sessionId, credentialType, credentialData = {}) {
    // First get current session
    const session = await this.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Add to completed list
    const completed = session.providersCompleted || [];
    completed.push({
      credentialType,
      completedAt: new Date().toISOString(),
      ...credentialData
    });

    // Check if all providers are now completed
    const allComplete = this._checkAllProvidersComplete(
      session.providersRequired,
      completed
    );

    const newStatus = allComplete ? 'completed' : 'in_progress';

    const query = `
      UPDATE activation_sessions 
      SET providers_completed = $1,
          status = $2,
          updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        JSON.stringify(completed),
        newStatus,
        sessionId
      ]);
      return this._transformRow(result.rows[0]);
    } catch (error) {
      console.error('Error marking provider completed:', error);
      throw error;
    }
  }

  /**
   * Update session data
   * @param {string} sessionId - Session ID
   * @param {object} sessionData - Data to merge into session_data
   * @returns {object} - Updated session
   */
  static async updateSessionData(sessionId, sessionData) {
    const session = await this.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const merged = {
      ...(session.sessionData || {}),
      ...sessionData
    };

    const query = `
      UPDATE activation_sessions 
      SET session_data = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        JSON.stringify(merged),
        sessionId
      ]);
      return this._transformRow(result.rows[0]);
    } catch (error) {
      console.error('Error updating session data:', error);
      throw error;
    }
  }

  /**
   * Update session status
   * @param {string} sessionId - Session ID
   * @param {string} status - New status
   * @returns {object} - Updated session
   */
  static async updateStatus(sessionId, status) {
    const query = `
      UPDATE activation_sessions 
      SET status = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [status, sessionId]);
      return result.rows.length > 0 ? this._transformRow(result.rows[0]) : null;
    } catch (error) {
      console.error('Error updating session status:', error);
      throw error;
    }
  }

  /**
   * Delete a session
   * @param {string} sessionId - Session ID
   * @returns {boolean} - Success
   */
  static async delete(sessionId) {
    const query = 'DELETE FROM activation_sessions WHERE id = $1';
    
    try {
      await pool.query(query, [sessionId]);
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  /**
   * Clean up expired sessions (should be run periodically)
   * @returns {number} - Number of sessions deleted
   */
  static async cleanupExpired() {
    const query = `
      DELETE FROM activation_sessions 
      WHERE expires_at < NOW() 
        OR (status = 'completed' AND updated_at < NOW() - INTERVAL '1 hour')
      RETURNING id
    `;
    
    try {
      const result = await pool.query(query);
      console.log(`Cleaned up ${result.rows.length} expired activation sessions`);
      return result.rows.length;
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      throw error;
    }
  }

  /**
   * Get remaining providers for a session
   * @param {string} sessionId - Session ID
   * @returns {Array} - Array of remaining provider requirements
   */
  static async getRemainingProviders(sessionId) {
    const session = await this.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const completedTypes = new Set(
      (session.providersCompleted || []).map(p => p.credentialType)
    );

    return (session.providersRequired || []).filter(
      p => !completedTypes.has(p.credentialType)
    );
  }

  /**
   * Check if all required providers are completed
   * @private
   */
  static _checkAllProvidersComplete(required, completed) {
    const completedTypes = new Set(
      completed.map(p => p.credentialType)
    );

    const requiredTypes = required
      .filter(p => p.required !== false)
      .map(p => p.credentialType);

    return requiredTypes.every(type => completedTypes.has(type));
  }

  /**
   * Transform database row to camelCase object
   * @private
   */
  static _transformRow(row) {
    if (!row) return null;

    return {
      id: row.id,
      userId: row.user_id,
      workflowId: row.workflow_id,
      providersRequired: row.providers_required,
      providersCompleted: row.providers_completed || [],
      status: row.status,
      sessionData: row.session_data || {},
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = ActivationSession;

