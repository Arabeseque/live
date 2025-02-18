import { http } from '../utils/request'

export interface LiveRoom {
  id: string
  title: string
  status: 'idle' | 'living' | 'ended'
  start_time: string | null
  end_time: string | null
  user_id: string
  stream_key: string
  viewer_count: number
  streamUrls: {
    flv: string
    hls: string
    webrtc: string
  }
}

export interface WHIPConfig {
  endpoint: string
  token: string
}

export interface CreateRoomResponse {
  room: LiveRoom
  whip: WHIPConfig
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export const api = {
  // 直播间相关
  rooms: {
    // 获取直播间列表
    getList: () => http.get<ApiResponse<LiveRoom[]>>('/api/rooms'),

    // 创建直播间
    create: (title: string) => http.post<ApiResponse<LiveRoom>>('/api/rooms', { title }),

    // 获取直播间详情
    getDetail: (roomId: string) => http.get<ApiResponse<LiveRoom>>(`/api/rooms/${roomId}`),

    // 开始直播
    startLive: (roomId: string) => http.post<ApiResponse<LiveRoom>>(`/api/rooms/${roomId}/start`),

    // 结束直播
    endLive: (roomId: string) => http.post<ApiResponse<LiveRoom>>(`/api/rooms/${roomId}/end`),

    // 获取直播流信息
    getStreamInfo: (streamId: string) => http.get<ApiResponse<LiveRoom>>(`/api/stream/info/${streamId}`),

    // 获取直播间状态
    getStatus: (roomId: string) => http.get<ApiResponse<{
      status: string
      startTime: string | null
      endTime: string | null
    }>>(`/api/webrtc/rooms/${roomId}/stream-status`),

    // 更新直播间状态
    updateStatus: (roomId: string, status: 'live' | 'finished') => 
      http.post<ApiResponse>(`/api/webrtc/rooms/${roomId}/stream-status`, { status }),

    // 获取WHIP配置
    getWHIPConfig: (roomId: string) => http.get<ApiResponse<{
      roomId: string
      streamKey: string
      whip: WHIPConfig
      playUrl: string
    }>>(`/api/webrtc/rooms/${roomId}/whip`),
  }
} 
