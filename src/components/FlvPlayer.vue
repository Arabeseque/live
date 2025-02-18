<template>
  <div class="flv-player">
    <video
      ref="videoRef"
      class="video-element"
      controls
      autoplay
      :muted="muted"
    ></video>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 控制按钮 -->
    <div class="controls">
      <button @click="toggleMute" class="control-btn">
        {{ muted ? '取消静音' : '静音' }}
      </button>
      <button @click="reload" class="control-btn">
        重新加载
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import flvjs from 'flv.js'

const props = defineProps<{
  url: string
  isLive?: boolean
  muted?: boolean
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const flvPlayer = ref<flvjs.Player | null>(null)
const error = ref('')
const muted = ref(props.muted ?? true)

// 初始化播放器
async function initPlayer() {
  if (!flvjs.isSupported()) {
    error.value = '您的浏览器不支持FLV播放'
    return
  }

  try {
    if (flvPlayer.value) {
      flvPlayer.value.destroy()
      flvPlayer.value = null
    }

    if (!videoRef.value) return

    flvPlayer.value = flvjs.createPlayer({
      type: 'flv',
      url: props.url,
      isLive: props.isLive,
      hasAudio: true,
      hasVideo: true
    }, {
      enableStashBuffer: false,
      stashInitialSize: 128,
      enableWorker: true,
      lazyLoad: false,
      autoCleanupSourceBuffer: true
    })

    flvPlayer.value.attachMediaElement(videoRef.value)
    flvPlayer.value.load()
    await flvPlayer.value.play()

    // 错误处理
    flvPlayer.value.on(flvjs.Events.ERROR, (errorType, errorDetail) => {
      console.error('FLV播放错误:', errorType, errorDetail)
      error.value = `播放错误: ${errorDetail}`
    })

    // 统计信息
    flvPlayer.value.on(flvjs.Events.STATISTICS_INFO, (stats) => {
      console.log('播放统计:', stats)
    })

  } catch (err: any) {
    error.value = `初始化播放器失败: ${err.message}`
    console.error('初始化播放器失败:', err)
  }
}

// 重新加载
async function reload() {
  error.value = ''
  await initPlayer()
}

// 切换静音
function toggleMute() {
  if (videoRef.value) {
    muted.value = !muted.value
    videoRef.value.muted = muted.value
  }
}

// 监听URL变化
watch(() => props.url, async (newUrl) => {
  if (newUrl) {
    await initPlayer()
  }
})

// 组件挂载
onMounted(async () => {
  if (props.url) {
    await initPlayer()
  }
})

// 组件卸载
onUnmounted(() => {
  if (flvPlayer.value) {
    flvPlayer.value.destroy()
    flvPlayer.value = null
  }
})
</script>

<style scoped>
.flv-player {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-element {
  width: 100%;
  height: 600px;
  object-fit: contain;
}

.error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(220, 53, 69, 0.9);
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  text-align: center;
}

.controls {
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
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
</style>
