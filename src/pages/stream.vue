<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLiveStore } from '../stores/live'

const router = useRouter()
const liveStore = useLiveStore()
const showCreateDialog = ref(false)
const newRoomTitle = ref('')

onMounted(() => {
  liveStore.fetchRooms()
})

async function createRoom() {
  if (!newRoomTitle.value) return
  try {
    const room = await liveStore.createRoom(newRoomTitle.value)
    showCreateDialog.value = false
    newRoomTitle.value = ''
    // 跳转到直播间
    router.push(`/live/${room.id}`)
  } catch (err) {
    console.error('创建直播间失败:', err)
  }
}

function goToRoom(roomId: string) {
  router.push(`/live/${roomId}`)
}
</script>

<template>
  <div class="stream-page">
    <div class="header">
      <h1>直播列表</h1>
      <button class="create-btn" @click="showCreateDialog = true">
        创建直播间
      </button>
    </div>

    <div v-if="liveStore.loading" class="loading">
      加载中...
    </div>
    <div v-else-if="liveStore.error" class="error">
      {{ liveStore.error }}
    </div>
    <div v-else-if="liveStore.rooms.length === 0" class="empty">
      暂无直播
    </div>
    <div v-else class="room-list">
      <div
        v-for="room in liveStore.rooms"
        :key="room.id"
        class="room-card"
        @click="goToRoom(room.id)"
      >
        <div class="room-info">
          <h2>{{ room.title }}</h2>
          <div class="room-status">
            <span :class="['status-badge', room.status]">
              {{ room.status === 'living' ? '直播中' : '未开播' }}
            </span>
            <span class="viewer-count">
              <i class="i-carbon-user-multiple" />
              {{ room.viewerCount }}
            </span>
          </div>
        </div>
        <div class="room-time">
          <div v-if="room.startTime" class="time-item">
            <span class="label">开始时间：</span>
            <span>{{ room.startTime }}</span>
          </div>
          <div v-if="room.endTime" class="time-item">
            <span class="label">结束时间：</span>
            <span>{{ room.endTime }}</span>
          </div>
        </div>
      </div>
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
  </div>
</template>

<style scoped>
.stream-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.create-btn {
  padding: 8px 16px;
  background-color: #4cd137;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.create-btn:hover {
  background-color: #44bd32;
}

.room-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.room-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.room-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.room-info {
  margin-bottom: 12px;
}

.room-info h2 {
  margin: 0 0 8px;
  font-size: 18px;
}

.room-status {
  display: flex;
  align-items: center;
  gap: 12px;
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

.room-time {
  font-size: 14px;
  color: #747d8c;
}

.time-item {
  margin-bottom: 4px;
}

.time-item .label {
  color: #a4b0be;
  margin-right: 8px;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 40px;
  color: #747d8c;
}

.error {
  color: #ff4757;
}

/* 对话框样式 */
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
