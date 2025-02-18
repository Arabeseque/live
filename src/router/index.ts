import { createRouter, createWebHistory } from 'vue-router';

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
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else {
    next();
  }
});

export default router;
