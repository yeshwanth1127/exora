const { pool } = require('../config/db');

class BusinessProfile {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.sessionId = data.session_id;
    this.industry = data.industry;
    this.businessSize = data.business_size;
    this.painPoints = data.pain_points;
    this.currentTools = data.current_tools;
    this.automationGoals = data.automation_goals;
    this.integrationPreferences = data.integration_preferences;
    this.workflowPriorities = data.workflow_priorities;
    this.discoveredWorkflows = data.discovered_workflows;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Create a new business profile
  static async create({
    userId,
    sessionId,
    industry,
    businessSize,
    painPoints = [],
    currentTools = [],
    automationGoals = [],
    integrationPreferences = {},
    workflowPriorities = {},
    discoveredWorkflows = []
  }) {
    try {
      const query = `
        INSERT INTO business_profiles (
          user_id, session_id, industry, business_size, pain_points, current_tools,
          automation_goals, integration_preferences, workflow_priorities, discovered_workflows
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, user_id, session_id, industry, business_size, pain_points, current_tools,
                  automation_goals, integration_preferences, workflow_priorities, discovered_workflows,
                  created_at, updated_at
      `;
      
      const values = [
        userId,
        sessionId,
        industry,
        businessSize,
        painPoints,
        currentTools,
        automationGoals,
        JSON.stringify(integrationPreferences),
        JSON.stringify(workflowPriorities),
        JSON.stringify(discoveredWorkflows)
      ];
      
      const result = await pool.query(query, values);
      return new BusinessProfile(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find profile by user ID
  static async findByUserId(userId) {
    try {
      const query = `
        SELECT id, user_id, session_id, industry, business_size, pain_points, current_tools,
               automation_goals, integration_preferences, workflow_priorities, discovered_workflows,
               created_at, updated_at
        FROM business_profiles
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `;
      
      const result = await pool.query(query, [userId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new BusinessProfile(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find profile by session ID
  static async findBySessionId(sessionId) {
    try {
      const query = `
        SELECT id, user_id, session_id, industry, business_size, pain_points, current_tools,
               automation_goals, integration_preferences, workflow_priorities, discovered_workflows,
               created_at, updated_at
        FROM business_profiles
        WHERE session_id = $1
      `;
      
      const result = await pool.query(query, [sessionId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new BusinessProfile(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Update profile
  async update(updateData) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (updateData.industry !== undefined) {
        fields.push(`industry = $${paramCount++}`);
        values.push(updateData.industry);
      }

      if (updateData.businessSize !== undefined) {
        fields.push(`business_size = $${paramCount++}`);
        values.push(updateData.businessSize);
      }

      if (updateData.painPoints !== undefined) {
        fields.push(`pain_points = $${paramCount++}`);
        values.push(updateData.painPoints);
      }

      if (updateData.currentTools !== undefined) {
        fields.push(`current_tools = $${paramCount++}`);
        values.push(updateData.currentTools);
      }

      if (updateData.automationGoals !== undefined) {
        fields.push(`automation_goals = $${paramCount++}`);
        values.push(updateData.automationGoals);
      }

      if (updateData.integrationPreferences !== undefined) {
        fields.push(`integration_preferences = $${paramCount++}`);
        values.push(JSON.stringify(updateData.integrationPreferences));
      }

      if (updateData.workflowPriorities !== undefined) {
        fields.push(`workflow_priorities = $${paramCount++}`);
        values.push(JSON.stringify(updateData.workflowPriorities));
      }

      if (updateData.discoveredWorkflows !== undefined) {
        fields.push(`discovered_workflows = $${paramCount++}`);
        values.push(JSON.stringify(updateData.discoveredWorkflows));
      }

      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(this.id);

      const query = `
        UPDATE business_profiles 
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, user_id, session_id, industry, business_size, pain_points, current_tools,
                  automation_goals, integration_preferences, workflow_priorities, discovered_workflows,
                  created_at, updated_at
      `;
      
      const result = await pool.query(query, values);
      
      // Update instance properties
      const updated = result.rows[0];
      this.industry = updated.industry;
      this.businessSize = updated.business_size;
      this.painPoints = updated.pain_points;
      this.currentTools = updated.current_tools;
      this.automationGoals = updated.automation_goals;
      this.integrationPreferences = updated.integration_preferences;
      this.workflowPriorities = updated.workflow_priorities;
      this.discoveredWorkflows = updated.discovered_workflows;
      this.updatedAt = updated.updated_at;
      
      return this;
    } catch (error) {
      throw error;
    }
  }

  toSafeObject() {
    return {
      id: this.id,
      userId: this.userId,
      sessionId: this.sessionId,
      industry: this.industry,
      businessSize: this.businessSize,
      painPoints: this.painPoints,
      currentTools: this.currentTools,
      automationGoals: this.automationGoals,
      integrationPreferences: this.integrationPreferences,
      workflowPriorities: this.workflowPriorities,
      discoveredWorkflows: this.discoveredWorkflows,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = BusinessProfile;

