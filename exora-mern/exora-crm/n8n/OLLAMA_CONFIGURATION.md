# Ollama Configuration for n8n Workflow

## 🎯 Key Differences: OpenAI vs Ollama

### **OpenAI API:**
```javascript
// Requires API key credential
URL: https://api.openai.com/v1/chat/completions
Authentication: OpenAI API credential
Body: {
  "model": "gpt-4",
  "messages": [...],
  "temperature": 0.7,
  "max_tokens": 500
}
Response: {
  "choices": [{"message": {"content": "AI response here"}}]
}
```

### **Ollama API:**
```javascript
// No authentication needed (localhost)
URL: http://localhost:11434/api/chat
Authentication: None
Body: {
  "model": "llama3",
  "messages": [...],
  "stream": false,
  "options": {
    "temperature": 0.7,
    "num_predict": 500
  }
}
Response: {
  "message": {"content": "AI response here"}
}
```

---

## 🔧 Ollama-Only Node Configurations

### **1. Call AI (WhatsApp Module)**

```json
{
  "parameters": {
    "url": "http://localhost:11434/api/chat",
    "authentication": "none",
    "method": "POST",
    "sendBody": true,
    "contentType": "json",
    "bodyParameters": {
      "parameters": [
        {
          "name": "model",
          "value": "={{ $json.ai_config.model || 'llama3' }}"
        },
        {
          "name": "messages",
          "value": "={{ JSON.stringify([{role: 'system', content: $json.ai_config.system_prompt}, {role: 'user', content: $json.conversation_history + '\\nCustomer: ' + $json.current_message}]) }}"
        },
        {
          "name": "stream",
          "value": false
        },
        {
          "name": "options",
          "value": "={{ JSON.stringify({temperature: $json.ai_config.temperature, num_predict: $json.ai_config.max_tokens}) }}"
        }
      ]
    }
  },
  "name": "Call AI (Ollama)",
  "type": "n8n-nodes-base.httpRequest"
}
```

**Key Points:**
- URL: `http://localhost:11434/api/chat` (or `http://ollama:11434/api/chat` if Docker)
- Authentication: None
- Model: From user's config (llama3, mistral, etc.)
- Temperature & num_predict in `options` object

---

### **2. AI Agent Call**

```json
{
  "parameters": {
    "url": "http://localhost:11434/api/chat",
    "authentication": "none",
    "method": "POST",
    "sendBody": true,
    "contentType": "json",
    "bodyParameters": {
      "parameters": [
        {
          "name": "model",
          "value": "={{ $json.config.ai_model || 'llama3' }}"
        },
        {
          "name": "messages",
          "value": "={{ JSON.stringify([{role: 'system', content: $json.system_prompt}, {role: 'user', content: $json.user_message}]) }}"
        },
        {
          "name": "stream",
          "value": false
        },
        {
          "name": "options",
          "value": "={{ JSON.stringify({temperature: $json.temperature, num_predict: $json.max_tokens}) }}"
        }
      ]
    }
  },
  "name": "AI Agent Call (Ollama)",
  "type": "n8n-nodes-base.httpRequest"
}
```

---

### **3. RAG AI Call**

```json
{
  "parameters": {
    "url": "http://localhost:11434/api/chat",
    "authentication": "none",
    "method": "POST",
    "sendBody": true,
    "contentType": "json",
    "bodyParameters": {
      "parameters": [
        {
          "name": "model",
          "value": "llama3"
        },
        {
          "name": "messages",
          "value": "={{ JSON.stringify([{role: 'system', content: 'You are a helpful assistant. Use the following context to answer questions accurately:\\n\\nCONTEXT:\\n' + $json.context_text + '\\n\\nPlease answer based on this context.'}, {role: 'user', content: $json.query}]) }}"
        },
        {
          "name": "stream",
          "value": false
        },
        {
          "name": "options",
          "value": "{{ JSON.stringify({temperature: 0.3, num_predict: 800}) }}"
        }
      ]
    }
  },
  "name": "RAG AI Call (Ollama)",
  "type": "n8n-nodes-base.httpRequest"
}
```

---

## 📝 Extract AI Response (Updated for Ollama)

### **Code Node to Extract Response:**

