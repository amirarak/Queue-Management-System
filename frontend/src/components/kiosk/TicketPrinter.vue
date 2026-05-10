<template>
  <div class="print-container" aria-hidden="true"></div>
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

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildReceiptHtml() {
  const createdAt = props.ticket.createdAt || new Date().toISOString()
  const departmentName = props.ticket.department ? getDeptName(props.ticket.department) : ''
  const ticketCode = props.ticket.ticketCode || props.ticket.ticketNumber || ticketNum.value

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(ticketCode)}</title>
    <style>
      @page { size: 80mm auto; margin: 0; }
      html, body {
        margin: 0;
        padding: 0;
        background: #fff;
        color: #111827;
        font-family: Arial, sans-serif;
      }
      body { box-sizing: border-box; }
      .receipt {
        width: 80mm;
        padding: 10mm;
        text-align: center;
        box-sizing: border-box;
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
    </style>
  </head>
  <body>
    <div class="receipt">
      <div class="receipt-header">
        <h2>${escapeHtml(t('ticket.ticket'))}</h2>
      </div>
      <div class="receipt-number">
        <span class="prefix">${escapeHtml(ticketPrefix.value)}</span>
        <span class="number">${escapeHtml(ticketNum.value)}</span>
      </div>
      <div class="receipt-divider">—————————————</div>
      <div class="receipt-info">
        <div class="info-row">
          <span class="label">Service:</span>
          <span class="value">${escapeHtml(translatedPurpose.value)}</span>
        </div>
        ${departmentName ? `
        <div class="info-row">
          <span class="label">${escapeHtml(t('staffMgmt.department'))}:</span>
          <span class="value">${escapeHtml(departmentName)}</span>
        </div>` : ''}
        <div class="info-row">
          <span class="label">Date:</span>
          <span class="value">${escapeHtml(formatDate(createdAt))}</span>
        </div>
        <div class="info-row">
          <span class="label">Time:</span>
          <span class="value">${escapeHtml(formatTime(createdAt))}</span>
        </div>
      </div>
      <div class="receipt-divider">—————————————</div>
      <div class="receipt-notice">
        <p>${escapeHtml(t('ticket.waiting'))}</p>
      </div>
    </div>
  </body>
</html>`
}

function print() {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe')
    iframe.setAttribute('aria-hidden', 'true')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    iframe.style.opacity = '0'
    iframe.style.pointerEvents = 'none'

    let settled = false
    const cleanup = () => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe)
    }

    const settle = (callback) => {
      if (settled) return
      settled = true
      cleanup()
      callback()
    }

    iframe.onload = () => {
      try {
        const frameWindow = iframe.contentWindow
        if (!frameWindow) {
          settle(() => reject(new Error('Не удалось открыть окно печати')))
          return
        }

        const onAfterPrint = () => {
          frameWindow.removeEventListener('afterprint', onAfterPrint)
          settle(() => resolve(true))
        }

        frameWindow.addEventListener('afterprint', onAfterPrint, { once: true })
        frameWindow.focus()
        frameWindow.print()

        setTimeout(() => {
          settle(() => resolve(true))
        }, 1500)
      } catch (error) {
        settle(() => reject(error))
      }
    }

    iframe.srcdoc = buildReceiptHtml()
    document.body.appendChild(iframe)
  })
}

defineExpose({ print })
</script>

<style scoped>
.print-container {
  display: none;
}
</style>
