<template>
  <div class="stats-cards">
    <div class="stat-card">
      <div class="stat-label">В ОЧЕРЕДИ</div>
      <div class="stat-value">{{ waitingCount }}</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">ОБСЛУЖЕНО СЕГОДНЯ</div>
      <div class="stat-value">{{ completedCount }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  waitingCount: {
    type: Number,
    required: true
  },
  completedCount: {
    type: Number,
    required: true
  }
})
</script>

<style scoped>
.stats-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 30px;
  box-shadow: var(--shadow-sm);
}

.stat-label {
  color: var(--color-gray-dark);
  font-size: 14px;
  margin-bottom: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 48px;
  font-weight: 700;
  color: var(--color-primary);
}
</style>