export interface WebSocketMessage {
  type: string
  payload: any
}

export class WebSocketService {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout = 3000
  private messageHandlers: Map<string, ((payload: any) => void)[]> = new Map()

  // NOTE: 封装 WebSocket 连接管理，提供一个可复用的 WebSocketService 类，使前端可以方便地进行 WebSocket 连接、发送消息、接收消息，并且具备 自动重连机制 和 消息处理机制。
  constructor(url: string) {
    this.url = url
  }

  // 连接 WebSocket
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('函数 connect() 正在连接 WebSocket...', this.url)
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          console.log('WebSocket 连接成功')
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onclose = () => {
          console.log('WebSocket 连接关闭')
          this.handleReconnect()
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket 错误:', error)
          reject(error)
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('消息解析错误:', error)
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  // 发送消息
  public send(type: string, payload: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }))
    } else {
      console.error('WebSocket 未连接')
    }
  }

  // 添加消息处理器
  public addMessageHandler(type: string, handler: (payload: any) => void): void {
    const handlers = this.messageHandlers.get(type) || []
    handlers.push(handler)
    this.messageHandlers.set(type, handlers)
  }

  // 移除消息处理器
  public removeMessageHandler(type: string, handler: (payload: any) => void): void {
    const handlers = this.messageHandlers.get(type)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index !== -1) {
        handlers.splice(index, 1)
        if (handlers.length === 0) {
          this.messageHandlers.delete(type)
        }
      }
    }
  }

  // 关闭连接
  public disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  // 处理消息
  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.messageHandlers.get(message.type)
    if (handlers) {
      handlers.forEach(handler => handler(message.payload))
    }
  }

  // 处理重连
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`尝试重连... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      setTimeout(() => this.connect(), this.reconnectTimeout)
    } else {
      console.error('重连次数达到上限')
    }
  }
}

// 导出单例
export const wsService = new WebSocketService(import.meta.env.VITE_SIGNALING_URL as string)
