const { pool } = require('../config/db');

class Waitlist {
  /**
   * Add a new user to the waitlist
   * @param {Object} userData - User data (first_name, last_name, email, phone, country_code)
   * @returns {Object} Created waitlist entry
   */
  static async create({ first_name, last_name, email, phone = null, country_code = '+91' }) {
    try {
      const query = `
        INSERT INTO waitlist (first_name, last_name, email, phone, country_code)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const values = [first_name, last_name, email.toLowerCase(), phone, country_code];
      const result = await pool.query(query, values);
      
      return result.rows[0];
    } catch (error) {
      // Check for duplicate email
      if (error.code === '23505') {
        throw new Error('Email already registered in waitlist');
      }
      throw error;
    }
  }

  /**
   * Check if email exists in waitlist
   * @param {string} email 
   * @returns {boolean}
   */
  static async emailExists(email) {
    const query = 'SELECT id FROM waitlist WHERE email = $1';
    const result = await pool.query(query, [email.toLowerCase()]);
    return result.rows.length > 0;
  }

  /**
   * Get all waitlist entries (for admin purposes)
   * @param {number} limit - Number of entries to fetch
   * @param {number} offset - Offset for pagination
   * @returns {Array} Waitlist entries
   */
  static async getAll(limit = 100, offset = 0) {
    const query = `
      SELECT id, first_name, last_name, email, phone, country_code, created_at
      FROM waitlist
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  /**
   * Get total count of waitlist entries
   * @returns {number}
   */
  static async getCount() {
    const query = 'SELECT COUNT(*) as count FROM waitlist';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }

  /**
   * Delete a waitlist entry by email (for admin purposes)
   * @param {string} email 
   * @returns {boolean}
   */
  static async deleteByEmail(email) {
    const query = 'DELETE FROM waitlist WHERE email = $1 RETURNING *';
    const result = await pool.query(query, [email.toLowerCase()]);
    return result.rows.length > 0;
  }
}

module.exports = Waitlist;

