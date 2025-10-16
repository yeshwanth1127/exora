const axios = require('axios');
const nodemailer = require('nodemailer');
const { pool } = require('../config/db');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
};

// Create email transporter
let transporter = null;
try {
  transporter = nodemailer.createTransport(SMTP_CONFIG);
} catch (error) {
  console.warn('Email not configured:', error.message);
}

/**
 * Send Telegram message
 */
async function sendTelegram(chatId, message) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('Telegram bot token not configured');
    return false;
  }
  
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });
    return true;
  } catch (error) {
    console.error('Telegram send error:', error.message);
    return false;
  }
}

/**
 * Send email
 */
async function sendEmail(to, subject, text) {
  if (!transporter) {
    console.warn('Email not configured');
    return false;
  }
  
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: to,
      subject: subject,
      text: text
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error.message);
    return false;
  }
}

/**
 * Notify when event is created
 */
async function notifyEventCreated(crmUserId, event, contact) {
  try {
    // Get CRM user settings
    const result = await pool.query('SELECT * FROM crm_users WHERE id = $1', [crmUserId]);
    
    if (result.rows.length === 0) return;
    
    const crmUser = result.rows[0];
    
    const message = `
🔔 New Appointment Scheduled

${contact.name || 'Contact'}
Phone: ${contact.phone || contact.whatsapp_number || 'N/A'}
Time: ${new Date(event.start_time).toLocaleString()}
Service: ${event.title}
    `.trim();
    
    // Send Telegram to admin
    if (crmUser.notify_admin_telegram && crmUser.telegram_chat_id) {
      await sendTelegram(crmUser.telegram_chat_id, message);
    }
    
    // Send Email to admin
    if (crmUser.notify_admin_email && crmUser.admin_email) {
      await sendEmail(
        crmUser.admin_email,
        'New Appointment Scheduled',
        message
      );
    }
    
    // Notify assigned staff
    if (event.assigned_to) {
      const staffResult = await pool.query(
        'SELECT * FROM staff_members WHERE id = $1',
        [event.assigned_to]
      );
      
      if (staffResult.rows.length > 0) {
        const staff = staffResult.rows[0];
        
        if (staff.notify_telegram && staff.telegram_chat_id) {
          await sendTelegram(staff.telegram_chat_id, message);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Notification error:', error);
    return false;
  }
}

module.exports = {
  sendTelegram,
  sendEmail,
  notifyEventCreated
};

