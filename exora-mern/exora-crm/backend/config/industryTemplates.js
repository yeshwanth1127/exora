/**
 * Industry Templates for Universal CRM
 * Configures labels, stages, and fields based on business type
 */

const INDUSTRY_TEMPLATES = {
  healthcare: {
    name: "Healthcare & Clinics",
    contact_label: "Patient",
    contact_label_plural: "Patients",
    staff_label: "Doctor/Staff",
    staff_label_plural: "Medical Staff",
    opportunity_label: "Appointment",
    opportunity_label_plural: "Appointments",
    recommended_automations: ['whatsapp', 'ai_agent', 'calendar', 'sms'],
    default_configs: {
      whatsapp: { auto_reply: true },
      ai_agent: { 
        system_prompt: 'You are a medical clinic assistant. Be professional, empathetic, and HIPAA-compliant.',
        temperature: 0.3,
        max_tokens: 500
      },
      calendar: { default_duration: 30 },
      sms: {}
    },
    pipeline_stages: [
      { key: "scheduled", label: "Scheduled", color: "#3B82F6", order: 1 },
      { key: "confirmed", label: "Confirmed", color: "#10B981", order: 2 },
      { key: "inprogress", label: "In Progress", color: "#8B5CF6", order: 3 },
      { key: "completed", label: "Completed", color: "#6B7280", order: 4 },
      { key: "noshow", label: "No-Show", color: "#F59E0B", order: 5 },
      { key: "cancelled", label: "Cancelled", color: "#EF4444", order: 6 }
    ],
    custom_fields: [
      { key: "birth_date", type: "date", label: "Birth Date", required: true },
      { key: "medical_history", type: "textarea", label: "Medical History", required: false },
      { key: "insurance", type: "string", label: "Insurance Provider", required: false },
      { key: "allergies", type: "textarea", label: "Allergies", required: false }
    ],
    features: {
      whatsapp: true,
      telegram: true,
      calendar: true,
      email: true,
      reminders: true,
      confirmations: true
    },
    notification_settings: {
      notify_admin_on_booking: true,
      notify_staff_on_booking: true,
      reminder_hours_before: 24,
      confirmation_required: true
    }
  },
  
  restaurant: {
    name: "Restaurant & Hospitality",
    contact_label: "Customer",
    contact_label_plural: "Customers",
    staff_label: "Server",
    staff_label_plural: "Servers",
    opportunity_label: "Reservation",
    opportunity_label_plural: "Reservations",
    recommended_automations: ['whatsapp', 'sms', 'calendar', 'chatbot'],
    default_configs: {
      whatsapp: { auto_reply: true },
      sms: {},
      calendar: { default_duration: 120 },
      chatbot: { 
        greeting_message: 'Welcome! Ready to make a reservation?',
        widget_color: '#F59E0B'
      }
    },
    pipeline_stages: [
      { key: "reserved", label: "Reserved", color: "#3B82F6", order: 1 },
      { key: "confirmed", label: "Confirmed", color: "#10B981", order: 2 },
      { key: "seated", label: "Seated", color: "#8B5CF6", order: 3 },
      { key: "dining", label: "Dining", color: "#F59E0B", order: 4 },
      { key: "completed", label: "Completed", color: "#6B7280", order: 5 },
      { key: "cancelled", label: "Cancelled", color: "#EF4444", order: 6 }
    ],
    custom_fields: [
      { key: "dietary_restrictions", type: "textarea", label: "Dietary Restrictions", required: false },
      { key: "table_preference", type: "string", label: "Table Preference", required: false },
      { key: "party_size", type: "number", label: "Party Size", required: true },
      { key: "special_occasion", type: "string", label: "Special Occasion", required: false }
    ],
    features: {
      whatsapp: true,
      telegram: true,
      calendar: true,
      email: true,
      reminders: true,
      confirmations: true
    },
    notification_settings: {
      notify_admin_on_booking: true,
      notify_staff_on_booking: false,
      reminder_hours_before: 4,
      confirmation_required: true
    }
  },
  
  salon: {
    name: "Salon & Beauty",
    contact_label: "Client",
    contact_label_plural: "Clients",
    staff_label: "Stylist",
    staff_label_plural: "Stylists",
    opportunity_label: "Booking",
    opportunity_label_plural: "Bookings",
    recommended_automations: ['whatsapp', 'sms', 'calendar', 'email'],
    default_configs: {
      whatsapp: { auto_reply: true },
      sms: {},
      calendar: { default_duration: 60 },
      email: { signature: 'Thank you for choosing our salon!' }
    },
    pipeline_stages: [
      { key: "booked", label: "Booked", color: "#3B82F6", order: 1 },
      { key: "confirmed", label: "Confirmed", color: "#10B981", order: 2 },
      { key: "inprogress", label: "In Progress", color: "#8B5CF6", order: 3 },
      { key: "completed", label: "Completed", color: "#6B7280", order: 4 },
      { key: "cancelled", label: "Cancelled", color: "#EF4444", order: 5 }
    ],
    custom_fields: [
      { key: "preferred_stylist", type: "string", label: "Preferred Stylist", required: false },
      { key: "service_history", type: "textarea", label: "Service History", required: false },
      { key: "allergies", type: "textarea", label: "Product Allergies", required: false }
    ],
    features: {
      whatsapp: true,
      telegram: true,
      calendar: true,
      email: true,
      reminders: true,
      confirmations: true
    },
    notification_settings: {
      notify_admin_on_booking: true,
      notify_staff_on_booking: true,
      reminder_hours_before: 24,
      confirmation_required: true
    }
  },
  
  sales: {
    name: "Sales & B2B",
    contact_label: "Customer",
    contact_label_plural: "Customers",
    staff_label: "Sales Rep",
    staff_label_plural: "Sales Team",
    opportunity_label: "Deal",
    opportunity_label_plural: "Deals",
    recommended_automations: ['email', 'ai_agent', 'calendar', 'whatsapp'],
    default_configs: {
      email: { signature: 'Best regards,\nYour Sales Team' },
      ai_agent: {
        system_prompt: 'You are a professional sales assistant. Be persuasive yet respectful.',
        temperature: 0.6,
        max_tokens: 600
      },
      calendar: { default_duration: 45 },
      whatsapp: { auto_reply: false }
    },
    pipeline_stages: [
      { key: "lead", label: "Lead", color: "#3B82F6", order: 1 },
      { key: "qualified", label: "Qualified", color: "#8B5CF6", order: 2 },
      { key: "proposal", label: "Proposal", color: "#F59E0B", order: 3 },
      { key: "negotiation", label: "Negotiation", color: "#10B981", order: 4 },
      { key: "won", label: "Won", color: "#22C55E", order: 5 },
      { key: "lost", label: "Lost", color: "#EF4444", order: 6 }
    ],
    custom_fields: [
      { key: "company_name", type: "string", label: "Company Name", required: true },
      { key: "company_size", type: "string", label: "Company Size", required: false },
      { key: "budget", type: "number", label: "Budget", required: false },
      { key: "decision_maker", type: "string", label: "Decision Maker", required: false }
    ],
    features: {
      whatsapp: true,
      telegram: true,
      calendar: true,
      email: true,
      reminders: true,
      confirmations: false
    },
    notification_settings: {
      notify_admin_on_booking: true,
      notify_staff_on_booking: true,
      reminder_hours_before: 48,
      confirmation_required: false
    }
  },
  
  consulting: {
    name: "Consulting & Professional Services",
    contact_label: "Client",
    contact_label_plural: "Clients",
    staff_label: "Consultant",
    staff_label_plural: "Consultants",
    opportunity_label: "Project",
    opportunity_label_plural: "Projects",
    recommended_automations: ['email', 'calendar', 'ai_agent'],
    default_configs: {
      email: { signature: 'Professional regards,\nYour Consulting Team' },
      calendar: { default_duration: 60 },
      ai_agent: {
        system_prompt: 'You are a professional consultant assistant. Provide expert advice.',
        temperature: 0.5,
        max_tokens: 700
      }
    },
    pipeline_stages: [
      { key: "inquiry", label: "Inquiry", color: "#3B82F6", order: 1 },
      { key: "proposal", label: "Proposal", color: "#8B5CF6", order: 2 },
      { key: "active", label: "Active", color: "#10B981", order: 3 },
      { key: "completed", label: "Completed", color: "#6B7280", order: 4 },
      { key: "onhold", label: "On Hold", color: "#F59E0B", order: 5 },
      { key: "cancelled", label: "Cancelled", color: "#EF4444", order: 6 }
    ],
    custom_fields: [
      { key: "industry", type: "string", label: "Industry", required: false },
      { key: "project_type", type: "string", label: "Project Type", required: false },
      { key: "budget", type: "number", label: "Budget", required: false }
    ],
    features: {
      whatsapp: true,
      telegram: true,
      calendar: true,
      email: true,
      reminders: true,
      confirmations: false
    },
    notification_settings: {
      notify_admin_on_booking: true,
      notify_staff_on_booking: true,
      reminder_hours_before: 48,
      confirmation_required: false
    }
  },
  
  general: {
    name: "General Business",
    contact_label: "Contact",
    contact_label_plural: "Contacts",
    staff_label: "Team Member",
    staff_label_plural: "Team Members",
    opportunity_label: "Opportunity",
    opportunity_label_plural: "Opportunities",
    recommended_automations: ['whatsapp', 'email', 'calendar'],
    default_configs: {
      whatsapp: { auto_reply: true },
      email: {},
      calendar: { default_duration: 30 }
    },
    pipeline_stages: [
      { key: "new", label: "New", color: "#3B82F6", order: 1 },
      { key: "inprogress", label: "In Progress", color: "#8B5CF6", order: 2 },
      { key: "completed", label: "Completed", color: "#10B981", order: 3 },
      { key: "cancelled", label: "Cancelled", color: "#EF4444", order: 4 }
    ],
    custom_fields: [],
    features: {
      whatsapp: true,
      telegram: true,
      calendar: true,
      email: true,
      reminders: true,
      confirmations: true
    },
    notification_settings: {
      notify_admin_on_booking: true,
      notify_staff_on_booking: true,
      reminder_hours_before: 24,
      confirmation_required: true
    }
  }
};

function getIndustryTemplate(industry) {
  return INDUSTRY_TEMPLATES[industry] || INDUSTRY_TEMPLATES.general;
}

function getAvailableIndustries() {
  return Object.keys(INDUSTRY_TEMPLATES).map(key => ({
    key: key,
    name: INDUSTRY_TEMPLATES[key].name
  }));
}

module.exports = {
  INDUSTRY_TEMPLATES,
  getIndustryTemplate,
  getAvailableIndustries
};

