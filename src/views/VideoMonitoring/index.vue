<template>
  <div class="page-container video-page">
    <!-- 顶部工具栏 -->
    <div class="video-toolbar module-card">
      <div class="toolbar-left">
        <el-button-group class="sc2-btn-group">
          <el-button :type="layout === 1 ? 'primary' : 'default'" @click="changeLayout(1)">
            <el-icon><Grid /></el-icon>
            <span>单画面</span>
          </el-button>
          <el-button :type="layout === 4 ? 'primary' : 'default'" @click="changeLayout(4)">
            <el-icon><Grid /></el-icon>
            <span>四分屏</span>
          </el-button>
          <el-button :type="layout === 9 ? 'primary' : 'default'" @click="changeLayout(9)">
            <el-icon><Grid /></el-icon>
            <span>九分屏</span>
          </el-button>
          <el-button :type="layout === 16 ? 'primary' : 'default'" @click="changeLayout(16)">
            <el-icon><Grid /></el-icon>
            <span>十六分屏</span>
          </el-button>
        </el-button-group>
      </div>

      <div class="toolbar-center">
        <div class="monitoring-title">
          <el-icon class="title-icon"><VideoCamera /></el-icon>
          <span>视频监控中心</span>
        </div>
        <div class="status-tags">
           <span class="status-text">在线: <span class="highlight">{{ onlineCameras }}</span> / {{ totalCameras }}</span>
        </div>
      </div>

      <div class="toolbar-right">
        <el-button :type="polling ? 'warning' : 'primary'" @click="togglePolling">
          <el-icon><component :is="polling ? 'VideoPause' : 'VideoPlay'" /></el-icon>
          {{ polling ? '停止轮询' : '开始轮询' }}
        </el-button>
        <el-button @click="captureAll">
            <el-icon><Download /></el-icon>
            批量截图
        </el-button>
        <el-button @click="enterFullscreen">
            <el-icon><FullScreen /></el-icon>
            全屏
        </el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="video-content">
      <!-- 左侧摄像头树 -->
      <div class="camera-sidebar sc2-info-panel" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-header">
          <div class="header-title" v-show="!sidebarCollapsed">摄像头列表</div>
          <el-button
            text
            class="collapse-btn"
            @click="sidebarCollapsed = !sidebarCollapsed"
          >
            <el-icon><component :is="sidebarCollapsed ? 'Expand' : 'Fold'" /></el-icon>
          </el-button>
        </div>
        
        <div class="search-box-wrapper" v-show="!sidebarCollapsed">
             <el-input
                v-model="searchText"
                placeholder="搜索摄像头..."
                :prefix-icon="Search"
                clearable
                class="sc2-search"
            />
        </div>

        <div v-show="!sidebarCollapsed" class="sidebar-content">
          <el-scrollbar height="100%">
            <CameraTree
              :tree-data="filteredTreeData"
              :selected-camera="selectedCamera"
              @camera-click="handleCameraClick"
              @camera-dbclick="handleCameraDoubleClick"
            />
          </el-scrollbar>
        </div>
      </div>

      <!-- 右侧视频墙 -->
      <div class="video-wall-container">
        <VideoWall
          :layout="layout"
          :videos="displayedVideos"
          :fullscreen-index="fullscreenIndex"
          @tile-click="handleTileClick"
          @tile-dbclick="handleTileDoubleClick"
          @show-ptz="handleShowPTZ"
          @capture="handleCapture"
          @close="handleCloseVideo"
        />
      </div>
    </div>

    <!-- PTZ云台控制面板 -->
    <PTZControl
      v-model:visible="ptzVisible"
      :camera="currentPTZCamera"
      @control="handlePTZControl"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Grid, VideoCamera, Search } from '@element-plus/icons-vue'
import CameraTree from './components/CameraTree.vue'
import VideoWall from './components/VideoWall.vue'
import PTZControl from './components/PTZControl.vue'
import { ElMessage } from 'element-plus'

// 布局模式：1/4/9/16
const layout = ref(4)

// 侧边栏状态
const sidebarCollapsed = ref(false)
const searchText = ref('')

// 轮询状态
const polling = ref(false)
let pollingTimer: number | null = null

// PTZ控制
const ptzVisible = ref(false)
const currentPTZCamera = ref<any>(null)

// 全屏索引（-1表示不全屏）
const fullscreenIndex = ref(-1)

// 选中的摄像头
const selectedCamera = ref<string>('')

