-- Remove ai_model field from user-facing configs
-- AI model is configured in n8n by admins, not by users

-- Update WhatsApp module config schema (business settings only)
UPDATE automation_modules 
SET config_schema = '{
    "properties": {
        "instance_name": {
            "type": "string", 
            "title": "Instance Name",
            "description": "Your Evolution API instance name"
        },
        "auto_reply": {
            "type": "boolean", 
            "title": "Auto Reply",
            "default": true,
            "description": "Automatically reply to messages using AI"
        }
    }
}'::jsonb
WHERE module_key = 'whatsapp';

-- Update AI Agent module config schema (business prompts only)
UPDATE automation_modules 
SET config_schema = '{
    "properties": {
        "system_prompt": {
            "type": "string", 
            "title": "System Prompt",
            "default": "You are a helpful assistant.",
            "description": "Instructions for the AI about how to behave"
        },
        "temperature": {
            "type": "number", 
            "minimum": 0, 
            "maximum": 2, 
            "title": "Creativity (Temperature)",
            "default": 0.7,
            "description": "Higher values make responses more creative"
        },
        "max_tokens": {
            "type": "integer", 
            "title": "Max Response Length",
            "default": 500,
            "description": "Maximum number of tokens in response"
        }
    }
}'::jsonb
WHERE module_key = 'ai_agent';

-- Update RAG Agent module config schema (business knowledge base only)
UPDATE automation_modules 
SET config_schema = '{
    "properties": {
        "index_name": {
            "type": "string", 
            "title": "Knowledge Base Name",
            "description": "Name of your document collection"
        },
        "top_k": {
            "type": "integer", 
            "default": 3, 
            "title": "Context Documents",
            "description": "Number of relevant documents to retrieve"
        }
    }
}'::jsonb
WHERE module_key = 'rag_agent';

-- Remove ai_model from existing user configs (if any)
UPDATE automation_configs
SET config_data = config_data - 'ai_model'
WHERE module_key IN ('whatsapp', 'ai_agent', 'rag_agent')
  AND config_data ? 'ai_model';

-- Verify updates
SELECT module_key, name, config_schema
FROM automation_modules
WHERE module_key IN ('whatsapp', 'ai_agent', 'rag_agent');

