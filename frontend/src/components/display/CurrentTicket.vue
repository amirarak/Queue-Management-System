<template>
  <div v-if="ticket" class="current-ticket">
    <div class="ticket-label">Номер талона</div>
    <div class="ticket-number">{{ ticket.number }}</div>
  </div>
  <div v-else class="no-ticket">
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>
    <div class="no-ticket-text">Ожидание вызова</div>
  </div>
</template>

<script setup>
defineProps({
  ticket: {
    type: Object,
    default: null
  }
})
</script>

<style scoped>
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

.no-ticket svg {
  opacity: 0.3;
  margin: 0 auto 20px;
}

.no-ticket-text {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.5);
}
</style>