import { createRouter, createWebHistory } from 'vue-router';
import { authGuard } from '@/middleware/auth';

// 定义路由规则
const routes = [
  {
    path: '/',
    component: () => import('@/pages/index.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    component: () => import('@/pages/login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    component: () => import('@/pages/register.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/403',
    component: () => import('@/pages/403.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/stream',
    component: () => import('@/pages/stream.vue'),
    meta: {
      requiresAuth: true,
      // 开播模式需要 streamer 权限，观看模式不需要
      allowedRoles: (to: any) => !to.query.id ? ['streamer', 'admin'] : undefined,
    },
  },
  // {
  //   // 管理后台路由示例
  //   path: '/admin',
  //   component: () => import('@/pages/admin/index.vue'),
  //   meta: {
  //     requiresAuth: true,
  //     allowedRoles: ['admin'],
  //   },
  // },
  // {
  //   // 主播后台路由示例
  //   path: '/streamer',
  //   component: () => import('@/pages/streamer/index.vue'),
  //   meta: {
  //     requiresAuth: true,
  //     allowedRoles: ['streamer', 'admin'],
  //   },
  // },
  {
    // 捕获所有未匹配的路由
    path: '/:pathMatch(.*)*',
    component: () => import('@/pages/[...all].vue'),
  },
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 全局前置守卫
router.beforeEach(async (to) => {
  const result = await authGuard(to);

  // 如果返回true，允许导航
  if (result === true) {
    return true;
  }

  // 否则返回重定向对象
  return result;
});

export default router;
