import { type RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

export type AllowedRoles = string[] | ((to: RouteLocationNormalized) => string[] | undefined);

export async function authGuard(to: RouteLocationNormalized) {
  const authStore = useAuthStore();
  const requiresAuth = to.meta.requiresAuth as boolean;
  const allowedRoles = to.meta.allowedRoles as AllowedRoles | undefined;

  // 不需要认证的路由直接通过
  if (!requiresAuth) {
    return true;
  }

  // 检查是否已登录
  if (!authStore.isLoggedIn) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    };
  }

  // 如果没有用户信息，尝试获取
  if (!authStore.userInfo) {
    await authStore.fetchUserInfo();
  }

  // 检查角色权限
  if (allowedRoles && authStore.userInfo) {
    // 获取实际的角色列表
    const requiredRoles = typeof allowedRoles === 'function'
      ? allowedRoles(to)
      : allowedRoles;

    // 如果返回 undefined，表示不需要角色检查
    if (requiredRoles && !requiredRoles.includes(authStore.userInfo.role)) {
      return {
        path: '/403',
        query: { from: to.fullPath },
      };
    }
  }

  return true;
}
