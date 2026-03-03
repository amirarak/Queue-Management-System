import { computed } from 'vue'
import { useQueueStore } from '@/stores/queueStore'

export function useQueue() {
  const store = useQueueStore()

  const playNotificationSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3')
    audio.play().catch(e => console.log('Ошибка воспроизведения звука:', e))
  }

  const speakTicket = (number) => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(
        `Клиент номер ${number}, пройдите к окну обслуживания`
      )
      msg.lang = 'ru-RU'
      window.speechSynthesis.speak(msg)
    }
  }

  const callNextWithSound = async () => {
    const ticket = await store.callNextTicket()
    if (ticket) {
      playNotificationSound()
      speakTicket(ticket.ticketNumber)
    }
    return ticket
  }

  return {
    tickets: computed(() => store.tickets),
    waitingTickets: computed(() => store.waitingTickets),
    currentTicket: computed(() => store.currentTicket),
    calledTickets: computed(() => store.calledTickets),
    loading: computed(() => store.loading),

    generateTicket: store.generateTicket,
    completeTicket: store.completeTicket,
    callNext: callNextWithSound
  }
}