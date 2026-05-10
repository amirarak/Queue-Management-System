import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import KioskView            from '../views/KioskView.vue'
import DisplayBoardView     from '../views/DisplayBoardView.vue'
import StaffDashboardView   from '../views/StaffDashboardView.vue'
import LoginView            from '../views/LoginView.vue'
import AnalyticsView        from '../views/AnalyticsView.vue'
import StaffManagementView  from '../views/StaffManagementView.vue'
import SetPasswordView      from '../views/SetPasswordView.vue'
import ForgotPasswordView   from '../views/ForgotPasswordView.vue'
import ProfileView          from '../views/ProfileView.vue'

const routes = [
  { path: '/kiosk',   name: 'Kiosk',   component: KioskView,       meta: { title: 'Киоск',  public: true, hideNav: true } },
  { path: '/display', name: 'Display', component: DisplayBoardView, meta: { title: 'Табло',  public: true, hideNav: true } },

  { path: '/login',           name: 'Login',          component: LoginView,          meta: { title: 'Вход',            guestOnly: true, hideNav: true } },
  { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPasswordView, meta: { title: 'Сброс пароля',    public: true,    hideNav: true } },
  { path: '/set-password',    name: 'SetPassword',    component: SetPasswordView,    meta: { title: 'Установка пароля',public: true,    hideNav: true } },

  { path: '/staff',      name: 'Staff',      component: StaffDashboardView, meta: { title: 'Панель сотрудника', requiresAuth: true } },
  { path: '/analytics',  name: 'Analytics',  component: AnalyticsView,      meta: { title: 'Аналитика',         requiresAuth: true, requiresAdmin: true } },
  { path: '/management', name: 'Management', component: StaffManagementView,meta: { title: 'Управление',        requiresAuth: true, requiresAdmin: true } },
  { path: '/profile',    name: 'Profile',    component: ProfileView,        meta: { title: 'Профиль',           requiresAuth: true } },

  { path: '/register', redirect: '/login' },
  { path: '/',         redirect: '/kiosk' },
  { path: '/:pathMatch(.*)*', redirect: '/kiosk' },
]

const router = createRouter({ history: createWebHashHistory(), routes })

router.beforeEach(async (to, from, next) => {
  document.title = `${to.meta.title || 'Электронная очередь'} | Ala-Too`
  const authStore = useAuthStore()
  if (!authStore.initialized) {
    await authStore.checkAuth()
  }
  if (to.meta.requiresAuth && !authStore.isAuthenticated) return next('/login')
  if (to.meta.guestOnly  && authStore.isAuthenticated)    return next('/staff')
  if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') return next('/staff')
  next()
})

export default router