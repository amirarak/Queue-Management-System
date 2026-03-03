<template>
  <div class="set-password-page">
    <div class="card">
      <div class="logo">
        <h1>Ala-Too</h1>
        <p>International University</p>
      </div>

      
      <div v-if="state === 'loading'" class="state-box">
        <div class="spinner"></div>
        <p>Проверяем ссылку...</p>
      </div>

    
      <div v-else-if="state === 'invalid'" class="state-box error">
        <div class="icon">✗</div>
        <h2>Ссылка недействительна</h2>
        <p>Эта ссылка уже использована или устарела. Обратитесь к администратору.</p>
      </div>

     
      <div v-else-if="state === 'form'">
        <h2 class="form-title">Установите пароль</h2>
        <p class="form-sub">Придумайте пароль для входа в систему</p>

        <div class="form-group">
          <label>Новый пароль</label>
          <input
            v-model="password"
            type="password"
            class="form-input"
            placeholder="Минимум 8 символов"
            @keyup.enter="handleSubmit"
          />
          <span v-if="errors.password" class="err">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <label>Повторите пароль</label>
          <input
            v-model="passwordConfirm"
            type="password"
            class="form-input"
            placeholder="Введите пароль ещё раз"
            @keyup.enter="handleSubmit"
          />
          <span v-if="errors.confirm" class="err">{{ errors.confirm }}</span>
        </div>

        <div class="requirements">
          <div :class="['req', password.length >= 8 ? 'ok' : '']">{{ password.length >= 8 ? '✓' : '○' }} Минимум 8 символов</div>
          <div :class="['req', /[A-Z]/.test(password) ? 'ok' : '']">{{ /[A-Z]/.test(password) ? '✓' : '○' }} Заглавная буква</div>
          <div :class="['req', /[0-9]/.test(password) ? 'ok' : '']">{{ /[0-9]/.test(password) ? '✓' : '○' }} Цифра</div>
        </div>

        <div v-if="errorMsg" class="alert-error">{{ errorMsg }}</div>

        <button class="submit-btn" :disabled="submitting" @click="handleSubmit">
          {{ submitting ? 'Сохранение...' : 'Установить пароль' }}
        </button>
      </div>

     
      <div v-else-if="state === 'success'" class="state-box success">
        <div class="icon">✓</div>
        <h2>Пароль установлен!</h2>
        <p>Теперь вы можете войти в систему.</p>
        <button class="submit-btn" @click="goToLogin">Перейти ко входу</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authAPI } from '@/services/api'

const route = useRoute()
const router = useRouter()

const state = ref('loading')  
const password = ref('')
const passwordConfirm = ref('')
const errors = ref({})
const errorMsg = ref('')
const submitting = ref(false)
const token = ref('')

onMounted(() => {
  token.value = route.query.token || route.params.token || ''
  if (!token.value) {
    state.value = 'invalid'
    return
  }

  state.value = 'form'
})

function validate() {
  errors.value = {}
  if (password.value.length < 8) {
    errors.value.password = 'Минимум 8 символов'
    return false
  }
  if (password.value !== passwordConfirm.value) {
    errors.value.confirm = 'Пароли не совпадают'
    return false
  }
  return true
}

async function handleSubmit() {
  if (!validate()) return
  submitting.value = true
  errorMsg.value = ''
  try {
    await authAPI.setPassword(token.value, password.value)
    state.value = 'success'
  } catch (e) {
    const msg = e.response?.data?.message || 'Ошибка. Попробуйте снова.'
    if (msg.includes('недействит') || msg.includes('invalid')) {
      state.value = 'invalid'
    } else {
      errorMsg.value = msg
    }
  } finally {
    submitting.value = false
  }
}

function goToLogin() {
  router.push('/login')
}
</script>

<style scoped>
.set-password-page {
  min-height: 100vh;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Segoe UI', sans-serif;
}
.card {
  background: rgba(28,31,44,0.98);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 48px 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 25px 60px rgba(0,0,0,0.5);
}
.logo { text-align: center; margin-bottom: 32px; }
.logo h1 { color: white; font-size: 28px; font-weight: 700; margin: 0 0 4px; }
.logo p { color: rgba(255,255,255,0.4); font-size: 13px; margin: 0; }

.form-title { color: white; font-size: 22px; font-weight: 700; margin: 0 0 8px; text-align: center; }
.form-sub { color: rgba(255,255,255,0.5); font-size: 14px; text-align: center; margin: 0 0 28px; }

.form-group { margin-bottom: 18px; }
.form-group label { display: block; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.6); margin-bottom: 8px; }
.form-input {
  width: 100%; padding: 13px 16px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 10px; color: white; font-size: 15px;
  outline: none; box-sizing: border-box; transition: border-color 0.2s;
}
.form-input:focus { border-color: var(--color-accent); }
.err { display: block; color: #f87171; font-size: 12px; margin-top: 5px; }

.requirements { margin: 4px 0 20px; display: flex; flex-direction: column; gap: 6px; }
.req { font-size: 13px; color: rgba(255,255,255,0.35); transition: color 0.2s; }
.req.ok { color: #4ade80; }

.alert-error {
  background: rgba(220,38,38,0.15); border: 1px solid rgba(220,38,38,0.3);
  color: #f87171; padding: 12px 16px; border-radius: 8px; font-size: 14px; margin-bottom: 16px;
}
.submit-btn {
  width: 100%; padding: 14px;
  background: var(--color-accent); color: white;
  border: none; border-radius: 10px;
  font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s; margin-top: 8px;
}
.submit-btn:hover:not(:disabled) { background: #b91c1c; transform: translateY(-1px); }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }


.state-box { text-align: center; padding: 20px 0; }
.state-box h2 { color: white; margin: 16px 0 8px; font-size: 20px; }
.state-box p { color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
.icon {
  width: 64px; height: 64px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; font-weight: 700; margin: 0 auto 8px;
}
.success .icon { background: rgba(34,197,94,0.2); color: #4ade80; }
.error .icon { background: rgba(220,38,38,0.2); color: #f87171; }
.spinner {
  width: 44px; height: 44px; border: 3px solid rgba(255,255,255,0.15);
  border-top-color: var(--color-accent); border-radius: 50%;
  animation: spin 0.8s linear infinite; margin: 0 auto 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>