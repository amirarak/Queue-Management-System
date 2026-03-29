import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { queueAPI, ticketsAPI } from '@/services/api'

export const useQueueStore = defineStore('queue', () => {
  const tickets       = ref([])
  const currentTicket = ref(null)
  const calledTickets = ref([])
  const loading       = ref(false)
  const error         = ref(null)

  const waitingTickets = computed(() => tickets.value.filter(t => t.status === 'waiting'))
  const currentDate    = computed(() => new Date().toLocaleDateString('ru-RU'))
  const completedCount = computed(() => tickets.value.filter(t => t.status === 'completed').length)

  async function fetchQueue() {
    try {
      const res = await queueAPI.getQueue()
      tickets.value = res.data.data.tickets || []
    } catch (e) { error.value = 'Ошибка загрузки очереди' }
  }

  async function fetchCurrent() {
    try {
      const res = await queueAPI.getCurrent()
      currentTicket.value = res.data.data
    } catch (e) { console.error(e) }
  }

  async function fetchHistory() {
    try {
      const res = await queueAPI.getHistory({ limit: 5 })
      calledTickets.value = res.data.data || []
    } catch (e) { console.error(e) }
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

      calledTickets.value.unshift(ticket)
      if (calledTickets.value.length > 5) calledTickets.value.pop()

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
    } catch (e) {
      error.value = e.response?.data?.message || 'Ошибка пропуска талона'
    } finally {
      loading.value = false
    }
  }


  async function initialize() {
    await Promise.all([fetchQueue(), fetchCurrent(), fetchHistory()])
  }

  return {
    tickets, currentTicket, calledTickets, loading, error,
    waitingTickets, currentDate, completedCount,
    initialize, fetchQueue, fetchCurrent, fetchHistory,
    generateTicket, callNextTicket, completeTicket, skipTicket
  }
})