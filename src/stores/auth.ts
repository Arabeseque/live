import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UserInfo } from '@/services/auth';
import * as authService from '@/services/auth';

export const useAuthStore = defineStore('auth', () => {
  // 用户信息
  const userInfo = ref<UserInfo | null>(null);
  const token = ref<string | null>(null);

  // 计算属性
  const isLoggedIn = computed(() => !!userInfo.value);

  // 获取token 查看 localStorage
  const getToken = () => {
    if (token.value) {
      console.log('获取token:', token.value);
      return token.value;
    }
    const savedToken = localStorage.getItem('auth_token');
    console.log('获取token:', savedToken);

    if (savedToken) {
      console.log('获取token:', savedToken);
      token.value = savedToken;
    }
  }

  // 设置token
  const setToken = (newToken: string) => {
    token.value = newToken;
    console.log('设置token:', newToken);
    localStorage.setItem('auth_token', newToken);
    console.log(getToken());
  };

  // 清除token
  const clearToken = () => {
    token.value = null;
    localStorage.removeItem('token');
  };

  // 获取当前用户信息
  async function fetchUserInfo() {
    try {
      const user = await authService.getCurrentUser();
      console.log('获取用户信息:', user);
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
    handleLoginSuccess(response);
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
    setToken(response.token);
    userInfo.value = response.user;
  }

  // 退出登录
  function logout() {
    userInfo.value = null;
    clearToken();
  }

  // 初始化
  const initialize = async () => {
    // 从localStorage恢复token
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      token.value = savedToken;
    }
  };

  return {
    userInfo,
    isLoggedIn,
    getToken,
    setToken,
    clearToken,
    initialize,
    login,
    logout,
    fetchUserInfo,
    register,
  };
});
