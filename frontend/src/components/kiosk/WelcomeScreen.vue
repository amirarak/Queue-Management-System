<template>
  <div class="welcome-screen">
    <div class="lang-switcher">
      <button
        v-for="lang in langs"
        :key="lang.code"
        class="lang-btn"
        :class="{ active: locale === lang.code }"
        @click="setLang(lang.code)"
      >
        {{ lang.label }}
      </button>
    </div>

    <img src="@/assets/images/uni.logo.png" alt="University Logo" class="university-logo" />
    <h2 class="welcome-title">TEST DEPLOY - KIOSK</h2>
    <p class="welcome-text">{{ t('kiosk.instruction') }}</p>
    <button class="start-button" @click="$emit('start')">
      {{ t('kiosk.start') }}
    </button>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()
defineEmits(['start'])

const langs = [
  { code: 'ru', label: 'РУ' },
  { code: 'ky', label: 'КЫР' },
  { code: 'en', label: 'EN' },
]

function setLang(code) {
  locale.value = code
  localStorage.setItem('lang', code)
}
</script>

<style scoped>
.welcome-screen {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  position: relative;
  animation: fadeIn 0.5s ease-in;
}

.lang-switcher {
  position: absolute;
  top: 24px;
  right: 32px;
  display: flex;
  gap: 8px;
}
.lang-btn {
  padding: 8px 14px;
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 8px;
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.7);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.lang-btn:hover { background: rgba(255,255,255,0.15); color: white; }
.lang-btn.active {
  background: var(--color-accent, #dc2626);
  border-color: var(--color-accent, #dc2626);
  color: white;
}

.university-logo { width: 250px; height: 250px; object-fit: cover; margin-bottom: 32px; display: block; border-radius: 50%; margin-top: -20px; }
.welcome-title { color: white; font-size: 64px; margin: 0 0 20px; font-weight: 800; }
.welcome-text { color: #c5c5c5; font-size: 26px; margin: 0 0 80px; font-weight: 300; }
.start-button {
  padding: 25px 90px; font-size: 32px; font-weight: 700;
  color: white; background-color: #dc2626; border: none;
  border-radius: 15px; cursor: pointer; text-transform: uppercase;
  transition: background 0.2s;
}
.start-button:hover { background-color: #b91c1c; }

@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>