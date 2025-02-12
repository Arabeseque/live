<template>
  <div class="login-page">
    <n-card title="用户登录" class="login-card">
      <n-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-placement="left"
        label-width="80"
        require-mark-placement="right-hanging"
      >
        <n-form-item label="用户名" path="username">
          <n-input
            v-model:value="form.username"
            placeholder="请输入用户名"
          />
        </n-form-item>
        <n-form-item label="密码" path="password">
          <n-input
            v-model:value="form.password"
            type="password"
            placeholder="请输入密码"
            show-password-on="click"
          />
        </n-form-item>
      </n-form>

      <div class="action-buttons">
        <n-button type="primary" block @click="handleLogin" :loading="loading">
          登录
        </n-button>
        <n-button text @click="goToRegister" class="register-link">
          还没有账号？立即注册
        </n-button>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import { useAuthStore } from '@/stores/auth';
import type { FormInst } from 'naive-ui';

const router = useRouter();
const message = useMessage();
const authStore = useAuthStore();

// 表单引用
const formRef = ref<FormInst | null>(null);

// 加载状态
const loading = ref(false);

// 登录表单
const form = ref({
  username: '',
  password: '',
});

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
};

// 登录
async function handleLogin() {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    await authStore.login(form.value.username, form.value.password);
    message.success('登录成功');
    router.push('/');
  } catch (error: any) {
    message.error(error.message || '登录失败');
  } finally {
    loading.value = false;
  }
}

// 跳转到注册页
function goToRegister() {
  router.push('/register');
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-card {
  width: 400px;
  max-width: 90%;
}

.action-buttons {
  margin-top: 24px;
}

.register-link {
  margin-top: 16px;
  width: 100%;
}
</style>
