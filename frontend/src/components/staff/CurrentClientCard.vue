<template>
  <div class="client-card">
    <h2 class="card-title">{{ t('staff.currentClient') }}</h2>

    <div v-if="ticket" class="client-content">
      <div class="ticket-display">
        <div class="ticket-badge">{{ t('display.ticketNumber') }}</div>
        <div class="ticket-number">{{ ticket.ticketCode || ticket.ticketNumber || ticket.number }}</div>
      </div>

      <div class="ticket-details">
        <div class="detail-label">{{ t('kiosk.selectService') }}</div>
        <div class="detail-value">{{ translatePurpose(ticket.purposeKey || ticket.purpose) }}</div>
      </div>

      <div class="action-buttons">
        <button class="complete-button" @click="$emit('complete')">
          {{ t('staff.complete') }}
        </button>

        <button class="skip-button" @click="handleSkip">
          {{ t('staff.skip') }}
        </button>
      </div>
    </div>

    <div v-else class="no-client">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
      <p class="no-client-text">{{ t('staff.noClient') }}</p>
    </div>

    <div v-if="showSkipConfirm" class="modal-overlay" @click.self="showSkipConfirm = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ t('staff.skipTitle') }}</h3>
          <button class="modal-close" @click="showSkipConfirm = false">✕</button>
        </div>
        <div class="modal-body">
          <p>{{ t('staff.skipConfirmText') }}</p>
          <p class="skip-ticket">{{ ticket?.ticketCode || ticket?.ticketNumber }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showSkipConfirm = false">{{ t('common.cancel') }}</button>
          <button class="btn-skip" @click="confirmSkip">{{ t('staff.skip') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, te } = useI18n()

const props = defineProps({ ticket: { type: Object, default: null } })
const emit  = defineEmits(['complete', 'skip'])

const showSkipConfirm = ref(false)

function translatePurpose(purpose) {
  if (!purpose) return '—'
  if (te(purpose)) return t(purpose)
  return purpose
}

function handleSkip() {
  showSkipConfirm.value = true
}

function confirmSkip() {
  showSkipConfirm.value = false
  emit('skip')
}
</script>

<style scoped>
.client-card {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 30px;
  box-shadow: var(--shadow-sm);
  position: relative;
}
.card-title { font-size: 20px; margin: 0 0 25px; color: var(--color-primary); font-weight: 600; }

.ticket-display {
  background: var(--color-accent);
  color: white;
  border-radius: var(--border-radius-md);
  padding: 40px;
  text-align: center;
  margin-bottom: 20px;
}
.ticket-badge { font-size: 20px; margin-bottom: 10px; opacity: 0.9; }
.ticket-number { font-size: 64px; font-weight: 700; line-height: 1; letter-spacing: -1px; }

.ticket-details {
  background: var(--color-gray-light);
  border-radius: var(--border-radius-sm);
  padding: 20px;
  margin-bottom: 20px;
}
.detail-label { font-size: 14px; color: var(--color-gray-dark); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
.detail-value { font-size: 16px; color: var(--color-primary); font-weight: 500; }

.action-buttons { display: flex; flex-direction: column; gap: 12px; }

.complete-button {
  width: 100%; padding: 18px; font-size: 18px; font-weight: 600;
  color: white; background: var(--color-primary);
  border: none; border-radius: var(--border-radius-sm);
  cursor: pointer; transition: all 0.3s;
}
.complete-button:hover { background: #2d3a4f; }

.skip-button {
  width: 100%; padding: 14px; font-size: 16px; font-weight: 600;
  color: var(--color-accent);
  background: rgba(220,38,38,0.06);
  border: 2px solid rgba(220,38,38,0.25);
  border-radius: var(--border-radius-sm);
  cursor: pointer; transition: all 0.3s;
}
.skip-button:hover {
  background: rgba(220,38,38,0.12);
  border-color: var(--color-accent);
}

.no-client { text-align: center; padding: 40px 20px; color: var(--color-gray-medium); }
.no-client svg { opacity: 0.3; margin: 0 auto 15px; display: block; }
.no-client-text { margin: 0; font-size: 16px; }


.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal {
  background: #1e2536;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  width: 100%; max-width: 380px;
  box-shadow: 0 25px 60px rgba(0,0,0,0.6);
  animation: pop 0.2s ease;
}
@keyframes pop { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 22px 28px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.modal-header h3 { font-size: 18px; color: white; margin: 0; font-weight: 600; }
.modal-close { background: none; border: none; color: rgba(255,255,255,0.4); font-size: 18px; cursor: pointer; }
.modal-close:hover { color: white; }
.modal-body { padding: 24px 28px; }
.modal-body p { color: rgba(255,255,255,0.75); font-size: 15px; margin: 0 0 8px; line-height: 1.6; }
.skip-ticket {
  font-size: 28px; font-weight: 700; color: var(--color-accent, #dc2626);
  text-align: center; margin: 12px 0 0 !important;
}
.modal-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 18px 28px;
  border-top: 1px solid rgba(255,255,255,0.08);
}
.btn-cancel {
  padding: 10px 20px;
  background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7);
  border: none; border-radius: 8px; cursor: pointer; font-size: 15px;
}
.btn-cancel:hover { background: rgba(255,255,255,0.12); }
.btn-skip {
  padding: 10px 24px;
  background: var(--color-accent, #dc2626); color: white;
  border: none; border-radius: 8px; cursor: pointer;
  font-size: 15px; font-weight: 600;
}
.btn-skip:hover { background: #b91c1c; }
</style>