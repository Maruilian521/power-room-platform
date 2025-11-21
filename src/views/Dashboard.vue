<template>
  <div class="page-container">
    <div class="dashboard">
      <!-- 统计卡片 -->
      <div class="grid grid-cols-4" style="margin-bottom: 20px;">
        <div class="stat-card success">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">在线设备</div>
              <div style="font-size: 28px; font-weight: 700; color: var(--color-success);">
                {{ statistics.onlineDevices }}
              </div>
              <div style="color: var(--text-tertiary); font-size: 12px; margin-top: 4px;">
                总数: {{ statistics.totalDevices }}
              </div>
            </div>
            <el-icon size="48" color="rgba(70, 211, 154, 0.3)"><Monitor /></el-icon>
          </div>
        </div>

        <div class="stat-card warning">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">告警设备</div>
              <div style="font-size: 28px; font-weight: 700; color: var(--color-warning);">
                {{ statistics.warningDevices }}
              </div>
              <div style="color: var(--text-tertiary); font-size: 12px; margin-top: 4px;">
                需要关注
              </div>
            </div>
            <el-icon size="48" color="rgba(255, 181, 71, 0.3)"><Warning /></el-icon>
          </div>
        </div>

        <div class="stat-card danger">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">严重告警</div>
              <div style="font-size: 28px; font-weight: 700; color: var(--color-danger);">
                {{ statistics.criticalAlarms }}
              </div>
              <div style="color: var(--text-tertiary); font-size: 12px; margin-top: 4px;">
                总告警: {{ statistics.totalAlarms }}
              </div>
            </div>
            <el-icon size="48" color="rgba(255, 82, 82, 0.3)"><Bell /></el-icon>
          </div>
        </div>

        <div class="stat-card info">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">待处理工单</div>
              <div style="font-size: 28px; font-weight: 700; color: var(--color-info);">
                {{ statistics.pendingWorkOrders }}
              </div>
              <div style="color: var(--text-tertiary); font-size: 12px; margin-top: 4px;">
                总工单: {{ statistics.totalWorkOrders }}
              </div>
            </div>
            <el-icon size="48" color="rgba(33, 150, 243, 0.3)"><Document /></el-icon>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="grid grid-cols-2" style="margin-bottom: 20px;">
        <div class="card">
          <div class="card-title">电压电流趋势</div>
          <div ref="voltageChartRef" class="chart-container"></div>
        </div>

        <div class="card">
          <div class="card-title">设备状态分布</div>
          <div ref="deviceStatusChartRef" class="chart-container"></div>
        </div>
      </div>

      <div class="grid grid-cols-2">
        <div class="card">
          <div class="card-title">告警统计</div>
          <div ref="alarmChartRef" class="chart-container"></div>
        </div>

        <div class="card">
          <div class="card-title">实时数据监控</div>
          <div style="padding: 20px;">
            <div class="data-item">
              <span class="data-label">A相电压</span>
              <span class="data-value" :style="{ color: getValueColor(realtimeData.voltage[0] ?? 0, 380, 420) }">
                {{ realtimeData.voltage[0] || 0 }} V
              </span>
            </div>
            <div class="data-item">
              <span class="data-label">B相电压</span>
              <span class="data-value" :style="{ color: getValueColor(realtimeData.voltage[1] ?? 0, 380, 420) }">
                {{ realtimeData.voltage[1] || 0 }} V
              </span>
            </div>
            <div class="data-item">
              <span class="data-label">C相电压</span>
              <span class="data-value" :style="{ color: getValueColor(realtimeData.voltage[2] ?? 0, 380, 420) }">
                {{ realtimeData.voltage[2] || 0 }} V
              </span>
            </div>
            <div class="data-item">
              <span class="data-label">A相电流</span>
              <span class="data-value" style="color: var(--color-info)">
                {{ realtimeData.current[0] || 0 }} A
              </span>
            </div>
            <div class="data-item">
              <span class="data-label">B相电流</span>
              <span class="data-value" style="color: var(--color-info)">
                {{ realtimeData.current[1] || 0 }} A
              </span>
            </div>
            <div class="data-item">
              <span class="data-label">C相电流</span>
              <span class="data-value" style="color: var(--color-info)">
                {{ realtimeData.current[2] || 0 }} A
              </span>
            </div>
            <div class="data-item">
              <span class="data-label">总功率</span>
              <span class="data-value" style="color: var(--color-warning)">
                {{ ((realtimeData.power[0] || 0) + (realtimeData.power[1] || 0) + (realtimeData.power[2] || 0)).toFixed(2) }} kW
              </span>
            </div>
            <div class="data-item">
              <span class="data-label">平均温度</span>
              <span class="data-value" :style="{ color: getTempColor(((realtimeData.temperature[0] ?? 0) + (realtimeData.temperature[1] ?? 0) + (realtimeData.temperature[2] ?? 0)) / 3) }">
                {{ (((realtimeData.temperature[0] || 0) + (realtimeData.temperature[1] || 0) + (realtimeData.temperature[2] || 0)) / 3).toFixed(1) }} °C
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, toRefs } from 'vue'
import { useDeviceStore } from '../stores/device'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { Monitor, Warning, Bell, Document } from '@element-plus/icons-vue'

