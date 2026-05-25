<template>
  <div class="print-container" aria-hidden="true">
    <div class="kiosk-print-root">
      <div class="receipt">
        <div class="receipt-header">
          <h2>{{ t('ticket.ticket') }}</h2>
        </div>

        <div class="receipt-number">
          <span class="prefix">{{ ticketPrefix }}</span>
          <span class="number">{{ ticketNum }}</span>
        </div>

        <div class="receipt-divider">---------------------</div>

        <div class="receipt-info">
          <div class="info-row">
            <span class="label">Service:</span>
            <span class="value">{{ translatedPurpose }}</span>
          </div>
          <div v-if="departmentName" class="info-row">
            <span class="label">{{ t('staffMgmt.department') }}:</span>
            <span class="value">{{ departmentName }}</span>
          </div>
          <div class="info-row">
            <span class="label">Date:</span>
            <span class="value">{{ formattedDate }}</span>
          </div>
          <div class="info-row">
            <span class="label">Time:</span>
            <span class="value">{{ formattedTime }}</span>
          </div>
        </div>

        <div class="receipt-divider">---------------------</div>

        <div class="receipt-notice">
          <p>{{ t('ticket.waiting') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, te, locale } = useI18n()

const props = defineProps({
  ticket: { type: Object, required: true }
})

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
  const purposeKey = props.ticket.purposeKey || props.ticket.purpose
  if (!purposeKey) return '—'
  if (te(purposeKey)) return t(purposeKey)
  return purposeKey
})

const createdAt = computed(() => props.ticket.createdAt || new Date().toISOString())
const departmentName = computed(() => (props.ticket.department ? getDeptName(props.ticket.department) : ''))
const formattedDate = computed(() => formatDate(createdAt.value))
const formattedTime = computed(() => formatTime(createdAt.value))

function getDeptName(dept) {
  if (!dept) return ''
  if (locale.value === 'en') return dept.nameEn
  if (locale.value === 'ky') return dept.nameKy
  return dept.nameRu
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU')
}

function formatTime(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function print() {
  return new Promise((resolve, reject) => {
    let settled = false

    const settle = (callback) => {
      if (settled) return
      settled = true
      document.body.classList.remove('printing-ticket')
      callback()
    }

    const onAfterPrint = () => {
      window.removeEventListener('afterprint', onAfterPrint)
      settle(() => resolve(true))
    }

    try {
      document.body.classList.add('printing-ticket')
      window.addEventListener('afterprint', onAfterPrint, { once: true })
      window.print()

      setTimeout(() => {
        window.removeEventListener('afterprint', onAfterPrint)
        settle(() => resolve(true))
      }, 1500)
    } catch (error) {
      window.removeEventListener('afterprint', onAfterPrint)
      settle(() => reject(error))
    }
  })
}

defineExpose({ print })
</script>

<style scoped>
.print-container {
  display: block;
}

.kiosk-print-root {
  display: none;
}

.receipt {
  width: 80mm;
  padding: 10mm;
  text-align: center;
  box-sizing: border-box;
  color: #111827;
  font-family: Arial, sans-serif;
}

.receipt-header h2 {
  font-size: 14pt;
  font-weight: 700;
  margin: 0 0 5mm;
}

.receipt-number {
  font-size: 20pt;
  font-weight: 700;
  margin: 8mm 0;
}

.receipt-divider {
  margin: 5mm 0;
  font-size: 10pt;
  letter-spacing: 1px;
}

.receipt-info {
  text-align: left;
  margin: 5mm 0;
  line-height: 1.6;
  font-size: 10pt;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 3mm;
}

.label {
  font-weight: 700;
  white-space: nowrap;
}

.value {
  text-align: right;
  flex: 1;
  word-break: break-word;
}

.receipt-notice {
  margin-top: 5mm;
  text-align: center;
  font-size: 9pt;
  line-height: 1.4;
}

:global(body.printing-ticket *) {
  visibility: hidden !important;
}

:global(body.printing-ticket .kiosk-print-root),
:global(body.printing-ticket .kiosk-print-root *) {
  visibility: visible !important;
}

:global(body.printing-ticket .kiosk-print-root) {
  display: block !important;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2147483647;
  background: #fff;
}

@media print {
  .kiosk-print-root {
    display: block;
  }

  @page {
    size: 80mm auto;
    margin: 0;
  }
}
</style>
