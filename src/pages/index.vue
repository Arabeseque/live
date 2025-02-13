<template>
  <div class="home-page">
    <!-- 顶部导航 -->
    <AppHeader />

    <!-- 主要内容区 -->
    <main class="main-content">
      <!-- 直播列表 -->
      <div class="streams-grid">
        <div
          v-for="stream in streams"
          :key="stream.id"
          class="stream-card"
          @click="navigateToStream(stream.id)"
        >
          <!-- 预览图 -->
          <div class="stream-preview">
            <img :src="stream.thumbnail" :alt="stream.title">
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
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'

const router = useRouter()

// 格式化观看人数
const formatViewers = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

// 跳转到直播间
const navigateToStream = (streamId: string) => {
  router.push(`/stream?id=${streamId}`)
}

// 模拟直播数据
const streams = ref([
  {
    id: '1',
    title: '测试直播间1',
    streamerName: '主播1',
    viewers: 1234,
    thumbnail: 'https://via.placeholder.com/320x180'
  },
  {
    id: '2',
    title: '测试直播间2',
    streamerName: '主播2',
    viewers: 15678,
    thumbnail: 'https://via.placeholder.com/320x180'
  },
  {
    id: '3',
    title: '测试直播间3',
    streamerName: '主播3',
    viewers: 892,
    thumbnail: 'https://via.placeholder.com/320x180'
  },
  {
    id: '4',
    title: '测试直播间4',
    streamerName: '主播4',
    viewers: 23456,
    thumbnail: 'https://via.placeholder.com/320x180'
  },
])
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
  margin: 0;
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
