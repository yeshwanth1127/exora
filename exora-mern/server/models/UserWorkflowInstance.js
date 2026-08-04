const { pool } = require('../config/db');

// Suggested table schema:
// CREATE TABLE IF NOT EXISTS user_workflow_instances (
//   id SERIAL PRIMARY KEY,
//   user_id INTEGER NOT NULL,
//   source_workflow_id VARCHAR(64) NOT NULL,
//   instance_workflow_id VARCHAR(64) NOT NULL,
//   status VARCHAR(24) DEFAULT 'active',
//   activated_at TIMESTAMPTZ,
//   services_used TEXT[] DEFAULT '{}',
//   credential_id VARCHAR(128),
//   n8n_credential_ids JSONB,  -- Stores mapping of credType => n8nCredentialId
//   created_at TIMESTAMPTZ DEFAULT NOW(),
//   updated_at TIMESTAMPTZ DEFAULT NOW(),
//   UNIQUE(user_id, source_workflow_id)
// );

class UserWorkflowInstance {
  static async upsert({ 
    userId, 
    sourceWorkflowId, 
    templateWorkflowId, 
    instanceWorkflowId, 
    clonedWorkflowId,
    status = 'active', 
    credentialId = null, 
    credential_id = null,
    servicesUsed = [], 
    services_used = [],
    activated_at,
    n8n_credential_ids = null
  }) {
    // Support both naming conventions for flexibility
    const finalSourceWorkflowId = sourceWorkflowId || templateWorkflowId;
    const finalInstanceWorkflowId = instanceWorkflowId || clonedWorkflowId;
    const finalCredentialId = credentialId || credential_id;
    const finalServicesUsed = servicesUsed.length > 0 ? servicesUsed : services_used;
    const finalActivatedAt = activated_at || new Date();

    // Check if n8n_credential_ids column exists, if not, gracefully fallback
    const query = `
      INSERT INTO user_workflow_instances (user_id, source_workflow_id, instance_workflow_id, status, activated_at, services_used, credential_id, n8n_credential_ids, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      ON CONFLICT (user_id, source_workflow_id)
      DO UPDATE SET instance_workflow_id = EXCLUDED.instance_workflow_id,
                    status = EXCLUDED.status,
                    activated_at = EXCLUDED.activated_at,
                    services_used = EXCLUDED.services_used,
                    credential_id = EXCLUDED.credential_id,
                    n8n_credential_ids = EXCLUDED.n8n_credential_ids,
                    updated_at = NOW()
      RETURNING id, user_id AS "userId", source_workflow_id AS "sourceWorkflowId", instance_workflow_id AS "instanceWorkflowId", status, activated_at AS "activatedAt", services_used AS "servicesUsed", credential_id AS "credentialId", n8n_credential_ids AS "n8nCredentialIds";
    `;
    
    try {
      const res = await pool.query(query, [
        userId, 
        finalSourceWorkflowId, 
        finalInstanceWorkflowId, 
        status, 
        finalActivatedAt,
        finalServicesUsed, 
        finalCredentialId,
        n8n_credential_ids ? JSON.stringify(n8n_credential_ids) : null
      ]);
      return res.rows[0];
    } catch (err) {
      // If n8n_credential_ids column doesn't exist yet, try without it
      if (err.code === '42703') { // undefined_column
        console.warn('n8n_credential_ids column does not exist, using fallback query');
        const fallbackQuery = `
          INSERT INTO user_workflow_instances (user_id, source_workflow_id, instance_workflow_id, status, activated_at, services_used, credential_id, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
          ON CONFLICT (user_id, source_workflow_id)
          DO UPDATE SET instance_workflow_id = EXCLUDED.instance_workflow_id,
                        status = EXCLUDED.status,
                        activated_at = EXCLUDED.activated_at,
                        services_used = EXCLUDED.services_used,
                        credential_id = EXCLUDED.credential_id,
                        updated_at = NOW()
          RETURNING id, user_id AS "userId", source_workflow_id AS "sourceWorkflowId", instance_workflow_id AS "instanceWorkflowId", status, activated_at AS "activatedAt", services_used AS "servicesUsed", credential_id AS "credentialId";
        `;
        const res = await pool.query(fallbackQuery, [userId, finalSourceWorkflowId, finalInstanceWorkflowId, status, finalActivatedAt, finalServicesUsed, finalCredentialId]);
        return res.rows[0];
      }
      throw err;
    }
  }

  static async findByUserSource({ userId, sourceWorkflowId }) {
    const res = await pool.query(
      'SELECT * FROM user_workflow_instances WHERE user_id=$1 AND source_workflow_id=$2',
      [userId, sourceWorkflowId]
    );
    return res.rows[0] || null;
  }

  static async findExistingUserWorkflowInstance(userId, sourceWorkflowId) {
    return this.findByUserSource({ userId, sourceWorkflowId });
  }

  static async getUserWorkflowInstances(userId) {
    const res = await pool.query(
      'SELECT * FROM user_workflow_instances WHERE user_id=$1 ORDER BY activated_at DESC NULLS LAST, updated_at DESC',
      [userId]
    );
    return res.rows;
  }
}

module.exports = UserWorkflowInstance;





