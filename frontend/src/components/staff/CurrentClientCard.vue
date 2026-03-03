<template>
  <div class="client-card">
    <h2 class="card-title">{{ t('staff.currentClient') }}</h2>

    <div v-if="ticket" class="client-content">
      <div class="ticket-display">
        <div class="ticket-badge">{{ t('display.ticketNumber') }}</div>
        <div class="ticket-number">{{ ticket.ticketNumber || ticket.number }}</div>
      </div>

      <div class="ticket-details">
        <div class="detail-label">{{ t('kiosk.selectService') }}</div>
        <div class="detail-value">{{ translatePurpose(ticket.purpose) }}</div>
      </div>

      <button class="complete-button" @click="$emit('complete')">
        {{ t('staff.complete') }}
      </button>
    </div>

    <div v-else class="no-client">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
      <p class="no-client-text">{{ t('staff.noClient') }}</p>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t, te } = useI18n()

defineProps({ ticket: { type: Object, default: null } })
defineEmits(['complete'])

function translatePurpose(purpose) {
  if (purpose && te(purpose)) return t(purpose)
  return purpose || '—'
}
</script>

<style scoped>
.client-card { background: white; border-radius: var(--border-radius-lg); padding: 30px; box-shadow: var(--shadow-sm); }
.card-title { font-size: 20px; margin: 0 0 25px; color: var(--color-primary); font-weight: 600; }
.ticket-display { background: var(--color-accent); color: white; border-radius: var(--border-radius-md); padding: 40px; text-align: center; margin-bottom: 20px; }
.ticket-badge { font-size: 24px; margin-bottom: 10px; opacity: 0.9; }
.ticket-number { font-size: 72px; font-weight: 700; line-height: 1; }
.ticket-details { background: var(--color-gray-light); border-radius: var(--border-radius-sm); padding: 20px; margin-bottom: 20px; }
.detail-label { font-size: 14px; color: var(--color-gray-dark); margin-bottom: 5px; }
.detail-value { font-size: 16px; color: var(--color-primary); font-weight: 500; }
.complete-button { width: 100%; padding: 18px; font-size: 18px; font-weight: 600; color: white; background: var(--color-primary); border: none; border-radius: var(--border-radius-sm); cursor: pointer; transition: all 0.3s; }
.complete-button:hover { background: #2d3a4f; }
.no-client { text-align: center; padding: 40px 20px; color: var(--color-gray-medium); }
.no-client svg { opacity: 0.3; margin: 0 auto 15px; }
.no-client-text { margin: 0; font-size: 16px; }
</style>