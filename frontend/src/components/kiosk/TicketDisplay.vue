<template>
  <div class="ticket-display">
    <div class="ticket-card">
      <div class="ticket-number-circle">
        <div class="ticket-label">Талон</div>
        <div class="ticket-number">{{ ticket.number }}</div>
      </div>

      <h2 class="ticket-success-title">Ваш номер принят!</h2>
      
      <div class="ticket-info">
        <div class="info-row">
          <div class="info-label">Услуга</div>
          <div class="info-value">{{ ticket.purpose }}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Время получения</div>
          <div class="info-value">{{ ticket.timestamp }}</div>
        </div>
      </div>

      <div class="ticket-notice">
        <p class="notice-title">📺 Следите за табло</p>
        <p class="notice-text">Ожидайте вызова вашего номера</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  ticket: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.ticket-display {
  animation: fadeIn 0.5s ease-in;
}

.ticket-card {
  background: white;
  border-radius: var(--border-radius-xl);
  padding: 80px 60px;
  max-width: 700px;
  margin: 0 auto;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
  text-align: center;
}

.ticket-number-circle {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  border-radius: var(--border-radius-xl);
  width: 220px;
  height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 40px;
  box-shadow: 0 20px 60px rgba(220, 38, 38, 0.5);
  animation: scaleIn 0.6s ease-out;
}

.ticket-label {
  font-size: 28px;
  margin-bottom: 10px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.ticket-number {
  font-size: 90px;
  font-weight: 900;
  line-height: 1;
}

.ticket-success-title {
  color: var(--color-primary);
  font-size: 32px;
  margin: 0 0 30px;
  font-weight: 700;
}

.ticket-info {
  background: var(--color-gray-light);
  border-radius: var(--border-radius-lg);
  padding: 30px;
  margin: 30px 0;
  text-align: left;
}

.info-row {
  margin-bottom: 20px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  color: var(--color-gray-medium);
  font-size: 14px;
  margin-bottom: 5px;
  text-transform: uppercase;
}

.info-value {
  color: var(--color-primary);
  font-size: 22px;
  font-weight: 600;
}

.ticket-notice {
  background: rgba(220, 38, 38, 0.1);
  border: 2px solid var(--color-accent);
  border-radius: var(--border-radius-md);
  padding: 25px;
  margin-top: 30px;
}

.notice-title {
  color: var(--color-accent);
  font-size: 18px;
  margin: 0 0 10px;
  font-weight: 600;
}

.notice-text {
  color: var(--color-gray-dark);
  font-size: 16px;
  margin: 0;
}
</style>