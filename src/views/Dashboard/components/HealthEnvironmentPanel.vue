<template>
  <div class="health-env-panel">
    <!-- 环境安防雷达 -->
    <div class="module-card">
      <div class="module-header">
        <div class="header-left">
          <el-icon><Warning /></el-icon>
          <span>环境安防态势</span>
        </div>
      </div>
      <div class="env-stats-grid">
        <div class="env-stat-item" :class="envStats.highTemp > 0 ? 'status-warning' : 'status-normal'">
          <div class="stat-icon"><el-icon><Sunny /></el-icon></div>
          <div class="stat-info">
            <div class="stat-label">高温预警</div>
            <div class="stat-value">{{ envStats.highTemp }}<span class="unit">站</span></div>
          </div>
        </div>
        <div class="env-stat-item" :class="envStats.waterLeak > 0 ? 'status-danger' : 'status-normal'">
          <div class="stat-icon"><el-icon><Drizzling /></el-icon></div>
          <div class="stat-info">
            <div class="stat-label">水浸告警</div>
            <div class="stat-value">{{ envStats.waterLeak }}<span class="unit">站</span></div>
          </div>
        </div>
        <div class="env-stat-item" :class="envStats.smoke > 0 ? 'status-danger' : 'status-normal'">
          <div class="stat-icon"><el-icon><Smoking /></el-icon></div>
          <div class="stat-info">
            <div class="stat-label">烟感告警</div>
            <div class="stat-value">{{ envStats.smoke }}<span class="unit">站</span></div>
          </div>
        </div>
        <div class="env-stat-item" :class="envStats.intrusion > 0 ? 'status-danger' : 'status-normal'">
          <div class="stat-icon"><el-icon><Lock /></el-icon></div>
          <div class="stat-info">
            <div class="stat-label">非法入侵</div>
            <div class="stat-value">{{ envStats.intrusion }}<span class="unit">站</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 设备健康度分布 -->
    <div class="module-card">
      <div class="module-header">
        <div class="header-left">
          <el-icon><PieChart /></el-icon>
          <span>设备负载分布</span>
        </div>
      </div>
      <div ref="healthChartRef" class="chart-container"></div>
      <div class="health-legend">
        <div class="legend-item">
          <span class="legend-dot" style="background: #00E676;"></span>
          <span class="legend-label">低负载(&lt;50%)</span>
          <span class="legend-value">{{ deviceHealth.lowLoad }}站</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background: #00B0FF;"></span>
          <span class="legend-label">中负载(50-80%)</span>
          <span class="legend-value">{{ deviceHealth.mediumLoad }}站</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background: #FFD600;"></span>
          <span class="legend-label">高负载(&gt;80%)</span>
          <span class="legend-value">{{ deviceHealth.highLoad }}站</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background: #FF2E63;"></span>
          <span class="legend-label">超负荷</span>
          <span class="legend-value">{{ deviceHealth.overLoad }}站</span>
        </div>
      </div>
    </div>

    <!-- 物资预警 -->
    <div class="module-card inventory-alert-card">
      <div class="module-header">
        <div class="header-left">
          <el-icon><Box /></el-icon>
          <span>物资预警</span>
        </div>
      </div>
      <div class="inventory-alert-content">
        <div class="alert-item">
          <el-icon class="alert-icon warning"><WarnTriangleFilled /></el-icon>
          <div class="alert-text">
            当前有 <span class="highlight-num warning">{{ inventoryAlert.lowStock }}</span> 类备件库存不足
          </div>
        </div>
        <div class="alert-item">
          <el-icon class="alert-icon danger"><Clock /></el-icon>
          <div class="alert-text">
            <span class="highlight-num danger">{{ inventoryAlert.expiringSoon }}</span> 类备件即将过期
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  Warning, Sunny, PieChart, Box, WarnTriangleFilled, Clock,
  Drizzling, Smoking, Lock
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import {
  getEnvSecurityStats,
  getDeviceHealthDist,
  getInventoryAlert,
  type EnvSecurityStats,
  type DeviceHealthDist,
  type InventoryAlert
} from '../../../api/integrated-ops'

const envStats = ref<EnvSecurityStats>({
  highTemp: 0,
  waterLeak: 0,
  smoke: 0,
  intrusion: 0
})

const deviceHealth = ref<DeviceHealthDist>({
  lowLoad: 0,
  mediumLoad: 0,
  highLoad: 0,
  overLoad: 0
})

const inventoryAlert = ref<InventoryAlert>({
  lowStock: 0,
  expiringSoon: 0
})

const healthChartRef = ref<HTMLElement>()
let healthChart: ECharts | null = null

