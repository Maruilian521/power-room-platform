<template>
  <div class="video-tile" :class="{ 'is-fullscreen': isFullscreen }">
    <!-- 视频播放区域 -->
    <div class="video-player">
      <!-- 模拟视频画面（实际项目中替换为真实的视频播放器） -->
      <div class="video-placeholder">
        <div class="video-animation">
          <div class="scan-line"></div>
          <div class="grid-overlay"></div>
        </div>

        <!-- 摄像头信息叠加层 -->
        <div class="video-overlay">
          <div class="video-info">
            <el-icon class="status-icon"><VideoCamera /></el-icon>
            <span class="camera-name">{{ video.label }}</span>
            <el-tag size="small" :type="video.status === 'online' ? 'success' : 'danger'">
              {{ video.quality || 'HD' }}
            </el-tag>
          </div>

          <!-- 实时信息 -->
          <div class="realtime-info">
            <div class="info-item">
              <el-icon><Clock /></el-icon>
              <span>{{ currentTime }}</span>
            </div>
            <div class="info-item">
              <el-icon><Connection /></el-icon>
              <span>{{ bitrate }} Mbps</span>
            </div>
          </div>
        </div>

        <!-- 视频状态提示 -->
        <div v-if="!video.playing" class="video-status">
          <el-icon class="status-loading"><Loading /></el-icon>
          <p>正在加载视频流...</p>
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
          />
          <el-button
            circle
            size="small"
            :icon="video.muted ? 'Muted' : 'Microphone'"
            @click.stop="toggleMute"
          />
        </div>

        <div class="controls-center">
          <span class="stream-url">{{ video.streamUrl }}</span>
        </div>

        <div class="controls-right">
          <!-- 清晰度切换 -->
          <el-dropdown @command="handleQualityChange" trigger="click">
            <el-button size="small" text>
              {{ video.quality || 'HD' }}
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="UHD">超清 (UHD)</el-dropdown-item>
                <el-dropdown-item command="HD">高清 (HD)</el-dropdown-item>
                <el-dropdown-item command="SD">标清 (SD)</el-dropdown-item>
                <el-dropdown-item command="LD">流畅 (LD)</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- PTZ控制 -->
          <el-tooltip content="云台控制" placement="top">
            <el-button
              circle
              size="small"
              :icon="Aim"
              :disabled="!video.supportPTZ"
              @click.stop="$emit('show-ptz')"
            />
          </el-tooltip>

          <!-- 截图 -->
          <el-tooltip content="截图" placement="top">
            <el-button
              circle
              size="small"
              :icon="Camera"
              @click.stop="$emit('capture')"
            />
          </el-tooltip>

          <!-- 录制 -->
          <el-tooltip content="录制" placement="top">
            <el-button
              circle
              size="small"
              :icon="recording ? 'VideoPause' : 'VideoCamera'"
              :type="recording ? 'danger' : ''"
              @click.stop="toggleRecording"
            />
          </el-tooltip>

          <!-- 全屏 -->
          <el-tooltip :content="isFullscreen ? '退出全屏' : '全屏'" placement="top">
            <el-button
              circle
              size="small"
              :icon="isFullscreen ? 'Close' : 'FullScreen'"
              @click.stop="$emit('toggle-fullscreen')"
            />
          </el-tooltip>

          <!-- 关闭 -->
          <el-tooltip content="关闭" placement="top">
            <el-button
              circle
              size="small"
              :icon="Close"
              @click.stop="$emit('close')"
            />
          </el-tooltip>
        </div>
      </div>
    </div>

    <!-- 异常状态提示 -->
    <div v-if="video.status === 'offline'" class="error-overlay">
      <el-icon class="error-icon"><WarningFilled /></el-icon>
      <p class="error-text">摄像头离线</p>
      <el-button size="small" @click.stop="handleRetry">重试连接</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  VideoCamera,
  Clock,
  Connection,
  Loading,
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
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false })
}

// 切换播放
const togglePlay = () => {
  props.video.playing = !props.video.playing
  ElMessage.success(props.video.playing ? '继续播放' : '已暂停')
}

// 切换静音
const toggleMute = () => {
  props.video.muted = !props.video.muted
}

// 切换录制
const toggleRecording = () => {
  recording.value = !recording.value
  ElMessage.success(recording.value ? '开始录制' : '停止录制')
}

// 切换清晰度
const handleQualityChange = (quality: string) => {
  props.video.quality = quality
  ElMessage.success(`已切换到${quality}`)
}

// 重试连接
const handleRetry = () => {
  ElMessage.info('正在重新连接...')
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

/* 视频播放器 */
.video-player {
  width: 100%;
  height: 100%;
  position: relative;
  background: #000;
}

/* 视频占位符（模拟画面） */
.video-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f1419 100%);
  position: relative;
  overflow: hidden;
}

/* 视频动画效果 */
.video-animation {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

/* 扫描线效果 */
.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
  box-shadow: 0 0 10px var(--color-primary);
  animation: scan 3s linear infinite;
}

@keyframes scan {
  0% {
    top: 0;
  }
  100% {
    top: 100%;
  }
}

/* 网格覆盖层 */
.grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.3;
}

/* 视频信息叠加 */
.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, transparent 100%);
  z-index: 2;
}

.video-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.status-icon {
  color: var(--color-success);
  font-size: 16px;
}

.camera-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 实时信息 */
.realtime-info {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 视频状态 */
.video-status {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #fff;
  z-index: 3;
}

.status-loading {
  font-size: 48px;
  margin-bottom: 12px;
  animation: rotate 1.5s linear infinite;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 控制条 */
.video-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 4;
}

.video-tile:hover .video-controls {
  opacity: 1;
}

.video-tile.is-fullscreen .video-controls {
  opacity: 1;
}

.controls-left,
.controls-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.controls-center {
  flex: 1;
  overflow: hidden;
}

.stream-url {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Courier New', monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

/* 控制按钮 */
:deep(.el-button.is-circle) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  backdrop-filter: blur(10px);
}

:deep(.el-button.is-circle:hover) {
  background: rgba(255, 255, 255, 0.2);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

:deep(.el-button.is-circle:disabled) {
  opacity: 0.3;
  cursor: not-allowed;
}

/* 错误覆盖层 */
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.error-icon {
  font-size: 64px;
  color: var(--color-danger);
  margin-bottom: 16px;
}

.error-text {
  font-size: 16px;
  color: #fff;
  margin: 0 0 20px 0;
}

/* 全屏模式 */
.video-tile.is-fullscreen {
  border-radius: 0;
}

.video-tile.is-fullscreen .video-controls {
  padding: 24px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .video-info {
    font-size: 12px;
  }

  .realtime-info {
    font-size: 10px;
  }

  .controls-center {
    display: none;
  }
}
</style>
