# Business Discovery & N8N Integration Setup Guide

This guide will help you set up the new Business Discovery feature with LangChain and N8N integration using Ollama for local AI processing.

## Prerequisites

1. **PostgreSQL Database** - Ensure your database is running
2. **N8N Instance** - Running N8N workflow automation platform
3. **Ollama** - Local AI model server for LangChain functionality

## Setup Steps

### 1. Database Setup

Run the updated schema to create the new tables:

```bash
cd server
psql -U postgres -d exora-web -f schema-dashboard.sql
```

This will create:
- `business_discovery_sessions` - Tracks user discovery conversations
- `business_profiles` - Stores discovered business information
- `workflow_recommendations` - AI-generated workflow suggestions

### 2. Ollama Setup

Install and configure Ollama:

```bash
# Install Ollama (if not already installed)
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model (recommended: llama2 or codellama)
ollama pull llama2

# Start Ollama server
ollama serve --port 11434
```

Verify Ollama is running:
```bash
curl http://localhost:11434/v1/models
```

### 3. Environment Configuration

Copy the environment example and configure:

```bash
cd server
cp env.example .env
```

Update `.env` with your configuration:

```env
# Database
PGHOST=127.0.0.1
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=exora-web

# JWT Secret
JWT_SECRET=your_secure_jwt_secret_here

# Ollama Configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# N8N Configuration
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key_here
```

### 4. Install Dependencies

Install the new LangChain and Ollama dependencies:

```bash
cd server
npm install
```

### 5. N8N Setup

1. **Start N8N** (if not already running):
   ```bash
   npx n8n
   ```

2. **Get N8N API Key**:
   - Go to N8N settings
   - Navigate to "Personal Access Tokens"
   - Create a new token
   - Copy the token to your `.env` file

3. **Verify N8N API Access**:
   ```bash
   curl -H "Authorization: Bearer YOUR_N8N_API_KEY" http://localhost:5678/api/v1/workflows
   ```

### 6. Start the Application

```bash
# Terminal 1 - Ollama Server
ollama serve --port 11434

# Terminal 2 - Backend
cd server
npm run dev

# Terminal 3 - Frontend
cd client
npm run dev
```

## User Journey

### For Business Users

1. **Sign Up** → User creates account with "Business Use" selected
2. **Redirect** → Automatically redirected to `/get-started` (Business Discovery)
3. **AI Discovery** → Chat with Alex (AI consultant) to discover business needs
4. **Workflow Generation** → AI generates N8N workflow recommendations
5. **Deployment** → User approves workflows, automatically deployed to N8N
6. **Dashboard** → View active automations and manage them

### For Personal Users

1. **Sign Up** → User creates account with "Personal Use" selected
2. **Redirect** → Automatically redirected to `/personal-dashboard`
3. **Personal Tools** → Access personal AI assistants and tools

## API Endpoints

### Discovery Routes (`/api/discovery`)

- `POST /start-session` - Start new discovery session
- `POST /process-message` - Process user message with AI
- `POST /generate-workflows` - Generate workflow recommendations
- `POST /deploy-workflow` - Deploy workflow to N8N
- `GET /recommendations` - Get user's workflow recommendations
- `GET /session/:sessionId` - Get session details
- `POST /complete-session` - Mark session as complete

## Features

### AI Business Discovery
- **Conversational Interface** - Natural chat with AI consultant "Alex"
- **Progressive Discovery** - 5-phase discovery process
- **Industry-Specific** - Tailored questions based on business type
- **Pain Point Identification** - Identifies automation opportunities

### N8N Integration
- **Automatic Workflow Generation** - AI creates N8N workflows
- **One-Click Deployment** - Deploy workflows directly to N8N
- **Webhook Management** - Automatic webhook URL generation
- **Workflow Templates** - Pre-built templates for common use cases

### Workflow Types
- **Email Automation** - Automated email sequences
- **Data Entry Automation** - Eliminate manual data entry
- **Smart Scheduling** - Automated appointment booking
- **Lead Qualification** - Automated lead scoring
- **Inventory Management** - Stock tracking and alerts

## Troubleshooting

### Common Issues

1. **Ollama Connection Issues**
   - Verify Ollama server is running: `curl http://localhost:11434/v1/models`
   - Check if model is installed: `ollama list`
   - Ensure Ollama is accessible on the configured port
   - Check Ollama logs for errors

2. **Model Performance Issues**
   - Try different models: `ollama pull codellama` or `ollama pull mistral`
   - Increase system memory if responses are slow
   - Check model compatibility with your hardware

3. **N8N Connection Issues**
   - Verify N8N is running on correct port
   - Check API key permissions
   - Ensure N8N API is enabled

4. **Database Errors**
   - Run schema updates
   - Check database permissions
   - Verify table creation

### Debug Mode

Enable debug logging:

```env
NODE_ENV=development
DEBUG=exora:*
```

## Security Considerations

1. **API Keys** - Store securely, never commit to version control
2. **JWT Secrets** - Use strong, unique secrets
3. **Database Access** - Limit database user permissions
4. **N8N Security** - Secure N8N instance with proper authentication

## Monitoring

### Key Metrics to Monitor
- Discovery session completion rates
- Workflow deployment success rates
- N8N workflow execution status
- User engagement with AI consultant
- Ollama model response times

### Logs to Watch
- Ollama API response times and errors
- N8N deployment errors
- Database query performance
- User session analytics
- Model performance metrics

## Next Steps

1. **Test the Complete Flow** - Sign up as business user and complete discovery
2. **Customize Workflows** - Add industry-specific workflow templates
3. **Monitor Performance** - Track AI responses and user satisfaction
4. **Scale Infrastructure** - Prepare for increased usage
5. **Model Optimization** - Experiment with different Ollama models for better performance

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review application logs
3. Test individual components (Ollama, N8N, Database)
4. Contact development team with specific error messages
