<template>
  <div class="forgot-view">
    <div class="lang-bar">
      <LangSwitcher />
    </div>
    <div class="forgot-container">
      <div class="forgot-card">

        <div class="card-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        <template v-if="state === 'form'">
          <h1 class="card-title">{{ t('forgotPassword.title') }}</h1>
          <p class="card-sub">{{ t('forgotPassword.description') }}</p>

          <div class="form-group">
            <label>Email</label>
            <input
              v-model="email"
              type="email"
              class="form-input"
              placeholder="username@alatoo.edu.kg"
              @keyup.enter="handleSubmit"
            />
            <span v-if="errorMsg" class="err">{{ errorMsg }}</span>
          </div>

          <button class="submit-btn" :disabled="loading" @click="handleSubmit">
            {{ loading ? t('common.loading') : t('forgotPassword.submit') }}
          </button>

          <router-link to="/login" class="back-link">
            ← {{ t('forgotPassword.backToLogin') }}
          </router-link>
        </template>

        <template v-else-if="state === 'sent'">
          <div class="success-icon">✓</div>
          <h1 class="card-title">{{ t('forgotPassword.sentTitle') }}</h1>
          <p class="card-sub">
            {{ t('forgotPassword.sentDesc') }}<br>
            <strong>{{ email }}</strong>
          </p>
          <p class="card-note">{{ t('forgotPassword.sentNote') }}</p>
          <router-link to="/login" class="submit-btn" style="text-decoration:none;display:block;text-align:center">
            {{ t('forgotPassword.backToLogin') }}
          </router-link>
        </template>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { authAPI } from '@/services/api'
import LangSwitcher from '@/components/common/LangSwitcher.vue'

const { t } = useI18n()

const email    = ref('')
const loading  = ref(false)
const errorMsg = ref('')
const state    = ref('form') 

async function handleSubmit() {
  errorMsg.value = ''
  if (!email.value.trim()) {
    errorMsg.value = 'Введите email'
    return
  }
  if (!email.value.endsWith('@alatoo.edu.kg')) {
    errorMsg.value = 'Только @alatoo.edu.kg адреса'
    return
  }
  loading.value = true
  try {
    await authAPI.forgotPassword(email.value.trim())
    state.value = 'sent'
  } catch (e) {
    state.value = 'sent'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.forgot-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a2332 0%, #2d3a4f 100%);
  display: flex; align-items: center; justify-content: center;
  padding: 40px 20px; position: relative;
}
.lang-bar { position: absolute; top: 20px; right: 20px; }
.forgot-container { width: 100%; max-width: 440px; }
.forgot-card {
  background: white; border-radius: 20px; padding: 48px 40px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  text-align: center; animation: fadeIn 0.4s ease-in;
}
@keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

.card-icon {
  width: 80px; height: 80px;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 24px; color: white;
}
.success-icon {
  width: 80px; height: 80px;
  background: #22c55e; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 24px; font-size: 36px; color: white; font-weight: 700;
}
.card-title { font-size: 24px; font-weight: 700; color: #1a2332; margin: 0 0 10px; }
.card-sub { font-size: 15px; color: #666; margin: 0 0 28px; line-height: 1.6; }
.card-note { font-size: 13px; color: #999; margin: 0 0 24px; }

.form-group { text-align: left; margin-bottom: 20px; }
.form-group label { display: block; font-size: 13px; font-weight: 600; color: #1a2332; margin-bottom: 8px; }
.form-input {
  width: 100%; padding: 13px 16px; font-size: 15px;
  border: 2px solid #e0e0e0; border-radius: 10px;
  outline: none; box-sizing: border-box; transition: border-color 0.2s;
}
.form-input:focus { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.1); }
.err { display: block; color: #dc2626; font-size: 13px; margin-top: 5px; }

.submit-btn {
  width: 100%; padding: 15px; font-size: 16px; font-weight: 700;
  color: white; background: #dc2626; border: none; border-radius: 10px;
  cursor: pointer; transition: all 0.2s; margin-bottom: 16px;
}
.submit-btn:hover:not(:disabled) { background: #b91c1c; }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.back-link {
  display: block; color: #999; font-size: 14px;
  text-decoration: none; transition: color 0.2s;
}
.back-link:hover { color: #1a2332; }
</style>