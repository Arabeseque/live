const TOKEN_KEY = 'auth_token';

/**
 * Token工具类，用于管理JWT Token的存取
 */
export const TokenUtils = {
  /**
   * 获取Token
   * @returns {string | null} 存储的Token或null
   */
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * 设置Token
   * @param {string} token - JWT Token
   */
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * 移除Token
   */
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  /**
   * 检查是否存在Token
   * @returns {boolean} 是否存在Token
   */
  hasToken: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};

export default TokenUtils;
