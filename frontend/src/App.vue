<template>
  <div class="app">
    <NavigationBar />
    <router-view />
  </div>
</template>

<script setup>
import NavigationBar from './components/common/NavigationBar.vue'
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
