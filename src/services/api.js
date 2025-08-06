import axios from 'axios';

const API_BASE_URL = 'https://backend-amber-tau-14.vercel.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== AUTENTICAÇÃO =====
export const authAPI = {
  login: (username, password) => api.post('/agents/login', { username, password }),
  adminLogin: (username, password) => api.post('/admin/login', { username, password }),
};

// ===== AGENTES =====
export const agentsAPI = {
  getAll: () => api.get('/agents'),
  getById: (id) => api.get(`/agents/${id}`),
  getTickets: (id) => api.get(`/agents/${id}/tickets`),
  create: (data) => api.post('/agents', data),
  toggleStatus: (id, is_active) => api.patch(`/agents/${id}/status`, { is_active }),
  resetPassword: (id) => api.post(`/agents/${id}/reset-password`),
};

// ===== TICKETS/CARTÕES =====
export const ticketsAPI = {
  getAll: () => api.get('/trello-cards'),
  getByLabel: (label) => api.get(`/trello-cards/label/${label}`),
  getByAgent: (agentId) => api.get(`/agents/${agentId}/tickets`),
  create: (data) => api.post('/trello-cards', data),
  update: (id, data) => api.put(`/trello-cards/${id}`, data),
  updateStatus: (id, status) => api.patch(`/tickets/${id}/status`, { status }),
  updateChecklist: (id, checklist) => api.patch(`/tickets/${id}/checklist`, { checklist }),
  
  // Anexos do checklist
  uploadAttachment: (ticketId, formData) => api.post(`/tickets/${ticketId}/checklist/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAttachments: (ticketId) => api.get(`/tickets/${ticketId}/checklist/attachments`),
  deleteAttachment: (ticketId, attachmentId) => api.delete(`/tickets/${ticketId}/checklist/attachments/${attachmentId}`),
  delete: (id) => api.delete(`/trello-cards/${id}`),
};

// ===== ADMINISTRAÇÃO =====
export const adminAPI = {
  getAllTickets: (params = {}) => api.get('/admin/all-tickets', { params }),
  getDashboard: () => api.get('/admin/dashboard'),
  getNewAgentsReport: () => api.get('/admin/new-agents-report'),
  createAdmin: (data) => api.post('/admin/create-admin', data),
  cleanup: (days) => api.post('/admin/cleanup', { days }),
  
  // Gerenciamento de agentes
  getAgents: () => api.get('/agents'),
  createAgent: (name) => api.post('/agents', { name }),
  toggleAgentStatus: (id, is_active) => api.patch(`/agents/${id}/status`, { is_active }),
  resetAgentPassword: (id) => api.post(`/agents/${id}/reset-password`),
  
  // Gerenciamento de usuários (novos endpoints)
  getAllUsers: () => api.get('/admin/all-users'),
  editPassword: (id, newPassword) => api.patch(`/admin/edit-password/${id}`, { newPassword }),
  updateUser: (id, userData) => api.patch(`/admin/update-user/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/delete-user/${id}`),
  toggleUserStatus: (id, is_active) => api.patch(`/admin/toggle-user-status/${id}`, { is_active }),
};

// ===== SINCRONIZAÇÃO =====
export const syncAPI = {
  run: () => api.post('/sync/run'),
  getConfig: () => api.get('/sync/config'),
  getStats: () => api.get('/sync/stats'),
  test: () => api.get('/sync/test'),
};

export default api;