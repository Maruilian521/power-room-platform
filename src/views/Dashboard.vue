<template>
  <div class="page-container">
    <div class="dashboard">
      <!-- 顶部 KPI 指标 -->
      <div class="grid grid-cols-4" style="margin-bottom: 20px;">
        <div class="stat-card-kpi" v-for="(stat, index) in kpiStats" :key="index">
          <div class="kpi-icon-wrapper" :class="stat.type">
            <el-icon :size="24"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="kpi-content">
            <div class="kpi-label">{{ stat.label }}</div>
            <div class="kpi-value-group">
              <span class="kpi-value">{{ stat.value }}</span>
              <span class="kpi-unit" v-if="stat.unit">{{ stat.unit }}</span>
            </div>
            <div class="kpi-sub-text">{{ stat.subText }}</div>
          </div>
          <!-- 装饰角标 -->
          <div class="card-corner corner-tr"></div>
          <div class="card-corner corner-bl"></div>
        </div>
      </div>

      <!-- 核心图表区域 -->
      <div class="grid grid-cols-3" style="margin-bottom: 20px;">
        <!-- 电压电流趋势 (占2列) -->
        <div class="module-card col-span-2">
          <div class="module-header">
            <div class="header-left">
              <el-icon><TrendCharts /></el-icon>
              <span>电压电流实时趋势</span>
            </div>
            <div class="header-right">
              <el-tag size="small" effect="dark" class="status-tag">实时监控中</el-tag>
            </div>
          </div>
          <div ref="voltageChartRef" class="chart-container big-chart"></div>
        </div>

        <!-- 实时数据监控仪表盘 -->
        <div class="module-card">
          <div class="module-header">
            <div class="header-left">
              <el-icon><Monitor /></el-icon>
              <span>实时数据监控</span>
            </div>
          </div>
          <div class="realtime-panel">
            <div class="panel-group">
              <div class="panel-title">三相电压 (V)</div>
              <div class="data-row">
                <div class="data-cell" v-for="(v, i) in ['A', 'B', 'C']" :key="v">
                  <span class="cell-label">{{ v }}相</span>
                  <span class="cell-value" :class="getValueStatusClass(realtimeData.voltage[i] || 0, 380, 420)">
                    {{ (realtimeData.voltage[i] || 0).toFixed(1) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="panel-divider"></div>

            <div class="panel-group">
              <div class="panel-title">三相电流 (A)</div>
              <div class="data-row">
                <div class="data-cell" v-for="(v, i) in ['A', 'B', 'C']" :key="v">
                  <span class="cell-label">{{ v }}相</span>
                  <span class="cell-value info">
                    {{ (realtimeData.current[i] || 0).toFixed(1) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="panel-divider"></div>

            <div class="panel-group horizontal">
              <div class="data-cell-lg">
                <span class="cell-label">总功率</span>
                <span class="cell-value warning">
                  {{ totalPower.toFixed(2) }} <span class="unit">kW</span>
                </span>
              </div>
              <div class="data-cell-lg">
                <span class="cell-label">平均温度</span>
                <span class="cell-value" :class="getTempStatusClass(avgTemp)">
                  {{ avgTemp.toFixed(1) }} <span class="unit">°C</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部统计 -->
      <div class="grid grid-cols-2">
        <div class="module-card">
          <div class="module-header">
            <div class="header-left">
              <el-icon><PieChart /></el-icon>
              <span>设备状态分布</span>
            </div>
          </div>
          <div ref="deviceStatusChartRef" class="chart-container"></div>
        </div>

        <div class="module-card">
          <div class="module-header">
            <div class="header-left">
              <el-icon><Histogram /></el-icon>
              <span>告警分类统计</span>
            </div>
          </div>
          <div ref="alarmChartRef" class="chart-container"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, toRefs, computed } from 'vue'
import { useDeviceStore } from '../stores/device'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { Monitor, Warning, Bell, Document, TrendCharts, PieChart, Histogram } from '@element-plus/icons-vue'

const deviceStore = useDeviceStore()
const { statistics, realtimeData } = toRefs(deviceStore)

// 计算属性
const totalPower = computed(() => {
  return (realtimeData.value.power[0] || 0) + (realtimeData.value.power[1] || 0) + (realtimeData.value.power[2] || 0)
})

const avgTemp = computed(() => {
  return ((realtimeData.value.temperature[0] || 0) + (realtimeData.value.temperature[1] || 0) + (realtimeData.value.temperature[2] || 0)) / 3
})

const kpiStats = computed(() => [
  { 
    label: '在线设备', 
    value: statistics.value.onlineDevices, 
    unit: '台',
    subText: `总设备: ${statistics.value.totalDevices}`,
    icon: Monitor, 
    type: 'success' 
  },
  { 
    label: '告警设备', 
    value: statistics.value.warningDevices, 
    unit: '台',
    subText: '需要关注',
    icon: Warning, 
    type: 'warning' 
  },
  { 
    label: '严重告警', 
    value: statistics.value.criticalAlarms, 
    unit: '条',
    subText: `总告警: ${statistics.value.totalAlarms}`,
    icon: Bell, 
    type: 'danger' 
  },
  { 
    label: '待处理工单', 
    value: statistics.value.pendingWorkOrders, 
    unit: '个',
    subText: `总工单: ${statistics.value.totalWorkOrders}`,
    icon: Document, 
    type: 'info' 
  }
])

const voltageChartRef = ref<HTMLElement>()
const deviceStatusChartRef = ref<HTMLElement>()
const alarmChartRef = ref<HTMLElement>()

let voltageChart: ECharts | null = null
let deviceStatusChart: ECharts | null = null
let alarmChart: ECharts | null = null
let realtimeTimer: number

// 初始化电压电流趋势图
const initVoltageChart = () => {
  if (!voltageChartRef.value) return

  voltageChart = echarts.init(voltageChartRef.value)

  const timeData: string[] = []
  const voltageData: number[] = []
  const currentData: number[] = []

  for (let i = 0; i < 24; i++) {
    timeData.push(`${i}:00`)
    voltageData.push(380 + Math.random() * 40)
    currentData.push(50 + Math.random() * 150)
  }

  const option = {
    backgroundColor: 'transparent',
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(11, 19, 37, 0.9)',
      borderColor: '#00F3FF',
      textStyle: { color: '#fff' }
    },
    legend: {
      data: ['电压', '电流'],
      textStyle: { color: '#94A3B8' },
      top: 0
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timeData,
      axisLine: { lineStyle: { color: 'rgba(0, 243, 255, 0.2)' } },
      axisLabel: { color: '#94A3B8' }
    },
    yAxis: [
      {
        type: 'value',
        name: '电压(V)',
        nameTextStyle: { color: '#94A3B8' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } },
        axisLabel: { color: '#94A3B8' }
      },
      {
        type: 'value',
        name: '电流(A)',
        nameTextStyle: { color: '#94A3B8' },
        splitLine: { show: false },
        axisLabel: { color: '#94A3B8' }
      }
    ],
    series: [
      {
        name: '电压',
        type: 'line',
        data: voltageData,
        smooth: true,
        itemStyle: { color: '#00E676' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 230, 118, 0.3)' },
            { offset: 1, color: 'rgba(0, 230, 118, 0.05)' }
          ])
        }
      },
      {
        name: '电流',
        type: 'line',
        yAxisIndex: 1,
        data: currentData,
        smooth: true,
        itemStyle: { color: '#00F3FF' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 243, 255, 0.3)' },
            { offset: 1, color: 'rgba(0, 243, 255, 0.05)' }
          ])
        }
      }
    ]
  }

  voltageChart.setOption(option)
}

