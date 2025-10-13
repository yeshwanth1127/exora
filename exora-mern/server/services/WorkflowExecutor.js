// server/services/WorkflowExecutor.js

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const N8NIntegration = require('./N8NIntegration');
const WorkflowAnalyzer = require('./WorkflowAnalyzer');
const UserWorkflowInstance = require('../models/UserWorkflowInstance');

/**
 * Universal Workflow Execution Service
 * Handles execution of any n8n workflow with dynamic parameter injection
 */
class WorkflowExecutor {
  constructor() {
    this.n8n = new N8NIntegration();
    this.n8nBaseUrl = process.env.N8N_BASE_URL;
    this.n8nApiKey = process.env.N8N_API_KEY;
    this.headers = {
      'X-N8N-API-KEY': this.n8nApiKey,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get workflow parameters for execution
   * @param {number} userId - User ID
   * @param {string} templateWorkflowId - Template workflow ID (from dashboard)
   * @returns {object} - Parameter schema for frontend form
   */
  async getWorkflowParameters(userId, templateWorkflowId) {
    try {
      // Get user's cloned workflow instance
      const instance = await UserWorkflowInstance.findByUserSource({
        userId,
        sourceWorkflowId: templateWorkflowId
      });

      if (!instance) {
        throw new Error('Workflow not activated. Please activate the workflow first.');
      }

      if (instance.status !== 'active') {
        throw new Error('Workflow is not active. Please activate it before running.');
      }

      // Fetch workflow from n8n
      const workflowResult = await this.n8n.getWorkflow(instance.instance_workflow_id);
      
      if (!workflowResult.success) {
        throw new Error('Failed to fetch workflow from n8n: ' + workflowResult.error);
      }

      const workflow = workflowResult.workflow;

      // DEBUG: Log workflow details
      console.log(`[DEBUG] Cloned workflow ID: ${instance.instance_workflow_id}`);
      console.log(`[DEBUG] Workflow active: ${workflow.active}`);
      console.log(`[DEBUG] Workflow name: ${workflow.name}`);
      
      // Find webhook nodes
      const webhookNodes = workflow.nodes?.filter(n => n.type?.includes('webhook')) || [];
      console.log(`[DEBUG] Webhook nodes found: ${webhookNodes.length}`);
      webhookNodes.forEach(node => {
        console.log(`[DEBUG] Webhook node:`, {
          name: node.name,
          path: node.parameters?.path,
          webhookId: node.webhookId,
          nodeId: node.id
        });
      });

      // Analyze workflow to detect parameters (pass workflow ID for webhook URL construction)
      const analysis = WorkflowAnalyzer.analyzeWorkflow(workflow);

      console.log(`Analyzed workflow ${instance.instance_workflow_id}:`, {
        inputs: analysis.inputs.length,
        triggers: analysis.triggers.length,
        complexity: analysis.metadata.complexity,
        executionStrategy: analysis.executionStrategy.method
      });

      // Log webhook info if present
      if (analysis.triggers.some(t => t.type === 'webhook')) {
        const webhook = analysis.triggers.find(t => t.type === 'webhook');
        console.log(`Webhook detected: ${webhook.url} (${webhook.webhookMode} mode)`);
        console.log(`Workflow active status: ${workflow.active}`);
        console.log(`Webhook node ID: ${webhook.nodeId}`);
      }
      
      // IMPORTANT: Verify workflow is active
      if (!workflow.active) {
        console.warn(`⚠️ WARNING: Workflow ${instance.instance_workflow_id} is NOT ACTIVE!`);
        console.warn(`⚠️ Webhooks may not work for inactive workflows. Please activate the workflow first.`);
      }

      return {
        success: true,
        workflowId: instance.instance_workflow_id,
        templateWorkflowId: templateWorkflowId,
        workflowName: workflow.name,
        workflowActive: workflow.active,
        parameters: analysis.inputs,
        triggers: analysis.triggers,
        executionStrategy: analysis.executionStrategy,
        metadata: analysis.metadata,
        canExecute: true,
        requiresInput: analysis.inputs.length > 0
      };
    } catch (error) {
      console.error('Error getting workflow parameters:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Execute workflow with user inputs
   * @param {number} userId - User ID
   * @param {string} templateWorkflowId - Template workflow ID
   * @param {object} inputData - User-provided input data
   * @returns {object} - Execution result
   */
  async executeWorkflow(userId, templateWorkflowId, inputData) {
    try {
      const startTime = Date.now();

      // Get workflow instance
      const instance = await UserWorkflowInstance.findByUserSource({
        userId,
        sourceWorkflowId: templateWorkflowId
      });

      if (!instance) {
        throw new Error('Workflow not activated');
      }

      // Get workflow for analysis
      const workflowResult = await this.n8n.getWorkflow(instance.instance_workflow_id);
      const workflow = workflowResult.workflow;
      const analysis = WorkflowAnalyzer.analyzeWorkflow(workflow);

      // Validate inputs
      const validation = WorkflowAnalyzer.validateInputs(analysis.inputs, inputData);
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors,
          message: 'Validation failed'
        };
      }

      // Prepare execution data with context
      const executionPayload = {
        user: {
          id: userId
        },
        context: {
          runId: uuidv4(),
          timestamp: new Date().toISOString(),
          triggeredBy: 'manual'
        },
        input: inputData
      };

      // Execute based on strategy
      let result;
      const strategy = analysis.executionStrategy;

      if (strategy.method === 'webhook' && strategy.trigger?.url) {
        console.log(`Executing via webhook: ${strategy.trigger.url}`);
        try {
          result = await this._executeViaWebhook(strategy.trigger.url, executionPayload);
        } catch (webhookError) {
          console.warn(`⚠️ Webhook execution failed, falling back to n8n API...`);
          console.warn(`Webhook error: ${webhookError.message}`);
          
          // Fallback to n8n API execution
          console.log(`Executing via n8n API (fallback): ${instance.instance_workflow_id}`);
          result = await this._executeViaAPI(instance.instance_workflow_id, executionPayload);
        }
      } else {
        console.log(`Executing via n8n API: ${instance.instance_workflow_id}`);
        result = await this._executeViaAPI(instance.instance_workflow_id, executionPayload);
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        executionId: result.executionId,
        status: result.status,
        output: result.output,
        logs: result.logs || [],
        durationMs: duration,
        triggeredAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Workflow execution error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Execution failed'
      };
    }
  }

  /**
   * Execute workflow via webhook
   * @private
   */
  async _executeViaWebhook(webhookUrl, data) {
    try {
      console.log(`[WEBHOOK] Calling: ${webhookUrl}`);
      console.log(`[WEBHOOK] Method: POST`);
      console.log(`[WEBHOOK] Payload:`, JSON.stringify(data, null, 2));
      
      const response = await axios.post(webhookUrl, data, {
        timeout: 60000, // 60 second timeout
        headers: {
          'Content-Type': 'application/json'
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Don't throw on 4xx
        }
      });

      console.log(`[WEBHOOK] Response status: ${response.status}`);
      console.log(`[WEBHOOK] Response data:`, response.data);

      if (response.status === 404) {
        throw new Error(`Webhook not found (404). The workflow may not be active or the webhook path may be incorrect. URL: ${webhookUrl}`);
      }

      if (response.status >= 400) {
        throw new Error(`Webhook returned error ${response.status}: ${JSON.stringify(response.data)}`);
      }

      return {
        executionId: response.data?.executionId || 'webhook-' + Date.now(),
        status: 'success',
        output: response.data,
        logs: []
      };
    } catch (error) {
      console.error('[WEBHOOK] Execution error:', error.message);
      if (error.response) {
        console.error('[WEBHOOK] Response status:', error.response.status);
        console.error('[WEBHOOK] Response data:', error.response.data);
      }
      throw new Error('Webhook execution failed: ' + error.message);
    }
  }

  /**
   * Execute workflow via n8n API
   * @private
   */
  async _executeViaAPI(workflowId, data) {
    try {
      // Execute workflow via n8n API
      const response = await axios.post(
        `${this.n8nBaseUrl}/api/v1/workflows/${workflowId}/execute`,
        data,
        { 
          headers: this.headers,
          timeout: 60000
        }
      );

      const executionData = response.data;

      // Wait for execution to complete (poll if needed)
      const executionId = executionData?.executionId || executionData?.id;
      
      if (executionId) {
        const finalResult = await this._pollExecution(executionId);
        return finalResult;
      }

      // If execution completed immediately
      return {
        executionId: executionId || 'exec-' + Date.now(),
        status: executionData.finished ? 'success' : 'running',
        output: executionData.data || executionData,
        logs: []
      };

    } catch (error) {
      console.error('API execution error:', error.message);
      throw new Error('Workflow execution failed: ' + error.message);
    }
  }

  /**
   * Poll n8n for execution completion
   * @private
   */
  async _pollExecution(executionId, maxAttempts = 30, interval = 1000) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await axios.get(
          `${this.n8nBaseUrl}/api/v1/executions/${executionId}`,
          { headers: this.headers }
        );

        const execution = response.data;

        if (execution.finished) {
          return {
            executionId: execution.id,
            status: execution.status === 'success' ? 'success' : 'error',
            output: execution.data || {},
            logs: this._extractLogs(execution),
            error: execution.status === 'error' ? execution.data?.error : null
          };
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, interval));
      } catch (error) {
        console.error(`Error polling execution ${executionId}:`, error.message);
        if (i === maxAttempts - 1) throw error;
      }
    }

