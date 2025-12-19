<template>
  <div class="staff-dashboard">
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1 class="dashboard-title">Панель управления</h1>
        <p class="dashboard-subtitle">
          {{ queueStore.departmentName }} • {{ queueStore.currentDate }}
        </p>
      </div>

      <StatsCards
        :waiting-count="queueStore.waitingTickets.length"
        :completed-count="queueStore.completedTickets.length"
      />

      <div class="dashboard-content">
        <div class="control-section">
          <CurrentClientCard
            :ticket="queueStore.currentTicket"
            @complete="queueStore.completeTicket"
          />

          <button
            class="call-button"
            :disabled="!canCallNext"
            @click="queueStore.callNextTicket"
          >
            Вызвать следующего
          </button>
        </div>

        <WaitingQueueList :tickets="queueStore.waitingTickets" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQueueStore } from '@/stores/queueStore'
import StatsCards from '@/components/staff/StatsCards.vue'
import CurrentClientCard from '@/components/staff/CurrentClientCard.vue'
import WaitingQueueList from '@/components/staff/WaitingQueueList.vue'

const queueStore = useQueueStore()

const canCallNext = computed(() => {
  return (
  Array.isArray(queueStore.waitingTickets) &&
  queueStore.waitingTickets.length > 0 &&
  !queueStore.currentTicket
)

})
</script>

<style scoped>
.staff-dashboard {
  min-height: 100vh;
  background: var(--color-primary); 
  color: white;
  padding: 40px;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', sans-serif;
}

.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.dashboard-header {
  background: rgba(28, 31, 44, 0.95); 
  color: white;
  border-radius: var(--border-radius-lg);
  padding: 30px 40px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.3);
}

.dashboard-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0;
}

.dashboard-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 40px;
}


.control-section {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.call-button {
  width: 100%;
  padding: 40px 20px; 
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  background: var(--color-accent);
  border: none;
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 10px 30px rgba(220, 38, 38, 0.3);
}

.call-button:hover:not(:disabled) {
  background: #b53131;
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(220, 38, 38, 0.4);
}

.call-button:disabled {
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.5);
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.current-ticket {
  background: var(--color-accent);
  border-radius: var(--border-radius-lg);
  padding: 60px 40px;
  text-align: center;
  font-size: 48px;
  font-weight: 700;
  box-shadow: 0 10px 40px rgba(220,38,38,0.3);
  animation: pulse 2s ease-in-out infinite;
  color: white;
}

.queue-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.queue-item {
  background: rgba(255,255,255,0.05);
  border-radius: var(--border-radius-md);
  padding: 30px;
  transition: all 0.3s;
}

.queue-item.is-next {
  background: rgba(220, 38, 38, 0.2);
  border: 2px solid var(--color-accent);
}

.item-number {
  font-size: 48px;
  font-weight: 700;
}

.next-badge {
  background: var(--color-accent);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}
</style>
