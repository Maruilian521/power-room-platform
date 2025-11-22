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
        <div class="placeholder-visual">
            <div class="crosshair"></div>
            <el-icon class="placeholder-icon"><VideoCameraFilled /></el-icon>
        </div>
        <p class="placeholder-text">等待信号接入...</p>
        <p class="placeholder-hint">双击列表中的设备加载</p>
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
      
      <!-- Cell Border Decor -->
      <div class="cell-corner corner-tl"></div>
      <div class="cell-corner corner-br"></div>
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
  gap: 4px;
  padding: 4px;
  background: rgba(0,0,0,0.5);
}

/* 1分屏 */
.video-wall.layout-1 { grid-template-columns: 1fr; grid-template-rows: 1fr; }
/* 4分屏 */
.video-wall.layout-4 { grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(2, 1fr); }
/* 9分屏 */
.video-wall.layout-9 { grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); }
/* 16分屏 */
.video-wall.layout-16 { grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(4, 1fr); }

/* 视频单元格 */
.video-cell {
  position: relative;
  background: #050505;
  border: 1px solid rgba(0, 240, 255, 0.1);
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;
}

.video-cell:hover {
  border-color: var(--tech-primary);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.1);
  z-index: 1;
}

.video-cell.is-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  border: none;
}

/* 装饰角标 */
.cell-corner {
  position: absolute;
  width: 8px;
  height: 8px;
  border: 2px solid var(--tech-primary);
  opacity: 0.3;
  transition: opacity 0.2s;
  pointer-events: none;
}
.corner-tl { top: 0; left: 0; border-right: 0; border-bottom: 0; }
.corner-br { bottom: 0; right: 0; border-left: 0; border-top: 0; }

.video-cell:hover .cell-corner { opacity: 1; box-shadow: 0 0 5px var(--tech-primary); }

/* 空白占位符 */
.empty-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-sub);
  user-select: none;
  background: radial-gradient(circle, rgba(0, 240, 255, 0.05) 0%, transparent 70%);
}

.placeholder-visual {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.crosshair {
  position: absolute;
  inset: 0;
  border: 1px dashed rgba(0, 240, 255, 0.2);
  border-radius: 50%;
}
.crosshair::before, .crosshair::after {
  content: '';
  position: absolute;
  background: rgba(0, 240, 255, 0.3);
}
.crosshair::before { top: 50%; left: -10px; right: -10px; height: 1px; }
.crosshair::after { left: 50%; top: -10px; bottom: -10px; width: 1px; }

.placeholder-icon {
  font-size: 32px;
  color: var(--tech-secondary);
  opacity: 0.5;
}

.placeholder-text {
  font-family: 'Orbitron', sans-serif;
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--tech-primary);
  margin-bottom: 4px;
}

.placeholder-hint {
  font-size: 11px;
  color: var(--text-muted);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .video-wall.layout-9,
  .video-wall.layout-16 {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
  }
}
</style>