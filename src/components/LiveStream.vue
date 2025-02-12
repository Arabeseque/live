<template>
  <div class="live-stream">
    <!-- 视频预览 -->
    <video
      ref="videoRef"
      class="video-preview"
      :class="{ 'is-preview': !isStreaming }"
      autoplay
      playsinline
      muted
    />

    <!-- 控制按钮 -->
    <div class="controls">
      <button
        class="control-btn"
        :class="{ 'is-streaming': isStreaming }"
        @click="toggleStream"
      >
        {{ isStreaming ? '停止直播' : '开始直播' }}
      </button>

      <button
        class="control-btn"
        @click="toggleCamera"
        :disabled="isStreaming"
      >
        切换摄像头
      </button>

      <button
        class="control-btn"
        @click="toggleMute"
        :class="{ 'is-muted': isMuted }"
      >
        {{ isMuted ? '取消静音' : '静音' }}
      </button>
    </div>

    <!-- 状态信息 -->
    <div class="status" :class="{ 'has-error': error }">
      {{ status }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { WebRTCService } from '@/services/webrtc'
import { SignalingService } from '@/services/signaling'
import { SRSService } from '@/services/srs'

// Props
interface Props {
  signalingUrl: string
  srsUrl: string
  roomId: string
  userId: string
  streamName: string
}

const props = defineProps<Props>()

// 组件状态
const videoRef = ref<HTMLVideoElement | null>(null)
const isStreaming = ref(false)
const isMuted = ref(false)
const status = ref('准备就绪')
const error = ref<string | null>(null)

// 服务实例
const webrtc = new WebRTCService()
const signaling = new SignalingService({
  url: props.signalingUrl,
  roomId: props.roomId,
  userId: props.userId
})
const srs = new SRSService({
  url: props.srsUrl,
  streamName: props.streamName,
  mode: 'rtc'
})

// 初始化摄像头
async function initCamera() {
  try {
    status.value = '正在初始化摄像头...'
    const stream = await webrtc.initMediaStream()

    if (videoRef.value) {
      videoRef.value.srcObject = stream
    }

    status.value = '摄像头已就绪'
    error.value = null
  } catch (err: any) {
    error.value = err.message
    status.value = '摄像头初始化失败'
  }
}

// 开始直播
async function startStream() {
  try {
    status.value = '正在连接...'

    // 初始化WebRTC连接
    const peerConnection = webrtc.initPeerConnection()

    // 连接信令服务器
    await signaling.connect()

    // 监听信令消息
    signaling.addMessageHandler(async (message) => {
      switch (message.type) {
        case 'answer':
          await webrtc.setRemoteDescription(message.payload)
          break
        case 'candidate':
          await webrtc.addIceCandidate(message.payload)
          break
      }
    })

    // 创建并发送offer
    const offer = await webrtc.createOffer()
    signaling.sendOffer(offer)

    // 初始化SRS连接并推流
    const mediaStream = webrtc.getMediaStream()
    if (mediaStream) {
      await srs.initConnection(mediaStream)
      await srs.publish()
    }

    isStreaming.value = true
    status.value = '直播中...'
    error.value = null
  } catch (err: any) {
    error.value = err.message
    status.value = '连接失败'
    stopStream()
  }
}

// 停止直播
function stopStream() {
  webrtc.close()
  signaling.close()
  srs.close()
  isStreaming.value = false
  status.value = '直播已结束'
}

// 切换直播状态
function toggleStream() {
  if (isStreaming.value) {
    stopStream()
  } else {
    startStream()
  }
}

// 切换摄像头
async function toggleCamera() {
  try {
    status.value = '切换摄像头中...'
    // 获取当前使用的视频轨道
    const mediaStream = webrtc.getMediaStream()
    const videoTrack = mediaStream?.getVideoTracks()[0]
    if (videoTrack) {
      // 获取所有视频输入设备
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')

      // 获取当前设备的ID
      const currentDeviceId = videoTrack.getSettings().deviceId

      // 找到下一个可用的摄像头
      const nextDevice = videoDevices.find(device => device.deviceId !== currentDeviceId)

      if (nextDevice) {
        // 使用新的摄像头重新获取媒体流
        const newStream = await webrtc.initMediaStream({
          video: { deviceId: { exact: nextDevice.deviceId } },
          audio: true
        })

        if (videoRef.value) {
          videoRef.value.srcObject = newStream
        }

        status.value = '摄像头已切换'
        error.value = null
      }
    }
  } catch (err: any) {
    error.value = err.message
    status.value = '切换摄像头失败'
  }
}

// 切换静音状态
function toggleMute() {
  const mediaStream = webrtc.getMediaStream()
  if (mediaStream) {
    const audioTracks = mediaStream.getAudioTracks()
    audioTracks.forEach(track => {
      track.enabled = !track.enabled
    })
    isMuted.value = !isMuted.value
  }
}

// 生命周期钩子
onMounted(() => {
  initCamera()
})

onUnmounted(() => {
  stopStream()
})
</script>

<style scoped>
.live-stream {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.video-preview {
  width: 100%;
  aspect-ratio: 16/9;
  background-color: #000;
  border-radius: 8px;
}

.video-preview.is-preview {
  border: 2px solid #42b883;
}

.controls {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.control-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #42b883;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.control-btn:hover {
  background-color: #3aa876;
}

.control-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.control-btn.is-streaming {
  background-color: #dc3545;
}

.control-btn.is-streaming:hover {
  background-color: #c82333;
}

.control-btn.is-muted {
  background-color: #6c757d;
}

.status {
  margin-top: 12px;
  text-align: center;
  color: #666;
}

.status.has-error {
  color: #dc3545;
}
</style>
