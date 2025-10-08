# 🔐 Environment Variables Setup

## Required Environment Variables

Add these to your `server/.env` file:

```bash
# ==============================================
# Google OAuth 2.0 Configuration
# ==============================================
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=https://your-backend-domain.com/api/activation/oauth2/callback

# ==============================================
# n8n API Configuration
# ==============================================
N8N_BASE_URL=https://n8n.example.com
N8N_API_KEY=your-n8n-api-key-here

# ==============================================
# Frontend Configuration
# ==============================================
FRONTEND_URL=https://app.example.com
```

## Step-by-Step Configuration

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen if prompted
6. Choose application type: **Web application**
7. Add authorized redirect URI: `https://your-backend-domain.com/api/activation/oauth2/callback`
   - ⚠️ Must match exactly what you set in `GOOGLE_REDIRECT_URI`
   - For local dev: `http://localhost:5000/api/activation/oauth2/callback`
8. Copy the **Client ID** and **Client Secret**

### 2. n8n API Key

1. Log into your n8n instance as admin
2. Go to **Settings** → **API**
3. Enable API access
4. Generate or copy your API key
5. Test it works:
   ```bash
   curl -H "X-N8N-API-KEY: your-key" "https://n8n.example.com/api/v1/workflows"
   ```

### 3. Frontend URL

Set this to your frontend application's URL where users will be redirected after OAuth:
- Production: `https://app.exora.solutions`
- Development: `http://localhost:5173` or `http://localhost:3000`

## Security Notes

- **Never commit `.env` file to version control**
- Use strong, unique values for all secrets
- In production, use HTTPS for all URLs
- Rotate API keys regularly
- Use environment-specific configurations

## Testing Configuration

```bash
# Test Google OAuth endpoints
curl https://accounts.google.com/.well-known/openid-configuration

# Test n8n API connection
curl -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_BASE_URL/api/v1/workflows"

# Check environment variables are loaded
node -e "require('dotenv').config(); console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...');"
```

