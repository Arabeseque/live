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
  private readonly httpUrl: string;
  private readonly webrtcUrl: string;

  constructor(config: SRSConfig) {
    this.config = config;
    // 从HTTP URL中提取主机名和端口
    const url = new URL(config.url);
    this.httpUrl = `${url.protocol}//${url.host}`;
    // 构建WebRTC URL
    this.webrtcUrl = `webrtc://${url.hostname}:8000/${config.mode}/${config.streamName}`;

    console.log('初始化SRS服务:', {
      httpUrl: this.httpUrl,
      webrtcUrl: this.webrtcUrl,
      streamName: config.streamName,
      mode: config.mode
    });
  }

  /**
   * 初始化 WebRTC 连接
   * @param stream 媒体流
   */
  async initConnection(stream: MediaStream): Promise<void> {
    console.log('开始初始化WebRTC连接');
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
      const tracks = stream.getTracks();
      console.log('添加媒体轨道:', tracks.map(t => ({ kind: t.kind, label: t.label })));

      tracks.forEach(track => {
        if (this.webrtc && this.stream) {
          this.webrtc.addTrack(track, this.stream);
        }
      });

      // 监听ICE候选
      this.webrtc.onicecandidate = async ({ candidate }) => {
        if (candidate) {
          console.log('收到新的ICE候选:', {
            candidate: candidate.candidate,
            sdpMid: candidate.sdpMid,
            sdpMLineIndex: candidate.sdpMLineIndex
          });
          try {
            await this.sendIceCandidate(candidate);
            console.log('ICE候选发送成功');
          } catch (error) {
            console.error('发送ICE候选失败:', error);
          }
        }
      };

      // 监听ICE连接状态
      this.webrtc.oniceconnectionstatechange = () => {
        if (this.webrtc) {
          console.log('ICE连接状态变更:', this.webrtc.iceConnectionState);
        }
      };

      // 监听连接状态
      this.webrtc.onconnectionstatechange = () => {
        if (this.webrtc) {
          console.log('WebRTC连接状态:', this.webrtc.connectionState);
        }
      };

      // 监听协商状态
      this.webrtc.onsignalingstatechange = () => {
        if (this.webrtc) {
          console.log('信令状态:', this.webrtc.signalingState);
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
      console.log('开始创建推流offer');
      // 创建 offer
      const offer = await this.webrtc.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false
      });

      console.log('设置本地描述符:', offer.sdp);
      // 设置本地描述符
      await this.webrtc.setLocalDescription(offer);

      // 发送 offer 到 SRS 服务器
      console.log('发送offer到SRS服务器');
      const response = await this.sendOffer(offer);
      console.log('收到SRS服务器响应:', response);

      // 处理 SRS 返回的 answer
      if (response.code === 0) {
        const answer = {
          type: 'answer' as const,
          sdp: response.sdp
        };
        console.log('设置远程描述符:', answer.sdp);
        await this.webrtc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('远程描述符设置成功');
      } else {
        throw new Error(`SRS服务器响应错误: ${response.code}`);
      }

    } catch (error: any) {
      console.error('推流到SRS失败:', error);
      throw new Error(`推流到SRS失败: ${error.message}`);
    }
  }

  /**
   * 发送 Offer 到 SRS 服务器
   * @param offer SDP offer
   */
  private async sendOffer(offer: RTCSessionDescriptionInit): Promise<PublishResponse & { sdp?: string }> {
    try {
      console.log('准备发送offer到:', `${this.httpUrl}/rtc/v1/publish/`);
      console.log('推流URL:', this.webrtcUrl);

      const response = await fetch(`${this.httpUrl}/rtc/v1/publish/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          streamurl: this.webrtcUrl,
          sdp: offer.sdp,
          api: `${this.httpUrl}/rtc/v1/publish/`,
          clientip: null,
          tid: Date.now().toString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`);
      }

      const result = await response.json();
      console.log('SRS服务器响应:', result);
      return result;
    } catch (error: any) {
      console.error('发送offer到SRS失败:', error);
      throw new Error(`发送offer到SRS失败: ${error.message}`);
    }
  }

  /**
   * 发送 ICE 候选到 SRS 服务器
   * @param candidate ICE候选
   */
  private async sendIceCandidate(candidate: RTCIceCandidate): Promise<void> {
    try {
      console.log('发送ICE候选到:', `${this.httpUrl}/rtc/v1/candidate/`);

      const response = await fetch(`${this.httpUrl}/rtc/v1/candidate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          streamurl: this.webrtcUrl,
          candidate: candidate.candidate,
          sdpMid: candidate.sdpMid,
          sdpMLineIndex: candidate.sdpMLineIndex,
          api: `${this.httpUrl}/rtc/v1/candidate/`
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`);
      }

      const result = await response.json();
      console.log('发送ICE候选响应:', result);
    } catch (error: any) {
      console.error('发送ICE候选到SRS失败:', error);
      throw new Error(`发送ICE候选到SRS失败: ${error.message}`);
    }
  }

  /**
   * 停止推流并清理资源
   */
  close(): void {
    console.log('关闭SRS连接');
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
