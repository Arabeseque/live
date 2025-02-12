<template>
  <div class="stream-page">
    <div class="container">
      <h1>直播间</h1>

      <LiveStream
        :signaling-url="signalingUrl"
        :srs-url="srsUrl"
        :room-id="roomId"
        :user-id="userId"
        :stream-name="streamName"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LiveStream from '@/components/LiveStream.vue'

// 配置信息
const signalingUrl = 'wss://your-signaling-server.com'  // 需要替换为实际的信令服务器地址
const srsUrl = 'https://your-srs-server.com'           // 需要替换为实际的SRS服务器地址
const roomId = ref('demo-room')                        // 可以通过路由参数或其他方式动态设置
const userId = ref('user-' + Math.random().toString(36).substr(2, 9))
const streamName = ref(`stream-${roomId.value}-${userId.value}`)
</script>

<style scoped>
.stream-page {
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 32px;
  color: #2c3e50;
}
</style>
