<template>
  <div class="profile-page">
    <div class="page-container">

      <div class="page-header">
        <button class="back-btn" @click="router.back()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          {{ t('profile.back') }}
        </button>
        <h1 class="page-title">{{ t('profile.title') }}</h1>
      </div>

      <div class="profile-grid">

        
        <div class="left-col">
          <div class="avatar-card">
            <div class="avatar-circle">{{ authStore.userFullName?.charAt(0) || '?' }}</div>
            <h2 class="profile-name">{{ authStore.userFullName }}</h2>
            <span class="role-badge" :class="authStore.user?.role">
              {{ authStore.user?.role === 'admin' ? t('staff.adminRole') : t('staff.staffRole') }}
            </span>
            <p class="profile-email">{{ authStore.user?.username }}</p>

            <div class="stats-mini">
              <div class="stat-item">
                <span class="stat-val">{{ userDaysInSystem }}</span>
                <span class="stat-lbl">{{ t('profile.daysInSystem') }}</span>
              </div>
            </div>
          </div>
        </div>

        
        <div class="right-col">

          
          <div class="card">
            <h3 class="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              {{ t('profile.personalData') }}
            </h3>

            <div class="form-row">
              <div class="form-group">
                <label>{{ t('profile.fullName') }}</label>
                <input v-model="infoForm.fullName" type="text" class="form-input" />
                <span v-if="infoErrors.fullName" class="err">{{ infoErrors.fullName }}</span>
              </div>
              <div class="form-group">
                <label>{{ t('profile.email') }}</label>
                <input :value="authStore.user?.username" type="email" class="form-input" disabled />
                <span class="hint">{{ t('profile.emailHint') }}</span>
              </div>
            </div>

            <div v-if="infoSuccess" class="alert-success">{{ infoSuccess }}</div>
            <div v-if="infoError" class="alert-error">{{ infoError }}</div>

            <div class="card-footer">
              <button class="btn-primary" :disabled="savingInfo" @click="saveInfo">
                {{ savingInfo ? t('profile.saving') : t('profile.saveChanges') }}
              </button>
            </div>
          </div>

          
          <div class="card">
            <h3 class="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              {{ t('profile.changePassword') }}
            </h3>

            <div class="form-group">
              <label>{{ t('profile.currentPassword') }}</label>
              <div class="input-wrap">
                <input
                  v-model="passForm.current"
                  :type="showPass.current ? 'text' : 'password'"
                  class="form-input"
                  :placeholder="t('profile.currentPasswordPlaceholder')"
                />
                <button class="eye-btn" type="button" @click="showPass.current = !showPass.current">
                  <svg v-if="showPass.current" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
              <span v-if="passErrors.current" class="err">{{ passErrors.current }}</span>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>{{ t('profile.newPassword') }}</label>
                <div class="input-wrap">
                  <input
                    v-model="passForm.newPass"
                    :type="showPass.new ? 'text' : 'password'"
                    class="form-input"
                    :placeholder="t('profile.newPasswordPlaceholder')"
                  />
                  <button class="eye-btn" type="button" @click="showPass.new = !showPass.new">
                    <svg v-if="showPass.new" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
                <span v-if="passErrors.newPass" class="err">{{ passErrors.newPass }}</span>
              </div>
              <div class="form-group">
                <label>{{ t('profile.confirmPassword') }}</label>
                <div class="input-wrap">
                  <input
                    v-model="passForm.confirm"
                    :type="showPass.confirm ? 'text' : 'password'"
                    class="form-input"
                    :placeholder="t('profile.confirmPasswordPlaceholder')"
                  />
                  <button class="eye-btn" type="button" @click="showPass.confirm = !showPass.confirm">
                    <svg v-if="showPass.confirm" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
                <span v-if="passErrors.confirm" class="err">{{ passErrors.confirm }}</span>
              </div>
            </div>

            <div v-if="passForm.newPass" class="strength-wrap">
              <div class="strength-bar">
                <div class="strength-fill" :class="passwordStrength.level" :style="{ width: passwordStrength.pct + '%' }"></div>
              </div>
              <span class="strength-label" :class="passwordStrength.level">{{ passwordStrength.label }}</span>
            </div>

            <div v-if="passSuccess" class="alert-success">{{ passSuccess }}</div>
            <div v-if="passError" class="alert-error">{{ passError }}</div>

            <div class="card-footer">
              <button class="btn-primary" :disabled="savingPass" @click="changePassword">
                {{ savingPass ? t('profile.saving') : t('profile.changePasswordBtn') }}
              </button>
            </div>
          </div>

          
          <div class="card">
            <h3 class="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {{ t('profile.activity') }}
            </h3>
            <div class="info-rows">
              <div class="info-row">
                <span class="info-key">{{ t('profile.lastLogin') }}</span>
                <span class="info-val">{{ formatDate(authStore.user?.lastLogin) }}</span>
              </div>
              <div class="info-row">
                <span class="info-key">{{ t('profile.status') }}</span>
                <span class="badge active">{{ t('profile.statusActive') }}</span>
              </div>
              <div class="info-row">
                <span class="info-key">{{ t('profile.roleLabel') }}</span>
                <span class="badge" :class="authStore.user?.role">
                  {{ authStore.user?.role === 'admin' ? t('staff.adminRole') : t('staff.staffRole') }}
                </span>
              </div>
              <div class="info-row">
                <span class="info-key">{{ t('profile.createdAt') }}</span>
                <span class="info-val">{{ formatDate(authStore.user?.createdAt) }}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import { authAPI, adminAPI } from '@/services/api'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const infoForm = reactive({ fullName: authStore.userFullName || '' })