const deviceStore = useDeviceStore()
const { statistics, realtimeData } = toRefs(deviceStore)

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

  // 生成24小时数据
  for (let i = 0; i < 24; i++) {
    timeData.push(`${i}:00`)
    voltageData.push(380 + Math.random() * 40)
    currentData.push(50 + Math.random() * 150)
  }

  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(19, 47, 76, 0.9)',
      borderColor: '#2d4d68',
      textStyle: {
        color: '#ffffff'
      }
    },
    legend: {
      data: ['电压', '电流'],
      textStyle: {
        color: '#b2bac2'
      },
      top: '0'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timeData,
      axisLine: {
        lineStyle: {
          color: '#2d4d68'
        }
      },
      axisLabel: {
        color: '#8a9aa9'
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '电压(V)',
        nameTextStyle: {
          color: '#b2bac2'
        },
        axisLine: {
          lineStyle: {
            color: '#2d4d68'
          }
        },
        splitLine: {
          lineStyle: {
            color: '#2d4d68',
            type: 'dashed'
          }
        },
        axisLabel: {
          color: '#8a9aa9'
        }
      },
      {
        type: 'value',
        name: '电流(A)',
        nameTextStyle: {
          color: '#b2bac2'
        },
        axisLine: {
          lineStyle: {
            color: '#2d4d68'
          }
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          color: '#8a9aa9'
        }
      }
    ],
    series: [
      {
        name: '电压',
        type: 'line',
        data: voltageData,
        smooth: true,
        itemStyle: {
          color: '#46d39a'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(70, 211, 154, 0.3)' },
            { offset: 1, color: 'rgba(70, 211, 154, 0.05)' }
          ])
        }
      },
      {
        name: '电流',
        type: 'line',
        yAxisIndex: 1,
        data: currentData,
        smooth: true,
        itemStyle: {
          color: '#2196f3'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(33, 150, 243, 0.3)' },
            { offset: 1, color: 'rgba(33, 150, 243, 0.05)' }
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

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(19, 47, 76, 0.9)',
      borderColor: '#2d4d68',
      textStyle: {
        color: '#ffffff'
      }
    },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
      textStyle: {
        color: '#b2bac2'
      }
    },
    series: [
      {
        name: '设备状态',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#0a1929',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#ffffff'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: statistics.value.onlineDevices, name: '在线', itemStyle: { color: '#46d39a' } },
          { value: statistics.value.warningDevices, name: '告警', itemStyle: { color: '#ffb547' } },
          { value: statistics.value.offlineDevices, name: '离线', itemStyle: { color: '#8a9aa9' } }
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

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(19, 47, 76, 0.9)',
      borderColor: '#2d4d68',
      textStyle: {
        color: '#ffffff'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['严重', '告警', '信息'],
      axisLine: {
        lineStyle: {
          color: '#2d4d68'
        }
      },
      axisLabel: {
        color: '#8a9aa9'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#2d4d68'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#2d4d68',
          type: 'dashed'
        }
      },
      axisLabel: {
        color: '#8a9aa9'
      }
    },
    series: [
      {
        name: '告警数量',
        type: 'bar',
        barWidth: '40%',
        data: [
          { value: statistics.value.criticalAlarms, itemStyle: { color: '#ff5252' } },
          { value: statistics.value.warningAlarms, itemStyle: { color: '#ffb547' } },
          { value: statistics.value.infoAlarms, itemStyle: { color: '#2196f3' } }
        ],
        label: {
          show: true,
          position: 'top',
          color: '#ffffff'
        }
      }
    ]
  }

  alarmChart.setOption(option)
}

// 获取电压颜色
const getValueColor = (value: number, min: number, max: number) => {
  if (value < min || value > max) {
    return 'var(--color-danger)'
  }
  if (value < min + 5 || value > max - 5) {
    return 'var(--color-warning)'
  }
  return 'var(--color-success)'
}

// 获取温度颜色
const getTempColor = (temp: number) => {
  if (temp > 60) return 'var(--color-danger)'
  if (temp > 50) return 'var(--color-warning)'
  return 'var(--color-success)'
}

// 监听统计数据变化，更新图表
watch(() => statistics.value, () => {
  if (deviceStatusChart) {
    deviceStatusChart.setOption({
      series: [{
        data: [
          { value: statistics.value.onlineDevices, name: '在线', itemStyle: { color: '#46d39a' } },
          { value: statistics.value.warningDevices, name: '告警', itemStyle: { color: '#ffb547' } },
          { value: statistics.value.offlineDevices, name: '离线', itemStyle: { color: '#8a9aa9' } }
        ]
      }]
    })
  }

  if (alarmChart) {
    alarmChart.setOption({
      series: [{
        data: [
          { value: statistics.value.criticalAlarms, itemStyle: { color: '#ff5252' } },
          { value: statistics.value.warningAlarms, itemStyle: { color: '#ffb547' } },
          { value: statistics.value.infoAlarms, itemStyle: { color: '#2196f3' } }
        ]
      }]
    })
  }
}, { deep: true })

onMounted(async () => {
  // 加载初始数据
  await deviceStore.fetchStatistics()
  await deviceStore.fetchRealtimeData()

  // 初始化图表
  initVoltageChart()
  initDeviceStatusChart()
  initAlarmChart()

  // 窗口resize时重新渲染图表
  window.addEventListener('resize', () => {
    voltageChart?.resize()
    deviceStatusChart?.resize()
    alarmChart?.resize()
  })

  // 定时更新实时数据
  realtimeTimer = setInterval(() => {
    deviceStore.fetchRealtimeData()
    deviceStore.fetchStatistics()
  }, 5000)
})

onUnmounted(() => {
  voltageChart?.dispose()
  deviceStatusChart?.dispose()
  alarmChart?.dispose()

  if (realtimeTimer) {
    clearInterval(realtimeTimer)
  }

  window.removeEventListener('resize', () => {})
})
</script>

<style scoped>
.dashboard {
  animation: fadeIn 0.5s ease-out;
}
</style>
