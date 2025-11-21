<template>
  <div class="ai-warning-container">
    <div class="section-title">
      <div class="title-bar"></div>
      <span>AI智能预警</span>
      <div class="ai-badge">
        <span class="ai-icon">🧠</span>
        <span>AI</span>
      </div>
    </div>

    <div class="warning-content">
      <!-- 预测性维护 -->
      <div class="warning-card predictive">
        <div class="card-header">
          <span class="card-icon">🔮</span>
          <span class="card-title">预测性维护</span>
        </div>
        <div class="prediction-item">
          <div class="prediction-text">
            <span class="device-name">3号断路器</span>
            <span class="prediction-desc">预计 15 天后需检修</span>
          </div>
          <div class="confidence-bar">
            <div class="confidence-fill" style="width: 92%"></div>
            <span class="confidence-text">置信度: 92%</span>
          </div>
        </div>
        <div class="prediction-item">
          <div class="prediction-text">
            <span class="device-name">主变压器</span>
            <span class="prediction-desc">温升趋势异常</span>
          </div>
          <div class="confidence-bar">
            <div class="confidence-fill warning" style="width: 85%"></div>
            <span class="confidence-text">置信度: 85%</span>
          </div>
        </div>
      </div>

      <!-- 负荷预测 -->
      <div class="warning-card forecast">
        <div class="card-header">
          <span class="card-icon">📈</span>
          <span class="card-title">负荷预测</span>
        </div>
        <div ref="forecastChartRef" class="mini-chart"></div>
        <div class="forecast-summary">
          <div class="summary-item">
            <span class="label">峰值预测:</span>
            <span class="value peak">9850 kW</span>
          </div>
          <div class="summary-item">
            <span class="label">预测时间:</span>
            <span class="value">14:00</span>
          </div>
        </div>
      </div>

      <!-- 优化建议 -->
      <div class="warning-card suggestions">
        <div class="card-header">
          <span class="card-icon">💡</span>
          <span class="card-title">优化建议</span>
        </div>
        <div class="suggestion-list">
          <div class="suggestion-item">
            <div class="suggestion-badge priority-high">高</div>
            <div class="suggestion-content">
              <div class="suggestion-title">电容补偿优化</div>
              <div class="suggestion-desc">建议在凌晨2-4点启动电容补偿，可提升功率因数至0.98</div>
            </div>
          </div>
          <div class="suggestion-item">
            <div class="suggestion-badge priority-medium">中</div>
            <div class="suggestion-content">
              <div class="suggestion-title">负荷调整</div>
              <div class="suggestion-desc">18:00-20:00负荷较高，建议错峰使用部分设备</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

const forecastChartRef = ref<HTMLElement>()
let forecastChart: ECharts | null = null

const initForecastChart = () => {
  if (!forecastChartRef.value) return

  forecastChart = echarts.init(forecastChartRef.value)

  const hours = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`)
  const actualData = Array.from({ length: 8 }, () => Math.floor(8000 + Math.random() * 1500))
  const forecastData = Array.from({ length: 4 }, () => Math.floor(8500 + Math.random() * 1500))

  const option = {
    grid: {
      left: '8%',
      right: '5%',
      bottom: '12%',
      top: '10%'
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 25, 41, 0.9)',
      borderColor: 'rgba(33, 150, 243, 0.5)',
      textStyle: { color: '#fff', fontSize: 11 }
    },
    xAxis: {
      type: 'category',
      data: hours,
      axisLine: {
        lineStyle: { color: 'rgba(255, 255, 255, 0.2)' }
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 9,
        interval: 2
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)',
          type: 'dashed'
        }
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 9
      }
    },
    series: [
      {
        name: '实际负荷',
        type: 'line',
        data: [...actualData, null, null, null, null],
        smooth: true,
        lineStyle: { color: '#2196f3', width: 2 },
        itemStyle: { color: '#2196f3' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(33, 150, 243, 0.3)' },
            { offset: 1, color: 'rgba(33, 150, 243, 0.05)' }
          ])
        }
      },
      {
        name: '预测负荷',
        type: 'line',
        data: [null, null, null, null, null, null, null, null, ...forecastData],
        smooth: true,
        lineStyle: { color: '#ffb547', width: 2, type: 'dashed' },
        itemStyle: { color: '#ffb547' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 181, 71, 0.2)' },
            { offset: 1, color: 'rgba(255, 181, 71, 0.05)' }
          ])
        }
      }
    ]
  }

  forecastChart.setOption(option)
}

onMounted(() => {
  initForecastChart()
  window.addEventListener('resize', () => forecastChart?.resize())
})

onUnmounted(() => {
  forecastChart?.dispose()
  window.removeEventListener('resize', () => forecastChart?.resize())
})
</script>

<style scoped>
.ai-warning-container {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(70, 211, 154, 0.05) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  height: 520px;
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

.ai-badge {
  margin-left: auto;
  padding: 4px 10px;
  background: linear-gradient(135deg, #ff006e 0%, #7b2ff7 100%);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
  animation: pulse 2s ease-in-out infinite;
}

.ai-icon {
  font-size: 14px;
}

.warning-content {
  height: calc(100% - 45px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(33, 150, 243, 0.3) transparent;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.warning-card {
  background: rgba(10, 25, 41, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 15px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.card-icon {
  font-size: 18px;
}

.prediction-item {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.prediction-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.prediction-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.device-name {
  color: #2196f3;
  font-weight: 600;
  font-size: 13px;
}

.prediction-desc {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

.confidence-bar {
  height: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  background: linear-gradient(90deg, #2196f3 0%, #46d39a 100%);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.confidence-fill.warning {
  background: linear-gradient(90deg, #ffb547 0%, #ff8c00 100%);
}

.confidence-text {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  color: #fff;
  font-weight: 600;
}

.mini-chart {
  height: 120px;
  margin-bottom: 10px;
}

.forecast-summary {
  display: flex;
  gap: 15px;
}

.summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-item .label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.summary-item .value {
  font-size: 14px;
  font-weight: 700;
  color: #2196f3;
  font-family: 'DIN Alternate', 'Arial', sans-serif;
}

.summary-item .value.peak {
  color: #ffb547;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.suggestion-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border-left: 3px solid transparent;
  transition: all 0.3s ease;
}

.suggestion-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-left-color: #2196f3;
}

.suggestion-badge {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
}

.suggestion-badge.priority-high {
  background: rgba(255, 82, 82, 0.2);
  color: #ff5252;
  border: 1px solid rgba(255, 82, 82, 0.3);
}

.suggestion-badge.priority-medium {
  background: rgba(255, 181, 71, 0.2);
  color: #ffb547;
  border: 1px solid rgba(255, 181, 71, 0.3);
}

.suggestion-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.suggestion-title {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}

.suggestion-desc {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 0, 110, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(255, 0, 110, 0);
  }
}
</style>
