const { Ollama } = require('ollama');
const { PromptTemplate } = require('@langchain/core/prompts');
const axios = require('axios');

class WorkflowGenerationService {
  constructor() {
    this.llm = new Ollama({
      baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL || 'llama2',
      temperature: 0.3
    });
    
    this.n8nBaseUrl = process.env.N8N_BASE_URL;
    this.n8nApiKey = process.env.N8N_API_KEY;
  }

  async generateWorkflowsFromDiscovery(businessProfile) {
    const workflowPrompt = PromptTemplate.fromTemplate(`
You are an expert N8N workflow architect. Based on the business profile, generate specific N8N workflow recommendations.

BUSINESS PROFILE:
Industry: {industry}
Business Size: {businessSize}
Pain Points: {painPoints}
Current Tools: {currentTools}
Automation Goals: {automationGoals}

Generate 3-5 specific N8N workflows that would solve their biggest pain points.

For each workflow, provide:
1. Workflow Name
2. Description
3. N8N Nodes Required
4. Trigger Type
5. Expected Impact
6. Setup Complexity (1-5)
7. Priority Score (1-100)

Format as JSON array of workflow objects.
`);

    try {
      const prompt = await workflowPrompt.format({
        industry: businessProfile.industry,
        businessSize: businessProfile.business_size,
        painPoints: businessProfile.pain_points?.join(', ') || '',
        currentTools: businessProfile.current_tools?.join(', ') || '',
        automationGoals: businessProfile.automation_goals?.join(', ') || ''
      });

      const response = await this.llmCall(prompt);
      const workflows = JSON.parse(response);

      // Generate actual N8N workflow JSON for each recommendation
      const workflowsWithN8N = await Promise.all(
        workflows.map(async (workflow) => ({
          ...workflow,
          n8nWorkflow: await this.generateN8NWorkflowJSON(workflow, businessProfile)
        }))
      );

      return workflowsWithN8N;
    } catch (error) {
      console.error('Workflow generation error:', error);
      return [];
    }
  }

  async generateN8NWorkflowJSON(workflowSpec, businessProfile) {
    const n8nPrompt = PromptTemplate.fromTemplate(`
Generate a complete N8N workflow JSON for the following specification:

WORKFLOW SPEC:
Name: {workflowName}
Description: {description}
Nodes Required: {nodesRequired}
Trigger Type: {triggerType}

ORGANIZATION CONTEXT:
User ID: {userId}
Industry: {industry}
Current Tools: {currentTools}

Generate a complete N8N workflow JSON with:
1. Proper node configuration
2. Correct node connections
3. User-specific placeholders
4. Webhook triggers where appropriate
5. Error handling nodes

Return only valid N8N workflow JSON.
`);

    const prompt = await n8nPrompt.format({
      workflowName: workflowSpec.name,
      description: workflowSpec.description,
      nodesRequired: workflowSpec.nodesRequired?.join(', ') || '',
      triggerType: workflowSpec.triggerType || 'webhook',
      userId: businessProfile.user_id,
      industry: businessProfile.industry,
      currentTools: businessProfile.current_tools?.join(', ') || ''
    });

    try {
      const response = await this.llmCall(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('N8N JSON generation error:', error);
      return null;
    }
  }

  async deployWorkflowToN8N(workflowJson, userId) {
    try {
      // Create workflow in N8N
      const createResponse = await axios.post(`${this.n8nBaseUrl}/api/v1/workflows`, workflowJson, {
        headers: {
          'Authorization': `Bearer ${this.n8nApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const createdWorkflow = createResponse.data;

      // Activate workflow
      await axios.post(`${this.n8nBaseUrl}/api/v1/workflows/${createdWorkflow.id}/activate`, {}, {
        headers: {
          'Authorization': `Bearer ${this.n8nApiKey}`
        }
      });

      // Extract webhook URL if present
      const webhookUrl = this.extractWebhookUrl(workflowJson, createdWorkflow.id);

      return {
        success: true,
        workflowId: createdWorkflow.id,
        webhookUrl,
        workflowName: createdWorkflow.name
      };
    } catch (error) {
      console.error('N8N deployment error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async llmCall(prompt) {
    try {
      const response = await this.llm.chat({ 
        model: process.env.OLLAMA_MODEL || 'llama2',
        messages: [{ role: 'user', content: prompt }],
        stream: false
      });
      return response.message.content;
    } catch (error) {
      console.error('Ollama API call failed:', error);
      throw new Error('Failed to get AI response');
    }
  }

  extractWebhookUrl(workflowJson, workflowId) {
    const webhookNodes = workflowJson.nodes?.filter(
      node => node.type === 'n8n-nodes-base.webhook'
    );

    if (webhookNodes && webhookNodes.length > 0) {
      const path = webhookNodes[0].parameters?.path || workflowId;
      return `${this.n8nBaseUrl}/webhook/${path}`;
    }

    return null;
  }

  // Generate specific workflow templates based on type
  generateWorkflowTemplate(workflowType, businessProfile) {
    const templates = {
      'Email Automation': {
        name: 'Email Automation Workflow',
        nodes: [
          {
            id: 'webhook-trigger',
            type: 'n8n-nodes-base.webhook',
            parameters: {
              path: `email-automation-${businessProfile.user_id}`,
              httpMethod: 'POST'
            }
          },
          {
            id: 'email-sender',
            type: 'n8n-nodes-base.emailSend',
            parameters: {
              fromEmail: 'noreply@exora.com',
              toEmail: '={{ $json.email }}',
              subject: '{{ $json.subject }}',
              message: '{{ $json.message }}'
            }
          }
        ],
        connections: {
          'webhook-trigger': { main: [['email-sender']] }
        }
      },
      'Data Entry Automation': {
        name: 'Data Entry Automation',
        nodes: [
          {
            id: 'webhook-trigger',
            type: 'n8n-nodes-base.webhook',
            parameters: {
              path: `data-entry-${businessProfile.user_id}`,
              httpMethod: 'POST'
            }
          },
          {
            id: 'data-processor',
            type: 'n8n-nodes-base.code',
            parameters: {
              jsCode: `
                const inputData = $input.first().json;
                return {
                  processedData: {
                    ...inputData,
                    processedAt: new Date().toISOString(),
                    userId: ${businessProfile.user_id}
                  }
                };
              `
            }
          }
        ],
        connections: {
          'webhook-trigger': { main: [['data-processor']] }
        }
      },
      'Smart Scheduling': {
        name: 'Smart Scheduling Workflow',
        nodes: [
          {
            id: 'webhook-trigger',
            type: 'n8n-nodes-base.webhook',
            parameters: {
              path: `scheduling-${businessProfile.user_id}`,
              httpMethod: 'POST'
            }
          },
          {
            id: 'calendar-check',
            type: 'n8n-nodes-base.googleCalendar',
            parameters: {
              operation: 'getAll',
              calendar: 'primary'
            }
          }
        ],
        connections: {
          'webhook-trigger': { main: [['calendar-check']] }
        }
      }
    };

    return templates[workflowType] || templates['Email Automation'];
  }

  // Create a complete N8N workflow from template
  createWorkflowFromTemplate(workflowType, businessProfile) {
    const template = this.generateWorkflowTemplate(workflowType, businessProfile);
    
    return {
      name: template.name,
      nodes: template.nodes,
      connections: template.connections,
      active: false,
      settings: {
        timezone: 'Asia/Kuala_Lumpur'
      }
    };
  }
}

module.exports = WorkflowGenerationService;
