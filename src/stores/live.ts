import { defineStore } from 'pinia'
import { ref } from 'vue'

interface LiveRoom {
  _id: string
  title: string
  streamerName: string
  status: 'pending' | 'live' | 'ended'
  viewers: number
  startTime?: Date
  endTime?: Date
  thumbnail?: string
}

// NOTE: 使用 Pinia 管理直播状态，包括：
// 1. 当前直播间信息
// 2. 所有直播列表
// 3. 直播操作（开始/结束直播）
// 4. WebSocket 消息处理
export const useLiveStore = defineStore('live', () => {
  // 状态
  const rooms = ref<LiveRoom[]>([])
  const currentRoom = ref<LiveRoom | null>(null)
  const error = ref<string | null>(null)
  const ws = ref<WebSocket | null>(null)

  // WebSocket连接
  async function connect() {
    if (ws.value?.readyState === WebSocket.OPEN) return

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8088/ws'

    return new Promise((resolve, reject) => {
      try {
        ws.value = new WebSocket(wsUrl)

        ws.value.onopen = () => {
          console.log('WebSocket连接成功')
          resolve(true)
        }

        ws.value.onclose = () => {
          console.log('WebSocket连接关闭')
          // 尝试重连
          setTimeout(connect, 3000)
        }

        ws.value.onerror = (err) => {
          console.error('WebSocket错误:', err)
          error.value = 'WebSocket连接错误'
          reject(err)
        }

        ws.value.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            handleWebSocketMessage(data)
          } catch (err) {
            console.error('解析WebSocket消息失败:', err)
          }
        }
      } catch (err) {
        console.error('创建WebSocket连接失败:', err)
        reject(err)
      }
    })
  }

  // 处理WebSocket消息
  function handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'roomCreated':
        rooms.value.unshift(data.room)
        break

      case 'roomUpdated':
        const index = rooms.value.findIndex(r => r._id === data.room._id)
        if (index !== -1) {
          rooms.value[index] = { ...rooms.value[index], ...data.room }
        }
        // 更新当前房间信息
        if (currentRoom.value?._id === data.room._id) {
          currentRoom.value = { ...currentRoom.value, ...data.room }
        }
        break

      case 'roomDeleted':
        const roomIndex = rooms.value.findIndex(r => r._id === data.roomId)
        if (roomIndex !== -1) {
          rooms.value.splice(roomIndex, 1)
        }
        // 清除当前房间
        if (currentRoom.value?._id === data.roomId) {
          currentRoom.value = null
        }
        break

      case 'viewerJoined':
      case 'viewerLeft':
        const room = rooms.value.find(r => r._id === data.roomId)
        if (room) {
          room.viewers = data.viewers
        }
        if (currentRoom.value?._id === data.roomId) {
          currentRoom.value.viewers = data.viewers
        }
        break

      case 'error':
        error.value = data.message
        break
    }
  }

  // 获取房间信息
  async function fetchRoom(roomId: string) {
    try {
      const response = await fetch(`/api/rooms/${roomId}`)
      const data = await response.json()

      if (data.success) {
        currentRoom.value = data.data
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  // 清理
  function cleanup() {
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
    rooms.value = []
    currentRoom.value = null
    error.value = null
  }

  return {
    // 状态
    rooms,
    currentRoom,
    error,

    // 方法
    connect,
    fetchRoom,
    cleanup
  }
})
