<template>
  <div class="stream-page">
    <div class="container">
      <h1>直播间</h1>

      <!-- 推流组件 -->
      <div class="stream-container">
        <h2>推流</h2>
        <LiveStream
          :signaling-url="signalingUrl"
          :srs-url="srsUrl"
          :room-id="roomId"
          :user-id="userId"
          :stream-name="streamName"
        />
      </div>

      <!-- 播放器组件 -->
      <div class="player-container">
        <h2>直播画面</h2>
        <FlvPlayer
          v-if="playUrl"
          :url="playUrl"
          :is-live="true"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import LiveStream from '@/components/LiveStream.vue'
import FlvPlayer from '@/components/FlvPlayer.vue'

// 配置信息
const signalingUrl = 'wss://your-signaling-server.com'  // 需要替换为实际的信令服务器地址
const srsUrl = 'http://localhost:8080'                  // SRS 服务器地址
const roomId = ref('demo-room')                        // 可以通过路由参数或其他方式动态设置
const userId = ref('user-' + Math.random().toString(36).substr(2, 9))
const streamName = ref(`stream-${roomId.value}-${userId.value}`)

// 计算播放地址
const playUrl = computed(() => {
  // 根据 SRS 的 HTTP-FLV 规则生成播放地址
  return `${srsUrl}/live/${streamName.value}.flv`
})
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

h2 {
  font-size: 1.5em;
  margin-bottom: 16px;
  color: #2c3e50;
}

.stream-container,
.player-container {
  margin-bottom: 32px;
}

@media (min-width: 1024px) {
  .container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }

  h1 {
    grid-column: 1 / -1;
  }
}
</style>
