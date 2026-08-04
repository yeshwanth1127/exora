const { pool } = require('../config/db');

class WorkflowRecommendation {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.sessionId = data.session_id;
    this.workflowType = data.workflow_type;
    this.priorityScore = data.priority_score;
    this.recommendedReason = data.recommended_reason;
    this.estimatedImpact = data.estimated_impact;
    this.estimatedSetupTime = data.estimated_setup_time;
    this.setupComplexity = data.setup_complexity;
    this.n8nWorkflowJson = data.n8n_workflow_json;
    this.userDecision = data.user_decision;
    this.deployedWorkflowId = data.deployed_workflow_id;
    this.webhookUrl = data.webhook_url;
    this.createdAt = data.created_at;
  }

  // Create a new workflow recommendation
  static async create({
    userId,
    sessionId,
    workflowType,
    priorityScore = 50,
    recommendedReason,
    estimatedImpact,
    estimatedSetupTime,
    setupComplexity = 3,
    n8nWorkflowJson,
    userDecision = 'pending'
  }) {
    try {
      const query = `
        INSERT INTO workflow_recommendations (
          user_id, session_id, workflow_type, priority_score, recommended_reason,
          estimated_impact, estimated_setup_time, setup_complexity, n8n_workflow_json, user_decision
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, user_id, session_id, workflow_type, priority_score, recommended_reason,
                  estimated_impact, estimated_setup_time, setup_complexity, n8n_workflow_json,
                  user_decision, deployed_workflow_id, webhook_url, created_at
      `;
      
      const values = [
        userId,
        sessionId,
        workflowType,
        priorityScore,
        recommendedReason,
        estimatedImpact,
        estimatedSetupTime,
        setupComplexity,
        JSON.stringify(n8nWorkflowJson),
        userDecision
      ];
      
      const result = await pool.query(query, values);
      return new WorkflowRecommendation(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find recommendations by user ID
  static async findByUserId(userId) {
    try {
      const query = `
        SELECT id, user_id, session_id, workflow_type, priority_score, recommended_reason,
               estimated_impact, estimated_setup_time, setup_complexity, n8n_workflow_json,
               user_decision, deployed_workflow_id, webhook_url, created_at
        FROM workflow_recommendations
        WHERE user_id = $1
        ORDER BY priority_score DESC, created_at DESC
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows.map(row => new WorkflowRecommendation(row));
    } catch (error) {
      throw error;
    }
  }

  // Find recommendations by session ID
  static async findBySessionId(sessionId) {
    try {
      const query = `
        SELECT id, user_id, session_id, workflow_type, priority_score, recommended_reason,
               estimated_impact, estimated_setup_time, setup_complexity, n8n_workflow_json,
               user_decision, deployed_workflow_id, webhook_url, created_at
        FROM workflow_recommendations
        WHERE session_id = $1
        ORDER BY priority_score DESC, created_at DESC
      `;
      
      const result = await pool.query(query, [sessionId]);
      return result.rows.map(row => new WorkflowRecommendation(row));
    } catch (error) {
      throw error;
    }
  }

  // Find recommendation by ID
  static async findById(id) {
    try {
      const query = `
        SELECT id, user_id, session_id, workflow_type, priority_score, recommended_reason,
               estimated_impact, estimated_setup_time, setup_complexity, n8n_workflow_json,
               user_decision, deployed_workflow_id, webhook_url, created_at
        FROM workflow_recommendations
        WHERE id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new WorkflowRecommendation(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Update recommendation
  async update(updateData) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (updateData.userDecision !== undefined) {
        fields.push(`user_decision = $${paramCount++}`);
        values.push(updateData.userDecision);
      }

      if (updateData.deployedWorkflowId !== undefined) {
        fields.push(`deployed_workflow_id = $${paramCount++}`);
        values.push(updateData.deployedWorkflowId);
      }

      if (updateData.webhookUrl !== undefined) {
        fields.push(`webhook_url = $${paramCount++}`);
        values.push(updateData.webhookUrl);
      }

      values.push(this.id);

      const query = `
        UPDATE workflow_recommendations 
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, user_id, session_id, workflow_type, priority_score, recommended_reason,
                  estimated_impact, estimated_setup_time, setup_complexity, n8n_workflow_json,
                  user_decision, deployed_workflow_id, webhook_url, created_at
      `;
      
      const result = await pool.query(query, values);
      
      // Update instance properties
      const updated = result.rows[0];
      this.userDecision = updated.user_decision;
      this.deployedWorkflowId = updated.deployed_workflow_id;
      this.webhookUrl = updated.webhook_url;
      
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Approve and deploy workflow
  async approve(deployedWorkflowId, webhookUrl) {
    return this.update({
      userDecision: 'approved',
      deployedWorkflowId,
      webhookUrl
    });
  }

  // Reject workflow
  async reject() {
    return this.update({
      userDecision: 'rejected'
    });
  }

  toSafeObject() {
    return {
      id: this.id,
      userId: this.userId,
      sessionId: this.sessionId,
      workflowType: this.workflowType,
      priorityScore: this.priorityScore,
      recommendedReason: this.recommendedReason,
      estimatedImpact: this.estimatedImpact,
      estimatedSetupTime: this.estimatedSetupTime,
      setupComplexity: this.setupComplexity,
      n8nWorkflowJson: this.n8nWorkflowJson,
      userDecision: this.userDecision,
      deployedWorkflowId: this.deployedWorkflowId,
      webhookUrl: this.webhookUrl,
      createdAt: this.createdAt
    };
  }
}

module.exports = WorkflowRecommendation;

