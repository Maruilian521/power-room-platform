<template>
  <div class="video-monitoring-container">
    <!-- 顶部工具栏 -->
    <div class="video-toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button :type="layout === 1 ? 'primary' : ''" @click="changeLayout(1)">
            <el-icon><Grid /></el-icon>
            <span>单画面</span>
          </el-button>
          <el-button :type="layout === 4 ? 'primary' : ''" @click="changeLayout(4)">
            <el-icon><Grid /></el-icon>
            <span>四分屏</span>
          </el-button>
          <el-button :type="layout === 9 ? 'primary' : ''" @click="changeLayout(9)">
            <el-icon><Grid /></el-icon>
            <span>九分屏</span>
          </el-button>
          <el-button :type="layout === 16 ? 'primary' : ''" @click="changeLayout(16)">
            <el-icon><Grid /></el-icon>
            <span>十六分屏</span>
          </el-button>
        </el-button-group>
      </div>

      <div class="toolbar-center">
        <span class="monitoring-title">
          <el-icon><VideoCamera /></el-icon>
          视频监控中心
        </span>
        <el-tag :type="onlineCameras > 0 ? 'success' : 'danger'" size="large">
          在线: {{ onlineCameras }}/{{ totalCameras }}
        </el-tag>
      </div>

      <div class="toolbar-right">
        <el-button :icon="polling ? 'VideoPause' : 'VideoPlay'" @click="togglePolling">
          {{ polling ? '停止轮询' : '开始轮询' }}
        </el-button>
        <el-button icon="Download" @click="captureAll">批量截图</el-button>
        <el-button icon="FullScreen" @click="enterFullscreen">全屏</el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="video-content">
      <!-- 左侧摄像头树 -->
      <div class="camera-sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-header">
          <el-input
            v-model="searchText"
            placeholder="搜索摄像头..."
            :prefix-icon="Search"
            clearable
            @input="handleSearch"
          />
          <el-button
            text
            :icon="sidebarCollapsed ? 'Expand' : 'Fold'"
            @click="sidebarCollapsed = !sidebarCollapsed"
            class="collapse-btn"
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
      <div class="video-wall">
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
import { Grid, VideoCamera, Search, Expand, Fold } from '@element-plus/icons-vue'
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
const handleShowPTZ = (video: any, index: number) => {
  if (!video.supportPTZ) {
    ElMessage.warning('该摄像头不支持云台控制')
    return
  }
  currentPTZCamera.value = video
  ptzVisible.value = true
}

// 截图
const handleCapture = (video: any, index: number) => {
  ElMessage.success(`已截图: ${video.label}`)
  // TODO: 实现截图逻辑
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
  // TODO: 实现批量截图
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
  // TODO: 发送PTZ控制指令到后端
}

// 搜索
const handleSearch = () => {
  // 搜索逻辑已在 computed 中实现
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
.video-monitoring-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  overflow: hidden;
}

/* 顶部工具栏 */
.video-toolbar {
  height: 64px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--glass-border);
  box-shadow: var(--shadow-sm);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-shrink: 0;
}

.toolbar-left {
  flex: 1;
}

.toolbar-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.monitoring-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 主内容区 */
.video-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 16px;
  gap: 16px;
}

/* 左侧摄像头树 */
.camera-sidebar {
  width: 300px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
}

.camera-sidebar.collapsed {
  width: 50px;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  gap: 8px;
  align-items: center;
}

.camera-sidebar.collapsed .sidebar-header {
  padding: 16px 8px;
}

.collapse-btn {
  flex-shrink: 0;
}

.sidebar-content {
  flex: 1;
  overflow: hidden;
  padding: 12px;
}

/* 右侧视频墙 */
.video-wall {
  flex: 1;
  overflow: hidden;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .camera-sidebar {
    width: 250px;
  }

  .toolbar-center .monitoring-title {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .video-toolbar {
    flex-wrap: wrap;
    height: auto;
    padding: 12px;
  }

  .toolbar-left,
  .toolbar-center,
  .toolbar-right {
    flex: 0 0 100%;
  }

  .camera-sidebar.collapsed {
    width: 0;
    padding: 0;
    border: none;
  }
}
</style>