const initHealthChart = () => {
  if (!healthChartRef.value) return
  healthChart = echarts.init(healthChartRef.value)

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(11, 19, 37, 0.9)',
      borderColor: '#00F3FF',
      textStyle: { color: '#fff' },
      formatter: '{b}: {c}站 ({d}%)'
    },
    series: [
      {
        name: '设备负载',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: 'rgba(11, 19, 37, 0.5)',
          borderWidth: 2
        },
        label: {
          show: false
        },
        labelLine: {
          show: false
        },
        data: [
          {
            value: deviceHealth.value.lowLoad,
            name: '低负载',
            itemStyle: { color: '#00E676' }
          },
          {
            value: deviceHealth.value.mediumLoad,
            name: '中负载',
            itemStyle: { color: '#00B0FF' }
          },
          {
            value: deviceHealth.value.highLoad,
            name: '高负载',
            itemStyle: { color: '#FFD600' }
          },
          {
            value: deviceHealth.value.overLoad,
            name: '超负荷',
            itemStyle: { color: '#FF2E63' }
          }
        ]
      }
    ]
  }

  healthChart.setOption(option)
}

const updateHealthChart = () => {
  if (!healthChart) return
  healthChart.setOption({
    series: [
      {
        data: [
          { value: deviceHealth.value.lowLoad, name: '低负载' },
          { value: deviceHealth.value.mediumLoad, name: '中负载' },
          { value: deviceHealth.value.highLoad, name: '高负载' },
          { value: deviceHealth.value.overLoad, name: '超负荷' }
        ]
      }
    ]
  })
}

const fetchData = async () => {
  try {
    const [env, health, inventory] = await Promise.all([
      getEnvSecurityStats(),
      getDeviceHealthDist(),
      getInventoryAlert()
    ])

    envStats.value = env
    deviceHealth.value = health
    inventoryAlert.value = inventory

    updateHealthChart()
  } catch (error) {
    console.error('Failed to fetch health environment data:', error)
  }
}

onMounted(() => {
  fetchData()
  initHealthChart()

  window.addEventListener('resize', () => {
    healthChart?.resize()
  })
})

onUnmounted(() => {
  healthChart?.dispose()
})
</script>

<style scoped>
.health-env-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.module-card {
  background: var(--bg-panel-transparent);
  backdrop-filter: var(--backdrop-blur);
  border: 1px solid var(--border-light);
  border-radius: var(--card-radius);
  padding: 20px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.module-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--line-grid);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-bright);
}

.header-left .el-icon {
  color: var(--tech-primary);
  font-size: 16px;
}

/* 环境统计网格 */
.env-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  max-height: 150px;
  overflow-y: auto;
}

.env-stat-item {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-dim);
  border-radius: 6px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
}

.env-stat-item.status-normal {
  border-color: rgba(0, 230, 118, 0.2);
}

.env-stat-item.status-warning {
  border-color: rgba(255, 214, 0, 0.3);
  background: rgba(255, 214, 0, 0.05);
}

.env-stat-item.status-danger {
  border-color: rgba(255, 46, 99, 0.3);
  background: rgba(255, 46, 99, 0.05);
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.status-normal .stat-icon {
  background: rgba(0, 230, 118, 0.1);
  color: var(--status-success);
}

.status-warning .stat-icon {
  background: rgba(255, 214, 0, 0.1);
  color: var(--status-warning);
}

.status-danger .stat-icon {
  background: rgba(255, 46, 99, 0.1);
  color: var(--status-danger);
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 11px;
  color: var(--text-sub);
  margin-bottom: 2px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-bright);
  font-family: 'DIN Alternate', sans-serif;
}

.stat-value .unit {
  font-size: 11px;
  font-weight: normal;
  color: var(--text-muted);
  margin-left: 2px;
}

/* 健康度图表 */
.chart-container {
  width: 100%;
  height: 200px;
  margin: 10px 0;
}

.health-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex-shrink: 0;
}

.legend-label {
  flex: 1;
  color: var(--text-sub);
}

.legend-value {
  color: var(--text-bright);
  font-weight: 600;
  font-family: 'DIN Alternate', sans-serif;
}

/* 物资预警卡片 */
.inventory-alert-card {
  flex-shrink: 0;
  flex-grow: 0;
  min-height: 140px;
  max-height: 160px;
  overflow: hidden;
}

.inventory-alert-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  max-height: 100px;
  padding-right: 4px;
}

/* 物资预警滚动条 */
.inventory-alert-content::-webkit-scrollbar {
  width: 4px;
}

.inventory-alert-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.inventory-alert-content::-webkit-scrollbar-thumb {
  background: var(--tech-primary);
  border-radius: 2px;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  border: 1px solid var(--border-dim);
}

.alert-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.alert-icon.warning {
  color: var(--status-warning);
}

.alert-icon.danger {
  color: var(--status-danger);
}

.alert-text {
  flex: 1;
  font-size: 13px;
  color: var(--text-main);
  line-height: 1.5;
}

.highlight-num {
  font-size: 16px;
  font-weight: 700;
  font-family: 'DIN Alternate', sans-serif;
  padding: 0 4px;
}

.highlight-num.warning {
  color: var(--status-warning);
}

.highlight-num.danger {
  color: var(--status-danger);
}
</style>
