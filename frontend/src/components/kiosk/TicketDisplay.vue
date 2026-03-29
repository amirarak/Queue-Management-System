<template>
  <div class="ticket-display">
    <div class="ticket-card">

      <div class="ticket-number-circle">
        <div class="ticket-label">{{ t('ticket.yourNumber') }}</div>
        <div class="ticket-code">
          <span class="code-prefix">{{ ticketPrefix }}</span>
          <span class="code-number">{{ ticketNum }}</span>
        </div>
      </div>

      <h2 class="ticket-success-title">{{ t('ticket.waiting') }}</h2>

      <div class="ticket-info">
        <div class="info-row">
          <div class="info-label">{{ t('kiosk.selectService') }}</div>
          <div class="info-value">{{ translatedPurpose }}</div>
        </div>
        <div v-if="ticket.department" class="info-row">
          <div class="info-label">{{ t('staffMgmt.department') }}</div>
          <div class="info-value">{{ getDeptName(ticket.department) }}</div>
        </div>
      </div>

      <div class="ticket-notice">
        <p class="notice-title">{{ t('display.title') }}</p>
        <p class="notice-text">{{ t('ticket.waiting') }}</p>
      </div>

      <div class="countdown">
        <div class="countdown-bar">
          <div class="countdown-fill" :style="{ width: (countdown / 10 * 100) + '%' }"></div>
        </div>
        <p class="countdown-text">{{ countdown }}</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, te, locale } = useI18n()

const props = defineProps({ ticket: { type: Object, required: true } })
const emit  = defineEmits(['done'])

const ticketPrefix = computed(() => {
  const code = props.ticket.ticketCode
  if (!code) return ''
  const parts = code.split('-')
  return parts.length > 1 ? parts[0] + '-' : ''
})

const ticketNum = computed(() => {
  const code = props.ticket.ticketCode
  if (!code) return props.ticket.ticketNumber || props.ticket.number || ''
  const parts = code.split('-')
  return parts.length > 1 ? parts[1] : code
})

const translatedPurpose = computed(() => {
  const p = props.ticket.purposeKey || props.ticket.purpose
  if (!p) return '—'
  if (te(p)) return t(p)
  return p
})

function getDeptName(dept) {
  if (!dept) return ''
  if (locale.value === 'en') return dept.nameEn
  if (locale.value === 'ky') return dept.nameKy
  return dept.nameRu
}

const countdown = ref(10)
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      emit('done')
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.ticket-display {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  box-sizing: border-box;
  animation: fadeIn 0.5s ease-in;
}

.ticket-card {
  background: white;
  border-radius: 24px;
  padding: clamp(32px, 4vw, 52px) clamp(28px, 4vw, 52px);
  width: 100%;
  max-width: 520px;
  box-shadow: 0 30px 80px rgba(0,0,0,0.4);
  text-align: center;
}

.ticket-number-circle {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  border-radius: 20px;
  width: clamp(160px, 22vw, 200px);
  height: clamp(160px, 22vw, 200px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 28px;
  box-shadow: 0 12px 40px rgba(220,38,38,0.4);
  animation: scaleIn 0.5s ease-out;
}

.ticket-label {
  font-size: clamp(10px, 1.2vw, 13px);
  opacity: 0.85;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 6px;
}

.ticket-code {
  display: flex;
  align-items: baseline;
  gap: 2px;
  line-height: 1;
}

.code-prefix {
  font-size: clamp(16px, 2.5vw, 22px);
  font-weight: 600;
  opacity: 0.85;
}

.code-number {
  font-size: clamp(36px, 6vw, 52px);
  font-weight: 900;
  line-height: 1;
}

.ticket-success-title {
  color: var(--color-primary, #1a2332);
  font-size: clamp(20px, 3vw, 28px);
  margin: 0 0 20px;
  font-weight: 700;
}

.ticket-info {
  background: #f8f9fb;
  border-radius: 14px;
  padding: clamp(16px, 2.5vw, 24px);
  margin: 0 0 20px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.info-row { display: flex; flex-direction: column; gap: 4px; }
.info-label { color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; }
.info-value { color: var(--color-primary, #1a2332); font-size: clamp(15px, 2vw, 18px); font-weight: 600; }

.ticket-notice {
  background: rgba(220,38,38,0.06);
  border: 1.5px solid rgba(220,38,38,0.25);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
}
.notice-title { color: #dc2626; font-size: 15px; margin: 0 0 4px; font-weight: 600; }
.notice-text  { color: #666; font-size: 13px; margin: 0; }

.countdown { margin-top: 8px; }
.countdown-bar {
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 6px;
}
.countdown-fill {
  height: 100%;
  background: #dc2626;
  border-radius: 2px;
  transition: width 1s linear;
}
.countdown-text {
  font-size: 13px;
  color: #999;
  margin: 0;
}

@keyframes fadeIn  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
@keyframes scaleIn { from { transform:scale(0.8); opacity:0; } to { transform:scale(1); opacity:1; } }
</style>