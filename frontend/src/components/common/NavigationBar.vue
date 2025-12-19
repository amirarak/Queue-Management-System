<template>
  <nav class="navigation-bar">
    <div class="nav-container">
      <router-link
        v-for="route in routes"
        :key="route.path"
        :to="route.path"
        class="nav-button"
        :class="{ active: isActive(route.path) }"
      >
        {{ route.label }}
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const routes = [
  { path: '/kiosk', label: 'Киоск для студентов' },
  { path: '/display', label: 'Электронное табло' },
  { path: '/staff', label: 'Панель сотрудника' }
]

const isActive = (path) => {
  return computed(() => route.path === path).value
}
</script>

<style scoped>
.navigation-bar {
  background: var(--color-primary);
  padding: 0 20px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  gap: 5px;
}

.nav-button {
  padding: 20px 30px;
  fontSize: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: block;
}

.nav-button:hover {
  color: white;
  background: rgba(255, 255, 255, 0.05);
}

.nav-button.active {
  color: white;
  background: var(--color-accent);
  border-bottom-color: var(--color-accent);
}
</style>