<template>
  <nav class="navigation-bar">
    <div class="nav-container">
      <div class="nav-links">
        <router-link
          v-for="route in visibleRoutes"
          :key="route.path"
          :to="route.path"
          class="nav-button"
          :class="{ active: isActive(route.path) }"
        >
          {{ route.label }}
        </router-link>
      </div>
      <LangSwitcher />
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import LangSwitcher from './LangSwitcher.vue'

const route = useRoute()
const authStore = useAuthStore()
const { t } = useI18n()

const isLoggedIn  = computed(() => authStore.isAuthenticated)
const isAdmin     = computed(() => authStore.user?.role === 'admin')

const allRoutes = computed(() => [
  
  { path: '/kiosk',      label: t('nav.kiosk'),    show: !isLoggedIn.value },
  { path: '/display',    label: t('nav.display'),  show: !isLoggedIn.value },

  { path: '/staff',      label: t('nav.staff'),    show: isLoggedIn.value },
  { path: '/management', label: t('nav.staffMgmt'),show: isAdmin.value },
  { path: '/analytics',  label: t('nav.analytics'),show: isAdmin.value }
])

const visibleRoutes = computed(() => allRoutes.value.filter(r => r.show))
const isActive = (path) => route.path === path
</script>

<style scoped>
.navigation-bar {
  background: var(--color-primary);
  padding: 0 20px;
  border-bottom: 2px solid rgba(255,255,255,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}
.nav-container {
  max-width: 1400px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between;
}
.nav-links { display: flex; gap: 5px; }
.nav-button {
  padding: 20px 25px; font-size: 15px; font-weight: 600;
  color: rgba(255,255,255,0.6); background: transparent;
  border: none; border-bottom: 3px solid transparent;
  cursor: pointer; transition: all 0.3s;
  text-decoration: none; display: block;
}
.nav-button:hover { color: white; background: rgba(255,255,255,0.05); }
.nav-button.active { color: white; background: var(--color-accent); border-bottom-color: var(--color-accent); }
</style>