// 摄像头树数据
const treeData = ref([
  {
    id: 'zone-1',
    label: '1号配电室',
    type: 'zone',
    children: [
      {
        id: 'cam-101',
        label: '主进线柜监控',
        type: 'camera',
        status: 'online',
        streamUrl: 'rtsp://example.com/stream1',
        supportPTZ: true
      },
      {
        id: 'cam-102',
        label: '变压器区域',
        type: 'camera',
        status: 'online',
        streamUrl: 'rtsp://example.com/stream2',
        supportPTZ: true
      },
      {
        id: 'cam-103',
        label: '配电柜区域',
        type: 'camera',
        status: 'offline',
        streamUrl: 'rtsp://example.com/stream3',
        supportPTZ: false
      }
    ]
  },
  {
    id: 'zone-2',
    label: '2号配电室',
    type: 'zone',
    children: [
      {
        id: 'cam-201',
        label: '高压进线监控',
        type: 'camera',
        status: 'online',
        streamUrl: 'rtsp://example.com/stream4',
        supportPTZ: true
      },
      {
        id: 'cam-202',
        label: '环境监测全景',
        type: 'camera',
        status: 'online',
        streamUrl: 'rtsp://example.com/stream5',
        supportPTZ: true
      },
      {
        id: 'cam-203',
        label: '出线柜监控',
        type: 'camera',
        status: 'online',
        streamUrl: 'rtsp://example.com/stream6',
        supportPTZ: false
      }
    ]
  },
  {
    id: 'zone-3',
    label: '3号配电室',
    type: 'zone',
    children: [
      {
        id: 'cam-301',
        label: '总览摄像头',
        type: 'camera',
        status: 'online',
        streamUrl: 'rtsp://example.com/stream7',
        supportPTZ: true
      },
      {
        id: 'cam-302',
        label: '控制柜特写',
        type: 'camera',
        status: 'offline',
        streamUrl: 'rtsp://example.com/stream8',
        supportPTZ: false
      }
    ]
  },
  {
    id: 'zone-outdoor',
    label: '户外区域',
    type: 'zone',
    children: [
      {
        id: 'cam-401',
        label: '大门入口',
        type: 'camera',
        status: 'online',
        streamUrl: 'rtsp://example.com/stream9',
        supportPTZ: true
      },
      {
        id: 'cam-402',
        label: '周界巡视',
        type: 'camera',
        status: 'online',
        streamUrl: 'rtsp://example.com/stream10',
        supportPTZ: true
      }
    ]
  }
])

// 当前显示的视频列表
const displayedVideos = ref<any[]>([])

// 搜索过滤后的树数据
const filteredTreeData = computed(() => {
  if (!searchText.value) return treeData.value

  const filterTree = (nodes: any[]): any[] => {
    return nodes.reduce((acc, node) => {
      if (node.type === 'zone') {
        const filteredChildren = filterTree(node.children || [])
        if (filteredChildren.length > 0) {
          acc.push({ ...node, children: filteredChildren })
        }
      } else if (node.type === 'camera') {
        if (node.label.toLowerCase().includes(searchText.value.toLowerCase())) {
          acc.push(node)
        }
      }
      return acc
    }, [] as any[])
  }

  return filterTree(treeData.value)
})

// 统计摄像头数量
const allCameras = computed(() => {
  const cameras: any[] = []
  const collectCameras = (nodes: any[]) => {
    nodes.forEach(node => {
      if (node.type === 'camera') {
        cameras.push(node)
      } else if (node.children) {
        collectCameras(node.children)
      }
    })
  }
  collectCameras(treeData.value)
  return cameras
})

const totalCameras = computed(() => allCameras.value.length)
const onlineCameras = computed(() => allCameras.value.filter(c => c.status === 'online').length)

// 切换布局
const changeLayout = (newLayout: number) => {
  layout.value = newLayout
  fullscreenIndex.value = -1

  // 调整显示的视频数量
  if (displayedVideos.value.length > newLayout) {
    displayedVideos.value = displayedVideos.value.slice(0, newLayout)
  }
}

// 摄像头点击
const handleCameraClick = (camera: any) => {
  selectedCamera.value = camera.id
}

// 摄像头双击 - 添加到视频墙
const handleCameraDoubleClick = (camera: any) => {
  if (camera.status === 'offline') {
    ElMessage.warning('该摄像头离线，无法播放')
    return
  }

  // 检查是否已经在显示列表中
  const index = displayedVideos.value.findIndex(v => v.id === camera.id)
  if (index !== -1) {
    ElMessage.info('该摄像头已在播放')
    return
  }

  // 如果视频墙已满，替换第一个
  if (displayedVideos.value.length >= layout.value) {
    displayedVideos.value.shift()
  }

  displayedVideos.value.push({
    ...camera,
    playing: true,
    muted: true,
    quality: 'HD'
  })

  ElMessage.success(`已加载摄像头: ${camera.label}`)
}