// 初始化设备状态图
const initDeviceStatusChart = () => {
  if (!deviceStatusChartRef.value) return
  deviceStatusChart = echarts.init(deviceStatusChartRef.value)
  updateDeviceStatusChart()
}

const updateDeviceStatusChart = () => {
  if (!deviceStatusChart) return
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(11, 19, 37, 0.9)',
      borderColor: '#00F3FF',
      textStyle: { color: '#fff' }
    },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
      textStyle: { color: '#94A3B8' },
      itemWidth: 10,
      itemHeight: 10
    },
    series: [
      {
        name: '设备状态',
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 5,
          borderColor: '#0B1325',
          borderWidth: 2
        },
        label: { show: false },
        labelLine: { show: false },
        data: [
          { value: statistics.value.onlineDevices, name: '在线', itemStyle: { color: '#00E676' } },
          { value: statistics.value.warningDevices, name: '告警', itemStyle: { color: '#FFD600' } },
          { value: statistics.value.offlineDevices, name: '离线', itemStyle: { color: '#94A3B8' } }
        ]
      }
    ]
  }
  deviceStatusChart.setOption(option)
}

// 初始化告警统计图
const initAlarmChart = () => {
  if (!alarmChartRef.value) return
  alarmChart = echarts.init(alarmChartRef.value)
  updateAlarmChart()
}

