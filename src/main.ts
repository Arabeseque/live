import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/auth';

// 引入全局样式
import '@unocss/reset/tailwind.css';
import './styles/main.css';
import 'uno.css';

async function bootstrap() {
  const app = createApp(App);
  const pinia = createPinia();

  // 挂载Pinia
  app.use(pinia);

  // 挂载路由
  app.use(router);

  // 初始化认证状态
  const authStore = useAuthStore();
  await authStore.initialize();

  // 挂载应用
  app.mount('#app');
}

bootstrap().catch((err) => {
  console.error('应用启动失败:', err);
});
