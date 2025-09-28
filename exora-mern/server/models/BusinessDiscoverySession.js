const { pool } = require('../config/db');

class BusinessDiscoverySession {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.sessionStatus = data.session_status;
    this.discoveryData = data.discovery_data;
    this.conversationHistory = data.conversation_history;
    this.createdAt = data.created_at;
    this.completedAt = data.completed_at;
    this.updatedAt = data.updated_at;
  }

  // Create a new discovery session
  static async create({ userId, sessionStatus = 'active', discoveryData = {}, conversationHistory = [] }) {
    try {
      const query = `
        INSERT INTO business_discovery_sessions (user_id, session_status, discovery_data, conversation_history)
        VALUES ($1, $2, $3, $4)
        RETURNING id, user_id, session_status, discovery_data, conversation_history, created_at, completed_at, updated_at
      `;
      
      const values = [userId, sessionStatus, JSON.stringify(discoveryData), JSON.stringify(conversationHistory)];
      const result = await pool.query(query, values);
      
      return new BusinessDiscoverySession(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find active session by user ID
  static async findActiveByUserId(userId) {
    try {
      const query = `
        SELECT id, user_id, session_status, discovery_data, conversation_history, created_at, completed_at, updated_at
        FROM business_discovery_sessions
        WHERE user_id = $1 AND session_status = 'active'
        ORDER BY created_at DESC
        LIMIT 1
      `;
      
      const result = await pool.query(query, [userId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new BusinessDiscoverySession(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find session by ID
  static async findById(id) {
    try {
      const query = `
        SELECT id, user_id, session_status, discovery_data, conversation_history, created_at, completed_at, updated_at
        FROM business_discovery_sessions
        WHERE id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new BusinessDiscoverySession(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Update session
  async update(updateData) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (updateData.sessionStatus !== undefined) {
        fields.push(`session_status = $${paramCount++}`);
        values.push(updateData.sessionStatus);
      }

      if (updateData.discoveryData !== undefined) {
        fields.push(`discovery_data = $${paramCount++}`);
        values.push(JSON.stringify(updateData.discoveryData));
      }

      if (updateData.conversationHistory !== undefined) {
        fields.push(`conversation_history = $${paramCount++}`);
        values.push(JSON.stringify(updateData.conversationHistory));
      }

      if (updateData.completedAt !== undefined) {
        fields.push(`completed_at = $${paramCount++}`);
        values.push(updateData.completedAt);
      }

      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(this.id);

      const query = `
        UPDATE business_discovery_sessions 
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, user_id, session_status, discovery_data, conversation_history, created_at, completed_at, updated_at
      `;
      
      const result = await pool.query(query, values);
      
      // Update instance properties
      const updated = result.rows[0];
      this.sessionStatus = updated.session_status;
      this.discoveryData = updated.discovery_data;
      this.conversationHistory = updated.conversation_history;
      this.completedAt = updated.completed_at;
      this.updatedAt = updated.updated_at;
      
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Complete session
  async complete() {
    return this.update({
      sessionStatus: 'completed',
      completedAt: new Date()
    });
  }

  toSafeObject() {
    return {
      id: this.id,
      userId: this.userId,
      sessionStatus: this.sessionStatus,
      discoveryData: this.discoveryData,
      conversationHistory: this.conversationHistory,
      createdAt: this.createdAt,
      completedAt: this.completedAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = BusinessDiscoverySession;

