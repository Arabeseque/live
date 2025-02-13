import flvjs from 'flv.js'

export interface FlvPlayerConfig {
  url: string
  type?: string
  isLive?: boolean
  hasAudio?: boolean
  hasVideo?: boolean
}

export class FlvPlayerService {
  private player: any = null
  private videoElement: HTMLVideoElement | null = null

  /**
   * 初始化 FLV 播放器
   * @param element HTML video element
   * @param config 播放器配置
   */
  public init(element: HTMLVideoElement, config: FlvPlayerConfig): void {
    if (!flvjs.isSupported()) {
      throw new Error('您的浏览器不支持 FLV 播放')
    }

    this.videoElement = element

    // 创建 FLV 播放器实例
    this.player = flvjs.createPlayer({
      type: config.type || 'flv',
      url: config.url,
      isLive: config.isLive ?? true,
      hasAudio: config.hasAudio ?? true,
      hasVideo: config.hasVideo ?? true,
    }, {
      enableStashBuffer: false, // 实时直播关闭缓存
      stashInitialSize: 128, // 减少初始缓存大小
    })

    // 绑定视频元素
    this.player.attachMediaElement(element)
    // 加载视频
    this.player.load()
    // 开始播放
    this.player.play()
  }

  /**
   * 设置音量
   * @param volume 音量值 (0-1)
   */
  public setVolume(volume: number): void {
    if (this.videoElement) {
      this.videoElement.volume = Math.max(0, Math.min(1, volume))
    }
  }

  /**
   * 获取当前音量
   */
  public getVolume(): number {
    return this.videoElement?.volume || 0
  }

  /**
   * 切换静音状态
   */
  public toggleMute(): void {
    if (this.videoElement) {
      this.videoElement.muted = !this.videoElement.muted
    }
  }

  /**
   * 是否静音
   */
  public isMuted(): boolean {
    return this.videoElement?.muted || false
  }

  /**
   * 销毁播放器实例
   */
  public destroy(): void {
    if (this.player) {
      this.player.pause()
      this.player.unload()
      this.player.detachMediaElement()
      this.player.destroy()
      this.player = null
    }
    this.videoElement = null
  }
}
