import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user            = ref(null)
  const token           = ref(null)
  const isAuthenticated = ref(false)
  const initialized     = ref(false)
  const loading         = ref(false)
  const error           = ref(null)

  const isAdmin      = computed(() => user.value?.role === 'admin')
  const isStaff      = computed(() => user.value?.role === 'staff')
  const userFullName = computed(() => user.value?.fullName || '')

  async function login(username, password) {
    loading.value = true
    error.value   = null
    try {
      const response = await authAPI.login(username, password)
      const { token: authToken, user: userData } = response.data.data

      token.value           = authToken
      user.value            = userData
      isAuthenticated.value = true

      localStorage.setItem('auth_token', authToken)
      localStorage.setItem('user', JSON.stringify(userData))

      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка входа'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function register(userData) {
    loading.value = true
    error.value   = null
    try {
      await authAPI.register(userData)
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка регистрации'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await authAPI.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      user.value            = null
      token.value           = null
      isAuthenticated.value = false
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  }

  async function checkAuth() {
    if (initialized.value) return

    const savedToken = localStorage.getItem('auth_token')
    const savedUser  = localStorage.getItem('user')

    if (!savedToken || !savedUser) {
      initialized.value = true
      return
    }

    token.value           = savedToken
    user.value            = JSON.parse(savedUser)
    isAuthenticated.value = true


    try {
      const response = await authAPI.me()
      user.value = response.data.data
      localStorage.setItem('user', JSON.stringify(response.data.data))
    } catch (err) {

      user.value            = null
      token.value           = null
      isAuthenticated.value = false
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    } finally {
      initialized.value = true
    }
  }

  return {
    user, token, isAuthenticated, initialized, loading, error,
    isAdmin, isStaff, userFullName,
    login, register, logout, checkAuth
  }
})