const fs = require('fs');
const path = require('path');

class TrainingDataCollector {
  constructor() {
    this.dataFile = path.join(__dirname, '../data/conversations.json');
    this.ensureDataDirectory();
  }

  ensureDataDirectory() {
    const dataDir = path.dirname(this.dataFile);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  collectConversation(userMessage, aiResponse, context = {}) {
    const conversation = {
      timestamp: new Date().toISOString(),
      user_message: userMessage,
      ai_response: aiResponse,
      context: context,
      quality_score: null, // To be filled by human review
      category: this.categorizeMessage(userMessage)
    };

    // Load existing data
    let conversations = [];
    if (fs.existsSync(this.dataFile)) {
      conversations = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
    }

    // Add new conversation
    conversations.push(conversation);

    // Save back to file
    fs.writeFileSync(this.dataFile, JSON.stringify(conversations, null, 2));
    
    console.log(`Collected conversation: ${userMessage.substring(0, 50)}...`);
  }

  categorizeMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('what can you do') || lowerMessage.includes('capabilities')) {
      return 'capabilities_inquiry';
    } else if (lowerMessage.includes('automation') || lowerMessage.includes('workflow')) {
      return 'automation_question';
    } else if (lowerMessage.includes('cost') || lowerMessage.includes('price')) {
      return 'pricing_question';
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return 'greeting';
    } else {
      return 'general_question';
    }
  }

  getTrainingData() {
    if (!fs.existsSync(this.dataFile)) {
      return [];
    }
    return JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
  }

  exportForFineTuning() {
    const conversations = this.getTrainingData();
    
    // Convert to training format
    const trainingData = conversations.map(conv => ({
      instruction: `You are Alex, an AI business consultant. Respond to the user's message.`,
      input: conv.user_message,
      output: conv.ai_response
    }));

    const exportFile = path.join(__dirname, '../data/training_data.jsonl');
    const jsonlData = trainingData.map(item => JSON.stringify(item)).join('\n');
    fs.writeFileSync(exportFile, jsonlData);
    
    console.log(`Exported ${trainingData.length} conversations for fine-tuning`);
    return exportFile;
  }
}

module.exports = TrainingDataCollector;
