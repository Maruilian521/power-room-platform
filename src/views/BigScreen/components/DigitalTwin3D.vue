<template>
  <div class="digital-twin-container">
    <div class="section-title">
      <div class="title-bar"></div>
      <span>3D数字孪生</span>
      <div class="view-controls">
        <button
          v-for="view in views"
          :key="view.name"
          :class="['view-btn', { active: currentView === view.name }]"
          @click="switchView(view.name)"
        >
          {{ view.label }}
        </button>
      </div>
    </div>

    <div class="twin-scene" ref="sceneRef">
      <!-- 配电室平面图 -->
      <svg class="equipment-layout" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
        <!-- 背景网格 -->
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(33, 150, 243, 0.1)" stroke-width="0.5"/>
          </pattern>

          <!-- 设备发光效果 -->
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <rect width="800" height="500" fill="url(#grid)"/>

        <!-- 配电室墙体 -->
        <rect x="50" y="50" width="700" height="400"
              fill="none"
              stroke="rgba(33, 150, 243, 0.3)"
              stroke-width="2"
              stroke-dasharray="5,5"/>

        <!-- 高压柜 -->
        <g class="device-group" :class="getDeviceClass(devices.hvCabinet)" @click="selectDevice('hvCabinet')">
          <rect x="100" y="100" width="120" height="80"
                :fill="getDeviceColor(devices.hvCabinet)"
                :stroke="getDeviceStroke(devices.hvCabinet)"
                stroke-width="2"
                rx="5"
                filter="url(#glow)"/>
          <text x="160" y="135" text-anchor="middle" fill="#fff" font-size="14">高压柜</text>
          <text x="160" y="155" text-anchor="middle" fill="#2196f3" font-size="12">10kV</text>
          <!-- 状态指示灯 -->
          <circle :cx="210" :cy="110" r="5" :fill="getStatusColor(devices.hvCabinet)">
            <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"
                     v-if="devices.hvCabinet.status === 'warning'"/>
          </circle>
        </g>

        <!-- 变压器 -->
        <g class="device-group" :class="getDeviceClass(devices.transformer)" @click="selectDevice('transformer')">
          <rect x="300" y="90" width="140" height="100"
                :fill="getDeviceColor(devices.transformer)"
                :stroke="getDeviceStroke(devices.transformer)"
                stroke-width="2"
                rx="5"
                filter="url(#glow)"/>
          <text x="370" y="130" text-anchor="middle" fill="#fff" font-size="14">主变压器</text>
          <text x="370" y="150" text-anchor="middle" fill="#46d39a" font-size="12">1000kVA</text>
          <text x="370" y="170" text-anchor="middle" fill="#ffb547" font-size="11">{{ devices.transformer.temp }}°C</text>
          <circle :cx="430" :cy="100" r="5" :fill="getStatusColor(devices.transformer)">
            <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"
                     v-if="devices.transformer.status === 'warning'"/>
          </circle>
        </g>

        <!-- 低压柜 -->
        <g class="device-group" :class="getDeviceClass(devices.lvCabinet)" @click="selectDevice('lvCabinet')">
          <rect x="520" y="100" width="120" height="80"
                :fill="getDeviceColor(devices.lvCabinet)"
                :stroke="getDeviceStroke(devices.lvCabinet)"
                stroke-width="2"
                rx="5"
                filter="url(#glow)"/>
          <text x="580" y="135" text-anchor="middle" fill="#fff" font-size="14">低压柜</text>
          <text x="580" y="155" text-anchor="middle" fill="#2196f3" font-size="12">400V</text>
          <circle :cx="630" :cy="110" r="5" :fill="getStatusColor(devices.lvCabinet)">
            <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"
                     v-if="devices.lvCabinet.status === 'warning'"/>
          </circle>
        </g>

        <!-- 电容补偿柜 -->
        <g class="device-group" :class="getDeviceClass(devices.capacitor)" @click="selectDevice('capacitor')">
          <rect x="520" y="250" width="120" height="80"
                :fill="getDeviceColor(devices.capacitor)"
                :stroke="getDeviceStroke(devices.capacitor)"
                stroke-width="2"
                rx="5"
                filter="url(#glow)"/>
          <text x="580" y="285" text-anchor="middle" fill="#fff" font-size="14">电容补偿柜</text>
          <text x="580" y="305" text-anchor="middle" fill="#46d39a" font-size="12">运行中</text>
          <circle :cx="630" :cy="260" r="5" :fill="getStatusColor(devices.capacitor)"/>
        </g>

        <!-- 直流屏 -->
        <g class="device-group" :class="getDeviceClass(devices.dcPanel)" @click="selectDevice('dcPanel')">
          <rect x="100" y="250" width="100" height="70"
                :fill="getDeviceColor(devices.dcPanel)"
                :stroke="getDeviceStroke(devices.dcPanel)"
                stroke-width="2"
                rx="5"
                filter="url(#glow)"/>
          <text x="150" y="280" text-anchor="middle" fill="#fff" font-size="14">直流屏</text>
          <text x="150" y="300" text-anchor="middle" fill="#2196f3" font-size="12">220V</text>
          <circle :cx="190" :cy="260" r="5" :fill="getStatusColor(devices.dcPanel)"/>
        </g>

        <!-- 环境传感器 -->
        <g class="device-group sensor" @click="selectDevice('sensor')">
          <circle cx="370" cy="350" r="30"
                  fill="rgba(33, 150, 243, 0.1)"
                  stroke="#2196f3"
                  stroke-width="2"
                  stroke-dasharray="3,3"/>
          <text x="370" y="350" text-anchor="middle" fill="#2196f3" font-size="20">🌡️</text>
          <text x="370" y="390" text-anchor="middle" fill="#fff" font-size="12">环境监测</text>
        </g>

        <!-- 电能流动动画线条 -->
        <path d="M 220 140 L 300 140"
              stroke="#2196f3"
              stroke-width="3"
              fill="none"
              opacity="0.6">
          <animate attributeName="stroke-dasharray" values="0,1000;1000,0" dur="2s" repeatCount="indefinite"/>
        </path>

        <path d="M 440 140 L 520 140"
              stroke="#46d39a"
              stroke-width="3"
              fill="none"
              opacity="0.6">
          <animate attributeName="stroke-dasharray" values="0,1000;1000,0" dur="2s" repeatCount="indefinite"/>
        </path>

        <!-- 粒子效果 -->
        <circle v-for="(particle, index) in particles" :key="index"
                :cx="particle.x" :cy="particle.y" :r="particle.r"
                :fill="particle.color" :opacity="particle.opacity">
          <animate attributeName="cx" :from="particle.x" :to="particle.x + 200"
                   :dur="particle.duration + 's'" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;1;0" :dur="particle.duration + 's'" repeatCount="indefinite"/>
        </circle>
      </svg>

      <!-- 设备详情弹窗 -->
      <transition name="fade">
        <div v-if="selectedDevice" class="device-detail" :style="detailPosition">
          <div class="detail-header">
            <h3>{{ selectedDevice.name }}</h3>
            <button @click="closeDetail" class="close-btn">×</button>
          </div>
          <div class="detail-content">
            <div class="detail-item">
              <span class="label">状态:</span>
              <span class="value" :class="selectedDevice.status">
                {{ getStatusText(selectedDevice.status) }}
              </span>
            </div>
            <div class="detail-item">
              <span class="label">电压:</span>
              <span class="value">{{ selectedDevice.voltage }} V</span>
            </div>
            <div class="detail-item">
              <span class="label">电流:</span>
              <span class="value">{{ selectedDevice.current }} A</span>
            </div>
            <div class="detail-item" v-if="selectedDevice.temp">
              <span class="label">温度:</span>
              <span class="value">{{ selectedDevice.temp }} °C</span>
            </div>
            <div class="detail-item">
              <span class="label">运行时长:</span>
              <span class="value">{{ selectedDevice.runTime }} h</span>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'

