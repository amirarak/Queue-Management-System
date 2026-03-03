<template>
  <div class="welcome-screen">
    <img src="@/assets/images/uni.logo.png" alt="University Logo" class="university-logo" />
    <h2 class="welcome-title">{{ t('kiosk.welcome') }}</h2>
    <p class="welcome-text">{{ t('kiosk.instruction') }}</p>
    <button class="start-button" @click="$emit('start')">
      {{ t('kiosk.start') }}
    </button>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
defineEmits(['start'])
</script>

<style scoped>
.welcome-screen {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  animation: fadeIn 0.5s ease-in;
}
.university-logo { width: 250px; height: auto; margin-bottom: 40px; display: block; border-radius: 50%; }
.welcome-title { color: white; font-size: 64px; margin: 0 0 20px; font-weight: 800; }
.welcome-text { color: #c5c5c5; font-size: 26px; margin: 0 0 80px; font-weight: 300; }
.start-button {
  padding: 25px 90px; font-size: 32px; font-weight: 700;
  color: white; background-color: #d32f2f; border: none;
  border-radius: 15px; cursor: pointer; text-transform: uppercase;
}
</style>