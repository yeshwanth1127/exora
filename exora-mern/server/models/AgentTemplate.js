const { pool } = require('../config/db');

class AgentTemplate {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.category = data.category;
    this.icon = data.icon;
    this.features = data.features;
    this.pricingTier = data.pricing_tier;
    this.usageType = data.usage_type;
    this.isActive = data.is_active;
    this.createdAt = data.created_at;
  }

  // Get all active templates
  static async findAll() {
    try {
      const query = `
        SELECT id, name, description, category, icon, features, pricing_tier, usage_type, is_active, created_at
        FROM agent_templates
        WHERE is_active = TRUE
        ORDER BY category, name
      `;
      
      const result = await pool.query(query);
      return result.rows.map(row => new AgentTemplate(row));
    } catch (error) {
      throw error;
    }
  }

  // Get templates by usage type
  static async findByUsageType(usageType) {
    try {
      const query = `
        SELECT id, name, description, category, icon, features, pricing_tier, usage_type, is_active, created_at
        FROM agent_templates
        WHERE usage_type = $1 AND is_active = TRUE
        ORDER BY category, name
      `;
      
      const result = await pool.query(query, [usageType]);
      return result.rows.map(row => new AgentTemplate(row));
    } catch (error) {
      throw error;
    }
  }

  // Get templates by category
  static async findByCategory(category) {
    try {
      const query = `
        SELECT id, name, description, category, icon, features, pricing_tier, usage_type, is_active, created_at
        FROM agent_templates
        WHERE category = $1 AND is_active = TRUE
        ORDER BY name
      `;
      
      const result = await pool.query(query, [category]);
      return result.rows.map(row => new AgentTemplate(row));
    } catch (error) {
      throw error;
    }
  }

  // Get template by ID
  static async findById(id) {
    try {
      const query = `
        SELECT id, name, description, category, icon, features, pricing_tier, usage_type, is_active, created_at
        FROM agent_templates
        WHERE id = $1 AND is_active = TRUE
      `;
      
      const result = await pool.query(query, [id]);
      return result.rows.length > 0 ? new AgentTemplate(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  toSafeObject() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      icon: this.icon,
      features: this.features,
      pricingTier: this.pricingTier,
      usageType: this.usageType,
      isActive: this.isActive,
      createdAt: this.createdAt
    };
  }
}

module.exports = AgentTemplate;