    // Timeout
    return {
      executionId,
      status: 'timeout',
      output: {},
      logs: [],
      error: 'Execution timed out'
    };
  }

  /**
   * Extract logs from execution data
   * @private
   */
  _extractLogs(execution) {
    const logs = [];
    
    if (execution.data?.resultData?.runData) {
      Object.entries(execution.data.resultData.runData).forEach(([nodeName, nodeData]) => {
        if (Array.isArray(nodeData) && nodeData.length > 0) {
          logs.push({
            node: nodeName,
            status: nodeData[0].error ? 'error' : 'success',
            data: nodeData[0].data || {},
            error: nodeData[0].error
          });
        }
      });
    }
    
    return logs;
  }

  /**
   * Get execution history for a workflow
   * @param {number} userId - User ID
   * @param {string} templateWorkflowId - Template workflow ID
   * @param {number} limit - Number of records to return
   * @returns {array} - Execution history
   */
  async getExecutionHistory(userId, templateWorkflowId, limit = 20) {
    try {
      const WorkflowExecution = require('../models/WorkflowExecution');
      const history = await WorkflowExecution.getHistory(userId, templateWorkflowId, limit);
      
      return {
        success: true,
        executions: history
      };
    } catch (error) {
      console.error('Error fetching execution history:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = WorkflowExecutor;

