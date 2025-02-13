import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { UserInfo } from '@/services/auth';
import { TokenUtils } from '@/utils/token';
import * as authService from '@/services/auth';
import { debug } from 'node:console';

export const useAuthStore = defineStore('auth', () => {
  // 用户信息
  const userInfo = ref<UserInfo | null>(null);
  // 登录状态
  const isLoggedIn = ref(TokenUtils.hasToken());

  // 获取当前用户信息
  async function fetchUserInfo() {
    try {
      const user = await authService.getCurrentUser();
      userInfo.value = user;
      return user;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  }

  // 使用用户名密码登录
  async function login(username: string, password: string) {
    const response = await authService.login({ username, password }) as any;
    handleLoginSuccess(response.data);
    return response;
  }

  // 注册新用户
  async function register(params: authService.RegisterParams) {
    const response = await authService.register(params);
    handleLoginSuccess(response);
    return response;
  }

  // 处理登录成功
  function handleLoginSuccess(response: authService.LoginResponse) {
    console.log('登录成功:', response.token);
    TokenUtils.setToken(response.token);
    userInfo.value = response.user;
    isLoggedIn.value = true;
  }

  // 退出登录
  function logout() {
    TokenUtils.removeToken();
    userInfo.value = null;
    isLoggedIn.value = false;
  }

  // 初始化：如果有token则获取用户信息
  async function initialize() {
    if (TokenUtils.hasToken()) {
      await fetchUserInfo();
    }
  }

  return {
    userInfo,
    isLoggedIn,
    login,
    register,
    logout,
    fetchUserInfo,
    initialize,
  };
});
