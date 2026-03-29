<template>
  <div class="kiosk-view">
    <WelcomeScreen
      v-if="step === 'welcome'"
      @start="step = 'department'"
    />

    <DepartmentSelection
      v-else-if="step === 'department'"
      @select="onDepartmentSelect"
      @back="step = 'welcome'"
    />

    <ServiceSelection
      v-else-if="step === 'service'"
      :department="selectedDepartment"
      @select="onServiceSelect"
      @back="step = 'department'"
    />

    <TicketDisplay
      v-else-if="step === 'ticket'"
      :ticket="createdTicket"
      :queue-length="waitingCount"
      @done="resetKiosk"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import WelcomeScreen       from '@/components/kiosk/WelcomeScreen.vue'
import DepartmentSelection from '@/components/kiosk/DepartmentSelection.vue'
import ServiceSelection    from '@/components/kiosk/ServiceSelection.vue'
import TicketDisplay       from '@/components/kiosk/TicketDisplay.vue'
import { useQueueStore }   from '@/stores/queueStore'

const store = useQueueStore()

const step               = ref('welcome')
const selectedDepartment = ref(null)
const createdTicket      = ref(null)

const waitingCount = computed(() => store.waitingTickets.length)

function onDepartmentSelect(dept) {
  selectedDepartment.value = dept
  step.value = 'service'
}

async function onServiceSelect(service) {
  const ticket = await store.generateTicket(
    'Студент',
    service.purposeKey,          
    selectedDepartment.value.id  
  )
  if (ticket) {
    createdTicket.value = ticket
    step.value = 'ticket'
  }
}

function resetKiosk() {
  step.value               = 'welcome'
  selectedDepartment.value = null
  createdTicket.value      = null
}
</script>

<style scoped>
.kiosk-view {
  width: 100%;
  min-height: 100vh;
  background: var(--color-primary);
  display: flex;
  flex-direction: column;
}
</style>