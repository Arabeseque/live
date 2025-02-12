interface MediaConfig {
  video: boolean | MediaTrackConstraints;
  audio: boolean | MediaTrackConstraints;
}

interface RTCConfig {
  iceServers: Array<{
    urls: string[];
    username?: string;
    credential?: string;
  }>;
}

export class WebRTCService {
  private mediaStream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private readonly config: RTCConfig = {
    iceServers: [
      {
        urls: ['stun:stun.l.google.com:19302']
      }
    ]
  };

  /**
   * 获取当前媒体流
   */
  getMediaStream(): MediaStream | null {
    return this.mediaStream;
  }

  /**
   * 初始化并获取媒体流
   * @param config 媒体配置
   * @returns Promise<MediaStream>
   */
  async initMediaStream(config: MediaConfig = { video: true, audio: true }): Promise<MediaStream> {
    try {
      // 请求媒体设备权限并获取流
      this.mediaStream = await navigator.mediaDevices.getUserMedia(config);
      return this.mediaStream;
    } catch (error: any) {
      console.error('获取媒体流失败:', error.message);
      throw new Error(`获取媒体流失败: ${error.message}`);
    }
  }

  /**
   * 初始化 RTCPeerConnection
   */
  initPeerConnection(): RTCPeerConnection {
    try {
      this.peerConnection = new RTCPeerConnection(this.config);

      // 添加媒体流到 peer connection
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => {
          if (this.peerConnection && this.mediaStream) {
            this.peerConnection.addTrack(track, this.mediaStream);
          }
        });
      }

      // 监听 ICE 候选
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // TODO: 发送 ICE 候选到信令服务器
          this.onIceCandidate(event.candidate);
        }
      };

      // 监听连接状态变化
      this.peerConnection.onconnectionstatechange = () => {
        if (this.peerConnection) {
          console.log('连接状态:', this.peerConnection.connectionState);
        }
      };

      return this.peerConnection;
    } catch (error: any) {
      console.error('初始化PeerConnection失败:', error.message);
      throw new Error(`初始化PeerConnection失败: ${error.message}`);
    }
  }

  /**
   * 创建并发送 offer
   */
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('PeerConnection未初始化');
    }

    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await this.peerConnection.setLocalDescription(offer);
      return offer;
    } catch (error: any) {
      console.error('创建offer失败:', error.message);
      throw new Error(`创建offer失败: ${error.message}`);
    }
  }

  /**
   * 设置远程 SDP
   * @param sdp 远程SDP
   */
  async setRemoteDescription(sdp: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('PeerConnection未初始化');
    }

    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
    } catch (error: any) {
      console.error('设置远程描述符失败:', error.message);
      throw new Error(`设置远程描述符失败: ${error.message}`);
    }
  }

  /**
   * 添加远程 ICE 候选
   * @param candidate ICE候选
   */
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('PeerConnection未初始化');
    }

    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error: any) {
      console.error('添加ICE候选失败:', error.message);
      throw new Error(`添加ICE候选失败: ${error.message}`);
    }
  }

  /**
   * 处理本地 ICE 候选
   * @param candidate ICE候选
   */
  private onIceCandidate(candidate: RTCIceCandidate) {
    // 由信令服务实现具体发送逻辑
    console.log('产生新的ICE候选:', candidate);
  }

  /**
   * 关闭连接并释放资源
   */
  close(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }
}
