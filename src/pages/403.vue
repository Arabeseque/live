<template>
  <div class="unauthorized-page">
    <n-result
      status="403"
      title="无权限访问"
      description="您没有权限访问该页面"
      :footer="renderFooter"
    />
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { NButton } from 'naive-ui';

const router = useRouter();
const route = useRoute();

function goBack() {
  if (route.query.from) {
    router.push(route.query.from as string);
  } else {
    router.back();
  }
}

function goHome() {
  router.push('/');
}

function renderFooter() {
  return [
    h(
      NButton,
      {
        onClick: goBack,
      },
      { default: () => '返回上一页' }
    ),
    h(
      NButton,
      {
        type: 'primary',
        onClick: goHome,
        style: 'margin-left: 16px',
      },
      { default: () => '返回首页' }
    ),
  ];
}
</script>

<style scoped>
.unauthorized-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
</style>
