import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import EmailVerificationView from '../views/EmailVerificationView.vue'
import SearchView from '@/views/SearchView.vue'
import CartView from '@/views/CartView.vue'
import CheckoutView from '@/views/CheckoutView.vue'
import CheckoutSuccessView from '@/views/CheckoutSuccessView.vue'
import CheckoutCancelView from '@/views/CheckoutCancelView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import CGUView from '@/views/legal/CGUView.vue'
import { checkAuth } from '@/helpers/auth'
import BasePageAdminView from '@/views/admin/BasePageAdminView.vue'

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
      path: '/checkout',
      children: [
        {
          path: '',
          name: 'checkout',
          component: CheckoutView
        },
        {
          path: 'success/:reference',
          name: 'success',
          component: CheckoutSuccessView
        },
        {
          path: 'cancel/:reference',
          name: 'cancel',
          component: CheckoutCancelView
        }
      ]
    },
    {
      path: '/reset-password',
      name: 'reset_password',
      component: ResetPasswordView
    },
    {
      path: '/legal',
      children: [{ path: 'cgu', component: CGUView }]
    },
    {
      path: '/admin',
      name: 'admin',
      component: BasePageAdminView
    }
  ]
})

router.afterEach(() => {
  checkAuth()
})

router.afterEach(() => {
  checkAuth()
})

export default router
