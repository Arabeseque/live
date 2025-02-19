import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '../middleware/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../pages/index.vue'),
    },
    {
      path: '/login',
      component: () => import('../pages/login.vue'),
    },
    {
      path: '/register',
      component: () => import('../pages/register.vue'),
    },
    {
      path: '/stream',
      component: () => import('../pages/stream.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/live/:id',
      component: () => import('../pages/live/[id].vue'),
      meta: {
        requiresAuth: true
      }
    }
  ],
});

// 路由守卫
router.beforeEach(async (to, from) => {
  // 使用 authGuard 处理认证
  const result = await authGuard(to)
  
  // authGuard 返回 true 表示验证通过
  if (result === true) return true

  // 否则返回重定向路由
  return result
})

export default router;
