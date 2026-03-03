<template>
  <div class="app">
    <NavigationBar v-if="showNav" />
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavigationBar from './components/common/NavigationBar.vue'

const route = useRoute()


const showNav = computed(() =>
  !['Login', 'Register'].includes(route.name)
)
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--color-primary);
}

.app {
  min-height: 100vh;
  background-color: var(--color-primary);
}
</style>