# Live Room 前端项目

基于 Vue 3 + TypeScript 构建的现代化直播平台前端项目。

## ✨ 功能特性

- 📱 响应式设计，支持多端适配
- 🔐 完整的用户认证系统（登录、注册、Token 管理）
- 🎥 基于 HTTP-FLV 的低延迟直播播放器
- 💬 实时弹幕系统
- 🚀 支持多清晰度自动切换
- 🔒 基于角色的访问控制

## 🛠️ 技术栈

- Vue 3 - 渐进式 JavaScript 框架
- TypeScript - 带类型检查的 JavaScript
- Vite - 下一代前端构建工具
- flv.js - FLV 播放器引擎
- Pinia - 状态管理
- Vue Router - 路由管理
- UnoCSS - 原子化 CSS 工具

## 📦 安装

```bash
# 安装依赖
pnpm install
```

## 🚀 开发

```bash
# 启动开发服务器
pnpm dev
```

## 🔨 构建

```bash
# 构建生产版本
pnpm build
```

## 🧪 测试

```bash
# 运行单元测试
pnpm test
```

## 📁 项目结构

```
src/
  ├── components/        # 公共组件
  ├── composables/      # 组合式函数
  ├── middleware/       # 路由中间件
  ├── pages/           # 页面组件
  ├── services/        # API 服务封装
  ├── stores/          # Pinia 状态管理
  ├── styles/          # 全局样式
  └── utils/           # 工具函数
```

## 🔑 核心功能

### 认证系统
- 支持账号密码/手机验证码登录
- JWT Token 管理
- 路由级别的权限控制
- 用户状态持久化

### 直播播放器
- 基于 flv.js 的 HTTP-FLV 播放
- 多清晰度自动切换
- 完整的播放控制功能
- 性能优化和错误处理

### 弹幕系统
- WebSocket 实时通信
- 弹幕发送和显示
- 弹幕礼物特效
- 互动消息处理

## 📄 开发文档

更多详细信息请参阅 `docs` 目录下的文档：
- [认证系统实现](docs/auth-implementation-plan.md)
- [播放器实现](docs/flv-player-implementation-plan.md)
- [WebSocket 配置](docs/websocket-nginx-config.md)
- [OBS 推流](docs/obs-streaming-plan.md)
- [WebRTC 实现](docs/webrtc-implementation-plan.md)
