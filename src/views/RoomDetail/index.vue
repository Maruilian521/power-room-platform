<template>
  <div class="room-detail-page page-container">
    <!-- 详情页头部：面包屑与状态摘要 -->
    <div class="detail-header module-card">
      <div class="header-left">
        <el-button link class="back-btn" @click="goBack">
          <el-icon><ArrowLeft /></el-icon> 返回
        </el-button>
        <div class="room-title">
          <span class="name">{{ roomName }}</span>
          <span class="id-tag">ID: {{ roomId }}</span>
        </div>
        <div class="room-badges">
            <el-tag type="success" effect="dark" class="sc2-tag">运行中</el-tag>
            <el-tag type="warning" effect="dark" class="sc2-tag">B级保电</el-tag>
        </div>
      </div>
      
      <div class="header-right">
        <div class="status-summary">
          <div class="summary-item">
            <span class="lbl">综合健康度</span>
            <span class="val score">98</span>
          </div>
          <div class="summary-item">
            <span class="lbl">当前负荷</span>
            <span class="val">450 kW</span>
          </div>
          <div class="summary-item">
            <span class="lbl">安全运行时长</span>
            <span class="val">128 天</span>
          </div>
        </div>
      </div>
    </div>

    <!-- SC2 风格 Tab 切换 -->
    <div class="detail-tabs-bar">
      <div class="tabs-scroll-container">
        <div 
            v-for="tab in tabs" 
            :key="tab.id"
            class="tab-item"
            :class="{ active: currentTab === tab.id }"
            @click="currentTab = tab.id"
        >
            <el-icon class="tab-icon" v-if="tab.icon"><component :is="tab.icon" /></el-icon>
            <span class="tab-label">{{ tab.label }}</span>
            <div class="tab-indicator"></div>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="detail-content">
      <transition name="fade" mode="out-in">
        <!-- 动态组件加载 -->
        <keep-alive>
            <component :is="currentTabComponent" :room-id="roomId" class="tab-content-wrapper" />
        </keep-alive>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineComponent, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
    ArrowLeft, Monitor, DataLine, Connection, 
    Sunny, Histogram, Bell, Files 
} from '@element-plus/icons-vue'

// 导入已有组件
import PrimaryTopology from './components/PrimaryTopology.vue'
import EnvRadar from './components/EnvRadar.vue'
// RoomVideo is not in the main requested list but useful, can add as extra or keep hidden
// Reuse global views as local components (assuming they can handle props or we just show them)
import AlarmList from '../AlarmList.vue'
import WorkOrder from '../WorkOrder.vue'

// 简单占位组件
const ConstructionPlaceholder = (name: string) => defineComponent({
  render() { 
      return h('div', { class: 'construction-placeholder' }, [
          h('div', { class: 'construction-icon' }, [h('div', { class: 'spin-ring' })]),
          h('h3', `[ ${name} ] 模块建设中`),
          h('p', 'SYSTEM UNDER CONSTRUCTION')
      ]) 
  }
})

const route = useRoute()
const router = useRouter()

const roomId = ref(route.params.id || 'ROOM-001')
const roomName = ref('科技园区 #1 配电室') 

const tabs = [
  { id: 'topology', label: '一次接线拓扑', icon: Connection, component: PrimaryTopology },
  { id: 'transformer', label: '主变实时数据', icon: DataLine, component: ConstructionPlaceholder('MAIN TRANSFORMER DATA') },
  { id: 'cabinet', label: '高压柜组态', icon: Monitor, component: ConstructionPlaceholder('HV CABINET CONFIG') },
  { id: 'env', label: '环境监测', icon: Sunny, component: EnvRadar },
  { id: 'power', label: '电能质量', icon: Histogram, component: ConstructionPlaceholder('POWER QUALITY') },
  { id: 'alarm', label: '告警/事���', icon: Bell, component: AlarmList }, 
  { id: 'workorder', label: '工单/巡检', icon: Files, component: WorkOrder },
]

