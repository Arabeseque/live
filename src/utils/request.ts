import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8088',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },

  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 检查响应状态和错误码
    const responseData = response.data
    if (responseData.code !== 0) {
      return Promise.reject(responseData)
    }
    return responseData.data
  },
  (error) => {
    if (error.response?.status === 401) {
      // 处理未授权错误
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)

// 导出请求方法
export function get<T>(url: string, params?: any): Promise<T> {
  return instance.get(url, { params })
}

export function post<T>(url: string, data?: any): Promise<T> {
  return instance.post(url, data)
}

export function put<T>(url: string, data?: any): Promise<T> {
  return instance.put(url, data)
}

export function del<T>(url: string): Promise<T> {
  return instance.delete(url)
}

// 导出 http 对象（用于组合式 API）
export const http = {
  get,
  post,
  put,
  delete: del
}
