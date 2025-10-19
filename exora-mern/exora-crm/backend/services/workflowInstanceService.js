const axios = require('axios');
const { pool } = require('../config/db');

const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5679';

/**
 * Get user's workflow instance ID from database
 * NOTE: Workflow is already cloned during CRM activation in server/routes/activation.js
 */
async function getUserWorkflowInstance(crmUserId) {
  try {
    const result = await pool.query(
      'SELECT n8n_workflow_id FROM crm_users WHERE id = $1',
      [crmUserId]
    );
    
    if (result.rows.length === 0 || !result.rows[0].n8n_workflow_id) {
      throw new Error('User does not have a workflow instance. Please activate CRM first from Exora dashboard.');
    }
    
    return result.rows[0].n8n_workflow_id;
  } catch (error) {
    console.error('[WorkflowInstance] Failed to get workflow ID:', error);
    throw error;
  }
}

/**
 * Get webhook URL for user's specific workflow instance
 * Uses the crm_user_id as the webhook path (set during cloning in activation.js)
 */
function getUserWebhookUrl(crmUserId) {
  // Webhook path is {crm_user_id}/automation (set during cloning in activation.js)
  const webhookUrl = `${N8N_BASE_URL}/webhook/${crmUserId}/automation`;
  
  console.log(`[WorkflowInstance] Webhook URL for user ${crmUserId}: ${webhookUrl}`);
  
  return webhookUrl;
}

/**
 * Trigger user's specific workflow instance via webhook
 */
async function triggerUserWorkflow(crmUserId, module, data) {
  try {
    // Get workflow ID for debugging
    const workflowId = await getUserWorkflowInstance(crmUserId);
    const webhookUrl = getUserWebhookUrl(crmUserId);
    
    const payload = {
      module: module,
      crm_user_id: crmUserId,
      trigger_source: data.trigger_source || 'manual',
      ...data
    };
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🚀 [WorkflowInstance] TRIGGERING USER AUTOMATION');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📋 CRM User ID:', crmUserId);
    console.log('🔧 n8n Workflow ID:', workflowId);
    console.log('⚡ Module:', module);
    console.log('🌐 Webhook URL:', webhookUrl);
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    console.log('═══════════════════════════════════════════════════════════════');
    
    const response = await axios.post(webhookUrl, payload, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ [WorkflowInstance] Workflow triggered successfully');
    console.log('📤 Response:', JSON.stringify(response.data, null, 2));
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    return response.data;
  } catch (error) {
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('❌ [WorkflowInstance] WORKFLOW TRIGGER FAILED');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('CRM User ID:', crmUserId);
    console.error('Module:', module);
    console.error('Error:', error.message);
    console.error('═══════════════════════════════════════════════════════════════\n');
    throw error;
  }
}

/**
 * Check if user has workflow instance
 */
async function hasWorkflowInstance(crmUserId) {
  try {
    const result = await pool.query(
      'SELECT n8n_workflow_id FROM crm_users WHERE id = $1',
      [crmUserId]
    );
    
    return result.rows.length > 0 && result.rows[0].n8n_workflow_id !== null;
  } catch (error) {
    console.error('[WorkflowInstance] Failed to check workflow instance:', error);
    return false;
  }
}

module.exports = {
  getUserWorkflowInstance,
  getUserWebhookUrl,
  triggerUserWorkflow,
  hasWorkflowInstance
};

