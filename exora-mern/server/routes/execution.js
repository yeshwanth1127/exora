// server/routes/execution.js

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const WorkflowExecutor = require('../services/WorkflowExecutor');
const WorkflowExecution = require('../models/WorkflowExecution');

const router = express.Router();
const executor = new WorkflowExecutor();

/**
 * Get workflow parameters for execution form
 * Returns the dynamic parameter schema for a workflow
 */
router.get('/workflow-parameters/:workflowId', authenticateToken, async (req, res) => {
  try {
    const { workflowId } = req.params;
    const userId = req.user.id;

    console.log(`Fetching execution parameters for workflow ${workflowId}, user ${userId}`);

    const result = await executor.getWorkflowParameters(userId, workflowId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching workflow parameters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workflow parameters'
    });
  }
});

/**
 * Execute workflow with user inputs
 */
router.post('/execute-workflow', authenticateToken, async (req, res) => {
  try {
    const { workflowId, inputs } = req.body;
    const userId = req.user.id;

    if (!workflowId) {
      return res.status(400).json({
        success: false,
        error: 'workflowId is required'
      });
    }

    console.log(`Executing workflow ${workflowId} for user ${userId}`);
    console.log('Input data:', inputs);

    // Execute the workflow
    const result = await executor.executeWorkflow(userId, workflowId, inputs || {});

    if (!result.success) {
      // Save failed execution
      await WorkflowExecution.create({
        userId,
        templateWorkflowId: workflowId,
        instanceWorkflowId: result.instanceWorkflowId || workflowId,
        inputData: inputs || {},
        status: 'error',
        errorMessage: result.error || result.message,
        triggerType: 'manual'
      });

      return res.status(400).json({
        success: false,
        error: result.error,
        message: result.message,
        validationErrors: result.errors
      });
    }

    // Save successful execution
    await WorkflowExecution.create({
      userId,
      templateWorkflowId: workflowId,
      instanceWorkflowId: result.instanceWorkflowId || workflowId,
      n8nExecutionId: result.executionId,
      inputData: inputs || {},
      outputData: result.output,
      status: result.status,
      errorMessage: result.error,
      executionTimeMs: result.durationMs,
      triggerType: 'manual',
      completedAt: new Date()
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error executing workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute workflow: ' + error.message
    });
  }
});

/**
 * Get execution history for a workflow
 */
router.get('/history/:workflowId', authenticateToken, async (req, res) => {
  try {
    const { workflowId } = req.params;
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;

    console.log(`Fetching execution history for workflow ${workflowId}, user ${userId}`);

    const result = await executor.getExecutionHistory(userId, workflowId, limit);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.executions
    });

  } catch (error) {
    console.error('Error fetching execution history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch execution history'
    });
  }
});

/**
 * Get specific execution details
 */
router.get('/result/:executionId', authenticateToken, async (req, res) => {
  try {
    const { executionId } = req.params;
    const userId = req.user.id;

    const execution = await WorkflowExecution.findById(executionId);

    if (!execution) {
      return res.status(404).json({
        success: false,
        error: 'Execution not found'
      });
    }

    // Verify user owns this execution
    if (execution.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: execution
    });

  } catch (error) {
    console.error('Error fetching execution result:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch execution result'
    });
  }
});

/**
 * Get execution statistics for a workflow
 */
router.get('/stats/:workflowId', authenticateToken, async (req, res) => {
  try {
    const { workflowId } = req.params;
    const userId = req.user.id;

    const stats = await WorkflowExecution.getStats(userId, workflowId);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching execution stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch execution statistics'
    });
  }
});

/**
 * Re-run a previous execution with same inputs
 */
router.post('/rerun/:executionId', authenticateToken, async (req, res) => {
  try {
    const { executionId } = req.params;
    const userId = req.user.id;

    // Get original execution
    const original = await WorkflowExecution.findById(executionId);

    if (!original) {
      return res.status(404).json({
        success: false,
        error: 'Original execution not found'
      });
    }

    // Verify ownership
    if (original.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    console.log(`Re-running execution ${executionId} for user ${userId}`);

    // Execute with same inputs
    const result = await executor.executeWorkflow(
      userId,
      original.templateWorkflowId,
      original.inputData
    );

    if (result.success) {
      // Save new execution
      await WorkflowExecution.create({
        userId,
        templateWorkflowId: original.templateWorkflowId,
        instanceWorkflowId: original.instanceWorkflowId,
        n8nExecutionId: result.executionId,
        inputData: original.inputData,
        outputData: result.output,
        status: result.status,
        executionTimeMs: result.durationMs,
        triggerType: 'rerun'
      });
    }

    res.json({
      success: result.success,
      data: result
    });

  } catch (error) {
    console.error('Error re-running execution:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to re-run execution'
    });
  }
});

module.exports = router;

