import { createRouter, createWebHistory } from 'vue-router'
import localCache from '@/utils/cache'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login/Login.vue')
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/Dashboard/Dashboard.vue')
    }
  ]
})

router.beforeEach((to, _, next) => {
  const expiration = localCache.getCache('expiration')
  if (!expiration || expiration < +new Date()) {
    localCache.deleteCache('expiration')
    if (to.path !== '/login') {
      return next('/login')
    }
    next()
  } else {
    if (to.path == '/login') {
      return next('/')
    }
    next()
  }
})

export default router