const infoErrors = reactive({ fullName: '' })
const savingInfo = ref(false)
const infoSuccess = ref('')
const infoError = ref('')

const passForm = reactive({ current: '', newPass: '', confirm: '' })
const passErrors = reactive({ current: '', newPass: '', confirm: '' })
const showPass = reactive({ current: false, new: false, confirm: false })
const savingPass = ref(false)
const passSuccess = ref('')
const passError = ref('')

const userDaysInSystem = computed(() => {
  if (!authStore.user?.createdAt) return '—'
  return Math.floor((Date.now() - new Date(authStore.user.createdAt)) / 86400000)
})

async function saveInfo() {
  infoErrors.fullName = ''
  infoSuccess.value = ''
  infoError.value = ''
  if (!infoForm.fullName.trim() || infoForm.fullName.length < 3) {
    infoErrors.fullName = t('profile.nameMinLength')
    return
  }
  savingInfo.value = true
  try {
    await adminAPI.updateStaff(authStore.user.id, { fullName: infoForm.fullName })
    authStore.user.fullName = infoForm.fullName
    localStorage.setItem('user', JSON.stringify(authStore.user))
    infoSuccess.value = t('profile.saveSuccess')
    setTimeout(() => { infoSuccess.value = '' }, 3000)
  } catch (e) {
    infoError.value = e.response?.data?.message || t('profile.saveError')
  } finally {
    savingInfo.value = false
  }
}

const passwordStrength = computed(() => {
  const p = passForm.newPass
  if (!p) return { level: '', pct: 0, label: '' }
  let score = 0
  if (p.length >= 8) score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  if (score <= 1) return { level: 'weak', pct: 25, label: t('profile.strengthWeak') }
  if (score <= 2) return { level: 'fair', pct: 50, label: t('profile.strengthFair') }
  if (score <= 3) return { level: 'good', pct: 75, label: t('profile.strengthGood') }
  return { level: 'strong', pct: 100, label: t('profile.strengthStrong') }
})

