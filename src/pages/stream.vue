<template>
  <div class="stream-page">
    <div class="container">
      <h1>{{ isStreamer ? '我的直播间' : streamTitle }}</h1>

      <!-- 推流组件 - 仅在主播模式显示 -->
      <div v-if="isStreamer" class="stream-container">
        <LiveStream
          v-if="roomId"
          :signaling-url="signalingUrl"
          :streamhttp-url="streamHttpUrl"
          :srs-url="srsUrl"
          :room-id="roomId"
          :user-id="userId"
          :stream-name="streamName"
        />
        <div v-else class="loading">正在创建直播间...</div>

        <!-- 推流配置信息 -->
        <div class="stream-config">
          <h3>OBS推流配置</h3>
          <div class="config-item">
            <div class="label">推流地址：</div>
            <div class="value">
              <span>{{ rtmpUrl }}</span>
              <button class="copy-btn" @click="copyToClipboard(rtmpUrl)">复制</button>
            </div>
          </div>
          <div class="config-item">
            <div class="label">串流密钥：</div>
            <div class="value">
              <span>{{ roomId }}</span>
              <button class="copy-btn" @click="copyToClipboard(roomId)">复制</button>
            </div>
          </div>
        </div>
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
import { useAuthStore } from '@/stores/auth'
import { TokenUtils } from '@/utils/token'

const route = useRoute()
const router = useRouter()
const liveStore = useLiveStore()
const authStore = useAuthStore()
const { currentRoom, error: storeError } = storeToRefs(liveStore)

// 基础配置
const signalingUrl = import.meta.env.VITE_SIGNALING_URL || 'ws://localhost:8088/ws'
const srsUrl = import.meta.env.VITE_SRS_URL || 'http://localhost:8080'
const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8088'
const streamHttpUrl = import.meta.env.VITE_STREAM_HTTP_URL || 'http://localhost:8080'
const rtmpUrl = import.meta.env.VITE_SRS_RTMP_URL || 'rtmp://localhost:1935/live'
const userId = ref(authStore.userInfo?.id || '')
const roomId = ref(route.query.id?.toString() || '')
const streamName = computed(() => `stream-${roomId.value}`)

// 页面状态
const error = ref<string | null>(null)
const isCreatingRoom = ref(false)

// 计算属性
const isStreamer = computed(() => !route.query.id) // 无 id 参数时为主播模式
const playUrl = computed(() => {
  if (roomId.value) {
    return `${srsUrl}/live/${streamName.value}.flv`
  }
  return ''
})
const streamTitle = computed(() => currentRoom.value?.title || '直播间')

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

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

// 创建直播间
async function createRoom() {
  try {
    isCreatingRoom.value = true
    error.value = null

    const response = await fetch(`${apiBaseUrl}/api/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TokenUtils.getToken()}`
      },
      body: JSON.stringify({
        title: '我的直播间'
      })
    })

    if (!response.ok) {
      throw new Error('创建直播间失败')
    }

    const {data} = await response.json()
    if (data.success) {
      roomId.value = data.data._id
      // 更新URL，但不触发路由变化
      window.history.replaceState(
        null,
        '',
        `${route.path}?id=${roomId.value}`
      )
    } else {
      throw new Error(data.message || '创建直播间失败')
    }
  } catch (err: any) {
    error.value = err.message
    console.error('创建直播间失败:', err)
  } finally {
    isCreatingRoom.value = false
  }
}

// 监听错误状态
if (storeError.value) {
  error.value = storeError.value
}

onMounted(async () => {
  try {
    // 连接 WebSocket（如果还未连接）
    await liveStore.connect()

    // 如果是主播模式且没有roomId，创建新的直播间
    if (isStreamer.value && !roomId.value) {
      await createRoom()
    }
    // 如果是观众模式且找不到直播间，跳转回首页
    else if (!isStreamer.value && !currentRoom.value) {
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

.loading {
  padding: 20px;
  text-align: center;
  color: #666;
}

.stream-info {
  padding: 16px;
}

.stream-config {
  padding: 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.stream-config h3 {
  margin: 0 0 16px 0;
  color: #2c3e50;
}

.config-item {
  display: flex;
  margin-bottom: 12px;
  align-items: center;
}

.config-item .label {
  width: 100px;
  color: #666;
}

.config-item .value {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.copy-btn {
  padding: 4px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.copy-btn:hover {
  background-color: #0056b3;
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
