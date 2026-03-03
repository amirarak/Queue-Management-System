<template>
  <div class="service-selection">
    <h2 class="title">{{ t('kiosk.selectService') }}</h2>

    <div class="services-grid">
      <button
        v-for="service in localizedServices"
        :key="service.id"
        class="service-button"
        @click="$emit('select', service)"
      >
        {{ service.title }}
      </button>
    </div>

    <button class="back-button" @click="$emit('back')">
      ← {{ t('common.back') }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
defineEmits(['select', 'back'])


const localizedServices = computed(() => [
  { id: 1, purposeKey: 'services.certificate',     title: t('services.certificate') },
  { id: 2, purposeKey: 'services.academicLeave',   title: t('services.academicLeave') },
  { id: 3, purposeKey: 'services.transfer',        title: t('services.transfer') },
  { id: 4, purposeKey: 'services.curriculumChange',title: t('services.curriculumChange') },
  { id: 5, purposeKey: 'services.consultation',    title: t('services.consultation') },
  { id: 6, purposeKey: 'services.other',           title: t('services.other') }
])
</script>

<style scoped>
.service-selection { max-width: 1000px; width: 100%; animation: fadeIn 0.5s ease-in; }
.title { color: white; font-size: 48px; text-align: center; margin-bottom: 60px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }
.services-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 50px; }
.service-button {
  background: white; border: 3px solid transparent;
  border-radius: var(--border-radius-md); padding: 45px 40px;
  font-size: 24px; font-weight: 600; color: var(--color-primary);
  cursor: pointer; transition: all 0.3s; box-shadow: var(--shadow-md);
  text-align: center; line-height: 1.4;
}
.service-button:hover { transform: translateY(-5px); border-color: var(--color-accent); box-shadow: 0 15px 40px rgba(220,38,38,0.3); }
.back-button {
  display: block; margin: 0 auto; padding: 20px 60px; font-size: 20px;
  font-weight: 600; color: white; background: rgba(255,255,255,0.1);
  border: 2px solid rgba(255,255,255,0.3); border-radius: var(--border-radius-md);
  cursor: pointer; transition: all 0.3s; text-transform: uppercase; letter-spacing: 1px;
}
.back-button:hover { background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.5); }
</style>