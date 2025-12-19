<template>
  <header class="app-header">
    <div class="header-container">
      <div class="brand">
        <div class="logo-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
          </svg>
        </div>
        <div class="brand-text">
          <h1 class="title">{{ title }}</h1>
          <span class="status-badge">Система активна</span>
        </div>
      </div>

      <div class="header-right">
        <div v-if="queueCount !== null" class="mini-counter">
          <span class="label">В очереди:</span>
          <span class="value">{{ queueCount }}</span>
        </div>
        <div class="current-time">
          {{ formattedTime }}
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useTime } from '@/composables/useTime'

defineProps({
  title: {
    type: String,
    default: 'Учебная часть'
  },
  queueCount: {
    type: Number,
    default: null
  }
})

const { formattedTime } = useTime()
</script>

<style scoped>
.app-header {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 15px 40px;
  color: white;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-icon {
  background: var(--color-accent);
  width: 45px;
  height: 45px;
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
}

.title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.5px;
}

.status-badge {
  font-size: 11px;
  text-transform: uppercase;
  color: #10b981;
  font-weight: 800;
  letter-spacing: 1px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 30px;
}

.mini-counter {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.07);
  padding: 8px 16px;
  border-radius: 20px;
}

.mini-counter .label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.mini-counter .value {
  font-weight: 700;
  color: var(--color-accent);
}

.current-time {
  font-family: monospace;
  font-size: 18px;
  font-weight: 600;
}
</style>