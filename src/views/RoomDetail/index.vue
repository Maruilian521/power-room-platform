<template>
  <div class="room-detail-page">
    <!-- 详情页头部：面包屑与状态摘要 -->
    <div class="detail-header">
      <div class="header-left">
        <el-button link class="back-btn" @click="goBack">
          <el-icon><ArrowLeft /></el-icon> 返回总览
        </el-button>
        <div class="room-title">
          <span class="name">{{ roomName }}</span>
          <span class="id-tag">ID: {{ roomId }}</span>
        </div>
      </div>
      
      <div class="header-right">
        <div class="status-summary">
          <div class="summary-item">
            <span class="lbl">运行状态</span>
            <span class="val text-success">正常</span>
          </div>
          <div class="summary-item">
            <span class="lbl">健康评分</span>
            <span class="val score">98</span>
          </div>
          <div class="summary-item">
            <span class="lbl">最后巡检</span>
            <span class="val">2小时前</span>
          </div>
        </div>
      </div>
    </div>

    <!-- SC2 风格 Tab 切换 -->
    <div class="detail-tabs">
      <div 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-item"
        :class="{ active: currentTab === tab.id }"
        @click="currentTab = tab.id"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="detail-content">
      <transition name="fade" mode="out-in">
        <!-- 动态组件加载 -->
        <component :is="currentTabComponent" :room-id="roomId" />
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import EnvRadar from './components/EnvRadar.vue'
import RoomVideo from './components/RoomVideo.vue'
import PrimaryTopology from './components/PrimaryTopology.vue' // 新增

// 模拟其他组件的占位符
import { defineComponent, h } from 'vue'
const Placeholder = defineComponent({
  render() { return h('div', { style: 'color: #666; padding: 50px; text-align: center;' }, '功能开发中 - SYSTEM UNDER CONSTRUCTION') }
})

const route = useRoute()
const router = useRouter()

const roomId = ref(route.params.id || '001')
const roomName = ref('科技园区 #1 配电室') // Mock name

const tabs = [
  { id: 'env', label: '环境安防 (RADAR)', component: EnvRadar },
  { id: 'electric', label: '电气监测 (PRIMARY)', component: PrimaryTopology }, // 替换
  { id: 'video', label: '视频监控 (VIDEO)', component: RoomVideo },
  { id: 'device', label: '设备台账 (ASSETS)', component: Placeholder },
]

const currentTab = ref('env')

const currentTabComponent = computed(() => {
  const tab = tabs.find(t => t.id === currentTab.value)
  return tab ? tab.component : Placeholder
})

const goBack = () => {
  router.push('/room/overview/topology')
}

onMounted(() => {
  // 这里可以根据 roomId 获取真实数据
  // console.log('Loaded room:', roomId.value)
})
</script>

<style scoped>
.room-detail-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #050608;
}

.detail-header {
  height: 60px;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  background: rgba(10, 12, 16, 0.5);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  color: #5f748a;
  font-size: 14px;
}
.back-btn:hover { color: #00F0FF; }

.room-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.room-title .name {
  font-size: 20px;
  color: #FFF;
  font-weight: 700;
  letter-spacing: 1px;
}

.room-title .id-tag {
  font-size: 12px;
  color: #00F0FF;
  font-family: 'Rajdhani';
}

.header-right {
  display: flex;
  align-items: center;
}

.status-summary {
  display: flex;
  gap: 30px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.summary-item .lbl {
  font-size: 10px;
  color: #5f748a;
}

.summary-item .val {
  font-size: 16px;
  color: #FFF;
  font-weight: 600;
}

.summary-item .score {
  color: #00E676;
  font-family: 'DIN Alternate';
  font-size: 20px;
}

.text-success { color: #00E676; }

/* 战术 Tab */
.detail-tabs {
  display: flex;
  padding: 0 24px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  background: rgba(0,0,0,0.2);
}

.tab-item {
  padding: 12px 24px;
  cursor: pointer;
  color: #5f748a;
  font-family: "Microsoft YaHei", sans-serif;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-item:hover {
  color: #d0e0f0;
  background: rgba(255,255,255,0.02);
}

.tab-item.active {
  color: #00F0FF;
  border-bottom-color: #00F0FF;
  background: rgba(0, 240, 255, 0.05);
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
}

/* 内容区域 */
.detail-content {
  flex: 1;
  overflow: hidden;
  padding: 0; /* 子组件自带 padding */
}

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