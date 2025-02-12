interface SRSConfig {
  url: string;
  streamName: string;
  mode: 'live' | 'rtc';
}

interface PublishResponse {
  code: number;
  server: string;
  sdk: string;
  sessionid: string;
}

export class SRSService {
  private readonly config: SRSConfig;
  private webrtc: RTCPeerConnection | null = null;
  private stream: MediaStream | null = null;

  constructor(config: SRSConfig) {
    this.config = config;
  }

  /**
   * 初始化 WebRTC 连接
   * @param stream 媒体流
   */
  async initConnection(stream: MediaStream): Promise<void> {
    this.stream = stream;

    try {
      // 创建 RTCPeerConnection
      this.webrtc = new RTCPeerConnection({
        iceServers: [
          {
            urls: ['stun:stun.l.google.com:19302']
          }
        ]
      });

      // 添加媒体轨道
      stream.getTracks().forEach(track => {
        if (this.webrtc && this.stream) {
          this.webrtc.addTrack(track, this.stream);
        }
      });

      // 监听ICE候选
      this.webrtc.onicecandidate = async ({ candidate }) => {
        if (candidate) {
          // 向SRS服务器发送candidate
          await this.sendIceCandidate(candidate);
        }
      };

      // 监听连接状态
      this.webrtc.onconnectionstatechange = () => {
        if (this.webrtc) {
          console.log('SRS连接状态:', this.webrtc.connectionState);
        }
      };

    } catch (error: any) {
      console.error('初始化SRS连接失败:', error.message);
      throw new Error(`初始化SRS连接失败: ${error.message}`);
    }
  }

  /**
   * 开始推流到SRS服务器
   */
  async publish(): Promise<void> {
    if (!this.webrtc) {
      throw new Error('WebRTC连接未初始化');
    }

    try {
      // 创建 offer
      const offer = await this.webrtc.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false
      });

      // 设置本地描述符
      await this.webrtc.setLocalDescription(offer);

      // 发送 offer 到 SRS 服务器
      const response = await this.sendOffer(offer);

      // 处理 SRS 返回的 answer
      if (response.code === 0) {
        const answer = await this.getAnswer();
        if (answer) {
          await this.webrtc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } else {
        throw new Error(`SRS服务器响应错误: ${response.code}`);
      }

    } catch (error: any) {
      console.error('推流到SRS失败:', error.message);
      throw new Error(`推流到SRS失败: ${error.message}`);
    }
  }

  /**
   * 发送 Offer 到 SRS 服务器
   * @param offer SDP offer
   */
  private async sendOffer(offer: RTCSessionDescriptionInit): Promise<PublishResponse> {
    try {
      const response = await fetch(`${this.config.url}/rtc/v1/publish/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api: `${this.config.url}/rtc/v1/publish/`,
          streamurl: `webrtc://${this.config.url}/${this.config.streamName}`,
          sdp: offer.sdp
        })
      });

      return await response.json();
    } catch (error: any) {
      console.error('发送offer到SRS失败:', error.message);
      throw new Error(`发送offer到SRS失败: ${error.message}`);
    }
  }

  /**
   * 从 SRS 服务器获取 Answer
   */
  private async getAnswer(): Promise<RTCSessionDescriptionInit | null> {
    try {
      const response = await fetch(`${this.config.url}/rtc/v1/answer/`);
      const data = await response.json();

      if (data.code === 0 && data.sdp) {
        return {
          type: 'answer',
          sdp: data.sdp
        };
      }
      return null;
    } catch (error: any) {
      console.error('获取SRS answer失败:', error.message);
      throw new Error(`获取SRS answer失败: ${error.message}`);
    }
  }

  /**
   * 发送 ICE 候选到 SRS 服务器
   * @param candidate ICE候选
   */
  private async sendIceCandidate(candidate: RTCIceCandidate): Promise<void> {
    try {
      await fetch(`${this.config.url}/rtc/v1/candidate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          candidate: candidate.candidate,
          sdpMid: candidate.sdpMid,
          sdpMLineIndex: candidate.sdpMLineIndex
        })
      });
    } catch (error: any) {
      console.error('发送ICE候选到SRS失败:', error.message);
      throw new Error(`发送ICE候选到SRS失败: ${error.message}`);
    }
  }

  /**
   * 停止推流并清理资源
   */
  close(): void {
    if (this.webrtc) {
      this.webrtc.close();
      this.webrtc = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
}
