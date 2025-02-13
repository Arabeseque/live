import axios, { type AxiosResponse } from 'axios';
import { TokenUtils } from './token';

// 创建axios实例
const request = axios.create({
  baseURL: 'http://localhost:8088', // 从接口文档中获取的baseURL
  timeout: 10000, // 请求超时时间
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 如果存在token，添加到请求头中
    const token = TokenUtils.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    // 直接返回响应数据
    return response.data;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Token过期或未登录
          TokenUtils.removeToken();
          // 重定向到登录页
          window.location.href = '/login';
          break;
        case 403:
          // 权限不足
          console.error('没有权限访问该资源');
          break;
        case 404:
          console.error('请求的资源不存在');
          break;
        case 500:
          console.error('服务器错误');
          break;
        default:
          console.error(`请求失败: ${error.message}`);
      }
    }
    return Promise.reject(error);
  },
);

// 封装GET请求
export function get<T = any>(url: string, params?: any): Promise<T> {
  return request.get(url, { params });
}

// 封装POST请求
export function post<T = any>(url: string, data?: any): Promise<T> {
  return request.post(url, data);
}

// 封装PUT请求
export function put<T = any>(url: string, data?: any): Promise<T> {
  return request.put(url, data);
}

// 封装DELETE请求
export function del<T = any>(url: string): Promise<T> {
  return request.delete(url);
}

export default request;
