const TrainingDataCollector = require('../services/TrainingDataCollector');
const fs = require('fs');
const path = require('path');

class AlexFineTuner {
  constructor() {
    this.trainingCollector = new TrainingDataCollector();
  }

  // Generate synthetic training data
  generateSyntheticData() {
    const syntheticData = [
      {
        user_message: "what can you do for me",
        ai_response: "I can help you with business automation, process optimization, and technology recommendations. I specialize in identifying time-saving opportunities, setting up workflows, and providing advice on tools like N8N, Zapier, and custom automation solutions. What specific challenges are you facing in your business?",
        category: "capabilities_inquiry"
      },
      {
        user_message: "how much does automation cost",
        ai_response: "Automation costs vary depending on complexity and tools. Simple email automation can be free, while enterprise solutions range from $50-500/month. Most businesses see ROI within 3-6 months. I can help you find cost-effective solutions for your specific needs. What type of processes are you looking to automate?",
        category: "pricing_question"
      },
      {
        user_message: "hi there",
        ai_response: "Hello! I'm Alex, your AI business consultant. I'm here to help you discover automation opportunities and optimize your business processes. What brings you here today?",
        category: "greeting"
      },
      {
        user_message: "I need help with my email marketing",
        ai_response: "I'd be happy to help with your email marketing! I can assist with automation workflows, segmentation strategies, and tool recommendations. What specific challenges are you facing? Are you looking to automate follow-ups, segment your audience, or improve deliverability?",
        category: "automation_question"
      },
      {
        user_message: "what tools do you recommend",
        ai_response: "I recommend different tools based on your needs: N8N for complex workflow automation, Zapier for app integrations, HubSpot for CRM automation, Mailchimp for email marketing, and custom solutions for specific business requirements. What type of automation are you most interested in?",
        category: "general_question"
      }
    ];

    // Add synthetic data to training collection
    syntheticData.forEach(data => {
      this.trainingCollector.collectConversation(
        data.user_message, 
        data.ai_response, 
        { category: data.category, synthetic: true }
      );
    });

    console.log(`Added ${syntheticData.length} synthetic training examples`);
  }

  // Export data for LoRA fine-tuning
  exportForLoRA() {
    const conversations = this.trainingCollector.getTrainingData();
    
    // Convert to LoRA format
    const loraData = conversations.map(conv => ({
      instruction: "You are Alex, an AI business consultant. Respond helpfully to the user's message.",
      input: conv.user_message,
      output: conv.ai_response
    }));

    const exportFile = path.join(__dirname, '../data/lora_training_data.json');
    fs.writeFileSync(exportFile, JSON.stringify(loraData, null, 2));
    
    console.log(`Exported ${loraData.length} conversations for LoRA fine-tuning`);
    console.log(`File saved to: ${exportFile}`);
    
    return exportFile;
  }

  // Generate training script
  generateTrainingScript() {
    const script = `#!/bin/bash
# Alex LoRA Fine-tuning Script

# Install dependencies
pip install peft transformers datasets torch

# Prepare data
python -c "
import json
import jsonlines

# Load training data
with open('data/lora_training_data.json', 'r') as f:
    data = json.load(f)

# Convert to JSONL format
with jsonlines.open('data/training_data.jsonl', 'w') as writer:
    for item in data:
        writer.write(item)
"

# Fine-tune with LoRA
python -m peft.lora_tune \\
  --model_name="tinyllama:latest" \\
  --dataset_path="data/training_data.jsonl" \\
  --output_dir="./alex_lora_model" \\
  --num_epochs=3 \\
  --learning_rate=2e-4 \\
  --lora_rank=16 \\
  --lora_alpha=32

echo "Fine-tuning complete! Model saved to ./alex_lora_model"
`;

    const scriptFile = path.join(__dirname, '../scripts/train-alex.sh');
    fs.writeFileSync(scriptFile, script);
    fs.chmodSync(scriptFile, '755');
    
    console.log(`Training script generated: ${scriptFile}`);
    return scriptFile;
  }

  // Run the fine-tuning process
  async runFineTuning() {
    console.log('Starting Alex fine-tuning process...');
    
    // 1. Generate synthetic data
    this.generateSyntheticData();
    
    // 2. Export for LoRA
    const dataFile = this.exportForLoRA();
    
    // 3. Generate training script
    const scriptFile = this.generateTrainingScript();
    
    console.log('\\nNext steps:');
    console.log('1. Run the training script: bash scripts/train-alex.sh');
    console.log('2. Test the fine-tuned model');
    console.log('3. Deploy the improved model');
    
    return { dataFile, scriptFile };
  }
}

// Run if called directly
if (require.main === module) {
  const fineTuner = new AlexFineTuner();
  fineTuner.runFineTuning();
}

module.exports = AlexFineTuner;
