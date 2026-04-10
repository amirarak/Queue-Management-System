import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { queueAPI, ticketsAPI } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'

export const useQueueStore = defineStore('queue', () => {
  const tickets       = ref([])
  const currentTicket = ref(null)
  const calledTickets = ref([])
  const loading       = ref(false)
  const error         = ref(null)

  const waitingTickets = computed(() => tickets.value.filter(t => t.status === 'waiting'))
  const currentDate    = computed(() => new Date().toLocaleDateString('ru-RU'))
  const completedCount = computed(() => calledTickets.value.filter(t => t.status === 'completed').length)

  function getScopedDepartmentId() {
    const authStore = useAuthStore()
    if (authStore.user?.role === 'staff') return authStore.user?.departmentId || null
    return null
  }

  async function fetchQueue(departmentId = undefined) {
    try {
      const scopedDepartmentId = departmentId !== undefined ? departmentId : getScopedDepartmentId()
      const res = await queueAPI.getQueue(scopedDepartmentId)
      tickets.value = res.data.data.tickets || []
    } catch (e) {
      error.value = e.response?.data?.message || 'Ошибка загрузки очереди'
    }
  }

  async function fetchCurrent(departmentId = undefined) {
    try {
      const scopedDepartmentId = departmentId !== undefined ? departmentId : getScopedDepartmentId()
      const res = await queueAPI.getCurrent(scopedDepartmentId)
      currentTicket.value = res.data.data
    } catch (e) {
      error.value = e.response?.data?.message || 'Ошибка загрузки активного талона'
    }
  }

  async function fetchHistory(departmentId = undefined) {
    try {
      const scopedDepartmentId = departmentId !== undefined ? departmentId : getScopedDepartmentId()
      const params = { limit: 200, ...(scopedDepartmentId ? { departmentId: scopedDepartmentId } : {}) }
      const res = await queueAPI.getHistory(params)
      calledTickets.value = res.data.data || []
    } catch (e) {
      error.value = e.response?.data?.message || 'Ошибка загрузки истории вызовов'
    }
  }

  async function generateTicket(studentName, purposeKey, departmentId, serviceTypeId = null) {
    loading.value = true
    error.value   = null
    try {
      const res = await ticketsAPI.create({
        studentName: studentName || 'Студент',
        purposeKey,
        departmentId,
        serviceTypeId
      })
      const ticket = res.data.data
      tickets.value.push(ticket)
      return ticket
    } catch (e) {
      error.value = e.response?.data?.message || 'Ошибка создания талона'
      return null
    } finally { loading.value = false }
  }

  async function callNextTicket() {
    loading.value = true
    error.value   = null
    try {
      const res    = await queueAPI.callNext()
      const ticket = res.data.data
      currentTicket.value = ticket

      const idx = tickets.value.findIndex(t => t.id === ticket.id)
      if (idx !== -1) tickets.value[idx].status = 'serving'

      await fetchHistory()

      return ticket
    } catch (e) {
      error.value = e.response?.data?.message || 'Нет талонов в очереди'
      return null
    } finally { loading.value = false }
  }

  async function completeTicket(notes = '') {
    if (!currentTicket.value) return
    loading.value = true
    error.value   = null
    try {
      await queueAPI.complete(currentTicket.value.id, notes)
      const idx = tickets.value.findIndex(t => t.id === currentTicket.value.id)
      if (idx !== -1) tickets.value[idx].status = 'completed'
      currentTicket.value = null
      await Promise.all([fetchQueue(), fetchCurrent(), fetchHistory()])
    } catch (e) {
      error.value = e.response?.data?.message || 'Ошибка завершения'
    } finally { loading.value = false }
  }

  async function skipTicket() {
    if (!currentTicket.value) return
    loading.value = true
    error.value   = null
    try {
      await queueAPI.skip(currentTicket.value.id)
      const idx = tickets.value.findIndex(t => t.id === currentTicket.value.id)
      if (idx !== -1) tickets.value[idx].status = 'cancelled'
      currentTicket.value = null
      await Promise.all([fetchQueue(), fetchCurrent(), fetchHistory()])
    } catch (e) {
      error.value = e.response?.data?.message || 'Ошибка пропуска талона'
    } finally {
      loading.value = false
    }
  }


  async function initialize(departmentId = undefined) {
    error.value = null
    await Promise.all([fetchQueue(departmentId), fetchCurrent(departmentId), fetchHistory(departmentId)])
  }

  return {
    tickets, currentTicket, calledTickets, loading, error,
    waitingTickets, currentDate, completedCount,
    initialize, fetchQueue, fetchCurrent, fetchHistory,
    generateTicket, callNextTicket, completeTicket, skipTicket
  }
})