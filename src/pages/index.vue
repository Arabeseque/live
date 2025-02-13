<template>
  <div class="home-page">
    <!-- 顶部导航 -->
    <AppHeader />

    <!-- 主要内容区 -->
    <main class="main-content">
      <div v-if="isLoading" class="loading">
        加载中...
      </div>

      <div v-else-if="error" class="error">
        {{ error }}
      </div>

      <!-- 直播列表 -->
      <div v-else class="streams-grid">
        <div
          v-for="stream in activeLiveRooms"
          :key="stream.id"
          class="stream-card"
          @click="navigateToStream(stream.id)"
        >
          <!-- 预览图 -->
          <div class="stream-preview">
            <img :src="stream.thumbnail || '/placeholder-stream.jpg'" :alt="stream.title">
            <span class="live-badge">直播中</span>
            <span class="viewers-badge">
              <i class="i-carbon-user-filled" />
              {{ formatViewers(stream.viewers) }}
            </span>
          </div>

          <!-- 直播信息 -->
          <div class="stream-info">
            <h3 class="stream-title">{{ stream.title }}</h3>
            <p class="streamer-name">{{ stream.streamerName }}</p>
            <p class="stream-time">
              <i class="i-carbon-time" />
              {{ formatDuration(Date.now() - stream.startTime) }}
            </p>
          </div>
        </div>

        <!-- 无直播提示 -->
        <div v-if="activeLiveRooms.length === 0" class="no-streams">
          当前没有进行中的直播
          <router-link to="/stream" class="start-stream-link">
            开始直播
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useLiveStore } from '@/stores/live'
import AppHeader from '@/components/AppHeader.vue'

const router = useRouter()
const liveStore = useLiveStore()
const { activeLiveRooms, isLoading, error } = storeToRefs(liveStore)

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

// 跳转到直播间
const navigateToStream = (streamId: string) => {
  router.push(`/stream?id=${streamId}`)
}

// 组件挂载时连接 WebSocket
onMounted(async () => {
  await liveStore.connect()
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px 20px;
}

.loading,
.error,
.no-streams {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  color: #dc3545;
}

.streams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.stream-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;
}

.stream-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stream-preview {
  position: relative;
  aspect-ratio: 16/9;
  background-color: #000;
}

.stream-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.live-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 8px;
  background-color: #ff4757;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.viewers-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 2px 8px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stream-info {
  padding: 12px;
}

.stream-title {
  font-size: 16px;
  font-weight: 500;
  color: #2c3e50;
  margin: 0 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.streamer-name {
  font-size: 14px;
  color: #666;
  margin: 0 0 4px;
}

.stream-time {
  font-size: 12px;
  color: #999;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.start-stream-link {
  display: inline-block;
  margin-top: 12px;
  padding: 8px 16px;
  background-color: #42b883;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.2s;
}

.start-stream-link:hover {
  background-color: #3aa876;
}

@media (max-width: 768px) {
  .streams-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  .main-content {
    padding: 70px 16px 16px;
  }
}
</style>
