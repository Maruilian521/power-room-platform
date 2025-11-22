<template>
  <div class="video-tile" :class="{ 'is-fullscreen': isFullscreen }">
    <!-- 视频播放区域 -->
    <div class="video-player">
      <!-- 模拟视频画面（实际项目中替换为真实的视频播放器） -->
      <div class="video-placeholder">
        <div class="video-animation">
          <div class="scan-line"></div>
          <div class="grid-overlay"></div>
          <div class="noise-overlay"></div>
        </div>

        <!-- 摄像头信息叠加层 -->
        <div class="video-overlay top-bar">
          <div class="video-info">
            <el-icon class="status-icon"><VideoCamera /></el-icon>
            <span class="camera-name">{{ video.label }}</span>
          </div>
          <div class="video-status-tag">
             <span class="status-dot" :class="video.status"></span>
             <span class="quality-text">{{ video.quality || 'HD' }}</span>
          </div>
        </div>

        <div class="video-overlay bottom-bar">
           <div class="realtime-info">
            <span class="data-item">REC: <span class="val">{{ recording ? 'ON' : 'OFF' }}</span></span>
            <span class="data-item">BIT: <span class="val">{{ bitrate }} Mbps</span></span>
            <span class="data-item">{{ currentTime }}</span>
          </div>
        </div>

        <!-- 视频状态提示 -->
        <div v-if="!video.playing" class="video-status-msg">
          <div class="loading-spinner"></div>
          <p class="loading-text">ESTABLISHING LINK...</p>
        </div>
      </div>

      <!-- 控制条（鼠标悬停显示） -->
      <div class="video-controls">
        <div class="controls-left">
          <el-button
            circle
            size="small"
            :icon="video.playing ? 'VideoPause' : 'VideoPlay'"
            @click.stop="togglePlay"
            class="control-btn"
          />
          <el-button
            circle
            size="small"
            :icon="video.muted ? 'Mute' : 'Microphone'"
            @click.stop="toggleMute"
            class="control-btn"
          />
        </div>

        <div class="controls-center">
          <span class="stream-url">SOURCE: {{ video.streamUrl }}</span>
        </div>

        <div class="controls-right">
          <!-- 清晰度切换 -->
          <el-dropdown @command="handleQualityChange" trigger="click" popper-class="sc2-dropdown">
            <el-button size="small" text class="control-text-btn">
              {{ video.quality || 'HD' }}
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="UHD">UHD 4K</el-dropdown-item>
                <el-dropdown-item command="HD">HD 1080P</el-dropdown-item>
                <el-dropdown-item command="SD">SD 480P</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <el-tooltip content="PTZ" placement="top" effect="dark">
            <el-button circle size="small" :icon="Aim" :disabled="!video.supportPTZ" @click.stop="$emit('show-ptz')" class="control-btn" />
          </el-tooltip>

          <el-tooltip content="SNAPSHOT" placement="top" effect="dark">
            <el-button circle size="small" :icon="Camera" @click.stop="$emit('capture')" class="control-btn" />
          </el-tooltip>

          <el-tooltip content="FULLSCREEN" placement="top" effect="dark">
            <el-button
              circle
              size="small"
              :icon="isFullscreen ? 'Close' : 'FullScreen'"
              @click.stop="$emit('toggle-fullscreen')"
              class="control-btn"
            />
          </el-tooltip>

          <el-tooltip content="CLOSE" placement="top" effect="dark">
            <el-button circle size="small" :icon="Close" @click.stop="$emit('close')" class="control-btn danger" />
          </el-tooltip>
        </div>
      </div>
    </div>

    <!-- 异常状态提示 -->
    <div v-if="video.status === 'offline'" class="error-overlay">
      <div class="error-box">
        <el-icon class="error-icon"><WarningFilled /></el-icon>
        <p class="error-title">SIGNAL LOST</p>
        <p class="error-desc">Connection to device terminated.</p>
        <el-button size="small" type="primary" plain @click.stop="handleRetry">RECONNECT</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  VideoCamera,
  Camera,
  Aim,
  Close,
  WarningFilled,
  ArrowDown
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface Video {
  id: string
  label: string
  status: string
  streamUrl: string
  supportPTZ: boolean
  playing?: boolean
  muted?: boolean
  quality?: string
}

interface Props {
  video: Video
  index: number
  isFullscreen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'show-ptz'): void
  (e: 'capture'): void
  (e: 'close'): void
  (e: 'toggle-fullscreen'): void
}>()

const currentTime = ref('')
const bitrate = ref('2.5')
const recording = ref(false)

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', { hour12: false })
}

