<template>
  <div class="dept-screen">

    <div class="dept-header">
      <h2 class="dept-title">{{ $t('kiosk.selectDepartment') }}</h2>
    </div>

    <div v-if="loading" class="dept-loading">{{ $t('common.loading') }}</div>

    <div v-else class="dept-grid">
      <button
        v-for="dept in departments"
        :key="dept.id"
        class="dept-card"
        @click="$emit('select', dept)"
      >
        <div class="dept-card__body">
          <span class="dept-card__name">{{ getDeptName(dept) }}</span>
        </div>
        <div class="dept-card__arrow">→</div>
      </button>
    </div>

    <button class="dept-back" @click="$emit('back')">
      ← {{ $t('common.back') }}
    </button>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/services/api'

const { locale } = useI18n()
defineEmits(['select', 'back'])

const departments = ref([])
const loading     = ref(true)

function getDeptName(dept) {
  if (locale.value === 'en') return dept.nameEn
  if (locale.value === 'ky') return dept.nameKy
  return dept.nameRu
}

onMounted(async () => {
  try {
    const res    = await api.get('/users/departments')
    departments.value = res.data.data
  } catch (e) {
    console.error('Failed to load departments:', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.dept-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: clamp(24px, 4vw, 56px) clamp(20px, 5vw, 48px);
  gap: clamp(20px, 3vw, 36px);
  background: #1a2332;
}

.dept-header { text-align: center; }

.dept-title {
  margin: 0;
  font-size: clamp(22px, 3.5vw, 36px);
  font-weight: 700;
  color: #ffffff;
}

.dept-loading {
  color: rgba(255,255,255,0.5);
  font-size: 16px;
}

.dept-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 560px;
}

.dept-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: clamp(18px, 2.5vw, 24px) clamp(20px, 3vw, 28px);
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 14px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: background 0.18s, border-color 0.18s, transform 0.12s;
  position: relative;
  overflow: hidden;
}

.dept-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: #dc2626;
  transform: scaleY(0);
  transform-origin: center;
  transition: transform 0.18s;
}

.dept-card:hover {
  background: rgba(255,255,255,0.09);
  border-color: rgba(220,38,38,0.35);
  transform: translateX(4px);
}
.dept-card:hover::before { transform: scaleY(1); }
.dept-card:active        { transform: translateX(2px) scale(0.99); }

.dept-card__body { flex: 1; }

.dept-card__name {
  display: block;
  font-size: clamp(15px, 2vw, 18px);
  font-weight: 600;
  color: rgba(255,255,255,0.92);
  line-height: 1.35;
}

.dept-card__arrow {
  font-size: 18px;
  color: rgba(255,255,255,0.2);
  transition: color 0.18s, transform 0.18s;
  flex-shrink: 0;
}
.dept-card:hover .dept-card__arrow { color: #dc2626; transform: translateX(3px); }

.dept-back {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.5);
  padding: 10px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.dept-back:hover { border-color: rgba(255,255,255,0.35); color: rgba(255,255,255,0.85); }

@media (hover: none) {
  .dept-card:hover { background: rgba(255,255,255,0.05); transform: none; }
  .dept-card:active { background: rgba(255,255,255,0.1); transform: scale(0.98); }
}
</style>