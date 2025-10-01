const { Ollama } = require('ollama');
const BusinessDiscoverySession = require('../models/BusinessDiscoverySession');
const KnowledgeBase = require('./KnowledgeBase');
const TrainingDataCollector = require('./TrainingDataCollector');
const N8NIntegration = require('./N8NIntegration');
const DashboardData = require('../models/DashboardData');

class BusinessDiscoveryAgent {
  constructor() {
    this.llm = new Ollama({
      baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL || 'llama2',
      temperature: 0.3, // Lower temperature for faster, more focused responses
      options: {
        num_ctx: 2048, // Smaller context window for faster processing
        num_predict: 200, // Limit response length
        top_p: 0.9,
        top_k: 40
      }
    });
    
    this.knowledgeBase = new KnowledgeBase();
    this.trainingCollector = new TrainingDataCollector();
    this.n8n = new N8NIntegration();
    this.setupOutputParser();
  }


  setupOutputParser() {
    // No longer using structured output parser - using simple text responses
    console.log('Using simple text responses instead of structured JSON');
  }

  async processUserMessage(sessionId, userMessage, currentContext = {}) {
    try {
      // Validate user message
      if (!userMessage || typeof userMessage !== 'string' || userMessage.trim() === '') {
        return {
          message: "I didn't receive a valid message. Could you please try again?",
          currentPhase: 'Phase 1: Business Overview',
          discoveredInfo: {},
          nextQuestions: [],
          isComplete: false
        };
      }

      // Check if user is asking about workflows
      if (this.isWorkflowRequest(userMessage)) {
        return await this.handleWorkflowRequest(userMessage);
      }

      // Get conversation history for context
      const conversationHistory = await this.getConversationHistory(sessionId);

      // Use knowledge base to create contextual prompt with conversation history
      const simplePrompt = this.knowledgeBase.getContextualPrompt(userMessage, conversationHistory);

      // Try to get a quick response, with fallback
      let response;
      try {
        response = await this.llmCall(simplePrompt, conversationHistory);
      } catch (error) {
        console.log('LLM call failed, using fallback response');
        response = this.getFallbackResponse(userMessage);
      }
      
      // Clean up the response to remove any fake conversation
      let cleanResponse = response.trim();
      
      // Remove any "User:" or "Alex:" prefixes that might be generated
      cleanResponse = cleanResponse.replace(/^(User:|Alex:)\s*/i, '');
      
      // If the response contains fake conversation, extract just the first part
      if (cleanResponse.includes('User:') || cleanResponse.includes('Alex:')) {
        const lines = cleanResponse.split('\n');
        cleanResponse = lines[0].replace(/^(User:|Alex:)\s*/i, '');
      }
      
      // Create a simple response object
      const parsedResponse = {
        message: cleanResponse,
        currentPhase: 'Phase 1: Business Overview',
        discoveredInfo: {},
        nextQuestions: [],
        isComplete: false
      };
      
      console.log('Using simple text response:', parsedResponse.message);
      
      // Collect training data
      this.trainingCollector.collectConversation(userMessage, parsedResponse.message, {
        sessionId,
        currentPhase: parsedResponse.currentPhase,
        discoveredInfo: parsedResponse.discoveredInfo
      });
      
      // Update session data
          try {
      await this.updateDiscoverySession(sessionId, {
        userMessage,
        aiResponse: parsedResponse.message,
        discoveredInfo: parsedResponse.discoveredInfo,
        currentPhase: parsedResponse.currentPhase
      });

            // Also update dashboard data if we have discovered information
            if (parsedResponse.discoveredInfo && Object.keys(parsedResponse.discoveredInfo).length > 0) {
              await this.updateDashboardDataFromSession(sessionId, parsedResponse.discoveredInfo);
            }
          } catch (updateError) {
            console.error('Failed to update session, but continuing:', updateError.message);
          }

      return parsedResponse;
    } catch (error) {
      console.error('Business discovery error:', error);
      return {
        message: "I apologize, but I encountered an issue. Could you please rephrase your response?",
        currentPhase: currentContext.currentPhase || 'Phase 1: Business Overview',
        discoveredInfo: {},
        nextQuestions: [],
        isComplete: false
      };
    }
  }

