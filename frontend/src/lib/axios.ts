import axios from 'axios'
import { logger } from '@/lib/logger'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

function requestId() {
  return Math.random().toString(36).slice(2, 10)
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  config.headers['X-Request-ID'] = requestId()
  logger.debug(`→ ${config.method?.toUpperCase()} ${config.url}`)
  return config
})

api.interceptors.response.use(
  (res) => {
    logger.debug(`← ${res.status} ${res.config.url}`)
    return res
  },
  async (error) => {
    const original = error.config
    const status = error.response?.status

    logger.warn(`✗ ${status} ${original?.url}`, error.response?.data)

    if (status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post('/api/auth/refresh/', { refresh })
          localStorage.setItem('access_token', data.access)
          localStorage.setItem('refresh_token', data.refresh)
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  }
)

export default api
