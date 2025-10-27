// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://emailtracker-backend-api.onrender.com';

export const API_ENDPOINTS = {
  // Auth endpoints
  register: `${API_BASE_URL}/api/auth/register`,
  login: `${API_BASE_URL}/api/auth/login`,
  
  // Email endpoints
  sendEmail: `${API_BASE_URL}/api/email/send`,
  getUserEmails: (userId) => `${API_BASE_URL}/api/email/user/${userId}`,
  
  // Template endpoints
  createTemplate: `${API_BASE_URL}/api/templates/create`,
  getUserTemplates: (userId) => `${API_BASE_URL}/api/templates/user/${userId}`,
  updateTemplate: (id) => `${API_BASE_URL}/api/templates/${id}`,
  deleteTemplate: (id) => `${API_BASE_URL}/api/templates/${id}`,
  updateUsage: (id) => `${API_BASE_URL}/api/templates/usage/${id}`,
};

export default API_BASE_URL;
