<template>
  <div class="big-screen-container">
    <!-- 顶部标题栏 -->
    <div class="screen-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack" title="返回主菜单">
          <span class="back-icon">←</span>
          <span class="back-text">返回主菜单</span>
        </button>
        <div class="header-title">
          <div class="title-icon"></div>
          <h1>无人配电室智慧运维监控中心</h1>
        </div>
        <div class="header-subtitle">Power Room Intelligent O&M Monitoring Center</div>
      </div>
      <div class="header-center">
        <div class="time-display">
          <div class="date">{{ currentDate }}</div>
          <div class="time">{{ currentTime }}</div>
        </div>
      </div>
      <div class="header-right">
        <div class="status-item">
          <span class="status-label">运行天数</span>
          <span class="status-value">{{ systemInfo.runDays }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">系统状态</span>
          <span class="status-value status-online">● 正常</span>
        </div>
        <button class="fullscreen-btn" @click="toggleFullscreen" title="全屏/退出全屏">
          <span v-if="!isFullscreen">⛶</span>
          <span v-else>⛶</span>
        </button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="screen-content">
      <!-- 左侧区域 25% -->
      <div class="screen-left">
        <!-- 关键指标卡片 -->
        <KPICards />

        <!-- 设备状态统计 -->
        <DeviceStatusChart />

        <!-- 能耗统计 -->
        <EnergyChart />
      </div>

      <!-- 中间区域 50% -->
      <div class="screen-center">
        <!-- 3D数字孪生 -->
        <DigitalTwin3D />

        <!-- 电能流向图 -->
        <PowerFlowChart />
      </div>

      <!-- 右侧区域 25% -->
      <div class="screen-right">
        <!-- AI预警面板 -->
        <AIWarningPanel />

        <!-- 实时告警列表 -->
        <AlarmList />

        <!-- 环境监测 -->
        <EnvironmentMonitor />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import KPICards from './components/KPICards.vue'
import DeviceStatusChart from './components/DeviceStatusChart.vue'
import EnergyChart from './components/EnergyChart.vue'
import DigitalTwin3D from './components/DigitalTwin3D.vue'
import PowerFlowChart from './components/PowerFlowChart.vue'
import AIWarningPanel from './components/AIWarningPanel.vue'
import AlarmList from './components/AlarmList.vue'
import EnvironmentMonitor from './components/EnvironmentMonitor.vue'

const router = useRouter()

// 当前时间
const currentDate = ref('')
const currentTime = ref('')

// 全屏状态
const isFullscreen = ref(false)

// 系统信息
const systemInfo = ref({
  runDays: 365,
  status: 'online'
})

// 返回主菜单
const goBack = () => {
  // 如果是在全屏大屏路由，跳转到首页
  if (router.currentRoute.value.path === '/bigscreen') {
    router.push('/')
  } else {
    // 否则返回上一页
    router.back()
  }
}

// 切换全屏
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
      isFullscreen.value = false
    }
  }
}

// 监听全屏变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long'
  })
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

let timeInterval: number

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style scoped>
.big-screen-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0a1929 0%, #1a2332 50%, #0f1922 100%);
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  padding: 20px;
  box-sizing: border-box;
}

/* 顶部标题栏 */
.screen-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(70, 211, 154, 0.1) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0 30px;
  position: relative;
  overflow: hidden;
}

.screen-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent 0%,
    #2196f3 20%,
    #46d39a 50%,
    #2196f3 80%,
    transparent 100%
  );
}

.header-left {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.2) 0%, rgba(70, 211, 154, 0.2) 100%);
  border: 1px solid rgba(33, 150, 243, 0.3);
  border-radius: 8px;
  color: #2196f3;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.back-btn:hover {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.3) 0%, rgba(70, 211, 154, 0.3) 100%);
  border-color: #2196f3;
  transform: translateX(-3px);
  box-shadow: 0 0 20px rgba(33, 150, 243, 0.4);
}

.back-icon {
  font-size: 18px;
  font-weight: bold;
}

.back-text {
  font-weight: 600;
}

.header-title {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.title-icon {
  width: 6px;
  height: 32px;
  background: linear-gradient(180deg, #2196f3 0%, #46d39a 100%);
  border-radius: 3px;
  margin-right: 15px;
  box-shadow: 0 0 20px rgba(33, 150, 243, 0.5);
}

.header-title h1 {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #2196f3 0%, #46d39a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: 2px;
}

.header-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 1px;
  margin-left: 21px;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.time-display {
  text-align: center;
}

.time-display .date {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 5px;
}

.time-display .time {
  font-size: 32px;
  font-weight: 700;
  font-family: 'DIN Alternate', 'Arial', sans-serif;
  color: #2196f3;
  text-shadow: 0 0 20px rgba(33, 150, 243, 0.5);
  letter-spacing: 2px;
}

.header-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 30px;
}

.fullscreen-btn {
  padding: 8px 12px;
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.2) 0%, rgba(70, 211, 154, 0.2) 100%);
  border: 1px solid rgba(33, 150, 243, 0.3);
  border-radius: 8px;
  color: #2196f3;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-btn:hover {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.3) 0%, rgba(70, 211, 154, 0.3) 100%);
  border-color: #2196f3;
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(33, 150, 243, 0.4);
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.status-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 5px;
}

.status-value {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  font-family: 'DIN Alternate', 'Arial', sans-serif;
}

.status-online {
  color: #46d39a;
  text-shadow: 0 0 15px rgba(70, 211, 154, 0.5);
}

/* 主内容区 */
.screen-content {
  display: flex;
  gap: 20px;
  height: calc(100vh - 120px);
}

.screen-left,
.screen-right {
  flex: 0 0 25%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(33, 150, 243, 0.3) transparent;
}

.screen-left::-webkit-scrollbar,
.screen-right::-webkit-scrollbar {
  width: 6px;
}

.screen-left::-webkit-scrollbar-track,
.screen-right::-webkit-scrollbar-track {
  background: transparent;
}

.screen-left::-webkit-scrollbar-thumb,
.screen-right::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #2196f3 0%, #46d39a 100%);
  border-radius: 3px;
}

.screen-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
