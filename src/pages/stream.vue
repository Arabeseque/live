<template>
  <div class="stream-page">
    <div class="container">
      <h1>{{ isStreamer ? '我的直播间' : streamTitle }}</h1>

      <!-- 推流组件 - 仅在主播模式显示 -->
      <div v-if="isStreamer" class="stream-container">
        <LiveStream
          :signaling-url="signalingUrl"
          :srs-url="srsUrl"
          :room-id="roomId"
          :user-id="userId"
          :stream-name="streamName"
        />
      </div>

      <!-- 播放组件 - 仅在观众模式显示 -->
      <div v-else-if="playUrl" class="player-container">
        <FlvPlayer
          :url="playUrl"
          :is-live="true"
        />

        <!-- 直播信息 -->
        <div class="stream-info" v-if="currentRoom">
          <div class="info-header">
            <h2>{{ currentRoom.title }}</h2>
            <span class="viewers">
              <i class="i-carbon-user-filled" />
              {{ formatViewers(currentRoom.viewers) }} 观看
            </span>
          </div>
          <div class="streamer-info">
            <span class="streamer-name">主播：{{ currentRoom.streamerName }}</span>
            <span class="stream-duration">
              <i class="i-carbon-time" />
              {{ formatDuration(Date.now() - currentRoom.startTime) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useLiveStore } from '@/stores/live'
import LiveStream from '@/components/LiveStream.vue'
import FlvPlayer from '@/components/FlvPlayer.vue'

const route = useRoute()
const router = useRouter()
const liveStore = useLiveStore()
const { currentRoom, error: storeError } = storeToRefs(liveStore)

// 基础配置
const signalingUrl = 'wss://your-signaling-server.com'
const srsUrl = 'http://localhost:8080'
const userId = ref('user-' + Math.random().toString(36).substr(2, 9))
const roomId = ref(route.query.id?.toString() || '')
const streamName = computed(() => `stream-${roomId.value}`)

// 页面状态
const error = ref<string | null>(null)

// 计算属性
const isStreamer = computed(() => !route.query.id) // 无 id 参数时为主播模式
const playUrl = computed(() => {
  if (roomId.value) {
    return `${srsUrl}/live/${streamName.value}.flv`
  }
  return ''
})
const streamTitle = computed(() => currentRoom.value?.title || '直播间')

// 格式化观看人数
const formatViewers = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

// 格式化直播时长
const formatDuration = (ms: number) => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟`
  }
  if (minutes > 0) {
    return `${minutes}分钟`
  }
  return '刚刚开播'
}

// 监听错误状态
if (storeError.value) {
  error.value = storeError.value
}

onMounted(async () => {
  try {
    // 连接 WebSocket（如果还未连接）
    await liveStore.connect()

    // 如果是观众模式且找不到直播间，跳转回首页
    if (!isStreamer.value && !currentRoom.value) {
      error.value = '直播间不存在或已结束'
      setTimeout(() => {
        router.push('/')
      }, 2000)
    }
  } catch (err: any) {
    error.value = err.message
  }
})
</script>

<style scoped>
.stream-page {
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f5f5;
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

.stream-container,
.player-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stream-info {
  padding: 16px;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.info-header h2 {
  margin: 0;
  font-size: 20px;
  color: #2c3e50;
}

.viewers {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
}

.streamer-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #666;
  font-size: 14px;
}

.stream-duration {
  display: flex;
  align-items: center;
  gap: 4px;
}

.error-message {
  text-align: center;
  color: #dc3545;
  margin-top: 16px;
  padding: 12px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(220, 53, 69, 0.1);
}
</style>
