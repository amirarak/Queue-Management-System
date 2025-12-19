<template>
  <div v-if="tickets.length > 0" class="queue-list">
    <div
      v-for="(ticket, index) in displayTickets"
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
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
    <div class="empty-text">Очередь пуста</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tickets: {
    type: Array,
    default: () => []
  }
})

const displayTickets = computed(() => props.tickets.slice(0, 5))
</script>

<style scoped>
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

.empty-queue svg {
  opacity: 0.3;
  margin: 0 auto 20px;
}

.empty-text {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.5);
}
</style>