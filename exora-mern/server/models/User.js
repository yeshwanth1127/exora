const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.usageType = data.usage_type;
    this.isVerified = data.is_verified;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Create a new user
  static async create({ email, password, firstName, lastName, usageType = 'business' }) {
    try {
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      const query = `
        INSERT INTO users (email, password_hash, first_name, last_name, usage_type)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, first_name, last_name, usage_type, is_verified, created_at, updated_at
      `;
      
      const values = [email, passwordHash, firstName, lastName, usageType];
      const result = await pool.query(query, values);
      
      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const query = `
        SELECT id, email, password_hash, first_name, last_name, usage_type, is_verified, created_at, updated_at
        FROM users
        WHERE email = $1
      `;
      
      const result = await pool.query(query, [email]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const query = `
        SELECT id, email, password_hash, first_name, last_name, usage_type, is_verified, created_at, updated_at
        FROM users
        WHERE id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Verify password
  async verifyPassword(password) {
    try {
      const query = 'SELECT password_hash FROM users WHERE id = $1';
      const result = await pool.query(query, [this.id]);
      
      if (result.rows.length === 0) {
        return false;
      }
      
      return await bcrypt.compare(password, result.rows[0].password_hash);
    } catch (error) {
      throw error;
    }
  }

  // Generate JWT token
  generateToken() {
    return jwt.sign(
      { 
        id: this.id, 
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );
  }

  // Update user verification status
  async updateVerificationStatus(isVerified) {
    try {
      const query = `
        UPDATE users 
        SET is_verified = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING is_verified
      `;
      
      const result = await pool.query(query, [isVerified, this.id]);
      this.isVerified = result.rows[0].is_verified;
      
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Set verification token
  async setVerificationToken(token) {
    try {
      const query = `
        UPDATE users 
        SET verification_token = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `;
      
      await pool.query(query, [token, this.id]);
    } catch (error) {
      throw error;
    }
  }

  // Find user by verification token
  static async findByVerificationToken(token) {
    try {
      const query = `
        SELECT id, email, password_hash, first_name, last_name, is_verified, created_at, updated_at
        FROM users
        WHERE verification_token = $1
      `;
      
      const result = await pool.query(query, [token]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Convert to safe object (without password)
  toSafeObject() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      usageType: this.usageType,
      isVerified: this.isVerified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = User;
