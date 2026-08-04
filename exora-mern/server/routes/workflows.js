const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const N8NIntegration = require('../services/N8NIntegration');
const DashboardData = require('../models/DashboardData');

const router = express.Router();
const n8n = new N8NIntegration();

// Get all workflows from N8N
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching workflows from N8N...');
    const result = await n8n.getAllWorkflowsFormatted();
    
    if (!result.success) {
      console.error('N8N API error:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch workflows from N8N: ' + result.error
      });
    }

    // Filter out user-cloned workflows (only show templates)
    const allWorkflows = result.workflows;
    const templateWorkflows = allWorkflows.filter(wf => {
      const name = wf.name || '';
      // Exclude workflows that:
      // - Start with "user-" (no space)
      // - Contain "user -" (with space) anywhere
      // - Contain " — " (cloned workflows)
      // - Start with "CRM Automation -" (cloned CRM workflows)
      return !name.match(/^user-\d+/i) && 
             !name.toLowerCase().includes('user -') && 
             !name.includes(' — ') &&
             !name.startsWith('CRM Automation -');
    });

    console.log(`Found ${allWorkflows.length} workflows (${templateWorkflows.length} templates, ${allWorkflows.length - templateWorkflows.length} user-cloned)`);
    res.json({
      success: true,
      workflows: templateWorkflows
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workflows'
    });
  }
});

// Save selected workflows to user dashboard
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { workflows } = req.body;
    const userId = req.user.id;

    if (!workflows || !Array.isArray(workflows)) {
      return res.status(400).json({
        success: false,
        error: 'Workflows array is required'
      });
    }

    // Get or create dashboard data
    let dashboardData = await DashboardData.findByUserId(userId);
    if (!dashboardData) {
      dashboardData = {
        businessInfo: {},
        workflows: [],
        recommendations: [],
        metrics: {},
        isConfigured: false
      };
    }

    // Get user's activated workflow instances to check status
    const UserWorkflowInstance = require('../models/UserWorkflowInstance');
    const userInstances = await UserWorkflowInstance.getUserWorkflowInstances(userId);
    const activatedTemplateIds = new Set(
      userInstances
        .filter(instance => instance.status === 'active')
        .map(instance => instance.source_workflow_id)
    );

    console.log('User has activated instances for templates:', Array.from(activatedTemplateIds));

    // Add selected workflows to dashboard
    const selectedWorkflows = workflows.map(workflow => ({
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      active: workflow.active,
      category: getWorkflowCategory(workflow),
      icon: getWorkflowIcon(workflow),
      nodes: workflow.nodes,
      connections: workflow.connections,
      triggers: workflow.triggers,
      actions: workflow.actions,
      createdAt: workflow.createdAt,
      addedAt: new Date().toISOString(),
      // ✅ Check if user has activated their own clone of this template
      status: activatedTemplateIds.has(workflow.id) ? 'active' : 'inactive'
    }));

    // Merge with existing workflows (avoid duplicates)
    const existingWorkflowIds = dashboardData.workflows.map(w => w.id);
    const newWorkflows = selectedWorkflows.filter(w => !existingWorkflowIds.includes(w.id));
    
    dashboardData.workflows = [...dashboardData.workflows, ...newWorkflows];
    dashboardData.isConfigured = true;

    // Save to database
    await DashboardData.upsert(userId, dashboardData);

    res.json({
      success: true,
      message: `Successfully added ${newWorkflows.length} workflow${newWorkflows.length !== 1 ? 's' : ''} to your dashboard`,
      data: {
        addedWorkflows: newWorkflows,
        totalWorkflows: dashboardData.workflows.length
      }
    });

  } catch (error) {
    console.error('Error saving workflows:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save workflows'
    });
  }
});