const currentTab = ref('topology')

const currentTabComponent = computed(() => {
  const tab = tabs.find(t => t.id === currentTab.value)
  return tab ? tab.component : null
})

const goBack = () => {
  router.push('/monitoring/site-list')
}

onMounted(() => {
  // Mock updating room name based on ID
  if (roomId.value === 'room-10') {
      roomName.value = '总部大楼 #3 配电室'
  }
})
</script>

<style scoped>
.room-detail-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: var(--bg-deep); /* Use global theme var */
}

/* Header */
.detail-header {
  height: 70px;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 240, 255, 0.2);
  background: rgba(13, 18, 26, 0.85); /* Match module-card */
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  color: var(--text-sub);
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
}
.back-btn:hover { color: var(--tech-primary); }

.room-title {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.room-title .name {
  font-size: 22px;
  color: var(--text-bright);
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}

.room-title .id-tag {
  font-size: 14px;
  color: var(--tech-secondary);
  font-family: 'Rajdhani';
  font-weight: 600;
}

.room-badges {
    display: flex;
    gap: 8px;
}

.sc2-tag {
    font-family: 'Microsoft YaHei';
    border-radius: 2px;
    height: 24px;
    line-height: 22px;
}

/* Right Stats */
.summary-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: 30px;
}

.summary-item .lbl {
  font-size: 11px;
  color: var(--text-sub);
  text-transform: uppercase;
}

.summary-item .val {
  font-size: 18px;
  color: var(--text-bright);
  font-weight: 600;
  font-family: 'Rajdhani';
}

.summary-item .score {
  color: var(--status-success);
  font-size: 24px;
  font-family: 'DIN Alternate';
  text-shadow: 0 0 10px rgba(0, 230, 118, 0.4);
}

/* Tabs Bar */
.detail-tabs-bar {
  height: 48px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.1);
  display: flex;
  align-items: center;
  padding: 0 4px;
}

.tabs-scroll-container {
    display: flex;
    gap: 4px;
    height: 100%;
    width: 100%;
    overflow-x: auto;
}

.tab-item {
  padding: 0 24px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text-sub);
  font-family: "Microsoft YaHei", sans-serif;
  font-weight: 600;
  font-size: 14px;
  position: relative;
  transition: all 0.2s;
  min-width: 120px;
}

.tab-item:hover {
  color: var(--text-bright);
  background: rgba(255, 255, 255, 0.02);
}

.tab-item.active {
  color: var(--text-bright);
  background: linear-gradient(180deg, rgba(0, 240, 255, 0.1) 0%, rgba(0, 240, 255, 0.02) 100%);
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.6);
}

.tab-item.active .tab-indicator {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: var(--tech-primary);
    box-shadow: 0 0 10px var(--tech-primary);
}

/* Content Area */
.detail-content {
  flex: 1;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(0, 240, 255, 0.1);
  background: rgba(13, 18, 26, 0.4);
}

.tab-content-wrapper {
    height: 100%;
    width: 100%;
    overflow-y: auto;
    padding: 20px;
}

/* Construction Placeholder */
:deep(.construction-placeholder) {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--text-sub);
    background: radial-gradient(circle, rgba(0, 240, 255, 0.05) 0%, transparent 70%);
}

:deep(.construction-icon) {
    width: 80px;
    height: 80px;
    border: 2px dashed var(--tech-secondary);
    border-radius: 50%;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: spin-slow 10s linear infinite;
}

:deep(.spin-ring) {
    width: 60%;
    height: 60%;
    border: 2px solid var(--tech-primary);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 2s linear infinite;
}

:deep(h3) {
    font-family: 'Orbitron';
    color: var(--tech-primary);
    margin-bottom: 8px;
    letter-spacing: 2px;
}

:deep(p) {
    font-family: 'Rajdhani';
    letter-spacing: 4px;
    font-size: 12px;
    opacity: 0.7;
}

@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes spin-slow { 100% { transform: rotate(-360deg); } }

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