async function changePassword() {
  passErrors.current = ''
  passErrors.newPass = ''
  passErrors.confirm = ''
  passSuccess.value = ''
  passError.value = ''
  let ok = true
  if (!passForm.current) { passErrors.current = t('login.passwordRequired'); ok = false }
  if (passForm.newPass.length < 8) { passErrors.newPass = t('profile.minLength'); ok = false }
  if (passForm.newPass !== passForm.confirm) { passErrors.confirm = t('profile.passwordsNoMatch'); ok = false }
  if (!ok) return
  savingPass.value = true
  try {
    await authAPI.changePassword(passForm.current, passForm.newPass)
    passSuccess.value = t('profile.passwordSuccess')
    passForm.current = passForm.newPass = passForm.confirm = ''
    setTimeout(() => { passSuccess.value = '' }, 3000)
  } catch (e) {
    passError.value = e.response?.data?.message || t('profile.passwordError')
  } finally {
    savingPass.value = false
  }
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.profile-page { min-height: 100vh; background: var(--color-primary); color: white; padding: 40px; font-family: 'Segoe UI', sans-serif; }
.page-container { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 28px; }
.page-header { display: flex; align-items: center; gap: 20px; }
.back-btn { display: flex; align-items: center; gap: 6px; padding: 10px 18px; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
.back-btn:hover { background: rgba(255,255,255,0.14); color: white; }
.page-title { font-size: 28px; font-weight: 700; margin: 0; }
.profile-grid { display: grid; grid-template-columns: 280px 1fr; gap: 24px; align-items: start; }
.avatar-card { background: rgba(28,31,44,0.95); border-radius: 20px; padding: 36px 28px; text-align: center; box-shadow: 0 5px 20px rgba(0,0,0,0.3); }
.avatar-circle { width: 100px; height: 100px; border-radius: 50%; background: var(--color-accent); display: flex; align-items: center; justify-content: center; font-size: 42px; font-weight: 700; color: white; margin: 0 auto 20px; }
.profile-name { font-size: 20px; font-weight: 700; margin: 0 0 8px; }
.role-badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 8px; }
.role-badge.admin { background: rgba(220,38,38,0.2); color: #f87171; }
.role-badge.staff { background: rgba(59,130,246,0.2); color: #93c5fd; }
.profile-email { font-size: 13px; color: rgba(255,255,255,0.4); margin: 0 0 20px; word-break: break-all; }
.stats-mini { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; }
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.stat-val { font-size: 24px; font-weight: 700; color: white; }
.stat-lbl { font-size: 12px; color: rgba(255,255,255,0.4); }
.right-col { display: flex; flex-direction: column; gap: 20px; }
.card { background: rgba(28,31,44,0.95); border-radius: 20px; padding: 28px 32px; box-shadow: 0 5px 20px rgba(0,0,0,0.3); }
.card-title { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 600; margin: 0 0 24px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.card-footer { margin-top: 20px; display: flex; justify-content: flex-end; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { margin-bottom: 16px; display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.5); }
.form-input { width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; color: white; font-size: 15px; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
.form-input:focus { border-color: var(--color-accent); }
.form-input:disabled { opacity: 0.4; cursor: not-allowed; }
.hint { font-size: 12px; color: rgba(255,255,255,0.3); }
.err { font-size: 12px; color: #f87171; }
.input-wrap { position: relative; }
.input-wrap .form-input { padding-right: 44px; }
.eye-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.4); display: flex; align-items: center; padding: 0; transition: color 0.2s; }
.eye-btn:hover { color: white; }
.strength-wrap { display: flex; align-items: center; gap: 12px; margin: 4px 0 16px; }
.strength-bar { flex: 1; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
.strength-fill { height: 100%; border-radius: 3px; transition: all 0.3s; }
.strength-fill.weak { background: #ef4444; }
.strength-fill.fair { background: #f59e0b; }
.strength-fill.good { background: #3b82f6; }
.strength-fill.strong { background: #22c55e; }
.strength-label { font-size: 12px; font-weight: 600; min-width: 70px; }
.strength-label.weak { color: #ef4444; }
.strength-label.fair { color: #f59e0b; }
.strength-label.good { color: #3b82f6; }
.strength-label.strong { color: #22c55e; }
.info-rows { display: flex; flex-direction: column; }
.info-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
.info-row:last-child { border-bottom: none; }
.info-key { font-size: 14px; color: rgba(255,255,255,0.5); }
.info-val { font-size: 14px; color: white; }
.badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.badge.active { background: rgba(34,197,94,0.2); color: #86efac; }
.badge.admin { background: rgba(220,38,38,0.2); color: #f87171; }
.badge.staff { background: rgba(59,130,246,0.2); color: #93c5fd; }
.alert-success { background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); color: #86efac; padding: 10px 14px; border-radius: 8px; font-size: 14px; margin-top: 12px; }
.alert-error { background: rgba(220,38,38,0.15); border: 1px solid rgba(220,38,38,0.3); color: #f87171; padding: 10px 14px; border-radius: 8px; font-size: 14px; margin-top: 12px; }
.btn-primary { padding: 11px 24px; background: var(--color-accent); color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-primary:hover:not(:disabled) { background: #b91c1c; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
@media (max-width: 900px) { .profile-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } }
</style>