// 视频块点击
const handleTileClick = (index: number) => {
  console.log('Tile clicked:', index)
}

// 视频块双击 - 全屏/退出全屏
const handleTileDoubleClick = (index: number) => {
  if (fullscreenIndex.value === index) {
    fullscreenIndex.value = -1
  } else {
    fullscreenIndex.value = index
  }
}

// 显示PTZ控制
const handleShowPTZ = (video: any) => {
  if (!video.supportPTZ) {
    ElMessage.warning('该摄像头不支持云台控制')
    return
  }
  currentPTZCamera.value = video
  ptzVisible.value = true
}

// 截图
const handleCapture = (video: any) => {
  ElMessage.success(`已截图: ${video.label}`)
}

// 关闭视频
const handleCloseVideo = (index: number) => {
  displayedVideos.value.splice(index, 1)
}

// 批量截图
const captureAll = () => {
  if (displayedVideos.value.length === 0) {
    ElMessage.warning('没有正在播放的视频')
    return
  }
  ElMessage.success(`已截图所有视频 (${displayedVideos.value.length}个)`)
}

// 全屏
const enterFullscreen = () => {
  const elem = document.querySelector('.video-monitoring-container') as HTMLElement
  if (elem.requestFullscreen) {
    elem.requestFullscreen()
  }
}

// 轮询
const togglePolling = () => {
  polling.value = !polling.value

  if (polling.value) {
    startPolling()
    ElMessage.success('已开启轮询播放')
  } else {
    stopPolling()
    ElMessage.info('已停止轮询')
  }
}

const startPolling = () => {
  const onlineCameraList = allCameras.value.filter(c => c.status === 'online')
  if (onlineCameraList.length === 0) return

  let currentIndex = 0
  pollingTimer = setInterval(() => {
    const nextCameras = []
    for (let i = 0; i < layout.value; i++) {
      const camera = onlineCameraList[(currentIndex + i) % onlineCameraList.length]
      nextCameras.push({
        ...camera,
        playing: true,
        muted: true,
        quality: 'HD'
      })
    }
    displayedVideos.value = nextCameras
    currentIndex = (currentIndex + layout.value) % onlineCameraList.length
  }, 10000) // 每10秒切换
}

const stopPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
}

// PTZ控制
const handlePTZControl = (command: string, params: any) => {
  console.log('PTZ Control:', command, params)
}

onMounted(() => {
  // 初始化时加载前几个在线摄像头
  const initialCameras = allCameras.value
    .filter(c => c.status === 'online')
    .slice(0, layout.value)
    .map(c => ({
      ...c,
      playing: true,
      muted: true,
      quality: 'HD'
    }))

  displayedVideos.value = initialCameras
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
.video-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

/* 顶部工具栏 */
.video-toolbar {
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  margin-bottom: 0; /* module-card has padding, remove external margin if needed or adjust */
}

.toolbar-left, .toolbar-right {
  flex: 1;
}

.toolbar-right {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.toolbar-center {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.monitoring-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 20px;
  color: var(--tech-primary);
  display: flex;
  align-items: center;
  gap: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
}

.title-icon {
  font-size: 24px;
  filter: drop-shadow(0 0 5px var(--tech-primary));
}

.status-text {
  font-family: 'Rajdhani', sans-serif;
  color: var(--text-sub);
  font-size: 14px;
  margin-top: 2px;
}

.status-text .highlight {
  color: var(--status-success);
  font-weight: bold;
  font-size: 16px;
}

/* 主内容区 */
.video-content {
  flex: 1;
  display: flex;
  gap: 16px;
  overflow: hidden;
  min-height: 0; /* Important for nested scroll */
}

/* 左侧边栏 - Terran Style */
.camera-sidebar {
  width: 280px;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  padding: 0; /* Reset padding for internal layout */
}

.camera-sidebar.collapsed {
  width: 48px;
}

.sidebar-header {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  background: rgba(0, 240, 255, 0.05);
}

.header-title {
  font-family: 'Orbitron', sans-serif;
  color: var(--tech-secondary);
  font-weight: bold;
}

.search-box-wrapper {
  padding: 12px;
}

.sidebar-content {
  flex: 1;
  overflow: hidden;
}

/* 右侧视频墙容器 */
.video-wall-container {
  flex: 1;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

/* SC2 Button Overrides for Toolbar */
:deep(.el-button) {
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
}
</style>