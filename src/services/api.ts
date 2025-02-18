import { http } from '@/utils/request'

export interface LiveRoom {
  _id: string
  title: string
  status: 'pending' | 'live' | 'ended'
  start_time: string | null
  end_time: string | null
  user_id: string
  thumbnail?: string
  streamerName?: string
  viewers?: number
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: {
    success: boolean
    data: T
  }
}

export const api = {
  // 直播间相关
  rooms: {
    // 获取直播间列表
    getList: () => http.get<ApiResponse<LiveRoom[]>>('/api/webrtc/rooms'),

    // 创建直播间
    create: (title: string) => http.post<ApiResponse<LiveRoom>>('/api/webrtc/rooms', { title }),

    // 获取直播间详情
    getDetail: (roomId: string) => http.get<ApiResponse<LiveRoom>>(`/api/webrtc/rooms/${roomId}`),

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
      whip: {
        endpoint: string
        token: string
      }
      playUrl: string
    }>>(`/api/webrtc/rooms/${roomId}/whip`),
  }
} 
