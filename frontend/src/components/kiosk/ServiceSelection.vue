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
defineProps({ department: Object })
defineEmits(['select', 'back'])

const localizedServices = computed(() => [
  { purposeKey: 'services.certificate',      title: t('services.certificate') },
  { purposeKey: 'services.academicLeave',    title: t('services.academicLeave') },
  { purposeKey: 'services.transfer',         title: t('services.transfer') },
  { purposeKey: 'services.curriculumChange', title: t('services.curriculumChange') },
  { purposeKey: 'services.consultation',     title: t('services.consultation') },
  { purposeKey: 'services.other',            title: t('services.other') }
])
</script>

<style scoped>
.service-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 24px;
  box-sizing: border-box;
  animation: fadeIn 0.5s ease-in;
}
.title {
  color: white;
  font-size: clamp(28px, 4vw, 48px);
  text-align: center;
  margin: 0 0 40px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
}
.services-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
  margin-bottom: 40px;
}
.service-button {
  background: white;
  border: 3px solid transparent;
  border-radius: var(--border-radius-md, 12px);
  padding: clamp(28px, 4vw, 45px) clamp(20px, 3vw, 40px);
  font-size: clamp(16px, 2vw, 24px);
  font-weight: 600;
  color: var(--color-primary, #1a2332);
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: var(--shadow-md, 0 10px 30px rgba(0,0,0,0.2));
  text-align: center;
  line-height: 1.4;
  min-height: clamp(100px, 12vw, 160px);
  display: flex;
  align-items: center;
  justify-content: center;
}
.service-button:hover {
  transform: translateY(-5px);
  border-color: var(--color-accent, #dc2626);
  box-shadow: 0 15px 40px rgba(220,38,38,0.3);
}
.back-button {
  display: block;
  padding: 16px 60px;
  font-size: clamp(16px, 2vw, 20px);
  font-weight: 600;
  color: white;
  background: rgba(255,255,255,0.1);
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: var(--border-radius-md, 12px);
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.back-button:hover { background: rgba(255,255,255,0.2); }
@media (max-width: 600px) { .services-grid { grid-template-columns: 1fr; } }
</style>