const updateAlarmChart = () => {
  if (!alarmChart) return
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(11, 19, 37, 0.9)',
      borderColor: '#00F3FF',
      textStyle: { color: '#fff' }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['严重', '告警', '信息'],
      axisLine: { lineStyle: { color: 'rgba(0, 243, 255, 0.2)' } },
      axisLabel: { color: '#94A3B8' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } },
      axisLabel: { color: '#94A3B8' }
    },
    series: [
      {
        name: '告警数量',
        type: 'bar',
        barWidth: '30%',
        data: [
          { value: statistics.value.criticalAlarms, itemStyle: { color: '#FF2E63' } },
          { value: statistics.value.warningAlarms, itemStyle: { color: '#FFD600' } },
          { value: statistics.value.infoAlarms, itemStyle: { color: '#00B0FF' } }
        ],
        label: { show: true, position: 'top', color: '#E2E8F0' }
      }
    ]
  }
  alarmChart.setOption(option)
}

// 辅助函数
const getValueStatusClass = (value: number, min: number, max: number) => {
  if (value < min || value > max) return 'danger'
  if (value < min + 5 || value > max - 5) return 'warning'
  return 'success'
}

const getTempStatusClass = (temp: number) => {
  if (temp > 60) return 'danger'
  if (temp > 50) return 'warning'
  return 'success'
}

watch(() => statistics.value, () => {
  updateDeviceStatusChart()
  updateAlarmChart()
}, { deep: true })

onMounted(async () => {
  await deviceStore.fetchStatistics()
  await deviceStore.fetchRealtimeData()

  initVoltageChart()
  initDeviceStatusChart()
  initAlarmChart()

  window.addEventListener('resize', () => {
    voltageChart?.resize()
    deviceStatusChart?.resize()
    alarmChart?.resize()
  })

  realtimeTimer = setInterval(() => {
    deviceStore.fetchRealtimeData()
    deviceStore.fetchStatistics()
  }, 5000)
})

onUnmounted(() => {
  voltageChart?.dispose()
  deviceStatusChart?.dispose()
  alarmChart?.dispose()
  if (realtimeTimer) clearInterval(realtimeTimer)
  window.removeEventListener('resize', () => {})
})
</script>

<style scoped>
/* 通用卡片 (复用 AIBrain 样式) */
.module-card {
  background: var(--bg-panel-transparent);
  backdrop-filter: var(--backdrop-blur);
  border: 1px solid var(--border-light);
  border-radius: var(--card-radius);
  padding: 24px;
  box-shadow: var(--shadow-card);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.module-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line-grid);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-bright);
}

