const { pool } = require('../config/db');

class UserStatistics {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.statType = data.stat_type;
    this.value = parseFloat(data.value);
    this.unit = data.unit;
    this.period = data.period;
    this.calculatedAt = data.calculated_at;
  }

  // Get all statistics for a user
  static async findByUserId(userId, period = 'total') {
    try {
      const query = `
        SELECT id, user_id, stat_type, value, unit, period, calculated_at
        FROM user_statistics
        WHERE user_id = $1 AND period = $2
        ORDER BY stat_type
      `;
      
      const result = await pool.query(query, [userId, period]);
      return result.rows.map(row => new UserStatistics(row));
    } catch (error) {
      throw error;
    }
  }

  // Get specific statistic for a user
  static async findByUserAndType(userId, statType, period = 'total') {
    try {
      const query = `
        SELECT id, user_id, stat_type, value, unit, period, calculated_at
        FROM user_statistics
        WHERE user_id = $1 AND stat_type = $2 AND period = $3
      `;
      
      const result = await pool.query(query, [userId, statType, period]);
      return result.rows.length > 0 ? new UserStatistics(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Get dashboard statistics (formatted for frontend)
  static async getDashboardStats(userId) {
    try {
      const stats = await this.findByUserId(userId, 'total');
      
      // Format for dashboard display
      const formattedStats = {
        activeAgents: this.findStatValue(stats, 'active_agents', 0),
        automatedTasks: this.findStatValue(stats, 'automated_tasks', 0),
        timeSaved: this.findStatValue(stats, 'time_saved', 0),
        successRate: this.findStatValue(stats, 'success_rate', 0)
      };

      // Calculate changes (this week vs last week)
      const weeklyStats = await this.findByUserId(userId, 'weekly');
      const changes = {
        activeAgents: this.calculateChange(stats, weeklyStats, 'active_agents'),
        automatedTasks: this.calculateChange(stats, weeklyStats, 'automated_tasks'),
        timeSaved: this.calculateChange(stats, weeklyStats, 'time_saved'),
        successRate: this.calculateChange(stats, weeklyStats, 'success_rate')
      };

      return {
        stats: formattedStats,
        changes: changes,
        lastUpdated: stats.length > 0 ? stats[0].calculatedAt : new Date()
      };
    } catch (error) {
      throw error;
    }
  }

  // Helper method to find stat value
  static findStatValue(stats, statType, defaultValue) {
    const stat = stats.find(s => s.statType === statType);
    return stat ? stat.value : defaultValue;
  }

  // Helper method to calculate percentage change
  static calculateChange(totalStats, weeklyStats, statType) {
    const totalValue = this.findStatValue(totalStats, statType, 0);
    const weeklyValue = this.findStatValue(weeklyStats, statType, 0);
    
    if (weeklyValue === 0) return '+0%';
    
    const change = ((totalValue - weeklyValue) / weeklyValue) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  }

  // Force update statistics for a user
  static async updateUserStatistics(userId) {
    try {
      const query = 'SELECT update_user_statistics($1)';
      await pool.query(query, [userId]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get statistics history for charts
  static async getHistory(userId, statType, days = 30) {
    try {
      const query = `
        SELECT 
          DATE(calculated_at) as date,
          AVG(value) as avg_value,
          MAX(value) as max_value,
          MIN(value) as min_value
        FROM user_statistics
        WHERE user_id = $1 
        AND stat_type = $2 
        AND calculated_at >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE(calculated_at)
        ORDER BY date ASC
      `;
      
      const result = await pool.query(query, [userId, statType]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  toSafeObject() {
    return {
      id: this.id,
      userId: this.userId,
      statType: this.statType,
      value: this.value,
      unit: this.unit,
      period: this.period,
      calculatedAt: this.calculatedAt
    };
  }
}

module.exports = UserStatistics;

