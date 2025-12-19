<template>
  <div class="kiosk-view">
    <div class="kiosk-header">
      <div class="header-container">
        <div class="header-info">
          <h1 class="header-title">{{ queueStore.departmentName }}</h1>
          <p class="header-subtitle">Электронная система управления очередью</p>
        </div>
        <div class="queue-counter">
          <div class="counter-label">В ОЧЕРЕДИ</div>
          <div class="counter-value">{{ queueStore.waitingTickets.length }}</div>
        </div>
      </div>
    </div>

    <div class="kiosk-content">
      <WelcomeScreen 
        v-if="step === 'welcome'" 
        @start="step = 'service'" 
      />
      
      <ServiceSelection 
        v-else-if="step === 'service'" 
        @select="handleServiceSelect"
        @back="step = 'welcome'"
      />
      
      <TicketDisplay 
        v-else-if="step === 'ticket'"
        :ticket="generatedTicket"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQueueStore } from '@/stores/queueStore'
import WelcomeScreen from '@/components/kiosk/WelcomeScreen.vue'
import ServiceSelection from '@/components/kiosk/ServiceSelection.vue'
import TicketDisplay from '@/components/kiosk/TicketDisplay.vue'

const queueStore = useQueueStore()
const step = ref('welcome')
const generatedTicket = ref(null)

function handleServiceSelect(service) {
  generatedTicket.value = queueStore.generateTicket('Студент', service)
  step.value = 'ticket'
  
  setTimeout(() => {
    step.value = 'welcome'
    generatedTicket.value = null
  }, 10000)
}
</script>

<style scoped>
.kiosk-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a2332 0%, #2d3a4f 100%);
  display: flex;
  flex-direction: column;
}

.kiosk-header {
  background: rgba(0, 0, 0, 0.3);
  padding: 30px 40px;
  border-bottom: 3px solid var(--color-accent);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  color: white;
  font-size: 36px;
  margin: 0 0 8px;
  font-weight: 700;
}

.header-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 18px;
  margin: 0;
}

.queue-counter {
  background: rgba(220, 38, 38, 0.2);
  border: 2px solid var(--color-accent);
  border-radius: var(--border-radius-md);
  padding: 20px 30px;
  text-align: center;
}

.counter-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin-bottom: 5px;
}

.counter-value {
  color: white;
  font-size: 42px;
  font-weight: 700;
}

.kiosk-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
}
</style>