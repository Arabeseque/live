<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Logo -->
      <div class="logo">
        <h1>LiveRoom</h1>
      </div>

      <!-- 操作区 -->
      <div class="actions">
        <router-link
          to="/stream"
          class="start-stream-btn"
        >
          开始直播
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// 组件逻辑
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  height: 100%;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo h1 {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
}

.start-stream-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 20px;
  background-color: #42b883;
  color: white;
  border-radius: 4px;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s;
}

.start-stream-btn:hover {
  background-color: #3aa876;
}
</style>