const sceneRef = ref<HTMLElement>()
const currentView = ref('front')

const views = [
  { name: 'front', label: '正视图' },
  { name: 'top', label: '俯视图' },
  { name: '3d', label: '3D视图' }
]

// 设备数据
const devices = reactive({
  hvCabinet: {
    id: 'hv1',
    name: '高压柜',
    status: 'normal',
    voltage: 10200,
    current: 156,
    runTime: 8760
  },
  transformer: {
    id: 'tr1',
    name: '主变压器',
    status: 'warning',
    voltage: 10000,
    current: 780,
    temp: 65,
    runTime: 8760
  },
  lvCabinet: {
    id: 'lv1',
    name: '低压柜',
    status: 'normal',
    voltage: 400,
    current: 1850,
    runTime: 8760
  },
  capacitor: {
    id: 'cap1',
    name: '电容补偿柜',
    status: 'normal',
    voltage: 400,
    current: 120,
    runTime: 6540
  },
  dcPanel: {
    id: 'dc1',
    name: '直流屏',
    status: 'normal',
    voltage: 220,
    current: 15,
    runTime: 8760
  }
})

// 粒子效果
const particles = ref(
  Array.from({ length: 10 }, (_, i) => ({
    x: 220 + i * 20,
    y: 140,
    r: 2,
    color: i % 2 === 0 ? '#2196f3' : '#46d39a',
    opacity: 0.8,
    duration: 2 + Math.random() * 2
  }))
)

