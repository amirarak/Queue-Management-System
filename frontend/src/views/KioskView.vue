<template>
  <div class="kiosk-view">
    <div v-if="ticketError" class="kiosk-error">
      {{ ticketError }}
    </div>

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
const ticketError        = ref('')

const waitingCount = computed(() => store.waitingTickets.length)

function onDepartmentSelect(dept) {
  ticketError.value = ''
  selectedDepartment.value = dept
  step.value = 'service'
}

async function onServiceSelect(service) {
  ticketError.value = ''
  const departmentId = selectedDepartment.value?.id ?? selectedDepartment.value?.departmentId

  if (!departmentId || !service?.purposeKey) {
    ticketError.value = 'Не удалось определить услугу или факультет. Обновите страницу и попробуйте снова.'
    return
  }

  const ticket = await store.generateTicket(
    'Студент',
    service.purposeKey,
    departmentId,
    service.id
  )
  if (ticket) {
    createdTicket.value = ticket
    step.value = 'ticket'
    return
  }

  ticketError.value = store.error || 'Не удалось создать талон'
}

function resetKiosk() {
  step.value               = 'welcome'
  selectedDepartment.value = null
  createdTicket.value      = null
  ticketError.value        = ''
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

.kiosk-error {
  width: 100%;
  padding: 14px 20px;
  background: rgba(220, 38, 38, 0.16);
  color: #fee2e2;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
}
</style>