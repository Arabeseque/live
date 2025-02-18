<template>
  <div class="live-list">
    <div class="header">
      <h1>直播广场</h1>
      <button v-if="isLoggedIn" class="create-btn" @click="createLiveRoom">
        开始直播
      </button>
    </div>

    <!-- 直播列表 -->
    <div class="room-grid">
      <div v-for="room in liveRooms" :key="room._id" class="room-card">
        {{liveRooms}}
        <div class="room-thumbnail" @click="enterRoom(room._id)">
          room
          <div class="live-badge" v-if="room.status === 'live'">LIVE</div>
          <img :src="room.thumbnail || '/placeholder.jpg'" alt="直播间封面">
        </div>
        <div class="room-info">
          <h3 class="room-title">{{ room.title }}</h3>
          <div class="streamer-info">
            <span class="streamer-name">{{ room.streamerName || '未知主播' }}</span>
            <span class="viewer-count">
              <i class="i-carbon-user-filled" />
              {{ formatViewers(room.viewers) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      加载中...
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && liveRooms.length === 0" class="empty-state">
      暂无直播
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'
import type { LiveRoom } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

// 状态
const loading = ref(false)
const error = ref('')
const liveRooms = ref<LiveRoom[]>([])

// 计算属性
const isLoggedIn = computed(() => authStore.isLoggedIn)

// 格式化观看人数
function formatViewers(num?: number) {
  if (num === undefined || num === null) return '0'
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

// 进入直播间
function enterRoom(roomId: string) {
  router.push(`/stream?id=${roomId}`)
}

// 创建直播间
function createLiveRoom() {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  router.push('/stream')
}

// 获取直播列表
async function fetchLiveRooms() {
  try {
    loading.value = true
    error.value = ''

    const response = await api.rooms.getList()
    console.log('API响应:', response)
    
    if (response.message === '操作成功' && response.data?.success) {
      liveRooms.value = response.data.data || []
      console.log('直播间列表:', liveRooms.value)
    } else {
      throw new Error(response.message || '获取直播列表失败')
    }
  } catch (err: any) {
    error.value = '获取直播列表失败: ' + err.message
    console.error('获取直播列表失败:', err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchLiveRooms()
})
</script>

<style scoped>
.live-list {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

h1 {
  font-size: 24px;
  color: #2c3e50;
  margin: 0;
}

.create-btn {
  padding: 8px 16px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.create-btn:hover {
  background: #3aa876;
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.room-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.room-card:hover {
  transform: translateY(-4px);
}

.room-thumbnail {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 */
  background: #f5f5f5;
  cursor: pointer;
}

.room-thumbnail img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.live-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  background: #dc3545;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.room-info {
  padding: 12px;
}

.room-title {
  margin: 0 0 8px;
  font-size: 16px;
  color: #2c3e50;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.streamer-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.streamer-name {
  color: #666;
}

.viewer-count {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
  background: #f8f9fa;
  border-radius: 8px;
}

.error-message {
  text-align: center;
  padding: 12px;
  margin: 20px 0;
  background: #fff3f3;
  color: #dc3545;
  border-radius: 4px;
}
</style>
