<template>
  <div class="staff-dashboard">
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div>
          <h1 class="dashboard-title">{{ t('staff.title') }}</h1>
          <p class="dashboard-subtitle">{{ t('dept.name') }} • {{ queueStore.currentDate }}</p>
        </div>
        <div class="header-right">
          <router-link to="/profile" class="user-info">
            <div class="avatar">{{ authStore.userFullName?.charAt(0) || '?' }}</div>
            <div class="user-text">
              <span class="user-name">{{ authStore.userFullName }}</span>
              <span class="user-role">{{ authStore.user?.role === 'admin' ? t('staff.adminRole') : t('staff.staffRole') }}</span>
            </div>
          </router-link>
          <button class="logout-btn" @click="showLogoutConfirm = true">{{ t('common.logout') }}</button>
        </div>
      </div>

      <StatsCards :waiting-count="queueStore.waitingTickets.length" :completed-count="queueStore.completedCount" />

      <div v-if="queueStore.error" class="error-banner">{{ queueStore.error }}</div>

      <div class="dashboard-content">
        <div class="control-section">
          <CurrentClientCard :ticket="queueStore.currentTicket" @complete="queueStore.completeTicket" />
          <button class="call-button" :disabled="!canCallNext || queueStore.loading" @click="handleCallNext">
            {{ queueStore.loading ? t('common.loading') : t('staff.callNext') }}
          </button>
        </div>
        <WaitingQueueList :tickets="queueStore.waitingTickets" />
      </div>
    </div>

    <!-- Подтверждение выхода -->
    <div v-if="showLogoutConfirm" class="modal-overlay" @click.self="showLogoutConfirm = false">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ t('logout.confirmTitle') }}</h2>
          <button class="modal-close" @click="showLogoutConfirm = false">✕</button>
        </div>
        <div class="modal-body">
          <p class="confirm-text">{{ t('logout.confirmText') }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showLogoutConfirm = false">{{ t('common.no') }}</button>
          <button class="btn-logout" @click="handleLogout">{{ t('common.yes') }}</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQueueStore } from '@/stores/queueStore'
import { useAuthStore } from '@/stores/authStore'
import StatsCards from '@/components/staff/StatsCards.vue'
import CurrentClientCard from '@/components/staff/CurrentClientCard.vue'
import WaitingQueueList from '@/components/staff/WaitingQueueList.vue'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()
const queueStore = useQueueStore()
const authStore = useAuthStore()
const showLogoutConfirm = ref(false)

const canCallNext = computed(() => queueStore.waitingTickets.length > 0 && !queueStore.currentTicket)

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

async function handleCallNext() { await queueStore.callNextTicket() }

let interval = null
onMounted(() => {
  queueStore.initialize()
  interval = setInterval(() => { queueStore.fetchQueue(); queueStore.fetchCurrent() }, 10000)
})
onUnmounted(() => { if (interval) clearInterval(interval) })
</script>

<style scoped>
.staff-dashboard { min-height: 100vh; background: var(--color-primary); color: white; padding: 40px; }
.dashboard-container { max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px; }
.dashboard-header { background: rgba(28,31,44,0.95); border-radius: var(--border-radius-lg); padding: 30px 40px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 5px 20px rgba(0,0,0,0.3); }
.dashboard-title { font-size: 36px; font-weight: 700; margin: 0 0 8px; }
.dashboard-subtitle { font-size: 18px; color: rgba(255,255,255,0.7); margin: 0; }
.header-right { display: flex; align-items: center; gap: 16px; }
.user-info { display: flex; align-items: center; gap: 12px; text-decoration: none; color: white; padding: 8px 12px; border-radius: 12px; transition: background 0.2s; }
.user-info:hover { background: rgba(255,255,255,0.08); }
.avatar { width: 42px; height: 42px; border-radius: 50%; background: var(--color-accent); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; }
.user-text { display: flex; flex-direction: column; gap: 2px; }
.user-name { font-size: 16px; font-weight: 600; }
.user-role { font-size: 13px; color: rgba(255,255,255,0.5); }
.logout-btn { padding: 10px 20px; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 10px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
.logout-btn:hover { background: var(--color-accent); border-color: var(--color-accent); }
.error-banner { background: rgba(220,38,38,0.2); border: 1px solid var(--color-accent); color: white; padding: 14px 20px; border-radius: 8px; }
.dashboard-content { display: grid; grid-template-columns: 1fr 2fr; gap: 40px; }
.control-section { display: flex; flex-direction: column; gap: 30px; }
.call-button { width: 100%; padding: 40px 20px; font-size: 24px; font-weight: 700; color: white; background: var(--color-accent); border: none; border-radius: var(--border-radius-lg); cursor: pointer; transition: all 0.3s; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 30px rgba(220,38,38,0.3); }
.call-button:hover:not(:disabled) { background: #b53131; transform: translateY(-2px); }
.call-button:disabled { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.3); cursor: not-allowed; }


.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #1e2536; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; width: 100%; max-width: 380px; box-shadow: 0 25px 60px rgba(0,0,0,0.6); animation: pop 0.2s ease; }
@keyframes pop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 22px 28px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.modal-header h2 { font-size: 18px; color: white; margin: 0; }
.modal-close { background: none; border: none; color: rgba(255,255,255,0.4); font-size: 18px; cursor: pointer; }
.modal-body { padding: 24px 28px; }
.confirm-text { color: rgba(255,255,255,0.75); font-size: 15px; margin: 0; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 18px 28px; border-top: 1px solid rgba(255,255,255,0.08); }
.btn-cancel { padding: 10px 20px; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); border: none; border-radius: 8px; cursor: pointer; font-size: 15px; }
.btn-cancel:hover { background: rgba(255,255,255,0.12); }
.btn-logout { padding: 10px 24px; background: var(--color-accent); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: 600; }
.btn-logout:hover { background: #b91c1c; }
</style>