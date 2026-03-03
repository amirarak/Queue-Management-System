<template>
  <div class="stats-cards">
    <div class="stat-card">
      <div class="stat-label">{{ t('staff.waiting') }}</div>
      <div class="stat-value">{{ waitingCount }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">{{ t('staff.served') }}</div>
      <div class="stat-value">{{ completedCount }}</div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
defineProps({
  waitingCount: { type: Number, required: true },
  completedCount: { type: Number, required: true }
})
</script>

<style scoped>
.stats-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; }
.stat-card { background: white; border-radius: var(--border-radius-lg); padding: 30px; box-shadow: var(--shadow-sm); }
.stat-label { color: var(--color-gray-dark); font-size: 14px; margin-bottom: 10px; font-weight: 600; letter-spacing: 0.5px; }
.stat-value { font-size: 48px; font-weight: 700; color: var(--color-primary); }
</style>