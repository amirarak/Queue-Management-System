<template>
  <div class="lang-switcher">
    <button
      v-for="lang in languages"
      :key="lang.code"
      class="lang-btn"
      :class="{ active: locale === lang.code }"
      @click="switchLang(lang.code)"
    >
      {{ lang.label }}
    </button>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const languages = [
  { code: 'ru', label: 'РУ' },
  { code: 'ky', label: 'КЫР' },
  { code: 'en', label: 'EN' }
]

function switchLang(code) {
  locale.value = code
  localStorage.setItem('locale', code)
}
</script>

<style scoped>
.lang-switcher {
  display: flex;
  gap: 4px;
}

.lang-btn {
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.5px;
}

.lang-btn:hover {
  color: white;
  border-color: rgba(255, 255, 255, 0.5);
}

.lang-btn.active {
  color: white;
  background: var(--color-accent);
  border-color: var(--color-accent);
}
</style>