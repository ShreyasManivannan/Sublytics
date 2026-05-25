import api from './axios'

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  googleLogin: (token) => api.post('/auth/google', { token }),
  getProfile: () => api.get('/auth/profile'),
}

export const subscriptionsAPI = {
  getAll: (params) => api.get('/subscriptions', { params }),
  getById: (id) => api.get(`/subscriptions/${id}`),
  create: (data) => api.post('/subscriptions', data),
  update: (id, data) => api.put(`/subscriptions/${id}`, data),
  remove: (id) => api.delete(`/subscriptions/${id}`),
  getStats: () => api.get('/subscriptions/stats'),
  scanInvoice: (data) => api.post('/subscriptions/scan', data),
}

export const analyticsAPI = {
  getMonthly: () => api.get('/analytics/monthly'),
  getCategories: () => api.get('/analytics/categories'),
  getYearly: () => api.get('/analytics/yearly'),
  getTrends: () => api.get('/analytics/trends'),
}

export const gmailAPI = {
  getStatus: () => api.get('/gmail/status'),
  connect: () => api.get('/gmail/connect'),
  fetchInvoices: () => api.post('/gmail/fetch-invoices'),
}

export const notificationsAPI = {
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (data) => api.put('/notifications/preferences', data),
  testEmail: () => api.post('/notifications/test-email'),
  testSMS: () => api.post('/notifications/test-sms'),
}
