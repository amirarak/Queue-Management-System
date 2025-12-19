import { computed } from 'vue'
import { useQueueStore } from '@/stores/queueStore'

export function useQueue() {
  const store = useQueueStore()

  // Вспомогательная функция для звукового уведомления
  const playNotificationSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3')
    audio.play().catch(e => console.log('Ошибка воспроизведения звука:', e))
  }

  // Обертка над вызовом следующего клиента с уведомлением
  const callNextWithSound = () => {
    const ticket = store.callNextTicket()
    if (ticket) {
      playNotificationSound()
      // Можно добавить Speech API здесь, чтобы озвучить номер
      speakTicket(ticket.number)
    }
    return ticket
  }

  // Функция озвучки (Text-to-Speech)
  const speakTicket = (number) => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(`Клиент номер ${number}, пройдите к окну обслуживания`)
      msg.lang = 'ru-RU'
      window.speechSynthesis.speak(msg)
    }
  }

  return {
    // Данные (проксируем из стора)
    tickets: computed(() => store.tickets),
    waitingTickets: computed(() => store.waitingTickets),
    currentTicket: computed(() => store.currentTicket),
    calledTickets: computed(() => store.calledTickets),
    
    // Методы
    generateTicket: store.generateTicket,
    completeTicket: store.completeTicket,
    callNext: callNextWithSound // Используем версию со звуком
  }
}