<template>
  <div class="device-status-container">
    <div class="section-title">
      <div class="title-bar"></div>
      <span>设备运行状态</span>
    </div>
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

const chartRef = ref<HTMLElement>()
let chart: ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return

  chart = echarts.init(chartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(10, 25, 41, 0.9)',
      borderColor: 'rgba(33, 150, 243, 0.5)',
      textStyle: { color: '#fff' }
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#0a1929',
          borderWidth: 3
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n{c} 台',
          color: '#fff',
          fontSize: 12
        },
        labelLine: {
          show: true,
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.3)'
          }
        },
        data: [
          { value: 28, name: '正常运行', itemStyle: { color: '#46d39a', shadowBlur: 20, shadowColor: 'rgba(70, 211, 154, 0.5)' } },
          { value: 3, name: '告警', itemStyle: { color: '#ffb547', shadowBlur: 20, shadowColor: 'rgba(255, 181, 71, 0.5)' } },
          { value: 1, name: '故障', itemStyle: { color: '#ff5252', shadowBlur: 20, shadowColor: 'rgba(255, 82, 82, 0.5)' } },
          { value: 2, name: '离线', itemStyle: { color: '#8a9aa9', shadowBlur: 20, shadowColor: 'rgba(138, 154, 169, 0.5)' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 30,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  chart.setOption(option)
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => chart?.resize())
})

onUnmounted(() => {
  chart?.dispose()
  window.removeEventListener('resize', () => chart?.resize())
})
</script>

<style scoped>
.device-status-container {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(70, 211, 154, 0.05) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  height: 280px;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.title-bar {
  width: 4px;
  height: 18px;
  background: linear-gradient(180deg, #2196f3 0%, #46d39a 100%);
  border-radius: 2px;
  margin-right: 10px;
}

.chart {
  height: calc(100% - 45px);
}
</style>
