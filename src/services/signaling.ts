interface SignalingMessage {
  type: 'offer' | 'answer' | 'candidate' | 'join' | 'leave';
  payload: any;
  roomId?: string;
  userId?: string;
}

interface SignalingConfig {
  url: string;
  roomId: string;
  userId: string;
}

type MessageHandler = (message: SignalingMessage) => void;

export class SignalingService {
  private ws: WebSocket | null = null;
  private readonly config: SignalingConfig;
  private messageHandlers: Set<MessageHandler> = new Set();
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private reconnectTimeout: number = 1000; // 初始重连等待时间

  constructor(config: SignalingConfig) {
    this.config = config;
  }

  /**
   * 连接到信令服务器
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          console.log('信令服务器连接成功');
          this.reconnectAttempts = 0; // 重置重连计数
          this.joinRoom(); // 连接成功后加入房间
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: SignalingMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('处理消息失败:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('信令服务器连接断开');
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('信令服务器错误:', error);
          reject(error);
        };

      } catch (error) {
        console.error('连接信令服务器失败:', error);
        reject(error);
      }
    });
  }

  /**
   * 尝试重新连接
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('达到最大重连次数');
      return;
    }

    console.log(`尝试重连... (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect().catch(() => {
        // 使用指数退避策略
        this.reconnectTimeout *= 2;
      });
    }, this.reconnectTimeout);
  }

  /**
   * 加入房间
   */
  private joinRoom() {
    this.sendMessage({
      type: 'join',
      payload: null,
      roomId: this.config.roomId,
      userId: this.config.userId,
    });
  }

  /**
   * 发送消息到信令服务器
   * @param message 消息对象
   */
  sendMessage(message: SignalingMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('信令服务器未连接');
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('发送消息失败:', error);
      throw error;
    }
  }

  /**
   * 处理接收到的消息
   * @param message 消息对象
   */
  private handleMessage(message: SignalingMessage): void {
    this.messageHandlers.forEach(handler => handler(message));
  }

  /**
   * 添加消息处理器
   * @param handler 处理函数
   */
  addMessageHandler(handler: MessageHandler): void {
    this.messageHandlers.add(handler);
  }

  /**
   * 移除消息处理器
   * @param handler 处理函数
   */
  removeMessageHandler(handler: MessageHandler): void {
    this.messageHandlers.delete(handler);
  }

  /**
   * 发送 Offer
   * @param offer SDP offer
   */
  sendOffer(offer: RTCSessionDescriptionInit): void {
    this.sendMessage({
      type: 'offer',
      payload: offer,
      roomId: this.config.roomId,
      userId: this.config.userId,
    });
  }

  /**
   * 发送 Answer
   * @param answer SDP answer
   */
  sendAnswer(answer: RTCSessionDescriptionInit): void {
    this.sendMessage({
      type: 'answer',
      payload: answer,
      roomId: this.config.roomId,
      userId: this.config.userId,
    });
  }

  /**
   * 发送 ICE 候选
   * @param candidate ICE候选
   */
  sendIceCandidate(candidate: RTCIceCandidate): void {
    this.sendMessage({
      type: 'candidate',
      payload: candidate,
      roomId: this.config.roomId,
      userId: this.config.userId,
    });
  }

  /**
   * 关闭连接
   */
  close(): void {
    if (this.ws) {
      this.sendMessage({
        type: 'leave',
        payload: null,
        roomId: this.config.roomId,
        userId: this.config.userId,
      });
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
  }
}
