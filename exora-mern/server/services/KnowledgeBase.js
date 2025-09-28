class KnowledgeBase {
  constructor() {
    this.knowledge = {
      business_automation: [
        "Customer service automation can reduce response time by 80%",
        "Email automation workflows can save 5-10 hours per week",
        "N8N is a powerful workflow automation tool",
        "Zapier integrates with 5000+ apps for automation"
      ],
      common_questions: {
        "what can you do": "I can help with business automation, process optimization, technology recommendations, and general business advice. I specialize in identifying time-saving opportunities and implementing efficient workflows.",
        "how much does automation cost": "Automation costs vary widely. Simple email automation can be free, while enterprise solutions range from $50-500/month. ROI typically pays for itself within 3-6 months.",
        "what tools do you recommend": "I recommend N8N for workflow automation, Zapier for app integrations, HubSpot for CRM automation, and custom solutions for specific business needs.",
        "show my workflows": "I can show you all your N8N workflows, their status, and execution statistics. Just ask me to list your automations!",
        "list workflows": "I'll fetch and display all your N8N workflows with details about their triggers, actions, and current status.",
        "my automations": "I can show you all your active automations, their performance metrics, and help you manage them."
      },
      conversation_patterns: [
        "When users ask about capabilities, explain specific services",
        "When users mention problems, ask clarifying questions",
        "When users are casual, be friendly and conversational",
        "Always provide actionable advice when possible"
      ]
    };
  }

  findRelevantKnowledge(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    const relevant = [];

    // Check for specific topics
    if (lowerMessage.includes('automation') || lowerMessage.includes('workflow')) {
      relevant.push(...this.knowledge.business_automation);
    }

    // Check for common questions
    for (const [question, answer] of Object.entries(this.knowledge.common_questions)) {
      if (lowerMessage.includes(question)) {
        relevant.push(answer);
      }
    }

    return relevant;
  }

  getContextualPrompt(userMessage, conversationHistory = []) {
    const relevantKnowledge = this.findRelevantKnowledge(userMessage);
    
    let contextPrompt = `You are Alex, an intelligent AI business consultant.`;
    
    if (relevantKnowledge.length > 0) {
      contextPrompt += `\n\nRelevant knowledge for this conversation:\n${relevantKnowledge.join('\n')}`;
    }
    
    // Add conversation history context
    if (conversationHistory.length > 0) {
      contextPrompt += `\n\nPrevious conversation context:\n`;
      conversationHistory.slice(-4).forEach(msg => {
        contextPrompt += `${msg.type === 'user' ? 'User' : 'Alex'}: ${msg.content}\n`;
      });
    }
    
    contextPrompt += `\n\nUser said: "${userMessage}"\n\nRespond as Alex with helpful, contextual information. Remember previous topics and maintain conversation flow.`;
    
    return contextPrompt;
  }
}

module.exports = KnowledgeBase;
