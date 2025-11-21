<template>
  <div class="video-wall" :class="`layout-${layout}`">
    <div
      v-for="(video, index) in gridItems"
      :key="index"
      class="video-cell"
      :class="{
        'is-fullscreen': fullscreenIndex === index,
        'is-empty': !video,
        'has-video': video
      }"
      @click="handleCellClick(index)"
      @dblclick="handleCellDoubleClick(index)"
    >
      <!-- 空白格子 -->
      <div v-if="!video" class="empty-placeholder">
        <el-icon class="placeholder-icon"><VideoCameraFilled /></el-icon>
        <p class="placeholder-text">双击摄像头加载视频</p>
        <p class="placeholder-hint">或拖拽摄像头到此处</p>
      </div>

      <!-- 视频块 -->
      <VideoTile
        v-else
        :video="video"
        :index="index"
        :is-fullscreen="fullscreenIndex === index"
        @show-ptz="$emit('show-ptz', video, index)"
        @capture="$emit('capture', video, index)"
        @close="$emit('close', index)"
        @toggle-fullscreen="handleCellDoubleClick(index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VideoCameraFilled } from '@element-plus/icons-vue'
import VideoTile from './VideoTile.vue'

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
  layout: number // 1, 4, 9, 16
  videos: Video[]
  fullscreenIndex: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'tile-click', index: number): void
  (e: 'tile-dbclick', index: number): void
  (e: 'show-ptz', video: Video, index: number): void
  (e: 'capture', video: Video, index: number): void
  (e: 'close', index: number): void
}>()

// 生成网格项（包括空格子）
const gridItems = computed(() => {
  const items: (Video | null)[] = []
  for (let i = 0; i < props.layout; i++) {
    items.push(props.videos[i] || null)
  }
  return items
})

const handleCellClick = (index: number) => {
  emit('tile-click', index)
}

const handleCellDoubleClick = (index: number) => {
  if (gridItems.value[index]) {
    emit('tile-dbclick', index)
  }
}
</script>

<style scoped>
.video-wall {
  width: 100%;
  height: 100%;
  display: grid;
  gap: 12px;
  padding: 12px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

/* 1分屏 */
.video-wall.layout-1 {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

/* 4分屏 */
.video-wall.layout-4 {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

/* 9分屏 */
.video-wall.layout-9 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
}

/* 16分屏 */
.video-wall.layout-16 {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
}

/* 视频单元格 */
.video-cell {
  position: relative;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid var(--glass-border);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.video-cell:hover {
  border-color: var(--color-primary);
  box-shadow: 0 0 20px rgba(var(--el-color-primary-rgb), 0.3);
  transform: scale(1.02);
}

.video-cell.is-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  border-radius: 0;
  transform: none;
}

/* 空白占位符 */
.empty-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  user-select: none;
  padding: 20px;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.placeholder-text {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 8px 0;
  opacity: 0.6;
}

.placeholder-hint {
  font-size: 12px;
  margin: 0;
  opacity: 0.4;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .video-wall {
    gap: 8px;
    padding: 8px;
  }

  .placeholder-icon {
    font-size: 36px;
  }

  .placeholder-text {
    font-size: 13px;
  }

  .placeholder-hint {
    font-size: 11px;
  }
}

@media (max-width: 768px) {
  /* 在小屏幕上强制使用1或4分屏 */
  .video-wall.layout-9,
  .video-wall.layout-16 {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
  }
}
</style>