// Activate/deactivate a workflow
router.patch('/:workflowId/status', authenticateToken, async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be either "active" or "inactive"'
      });
    }

    const dashboardData = await DashboardData.findByUserId(userId);
    if (!dashboardData) {
      return res.status(404).json({
        success: false,
        error: 'Dashboard not found'
      });
    }

    const workflow = dashboardData.workflows.find(w => w.id === workflowId);
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    // NEW: If deactivating, also deactivate the n8n workflow instance
    if (status === 'inactive') {
      const UserWorkflowInstance = require('../models/UserWorkflowInstance');
      const instance = await UserWorkflowInstance.findByUserSource({
        userId,
        sourceWorkflowId: workflowId
      });

      if (instance && instance.instance_workflow_id) {
        try {
          console.log(`Deactivating n8n workflow instance: ${instance.instance_workflow_id}`);
          
          // Deactivate in n8n using dedicated deactivate endpoint
          const result = await n8n.deactivateWorkflow(instance.instance_workflow_id);

          if (result.success) {
            console.log(`✓ n8n workflow ${instance.instance_workflow_id} deactivated`);
            
            // Update instance status in database
            await UserWorkflowInstance.upsert({
              userId,
              sourceWorkflowId: workflowId,
              instanceWorkflowId: instance.instance_workflow_id,
              status: 'inactive'
            });
          } else {
            console.warn(`⚠️ Failed to deactivate n8n workflow: ${result.error}`);
          }
        } catch (n8nError) {
          console.error('Error deactivating n8n workflow:', n8nError);
          // Continue with dashboard update even if n8n deactivation fails
        }
      } else {
        console.log(`⚠️ No workflow instance found for template ${workflowId}, only updating dashboard status`);
      }
    }

    // Update dashboard status
    workflow.status = status;
    workflow.updatedAt = new Date().toISOString();

    await DashboardData.upsert(userId, dashboardData);

    res.json({
      success: true,
      message: `Workflow ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: { workflow }
    });

  } catch (error) {
    console.error('Error updating workflow status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update workflow status'
    });
  }
});

// Get individual workflow statistics
router.get('/:workflowId/stats', authenticateToken, async (req, res) => {
  try {
    const { workflowId } = req.params;
    const userId = req.user.id;
    
    // Verify user owns this workflow
    const UserWorkflowInstance = require('../models/UserWorkflowInstance');
    const instance = await UserWorkflowInstance.findByUserSource({ 
      userId, 
      sourceWorkflowId: workflowId 
    });
    
    if (!instance) {
      return res.status(404).json({ 
        success: false, 
        error: 'Workflow not found or not activated' 
      });
    }
    
    // Fetch executions from n8n
    const result = await n8n.getWorkflowExecutions(instance.instance_workflow_id);
    
    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }
    
    const executions = result.executions || [];
    const completed = executions.filter(e => e.finished);
    const successful = completed.filter(e => e.status === 'success');
    const failed = completed.filter(e => e.status === 'error');
    
    // Calculate detailed stats
    const stats = {
      workflowName: instance.source_workflow_id,
      instanceId: instance.instance_workflow_id,
      totalExecutions: executions.length,
      successfulExecutions: successful.length,
      failedExecutions: failed.length,
      successRate: executions.length > 0 
        ? Math.round((successful.length / executions.length) * 100) 
        : 0,
      lastExecution: executions[0]?.startedAt || null,
      averageExecutionTime: n8n.calculateAverageExecutionTime(executions),
      recentExecutions: executions.slice(0, 10).map(e => ({
        id: e.id,
        status: e.status,
        startedAt: e.startedAt,
        duration: e.startedAt && e.stoppedAt 
          ? Math.round((new Date(e.stoppedAt) - new Date(e.startedAt)) / 1000)
          : null
      }))
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get workflow stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch workflow statistics' 
    });
  }
});

// Remove a workflow from dashboard
router.delete('/:workflowId', authenticateToken, async (req, res) => {
  try {
    const { workflowId } = req.params;
    const userId = req.user.id;

    const dashboardData = await DashboardData.findByUserId(userId);
    if (!dashboardData) {
      return res.status(404).json({
        success: false,
        error: 'Dashboard not found'
      });
    }

    const initialLength = dashboardData.workflows.length;
    dashboardData.workflows = dashboardData.workflows.filter(w => w.id !== workflowId);

    if (dashboardData.workflows.length === initialLength) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    await DashboardData.upsert(userId, dashboardData);

    res.json({
      success: true,
      message: 'Workflow removed from dashboard successfully',
      data: {
        removedWorkflowId: workflowId,
        remainingWorkflows: dashboardData.workflows.length
      }
    });

  } catch (error) {
    console.error('Error removing workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove workflow'
    });
  }
});

// Helper functions
function getWorkflowCategory(workflow) {
  const name = workflow.name.toLowerCase();
  if (name.includes('whatsapp') || name.includes('chatbot')) return 'Communication';
  if (name.includes('booking') || name.includes('calendar')) return 'Scheduling';
  if (name.includes('email')) return 'Email Automation';
  if (name.includes('data') || name.includes('sync')) return 'Data Management';
  return 'General Automation';
}

function getWorkflowIcon(workflow) {
  const name = workflow.name.toLowerCase();
  if (name.includes('whatsapp') || name.includes('chatbot')) return '💬';
  if (name.includes('booking') || name.includes('calendar')) return '📅';
  if (name.includes('email')) return '📧';
  if (name.includes('data') || name.includes('sync')) return '🔄';
  return '⚡';
}

module.exports = router;