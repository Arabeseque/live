<template>
  <div class="register-page">
    <n-card title="用户注册" class="register-card">
      <n-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-placement="left"
        label-width="80"
        require-mark-placement="right-hanging"
      >
        <n-form-item label="手机号" path="phone">
          <n-input v-model:value="form.phone" placeholder="请输入手机号" />
        </n-form-item>

        <n-form-item label="密码" path="password">
          <n-input
            v-model:value="form.password"
            type="password"
            show-password-on="click"
            placeholder="请输入密码"
          />
        </n-form-item>

        <n-form-item label="确认密码" path="confirmPassword">
          <n-input
            v-model:value="form.confirmPassword"
            type="password"
            show-password-on="click"
            placeholder="请再次输入密码"
          />
        </n-form-item>

        <n-form-item label="用户名" path="username">
          <n-input v-model:value="form.username" placeholder="选填，不填则默认使用手机号" />
        </n-form-item>
      </n-form>

      <div class="action-buttons">
        <n-button type="primary" block @click="handleRegister" :loading="loading">
          注册
        </n-button>
        <n-button text @click="goToLogin" class="login-link">
          已有账号？立即登录
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

// 注册表单
const form = ref({
  phone: '',
  password: '',
  confirmPassword: '',
  username: '',
});

// 自定义密码验证函数
function validatePassword(rule: any, value: string) {
  if (!value) {
    return new Error('请输入密码');
  }
  if (value.length < 8) {
    return new Error('密码长度至少为8位');
  }
  if (!/[a-z]/.test(value)) {
    return new Error('密码必须包含小写字母');
  }
  if (!/[A-Z]/.test(value)) {
    return new Error('密码必须包含大写字母');
  }
  if (!/\d/.test(value)) {
    return new Error('密码必须包含数字');
  }
  return true;
}

// 自定义确认密码验证函数
function validateConfirmPassword(rule: any, value: string) {
  if (!value) {
    return new Error('请再次输入密码');
  }
  if (value !== form.value.password) {
    return new Error('两次输入的密码不一致');
  }
  return true;
}

// 表单验证规则
const rules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { validator: validatePassword, trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
  username: [
    { min: 3, message: '用户名至少3个字符', trigger: 'blur' },
    { max: 30, message: '用户名最多30个字符', trigger: 'blur' },
  ],
};

// 注册
async function handleRegister() {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    await authStore.register({
      phone: form.value.phone,
      password: form.value.password,
      username: form.value.username || undefined,
    });

    message.success('注册成功');
    router.push('/');
  } catch (error: any) {
    message.error(error.message || '注册失败');
  } finally {
    loading.value = false;
  }
}

// 跳转到登录页
function goToLogin() {
  router.push('/login');
}
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.register-card {
  width: 400px;
  max-width: 90%;
}

.action-buttons {
  margin-top: 24px;
}

.login-link {
  margin-top: 16px;
  width: 100%;
}
</style>
