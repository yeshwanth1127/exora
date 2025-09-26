const { pool } = require('../config/db');

class UserNotification {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.type = data.type;
    this.title = data.title;
    this.message = data.message;
    this.isRead = data.is_read;
    this.actionUrl = data.action_url;
    this.createdAt = data.created_at;
    this.readAt = data.read_at;
  }

  // Create a new notification
  static async create({ userId, type, title, message, actionUrl = null }) {
    try {
      const query = `
        INSERT INTO user_notifications (user_id, type, title, message, action_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id, type, title, message, is_read, action_url, created_at, read_at
      `;
      
      const values = [userId, type, title, message, actionUrl];
      const result = await pool.query(query, values);
      
      return new UserNotification(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get notifications for a user
  static async findByUserId(userId, limit = 20, offset = 0) {
    try {
      const query = `
        SELECT id, user_id, type, title, message, is_read, action_url, created_at, read_at
        FROM user_notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await pool.query(query, [userId, limit, offset]);
      return result.rows.map(row => new UserNotification(row));
    } catch (error) {
      throw error;
    }
  }

  // Get unread notifications count
  static async getUnreadCount(userId) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM user_notifications
        WHERE user_id = $1 AND is_read = FALSE
      `;
      
      const result = await pool.query(query, [userId]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead() {
    try {
      const query = `
        UPDATE user_notifications 
        SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING is_read, read_at
      `;
      
      const result = await pool.query(query, [this.id]);
      this.isRead = result.rows[0].is_read;
      this.readAt = result.rows[0].read_at;
      
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId) {
    try {
      const query = `
        UPDATE user_notifications 
        SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND is_read = FALSE
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rowCount;
    } catch (error) {
      throw error;
    }
  }

  // Delete notification
  async delete() {
    try {
      const query = 'DELETE FROM user_notifications WHERE id = $1';
      await pool.query(query, [this.id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get recent activity notifications (for dashboard)
  static async getRecentActivity(userId, limit = 5) {
    try {
      const query = `
        SELECT id, user_id, type, title, message, is_read, action_url, created_at, read_at
        FROM user_notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `;
      
      const result = await pool.query(query, [userId, limit]);
      return result.rows.map(row => new UserNotification(row));
    } catch (error) {
      throw error;
    }
  }

  // Create system notification
  static async createSystemNotification(userId, type, title, message, actionUrl = null) {
    return this.create({
      userId,
      type,
      title,
      message,
      actionUrl
    });
  }

  toSafeObject() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      title: this.title,
      message: this.message,
      isRead: this.isRead,
      actionUrl: this.actionUrl,
      createdAt: this.createdAt,
      readAt: this.readAt
    };
  }
}

module.exports = UserNotification;

