<template>
  <div class="room-video-page">
    <div class="video-header">
      <div class="header-left">
        <el-icon><VideoCamera /></el-icon>
        <span>本站监控画面 ({{ cameras.length }})</span>
      </div>
      <div class="header-right">
        <el-button size="small" @click="layout = 1" :type="layout === 1 ? 'primary' : ''">单屏</el-button>
        <el-button size="small" @click="layout = 4" :type="layout === 4 ? 'primary' : ''">四分屏</el-button>
      </div>
    </div>

    <div class="video-grid" :class="`layout-${layout}`">
      <div 
        v-for="cam in displayedCameras" 
        :key="cam.id"
        class="video-cell"
      >
        <div class="video-player-mock">
          <div class="cam-overlay">
            <span class="cam-name">{{ cam.name }}</span>
            <span class="cam-status" :class="cam.status">{{ cam.status }}</span>
            <span class="rec-dot" v-if="cam.status === 'online'">REC</span>
          </div>
          <!-- 模拟视频画面 -->
          <div class="video-content" :class="{ 'static-noise': cam.status === 'offline' }">
            <el-icon v-if="cam.status === 'offline'" size="48"><VideoPause /></el-icon>
          </div>
        </div>
        
        <div class="cam-controls">
          <el-button-group size="small">
            <el-button :icon="VideoPlay" :disabled="cam.status === 'offline'" />
            <el-button :icon="Camera" :disabled="cam.status === 'offline'" />
            <el-button :icon="FullScreen" :disabled="cam.status === 'offline'" />
          </el-button-group>
        </div>
      </div>
      
      <!-- 占位符，补齐网格 -->
      <div v-for="n in (layout - displayedCameras.length)" :key="`placeholder-${n}`" class="video-cell placeholder" v-if="layout > displayedCameras.length">
        <span class="no-signal">NO SIGNAL</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { VideoCamera, VideoPause, VideoPlay, Camera, FullScreen } from '@element-plus/icons-vue'

defineProps<{
  roomId: string
}>()

const layout = ref(4)

// 模拟当前房间的摄像头数据
const cameras = ref([
  { id: 1, name: '全景监控 #01', status: 'online' },
  { id: 2, name: '高压柜通道', status: 'online' },
  { id: 3, name: '变压器红外', status: 'online' },
  { id: 4, name: '低压出线柜', status: 'offline' } // 模拟一个离线
])

const displayedCameras = computed(() => {
  return cameras.value.slice(0, layout.value)
})
</script>

<style scoped>
.room-video-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;
  overflow-y: auto;
}

.video-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #FFF;
  font-size: 16px;
  font-weight: 600;
}

.header-left .el-icon { color: #00F0FF; }

.video-grid {
  display: grid;
  gap: 16px;
  flex: 1;
  min-height: 400px;
}

.layout-1 { grid-template-columns: 1fr; grid-template-rows: 1fr; }
.layout-4 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }

.video-cell {
  background: #000;
  border: 1px solid #333;
  display: flex;
  flex-direction: column;
  position: relative;
}

.video-player-mock {
  flex: 1;
  position: relative;
  background: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.video-content {
  width: 100%;
  height: 100%;
  /* 模拟视频画面底色 */
  background: linear-gradient(45deg, #0a1116 25%, #0f1820 25%, #0f1820 50%, #0a1116 50%, #0a1116 75%, #0f1820 75%, #0f1820 100%);
  background-size: 20px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
}

.video-content.static-noise {
  /* 模拟雪花屏 */
  background: repeating-radial-gradient(
    circle,
    #000,
    #000 1px,
    #222 2px,
    #222 3px
  );
}

.cam-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-between;
  z-index: 10;
  pointer-events: none;
}

.cam-name {
  color: #FFF;
  background: rgba(0,0,0,0.5);
  padding: 2px 6px;
  font-size: 12px;
}

.cam-status {
  padding: 2px 6px;
  font-size: 12px;
  text-transform: uppercase;
}
.cam-status.online { color: #00E676; }
.cam-status.offline { color: #FF2E63; }

.rec-dot {
  color: #FF2E63;
  animation: blink 1s infinite;
  font-weight: 700;
  background: rgba(0,0,0,0.5);
  padding: 2px 6px;
}

@keyframes blink { 50% { opacity: 0; } }

.cam-controls {
  height: 40px;
  background: #1a2129;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 10px;
  border-top: 1px solid #333;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-signal {
  color: #333;
  font-family: 'Orbitron';
  letter-spacing: 2px;
}
</style>
