<template>
  <div class="login-view">
    <div class="lang-bar">
      <LangSwitcher />
    </div>
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo-circle">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h1 class="login-title">{{ t('login.title') }}</h1>
          <p class="login-subtitle">{{ t('login.subtitle') }}</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label class="form-label">{{ t('login.email') }}</label>
            <input
              v-model="formData.username"
              type="email"
              placeholder="username@alatoo.edu.kg"
              class="form-input"
              :class="{ 'input-error': errors.username }"
            />
            <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">{{ t('login.password') }}</label>
            <input
              v-model="formData.password"
              type="password"
              :placeholder="t('login.passwordPlaceholder')"
              class="form-input"
              :class="{ 'input-error': errors.password }"
            />
            <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          </div>

          <div class="forgot-row">
            <router-link to="/forgot-password" class="forgot-link">
              {{ t('login.forgotPassword') }}
            </router-link>
          </div>

          <div v-if="authStore.error" class="alert-error">{{ authStore.error }}</div>

          <button type="submit" class="login-button" :disabled="authStore.loading">
            {{ authStore.loading ? t('login.submitting') : t('login.submit') }}
          </button>
        </form>

        <div class="login-footer">
          <p class="footer-text">{{ t('login.contactAdmin') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import LangSwitcher from '@/components/common/LangSwitcher.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const formData = reactive({ username: '', password: '' })
const errors = reactive({ username: '', password: '' })

const validateForm = () => {
  errors.username = ''
  errors.password = ''
  let isValid = true
  if (!formData.username) { errors.username = t('login.emailRequired'); isValid = false }
  else if (!formData.username.endsWith('@alatoo.edu.kg')) { errors.username = t('login.emailInvalid'); isValid = false }
  if (!formData.password) { errors.password = t('login.passwordRequired'); isValid = false }
  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) return
  const result = await authStore.login(formData.username, formData.password)
  if (result.success) router.push('/staff')
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a2332 0%, #2d3a4f 100%);
  display: flex; align-items: center; justify-content: center;
  padding: 40px 20px; position: relative;
}
.lang-bar { position: absolute; top: 20px; right: 20px; }
.login-container { width: 100%; max-width: 480px; }
.login-card {
  background: white; border-radius: 20px; padding: 50px 40px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: fadeIn 0.5s ease-in;
}
.login-header { text-align: center; margin-bottom: 40px; }
.logo-circle {
  width: 100px; height: 100px;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  margin: 0 auto 25px; color: white;
}
.login-title { font-size: 28px; color: #1a2332; margin: 0 0 10px; font-weight: 700; }
.login-subtitle { font-size: 15px; color: #666; margin: 0; }
.login-form { margin-bottom: 30px; }
.form-group { margin-bottom: 25px; }
.form-label { display: block; font-size: 14px; font-weight: 600; color: #1a2332; margin-bottom: 8px; }
.form-input {
  width: 100%; padding: 14px 16px; font-size: 16px;
  border: 2px solid #e0e0e0; border-radius: 10px;
  outline: none; transition: all 0.3s; box-sizing: border-box;
}
.form-input:focus { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.1); }
.form-input.input-error { border-color: #dc2626; }
.error-message { display: block; color: #dc2626; font-size: 13px; margin-top: 5px; }
.alert-error {
  background: #fee; border: 1px solid #dc2626; color: #dc2626;
  padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 14px;
}
.login-button {
  width: 100%; padding: 16px; font-size: 18px; font-weight: 700;
  color: white; background: #dc2626; border: none; border-radius: 10px;
  cursor: pointer; transition: all 0.3s; text-transform: uppercase;
}
.login-button:hover:not(:disabled) { background: #b91c1c; transform: translateY(-2px); }
.login-button:disabled { opacity: 0.7; cursor: not-allowed; }
.login-footer { text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0; }
.footer-text { color: #999; font-size: 13px; margin: 0; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.forgot-row { display: flex; justify-content: flex-end; margin: -10px 0 18px; }
.forgot-link {
  color: #dc2626; font-size: 13px; font-weight: 600;
  text-decoration: underline; text-underline-offset: 3px;
  cursor: pointer; transition: color 0.2s;
}
.forgot-link:hover { color: #b91c1c; }
</style>