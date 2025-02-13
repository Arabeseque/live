<template>
  <div class="flv-player" ref="playerContainerRef">
    <!-- 视频播放器 -->
    <video
      ref="videoRef"
      class="video-element"
      autoplay
      muted
      playsinline
    />

    <!-- 播放器控件 -->
    <div class="player-controls" v-show="isControlsVisible">
      <!-- 底部控制栏 -->
      <div class="control-bar">
        <!-- 音量控制 -->
        <div class="volume-control">
          <button class="control-btn" @click="toggleMute">
            <i class="i-carbon-volume-down" v-if="!isMuted && volume <= 0.5" />
            <i class="i-carbon-volume-up" v-if="!isMuted && volume > 0.5" />
            <i class="i-carbon-volume-mute" v-if="isMuted" />
          </button>
          <input
            type="range"
            class="volume-slider"
            min="0"
            max="100"
            :value="volume * 100"
            @input="onVolumeChange"
          />
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { FlvPlayerService } from '@/services/flv'

interface Props {
  url: string
  type?: string
  isLive?: boolean
  hasAudio?: boolean
  hasVideo?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'flv',
  isLive: true,
  hasAudio: true,
  hasVideo: true,
})

// 播放器状态
const playerContainerRef = ref<HTMLDivElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const isControlsVisible = ref(true)
const volume = ref(1)
const isMuted = ref(false)
const error = ref<string | null>(null)

// 播放器服务实例
const flvPlayer = new FlvPlayerService()

// 初始化播放器
const initPlayer = async () => {
  try {
    if (videoRef.value) {
      flvPlayer.init(videoRef.value, {
        url: props.url,
        type: props.type,
        isLive: props.isLive,
        hasAudio: props.hasAudio,
        hasVideo: props.hasVideo,
      })

      // 初始化音量
      flvPlayer.setVolume(volume.value)
    }
  } catch (err: any) {
    error.value = err.message
  }
}

// 音量控制
const onVolumeChange = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value)
  volume.value = value / 100
  flvPlayer.setVolume(volume.value)
}

// 切换静音
const toggleMute = () => {
  flvPlayer.toggleMute()
  isMuted.value = flvPlayer.isMuted()
}

// 监听组件挂载
onMounted(() => {
  initPlayer()

  // 监听鼠标移动显示/隐藏控件
  let timer: number
  const showControls = () => {
    isControlsVisible.value = true
    clearTimeout(timer)
    timer = window.setTimeout(() => {
      isControlsVisible.value = false
    }, 3000)
  }

  if (playerContainerRef.value) {
    playerContainerRef.value.addEventListener('mousemove', showControls)
  }
})

// 组件卸载时清理资源
onUnmounted(() => {
  flvPlayer.destroy()
})
</script>

<style scoped>
.flv-player {
  position: relative;
  width: 100%;
  background-color: #000;
  aspect-ratio: 16/9;
  border-radius: 8px;
  overflow: hidden;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.player-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  transition: opacity 0.3s;
}

.control-bar {
  display: flex;
  align-items: center;
  gap: 16px;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  transition: opacity 0.2s;
  font-size: 1.2em;
}

.control-btn:hover {
  opacity: 0.8;
}

.volume-slider {
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
}

.error-message {
  color: #ff4444;
  font-size: 14px;
  margin-left: auto;
}
</style>
