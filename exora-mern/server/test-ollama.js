const { Ollama } = require('ollama');
require('dotenv').config();

// Test Ollama connection and model response
async function testOllama() {
  console.log('🧪 Testing Ollama Integration...\n');

  const ollama = new Ollama({
    baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llama2'
  });

  try {
    // Test 1: Check if Ollama server is running
    console.log('1. Testing Ollama server connection...');
    const response = await fetch(`${process.env.OLLAMA_URL || 'http://localhost:11434'}/v1/models`);
    
    if (!response.ok) {
      throw new Error(`Ollama server not responding: ${response.status}`);
    }
    
    const models = await response.json();
    console.log('✅ Ollama server is running');
    console.log(`📋 Available models: ${models.data.map(m => m.id).join(', ')}\n`);

    // Test 2: Test basic chat functionality
    console.log('2. Testing basic chat functionality...');
    const chatResponse = await ollama.chat({
      model: process.env.OLLAMA_MODEL || 'llama2',
      messages: [
        {
          role: 'user',
          content: 'Hello! Please respond with "Ollama integration is working!" and nothing else.'
        }
      ],
      stream: false
    });

    console.log('✅ Chat functionality working');
    console.log(`🤖 Model response: ${chatResponse.message.content}\n`);

    // Test 3: Test business discovery prompt
    console.log('3. Testing business discovery prompt...');
    const discoveryPrompt = `
You are Alex, a friendly AI business consultant. A user just said: "I run a small retail business selling handmade crafts online."

Respond with a JSON object containing:
{
  "message": "Your conversational response",
  "currentPhase": "Phase 1: Business Overview",
  "discoveredInfo": {
    "industry": "retail",
    "businessSize": "small"
  },
  "nextQuestions": ["What types of crafts do you sell?", "How many orders do you process per week?"],
  "isComplete": false
}
`;

    const discoveryResponse = await ollama.chat({
      model: process.env.OLLAMA_MODEL || 'llama2',
      messages: [{ role: 'user', content: discoveryPrompt }],
      stream: false
    });

    console.log('✅ Business discovery prompt working');
    console.log(`🎯 Discovery response: ${discoveryResponse.message.content.substring(0, 200)}...\n`);

    // Test 4: Test workflow generation prompt
    console.log('4. Testing workflow generation prompt...');
    const workflowPrompt = `
Generate a simple N8N workflow recommendation for a small retail business.

Respond with a JSON array containing one workflow object:
[{
  "name": "Order Processing Automation",
  "description": "Automate order processing and customer notifications",
  "nodesRequired": ["Webhook", "Email", "Database"],
  "triggerType": "webhook",
  "expectedImpact": "Save 2 hours daily",
  "setupComplexity": 3,
  "priority": 85
}]
`;

    const workflowResponse = await ollama.chat({
      model: process.env.OLLAMA_MODEL || 'llama2',
      messages: [{ role: 'user', content: workflowPrompt }],
      stream: false
    });

    console.log('✅ Workflow generation prompt working');
    console.log(`⚙️ Workflow response: ${workflowResponse.message.content.substring(0, 200)}...\n`);

    console.log('🎉 All Ollama tests passed! The integration is ready to use.');
    console.log('\n📝 Next steps:');
    console.log('1. Start your application: npm run dev');
    console.log('2. Sign up as a business user');
    console.log('3. Test the complete discovery flow');

  } catch (error) {
    console.error('❌ Ollama test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure Ollama is installed: curl -fsSL https://ollama.ai/install.sh | sh');
    console.log('2. Pull a model: ollama pull llama2');
    console.log('3. Start Ollama server: ollama serve --port 11434');
    console.log('4. Check if server is running: curl http://localhost:11434/v1/models');
    process.exit(1);
  }
}

// Run the test
testOllama();

