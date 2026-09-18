const { pool } = require('../config/db');

class ContactInquiry {
  static async create({ name, email, company = null, phone = null, message, source = 'contact_page' }) {
    const query = `
      INSERT INTO contact_inquiries (name, email, company, phone, message, source)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, company, phone, message, source, created_at
    `;
    const values = [
      name.trim(),
      email.trim().toLowerCase(),
      company?.trim() || null,
      phone?.trim() || null,
      message.trim(),
      source || 'contact_page',
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = ContactInquiry;
