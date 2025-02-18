<template>
  <div class="live-list">
    <div class="header">
      <h1>直播广场</h1>
      <button v-if="isLoggedIn" class="create-btn" @click="showCreateDialog = true">
        开始直播
      </button>
      <button v-else class="create-btn" @click="goToLogin">
        登录后开播
      </button>
    </div>

    <!-- 创建直播间对话框 -->
    <div v-if="showCreateDialog" class="dialog-overlay" @click="showCreateDialog = false">
      <div class="dialog" @click.stop>
        <h2>创建直播间</h2>
        <div class="form-group">
          <label for="title">直播间标题</label>
          <input
            id="title"
            v-model="newRoomTitle"
            type="text"
            placeholder="请输入直播间标题"
            @keyup.enter="createRoom"
          >
        </div>
        <div class="dialog-footer">
          <button class="cancel-btn" @click="showCreateDialog = false">
            取消
          </button>
          <button class="confirm-btn" @click="createRoom">
            创建
          </button>
        </div>
      </div>
    </div>

    <!-- 直播列表 -->
    <div v-if="loading" class="loading">
      加载中...
    </div>
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>
    <div v-else-if="liveRooms.length === 0" class="empty-state">
      暂无直播
    </div>
    <div v-else class="room-grid">
      <div v-for="room in liveRooms" :key="room.id" class="room-card" @click="enterRoom(room.id)">
        <div class="room-thumbnail">
          <div v-if="room.status === 'living'" class="live-badge">LIVE</div>
          <div class="room-preview">
            <i class="i-carbon-play-filled text-4xl" />
          </div>
        </div>
        <div class="room-info">
          <h3 class="room-title">{{ room.title }}</h3>
          <div class="room-status">
            <span :class="['status-badge', room.status]">
              {{ room.status === 'living' ? '直播中' : '未开播' }}
            </span>
            <span class="viewer-count">
              <i class="i-carbon-user-filled" />
              {{ formatViewers(room.viewer_count) }}
            </span>
          </div>
          <div class="room-time" v-if="room.start_time">
            <i class="i-carbon-time" />
            {{ formatTime(room.start_time) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { api } from '../services/api'
import type { LiveRoom } from '../services/api'

const router = useRouter()
const authStore = useAuthStore()

// 状态
const loading = ref(false)
const error = ref('')
const liveRooms = ref<LiveRoom[]>([])
const showCreateDialog = ref(false)
const newRoomTitle = ref('')

// 计算属性
const isLoggedIn = computed(() => authStore.isLoggedIn)

// 格式化观看人数
function formatViewers(num: number) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

// 格式化时间
function formatTime(time: string) {
  const date = new Date(time)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 进入直播间
function enterRoom(roomId: string) {
  router.push(`/live/${roomId}`)
}

// 创建直播间
async function createRoom() {
  if (!newRoomTitle.value) return
  try {
    const response = await api.rooms.create(newRoomTitle.value)
    const room = response
    showCreateDialog.value = false
    newRoomTitle.value = ''
    // 跳转到直播间
    router.push(`/live/${room.id}`)
  } catch (err: any) {
    error.value = '创建直播间失败: ' + err.message
  }
}

// 跳转到登录页
function goToLogin() {
  router.push('/login')
}

// 获取直播列表
async function fetchLiveRooms() {
  try {
    loading.value = true
    error.value = ''

    const response = await api.rooms.getList()
    liveRooms.value = response as unknown as LiveRoom[]
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
  cursor: pointer;
}

.room-card:hover {
  transform: translateY(-4px);
}

.room-thumbnail {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 */
  background: #f5f5f5;
}

.room-preview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  opacity: 0.5;
  transition: opacity 0.3s;
}

.room-card:hover .room-preview {
  opacity: 0.8;
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
  z-index: 1;
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

.room-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.status-badge.living {
  background: #dc3545;
  color: white;
}

.status-badge.idle,
.status-badge.ended {
  background: #6c757d;
  color: white;
}

.viewer-count {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 14px;
}

.room-time {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 12px;
}

.loading,
.error-message,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error-message {
  background: #fff3f3;
  color: #dc3545;
  border-radius: 4px;
}

.empty-state {
  background: #f8f9fa;
  border-radius: 8px;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 8px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
}

.dialog h2 {
  margin: 0 0 20px;
  font-size: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #2f3542;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dfe4ea;
  border-radius: 4px;
  font-size: 16px;
}

.form-group input:focus {
  outline: none;
  border-color: #4cd137;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-footer button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn {
  background-color: #f1f2f6;
  color: #2f3542;
}

.cancel-btn:hover {
  background-color: #dfe4ea;
}

.confirm-btn {
  background-color: #4cd137;
  color: white;
}

.confirm-btn:hover {
  background-color: #44bd32;
}
</style>
