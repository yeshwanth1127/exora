const { pool } = require('../config/db');

class AgentActivity {
  constructor(data) {
    this.id = data.id;
    this.agentId = data.agent_id;
    this.userId = data.user_id;
    this.activityType = data.activity_type;
    this.title = data.title;
    this.description = data.description;
    this.metadata = data.metadata;
    this.createdAt = data.created_at;
  }

  // Create a new activity
  static async create({ agentId, userId, activityType, title, description = '', metadata = {} }) {
    try {
      const query = `
        INSERT INTO agent_activities (agent_id, user_id, activity_type, title, description, metadata)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, agent_id, user_id, activity_type, title, description, metadata, created_at
      `;
      
      const values = [agentId, userId, activityType, title, description, JSON.stringify(metadata)];
      const result = await pool.query(query, values);
      
      return new AgentActivity(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get recent activities for a user
  static async getRecentByUserId(userId, limit = 10) {
    try {
      const query = `
        SELECT 
          aa.id, aa.agent_id, aa.user_id, aa.activity_type, aa.title, aa.description, aa.metadata, aa.created_at,
          ua.name as agent_name, ua.agent_type
        FROM agent_activities aa
        LEFT JOIN user_agents ua ON aa.agent_id = ua.id
        WHERE aa.user_id = $1
        ORDER BY aa.created_at DESC
        LIMIT $2
      `;
      
      const result = await pool.query(query, [userId, limit]);
      return result.rows.map(row => ({
        id: row.id,
        agentId: row.agent_id,
        userId: row.user_id,
        activityType: row.activity_type,
        title: row.title,
        description: row.description,
        metadata: row.metadata,
        createdAt: row.created_at,
        agentName: row.agent_name,
        agentType: row.agent_type
      }));
    } catch (error) {
      throw error;
    }
  }

  // Get activities by agent
  static async getByAgentId(agentId, limit = 50) {
    try {
      const query = `
        SELECT id, agent_id, user_id, activity_type, title, description, metadata, created_at
        FROM agent_activities
        WHERE agent_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `;
      
      const result = await pool.query(query, [agentId, limit]);
      return result.rows.map(row => new AgentActivity(row));
    } catch (error) {
      throw error;
    }
  }

  // Get activity count by type for a user
  static async getCountByType(userId, activityType) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM agent_activities
        WHERE user_id = $1 AND activity_type = $2
      `;
      
      const result = await pool.query(query, [userId, activityType]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw error;
    }
  }

  // Get activities in time range
  static async getByTimeRange(userId, startDate, endDate) {
    try {
      const query = `
        SELECT 
          aa.id, aa.agent_id, aa.user_id, aa.activity_type, aa.title, aa.description, aa.metadata, aa.created_at,
          ua.name as agent_name
        FROM agent_activities aa
        LEFT JOIN user_agents ua ON aa.agent_id = ua.id
        WHERE aa.user_id = $1 
        AND aa.created_at BETWEEN $2 AND $3
        ORDER BY aa.created_at DESC
      `;
      
      const result = await pool.query(query, [userId, startDate, endDate]);
      return result.rows.map(row => ({
        id: row.id,
        agentId: row.agent_id,
        userId: row.user_id,
        activityType: row.activity_type,
        title: row.title,
        description: row.description,
        metadata: row.metadata,
        createdAt: row.created_at,
        agentName: row.agent_name
      }));
    } catch (error) {
      throw error;
    }
  }

  toSafeObject() {
    return {
      id: this.id,
      agentId: this.agentId,
      userId: this.userId,
      activityType: this.activityType,
      title: this.title,
      description: this.description,
      metadata: this.metadata,
      createdAt: this.createdAt
    };
  }
}

module.exports = AgentActivity;

