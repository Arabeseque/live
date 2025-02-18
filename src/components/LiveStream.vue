<template>
  <div class="live-stream">
    <!-- 视频预览 -->
    <video ref="videoRef" class="preview" autoplay muted playsinline></video>

    <!-- 控制按钮 -->
    <div class="controls">
      <button
        class="control-btn"
        :class="{ 'active': isLive }"
        @click="toggleStream"
      >
        {{ isLive ? '结束直播' : '开始直播' }}
      </button>
      <button
        class="control-btn"
        @click="toggleCamera"
      >
        {{ isCameraOn ? '关闭摄像头' : '开启摄像头' }}
      </button>
      <button
        class="control-btn"
        @click="toggleMicrophone"
      >
        {{ isMicrophoneOn ? '关闭麦克风' : '开启麦克风' }}
      </button>
    </div>

    <!-- 状态信息 -->
    <div class="status-info">
      <div v-if="isLive" class="live-status">
        <span class="dot"></span> 直播中
      </div>
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useLiveStore } from '@/stores/live'

const props = defineProps<{
  signalingUrl: string
  streamHttpUrl: string
  srsUrl: string
  roomId: string
  userId: string
  streamName: string
}>()

// 状态变量
const videoRef = ref<HTMLVideoElement | null>(null)
const isLive = ref(false)
const isCameraOn = ref(true)
const isMicrophoneOn = ref(true)
const error = ref('')
const mediaStream = ref<MediaStream | null>(null)
const peerConnection = ref<RTCPeerConnection | null>(null)

// WebSocket连接
let ws: WebSocket | null = null

// 初始化WebRTC
async function initWebRTC() {
  try {
    // 创建RTCPeerConnection
    peerConnection.value = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    })

    // 获取媒体流
    mediaStream.value = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })

    // 显示预览
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream.value
    }

    // 添加轨道到PeerConnection
    mediaStream.value.getTracks().forEach(track => {
      if (peerConnection.value && mediaStream.value) {
        peerConnection.value.addTrack(track, mediaStream.value)
      }
    })

    // 监听ICE候选
    peerConnection.value.onicecandidate = (event) => {
      if (event.candidate) {
        ws?.send(JSON.stringify({
          type: 'candidate',
          candidate: event.candidate,
          roomId: props.roomId
        }))
      }
    }

    // 连接状态变化
    peerConnection.value.onconnectionstatechange = () => {
      if (peerConnection.value?.connectionState === 'connected') {
        console.log('WebRTC连接成功')
      }
    }

  } catch (err: any) {
    error.value = '初始化WebRTC失败: ' + err.message
    console.error('初始化WebRTC失败:', err)
  }
}

// 开始直播
async function startStream() {
  try {
    if (!peerConnection.value) {
      await initWebRTC()
    }

    // 创建offer
    const offer = await peerConnection.value?.createOffer({
      offerToReceiveAudio: false,
      offerToReceiveVideo: false
    })

    if (!offer) throw new Error('创建offer失败')

    // 设置本地描述
    await peerConnection.value?.setLocalDescription(offer)

    // 发送offer到信令服务器
    ws?.send(JSON.stringify({
      type: 'offer',
      offer,
      roomId: props.roomId
    }))

    isLive.value = true

  } catch (err: any) {
    error.value = '开始直播失败: ' + err.message
    console.error('开始直播失败:', err)
  }
}

// 结束直播
async function stopStream() {
  try {
    // 关闭WebRTC连接
    peerConnection.value?.close()
    peerConnection.value = null

    // 停止所有媒体轨道
    mediaStream.value?.getTracks().forEach(track => track.stop())
    mediaStream.value = null

    // 清除视频预览
    if (videoRef.value) {
      videoRef.value.srcObject = null
    }

    isLive.value = false

    // 通知服务器直播结束
    ws?.send(JSON.stringify({
      type: 'end',
      roomId: props.roomId
    }))

  } catch (err: any) {
    error.value = '结束直播失败: ' + err.message
    console.error('结束直播失败:', err)
  }
}

// 切换直播状态
async function toggleStream() {
  if (isLive.value) {
    await stopStream()
  } else {
    await startStream()
  }
}

// 切换摄像头
function toggleCamera() {
  if (mediaStream.value) {
    const videoTrack = mediaStream.value.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      isCameraOn.value = videoTrack.enabled
    }
  }
}

// 切换麦克风
function toggleMicrophone() {
  if (mediaStream.value) {
    const audioTrack = mediaStream.value.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      isMicrophoneOn.value = audioTrack.enabled
    }
  }
}

// 组件挂载
onMounted(async () => {
  await initWebRTC()
})

// 组件卸载
onUnmounted(() => {
  // 停止直播
  if (isLive.value) {
    stopStream()
  }

  // 关闭WebSocket连接
  if (ws) {
    ws.close()
    ws = null
  }
})
</script>

<style scoped>
.live-stream {
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.preview {
  width: 100%;
  height: 600px;
  background: #000;
  object-fit: cover;
}

.controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 16px;
  z-index: 10;
}

.control-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.control-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.control-btn.active {
  background: #dc3545;
}

.status-info {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
}

.live-status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  background: rgba(220, 53, 69, 0.8);
  padding: 4px 12px;
  border-radius: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  background: #fff;
  border-radius: 50%;
  animation: blink 1s infinite;
}

.error-message {
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(220, 53, 69, 0.8);
  color: white;
  border-radius: 4px;
}

@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>
