import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useQueueStore = defineStore('queue', () => {
  // ======================
  // STATE 
  // ======================
  const tickets = ref([])
  const currentTicket = ref(null)
  const lastTicketNumber = ref(0)
  const calledTickets = ref([])
  const completedTickets = ref([])
  const departmentName = ref('Учебная часть')

  // ======================
  // GETTERS
  // ======================
  const waitingTickets = computed(() => {
    return Array.isArray(tickets.value)
      ? tickets.value.filter(t => t.status === 'waiting')
      : []
  })

  const nextTicket = computed(() => {
    return waitingTickets.value.length > 0
      ? waitingTickets.value[0]
      : null
  })

  const currentDate = computed(() =>
    new Date().toLocaleDateString('ru-RU')
  )

  // ======================
  // ACTIONS
  // ======================
  function generateTicket(studentName, purpose) {
    const newTicketNumber = lastTicketNumber.value + 1

    const newTicket = {
      id: Date.now(),
      number: newTicketNumber,
      studentName: studentName || 'Без имени',
      purpose: purpose || '—',
      status: 'waiting',
      timestamp: new Date().toLocaleTimeString('ru-RU'),
      createdAt: Date.now()
    }

    tickets.value.push(newTicket)
    lastTicketNumber.value = newTicketNumber

    return newTicket
  }

  function callNextTicket() {
    if (waitingTickets.value.length === 0) return null

    const next = waitingTickets.value[0]
    currentTicket.value = { ...next }

    const index = tickets.value.findIndex(t => t.id === next.id)
    if (index !== -1) {
      tickets.value[index].status = 'serving'
    }

    calledTickets.value.unshift({ ...next })
    if (calledTickets.value.length > 5) {
      calledTickets.value.pop()
    }

    return next
  }

  function completeTicket() {
    if (!currentTicket.value) return

    const index = tickets.value.findIndex(
      t => t.id === currentTicket.value.id
    )

    if (index !== -1) {
      tickets.value[index].status = 'completed'
    }

    completedTickets.value.push({ ...currentTicket.value })
    currentTicket.value = null
  }

  // ======================
  // PERSISTENCE 
  // ======================
  watch(
    [tickets, lastTicketNumber, calledTickets, completedTickets],
    () => {
      localStorage.setItem(
        'queue-store',
        JSON.stringify({
          tickets: tickets.value,
          lastTicketNumber: lastTicketNumber.value,
          calledTickets: calledTickets.value,
          completedTickets: completedTickets.value
        })
      )
    },
    { deep: true }
  )

  function loadFromStorage() {
    const saved = localStorage.getItem('queue-store')
    if (!saved) return

    const data = JSON.parse(saved)
    tickets.value = data.tickets || []
    lastTicketNumber.value = data.lastTicketNumber || 0
    calledTickets.value = data.calledTickets || []
    completedTickets.value = data.completedTickets || []
  }

  loadFromStorage()

  return {
    // STATE
    tickets,
    currentTicket,
    lastTicketNumber,
    calledTickets,
    completedTickets,
    departmentName,

    // GETTERS
    waitingTickets,
    nextTicket,
    currentDate,

    // ACTIONS
    generateTicket,
    callNextTicket,
    completeTicket
  }
})
