const axios = require('axios');

class N8NIntegration {
  constructor() {
    this.baseURL = process.env.N8N_BASE_URL || 'https://n8n.exora.solutions';
    this.apiKey = process.env.N8N_API_KEY;
    this.headers = {
      'X-N8N-API-KEY': this.apiKey,
      'Content-Type': 'application/json'
    };
  }

  // Test N8N connection
  async testConnection() {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/workflows`, {
        headers: this.headers
      });
      console.log('✅ N8N connection successful');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ N8N connection failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Get all workflows
  async getAllWorkflows() {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/workflows`, {
        headers: this.headers
      });
      
      return {
        success: true,
        workflows: response.data.data || response.data,
        total: response.data.data?.length || response.data.length || 0
      };
    } catch (error) {
      console.error('Failed to fetch workflows:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Get specific workflow by ID
  async getWorkflow(workflowId) {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/workflows/${workflowId}`, {
        headers: this.headers
      });
      
      return {
        success: true,
        workflow: response.data
      };
    } catch (error) {
      console.error(`Failed to fetch workflow ${workflowId}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Get workflow execution status
  async getWorkflowExecutions(workflowId) {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/executions`, {
        headers: this.headers,
        params: {
          workflowId: workflowId,
          limit: 10
        }
      });
      
      return {
        success: true,
        executions: response.data.data || response.data
      };
    } catch (error) {
      console.error(`Failed to fetch executions for workflow ${workflowId}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Execute a workflow
  async executeWorkflow(workflowId, inputData = {}) {
    try {
      const response = await axios.post(`${this.baseURL}/api/v1/workflows/${workflowId}/execute`, 
        inputData,
        { headers: this.headers }
      );
      
      return {
        success: true,
        execution: response.data
      };
    } catch (error) {
      console.error(`Failed to execute workflow ${workflowId}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Create a new workflow
  async createWorkflow(workflowData) {
    try {
      console.log('Creating workflow with data:', JSON.stringify(workflowData, null, 2));
      const response = await axios.post(`${this.baseURL}/api/v1/workflows`, 
        workflowData,
        { headers: this.headers }
      );
      
      return {
        success: true,
        workflow: response.data
      };
    } catch (error) {
      console.error('Failed to create workflow:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Workflow data sent:', JSON.stringify(workflowData, null, 2));
      return { success: false, error: error.response?.data || error.message };
    }
  }

  // Update workflow
  async updateWorkflow(workflowId, workflowData) {
    try {
      console.log(`Updating workflow ${workflowId} with data:`, JSON.stringify(workflowData, null, 2));
      const response = await axios.put(`${this.baseURL}/api/v1/workflows/${workflowId}`, 
        workflowData,
        { headers: this.headers }
      );
      
      console.log(`Workflow ${workflowId} updated successfully`);
      return {
        success: true,
        workflow: response.data
      };
    } catch (error) {
      console.error(`Failed to update workflow ${workflowId}:`, error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  // Delete workflow
  async deleteWorkflow(workflowId) {
    try {
      await axios.delete(`${this.baseURL}/api/v1/workflows/${workflowId}`, {
        headers: this.headers
      });
      
      return { success: true };
    } catch (error) {
      console.error(`Failed to delete workflow ${workflowId}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Get workflow statistics
  async getWorkflowStats(workflowId) {
    try {
      const executions = await this.getWorkflowExecutions(workflowId);
      if (!executions.success) return executions;

      const stats = {
        totalExecutions: executions.executions.length,
        successfulExecutions: executions.executions.filter(exec => exec.finished && !exec.stoppedAt).length,
        failedExecutions: executions.executions.filter(exec => exec.stoppedAt).length,
        lastExecution: executions.executions[0]?.startedAt || null,
        averageExecutionTime: this.calculateAverageExecutionTime(executions.executions)
      };

      return {
        success: true,
        stats
      };
    } catch (error) {
      console.error(`Failed to get stats for workflow ${workflowId}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Helper method to calculate average execution time
  calculateAverageExecutionTime(executions) {
    const completedExecutions = executions.filter(exec => 
      exec.finished && exec.startedAt && exec.stoppedAt
    );

    if (completedExecutions.length === 0) return 0;

    const totalTime = completedExecutions.reduce((sum, exec) => {
      const start = new Date(exec.startedAt);
      const end = new Date(exec.stoppedAt);
      return sum + (end - start);
    }, 0);

    return Math.round(totalTime / completedExecutions.length / 1000); // in seconds
  }

  // Format workflow for display
  formatWorkflowForDisplay(workflow) {
    return {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description || 'No description available',
      active: workflow.active,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      nodes: workflow.nodes?.length || 0,
      connections: Object.keys(workflow.connections || {}).length,
      tags: workflow.tags || [],
      // Extract readable information from nodes
      nodeTypes: this.extractNodeTypes(workflow.nodes || []),
      triggers: this.extractTriggers(workflow.nodes || []),
      actions: this.extractActions(workflow.nodes || [])
    };
  }

  // Extract node types from workflow
  extractNodeTypes(nodes) {
    const types = nodes.map(node => node.type).filter((type, index, self) => self.indexOf(type) === index);
    return types;
  }

  // Extract trigger nodes
  extractTriggers(nodes) {
    const triggerNodes = nodes.filter(node => 
      node.type.includes('Trigger') || 
      node.type.includes('Webhook') ||
      node.type.includes('Schedule')
    );
    return triggerNodes.map(node => ({
      type: node.type,
      name: node.name,
      parameters: node.parameters
    }));
  }

  // Extract action nodes
  extractActions(nodes) {
    const actionNodes = nodes.filter(node => 
      !node.type.includes('Trigger') && 
      !node.type.includes('Webhook') &&
      !node.type.includes('Schedule')
    );
    return actionNodes.map(node => ({
      type: node.type,
      name: node.name,
      parameters: node.parameters
    }));
  }

  // Get all workflows with formatted display data
  async getAllWorkflowsFormatted() {
    try {
      const result = await this.getAllWorkflows();
      if (!result.success) return result;

      const formattedWorkflows = result.workflows.map(workflow => 
        this.formatWorkflowForDisplay(workflow)
      );

      return {
        success: true,
        workflows: formattedWorkflows,
        total: formattedWorkflows.length
      };
    } catch (error) {
      console.error('Failed to format workflows:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = N8NIntegration;