```javascript
// Extract AI response from Ollama format
const data = $input.first().json;
let aiResponse = '';

// Ollama response format
if (data.message && data.message.content) {
  aiResponse = data.message.content;
}
// Fallback for other formats
else if (data.response) {
  aiResponse = data.response;
}
// OpenAI format (if you ever switch back)
else if (data.choices && data.choices[0]) {
  aiResponse = data.choices[0].message.content;
}

const previousData = $node["Prepare AI Context"].json;

return [{
  json: {
    ...previousData,
    ai_response: aiResponse,
    ai_model_used: previousData.ai_config.model || 'llama3',
    ai_provider: 'ollama'
  }
}];
```

---

## 🔧 Configuration in CRM UI

### **Update automation_modules table:**

```sql
-- Update WhatsApp module to use Ollama models
UPDATE automation_modules 
SET config_schema = '{
  "properties": {
    "instance_name": {"type": "string", "title": "Instance Name"},
    "auto_reply": {"type": "boolean", "title": "Auto Reply"},
    "ai_model": {
      "type": "string", 
      "enum": ["llama3", "llama3.1", "llama3.2", "mistral", "mixtral", "phi3", "codellama"], 
      "title": "AI Model",
      "default": "llama3"
    }
  }
}'
WHERE module_key = 'whatsapp';

-- Update AI Agent module
UPDATE automation_modules 
SET config_schema = '{
  "properties": {
    "system_prompt": {"type": "string", "title": "System Prompt"},
    "temperature": {"type": "number", "minimum": 0, "maximum": 2, "title": "Creativity", "default": 0.7},
    "max_tokens": {"type": "integer", "title": "Max Response Length", "default": 500},
    "ai_model": {
      "type": "string",
      "enum": ["llama3", "llama3.1", "llama3.2", "mistral", "mixtral", "phi3"],
      "title": "AI Model",
      "default": "llama3"
    }
  }
}'
WHERE module_key = 'ai_agent';
```

---

## 🚀 Available Ollama Models

### **Install models on your VPS:**

```bash
# Install popular models
ollama pull llama3
ollama pull llama3.1
ollama pull llama3.2
ollama pull mistral
ollama pull mixtral
ollama pull phi3
ollama pull codellama

# Verify installed models
ollama list
```

### **Update Industry Templates:**

```javascript
// backend/config/industryTemplates.js

healthcare: {
  default_configs: {
    whatsapp: { 
      auto_reply: true, 
      ai_model: 'llama3.1'  // ← Changed from 'gpt-4'
    },
    ai_agent: { 
      system_prompt: 'You are a medical clinic assistant...',
      temperature: 0.3,
      max_tokens: 500,
      ai_model: 'llama3.1'  // ← Added
    }
  }
}
```

---

## 🔄 Complete Ollama Node Configuration

### **Call AI (WhatsApp) - Full Version:**

```json
{
  "parameters": {
    "url": "http://localhost:11434/api/chat",
    "authentication": "none",
    "method": "POST",
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={{ JSON.stringify({\n  model: $json.ai_config.model || 'llama3',\n  messages: [{role: 'system', content: $json.ai_config.system_prompt}, {role: 'user', content: $json.conversation_history + '\\nCustomer: ' + $json.current_message}],\n  stream: false,\n  options: {\n    temperature: $json.ai_config.temperature || 0.7,\n    num_predict: $json.ai_config.max_tokens || 500\n  }\n}) }}",
    "options": {}
  },
  "id": "call-ai-ollama",
  "name": "Call AI (Ollama)",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [3040, 60]
}
```

**Alternative using Body Parameters (easier to read):**

```json
{
  "parameters": {
    "url": "http://localhost:11434/api/chat",
    "authentication": "none",
    "method": "POST",
    "sendBody": true,
    "contentType": "json",
    "body": {
      "model": "={{ $json.ai_config.model || 'llama3' }}",
      "messages": "={{ [{role: 'system', content: $json.ai_config.system_prompt}, {role: 'user', content: $json.conversation_history + '\\nCustomer: ' + $json.current_message}] }}",
      "stream": false,
      "options": {
        "temperature": "={{ $json.ai_config.temperature || 0.7 }}",
        "num_predict": "={{ $json.ai_config.max_tokens || 500 }}"
      }
    }
  }
}
```

---

## 📊 Extract AI Response Node (Ollama Format)

### **Code Node After AI Call:**

