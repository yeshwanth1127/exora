const axios = require('axios');

const N8N_WEBHOOK_BASE_URL = process.env.N8N_WEBHOOK_BASE_URL || 'http://localhost:5679/webhook';

/**
 * Trigger n8n webhook
 */
async function triggerN8NWebhook(webhookName, data) {
  try {
    const url = `${N8N_WEBHOOK_BASE_URL}/${webhookName}`;
    console.log(`[n8n] Triggering webhook: ${url}`);
    
    const response = await axios.post(url, data, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log(`[n8n] Webhook ${webhookName} triggered successfully`);
    return response.data;
  } catch (error) {
    console.error(`[n8n] Webhook ${webhookName} failed:`, error.message);
    throw error;
  }
}

module.exports = {
  triggerN8NWebhook
};

