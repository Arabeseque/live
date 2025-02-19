import { http } from '../utils/request'

export interface LiveRoom {
  id: string
  title: string
  status: 'idle' | 'living' | 'ended'
  startTime?: string
  endTime?: string
  viewerCount: number
  user_id?: string
  stream_key: string
  streamUrls: {
    flv: string
    hls: string
    webrtc: string
  }
}

export interface CreateLiveRoomParams {
  title: string
}

class LiveService {
  // 创建直播间
  async createRoom(params: CreateLiveRoomParams) {
    return http.post<LiveRoom>('/api/rooms', params)
  }

  // 获取直播间列表
  async getRoomList() {
    return http.get<LiveRoom[]>('/api/rooms')
  }

  // 获取直播间详情
  async getRoomDetail(roomId: string) {
    return http.get<LiveRoom>(`/api/rooms/${roomId}`)
  }

  // 获取直播流信息
  async getStreamInfo(streamId: string) {
    return http.get<LiveRoom>(`/api/stream/info/${streamId}`)
  }

  // 开始直播
  async startLive(roomId: string) {
    return http.post<LiveRoom>(`/api/rooms/${roomId}/start`)
  }

  // 结束直播
  async endLive(roomId: string) {
    return http.post<LiveRoom>(`/api/rooms/${roomId}/end`)
  }
}

export const liveService = new LiveService()
