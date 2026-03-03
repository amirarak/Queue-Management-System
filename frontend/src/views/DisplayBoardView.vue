<template>
  <div class="display-board">
    <div class="board-header">
      <div class="header-left">
        <h1 class="board-title">{{ t('display.title') }}</h1>
      </div>
      <div class="header-right">
        <LangSwitcher />
        <div class="time-display">{{ formattedTime }}</div>
        <div class="date-display">{{ formattedDate }}</div>
      </div>
    </div>

    <div class="board-content">
      <div class="current-section">
        <h2 class="section-title">{{ t('display.serving') }}</h2>

        <div v-if="queueStore.currentTicket" class="current-ticket">
          <div class="ticket-label">{{ t('display.ticketNumber') }}</div>
          <div class="ticket-number">{{ queueStore.currentTicket.ticketNumber || queueStore.currentTicket.number }}</div>
        </div>
        <div v-else class="no-ticket">
          <div class="no-ticket-text">{{ t('display.waiting') }}</div>
        </div>

        <div v-if="queueStore.calledTickets.length > 0" class="recently-called">
          <h3 class="recent-title">{{ t('display.recentlyCalled') }}</h3>
          <div class="recent-list">
            <div
              v-for="ticket in queueStore.calledTickets.slice(0, 3)"
              :key="ticket.id"
              class="recent-item"
            >
              <span class="recent-number">{{ ticket.ticketNumber || ticket.number }}</span>
              <span class="recent-time">{{ formatTime(ticket.calledAt || ticket.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="queue-section">
        <h2 class="section-title">
          {{ t('display.queue') }} ({{ queueStore.waitingTickets.length }})
        </h2>

        <div v-if="queueStore.waitingTickets.length > 0" class="queue-list">
          <div
            v-for="(ticket, index) in queueStore.waitingTickets.slice(0, 5)"
            :key="ticket.id"
            class="queue-item"
            :class="{ 'is-next': index === 0 }"
          >
            <div class="item-header">
              <span class="item-number">{{ ticket.ticketNumber || ticket.number }}</span>
              <span v-if="index === 0" class="next-badge">{{ t('display.next') }}</span>
            </div>
            <div class="item-purpose">{{ translatePurpose(ticket.purpose) }}</div>
            <div class="item-time">{{ formatTime(ticket.createdAt) }}</div>
          </div>
        </div>
        <div v-else class="empty-queue">
          <div class="empty-text">{{ t('display.emptyQueue') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQueueStore } from '@/stores/queueStore'
import { useTime } from '@/composables/useTime'
import LangSwitcher from '@/components/common/LangSwitcher.vue'

const { t, te, locale } = useI18n()
const queueStore = useQueueStore()
const { formattedTime, formattedDate } = useTime()

function translatePurpose(purpose) {
  if (purpose && te(purpose)) return t(purpose)
  return purpose || '—'
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString(locale.value === 'en' ? 'en-US' : 'ru-RU', {
    hour: '2-digit', minute: '2-digit'
  })
}

let interval = null
onMounted(() => {
  queueStore.initialize()
  interval = setInterval(() => {
    queueStore.fetchQueue()
    queueStore.fetchCurrent()
    queueStore.fetchHistory()
  }, 5000)
})
onUnmounted(() => { if (interval) clearInterval(interval) })
</script>

<style scoped>
.display-board { min-height: 100vh; background: var(--color-primary); color: white; padding: 40px; display: flex; flex-direction: column; }
.board-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid rgba(255,255,255,0.1); }
.board-title { font-size: 36px; margin: 0; font-weight: 700; }
.header-right { display: flex; align-items: center; gap: 20px; }
.time-display { font-size: 48px; font-weight: 700; text-align: right; }
.date-display { font-size: 18px; color: rgba(255,255,255,0.7); text-align: right; }
.board-content { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; flex: 1; }
.section-title { font-size: 28px; margin-bottom: 30px; color: rgba(255,255,255,0.9); font-weight: 600; }
.current-ticket { background: var(--color-accent); border-radius: var(--border-radius-lg); padding: 60px 40px; text-align: center; box-shadow: 0 10px 40px rgba(220,38,38,0.3); animation: pulse 2s ease-in-out infinite; }
.ticket-label { font-size: 24px; margin-bottom: 20px; opacity: 0.9; }
.ticket-number { font-size: 140px; font-weight: 700; line-height: 1; }
.no-ticket { background: rgba(255,255,255,0.05); border-radius: var(--border-radius-lg); padding: 60px 40px; text-align: center; border: 2px dashed rgba(255,255,255,0.2); }
.no-ticket-text { font-size: 24px; color: rgba(255,255,255,0.5); }
.recently-called { margin-top: 40px; }
.recent-title { font-size: 20px; margin-bottom: 20px; color: rgba(255,255,255,0.7); font-weight: 600; }
.recent-list { display: flex; flex-direction: column; gap: 15px; }
.recent-item { background: rgba(255,255,255,0.05); border-radius: var(--border-radius-sm); padding: 20px; display: flex; justify-content: space-between; align-items: center; }
.recent-number { font-size: 32px; font-weight: 700; }
.recent-time { color: rgba(255,255,255,0.6); font-size: 16px; }
.queue-list { display: flex; flex-direction: column; gap: 20px; }
.queue-item { background: rgba(255,255,255,0.05); border-radius: var(--border-radius-md); padding: 30px; transition: all 0.3s; }
.queue-item.is-next { background: rgba(220,38,38,0.2); border: 2px solid var(--color-accent); }
.item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.item-number { font-size: 48px; font-weight: 700; }
.queue-item.is-next .item-number { color: var(--color-accent); }
.next-badge { background: var(--color-accent); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; }
.item-purpose { color: rgba(255,255,255,0.7); font-size: 16px; margin-bottom: 8px; }
.item-time { color: rgba(255,255,255,0.5); font-size: 14px; }
.empty-queue { background: rgba(255,255,255,0.05); border-radius: var(--border-radius-md); padding: 60px; text-align: center; border: 2px dashed rgba(255,255,255,0.2); }
.empty-text { font-size: 20px; color: rgba(255,255,255,0.5); }
</style>