```javascript
// Extract AI response from Ollama
const data = $input.first().json;
const previousData = $node["Prepare AI Context"].json;

let aiResponse = '';

// Ollama format
if (data.message && data.message.content) {
  aiResponse = data.message.content;
}
// Alternative Ollama format
else if (data.response) {
  aiResponse = data.response;
}
// Fallback
else {
  console.error('Unexpected Ollama response format:', data);
  aiResponse = 'Sorry, I could not generate a response.';
}

return [{
  json: {
    ...previousData,
    ai_response: aiResponse.trim(),
    ai_model_used: previousData.ai_config.model || 'llama3',
    ai_provider: 'ollama',
    ai_raw_response: data
  }
}];
```

---

## 🐳 Docker Configuration

### **If Ollama is in Docker:**

```json
{
  "parameters": {
    "url": "http://ollama:11434/api/chat",  // ← Changed to Docker service name
    "authentication": "none",
    ...
  }
}
```

### **If n8n is in Docker, Ollama on VPS:**

```json
{
  "parameters": {
    "url": "http://host.docker.internal:11434/api/chat",  // ← Access host
    "authentication": "none",
    ...
  }
}
```

---

## 🧪 Testing Ollama Nodes

### **Test 1: Check Ollama is Running**

```bash
# On your VPS
curl http://localhost:11434/api/tags

# Should return:
{
  "models": [
    {"name": "llama3:latest", ...},
    {"name": "mistral:latest", ...}
  ]
}
```

### **Test 2: Test Ollama Chat API**

```bash
curl -X POST http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant"},
      {"role": "user", "content": "Hello, how are you?"}
    ],
    "stream": false,
    "options": {
      "temperature": 0.7,
      "num_predict": 100
    }
  }'

# Should return:
{
  "model": "llama3",
  "created_at": "...",
  "message": {
    "role": "assistant",
    "content": "Hello! I'm doing well, thank you for asking..."
  },
  "done": true
}
```

### **Test 3: Test in n8n**

1. Open your master workflow in n8n
2. Click on "Call AI (Ollama)" node
3. Click **Execute Node**
4. Provide test data:
   ```json
   {
     "ai_config": {
       "model": "llama3",
       "system_prompt": "You are a helpful assistant",
       "temperature": 0.7,
       "max_tokens": 500
     },
     "conversation_history": "",
     "current_message": "Hello, test"
   }
   ```
5. Should return Ollama response

---

## 🎨 Model Selection in CRM UI

### **Users Can Choose Model:**

When configuring WhatsApp or AI Agent in CRM:

```
AI Model: [▼ llama3        ]
  - llama3 (Fast, good for conversations)
  - llama3.1 (More capable, larger)
  - llama3.2 (Latest, best quality)
  - mistral (Fast, efficient)
  - mixtral (Very capable, slower)
  - phi3 (Small, fast)
  - codellama (For code-related tasks)
```

Each industry template sets a default:
- **Healthcare:** llama3.1 (higher quality for medical advice)
- **Restaurant:** llama3 (fast responses)
- **Sales:** mixtral (persuasive, detailed)
- **Consulting:** llama3.1 (professional)

---

## 📦 Complete HTTP Request Node (Ollama)

### **Use this exact configuration in n8n:**

```
Node Type: HTTP Request
Name: Call AI (Ollama)

URL: http://localhost:11434/api/chat
  (or http://ollama:11434/api/chat if Docker)

Method: POST

Authentication: None

Send Body: Yes

Body Content Type: JSON

Specify Body: Using Fields Below

Body Parameters:
┌──────────────┬───────────────────────────────────────────────────┐
│ Name         │ Value                                             │
├──────────────┼───────────────────────────────────────────────────┤
│ model        │ ={{ $json.ai_config.model || 'llama3' }}         │
│ messages     │ ={{ [{role: 'system', content: $json.ai_config.system_prompt}, {role: 'user', content: $json.conversation_history + '\nCustomer: ' + $json.current_message}] }} │
│ stream       │ false                                             │
│ options      │ ={{ {temperature: $json.ai_config.temperature, num_predict: $json.ai_config.max_tokens} }} │
└──────────────┴───────────────────────────────────────────────────┘

Options:
  Response Format: Auto-detect
  Timeout: 30000
```

---

## 🔄 Response Extraction

### **Extract AI Response Node (Code):**

