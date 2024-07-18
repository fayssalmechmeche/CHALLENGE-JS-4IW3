import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SneakerView from '@/views/SneakerView.vue'
import EmailVerificationView from '../views/EmailVerificationView.vue'
import SearchView from '@/views/SearchView.vue'
import CartView from '@/views/CartView.vue'
import CheckoutView from '@/views/CheckoutView.vue'
import CheckoutSuccessView from '@/views/CheckoutSuccessView.vue'
import CheckoutCancelView from '@/views/CheckoutCancelView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import ProfileView from '@/views/ProfileView.vue'
import CGUView from '@/views/legal/CGUView.vue'
import { checkAuth } from '@/helpers/auth'
import BasePageAdminView from '@/views/admin/BasePageAdminView.vue'
import CGVView from '@/views/legal/CGVView.vue'
import OrdersView from '@/views/OrdersView.vue'
import DetailOrderView from '@/views/DetailOrderView.vue'

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
      path: '/sneakers/:slugSneaker',
      name: 'sneakers',
      component: SneakerView
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
      children: [
        { path: 'cgu', name: 'cgu', component: CGUView },
        { path: 'cgv', name: 'cgv', component: CGVView }
      ]
    },
    {
      path: '/profile',
      name: 'profile',
      children: [
        {
          path: '',
          name: 'profil',
          component: () => ProfileView
        },
        {
          path: 'orders/',
          name: 'orders',
          component: () => OrdersView
        },
        {
          path: 'orders/:reference',
          name: 'order',
          component: () => DetailOrderView
        }
      ]
    },
    {
      path: '/admin',
      name: 'admin',
      redirect: '/admin/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'admin_dashboard',
          component: BasePageAdminView
        },
        {
          path: 'sneakers',
          children: [
            {
              path: '',
              name: 'admin_sneakers',
              component: () => import('@/views/admin/SneakersAdminView.vue')
            },
            {
              path: 'add',
              name: 'admin_sneakers_add',
              component: () => import('@/views/admin/forms/SneakerForm.vue')
            },
            {
              path: ':id',
              name: 'admin_sneakers_edit',
              component: () => import('@/views/admin/forms/SneakerForm.vue')
            }
          ]
        },
        {
          path: 'categories',
          children: [
            {
              path: '',
              name: 'admin_categories',
              component: () => import('@/views/admin/CategoriesAdminView.vue')
            },
            {
              path: 'add',
              name: 'admin_categories_add',
              component: () => import('@/views/admin/forms/CategoryForm.vue')
            },
            {
              path: ':id',
              name: 'admin_categories_edit',
              component: () => import('@/views/admin/forms/CategoryForm.vue')
            }
          ]
        },
        {
          path: 'brands',
          children: [
            {
              path: '',
              name: 'admin_brands',
              component: () => import('@/views/admin/BrandsAdminView.vue')
            },
            {
              path: 'add',
              name: 'admin_brands_add',
              component: () => import('@/views/admin/forms/BrandForm.vue')
            },
            {
              path: ':id',
              name: 'admin_brands_edit',
              component: () => import('@/views/admin/forms/BrandForm.vue')
            }
          ]
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not_found',
      component: () => import('@/views/NotFoundView.vue')
    }
  ]
})

const publicRoutes = [
  'home',
  'email_verification',
  'search',
  'sneakers',
  'reset_password',
  'cgu',
  'cgv'
]
const adminRoutes = [
  'admin_dashboard',
  'admin_sneakers',
  'admin_categories',
  'admin_brands_add',
  'admin_brands_edit',
  'admin_categories_add',
  'admin_categories_edit',
  'admin_sneakers_add',
  'admin_sneakers_edit'
]

router.beforeEach(async (to) => {
  const { isAuthenticated, roles } = await checkAuth()

  if (!publicRoutes.includes(to.name as string) && !isAuthenticated) {
    router.push('/')
  }

  if (adminRoutes.includes(to.name as string) && !roles.includes('ADMIN')) {
    router.push('/')
  }
})

export default router
