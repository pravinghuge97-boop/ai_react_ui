import api from './client'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
const SERVER_BASE = API_BASE.replace(/\/api\/?$/, '')

export const resolveMediaUrl = (path) => {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  if (path.startsWith('/')) return `${SERVER_BASE}${path}`
  return `${SERVER_BASE}/${path}`
}

export const authApi = {
  login: (payload) => api.post('/auth/login/', payload),
}

export const dashboardApi = {
  summary: () => api.get('/dashboard/summary/'),
}

export const leadsApi = {
  list: () => api.get('/leads/'),
  create: (payload) => api.post('/leads/', payload),
  update: (id, payload) => api.put(`/leads/${id}/`, payload),
  remove: (id) => api.delete(`/leads/${id}/`),
}

export const callApi = {
  start: (lead_id, ai_provider = 'gemini') => api.post('/call/start/', { lead_id, ai_provider }),
  logs: () => api.get('/call/logs/'),
  chat: (lead_id) => api.post('/call/ai-chat/', { lead_id }),
  startConversation: (lead_id) => api.post('/call/conversation/start/', { lead_id }),
  sendConversationMessage: (session_id, user_message) => api.post('/call/conversation/message/', { session_id, user_message }),
}

export const uploadApi = {
  session: (token) => api.get(`/uploads/public/session/${token}/`),
  submitPublic: (formData) => api.post('/uploads/public/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
}
