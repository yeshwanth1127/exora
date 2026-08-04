import axios from 'axios';

// Production: https://crm.exora.solutions/api (nginx proxies to localhost:8000)
// Development: http://localhost:8000/api
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm.exora.solutions/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('crm_token');
      window.location.href = 'https://exora.solutions/auth';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const validateToken = async (token) => {
  const response = await axios.get(`${API_BASE_URL}/auth/validate`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ==================== INDUSTRY ====================
export const getIndustryTemplates = async () => {
  const response = await api.get('/industry/templates');
  return response.data;
};

export const getIndustryConfig = async () => {
  const response = await api.get('/industry/config');
  return response.data;
};

// ==================== CONTACTS ====================
export const listContacts = async (params = {}) => {
  const response = await api.get('/contacts', { params });
  return response.data;
};

export const getContact = async (id) => {
  const response = await api.get(`/contacts/${id}`);
  return response.data;
};

export const createContact = async (data) => {
  const response = await api.post('/contacts', data);
  return response.data;
};

export const updateContact = async (id, data) => {
  const response = await api.put(`/contacts/${id}`, data);
  return response.data;
};

export const deleteContact = async (id) => {
  const response = await api.delete(`/contacts/${id}`);
  return response.data;
};

// ==================== OPPORTUNITIES ====================
export const listOpportunities = async (params = {}) => {
  const response = await api.get('/opportunities', { params });
  return response.data;
};

export const createOpportunity = async (data) => {
  const response = await api.post('/opportunities', data);
  return response.data;
};

export const updateOpportunityStage = async (id, stage) => {
  const response = await api.put(`/opportunities/${id}/stage`, { stage });
  return response.data;
};

// ==================== EVENTS ====================
export const listEvents = async (params = {}) => {
  const response = await api.get('/events', { params });
  return response.data;
};

export const getUpcomingEvents = async (days = 7) => {
  const response = await api.get('/events/upcoming', { params: { days } });
  return response.data;
};

export const createEvent = async (data) => {
  const response = await api.post('/events', data);
  return response.data;
};

export const updateEvent = async (id, data) => {
  const response = await api.put(`/events/${id}`, data);
  return response.data;
};

export const confirmEvent = async (id) => {
  const response = await api.put(`/events/${id}/confirm`);
  return response.data;
};

export const deleteEvent = async (id) => {
  const response = await api.delete(`/events/${id}`);
  return response.data;
};

// ==================== ACTIVITIES ====================
export const listActivities = async (params = {}) => {
  const response = await api.get('/activities', { params });
  return response.data;
};

export const getConversationHistory = async (contactId) => {
  const response = await api.get(`/activities/conversation/${contactId}`);
  return response.data;
};

export const createActivity = async (data) => {
  const response = await api.post('/activities', data);
  return response.data;
};

// ==================== STAFF ====================
export const listStaff = async () => {
  const response = await api.get('/staff');
  return response.data;
};

export const createStaff = async (data) => {
  const response = await api.post('/staff', data);
  return response.data;
};

// ==================== AUTOMATION HISTORY ====================
export const getAutomationHistory = async (params = {}) => {
  const response = await api.get('/automation-history', { params });
  return response.data;
};

export const getAutomationStats = async (days = 30) => {
  const response = await api.get('/automation-history/stats', { params: { days } });
  return response.data;
};

// ==================== SETUP ====================
export const completeSetup = async (data) => {
  const response = await api.post('/setup/complete', data);
  return response.data;
};

export default api;

