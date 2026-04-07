<template>
  <div class="management-page">
    <div class="page-container">

      <div class="page-header">
        <div>
          <h1 class="page-title">{{ t('staffMgmt.title') }}</h1>
          <p class="page-subtitle">{{ t('dept.name') }}</p>
        </div>
        <div class="header-actions">
          <button class="add-btn" @click="openCreate">+ {{ t('staffMgmt.addStaff') }}</button>
        </div>
      </div>

      <div class="table-card">
        <div v-if="pageError" class="alert-error page-error">{{ pageError }}</div>
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>{{ t('common.loading') }}</p>
        </div>

        <table v-else class="staff-table">
          <thead>
            <tr>
              <th>{{ t('staffMgmt.fullName') }}</th>
              <th>Email</th>
              <th>{{ t('staffMgmt.department') }}</th>
              <th>{{ t('staffMgmt.windowLabel') }}</th>
              <th>{{ t('staffMgmt.role') }}</th>
              <th>{{ t('staffMgmt.status') }}</th>
              <th>{{ t('staffMgmt.lastLogin') }}</th>
              <th>{{ t('staffMgmt.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in staffList" :key="member.id">
              <td>
                <div class="name-cell">
                  <div class="avatar">{{ member.fullName?.charAt(0) || '?' }}</div>
                  <span>{{ member.fullName }}</span>
                </div>
              </td>
              <td class="email-cell">{{ member.username }}</td>
              <!-- Faculty name translated via i18n key -->
              <td class="dept-cell">{{ getDeptName(member) }}</td>
              <td class="window-cell">
                <span v-if="member.windowNumber" class="window-pill">{{ member.windowNumber }}</span>
                <span v-else class="no-window">—</span>
              </td>
              <td>
                <span class="badge" :class="member.role">
                  {{ member.role === 'admin' ? t('staff.adminRole') : t('staff.staffRole') }}
                </span>
              </td>
              <td>
                <span class="badge" :class="member.isActive ? 'active' : 'inactive'">
                  {{ member.isActive ? t('staffMgmt.active') : t('staffMgmt.inactive') }}
                </span>
              </td>
              <td class="time-cell">{{ formatDate(member.lastLogin) }}</td>
              <td>
                <div class="action-btns">
                  <button class="icon-btn edit" @click="openEdit(member)" :title="t('staffMgmt.edit')">✏️</button>
                  <button class="icon-btn toggle" @click="toggleActive(member)"
                    :title="member.isActive ? t('staffMgmt.deactivate') : t('staffMgmt.activate')">
                    {{ member.isActive ? '🔒' : '🔓' }}
                  </button>
                  <button
                    v-if="authStore.user && member.id !== authStore.user.id"
                    class="icon-btn del" @click="confirmDelete(member)" :title="t('staffMgmt.delete')">🗑️</button>
                </div>
              </td>
            </tr>
            <tr v-if="staffList.length === 0">
              <td colspan="8" class="empty-row">{{ t('analytics.noData') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingStaff ? t('staffMgmt.editStaff') : t('staffMgmt.addStaff') }}</h2>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>{{ t('staffMgmt.fullName') }}</label>
            <input v-model="form.fullName" type="text" class="form-input" placeholder="" />
            <span v-if="formErrors.fullName" class="err">{{ formErrors.fullName }}</span>
          </div>
          <div class="form-group">
            <label>{{ t('staffMgmt.emailLabel') }}</label>
            <input v-model="form.username" type="email" class="form-input"
              placeholder="username@alatoo.edu.kg" :disabled="!!editingStaff" />
            <span v-if="formErrors.username" class="err">{{ formErrors.username }}</span>
            <span v-if="!editingStaff" class="field-note">{{ t('staffMgmt.emailNote') }}</span>
          </div>
          <div class="form-group">
            <label>{{ t('staffMgmt.role') }}</label>
            <select v-model="form.role" class="form-input">
              <option value="staff">{{ t('staff.staffRole') }}</option>
              <option value="admin">{{ t('staff.adminRole') }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>{{ t('staffMgmt.department') }}</label>
            <select v-model="form.departmentId" class="form-input">
              <option :value="null">{{ t('staffMgmt.noDepartment') }}</option>
              <option v-for="d in departments" :key="d.id" :value="d.id">
                {{ getDeptNameById(d.id) }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>{{ t('staffMgmt.windowLabel') }}</label>
            <input
              v-model.number="form.windowNumber"
              type="number" min="1" max="99"
              class="form-input"
              :placeholder="t('staffMgmt.windowPlaceholder')"
            />
            <span class="field-note">{{ t('staffMgmt.windowNote') }}</span>
          </div>
          <div v-if="modalError"   class="alert-error">{{ modalError }}</div>
          <div v-if="modalSuccess" class="alert-success">{{ modalSuccess }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeModal">{{ t('common.cancel') }}</button>
          <button class="btn-submit" :disabled="modalLoading" @click="handleSubmit">
            {{ modalLoading ? t('common.loading') : t('common.save') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2>{{ t('staffMgmt.confirmDelete') }}</h2>
          <button class="modal-close" @click="showDeleteConfirm = false">✕</button>
        </div>
        <div class="modal-body">
          <p class="confirm-text">
            {{ t('staffMgmt.confirmDeleteText') }}<br>
            <strong>{{ deletingStaff?.fullName }}</strong>?
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showDeleteConfirm = false">{{ t('common.cancel') }}</button>
          <button class="btn-delete" :disabled="modalLoading" @click="handleDelete">
            {{ modalLoading ? t('common.loading') : t('staffMgmt.delete') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showLogoutConfirm" class="modal-overlay" @click.self="showLogoutConfirm = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2>{{ t('logout.confirmTitle') }}</h2>
          <button class="modal-close" @click="showLogoutConfirm = false">✕</button>
        </div>
        <div class="modal-body">
          <p class="confirm-text">{{ t('logout.confirmText') }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showLogoutConfirm = false">{{ t('common.no') }}</button>
          <button class="btn-delete" @click="handleLogout">{{ t('common.yes') }}</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import { adminAPI, authAPI } from '@/services/api'
import api from '@/services/api'

const { t, te } = useI18n()
const authStore = useAuthStore()
const router    = useRouter()

const loading            = ref(false)
const pageError          = ref('')
const staffList          = ref([])
const departments        = ref([])
const showModal          = ref(false)
const showDeleteConfirm  = ref(false)
const showLogoutConfirm  = ref(false)
const editingStaff       = ref(null)
const deletingStaff      = ref(null)
const modalLoading       = ref(false)
const modalError         = ref('')
const modalSuccess       = ref('')

const form = reactive({
  fullName: '', username: '', role: 'staff', departmentId: null, windowNumber: null
})
const formErrors = reactive({ fullName: '', username: '' })

const DEPT_I18N = {
  ENG: 'departments.engineering',
  ECO: 'departments.economics',
  SOC: 'departments.social',
  MED: 'departments.medicine',
  HUM: 'departments.humanities',
}
const DEPT_ID_TO_CODE = { 1: 'ENG', 2: 'ECO', 3: 'SOC', 4: 'MED', 5: 'HUM' }

function getDeptName(member) {
  if (!member.departmentId) return '—'
  const code = DEPT_ID_TO_CODE[member.departmentId] || member.department?.code
  if (code && DEPT_I18N[code] && te(DEPT_I18N[code])) return t(DEPT_I18N[code])
  return member.department?.nameRu || member.department?.nameEn || '—'
}

function getDeptNameById(id) {
  const code = DEPT_ID_TO_CODE[id]
  if (code && DEPT_I18N[code] && te(DEPT_I18N[code])) return t(DEPT_I18N[code])
  const d = departments.value.find(d => d.id === id)
  return d?.nameRu || d?.nameEn || `Dept ${id}`
}

async function loadStaff() {
  loading.value = true
  pageError.value = ''
  try {
    const res = await adminAPI.getStaff()
    staffList.value = res.data.data || []
  } catch (e) {
    pageError.value = e.response?.data?.message || t('common.error')
  }
  finally { loading.value = false }
}

async function loadDepartments() {
  pageError.value = ''
  try {
    const res = await api.get('/users/departments')
    departments.value = res.data.data || []
  } catch (e) {
    pageError.value = e.response?.data?.message || t('common.error')
  }
}

function openCreate() {
  editingStaff.value = null
  Object.assign(form, { fullName: '', username: '', role: 'staff', departmentId: null, windowNumber: null })
  formErrors.fullName = formErrors.username = ''
  modalError.value = modalSuccess.value = ''
  showModal.value = true
}

function openEdit(member) {
  editingStaff.value = member
  Object.assign(form, {
    fullName:     member.fullName,
    username:     member.username,
    role:         member.role,
    departmentId: member.departmentId || null,
    windowNumber: member.windowNumber || null
  })
  formErrors.fullName = formErrors.username = ''
  modalError.value = modalSuccess.value = ''
  showModal.value = true
}

function confirmDelete(member) {
  deletingStaff.value = member
  modalError.value = ''
  showDeleteConfirm.value = true
}

function closeModal() {
  showModal.value = false
  editingStaff.value = null
  modalError.value = ''
  modalSuccess.value = ''
}

function validate() {
  formErrors.fullName = formErrors.username = ''
  let ok = true
  if (!form.fullName.trim() || form.fullName.length < 3) { formErrors.fullName = t('profile.nameMinLength'); ok = false }
  if (!editingStaff.value && !/^[^\s@]+@alatoo\.edu\.kg$/.test(form.username || '')) {
    formErrors.username = t('login.emailInvalid')
    ok = false
  }
  if (form.windowNumber !== null && form.windowNumber !== undefined) {
    if (!Number.isInteger(form.windowNumber) || form.windowNumber < 1 || form.windowNumber > 99) {
      modalError.value = t('staffMgmt.windowNote')
      ok = false
    }
  }
  return ok
}

async function handleSubmit() {
  if (!validate()) return
  modalLoading.value = true
  modalError.value = ''
  pageError.value = ''
  try {
    if (editingStaff.value) {
      await adminAPI.updateStaff(editingStaff.value.id, {
        fullName: form.fullName, role: form.role,
        departmentId: form.departmentId,
        windowNumber: form.windowNumber || null
      })
      modalSuccess.value = t('staffMgmt.updateSuccess')
    } else {
      await authAPI.register({
        fullName: form.fullName, username: form.username, role: form.role,
        departmentId: form.departmentId,
        windowNumber: form.windowNumber || null
      })
      modalSuccess.value = t('staff.createSuccess')
    }
    await loadStaff()
    setTimeout(() => { closeModal() }, 1200)
  } catch (e) {
    modalError.value = e.response?.data?.message || t('staff.createError')
  } finally { modalLoading.value = false }
}

async function handleDelete() {
  if (!deletingStaff.value) return
  modalLoading.value = true
  modalError.value = ''
  try {
    await adminAPI.deleteStaff(deletingStaff.value.id)
    staffList.value = staffList.value.filter(s => s.id !== deletingStaff.value.id)
    showDeleteConfirm.value = false
    deletingStaff.value = null
  } catch (e) {
    modalError.value = e.response?.data?.message || t('common.error')
  }
  finally { modalLoading.value = false }
}

async function toggleActive(member) {
  try {
    await adminAPI.updateStaff(member.id, { isActive: !member.isActive })
    member.isActive = !member.isActive
    pageError.value = ''
  } catch (e) {
    pageError.value = e.response?.data?.message || t('common.error')
  }
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('ru-RU', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
}

onMounted(() => { loadStaff(); loadDepartments() })
</script>

<style scoped>
.management-page { min-height: 100vh; background: var(--color-primary); color: white; padding: 40px; }
.page-container { max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 30px; }
.page-header { background: rgba(28,31,44,0.95); border-radius: var(--border-radius-lg); padding: 30px 40px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 5px 20px rgba(0,0,0,0.3); }
.page-title { font-size: 32px; font-weight: 700; margin: 0 0 6px; }
.page-subtitle { font-size: 16px; color: rgba(255,255,255,0.6); margin: 0; }
.header-actions { display: flex; align-items: center; gap: 16px; }
.user-name { font-size: 16px; color: rgba(255,255,255,0.8); }
.add-btn { padding: 12px 24px; background: #22c55e; color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.add-btn:hover { background: #16a34a; transform: translateY(-1px); }
.logout-btn { padding: 12px 20px; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 10px; font-size: 15px; cursor: pointer; transition: all 0.2s; }
.logout-btn:hover { background: var(--color-accent); border-color: var(--color-accent); }
.table-card { background: rgba(28,31,44,0.95); border-radius: var(--border-radius-lg); overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.3); }
.loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: rgba(255,255,255,0.6); }
.spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.15); border-top-color: var(--color-accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px; }
@keyframes spin { to { transform: rotate(360deg); } }
.staff-table { width: 100%; border-collapse: collapse; }
.staff-table th { padding: 16px 20px; text-align: left; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.staff-table td { padding: 16px 20px; font-size: 15px; color: rgba(255,255,255,0.85); border-bottom: 1px solid rgba(255,255,255,0.06); }
.staff-table tr:last-child td { border-bottom: none; }
.staff-table tbody tr:hover td { background: rgba(255,255,255,0.04); }
.empty-row { text-align: center; color: rgba(255,255,255,0.3); padding: 40px !important; }
.name-cell { display: flex; align-items: center; gap: 12px; }
.avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--color-accent); display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; flex-shrink: 0; }
.email-cell { color: rgba(255,255,255,0.5); font-size: 14px; }
.dept-cell  { color: rgba(255,255,255,0.65); font-size: 13px; max-width: 200px; }
.time-cell  { color: rgba(255,255,255,0.4); font-size: 13px; }
.window-cell { text-align: left; vertical-align: middle; }
.window-pill { display: inline-block; background: rgba(99,102,241,0.2); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.3); padding: 4px 14px; border-radius: 20px; font-size: 14px; font-weight: 700; }
.no-window { color: rgba(255,255,255,0.25); }
.badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.badge.admin    { background: rgba(220,38,38,0.2); color: #f87171; }
.badge.staff    { background: rgba(59,130,246,0.2); color: #93c5fd; }
.badge.active   { background: rgba(34,197,94,0.2); color: #86efac; }
.badge.inactive { background: rgba(156,163,175,0.15); color: #9ca3af; }
.action-btns { display: flex; gap: 6px; }
.icon-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 6px 10px; cursor: pointer; font-size: 15px; transition: all 0.2s; }
.icon-btn.edit:hover   { background: rgba(59,130,246,0.2); }
.icon-btn.toggle:hover { background: rgba(245,158,11,0.2); }
.icon-btn.del:hover    { background: rgba(220,38,38,0.2); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #1e2536; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; width: 100%; max-width: 480px; box-shadow: 0 25px 60px rgba(0,0,0,0.6); animation: pop 0.2s ease; }
.modal-sm { max-width: 400px; }
@keyframes pop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 24px 28px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.modal-header h2 { font-size: 18px; color: white; margin: 0; }
.modal-close { background: none; border: none; color: rgba(255,255,255,0.4); font-size: 18px; cursor: pointer; }
.modal-close:hover { color: white; }
.modal-body { padding: 24px 28px; max-height: 70vh; overflow-y: auto; }
.confirm-text { color: rgba(255,255,255,0.75); font-size: 15px; line-height: 1.6; margin: 0; }
.form-group { margin-bottom: 18px; }
.form-group label { display: block; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.6); margin-bottom: 8px; }
.form-input { width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; color: white; font-size: 15px; outline: none; box-sizing: border-box; transition: border-color 0.2s; }
.form-input:focus { border-color: var(--color-accent); }
.form-input:disabled { opacity: 0.5; cursor: not-allowed; }
.form-input option { background: #1e2536; color: white; }
.err { display: block; color: #f87171; font-size: 12px; margin-top: 4px; }
.field-note { display: block; color: rgba(255,255,255,0.35); font-size: 12px; margin-top: 5px; font-style: italic; }
.alert-error   { background: rgba(220,38,38,0.15); border: 1px solid rgba(220,38,38,0.3); color: #f87171; padding: 10px 14px; border-radius: 8px; font-size: 14px; margin-top: 10px; }
.alert-success { background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); color: #86efac; padding: 10px 14px; border-radius: 8px; font-size: 14px; margin-top: 10px; }
.page-error { margin: 16px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 20px 28px; border-top: 1px solid rgba(255,255,255,0.08); }
.btn-cancel { padding: 10px 20px; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); border: none; border-radius: 8px; cursor: pointer; font-size: 15px; }
.btn-submit, .btn-delete { padding: 10px 24px; background: var(--color-accent); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: 600; }
.btn-submit:disabled, .btn-delete:disabled { opacity: 0.5; cursor: not-allowed; }
</style>