<template>
  <div style="min-height:100vh; background:#1a2332; display:flex; align-items:center; justify-content:center; color:white; text-align:center;">
    <div>
      <div v-if="status === 'loading'">Подтверждаем email...</div>
      <div v-else-if="status === 'success'">
        <h2>Email подтверждён!</h2>
        <p style="margin-top:20px">Перенаправляем на страницу входа...</p>
      </div>
      <div v-else>
        <h2>Ошибка подтверждения</h2>
        <p style="margin-top:20px">Ссылка недействительна или устарела</p>
        <button @click="$router.push('/login')" style="margin-top:30px; padding:12px 30px; background:#dc2626; color:white; border:none; border-radius:8px; cursor:pointer; font-size:16px;">
          Войти
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const status = ref('loading')

onMounted(async () => {
  try {
    await api.get(`/auth/verify/${route.params.token}`)
    status.value = 'success'
    setTimeout(() => router.push('/login'), 2000)
  } catch (e) {
    status.value = 'error'
  }
})
</script>