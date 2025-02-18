import { ref } from 'vue'

interface WebSocketOptions {
  onMessage?: (data: any) => void
  onError?: (error: Event) => void
  onClose?: () => void
  onOpen?: () => void
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export function useWebSocket(options: WebSocketOptions = {}) {
  const {
    onMessage,
    onError,
    onClose,
    onOpen,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5
  } = options

  const ws = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const reconnectAttempts = ref(0)

  function connect() {
    if (ws.value?.readyState === WebSocket.OPEN) {
      return Promise.resolve()
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8088/ws'

    return new Promise((resolve, reject) => {
      try {
        ws.value = new WebSocket(wsUrl)

        ws.value.onopen = () => {
          console.log('WebSocket连接成功')
          isConnected.value = true
          reconnectAttempts.value = 0
          onOpen?.()
          resolve(true)
        }

        ws.value.onclose = () => {
          console.log('WebSocket连接关闭')
          isConnected.value = false
          onClose?.()
          
          // 尝试重连
          if (reconnectAttempts.value < maxReconnectAttempts) {
            reconnectAttempts.value++
            setTimeout(connect, reconnectInterval)
          }
        }

        ws.value.onerror = (error) => {
          console.error('WebSocket错误:', error)
          onError?.(error)
          reject(error)
        }

        ws.value.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            onMessage?.(data)
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

  function disconnect() {
    if (ws.value) {
      ws.value.close()
      ws.value = null
      isConnected.value = false
      reconnectAttempts.value = maxReconnectAttempts // 防止重连
    }
  }

  function send(data: any) {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(data))
    } else {
      console.error('WebSocket未连接')
    }
  }

  return {
    ws,
    isConnected,
    connect,
    disconnect,
    send
  }
} 
