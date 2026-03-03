<template>
  <div class="queue-list-card">
    <h2 class="list-title">{{ t('display.queue') }} ({{ tickets.length }})</h2>

    <div v-if="tickets.length > 0" class="queue-scroll">
      <div
        v-for="(ticket, index) in tickets"
        :key="ticket.id"
        class="queue-item"
        :class="{ 'is-next': index === 0 }"
      >
        <div class="item-header">
          <span class="item-number">{{ ticket.ticketNumber || ticket.number }}</span>
          <span v-if="index === 0" class="next-badge">{{ t('display.next') }}</span>
        </div>
        <div class="item-purpose">{{ translatePurpose(ticket.purpose) }}</div>
        <div class="item-time">{{ formatLocalTime(ticket.createdAt) }}</div>
      </div>
    </div>

    <div v-else class="empty-queue">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
      <p class="empty-text">{{ t('display.emptyQueue') }}</p>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useTime } from '@/composables/useTime'

const { t, te } = useI18n()
const { formatLocalTime } = useTime()

defineProps({ tickets: { type: Array, default: () => [] } })

function translatePurpose(purpose) {
  if (purpose && te(purpose)) return t(purpose)
  return purpose || '—'
}
</script>

<style scoped>
.queue-list-card { background: white; border-radius: var(--border-radius-lg); padding: 30px; box-shadow: var(--shadow-sm); }
.list-title { font-size: 20px; margin: 0 0 25px; color: var(--color-primary); font-weight: 600; }
.queue-scroll { display: flex; flex-direction: column; gap: 15px; max-height: 600px; overflow-y: auto; padding-right: 10px; }
.queue-scroll::-webkit-scrollbar { width: 8px; }
.queue-scroll::-webkit-scrollbar-track { background: var(--color-gray-light); border-radius: 4px; }
.queue-scroll::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
.queue-item { background: var(--color-gray-light); border-radius: var(--border-radius-md); padding: 20px; transition: all 0.3s; }
.queue-item.is-next { background: rgba(220,38,38,0.05); border: 2px solid var(--color-accent); }
.item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.item-number { font-size: 32px; font-weight: 700; color: var(--color-primary); }
.queue-item.is-next .item-number { color: var(--color-accent); }
.next-badge { background: var(--color-accent); color: white; padding: 6px 14px; border-radius: 16px; font-size: 13px; font-weight: 600; }
.item-purpose { font-size: 14px; color: var(--color-gray-dark); margin-bottom: 8px; }
.item-time { font-size: 13px; color: var(--color-gray-medium); }
.empty-queue { text-align: center; padding: 80px 20px; color: var(--color-gray-medium); }
.empty-queue svg { opacity: 0.3; margin: 0 auto 20px; }
.empty-text { font-size: 18px; margin: 0; }
</style>