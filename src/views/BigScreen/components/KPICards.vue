<template>
  <div class="kpi-container">
    <div class="section-title">
      <div class="title-bar"></div>
      <span>关键运行指标</span>
    </div>

    <div class="kpi-grid">
      <!-- 电压 -->
      <div class="kpi-card voltage">
        <div class="kpi-icon">⚡</div>
        <div class="kpi-content">
          <div class="kpi-label">电压</div>
          <div class="kpi-value">{{ kpiData.voltage }}</div>
          <div class="kpi-unit">kV</div>
          <div class="kpi-status" :class="getStatus(kpiData.voltage, 9.5, 10.5)">
            {{ getStatusText(kpiData.voltage, 9.5, 10.5) }}
          </div>
        </div>
        <div class="kpi-progress">
          <div class="progress-bar" :style="{ width: (kpiData.voltage / 12 * 100) + '%' }"></div>
        </div>
      </div>

      <!-- 电流 -->
      <div class="kpi-card current">
        <div class="kpi-icon">⚙️</div>
        <div class="kpi-content">
          <div class="kpi-label">电流</div>
          <div class="kpi-value">{{ kpiData.current }}</div>
          <div class="kpi-unit">A</div>
          <div class="kpi-status normal">正常</div>
        </div>
        <div class="kpi-progress">
          <div class="progress-bar" :style="{ width: (kpiData.current / 1000 * 100) + '%' }"></div>
        </div>
      </div>

      <!-- 功率 -->
      <div class="kpi-card power">
        <div class="kpi-icon">🔋</div>
        <div class="kpi-content">
          <div class="kpi-label">有功功率</div>
          <div class="kpi-value">{{ kpiData.power }}</div>
          <div class="kpi-unit">kW</div>
          <div class="kpi-status normal">{{ kpiData.loadRate }}% 负载</div>
        </div>
        <div class="kpi-progress">
          <div class="progress-bar" :style="{ width: kpiData.loadRate + '%' }"></div>
        </div>
      </div>

      <!-- 功率因数 -->
      <div class="kpi-card pf">
        <div class="kpi-icon">📊</div>
        <div class="kpi-content">
          <div class="kpi-label">功率因数</div>
          <div class="kpi-value">{{ kpiData.powerFactor }}</div>
          <div class="kpi-unit"></div>
          <div class="kpi-status" :class="kpiData.powerFactor >= 0.9 ? 'normal' : 'warning'">
            {{ kpiData.powerFactor >= 0.9 ? '优秀' : '偏低' }}
          </div>
        </div>
        <div class="kpi-progress">
          <div class="progress-bar" :style="{ width: (kpiData.powerFactor * 100) + '%' }"></div>
        </div>
      </div>

      <!-- 温度 -->
      <div class="kpi-card temperature">
        <div class="kpi-icon">🌡️</div>
        <div class="kpi-content">
          <div class="kpi-label">平均温度</div>
          <div class="kpi-value">{{ kpiData.temperature }}</div>
          <div class="kpi-unit">°C</div>
          <div class="kpi-status" :class="getTempStatus(kpiData.temperature)">
            {{ getTempText(kpiData.temperature) }}
          </div>
        </div>
        <div class="kpi-progress">
          <div class="progress-bar" :style="{ width: (kpiData.temperature / 80 * 100) + '%' }"></div>
        </div>
      </div>

      <!-- 湿度 -->
      <div class="kpi-card humidity">
        <div class="kpi-icon">💧</div>
        <div class="kpi-content">
          <div class="kpi-label">环境湿度</div>
          <div class="kpi-value">{{ kpiData.humidity }}</div>
          <div class="kpi-unit">%</div>
          <div class="kpi-status normal">适中</div>
        </div>
        <div class="kpi-progress">
          <div class="progress-bar" :style="{ width: kpiData.humidity + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const kpiData = ref({
  voltage: 10.2,
  current: 756,
  power: 8524,
  loadRate: 75,
  powerFactor: 0.95,
  temperature: 42,
  humidity: 55
})

const getStatus = (value: number, min: number, max: number) => {
  if (value < min || value > max) return 'danger'
  if (value < min + 0.2 || value > max - 0.2) return 'warning'
  return 'normal'
}

const getStatusText = (value: number, min: number, max: number) => {
  if (value < min || value > max) return '异常'
  if (value < min + 0.2 || value > max - 0.2) return '偏离'
  return '正常'
}

const getTempStatus = (temp: number) => {
  if (temp > 60) return 'danger'
  if (temp > 50) return 'warning'
  return 'normal'
}

const getTempText = (temp: number) => {
  if (temp > 60) return '过热'
  if (temp > 50) return '偏高'
  return '正常'
}

// 模拟数据更新
let updateInterval: number

const updateData = () => {
  kpiData.value.voltage = +(9.8 + Math.random() * 0.6).toFixed(2)
  kpiData.value.current = Math.floor(700 + Math.random() * 100)
  kpiData.value.power = Math.floor(8000 + Math.random() * 1000)
  kpiData.value.loadRate = Math.floor(70 + Math.random() * 15)
  kpiData.value.powerFactor = +(0.90 + Math.random() * 0.08).toFixed(2)
  kpiData.value.temperature = Math.floor(38 + Math.random() * 8)
  kpiData.value.humidity = Math.floor(50 + Math.random() * 15)
}

onMounted(() => {
  updateInterval = setInterval(updateData, 3000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped>
.kpi-container {
  width: 100%;
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

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.kpi-card {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(70, 211, 154, 0.05) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #2196f3 50%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.kpi-card:hover {
  transform: translateY(-3px);
  border-color: rgba(33, 150, 243, 0.3);
  box-shadow: 0 8px 24px rgba(33, 150, 243, 0.2);
}

.kpi-card:hover::before {
  opacity: 1;
}

.kpi-icon {
  font-size: 28px;
  margin-bottom: 10px;
  filter: drop-shadow(0 0 10px rgba(33, 150, 243, 0.5));
}

.kpi-content {
  margin-bottom: 10px;
}

.kpi-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 5px;
}

.kpi-value {
  font-size: 24px;
  font-weight: 700;
  color: #2196f3;
  font-family: 'DIN Alternate', 'Arial', sans-serif;
  display: inline-block;
  text-shadow: 0 0 10px rgba(33, 150, 243, 0.5);
}

.kpi-unit {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin-left: 5px;
  display: inline-block;
}

.kpi-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
  margin-top: 5px;
}

.kpi-status.normal {
  background: rgba(70, 211, 154, 0.2);
  color: #46d39a;
  border: 1px solid rgba(70, 211, 154, 0.3);
}

.kpi-status.warning {
  background: rgba(255, 181, 71, 0.2);
  color: #ffb547;
  border: 1px solid rgba(255, 181, 71, 0.3);
}

.kpi-status.danger {
  background: rgba(255, 82, 82, 0.2);
  color: #ff5252;
  border: 1px solid rgba(255, 82, 82, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

.kpi-progress {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 10px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #2196f3 0%, #46d39a 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(33, 150, 243, 0.5);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>
