import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login(username, password)              { return api.post('/auth/login', { username, password }) },
  register(userData)                     { return api.post('/auth/register', userData) },
  forgotPassword(username)               { return api.post('/auth/forgot-password', { username }) },
  resetPasswordByCode(username, code, password) {
    return api.post('/auth/reset-password', { username, code, password })
  },
  me()                                   { return api.get('/auth/me') },
  logout()                               { return api.post('/auth/logout') },
  changePassword(currentPassword, newPassword) {
    return api.put('/auth/change-password', { currentPassword, newPassword })
  },
  setPassword(token, password)           { return api.post('/auth/set-password', { token, password }) }
}

export const ticketsAPI = {
  create(ticketData)  { return api.post('/tickets', ticketData) },
  getAll(params)      { return api.get('/tickets', { params }) },
  getById(id)         { return api.get(`/tickets/${id}`) },
  cancel(id)          { return api.delete(`/tickets/${id}`) }
}

export const queueAPI = {
  getQueue(departmentId)    { return api.get('/queue', { params: { departmentId } }) },
  getCurrent(departmentId)  { return api.get('/queue/current', { params: { departmentId } }) },
  getServing()              { return api.get('/queue/serving') },
  callNext(departmentId)    { return api.post('/queue/call-next', { departmentId }) },
  complete(id, notes)       { return api.put(`/queue/${id}/complete`, { notes }) },
  getHistory(params)        { return api.get('/queue/history', { params }) },
  skip(id)                  { return api.put(`/queue/${id}/skip`) }
}

export const analyticsAPI = {
  getToday(departmentId)              { return api.get('/analytics/today', { params: { departmentId } }) },
  getPeriod(startDate, endDate, departmentId) {
    return api.get('/analytics/period', { params: { startDate, endDate, departmentId } })
  },
  export(params)                      { return api.get('/analytics/export', { params }) },
  exportReport(startDate, endDate)    { return api.get('/analytics/export', { params: { startDate, endDate } }) }
}

export const adminAPI = {
  getStaff()            { return api.get('/users') },
  updateStaff(id, data) { return api.put(`/users/${id}`, data) },
  deleteStaff(id)       { return api.delete(`/users/${id}`) }
}

export const printAPI = {
  printTicket(ticketData) { return api.post('/print/ticket', ticketData) }
}

export default api