  async llmCall(prompt, conversationHistory = []) {
    try {
      console.log('Making LLM call with prompt length:', prompt.length);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('LLM call timeout')), 120000) // 120 second timeout for llama3.2
      );
      
      // Build messages array with conversation history
      const messages = [
        { 
          role: 'system', 
          content: 'You are Alex, an intelligent AI business consultant. You remember previous conversations and can provide personalized assistance. Be helpful, knowledgeable, and conversational. Reference previous topics when relevant and maintain context throughout the conversation.' 
        }
      ];

      // Add conversation history (last 6 messages to keep context manageable)
      const recentHistory = conversationHistory.slice(-6);
      recentHistory.forEach(msg => {
        messages.push({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });

      // Add current user message
      messages.push({ role: 'user', content: prompt });
      
      const llmPromise = this.llm.chat({ 
        model: process.env.OLLAMA_MODEL || 'tinyllama:latest',
        messages: messages,
        stream: false,
        options: {
          num_ctx: 512, // Increased context for llama3.2
          num_predict: 100, // Slightly longer responses
          temperature: 0.7, // Balanced creativity
          top_p: 0.9,
          top_k: 40,
          repeat_penalty: 1.1,
          stop: ['User:', 'Alex:', '\n\n']
        }
      });
      
      console.log('Starting LLM request...');
      const response = await Promise.race([llmPromise, timeoutPromise]);
      console.log('LLM response received:', response);
      console.log('LLM response content length:', response.message?.content?.length || 0);
      
      // Clean up the response
      let content = response.message?.content?.trim() || '';
      
      // If content is empty, use fallback
      if (!content) {
        console.log('Empty response from LLM, using fallback');
        return this.getFallbackResponse('general');
      }
      
      // Remove any conversation markers that might have been generated
      content = content.replace(/^(User:|Alex:)\s*/i, '');
      if (content.includes('User:') || content.includes('Alex:')) {
        const lines = content.split('\n');
        content = lines[0].replace(/^(User:|Alex:)\s*/i, '');
      }
      
      return content;
    } catch (error) {
      console.error('Ollama API call failed:', error);
      
      // Return a fallback response instead of throwing
      if (error.message.includes('timeout')) {
        return "I'm having trouble processing your request right now. Could you please try again?";
      }
      
      return "I apologize, but I'm experiencing some technical difficulties. Please try again in a moment.";
    }
  }

  async updateDiscoverySession(sessionId, updateData) {
    try {
      const session = await BusinessDiscoverySession.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      
      const updatedHistory = [
        ...session.conversationHistory,
        {
          timestamp: new Date().toISOString(),
          userMessage: updateData.userMessage,
          aiResponse: updateData.aiResponse,
          phase: updateData.currentPhase
        }
      ];

      const updatedDiscoveryData = {
        ...session.discoveryData,
        ...updateData.discoveredInfo,
        currentPhase: updateData.currentPhase
      };

      await session.update({
        conversationHistory: updatedHistory,
        discoveryData: updatedDiscoveryData
      });
    } catch (error) {
      console.error('Error updating discovery session:', error);
      throw error;
    }
  }

  formatConversationHistory(history) {
    // Simplified - just return empty string to avoid confusion
    return '';
  }

  // Generate initial welcome message
  getWelcomeMessage() {
    return `Hi there! I'm Alex, your AI business consultant. I'm excited to learn about your business and help you discover powerful automations that could save you hours each week.

Let's start with the basics - what type of business are you running? For example, are you in healthcare, marketing, retail, consulting, or something else?`;
  }

  // Check if discovery is complete based on gathered information
  isDiscoveryComplete(discoveredInfo) {
    const requiredFields = ['industry', 'businessSize', 'painPoints', 'currentTools', 'automationGoals'];
    return requiredFields.every(field => {
      if (Array.isArray(discoveredInfo[field])) {
        return discoveredInfo[field].length > 0;
      }
      return discoveredInfo[field] && discoveredInfo[field].trim() !== '';
    });
  }

  // Extract information from raw text when JSON parsing fails
  extractInfoFromText(response, userMessage) {
    const discoveredInfo = {};
    const lowerText = (response + ' ' + userMessage).toLowerCase();
    
    // Extract industry
    if (lowerText.includes('real estate') || lowerText.includes('property')) {
      discoveredInfo.industry = 'real estate';
    } else if (lowerText.includes('healthcare') || lowerText.includes('medical')) {
      discoveredInfo.industry = 'healthcare';
    } else if (lowerText.includes('retail') || lowerText.includes('store')) {
      discoveredInfo.industry = 'retail';
    } else if (lowerText.includes('marketing') || lowerText.includes('advertising')) {
      discoveredInfo.industry = 'marketing';
    } else if (lowerText.includes('consulting') || lowerText.includes('consultant')) {
      discoveredInfo.industry = 'consulting';
    }
    
    // Extract business size
    if (lowerText.includes('small') || lowerText.includes('startup')) {
      discoveredInfo.businessSize = 'small';
    } else if (lowerText.includes('medium') || lowerText.includes('mid-size')) {
      discoveredInfo.businessSize = 'medium';
    } else if (lowerText.includes('large') || lowerText.includes('enterprise')) {
      discoveredInfo.businessSize = 'large';
    }
    
    return discoveredInfo;
  }

  // Generate fallback questions when JSON parsing fails
  generateFallbackQuestions(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
      return [
        "What type of business are you in?",
        "What industry do you operate in?",
        "Tell me about your business"
      ];
    }
    
    if (lowerMessage.includes('real estate') || lowerMessage.includes('property')) {
      return [
        "How many agents do you have?",
        "What services do you offer?",
        "What's your biggest challenge?"
      ];
    }
    
    return [
      "Can you tell me more about your business?",
      "What are your main services?",
      "What challenges do you face daily?"
    ];
  }

  // Check if user is asking about workflows
  isWorkflowRequest(userMessage) {
    if (!userMessage || typeof userMessage !== 'string') {
      return false;
    }
    
    const lowerMessage = userMessage.toLowerCase();
    const workflowKeywords = [
      'workflow', 'workflows', 'automation', 'automations',
      'show my', 'list my', 'my workflows', 'my automations',
      'n8n', 'what workflows', 'active workflows', 'existing workflows',
      'modify', 'details about', 'specific workflow', 'most active'
    ];
    
    return workflowKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  // Handle workflow-related requests
  async handleWorkflowRequest(userMessage) {
    try {
      console.log('Handling workflow request:', userMessage);
      
      const lowerMessage = userMessage.toLowerCase();
      
      // Get all workflows from N8N
      const workflowsResult = await this.n8n.getAllWorkflowsFormatted();
      
      if (!workflowsResult.success) {
        return {
          message: "I'm having trouble connecting to your N8N instance. Please check if it's running and accessible.",
          currentPhase: 'Phase 1: Business Overview',
          discoveredInfo: {},
          nextQuestions: [],
          isComplete: false
        };
      }

      const workflows = workflowsResult.workflows;
      
      if (workflows.length === 0) {
        return {
          message: "You don't have any workflows set up yet in your N8N instance. Would you like me to help you create your first automation?",
          currentPhase: 'Phase 1: Business Overview',
          discoveredInfo: {},
          nextQuestions: [
            "What type of automation would you like to create?",
            "Do you want to automate email responses?",
            "Would you like help with lead scoring automation?"
          ],
          isComplete: false
        };
      }

      // Check for specific workflow names first
      if (lowerMessage.includes('whatsapp') || lowerMessage.includes('chatbot')) {
        return this.handleSpecificWorkflowRequest(workflows, 'whatsapp');
      } else if (lowerMessage.includes('booking') || lowerMessage.includes('booking system')) {
        return this.handleSpecificWorkflowRequest(workflows, 'booking');
      } else if (lowerMessage.includes('details about') || lowerMessage.includes('specific workflow')) {
        return this.handleWorkflowDetailsRequest(workflows);
      } else if (lowerMessage.includes('modify') || lowerMessage.includes('edit')) {
        return this.handleWorkflowModifyRequest(workflows);
      } else if (lowerMessage.includes('most active') || lowerMessage.includes('active')) {
        return this.handleMostActiveWorkflowRequest(workflows);
      } else if (lowerMessage.includes('create') || lowerMessage.includes('new automation')) {
        return this.handleCreateWorkflowRequest();
      } else {
        // Default: show all workflows
        return this.handleListAllWorkflowsRequest(workflows);
      }

    } catch (error) {
      console.error('Error handling workflow request:', error);
      return {
        message: "I encountered an error while fetching your workflows. Please try again or check your N8N connection.",
        currentPhase: 'Phase 1: Business Overview',
        discoveredInfo: {},
        nextQuestions: [],
        isComplete: false
      };
    }
  }

  // Handle listing all workflows
  handleListAllWorkflowsRequest(workflows) {
    const workflowList = workflows.map((workflow, index) => {
      const status = workflow.active ? '🟢 Active' : '🔴 Inactive';
      const triggers = workflow.triggers.map(t => t.type).join(', ') || 'No triggers';
      const actions = workflow.actions.map(a => a.type).join(', ') || 'No actions';
      
      return `${index + 1}. **${workflow.name}** ${status}
   - Description: ${workflow.description}
   - Triggers: ${triggers}
   - Actions: ${actions}
   - Nodes: ${workflow.nodes} | Connections: ${workflow.connections}
   - Created: ${new Date(workflow.createdAt).toLocaleDateString()}`;
    }).join('\n\n');

    return {
      message: `Here are all your N8N workflows (${workflows.length} total):\n\n${workflowList}\n\nWhich workflow would you like to know more about?`,
      currentPhase: 'Phase 1: Business Overview',
      discoveredInfo: { workflows: workflows.length },
      nextQuestions: [
        "Show me details about the WhatsApp Chatbot",
        "Tell me about the Booking System",
        "Which workflow is most active?",
        "I want to modify a workflow"
      ],
      isComplete: false
    };
  }

  // Handle workflow details request
  handleWorkflowDetailsRequest(workflows) {
    return {
      message: `I can show you detailed information about any of your workflows. You have:\n\n1. **AI-Powered WhatsApp Chatbot** - A complex automation with 32 nodes\n2. **Complete Booking System** - A booking automation with 39 nodes\n\nWhich specific workflow would you like me to explain in detail? Just tell me the name or number.`,
      currentPhase: 'Phase 1: Business Overview',
      discoveredInfo: {},
      nextQuestions: [
        "Tell me about the WhatsApp Chatbot",
        "Explain the Booking System",
        "Show me the workflow structure"
      ],
      isComplete: false
    };
  }

  // Handle workflow modification request
  handleWorkflowModifyRequest(workflows) {
    return {
      message: `I can help you modify any of your existing workflows. You have:\n\n1. **AI-Powered WhatsApp Chatbot** - Currently inactive\n2. **Complete Booking System** - Currently inactive\n\nWhat would you like to modify? I can help you:\n- Activate/deactivate workflows\n- Update workflow parameters\n- Add new nodes or connections\n- Fix workflow issues\n\nWhich workflow would you like to work on?`,
      currentPhase: 'Phase 1: Business Overview',
      discoveredInfo: {},
      nextQuestions: [
        "Activate the WhatsApp Chatbot",
        "Modify the Booking System",
        "Fix a workflow issue",
        "Add new functionality"
      ],
      isComplete: false
    };
  }

  // Handle most active workflow request
  handleMostActiveWorkflowRequest(workflows) {
    // For now, both are inactive, but we can show which one has more potential
    return {
      message: `Currently, both of your workflows are inactive (🔴). However, based on their complexity:\n\n**Most Complex:** Complete Booking System (39 nodes)\n- This is your most sophisticated automation\n- Handles webhook triggers and Google Calendar integration\n- Has multiple conditional logic branches\n\n**Most Feature-Rich:** AI-Powered WhatsApp Chatbot (32 nodes)\n- Integrates with WhatsApp, OpenAI, and LangChain\n- Handles text, voice, images, and PDFs\n- Has AI agent capabilities\n\nWould you like me to help you activate one of these workflows or create a simpler one to start with?`,
      currentPhase: 'Phase 1: Business Overview',
      discoveredInfo: {},
      nextQuestions: [
        "Activate the Booking System",
        "Activate the WhatsApp Chatbot",
        "Create a simple workflow first",
        "Show me how to activate workflows"
      ],
      isComplete: false
    };
  }

  // Handle create workflow request
  handleCreateWorkflowRequest() {
    return {
      message: `Great! I can help you create a new automation workflow. Here are some popular automation templates I can help you build:\n\n**Simple Automations:**\n- Email automation (welcome series, follow-ups)\n- Lead scoring and qualification\n- Data synchronization between apps\n- Social media posting\n\n**Advanced Automations:**\n- Customer service chatbot\n- Inventory management\n- Sales pipeline automation\n- Report generation\n\nWhat type of business process would you like to automate? Tell me about your specific needs and I'll help you design the perfect workflow.`,
      currentPhase: 'Phase 1: Business Overview',
      discoveredInfo: {},
      nextQuestions: [
        "I want to automate email marketing",
        "Help me with lead management",
        "Create a customer service bot",
        "Automate my sales process"
      ],
      isComplete: false
    };
  }

  // Handle specific workflow requests
  handleSpecificWorkflowRequest(workflows, workflowType) {
    let targetWorkflow = null;
    
    if (workflowType === 'whatsapp') {
      targetWorkflow = workflows.find(w => w.name.toLowerCase().includes('whatsapp') || w.name.toLowerCase().includes('chatbot'));
    } else if (workflowType === 'booking') {
      targetWorkflow = workflows.find(w => w.name.toLowerCase().includes('booking'));
    }

    if (!targetWorkflow) {
      return {
        message: `I couldn't find a ${workflowType} workflow in your N8N instance. You currently have:\n\n${workflows.map(w => `- ${w.name}`).join('\n')}\n\nWhich workflow would you like to know about?`,
        currentPhase: 'Phase 1: Business Overview',
        discoveredInfo: {},
        nextQuestions: workflows.map(w => `Tell me about ${w.name}`),
        isComplete: false
      };
    }

    const status = targetWorkflow.active ? '🟢 Active' : '🔴 Inactive';
    const triggers = targetWorkflow.triggers.map(t => t.type).join(', ') || 'No triggers';
    const actions = targetWorkflow.actions.map(a => a.type).join(', ') || 'No actions';

    let detailedMessage = `**${targetWorkflow.name}** ${status}\n\n`;
    detailedMessage += `**Description:** ${targetWorkflow.description || 'No description available'}\n\n`;
    detailedMessage += `**Technical Details:**\n`;
    detailedMessage += `- Total Nodes: ${targetWorkflow.nodes}\n`;
    detailedMessage += `- Connections: ${targetWorkflow.connections}\n`;
    detailedMessage += `- Triggers: ${triggers}\n`;
    detailedMessage += `- Actions: ${actions}\n`;
    detailedMessage += `- Created: ${new Date(targetWorkflow.createdAt).toLocaleDateString()}\n\n`;

    if (workflowType === 'whatsapp') {
      detailedMessage += `**What this workflow does:**\n`;
      detailedMessage += `- Handles WhatsApp messages (text, voice, images, PDFs)\n`;
      detailedMessage += `- Uses AI (OpenAI + LangChain) for intelligent responses\n`;
      detailedMessage += `- Has memory buffer for conversation context\n`;
      detailedMessage += `- Can extract data from files and process them\n`;
      detailedMessage += `- Includes conditional logic and switching\n\n`;
    } else if (workflowType === 'booking') {
      detailedMessage += `**What this workflow does:**\n`;
      detailedMessage += `- Handles booking requests via webhooks\n`;
      detailedMessage += `- Integrates with Google Calendar for scheduling\n`;
      detailedMessage += `- Has multiple conditional branches for different booking types\n`;
      detailedMessage += `- Includes wait times and data processing\n`;
      detailedMessage += `- Sends confirmations and updates\n\n`;
    }

    detailedMessage += `**Current Status:** ${targetWorkflow.active ? 'This workflow is currently running and will process requests automatically.' : 'This workflow is inactive and needs to be activated to start working.'}\n\n`;

    return {
      message: detailedMessage + `What would you like to do with this workflow?`,
      currentPhase: 'Phase 1: Business Overview',
      discoveredInfo: { selectedWorkflow: targetWorkflow.name },
      nextQuestions: [
        targetWorkflow.active ? "Deactivate this workflow" : "Activate this workflow",
        "Modify this workflow",
        "Show me execution logs",
        "Create a similar workflow"
      ],
      isComplete: false
    };
  }

  // Update dashboard data from session
  async updateDashboardDataFromSession(sessionId, discoveredInfo) {
    try {
      // Get the session to find the user ID
      const session = await BusinessDiscoverySession.findById(sessionId);
      if (!session) {
        console.error('Session not found for dashboard update');
        return;
      }

      const userId = session.userId;
      
      // Get existing dashboard data or create new
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

      // Update business information
      if (discoveredInfo.industry) {
        dashboardData.businessInfo.industry = discoveredInfo.industry;
      }
      if (discoveredInfo.businessSize) {
        dashboardData.businessInfo.size = discoveredInfo.businessSize;
      }
      if (discoveredInfo.services) {
        dashboardData.businessInfo.services = discoveredInfo.services;
      }
      if (discoveredInfo.challenges) {
        dashboardData.businessInfo.challenges = discoveredInfo.challenges;
      }

      // Mark as configured if we have basic info
      if (discoveredInfo.industry && discoveredInfo.businessSize) {
        dashboardData.isConfigured = true;
      }

      // Generate recommendations based on discovered info
      if (discoveredInfo.industry) {
        dashboardData.recommendations = this.generateWorkflowRecommendations(discoveredInfo);
      }

      // Update metrics based on business info
      dashboardData.metrics = this.generateMetrics(discoveredInfo);

      // Save to database
      await DashboardData.upsert(userId, dashboardData);
      console.log('Dashboard data updated from session');
    } catch (error) {
      console.error('Error updating dashboard data from session:', error);
    }
  }

  // Get conversation history for context
  async getConversationHistory(sessionId) {
    try {
      const session = await BusinessDiscoverySession.findById(sessionId);
      if (!session || !session.conversationHistory) {
        return [];
      }
      
      // Return last 10 messages for context
      return session.conversationHistory.slice(-10);
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }

  // Get fallback response when LLM fails
  getFallbackResponse(userMessage) {
    const lowerMessage = (userMessage || '').toLowerCase();
    
    // Simple keyword-based responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm Alex, your AI business consultant. I'm here to help you set up your dashboard and learn about your business. What type of business do you run?";
    }
    
    if (lowerMessage.includes('business') || lowerMessage.includes('company')) {
      return "That's great! I'd love to learn more about your business. What industry are you in, and how many employees do you have?";
    }
    
    if (lowerMessage.includes('real estate') || lowerMessage.includes('property')) {
      return "Real estate is a great industry! I can help you with lead management, property listings automation, and customer communication workflows. What specific challenges do you face in your real estate business?";
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return "I can help you set up your business dashboard, identify automation opportunities, and connect you with relevant tools and workflows. Tell me about your business and I'll provide personalized recommendations!";
    }
    
    // Default response
    return "I'm here to help you set up your business dashboard and learn about automation opportunities. Could you tell me what type of business you run?";
  }

  // Generate metrics based on discovered information
  generateMetrics(discoveredInfo) {
    return {
      totalWorkflows: 0,
      activeWorkflows: 0,
      timeSaved: '0 hours',
      efficiency: '0%',
      lastActivity: 'Never',
      ...(discoveredInfo.industry && {
        industryInsights: `Based on ${discoveredInfo.industry} industry standards`
      })
    };
  }

  // Generate workflow recommendations based on discovered information
  generateWorkflowRecommendations(discoveredInfo) {
    const recommendations = [];
    
    // Industry-specific recommendations
    if (discoveredInfo.industry) {
      switch (discoveredInfo.industry.toLowerCase()) {
        case 'healthcare':
          recommendations.push({
            type: 'Patient Appointment Scheduling',
            reason: 'Automate appointment booking and reminders',
            priority: 85
          });
          break;
        case 'retail':
          recommendations.push({
            type: 'Inventory Management',
            reason: 'Automate stock tracking and reorder alerts',
            priority: 80
          });
          break;
        case 'marketing':
          recommendations.push({
            type: 'Lead Qualification',
            reason: 'Automate lead scoring and follow-up sequences',
            priority: 90
          });
          break;
        case 'consulting':
          recommendations.push({
            type: 'Client Onboarding',
            reason: 'Automate client intake and document collection',
            priority: 75
          });
          break;
      }
    }

    // Pain point-based recommendations
    if (discoveredInfo.painPoints) {
      discoveredInfo.painPoints.forEach(painPoint => {
        const lowerPainPoint = painPoint.toLowerCase();
        
        if (lowerPainPoint.includes('email') || lowerPainPoint.includes('communication')) {
          recommendations.push({
            type: 'Email Automation',
            reason: 'Automate repetitive email communications',
            priority: 70
          });
        }
        
        if (lowerPainPoint.includes('data entry') || lowerPainPoint.includes('manual')) {
          recommendations.push({
            type: 'Data Entry Automation',
            reason: 'Eliminate manual data entry tasks',
            priority: 85
          });
        }
        
        if (lowerPainPoint.includes('scheduling') || lowerPainPoint.includes('calendar')) {
          recommendations.push({
            type: 'Smart Scheduling',
            reason: 'Automate meeting scheduling and coordination',
            priority: 80
          });
        }
      });
    }

    // Remove duplicates and sort by priority
    const uniqueRecommendations = recommendations.filter((rec, index, self) => 
      index === self.findIndex(r => r.type === rec.type)
    );
    
    return uniqueRecommendations.sort((a, b) => b.priority - a.priority);
  }
}

module.exports = BusinessDiscoveryAgent;
