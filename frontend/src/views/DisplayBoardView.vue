<template>
  <div class="display-board">
    <div class="board-header">
      <div class="header-left">
        <h1 class="board-title">{{ queueStore.departmentName }}</h1>
        <p class="board-subtitle">Электронная очередь</p>
      </div>
      <div class="header-right">
        <div class="time-display">{{ formattedTime }}</div>
        <div class="date-display">{{ formattedDate }}</div>
      </div>
    </div>

    <div class="board-content">
      <div class="current-section">
        <h2 class="section-title">Обслуживается</h2>
        
        <div v-if="queueStore.currentTicket" class="current-ticket">
          <div class="ticket-label">Номер талона</div>
          <div class="ticket-number">{{ queueStore.currentTicket.number }}</div>
        </div>
        <div v-else class="no-ticket">
          <div class="no-ticket-text">Ожидание вызова</div>
        </div>

        <div v-if="queueStore.calledTickets.length > 0" class="recently-called">
          <h3 class="recent-title">Недавно вызванные</h3>
          <div class="recent-list">
            <div
              v-for="ticket in queueStore.calledTickets.slice(0, 3)"
              :key="ticket.id"
              class="recent-item"
            >
              <span class="recent-number">{{ ticket.number }}</span>
              <span class="recent-time">{{ ticket.timestamp }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="queue-section">
        <h2 class="section-title">
          Очередь ({{ queueStore.waitingTickets.length }})
        </h2>
        
        <div v-if="queueStore.waitingTickets.length > 0" class="queue-list">
          <div
            v-for="(ticket, index) in queueStore.waitingTickets.slice(0, 5)"
            :key="ticket.id"
            class="queue-item"
            :class="{ 'is-next': index === 0 }"
          >
            <div class="item-header">
              <span class="item-number">{{ ticket.number }}</span>
              <span v-if="index === 0" class="next-badge">Следующий</span>
            </div>
            <div class="item-purpose">{{ ticket.purpose }}</div>
            <div class="item-time">{{ ticket.timestamp }}</div>
          </div>
        </div>
        <div v-else class="empty-queue">
          <div class="empty-text">Очередь пуста</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQueueStore } from '@/stores/queueStore'
import { useTime } from '@/composables/useTime'

const queueStore = useQueueStore()
const { currentTime } = useTime()

const formattedTime = computed(() => {
  return currentTime.value.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  })
})

const formattedDate = computed(() => {
  return currentTime.value.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})
</script>

<style scoped>
.display-board {
  min-height: 100vh;
  background: var(--color-primary);
  color: white;
  padding: 40px;
  display: flex;
  flex-direction: column;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.board-title {
  font-size: 36px;
  margin: 0 0 10px;
  font-weight: 700;
}

.board-subtitle {
  font-size: 18px;
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
}

.time-display {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 5px;
  text-align: right;
}

.date-display {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  text-align: right;
}

.board-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  flex: 1;
}

.section-title {
  font-size: 28px;
  margin-bottom: 30px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.current-ticket {
  background: var(--color-accent);
  border-radius: var(--border-radius-lg);
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(220, 38, 38, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

.ticket-label {
  font-size: 24px;
  margin-bottom: 20px;
  opacity: 0.9;
}

.ticket-number {
  font-size: 140px;
  font-weight: 700;
  line-height: 1;
}

.no-ticket {
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius-lg);
  padding: 60px 40px;
  text-align: center;
  border: 2px dashed rgba(255, 255, 255, 0.2);
}

.no-ticket-text {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.5);
}

.recently-called {
  margin-top: 40px;
}

.recent-title {
  font-size: 20px;
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.recent-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius-sm);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recent-number {
  font-size: 32px;
  font-weight: 700;
}

.recent-time {
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
}

.queue-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.queue-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius-md);
  padding: 30px;
  transition: all 0.3s;
}

.queue-item.is-next {
  background: rgba(220, 38, 38, 0.2);
  border: 2px solid var(--color-accent);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.item-number {
  font-size: 48px;
  font-weight: 700;
}

.queue-item.is-next .item-number {
  color: var(--color-accent);
}

.next-badge {
  background: var(--color-accent);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.item-purpose {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin-bottom: 8px;
}

.item-time {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.empty-queue {
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius-md);
  padding: 60px;
  text-align: center;
  border: 2px dashed rgba(255, 255, 255, 0.2);
}

.empty-text {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.5);
}
</style>