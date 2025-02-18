import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { liveService, type LiveRoom } from '../services/live'
import { useWebSocket } from '../composables/useWebSocket'

export const useLiveStore = defineStore('live', () => {
  // 状态
  const rooms = ref<LiveRoom[]>([])
  const currentRoom = ref<LiveRoom | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // WebSocket 连接
  const { connect, disconnect } = useWebSocket({
    onMessage: handleWebSocketMessage
  })

  // 获取直播间列表
  async function fetchRooms() {
    try {
      loading.value = true
      const data = await liveService.getRoomList()
      rooms.value = data
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // 获取直播间详情
  async function fetchRoom(roomId: string) {
    try {
      loading.value = true
      const data = await liveService.getRoomDetail(roomId)
      currentRoom.value = data
      // 连接 WebSocket
      await connect()
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // 创建直播间
  async function createRoom(title: string) {
    try {
      loading.value = true
      const data = await liveService.createRoom({ title })
      rooms.value.unshift(data)
      return data
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 开始直播
  async function startLive(roomId: string) {
    try {
      loading.value = true
      const data = await liveService.startLive(roomId)
      updateRoom(data)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 结束直播
  async function endLive(roomId: string) {
    try {
      loading.value = true
      const data = await liveService.endLive(roomId)
      updateRoom(data)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新房间信息
  function updateRoom(room: LiveRoom) {
    const index = rooms.value.findIndex((r: LiveRoom) => r.id === room.id)
    if (index !== -1) {
      rooms.value[index] = room
    }
    if (currentRoom.value?.id === room.id) {
      currentRoom.value = room
    }
  }

  // 处理 WebSocket 消息
  function handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'roomUpdate':
        updateRoom(data.room)
        break
      case 'viewerCount':
        if (currentRoom.value && currentRoom.value.id === data.roomId) {
          currentRoom.value.viewerCount = data.count
        }
        break
      case 'roomDeleted':
        if (currentRoom.value && currentRoom.value.id === data.roomId) {
          // 使用 naive-ui 的消息提示
          const message = useMessage()
          message.warning(data.reason)
          // 清理房间数据
          currentRoom.value = null
          // 从列表中移除
          const index = rooms.value.findIndex(r => r.id === data.roomId)
          if (index !== -1) {
            rooms.value.splice(index, 1)
          }
          // 重定向到首页
          const router = useRouter()
          router.push('/')
        }
        break
    }
  }

  // 清理
  function cleanup() {
    rooms.value = []
    currentRoom.value = null
    error.value = null
    disconnect()
  }

  return {
    // 状态
    rooms,
    currentRoom,
    loading,
    error,

    // 方法
    fetchRooms,
    fetchRoom,
    createRoom,
    startLive,
    endLive,
    cleanup
  }
})
