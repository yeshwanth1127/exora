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

    console.log(`Found ${result.workflows.length} workflows`);
    res.json({
      success: true,
      workflows: result.workflows
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
      status: 'inactive' // Start as inactive, user can activate later
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