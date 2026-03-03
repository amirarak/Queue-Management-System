<template>
  <div class="register-view">
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <div class="logo-circle">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          </div>
          <h1 class="register-title">Регистрация сотрудника</h1>
          <p class="register-subtitle">Создание нового аккаунта</p>
        </div>

        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <label for="fullName" class="form-label">ФИО</label>
            <input
              id="fullName"
              v-model="formData.fullName"
              type="text"
              placeholder="Иванов Иван Иванович"
              class="form-input"
              :class="{ 'input-error': errors.fullName }"
              required
            />
            <span v-if="errors.fullName" class="error-message">{{ errors.fullName }}</span>
          </div>

          <div class="form-group">
            <label for="username" class="form-label">Email</label>
            <input
              id="username"
              v-model="formData.username"
              type="email"
              placeholder="username@alatoo.edu.kg"
              class="form-input"
              :class="{ 'input-error': errors.username }"
              required
            />
            <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
            <span class="input-hint">Только корпоративная почта @alatoo.edu.kg</span>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Пароль</label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              placeholder="Минимум 8 символов"
              class="form-input"
              :class="{ 'input-error': errors.password }"
              required
            />
            <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          </div>

          <div class="form-group">
            <label for="confirmPassword" class="form-label">Подтверждение пароля</label>
            <input
              id="confirmPassword"
              v-model="formData.confirmPassword"
              type="password"
              placeholder="Повторите пароль"
              class="form-input"
              :class="{ 'input-error': errors.confirmPassword }"
              required
            />
            <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
          </div>

          <div v-if="authStore.isAdmin" class="form-group">
            <label for="role" class="form-label">Роль</label>
            <select
              id="role"
              v-model="formData.role"
              class="form-input"
            >
              <option value="staff">Сотрудник</option>
              <option value="admin">Администратор</option>
            </select>
          </div>

          <div v-if="authStore.error" class="alert-error">
            {{ authStore.error }}
          </div>

          <div v-if="successMessage" class="alert-success">
            {{ successMessage }}
          </div>

          <button
            type="submit"
            class="register-button"
            :disabled="authStore.loading"
          >
            <span v-if="!authStore.loading">Зарегистрироваться</span>
            <span v-else class="loading-spinner">Регистрация...</span>
          </button>
        </form>

        <div class="register-footer">
          <p class="footer-text">
            Уже есть аккаунт?
            <router-link to="/login" class="footer-link">
              Войти
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const formData = reactive({
  fullName: '',
  username: '',
  password: '',
  confirmPassword: '',
  role: 'staff'
})

const errors = reactive({
  fullName: '',
  username: '',
  password: '',
  confirmPassword: ''
})

const successMessage = ref('')

const validateForm = () => {

  Object.keys(errors).forEach(key => errors[key] = '')
  let isValid = true

  
  if (!formData.fullName.trim()) {
    errors.fullName = 'ФИО обязательно'
    isValid = false
  } else if (formData.fullName.trim().length < 3) {
    errors.fullName = 'Минимум 3 символа'
    isValid = false
  }

  
  if (!formData.username) {
    errors.username = 'Email обязателен'
    isValid = false
  } else if (!formData.username.endsWith('@alatoo.edu.kg')) {
    errors.username = 'Используйте только @alatoo.edu.kg'
    isValid = false
  }

  
  if (!formData.password) {
    errors.password = 'Пароль обязателен'
    isValid = false
  } else if (formData.password.length < 8) {
    errors.password = 'Минимум 8 символов'
    isValid = false
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
    errors.password = 'Пароль должен содержать заглавные и строчные буквы, цифры'
    isValid = false
  }

  
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Подтвердите пароль'
    isValid = false
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Пароли не совпадают'
    isValid = false
  }

  return isValid
}

const handleRegister = async () => {
  if (!validateForm()) return

  const userData = {
    fullName: formData.fullName,
    username: formData.username,
    password: formData.password,
    role: formData.role
  }

  const result = await authStore.register(userData)

  if (result.success) {
    successMessage.value = 'Регистрация успешна! Проверьте email для верификации.'
    
   
    Object.keys(formData).forEach(key => {
      if (key !== 'role') formData[key] = ''
    })

   
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  }
}
</script>

<style scoped>
.register-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a2332 0%, #2d3a4f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.register-container {
  width: 100%;
  max-width: 520px;
}

.register-card {
  background: white;
  border-radius: 20px;
  padding: 50px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.5s ease-in;
}

.register-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-circle {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 25px;
  color: white;
}

.register-title {
  font-size: 28px;
  color: #1a2332;
  margin: 0 0 10px;
  font-weight: 700;
}

.register-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.register-form {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1a2332;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  outline: none;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-input.input-error {
  border-color: #dc2626;
}

.input-hint {
  display: block;
  color: #999;
  font-size: 12px;
  margin-top: 5px;
}

.error-message {
  display: block;
  color: #dc2626;
  font-size: 13px;
  margin-top: 5px;
}

.alert-error {
  background: #fee;
  border: 1px solid #dc2626;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.alert-success {
  background: #e6f7e6;
  border: 1px solid #4caf50;
  color: #2e7d32;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.register-button {
  width: 100%;
  padding: 16px;
  font-size: 18px;
  font-weight: 700;
  color: white;
  background: #dc2626;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.register-button:hover:not(:disabled) {
  background: #b91c1c;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
}

.register-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  display: inline-block;
}

.register-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.footer-text {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.footer-link {
  color: #dc2626;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.footer-link:hover {
  color: #b91c1c;
  text-decoration: underline;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>