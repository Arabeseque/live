<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLiveStore } from '../../stores/live'
import { useUserStore } from '../../stores/user'
import { useMessage } from 'naive-ui'
import flvjs from 'flv.js'

const message = useMessage()

// 复制到剪贴板
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    message.success('已复制到剪贴板')
  } catch (err) {
    message.error('复制失败')
  }
}

const route = useRoute()
const liveStore = useLiveStore()
const userStore = useUserStore()
const videoRef = ref<HTMLVideoElement>()
const player = ref<flvjs.Player>()
const error = ref<string>('')

// 判断是否是房主
const isOwner = computed(() => {
  return liveStore.currentRoom?.user_id === userStore.user?.id
})

// 初始化FLV播放器
function initPlayer(url: string) {
  if (flvjs.isSupported()) {
    player.value = flvjs.createPlayer({
      type: 'flv',
      url,
      isLive: true,
    })
    player.value.attachMediaElement(videoRef.value!)
    player.value.load()
    player.value.play()
  } else {
    error.value = '您的浏览器不支持FLV播放'
  }
}

// 开始直播
async function handleStartLive() {
  try {
    const roomId = route.params.id as string
    await liveStore.startLive(roomId)

    // 确保使用最新的stream_key
    const streamKey = liveStore.currentRoom?.stream_key
    message.success(`直播已开始! 请使用最新的推流密钥：${streamKey}`)

    // 开始直播后重新加载播放器
    if (liveStore.currentRoom?.streamUrls) {
      initPlayer(liveStore.currentRoom.streamUrls.flv)
    }
  } catch (err: any) {
    error.value = err.message
  }
}

// 结束直播
async function handleEndLive() {
  try {
    const roomId = route.params.id as string
    await liveStore.endLive(roomId)
    // 销毁播放器
    if (player.value) {
      player.value.destroy()
      player.value = undefined
    }
  } catch (err: any) {
    error.value = err.message
  }
}

onMounted(async () => {
  try {
    const roomId = route.params.id as string
    await liveStore.fetchRoom(roomId)

    // 如果是观众且直播已开始，则初始化播放器
    if (liveStore.currentRoom && !isOwner.value && liveStore.currentRoom.status === 'living') {
      initPlayer(liveStore.currentRoom.streamUrls.flv)
    }
  } catch (err: any) {
    error.value = err.message
  }
})

onUnmounted(() => {
  if (player.value) {
    player.value.destroy()
    player.value = undefined
  }
  liveStore.cleanup()
})
</script>

<template>
  <div class="live-room">
    <div v-if="error" class="error">
      {{ error }}
    </div>
    <div v-else-if="liveStore.loading" class="loading">
      加载中...
    </div>
    <div v-else-if="liveStore.currentRoom" class="room-container">
      <div class="room-header">
        <h1>{{ liveStore.currentRoom.title }}</h1>
        <div class="room-status">
          <span :class="['status-badge', liveStore.currentRoom.status]">
            {{ liveStore.currentRoom.status === 'living' ? '直播中' : '未开播' }}
          </span>
          <span class="viewer-count">
            <i class="i-carbon-user-multiple" />
            {{ liveStore.currentRoom.viewerCount }}
          </span>
        </div>
      </div>

      <div class="video-container">
        <video ref="videoRef" controls autoplay />
      </div>

      <!-- 主播控制面板 -->
      <div v-if="isOwner" class="streamer-panel">
        <n-card title="推流信息（OBS设置）" class="stream-info">
          <div class="info-item">
            <span class="label">推流地址：</span>
            <span>rtmp://localhost:1935/live</span>
            <n-button size="small" @click="copyToClipboard('rtmp://localhost:1935/live')">
              复制
            </n-button>
          </div>
          <div class="info-item">
            <span class="label">推流密钥：</span>
            <span>{{ liveStore.currentRoom.stream_key }}</span>
            <n-button size="small" @click="copyToClipboard(liveStore.currentRoom.stream_key)">
              复制
            </n-button>
          </div>
        </n-card>

        <div class="stream-controls">
          <n-button
            v-if="liveStore.currentRoom.status === 'idle'"
            type="primary"
            @click="handleStartLive"
          >
            开始直播
          </n-button>
          <n-button
            v-else-if="liveStore.currentRoom.status === 'living'"
            type="error"
            @click="handleEndLive"
          >
            结束直播
          </n-button>
        </div>
      </div>

      <!-- 直播信息 -->
      <n-card title="房间信息" class="room-info">
        <div class="info-item">
          <span class="label">开始时间：</span>
          <span>{{ liveStore.currentRoom.startTime || '未开始' }}</span>
        </div>
        <div class="info-item">
          <span class="label">结束时间：</span>
          <span>{{ liveStore.currentRoom.endTime || '-' }}</span>
        </div>
      </n-card>
    </div>
    <div v-else class="not-found">
      直播间不存在
    </div>
  </div>
</template>

<style scoped>
.live-room {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.room-status {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
}

.status-badge.living {
  background-color: #ff4757;
  color: white;
}

.status-badge.idle,
.status-badge.ended {
  background-color: #a4b0be;
  color: white;
}

.viewer-count {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #747d8c;
}

.video-container {
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

video {
  width: 100%;
  height: 100%;
}

.streamer-panel {
  margin-bottom: 20px;
}

.stream-info {
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}

.info-item .label {
  color: #747d8c;
  min-width: 80px;
}

.stream-controls {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.error,
.loading,
.not-found {
  text-align: center;
  padding: 40px;
}

.error {
  color: #ff4757;
}
</style>
