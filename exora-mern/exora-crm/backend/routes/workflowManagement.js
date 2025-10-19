const express = require('express');
const { validateExoraToken, requireCRMActivation } = require('../middleware/auth');
const {
  hasWorkflowInstance,
  getUserWorkflowInstance,
  getUserWebhookUrl
} = require('../services/workflowInstanceService');

const router = express.Router();

router.use(validateExoraToken);
router.use(requireCRMActivation);

// GET /api/workflow/status - Check if user has workflow instance
router.get('/status', async (req, res) => {
  try {
    const crmUserId = req.user.crm_user_id;
    const crmUser = req.user.crm_user;
    
    const hasInstance = await hasWorkflowInstance(crmUserId);
    
    res.json({
      has_workflow: hasInstance,
      workflow_id: crmUser.n8n_workflow_id,
      webhook_url: hasInstance ? getUserWebhookUrl(crmUserId) : null,
      status: crmUser.status
    });
  } catch (error) {
    console.error('Get workflow status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/workflow/info - Get detailed workflow information
router.get('/info', async (req, res) => {
  try {
    const crmUserId = req.user.crm_user_id;
    const crmUser = req.user.crm_user;
    
    const hasInstance = await hasWorkflowInstance(crmUserId);
    
    if (!hasInstance) {
      console.warn(`[WorkflowInfo] No workflow instance for user ${crmUserId}`);
      return res.status(404).json({
        error: 'No workflow instance found',
        message: 'Please activate CRM from Exora dashboard first.'
      });
    }
    
    const workflowId = await getUserWorkflowInstance(crmUserId);
    const webhookUrl = getUserWebhookUrl(crmUserId);
    
    const info = {
      workflow_id: workflowId,
      webhook_url: webhookUrl,
      webhook_path: `${crmUserId}/automation`,
      crm_user_id: crmUserId,
      status: crmUser.status,
      business_name: crmUser.business_name,
      industry: crmUser.industry
    };
    
    // Log to console for debugging
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 [WorkflowInfo] USER WORKFLOW INFORMATION');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('CRM User ID:', info.crm_user_id);
    console.log('n8n Workflow ID:', info.workflow_id);
    console.log('Webhook URL:', info.webhook_url);
    console.log('Webhook Path:', info.webhook_path);
    console.log('Business:', info.business_name || 'Not set');
    console.log('Industry:', info.industry || 'Not set');
    console.log('Status:', info.status);
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    res.json(info);
  } catch (error) {
    console.error('Get workflow info error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

