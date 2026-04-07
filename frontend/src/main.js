import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import i18n from './i18n'
import { useAuthStore } from './stores/authStore'
import './assets/styles/global.css'
import './assets/styles/adaptive.css'   

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

const authStore = useAuthStore(pinia)

authStore.checkAuth().finally(async () => {
	await router.isReady()
	app.mount('#app')
})