const selectedDevice = ref<any>(null)
const detailPosition = ref({ top: '50%', left: '50%' })

const switchView = (view: string) => {
  currentView.value = view
}

const getDeviceColor = (device: any) => {
  const colors = {
    normal: 'rgba(33, 150, 243, 0.1)',
    warning: 'rgba(255, 181, 71, 0.15)',
    danger: 'rgba(255, 82, 82, 0.15)'
  }
  return colors[device.status as keyof typeof colors] || colors.normal
}

const getDeviceStroke = (device: any) => {
  const colors = {
    normal: '#2196f3',
    warning: '#ffb547',
    danger: '#ff5252'
  }
  return colors[device.status as keyof typeof colors] || colors.normal
}

const getStatusColor = (device: any) => {
  const colors = {
    normal: '#46d39a',
    warning: '#ffb547',
    danger: '#ff5252'
  }
  return colors[device.status as keyof typeof colors] || colors.normal
}

const getDeviceClass = (device: any) => {
  return {
    'device-selected': selectedDevice.value?.id === device.id,
    'device-warning': device.status === 'warning',
    'device-danger': device.status === 'danger'
  }
}

const selectDevice = (deviceKey: string) => {
  const device = devices[deviceKey as keyof typeof devices]
  selectedDevice.value = device
}

const closeDetail = () => {
  selectedDevice.value = null
}

const getStatusText = (status: string) => {
  const texts = {
    normal: '正常运行',
    warning: '告警',
    danger: '故障'
  }
  return texts[status as keyof typeof texts] || '未知'
}

onMounted(() => {
  // 可以在这里初始化Three.js场景
})

onUnmounted(() => {
  // 清理
})
</script>

<style scoped>
.digital-twin-container {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(70, 211, 154, 0.05) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  height: 60%;
  display: flex;
  flex-direction: column;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.view-controls {
  display: flex;
  gap: 8px;
}

.view-btn {
  padding: 6px 12px;
  background: rgba(33, 150, 243, 0.1);
  border: 1px solid rgba(33, 150, 243, 0.3);
  border-radius: 6px;
  color: #2196f3;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-btn:hover {
  background: rgba(33, 150, 243, 0.2);
  border-color: #2196f3;
}

.view-btn.active {
  background: linear-gradient(135deg, #2196f3 0%, #46d39a 100%);
  border-color: transparent;
  color: #ffffff;
}

.twin-scene {
  flex: 1;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);
}

.equipment-layout {
  width: 100%;
  height: 100%;
}

.device-group {
  cursor: pointer;
  transition: all 0.3s ease;
}

.device-group:hover {
  filter: brightness(1.2);
}

.device-group.device-selected {
  filter: brightness(1.3) drop-shadow(0 0 10px #2196f3);
}

.device-detail {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 260px;
  background: linear-gradient(135deg, rgba(10, 25, 41, 0.95) 0%, rgba(26, 35, 50, 0.95) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(33, 150, 243, 0.3);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  z-index: 10;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-header h3 {
  margin: 0;
  font-size: 16px;
  color: #ffffff;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: #ff5252;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.detail-item .label {
  color: rgba(255, 255, 255, 0.6);
}

.detail-item .value {
  color: #2196f3;
  font-weight: 600;
  font-family: 'DIN Alternate', 'Arial', sans-serif;
}

.detail-item .value.normal {
  color: #46d39a;
}

.detail-item .value.warning {
  color: #ffb547;
}

.detail-item .value.danger {
  color: #ff5252;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
