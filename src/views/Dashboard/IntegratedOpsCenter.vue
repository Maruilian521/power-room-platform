<template>
  <div class="page-container integrated-ops-center">
    <!-- 顶部核心KPI指标 -->
    <div class="top-kpi-section">
      <div class="kpi-card" v-for="(kpi, index) in kpiCards" :key="index" :class="`kpi-${kpi.type}`">
        <div class="kpi-icon">
          <el-icon :size="28"><component :is="kpi.icon" /></el-icon>
        </div>
        <div class="kpi-info">
          <div class="kpi-label">{{ kpi.label }}</div>
          <div class="kpi-value-group">
            <span class="kpi-value">{{ kpi.value }}</span>
            <span class="kpi-unit" v-if="kpi.unit">{{ kpi.unit }}</span>
          </div>
          <div class="kpi-subtext">{{ kpi.subtext }}</div>
        </div>
        <div class="card-corner corner-tl"></div>
        <div class="card-corner corner-br"></div>
      </div>
    </div>

    <!-- 核心三栏布局 -->
    <div class="main-layout">
      <!-- 左侧：健康与环境 -->
      <div class="left-panel">
        <HealthEnvironmentPanel />
      </div>

      <!-- 中央：GIS地图核心区 -->
      <div class="center-stage">
        <SiteMapCore />
      </div>

      <!-- 右侧：实时与指挥 -->
      <div class="right-panel">
        <RealtimeCommandPanel />
      </div>
    </div>

    <!-- 底部：趋势与成效 -->
    <div class="bottom-panel">
      <TrendsEffectivenessPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import {
  Timer, Connection, Bell, Document,
  TrendCharts
} from '@element-plus/icons-vue'
import { getGlobalKPI, type GlobalKPI } from '../../api/integrated-ops'
import HealthEnvironmentPanel from './components/HealthEnvironmentPanel.vue'
import SiteMapCore from './components/SiteMapCore.vue'
import RealtimeCommandPanel from './components/RealtimeCommandPanel.vue'
import TrendsEffectivenessPanel from './components/TrendsEffectivenessPanel.vue'

const globalKPI = ref<GlobalKPI>({
  safeDays: 0,
  onlineRate: 0,
  totalOnline: 0,
  totalSites: 0,
  todayAlarms: 0,
  urgentWorkOrders: 0,
  totalLoad: 0,
  todayEnergy: 0
})

// 顶部KPI卡片
const kpiCards = computed(() => [
  {
    label: '安全运行天数',
    value: globalKPI.value.safeDays,
    unit: '天',
    subtext: '持续安全运营',
    icon: Timer,
    type: 'success'
  },
  {
    label: '站点在线率',
    value: `${globalKPI.value.totalOnline}/${globalKPI.value.totalSites}`,
    unit: '',
    subtext: `在线率 ${globalKPI.value.onlineRate}%`,
    icon: Connection,
    type: 'info'
  },
  {
    label: '今日告警总数',
    value: globalKPI.value.todayAlarms,
    unit: '条',
    subtext: '需持续关注',
    icon: Bell,
    type: 'warning'
  },
  {
    label: '待处理急单',
    value: globalKPI.value.urgentWorkOrders,
    unit: '个',
    subtext: '请优先处理',
    icon: Document,
    type: 'danger'
  },
  {
    label: '实时总负荷',
    value: globalKPI.value.totalLoad,
    unit: 'MW',
    subtext: `今日能耗 ${globalKPI.value.todayEnergy} MWh`,
    icon: TrendCharts,
    type: 'primary'
  }
])

let refreshTimer: number

const fetchData = async () => {
  try {
    const kpi = await getGlobalKPI()
    globalKPI.value = kpi
  } catch (error) {
    console.error('Failed to fetch global KPI:', error)
  }
}

onMounted(() => {
  fetchData()
  // 每30秒刷新一次KPI数据
  refreshTimer = setInterval(fetchData, 30000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<style scoped>
.page-container {
  width: 100%;
  padding: 0;
  margin: 0;
}

.integrated-ops-center {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  box-sizing: border-box;
}

/* ========== 顶部KPI卡片 ========== */
.top-kpi-section {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 10px;
}

.kpi-card {
  position: relative;
  background: var(--bg-panel-transparent);
  backdrop-filter: var(--backdrop-blur);
  border: 1px solid var(--border-dim);
  border-radius: var(--card-radius);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.kpi-card:hover {
  border-color: var(--tech-primary);
  background: rgba(0, 243, 255, 0.05);
  transform: translateY(-2px);
  box-shadow: var(--glow-box);
}

/* 卡片角标装饰 */
.card-corner {
  position: absolute;
  width: 8px;
  height: 8px;
  border: 2px solid var(--tech-primary);
  opacity: calc(0.3 * var(--tech-decoration-opacity));
  transition: opacity 0.3s;
}
.corner-tl {
  top: -1px;
  left: -1px;
  border-bottom: 0;
  border-right: 0;
  border-top-left-radius: var(--card-radius);
}
.corner-br {
  bottom: -1px;
  right: -1px;
  border-top: 0;
  border-left: 0;
  border-bottom-right-radius: var(--card-radius);
}
.kpi-card:hover .card-corner {
  opacity: var(--tech-decoration-opacity);
}

.kpi-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-success .kpi-icon {
  background: rgba(0, 230, 118, 0.1);
  color: var(--status-success);
}

.kpi-info .kpi-icon {
  background: rgba(0, 176, 255, 0.1);
  color: var(--status-info);
}

.kpi-warning .kpi-icon {
  background: rgba(255, 214, 0, 0.1);
  color: var(--status-warning);
}

.kpi-danger .kpi-icon {
  background: rgba(255, 46, 99, 0.1);
  color: var(--status-danger);
}

.kpi-primary .kpi-icon {
  background: rgba(0, 243, 255, 0.1);
  color: var(--tech-primary);
}

.kpi-info {
  flex: 1;
  min-width: 0;
}

.kpi-label {
  font-size: 12px;
  color: var(--text-sub);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kpi-value-group {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 2px;
}

.kpi-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-bright);
  font-family: 'DIN Alternate', 'Arial', sans-serif;
  line-height: 1;
}

.kpi-unit {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: normal;
}

.kpi-subtext {
  font-size: 11px;
  color: var(--text-muted);
}

/* ========== 主布局：左中右 ========== */
.main-layout {
  display: grid;
  grid-template-columns: 300px 1fr 360px;
  gap: 20px;
  height: 820px;
}

.left-panel,
.center-stage,
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
}

/* ========== 底部面板 ========== */
.bottom-panel {
  height: 280px;
}

/* ========== 响应式适配 ========== */
@media (max-width: 1600px) {
  .top-kpi-section {
    grid-template-columns: repeat(3, 1fr);
  }

  .main-layout {
    grid-template-columns: 280px 1fr 320px;
  }
}

@media (max-width: 1200px) {
  .top-kpi-section {
    grid-template-columns: repeat(2, 1fr);
  }

  .main-layout {
    grid-template-columns: 1fr;
  }

  .left-panel,
  .right-panel {
    order: 2;
  }

  .center-stage {
    order: 1;
  }
}
</style>