// 切换播放
const togglePlay = () => {
  props.video.playing = !props.video.playing
}

// 切换静音
const toggleMute = () => {
  props.video.muted = !props.video.muted
}

// 切换清晰度
const handleQualityChange = (quality: string) => {
  props.video.quality = quality
}

// 重试连接
const handleRetry = () => {
  ElMessage.info('Attempting reconnection sequence...')
  // TODO: 实现重试逻辑
}

let timer: number

onMounted(() => {
  updateTime()
  timer = setInterval(() => {
    updateTime()
    // 模拟码率变化
    bitrate.value = (2 + Math.random() * 1.5).toFixed(1)
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.video-tile {
  width: 100%;
  height: 100%;
  position: relative;
  background: #000;
  overflow: hidden;
}

.video-player {
  width: 100%;
  height: 100%;
  position: relative;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  /* SC2 Space Background */
  background: radial-gradient(circle at center, #1a2635 0%, #05080a 100%);
  position: relative;
  overflow: hidden;
}

/* Animation Layers */
.video-animation {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: rgba(0, 240, 255, 0.3);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
  animation: scan 4s linear infinite;
}

@keyframes scan { 0% { top: -10%; } 100% { top: 110%; } }

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

.noise-overlay {
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
  opacity: 0.1;
}

/* Overlay Info Bars */
.video-overlay {
  position: absolute;
  left: 0;
  right: 0;
  padding: 8px 12px;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
}

.top-bar { top: 0; border-bottom: 1px solid rgba(0, 240, 255, 0.1); }
.bottom-bar { bottom: 0; border-top: 1px solid rgba(0, 240, 255, 0.1); opacity: 0; transition: opacity 0.2s; }

.video-tile:hover .bottom-bar { opacity: 1; }

.video-info { display: flex; align-items: center; gap: 8px; color: var(--tech-primary); }
.camera-name { font-family: 'Rajdhani', sans-serif; font-weight: 600; letter-spacing: 1px; font-size: 14px; }

.status-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; margin-right: 6px; }
.status-dot.online { background: var(--status-success); box-shadow: 0 0 5px var(--status-success); }
.status-dot.offline { background: var(--status-danger); }

.quality-text { font-size: 12px; color: var(--tech-secondary); font-weight: bold; }

.realtime-info { display: flex; gap: 15px; font-family: 'Courier New', monospace; font-size: 11px; color: var(--text-sub); }
.data-item .val { color: var(--tech-primary); }

/* Loading State */
.video-status-msg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: var(--tech-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 2px solid transparent;
  border-top-color: var(--tech-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin { 100% { transform: rotate(360deg); } }

.loading-text { font-family: 'Orbitron', sans-serif; font-size: 12px; letter-spacing: 2px; animation: blink 2s infinite; }
@keyframes blink { 50% { opacity: 0.5; } }

/* Controls Hover */
.video-controls {
  position: absolute;
  bottom: 40px; /* Above bottom bar */
  left: 50%;
  transform: translateX(-50%);
  background: rgba(13, 18, 26, 0.9);
  border: 1px solid var(--tech-primary);
  border-radius: 4px;
  padding: 6px 12px;
  display: flex;
  gap: 12px;
  align-items: center;
  opacity: 0;
  transition: all 0.2s;
  z-index: 10;
  box-shadow: 0 0 15px rgba(0,0,0,0.8);
}

.video-tile:hover .video-controls { opacity: 1; bottom: 50px; }

.controls-center { display: none; } /* Simplify for hover pill */

.control-btn {
  background: transparent !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
  color: var(--text-main) !important;
}
.control-btn:hover {
  color: var(--tech-primary) !important;
  border-color: var(--tech-primary) !important;
  background: rgba(0, 240, 255, 0.1) !important;
}
.control-btn.danger:hover {
  color: var(--status-danger) !important;
  border-color: var(--status-danger) !important;
}

.control-text-btn { color: var(--text-bright); font-family: 'Rajdhani', sans-serif; font-weight: bold; }

/* Error Overlay */
.error-overlay {
  position: absolute;
  inset: 0;
  background: rgba(5, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.error-box {
  text-align: center;
  border: 1px solid var(--status-danger);
  padding: 30px;
  background: rgba(255, 46, 99, 0.05);
  box-shadow: 0 0 20px rgba(255, 46, 99, 0.1);
}

.error-icon { font-size: 48px; color: var(--status-danger); margin-bottom: 10px; }
.error-title { font-family: 'Orbitron', sans-serif; color: var(--status-danger); font-size: 18px; margin-bottom: 5px; }
.error-desc { color: var(--text-sub); font-size: 12px; margin-bottom: 15px; }

</style>