```javascript
// Works for both Ollama and OpenAI
const data = $input.first().json;
const previousData = $node["Prepare AI Context"].json;

let aiResponse = '';
let provider = 'unknown';

// Ollama format
if (data.message && data.message.content) {
  aiResponse = data.message.content;
  provider = 'ollama';
}
// Ollama alternative format
else if (data.response) {
  aiResponse = data.response;
  provider = 'ollama';
}
// OpenAI format (fallback)
else if (data.choices && data.choices[0] && data.choices[0].message) {
  aiResponse = data.choices[0].message.content;
  provider = 'openai';
}
// Error case
else {
  console.error('Could not extract AI response. Raw data:', JSON.stringify(data));
  aiResponse = 'Sorry, I encountered an error generating a response.';
  provider = 'error';
}

return [{
  json: {
    ...previousData,
    ai_response: aiResponse.trim(),
    ai_model_used: previousData.ai_config?.model || 'unknown',
    ai_provider: provider,
    ai_raw_response: data
  }
}];
```

**This code handles both Ollama and OpenAI formats!**

---

## 🎯 Ollama-Specific Features

### **Temperature Range:**

OpenAI: 0 to 1  
Ollama: 0 to 2 (more flexible)

```javascript
// In user's config:
{
  "temperature": 0.8  // Works for both
}

// For Ollama, you can go higher:
{
  "temperature": 1.5  // More creative (Ollama only)
}
```

### **Token Limit:**

OpenAI: `max_tokens`  
Ollama: `num_predict`

```javascript
// In options object:
{
  "options": {
    "num_predict": 500  // Ollama's token limit
  }
}
```

### **Additional Ollama Options:**

```javascript
{
  "options": {
    "temperature": 0.7,
    "num_predict": 500,
    "top_k": 40,         // Ollama-specific
    "top_p": 0.9,        // Ollama-specific
    "repeat_penalty": 1.1 // Ollama-specific
  }
}
```

---

## 🌐 URL Configuration Based on Environment

### **Dynamic URL Selection:**

If you want to support BOTH OpenAI and Ollama:

```javascript
// In HTTP Request node
{
  "url": "={{ $json.ai_model.startsWith('gpt') ? 'https://api.openai.com/v1/chat/completions' : 'http://localhost:11434/api/chat' }}",
  "authentication": "={{ $json.ai_model.startsWith('gpt') ? 'predefinedCredentialType' : 'none' }}",
  ...
}
```

**This checks the model name and chooses the right API!**

But for simplicity, **use Ollama ONLY** as you requested.

---

## ✅ Final Ollama Configuration

### **For Your VPS Setup:**

```
Ollama URL: http://localhost:11434/api/chat

Why localhost?
- Ollama and n8n are on the same VPS
- Ollama listens on localhost:11434
- No authentication needed (local access only)

If Ollama is in Docker:
- URL: http://ollama:11434/api/chat (using Docker service name)
```

### **In Each AI Node:**

1. **URL:** `http://localhost:11434/api/chat`
2. **Authentication:** None
3. **Body Format:**
   ```json
   {
     "model": "llama3",
     "messages": [...],
     "stream": false,
     "options": {
       "temperature": 0.7,
       "num_predict": 500
     }
   }
   ```
4. **Response Path:** `message.content`

---

## 📋 Quick Setup Checklist

- [ ] Ollama installed on VPS
- [ ] Models pulled (ollama pull llama3, mistral, etc.)
- [ ] Test: `curl http://localhost:11434/api/tags`
- [ ] Update all AI nodes in n8n to use Ollama URL
- [ ] Remove OpenAI credential type
- [ ] Set authentication to "None"
- [ ] Update body format to Ollama style
- [ ] Update Extract AI Response node to handle Ollama format
- [ ] Update automation_modules config_schema with Ollama models
- [ ] Update industry templates to use Ollama models
- [ ] Test AI nodes in n8n
- [ ] Verify response extraction works

---

## 🎯 Summary

### **For All AI Nodes:**

```
URL: http://localhost:11434/api/chat
Authentication: None
Model: From user's config (llama3, mistral, etc.)
Temperature: From user's config (0-2)
Max Tokens: From user's config (num_predict)
Response: data.message.content
```

### **No API Keys Needed:**
- ✅ Ollama runs locally on your VPS
- ✅ No external API calls
- ✅ No costs per request
- ✅ Complete privacy
- ✅ Fast responses (local processing)

**All three AI nodes updated in:** `n8n/ai-nodes-ollama-version.json` ✅

