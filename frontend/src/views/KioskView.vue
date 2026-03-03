<template>
  <div class="kiosk-view">
    <div class="kiosk-header">
      <div class="header-container">
        <div class="header-info">
          <h1 class="header-title">{{ t('display.title') }}</h1>
        </div>
        <div class="header-right">
          <div class="queue-counter">
            <div class="counter-label">{{ t('kiosk.inQueue') }}</div>
            <div class="counter-value">{{ queueStore.waitingTickets.length }}</div>
          </div>

        </div>
      </div>
    </div>

    <div class="kiosk-content">
      <WelcomeScreen v-if="step === 'welcome'" @start="step = 'service'" />
      <ServiceSelection v-else-if="step === 'service'" @select="handleServiceSelect" @back="step = 'welcome'" />

      <div v-else-if="step === 'loading'" class="loading-screen">
        <div class="spinner"></div>
        <p>{{ t('kiosk.creatingTicket') }}</p>
      </div>

      <TicketDisplay v-else-if="step === 'ticket'" :ticket="generatedTicket" />

      <div v-if="queueStore.error" class="error-toast">{{ queueStore.error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQueueStore } from '@/stores/queueStore'
import WelcomeScreen from '@/components/kiosk/WelcomeScreen.vue'
import ServiceSelection from '@/components/kiosk/ServiceSelection.vue'
import TicketDisplay from '@/components/kiosk/TicketDisplay.vue'

const { t } = useI18n()
const queueStore = useQueueStore()
const step = ref('welcome')
const generatedTicket = ref(null)

onMounted(() => queueStore.fetchQueue())

async function handleServiceSelect(service) {
  step.value = 'loading'
  const ticket = await queueStore.generateTicket('Студент', service.purposeKey, service.id)
  if (ticket) {
    generatedTicket.value = { ...ticket, purposeKey: service.purposeKey }
    step.value = 'ticket'
    setTimeout(() => { step.value = 'welcome'; generatedTicket.value = null }, 10000)
  } else {
    step.value = 'service'
  }
}
</script>

<style scoped>
.kiosk-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a2332 0%, #2d3a4f 100%);
  display: flex; flex-direction: column;
}
.kiosk-header {
  background: rgba(0,0,0,0.3);
  padding: 30px 40px;
  border-bottom: 3px solid var(--color-accent);
}
.header-container {
  max-width: 1200px; margin: 0 auto;
  display: flex; justify-content: space-between; align-items: center;
}
.header-title { color: white; font-size: 36px; margin: 0; font-weight: 700; }
.header-right { display: flex; align-items: center; gap: 20px; }
.queue-counter {
  background: rgba(220,38,38,0.2); border: 2px solid var(--color-accent);
  border-radius: var(--border-radius-md); padding: 20px 30px; text-align: center;
}
.counter-label { color: rgba(255,255,255,0.7); font-size: 14px; margin-bottom: 5px; }
.counter-value { color: white; font-size: 42px; font-weight: 700; }
.kiosk-content {
  flex: 1; display: flex; align-items: center;
  justify-content: center; padding: 60px 40px; position: relative;
}
.loading-screen { text-align: center; color: white; }
.spinner {
  width: 60px; height: 60px;
  border: 4px solid rgba(255,255,255,0.2);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.error-toast {
  position: absolute; bottom: 30px;
  background: #dc2626; color: white;
  padding: 14px 24px; border-radius: 10px; font-size: 16px;
}
</style>