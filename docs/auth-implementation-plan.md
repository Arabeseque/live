# 认证系统实现计划

## 1. 组件结构设计

### 1.1 登录/注册组件

```
src/
  components/
    auth/
      LoginForm.vue         # 登录表单（包含账号密码登录和手机验证码登录）
      RegisterForm.vue      # 注册表单
      VerificationCode.vue  # 验证码获取按钮组件（包含倒计时功能）
```

### 1.2 状态管理

```
src/
  stores/
    auth.ts       # 认证相关状态管理
    user.ts       # 用户信息状态管理
```

## 2. API 接口封装

### 2.1 接口服务

```
src/
  services/
    auth.ts       # 认证相关API
    user.ts       # 用户相关API
```

## 3. Token 管理实现

### 3.1 Token 工具类

```typescript
// src/utils/token.ts
interface TokenUtils {
  getToken: () => string | null;      // 获取Token
  setToken: (token: string) => void;  // 设置Token
  removeToken: () => void;            // 删除Token
  hasToken: () => boolean;           // 检查Token是否存在
}
```

### 3.2 HTTP 请求拦截器

- 自动为请求添加 Authorization 头
- 处理 401 错误（Token过期）
- 处理 403 错误（权限不足）

## 4. 路由守卫实现

### 4.1 路由配置

```typescript
// 路由元信息
interface RouteMeta {
  requiresAuth: boolean;         // 是否需要登录
  allowedRoles?: string[];      // 允许访问的角色
}

// 示例路由配置
const routes = [
  {
    path: '/login',
    component: () => import('@/pages/login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/admin',
    component: () => import('@/pages/admin/index.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['admin']
    }
  }
]
```

### 4.2 路由守卫逻辑

1. 检查路由是否需要认证
2. 检查Token是否存在
3. 获取用户信息
4. 检查用户角色权限
5. 处理未登录跳转

## 5. 组件功能实现

### 5.1 LoginForm.vue

- 表单验证规则
- 登录方式切换（账号密码/手机验证码）
- 错误信息展示
- 登录状态和加载状态管理
- 登录成功后的跳转处理

### 5.2 RegisterForm.vue

- 表单验证规则
- 密码强度检查
- 验证码获取和验证
- 注册成功后直接登录

### 5.3 VerificationCode.vue

- 点击发送验证码
- 倒计时功能
- 验证码类型处理（登录/注册）
- 发送失败重试

## 6. 错误处理

### 6.1 全局错误处理

- API请求错误统一处理
- 未授权处理（401）
- 权限不足处理（403）
- 表单验证错误处理

### 6.2 用户体验

- Loading状态展示
- 错误提示信息
- 操作成功提示
- 表单提交防重复

## 7. 状态持久化

### 7.1 本地存储

- Token存储（localStorage）
- 用户基本信息缓存
- 记住登录状态

## 8. 测试计划

### 8.1 单元测试

- Token工具类测试
- 表单验证规则测试
- API服务测试
- 状态管理测试

### 8.2 集成测试

- 登录流程测试
- 注册流程测试
- 路由守卫测试
- 权限控制测试

## 9. 安全考虑

### 9.1 安全措施

- Token过期处理
- 密码加密传输
- XSS防护
- CSRF防护
- 敏感信息保护
