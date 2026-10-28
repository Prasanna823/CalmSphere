import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('calmsphere_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 responses
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('calmsphere_token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
}

export const preferencesAPI = {
  save: (prefs) => api.post('/api/preferences', prefs),
}

export const chatAPI = {
  send: (message, language) => api.post('/api/chat', { message, language }),
}

export const moodAPI = {
  log: (entry) => api.post('/api/mood', entry),
  history: (days = 7) => api.get(`/api/mood/history?days=${days}`),
  dashboard: () => api.get('/api/dashboard'),
}

export default api
