import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import EmailVerificationView from '../views/EmailVerificationView.vue'
import SearchView from '@/views/SearchView.vue'
import CartView from '@/views/CartView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import ResetPasswordSuccess from '@/views/ResetPasswordSuccess.vue'
import CGUView from '@/views/legal/CGU.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/verify-email',
      name: 'email_verification',
      component: EmailVerificationView
    },
    {
      path: '/search',
      name: 'search',
      component: SearchView
    },
    {
      path: '/cart',
      name: 'cart',
      component: CartView
    },
    {
      path: '/reset-password',
      name: 'reset_password',
      component: ResetPasswordView
    },
    {
      path: '/resetPasswordSuccess',
      name: 'resetPasswordSuccess',
      component: ResetPasswordSuccess
    },
    {
      path: '/legal',
      children: [{ path: 'cgu', component: CGUView }]
    }
  ]
})

export default router
