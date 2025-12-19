<template>
  <div v-if="tickets.length > 0" class="recently-called">
    <h3 class="recent-title">Недавно вызванные</h3>
    <div class="recent-list">
      <div
        v-for="ticket in displayTickets"
        :key="ticket.id"
        class="recent-item"
      >
        <span class="recent-number">{{ ticket.number }}</span>
        <span class="recent-time">{{ ticket.timestamp }}</span>
      </div>
    </div>
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

const displayTickets = computed(() => props.tickets.slice(0, 3))
</script>

<style scoped>
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
</style>