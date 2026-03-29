<template>
  <nav class="nav-bar">
    <div class="nav-left">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-link"
        :class="{ active: $route.path.startsWith(item.to) }"
      >
        {{ item.label }}
      </router-link>
    </div>

    <div class="nav-right">
      <LangSwitcher />

      <div v-if="authStore.isAuthenticated" class="nav-user">
        <router-link to="/profile" class="nav-username">
          {{ authStore.userFullName }}
        </router-link>
        <button class="nav-logout" @click="showLogout = true">
          {{ t('common.logout') }}
        </button>
      </div>
    </div>

    <div v-if="showLogout" class="modal-overlay" @click.self="showLogout = false">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ t('common.logout') }}</h2>
          <button class="modal-close" @click="showLogout = false">✕</button>
        </div>
        <div class="modal-body">
          <p>{{ t('staffMgmt.logoutConfirmText') }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showLogout = false">{{ t('common.cancel') }}</button>
          <button class="btn-logout" @click="handleLogout">{{ t('common.logout') }}</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import LangSwitcher from '@/components/common/LangSwitcher.vue'

const { t } = useI18n()
const router    = useRouter()
const authStore = useAuthStore()
const showLogout = ref(false)

const navItems = computed(() => {
  const items = [
    { to: '/staff', label: t('nav.staff') }
  ]
  if (authStore.isAdmin) {
    items.push({ to: '/management', label: t('nav.staffMgmt') })
    items.push({ to: '/analytics',  label: t('nav.analytics') })
  }
  return items
})

async function handleLogout() {
  showLogout.value = false
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.nav-bar {
  background: rgba(28, 31, 44, 0.98);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  padding: 0 40px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  box-sizing: border-box;
}

.nav-left { display: flex; align-items: center; gap: 4px; }

.nav-link {
  padding: 8px 20px;
  color: rgba(255,255,255,0.6);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  border-radius: 0;
  transition: all 0.2s;
  white-space: nowrap;
  height: 60px;
  display: flex;
  align-items: center;
  border-bottom: 3px solid transparent;
  margin-top: 3px;
}
.nav-link:hover { color: white; background: rgba(255,255,255,0.06); }

.nav-link.active {
  color: white;
  background: var(--color-accent, #dc2626);
  border-bottom-color: transparent;
}

.nav-right { display: flex; align-items: center; gap: 16px; }

.nav-user { display: flex; align-items: center; gap: 12px; }

.nav-username {
  color: rgba(255,255,255,0.8);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}
.nav-username:hover { color: white; }

.nav-logout {
  padding: 8px 18px;
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.7);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.nav-logout:hover {
  background: var(--color-accent, #dc2626);
  border-color: var(--color-accent, #dc2626);
  color: white;
}

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #1e2536; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; width: 100%; max-width: 380px; box-shadow: 0 25px 60px rgba(0,0,0,0.6); animation: pop 0.2s ease; }
@keyframes pop { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 22px 28px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.modal-header h2 { font-size: 18px; color: white; margin: 0; }
.modal-close { background: none; border: none; color: rgba(255,255,255,0.4); font-size: 18px; cursor: pointer; }
.modal-body { padding: 24px 28px; }
.modal-body p { color: rgba(255,255,255,0.75); font-size: 15px; margin: 0; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 18px 28px; border-top: 1px solid rgba(255,255,255,0.08); }
.btn-cancel { padding: 10px 20px; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); border: none; border-radius: 8px; cursor: pointer; font-size: 15px; }
.btn-cancel:hover { background: rgba(255,255,255,0.12); }
.btn-logout { padding: 10px 24px; background: var(--color-accent, #dc2626); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: 600; }
.btn-logout:hover { background: #b91c1c; }
</style>