.header-left .el-icon {
  color: var(--tech-primary);
  font-size: 18px;
}

.col-span-2 {
  grid-column: span 2;
}

/* 顶部 KPI 卡片 */
.stat-card-kpi {
  position: relative;
  background: var(--bg-panel-transparent);
  border: 1px solid var(--border-dim);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
  border-radius: var(--card-radius);
}

.stat-card-kpi:hover {
  border-color: var(--tech-primary);
  background: rgba(0,243,255,0.05);
  transform: translateY(-4px);
  box-shadow: var(--glow-box);
}

/* 装饰角标 */
.card-corner {
  position: absolute;
  width: 8px;
  height: 8px;
  border: 2px solid var(--tech-primary);
  opacity: calc(0.3 * var(--tech-decoration-opacity));
  transition: opacity 0.3s;
}
.corner-tr { top: -1px; right: -1px; border-bottom: 0; border-left: 0; border-top-right-radius: var(--card-radius); }
.corner-bl { bottom: -1px; left: -1px; border-top: 0; border-right: 0; border-bottom-left-radius: var(--card-radius); }
.stat-card-kpi:hover .card-corner { opacity: var(--tech-decoration-opacity); }

.kpi-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.05);
}

.kpi-icon-wrapper.success { color: var(--status-success); background: rgba(0,230,118,0.1); }
.kpi-icon-wrapper.warning { color: var(--status-warning); background: rgba(255,214,0,0.1); }
.kpi-icon-wrapper.danger { color: var(--status-danger); background: rgba(255,46,99,0.1); }
.kpi-icon-wrapper.info { color: var(--status-info); background: rgba(0,176,255,0.1); }

.kpi-content { flex: 1; }
.kpi-label { font-size: 13px; color: var(--text-sub); margin-bottom: 4px; }
.kpi-value { font-size: 28px; font-weight: 700; color: var(--text-bright); font-family: 'DIN Alternate', sans-serif; }
.kpi-unit { font-size: 12px; color: var(--text-muted); margin-left: 4px; }
.kpi-sub-text { font-size: 12px; color: var(--text-muted); margin-top: 4px; }

/* 图表容器 */
.chart-container {
  flex: 1;
  min-height: 250px;
  width: 100%;
}
.big-chart { min-height: 350px; }

/* 实时数据面板 */
.realtime-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 10px;
  height: 100%;
  justify-content: center;
}

.panel-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-group.horizontal {
  flex-direction: row;
  justify-content: space-around;
}

.panel-title {
  font-size: 12px;
  color: var(--tech-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.data-row {
  display: flex;
  justify-content: space-between;
  background: rgba(0,0,0,0.2);
  padding: 12px;
  border-radius: 4px;
  border: 1px solid rgba(255,255,255,0.05);
}

.data-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.cell-label { font-size: 12px; color: var(--text-sub); }
.cell-value { font-size: 18px; font-weight: 600; color: var(--text-bright); font-family: 'DIN Alternate', sans-serif; }
.cell-value.success { color: var(--status-success); text-shadow: 0 0 10px rgba(0,230,118,0.3); }
.cell-value.warning { color: var(--status-warning); text-shadow: 0 0 10px rgba(255,214,0,0.3); }
.cell-value.danger { color: var(--status-danger); text-shadow: 0 0 10px rgba(255,46,99,0.3); }
.cell-value.info { color: var(--tech-primary); text-shadow: 0 0 10px rgba(0,243,255,0.3); }

.data-cell-lg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.data-cell-lg .cell-value { font-size: 24px; }
.unit { font-size: 12px; opacity: 0.7; font-weight: normal; }

.panel-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .col-span-2 { grid-column: span 3; }
  .grid-cols-3 { grid-template-columns: 1fr; }
  .grid-cols-4 { grid-template-columns: repeat(2, 1fr); }
}
</style>