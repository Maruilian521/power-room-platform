<template>
  <div class="environment-container">
    <div class="section-title">
      <div class="title-bar"></div>
      <span>环境监测</span>
    </div>

    <div class="environment-grid">
      <!-- 温度 -->
      <div class="env-card temperature">
        <div class="env-icon">🌡️</div>
        <div class="env-content">
          <div class="env-label">温度</div>
          <div class="env-value" :style="{ color: getTempColor(envData.temperature) }">
            {{ envData.temperature }}
          </div>
          <div class="env-unit">°C</div>
        </div>
        <div class="env-gauge">
          <div class="gauge-fill temperature-fill" :style="{ height: (envData.temperature / 50 * 100) + '%' }"></div>
        </div>
      </div>

      <!-- 湿度 -->
      <div class="env-card humidity">
        <div class="env-icon">💧</div>
        <div class="env-content">
          <div class="env-label">湿度</div>
          <div class="env-value" :style="{ color: getHumidityColor(envData.humidity) }">
            {{ envData.humidity }}
          </div>
          <div class="env-unit">%</div>
        </div>
        <div class="env-gauge">
          <div class="gauge-fill humidity-fill" :style="{ height: envData.humidity + '%' }"></div>
        </div>
      </div>

      <!-- 烟雾 -->
      <div class="env-card smoke">
        <div class="env-icon">🌫️</div>
        <div class="env-content">
          <div class="env-label">烟雾浓度</div>
          <div class="env-value" :style="{ color: getSmokeColor(envData.smoke) }">
            {{ envData.smoke }}
          </div>
          <div class="env-unit">ppm</div>
        </div>
        <div class="env-status" :class="envData.smoke < 50 ? 'status-normal' : 'status-danger'">
          {{ envData.smoke < 50 ? '正常' : '告警' }}
        </div>
      </div>

      <!-- SF6浓度 -->
      <div class="env-card sf6">
        <div class="env-icon">⚗️</div>
        <div class="env-content">
          <div class="env-label">SF6浓度</div>
          <div class="env-value" :style="{ color: getSF6Color(envData.sf6) }">
            {{ envData.sf6 }}
          </div>
          <div class="env-unit">ppm</div>
        </div>
        <div class="env-status" :class="envData.sf6 < 1000 ? 'status-normal' : 'status-danger'">
          {{ envData.sf6 < 1000 ? '正常' : '告警' }}
        </div>
      </div>

      <!-- 水浸 -->
      <div class="env-card water">
        <div class="env-icon">🌊</div>
        <div class="env-content">
          <div class="env-label">水浸检测</div>
          <div class="env-status status-normal">
            <span class="status-dot"></span>
            <span>正常</span>
          </div>
        </div>
      </div>

      <!-- 门禁 -->
      <div class="env-card door">
        <div class="env-icon">🚪</div>
        <div class="env-content">
          <div class="env-label">门禁状态</div>
          <div class="env-status status-normal">
            <span class="status-dot"></span>
            <span>已关闭</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const envData = ref({
  temperature: 28,
  humidity: 55,
  smoke: 12,
  sf6: 350
})

const getTempColor = (temp: number) => {
  if (temp > 40) return '#ff5252'
  if (temp > 35) return '#ffb547'
  return '#46d39a'
}

const getHumidityColor = (humidity: number) => {
  if (humidity > 70 || humidity < 30) return '#ff5252'
  if (humidity > 65 || humidity < 35) return '#ffb547'
  return '#46d39a'
}

const getSmokeColor = (smoke: number) => {
  if (smoke > 50) return '#ff5252'
  if (smoke > 30) return '#ffb547'
  return '#46d39a'
}

const getSF6Color = (sf6: number) => {
  if (sf6 > 1000) return '#ff5252'
  if (sf6 > 800) return '#ffb547'
  return '#46d39a'
}

// 模拟数据更新
let updateInterval: number

const updateEnvData = () => {
  envData.value.temperature = Math.floor(25 + Math.random() * 8)
  envData.value.humidity = Math.floor(50 + Math.random() * 20)
  envData.value.smoke = Math.floor(10 + Math.random() * 20)
  envData.value.sf6 = Math.floor(300 + Math.random() * 200)
}

onMounted(() => {
  updateInterval = setInterval(updateEnvData, 5000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped>
.environment-container {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(70, 211, 154, 0.05) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  flex: 1;
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

.environment-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  height: calc(100% - 45px);
}

.env-card {
  background: rgba(10, 25, 41, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.3s ease;
}

.env-card:hover {
  transform: translateY(-3px);
  border-color: rgba(33, 150, 243, 0.3);
}

.env-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.env-content {
  flex: 1;
}

.env-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 6px;
}

.env-value {
  font-size: 28px;
  font-weight: 700;
  font-family: 'DIN Alternate', 'Arial', sans-serif;
  line-height: 1;
}

.env-unit {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  display: inline-block;
  margin-left: 5px;
}

.env-gauge {
  position: absolute;
  right: 15px;
  bottom: 15px;
  width: 6px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.gauge-fill {
  position: absolute;
  bottom: 0;
  width: 100%;
  border-radius: 3px;
  transition: height 0.3s ease;
}

.temperature-fill {
  background: linear-gradient(180deg, #ff5252 0%, #ffb547 50%, #46d39a 100%);
}

.humidity-fill {
  background: linear-gradient(180deg, #2196f3 0%, #46d39a 100%);
}

.env-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  margin-top: 8px;
}

.env-status.status-normal {
  background: rgba(70, 211, 154, 0.2);
  color: #46d39a;
  border: 1px solid rgba(70, 211, 154, 0.3);
}

.env-status.status-danger {
  background: rgba(255, 82, 82, 0.2);
  color: #ff5252;
  border: 1px solid rgba(255, 82, 82, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: blink 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
</style>
