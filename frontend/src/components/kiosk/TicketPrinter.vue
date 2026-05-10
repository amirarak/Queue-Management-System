<template>
  <div ref="printContainer" class="print-container" style="display:none;">
    <div class="receipt">
      <div class="receipt-header">
        <h2>{{ t('ticket.ticket') }}</h2>
      </div>

      <div class="receipt-number">
        <span class="prefix">{{ ticketPrefix }}</span>
        <span class="number">{{ ticketNum }}</span>
      </div>

      <div class="receipt-divider">—————————————</div>

      <div class="receipt-info">
        <div class="info-row">
          <span class="label">Service:</span>
          <span class="value">{{ translatedPurpose }}</span>
        </div>
        <div v-if="ticket.department" class="info-row">
          <span class="label">{{ t('staffMgmt.department') }}:</span>
          <span class="value">{{ getDeptName(ticket.department) }}</span>
        </div>
        <div class="info-row">
          <span class="label">Date:</span>
          <span class="value">{{ formatDate(ticket.createdAt) }}</span>
        </div>
        <div class="info-row">
          <span class="label">Time:</span>
          <span class="value">{{ formatTime(ticket.createdAt) }}</span>
        </div>
      </div>

      <div class="receipt-divider">—————————————</div>

      <div class="receipt-notice">
        <p>{{ t('ticket.waiting') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { printAPI } from '@/services/api'

const { t, te, locale } = useI18n()

const props = defineProps({
  ticket: { type: Object, required: true }
})

const printContainer = ref(null)

const ticketPrefix = computed(() => {
  const code = props.ticket.ticketCode
  if (!code) return ''
  const parts = code.split('-')
  return parts.length > 1 ? parts[0] : ''
})

const ticketNum = computed(() => {
  const code = props.ticket.ticketCode
  if (!code) return props.ticket.ticketNumber || ''
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
  const createdAt = props.ticket.createdAt || new Date().toISOString()
  const date = formatDate(createdAt)
  const time = formatTime(createdAt)
  const departmentName = props.ticket.department ? getDeptName(props.ticket.department) : ''
  const ticketCode = props.ticket.ticketCode || props.ticket.ticketNumber || ticketNum.value

  return printAPI.printTicket({
    ticketCode,
    ticketNumber: props.ticket.ticketNumber || ticketNum.value,
    serviceName: translatedPurpose.value,
    departmentName,
    date,
    time
  }).then(() => true)
}

defineExpose({ print })
</script>

<style scoped>
.print-container {
  display: none;
}

.receipt {
  width: 80mm;
  padding: 10mm;
  text-align: center;
  font-family: Arial, sans-serif;
}

.receipt-header h2 {
  font-size: 14pt;
  font-weight: bold;
  margin-bottom: 5mm;
}

.receipt-number {
  font-size: 20pt;
  font-weight: bold;
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
  margin-bottom: 3mm;
}

.label {
  font-weight: bold;
  margin-right: 5mm;
}

.value {
  text-align: right;
  flex: 1;
}

.receipt-notice {
  margin-top: 5mm;
  text-align: center;
  font-size: 9pt;
  line-height: 1.4;
}
</style>
