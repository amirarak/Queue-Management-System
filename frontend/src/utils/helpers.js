/**
 * Форматирование времени
 */
export function formatTime(date) {
  return new Date(date).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * Форматирование даты
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

/**
 * Генерация уникального ID
 */
export function generateId() {
  return Date.now() + Math.random().toString(36).substr(2, 9)
}

/**
 * Задержка (для асинхронных операций)
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Проверка статуса билета
 */
export function isTicketWaiting(ticket) {
  return ticket.status === 'waiting'
}

export function isTicketServing(ticket) {
  return ticket.status === 'serving'
}

export function isTicketCompleted(ticket) {
  return ticket.status === 'completed'
}