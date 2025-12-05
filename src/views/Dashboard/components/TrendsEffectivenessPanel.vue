<template>
  <div class="trends-effectiveness-panel">
    <!-- 全网负荷/能耗趋势 -->
    <div class="module-card trend-chart-card">
      <div class="module-header">
        <div class="header-left">
          <el-icon><TrendCharts /></el-icon>
          <span>全网负荷/能耗趋势（24小时）</span>
        </div>
        <div class="header-right">
          <el-radio-group v-model="chartMode" size="small">
            <el-radio-button label="load">负荷</el-radio-button>
            <el-radio-button label="energy">能耗</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <div ref="trendChartRef" class="trend-chart-container"></div>
    </div>

    <!-- 巡检完成率 + 关键指标 -->
    <div class="module-card inspection-progress-card">
      <div class="module-header">
        <div class="header-left">
          <el-icon><CircleCheck /></el-icon>
          <span>巡检完成率</span>
        </div>
      </div>
      <div class="inspection-content">
        <div class="progress-ring-wrapper">
          <div class="progress-ring">
            <svg width="120" height="120">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                stroke-width="8"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="url(#gradient)"
                stroke-width="8"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="progressOffset"
                stroke-linecap="round"
                transform="rotate(-90 60 60)"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#00E676;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#00F3FF;stop-opacity:1" />
                </linearGradient>
              </defs>
            </svg>
            <div class="progress-text">
              <div class="progress-value">{{ inspectionProgress.completionRate }}%</div>
              <div class="progress-label">完成率</div>
            </div>
          </div>
        </div>

        <div class="progress-stats">
          <div class="stat-item">
            <div class="stat-label">计划巡检</div>
            <div class="stat-value">{{ inspectionProgress.totalPlanned }}<span class="unit">站</span></div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-label">已完成</div>
            <div class="stat-value success">{{ inspectionProgress.completed }}<span class="unit">站</span></div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-label">剩余</div>
            <div class="stat-value warning">{{ inspectionProgress.totalPlanned - inspectionProgress.completed }}<span class="unit">站</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { TrendCharts, CircleCheck } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import {
  getLoadTrend,
  getInspectionProgress,
  type LoadTrend,
  type InspectionProgress
} from '../../../api/integrated-ops'

const chartMode = ref<'load' | 'energy'>('load')
const loadTrend = ref<LoadTrend[]>([])
const inspectionProgress = ref<InspectionProgress>({
  totalPlanned: 0,
  completed: 0,
  completionRate: 0
})

const trendChartRef = ref<HTMLElement>()
let trendChart: ECharts | null = null

// 圆形进度条计算
const circumference = 2 * Math.PI * 52
const progressOffset = computed(() => {
  return circumference - (inspectionProgress.value.completionRate / 100) * circumference
})

const initTrendChart = () => {
  if (!trendChartRef.value) return
  trendChart = echarts.init(trendChartRef.value)
  updateTrendChart()
}

const updateTrendChart = () => {
  if (!trendChart || loadTrend.value.length === 0) return

  const timeData = loadTrend.value.map(d => d.time)
  const loadData = loadTrend.value.map(d => d.load)
  const energyData = loadTrend.value.map(d => d.energy)

  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(11, 19, 37, 0.95)',
      borderColor: '#00F3FF',
      borderWidth: 1,
      textStyle: { color: '#fff' },
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#0B1325'
        }
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timeData,
      axisLine: { lineStyle: { color: 'rgba(0, 243, 255, 0.2)' } },
      axisLabel: { color: '#94A3B8', fontSize: 11 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: chartMode.value === 'load' ? '负荷(MW)' : '能耗(MWh)',
      nameTextStyle: { color: '#94A3B8', fontSize: 12 },
      splitLine: {
        lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' }
      },
      axisLabel: { color: '#94A3B8', fontSize: 11 }
    },
    series: [
      {
        name: chartMode.value === 'load' ? '负荷' : '能耗',
        type: 'line',
        data: chartMode.value === 'load' ? loadData : energyData,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#00F3FF' },
            { offset: 1, color: '#00E676' }
          ])
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 243, 255, 0.3)' },
            { offset: 1, color: 'rgba(0, 230, 118, 0.05)' }
          ])
        }
      }
    ]
  }

  trendChart.setOption(option)
}

watch(chartMode, () => {
  updateTrendChart()
})

const fetchData = async () => {
  try {
    const [trend, progress] = await Promise.all([
      getLoadTrend(),
      getInspectionProgress()
    ])

    loadTrend.value = trend
    inspectionProgress.value = progress

    initTrendChart()
  } catch (error) {
    console.error('Failed to fetch trends data:', error)
  }
}

onMounted(() => {
  fetchData()

  window.addEventListener('resize', () => {
    trendChart?.resize()
  })
})

onUnmounted(() => {
  trendChart?.dispose()
})
</script>

<style scoped>
.trends-effectiveness-panel {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
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
  font-size: 16px;
  font-weight: 600;
  color: var(--text-bright);
}

.header-left .el-icon {
  color: var(--tech-primary);
  font-size: 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ========== 趋势图表 ========== */
.trend-chart-card {
  flex: 1;
}

.trend-chart-container {
  flex: 1;
  width: 100%;
  min-height: 200px;
}

/* ========== 巡检进度 ========== */
.inspection-progress-card {
  width: 380px;
}

.inspection-content {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 10px 0;
}

.progress-ring-wrapper {
  flex-shrink: 0;
}

.progress-ring {
  position: relative;
  width: 120px;
  height: 120px;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-bright);
  font-family: 'DIN Alternate', sans-serif;
  line-height: 1;
  margin-bottom: 4px;
}

.progress-label {
  font-size: 11px;
  color: var(--text-sub);
}

.progress-stats {
  flex: 1;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-sub);
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-bright);
  font-family: 'DIN Alternate', sans-serif;
}

.stat-value.success {
  color: var(--status-success);
}

.stat-value.warning {
  color: var(--status-warning);
}

.stat-value .unit {
  font-size: 11px;
  font-weight: normal;
  color: var(--text-muted);
  margin-left: 2px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: linear-gradient(180deg, transparent, var(--line-grid), transparent);
}

/* ========== 响应式 ========== */
@media (max-width: 1400px) {
  .trends-effectiveness-panel {
    grid-template-columns: 1fr;
  }

  .inspection-progress-card {
    width: 100%;
  }
}
</style>
