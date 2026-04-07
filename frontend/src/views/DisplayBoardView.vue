<template>
  <div class="display-board">
    <div class="board-header">
      <div class="header-left">
        <h1 class="board-title">{{ t('display.title') }}</h1>
        <div class="board-subtitle">{{ t('dept.name') }}</div>
      </div>
      <div class="header-right">
        <LangSwitcher />
        <div class="clock-block">
          <div class="time-display">{{ formattedTime }}</div>
          <div class="date-display">{{ formattedDate }}</div>
        </div>
      </div>
    </div>

    <div class="board-content">
      <div v-if="loadError" class="board-error">{{ loadError }}</div>

      <div class="left-panel">
        <div class="section-label">{{ t('display.serving') }}</div>

        <div v-if="servingTickets.length > 0" class="serving-list">
          <div
            v-for="ticket in servingTickets"
            :key="ticket.id"
            class="serving-card"
          >
            <div class="serving-code">
              <span class="code-prefix">{{ getPrefix(ticket) }}-</span><span class="code-num">{{ getNum(ticket) }}</span>
            </div>

            <div class="serving-meta">
              <span class="serving-dept">{{ getDeptName(ticket) }}</span>
              <span class="serving-purpose">{{ translatePurpose(ticket.purposeKey || ticket.purpose) }}</span>
            </div>

            <div v-if="ticket.windowNumber" class="window-block">
              <span class="window-label-text">{{ t('display.window') }}</span>
              <span class="window-num">{{ ticket.windowNumber }}</span>
            </div>
          </div>
        </div>

        <div v-else class="empty-card">
          <div class="empty-icon">⏳</div>
          <div class="empty-text">{{ t('display.waiting') }}</div>
        </div>

        <div v-if="historyTickets.length > 0" class="recently-section">
          <div class="section-label-sm">{{ t('display.recentlyCalled') }}</div>
          <div class="recent-list">
            <div
              v-for="ticket in historyTickets.slice(0, 5)"
              :key="ticket.id"
              class="recent-row"
            >
              <span class="recent-code">{{ ticket.ticketCode || ticket.ticketNumber }}</span>
              <template v-if="ticket.windowNumber">
                <span class="recent-arrow">→</span>
                <span class="recent-window">{{ t('display.window') }} {{ ticket.windowNumber }}</span>
              </template>
              <span class="recent-time">{{ formatTime(ticket.calledAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="section-label">
          {{ t('display.queue') }}
          <span class="queue-badge">{{ waitingTickets.length }}</span>
        </div>

        <div v-if="waitingTickets.length > 0" class="queue-list">
          <div
            v-for="(ticket, index) in waitingTickets.slice(0, 10)"
            :key="ticket.id"
            class="queue-row"
            :class="{ 'queue-next': index === 0 }"
          >
            <div class="queue-left">
              <span class="queue-code">{{ ticket.ticketCode || ticket.ticketNumber }}</span>
              <span v-if="index === 0" class="next-pill">{{ t('display.next') }}</span>
            </div>
            <div class="queue-right">
              <span class="queue-dept-badge">{{ getDeptCode(ticket) }}</span>
              <span class="queue-time">{{ formatTime(ticket.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div v-else class="empty-queue">
          <div class="empty-queue-text">{{ t('display.emptyQueue') }}</div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { queueAPI } from '@/services/api'
import { useTime } from '@/composables/useTime'
import LangSwitcher from '@/components/common/LangSwitcher.vue'

const { t, te, locale } = useI18n()
const { formattedTime, formattedDate } = useTime()

const servingTickets = ref([])  
const waitingTickets = ref([])  
const historyTickets = ref([])  
const loadError = ref('')

const DEPT_NAME_KEY = {
  1: 'departments.engineering',
  2: 'departments.economics',
  3: 'departments.social',
  4: 'departments.medicine',
  5: 'departments.humanities',
}
const DEPT_CODES = { 1: 'ENG', 2: 'ECO', 3: 'SOC', 4: 'MED', 5: 'HUM' }

function getDeptName(ticket) {
  const key = DEPT_NAME_KEY[ticket.departmentId]
  if (key) return t(key)
  return ticket.department?.nameRu || ticket.department?.nameEn || ''
}

function getDeptCode(ticket) {
  return DEPT_CODES[ticket.departmentId] || ticket.department?.code || ''
}

function getPrefix(ticket) {
  return ticket.ticketCode?.split('-')[0] || String(ticket.ticketNumber)
}

function getNum(ticket) {
  return ticket.ticketCode?.split('-')[1] || ''
}

function translatePurpose(purpose) {
  if (!purpose) return '—'
  if (te(purpose)) return t(purpose)
  return purpose
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString(
    locale.value === 'en' ? 'en-US' : 'ru-RU',
    { hour: '2-digit', minute: '2-digit' }
  )
}

async function fetchServing() {
  try {
    const res = await queueAPI.getServing()
    servingTickets.value = res.data.data || []
  } catch (e) {
    throw new Error(e.response?.data?.message || 'Failed to load serving tickets')
  }
}

async function fetchWaiting() {
  try {
    const res = await queueAPI.getQueue()
    waitingTickets.value = res.data.data?.tickets || []
  } catch (e) {
    throw new Error(e.response?.data?.message || 'Failed to load queue')
  }
}

async function fetchHistory() {
  try {
    const res = await queueAPI.getHistory({ limit: 8 })
    historyTickets.value = (res.data.data || []).filter(
      t => !servingTickets.value.find(s => s.id === t.id)
    )
  } catch (e) {
    throw new Error(e.response?.data?.message || 'Failed to load history')
  }
}

async function refreshAll() {
  try {
    await fetchServing()
    await Promise.all([fetchWaiting(), fetchHistory()])
    loadError.value = ''
  } catch (e) {
    loadError.value = e.message || 'Failed to refresh display board'
  }
}

let interval = null

onMounted(async () => {
  await refreshAll()
  interval = setInterval(refreshAll, 2000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<style scoped>

.display-board {
  min-height: 100vh;
  background: var(--color-primary);
  color: white;
  padding: 28px 36px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.header-left   { display: flex; flex-direction: column; gap: 3px; }
.board-title   { font-size: 26px; font-weight: 700; margin: 0; line-height: 1; }
.board-subtitle { font-size: 13px; color: rgba(255,255,255,0.45); }
.header-right  { display: flex; align-items: center; gap: 20px; }
.clock-block   { text-align: right; }
.time-display  { font-size: 44px; font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums; }
.date-display  { font-size: 13px; color: rgba(255,255,255,0.5); margin-top: 2px; }

.board-content { display: grid; grid-template-columns: 1fr 320px; gap: 28px; flex: 1; }

.board-error {
  grid-column: 1 / -1;
  background: rgba(220, 38, 38, 0.15);
  border: 1px solid rgba(248, 113, 113, 0.45);
  color: #fecaca;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
}

.section-label {
  font-size: 12px; font-weight: 700; letter-spacing: 0.14em;
  text-transform: uppercase; color: rgba(255,255,255,0.4);
  margin-bottom: 14px; display: flex; align-items: center; gap: 10px;
}
.section-label-sm {
  font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 10px;
}

.left-panel { display: flex; flex-direction: column; gap: 20px; }

.serving-list { display: flex; flex-direction: column; gap: 10px; }

.serving-card {
  background: var(--color-accent);
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 6px 24px rgba(220,38,38,0.25);
  animation: slideIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
}

@keyframes slideIn {
  from { transform: translateX(-10px); opacity: 0; }
  to   { transform: translateX(0);     opacity: 1; }
}

.serving-code {
  font-size: clamp(38px, 4.5vw, 58px);
  font-weight: 800;
  letter-spacing: -2px;
  line-height: 1;
  white-space: nowrap;
  flex-shrink: 0;
}
.code-prefix { opacity: 0.6; }

.serving-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}
.serving-dept    { font-size: 13px; opacity: 0.75; }
.serving-purpose { font-size: 16px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.window-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.2);
  border-radius: 12px;
  padding: 10px 18px;
  min-width: 64px;
  flex-shrink: 0;
  gap: 2px;
}
.window-label-text {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.75;
  line-height: 1;
}
.window-num {
  font-size: 36px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -1px;
}

.empty-card { background: rgba(255,255,255,0.04); border: 2px dashed rgba(255,255,255,0.12); border-radius: 16px; padding: 40px; text-align: center; }
.empty-icon { font-size: 40px; opacity: 0.22; margin-bottom: 12px; }
.empty-text { font-size: 18px; color: rgba(255,255,255,0.33); }

.recently-section { flex-shrink: 0; }
.recent-list  { display: flex; flex-direction: column; gap: 7px; }
.recent-row   { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.05); border-radius: 10px; padding: 11px 16px; }
.recent-code  { font-size: 18px; font-weight: 700; letter-spacing: -0.5px; min-width: 70px; }
.recent-arrow { color: rgba(255,255,255,0.3); font-size: 14px; }
.recent-window { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.7); flex: 1; }
.recent-time  { font-size: 12px; color: rgba(255,255,255,0.38); font-variant-numeric: tabular-nums; margin-left: auto; }

.right-panel { display: flex; flex-direction: column; }
.queue-badge { background: var(--color-accent); color: white; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px; }
.queue-list  { display: flex; flex-direction: column; gap: 7px; }
.queue-row   { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 13px 16px; }
.queue-row.queue-next { background: rgba(220,38,38,0.12); border-color: rgba(220,38,38,0.35); }
.queue-left  { display: flex; align-items: center; gap: 10px; }
.queue-code  { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
.queue-next .queue-code { color: var(--color-accent); }
.next-pill   { background: var(--color-accent); color: white; font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em; }
.queue-right { display: flex; align-items: center; gap: 10px; }
.queue-dept-badge { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.07); padding: 3px 7px; border-radius: 6px; }
.queue-time  { font-size: 12px; color: rgba(255,255,255,0.38); font-variant-numeric: tabular-nums; }
.empty-queue { background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px; padding: 40px; text-align: center; }
.empty-queue-text { font-size: 15px; color: rgba(255,255,255,0.3); }

@media (max-width: 1100px) { .board-content { grid-template-columns: 1fr; } }
@media (min-width: 1920px) { .serving-code { font-size: 72px; } .time-display { font-size: 54px; } }
</style>