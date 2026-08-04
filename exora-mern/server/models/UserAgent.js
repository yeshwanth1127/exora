const { pool } = require('../config/db');

class UserAgent {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.agentType = data.agent_type;
    this.name = data.name;
    this.status = data.status;
    this.configuration = data.configuration;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    this.lastActivityAt = data.last_activity_at;
  }

  // Create a new user agent
  static async create({ userId, agentType, name, configuration = {} }) {
    try {
      const query = `
        INSERT INTO user_agents (user_id, agent_type, name, configuration)
        VALUES ($1, $2, $3, $4)
        RETURNING id, user_id, agent_type, name, status, configuration, created_at, updated_at, last_activity_at
      `;
      
      const values = [userId, agentType, name, JSON.stringify(configuration)];
      const result = await pool.query(query, values);
      
      return new UserAgent(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get all agents for a user
  static async findByUserId(userId) {
    try {
      const query = `
        SELECT id, user_id, agent_type, name, status, configuration, created_at, updated_at, last_activity_at
        FROM user_agents
        WHERE user_id = $1
        ORDER BY created_at DESC
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows.map(row => new UserAgent(row));
    } catch (error) {
      throw error;
    }
  }

  // Get active agents count for a user
  static async getActiveCount(userId) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM user_agents
        WHERE user_id = $1 AND status = 'active'
      `;
      
      const result = await pool.query(query, [userId]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw error;
    }
  }

  // Update agent status
  async updateStatus(status) {
    try {
      const query = `
        UPDATE user_agents 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING status
      `;
      
      const result = await pool.query(query, [status, this.id]);
      this.status = result.rows[0].status;
      
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Update last activity
  async updateLastActivity() {
    try {
      const query = `
        UPDATE user_agents 
        SET last_activity_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `;
      
      await pool.query(query, [this.id]);
    } catch (error) {
      throw error;
    }
  }

  // Get agent with metrics
  async getWithMetrics() {
    try {
      const query = `
        SELECT 
          ua.*,
          COALESCE(COUNT(am.id), 0) as total_metrics,
          COALESCE(AVG(CASE WHEN am.metric_type = 'success_rate' THEN am.value END), 0) as avg_success_rate
        FROM user_agents ua
        LEFT JOIN agent_metrics am ON ua.id = am.agent_id
        WHERE ua.id = $1
        GROUP BY ua.id
      `;
      
      const result = await pool.query(query, [this.id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  toSafeObject() {
    return {
      id: this.id,
      userId: this.userId,
      agentType: this.agentType,
      name: this.name,
      status: this.status,
      configuration: this.configuration,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastActivityAt: this.lastActivityAt
    };
  }
}

module.exports = UserAgent;

