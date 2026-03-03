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
            <button type="button" class="forgot-link" @click="showForgot = true">
              {{ t('login.forgotPassword') }}
            </button>
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
    <Transition name="modal-fade">
      <div v-if="showForgot" class="modal-overlay" @click.self="showForgot = false">
        <div class="modal-box">
          <div class="modal-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 class="modal-title">{{ t('login.forgotTitle') }}</h2>
          <p class="modal-text">{{ t('login.forgotText') }}</p>
          <div class="modal-contact">{{ t('login.forgotContact') }}</div>
          <button class="modal-close-btn" @click="showForgot = false">{{ t('login.forgotClose') }}</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import LangSwitcher from '@/components/common/LangSwitcher.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const formData = reactive({ username: '', password: '' })
const errors = reactive({ username: '', password: '' })
const showForgot = ref(false)

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
.forgot-link { background: none; border: none; color: #dc2626; font-size: 13px; font-weight: 600; cursor: pointer; padding: 0; text-decoration: underline; text-underline-offset: 3px; }
.forgot-link:hover { color: #b91c1c; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.modal-box { background: white; border-radius: 18px; padding: 42px 36px; max-width: 400px; width: 90%; text-align: center; box-shadow: 0 24px 64px rgba(0,0,0,0.35); }
.modal-icon { width: 70px; height: 70px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: white; }
.modal-title { font-size: 20px; font-weight: 700; color: #1a2332; margin: 0 0 10px; }
.modal-text { font-size: 14px; color: #555; margin: 0 0 16px; line-height: 1.6; }
.modal-contact { font-size: 13px; font-weight: 600; color: #1a2332; background: #f8f9fb; border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px 16px; margin: 0 0 24px; }
.modal-close-btn { width: 100%; padding: 14px; font-size: 15px; font-weight: 700; color: white; background: #dc2626; border: none; border-radius: 10px; cursor: pointer; text-transform: uppercase; }
.modal-close-btn:hover { background: #b91c1c; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>