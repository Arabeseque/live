import { defineStore } from 'pinia'
import { ref } from 'vue'

interface User {
  id: string
  username: string
  avatar?: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  // 从 localStorage 加载用户信息
  function loadUserFromStorage() {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
    }
  }

  // 设置用户信息
  function setUser(userData: User, tokenValue: string) {
    user.value = userData
    token.value = tokenValue
    localStorage.setItem('token', tokenValue)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  // 清除用户信息
  function clearUser() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 初始加载
  loadUserFromStorage()

  return {
    user,
    token,
    setUser,
    clearUser,
    loadUserFromStorage
  }
})
