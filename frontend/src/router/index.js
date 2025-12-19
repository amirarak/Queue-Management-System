import { createRouter, createWebHistory } from 'vue-router'
import KioskView from '../views/KioskView.vue'
import DisplayBoardView from '../views/DisplayBoardView.vue'
import StaffDashboardView from '../views/StaffDashboardView.vue'

const routes = [
  {
    path: '/',
    redirect: '/kiosk'
  },
  {
    path: '/kiosk',
    name: 'Kiosk',
    component: KioskView,
    meta: { title: 'Киоск для студентов' }
  },
  {
    path: '/display',
    name: 'Display',
    component: DisplayBoardView,
    meta: { title: 'Электронное табло' }
  },
  {
    path: '/staff',
    name: 'Staff',
    component: StaffDashboardView,
    meta: { title: 'Панель сотрудника' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Система управления очередью'
  next()
})

export default router