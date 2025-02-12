import { get, post } from '@/utils/request';

export interface LoginParams {
  username: string;
  password: string;
}

export interface PhoneLoginParams {
  phone: string;
  code: string;
}

export interface RegisterParams {
  phone: string;
  password: string;
  username?: string;
}

export interface SendVerificationCodeParams {
  phone: string;
  type: 'LOGIN' | 'REGISTER' | 'RESET_PASSWORD';
}

export interface UserInfo {
  id: string;
  username: string;
  nickname: string;
  avatar_url: string;
  role: 'user' | 'streamer' | 'admin';
  last_login_time: string;
}

export interface LoginResponse {
  token: string;
  user: UserInfo;
}

/**
 * 用户名密码登录
 */
export function login(params: LoginParams): Promise<LoginResponse> {
  return post('/api/auth/login', params);
}

/**
 * 手机验证码登录
 */
export function phoneLogin(params: PhoneLoginParams): Promise<LoginResponse> {
  return post('/api/auth/login/code', params);
}

/**
 * 用户注册
 */
export function register(params: RegisterParams): Promise<LoginResponse> {
  return post('/api/auth/register', params);
}

/**
 * 发送验证码
 */
export function sendVerificationCode(params: SendVerificationCodeParams): Promise<{ expires_in: number }> {
  return post('/api/auth/verification-code', params);
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser(): Promise<UserInfo> {
  return get('/api/auth/current');
}

export default {
  login,
  phoneLogin,
  register,
  sendVerificationCode,
  getCurrentUser,
};
