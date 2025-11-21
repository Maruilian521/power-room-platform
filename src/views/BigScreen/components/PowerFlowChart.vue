<template>
  <div class="power-flow-container">
    <div class="section-title">
      <div class="title-bar"></div>
      <span>电能流向图</span>
      <div class="efficiency-badge">
        <span>综合效率: </span>
        <span class="efficiency-value">{{ overallEfficiency }}%</span>
      </div>
    </div>

    <div class="flow-chart">
      <svg width="100%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="xMidYMid meet">
        <!-- 定义渐变和滤镜 -->
        <defs>
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#2196f3;stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:#46d39a;stop-opacity:0.8" />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <!-- 流动路径 -->
        <path d="M 50 100 L 200 100" class="flow-path" stroke="url(#flowGradient)" stroke-width="4" fill="none" opacity="0.3"/>
        <path d="M 270 100 L 420 100" class="flow-path" stroke="url(#flowGradient)" stroke-width="4" fill="none" opacity="0.3"/>
        <path d="M 490 100 L 640 100" class="flow-path" stroke="url(#flowGradient)" stroke-width="4" fill="none" opacity="0.3"/>
        <path d="M 710 100 L 860 100" class="flow-path" stroke="url(#flowGradient)" stroke-width="4" fill="none" opacity="0.3"/>

        <!-- 粒子流动效果 -->
        <g v-for="(node, index) in flowNodes" :key="index">
          <circle
            v-for="(particle, pIndex) in node.particles"
            :key="`${index}-${pIndex}`"
            :cx="particle.x"
            :cy="100"
            r="3"
            :fill="particle.color"
            opacity="0.8"
            filter="url(#glow)"
          >
            <animate
              attributeName="cx"
              :from="node.startX"
              :to="node.endX"
              :dur="particle.duration + 's'"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0.8;0"
              :dur="particle.duration + 's'"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        <!-- 节点1: 市电输入 -->
        <g class="flow-node">
          <rect x="20" y="50" width="100" height="100" rx="10"
                fill="rgba(33, 150, 243, 0.15)"
                stroke="#2196f3"
                stroke-width="2"
                filter="url(#glow)"/>
          <text x="70" y="80" text-anchor="middle" fill="#2196f3" font-size="14" font-weight="600">市电输入</text>
          <text x="70" y="105" text-anchor="middle" fill="#46d39a" font-size="20" font-weight="700">
            {{ flowData.input.power }}
          </text>
          <text x="70" y="125" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="12">kW</text>
        </g>

        <!-- 节点2: 高压柜 -->
        <g class="flow-node">
          <rect x="200" y="50" width="100" height="100" rx="10"
                fill="rgba(33, 150, 243, 0.15)"
                stroke="#2196f3"
                stroke-width="2"
                filter="url(#glow)"/>
          <text x="250" y="80" text-anchor="middle" fill="#fff" font-size="14">高压柜</text>
          <text x="250" y="105" text-anchor="middle" fill="#46d39a" font-size="20" font-weight="700">
            {{ flowData.hvCabinet.power }}
          </text>
          <text x="250" y="125" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="12">kW</text>
          <text x="250" y="145" text-anchor="middle" :fill="getEfficiencyColor(flowData.hvCabinet.efficiency)" font-size="11">
            损耗: {{ (flowData.input.power - flowData.hvCabinet.power).toFixed(1) }}kW
          </text>
        </g>

        <!-- 节点3: 变压器 -->
        <g class="flow-node">
          <rect x="320" y="50" width="120" height="100" rx="10"
                fill="rgba(70, 211, 154, 0.15)"
                stroke="#46d39a"
                stroke-width="2"
                filter="url(#glow)"/>
          <text x="380" y="80" text-anchor="middle" fill="#fff" font-size="14">变压器</text>
          <text x="380" y="105" text-anchor="middle" fill="#46d39a" font-size="20" font-weight="700">
            {{ flowData.transformer.power }}
          </text>
          <text x="380" y="125" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="12">kW</text>
          <text x="380" y="145" text-anchor="middle" :fill="getEfficiencyColor(flowData.transformer.efficiency)" font-size="11">
            效率: {{ flowData.transformer.efficiency }}%
          </text>
        </g>

        <!-- 节点4: 低压柜 -->
        <g class="flow-node">
          <rect x="490" y="50" width="100" height="100" rx="10"
                fill="rgba(33, 150, 243, 0.15)"
                stroke="#2196f3"
                stroke-width="2"
                filter="url(#glow)"/>
          <text x="540" y="80" text-anchor="middle" fill="#fff" font-size="14">低压柜</text>
          <text x="540" y="105" text-anchor="middle" fill="#46d39a" font-size="20" font-weight="700">
            {{ flowData.lvCabinet.power }}
          </text>
          <text x="540" y="125" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="12">kW</text>
          <text x="540" y="145" text-anchor="middle" :fill="getEfficiencyColor(flowData.lvCabinet.efficiency)" font-size="11">
            损耗: {{ (flowData.transformer.power - flowData.lvCabinet.power).toFixed(1) }}kW
          </text>
        </g>

        <!-- 节点5: 电容补偿 -->
        <g class="flow-node">
          <rect x="640" y="50" width="100" height="100" rx="10"
                fill="rgba(255, 181, 71, 0.15)"
                stroke="#ffb547"
                stroke-width="2"
                filter="url(#glow)"/>
          <text x="690" y="80" text-anchor="middle" fill="#fff" font-size="14">电容补偿</text>
          <text x="690" y="105" text-anchor="middle" fill="#ffb547" font-size="16" font-weight="700">
            {{ flowData.capacitor.power }}
          </text>
          <text x="690" y="125" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="12">kVar</text>
          <text x="690" y="145" text-anchor="middle" fill="#46d39a" font-size="11">
            PF: {{ flowData.powerFactor }}
          </text>
        </g>

        <!-- 节点6: 负载输出 -->
        <g class="flow-node">
          <rect x="810" y="50" width="100" height="100" rx="10"
                fill="rgba(70, 211, 154, 0.15)"
                stroke="#46d39a"
                stroke-width="2"
                filter="url(#glow)"/>
          <text x="860" y="80" text-anchor="middle" fill="#fff" font-size="14">负载输出</text>
          <text x="860" y="105" text-anchor="middle" fill="#46d39a" font-size="20" font-weight="700">
            {{ flowData.output.power }}
          </text>
          <text x="860" y="125" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="12">kW</text>
          <text x="860" y="145" text-anchor="middle" fill="#2196f3" font-size="11">
            负载率: {{ flowData.output.loadRate }}%
          </text>
        </g>

        <!-- 箭头指示 -->
        <g v-for="(arrow, index) in arrows" :key="`arrow-${index}`">
          <path :d="arrow.path" fill="#2196f3" opacity="0.6">
            <animateTransform
              attributeName="transform"
              type="translate"
              :from="`${arrow.fromX} 0`"
              :to="`${arrow.toX} 0`"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const flowData = ref({
  input: { power: 10250 },
  hvCabinet: { power: 10125, efficiency: 98.8 },
  transformer: { power: 9875, efficiency: 97.5 },
  lvCabinet: { power: 9750, efficiency: 98.7 },
  capacitor: { power: 450 },
  output: { power: 9750, loadRate: 75 },
  powerFactor: 0.95
})

const overallEfficiency = computed(() => {
  return ((flowData.value.output.power / flowData.value.input.power) * 100).toFixed(1)
})

// 粒子流动节点
const flowNodes = [
  {
    startX: 50,
    endX: 200,
    particles: Array.from({ length: 5 }, (_, i) => ({
      x: 50 + i * 30,
      color: i % 2 === 0 ? '#2196f3' : '#46d39a',
      duration: 2 + i * 0.2
    }))
  },
  {
    startX: 270,
    endX: 420,
    particles: Array.from({ length: 5 }, (_, i) => ({
      x: 270 + i * 30,
      color: i % 2 === 0 ? '#2196f3' : '#46d39a',
      duration: 2 + i * 0.2
    }))
  },
  {
    startX: 490,
    endX: 640,
    particles: Array.from({ length: 5 }, (_, i) => ({
      x: 490 + i * 30,
      color: i % 2 === 0 ? '#2196f3' : '#46d39a',
      duration: 2 + i * 0.2
    }))
  },
  {
    startX: 710,
    endX: 860,
    particles: Array.from({ length: 5 }, (_, i) => ({
      x: 710 + i * 30,
      color: i % 2 === 0 ? '#46d39a' : '#2196f3',
      duration: 2 + i * 0.2
    }))
  }
]

// 箭头
const arrows = [
  { path: 'M 180 95 L 195 100 L 180 105 Z', fromX: 50, toX: 200 },
  { path: 'M 400 95 L 415 100 L 400 105 Z', fromX: 270, toX: 420 },
  { path: 'M 620 95 L 635 100 L 620 105 Z', fromX: 490, toX: 640 },
  { path: 'M 840 95 L 855 100 L 840 105 Z', fromX: 710, toX: 860 }
]

const getEfficiencyColor = (efficiency: number) => {
  if (efficiency >= 98) return '#46d39a'
  if (efficiency >= 95) return '#2196f3'
  if (efficiency >= 90) return '#ffb547'
  return '#ff5252'
}

// 模拟数据更新
let updateInterval: number

const updateFlowData = () => {
  const baseInput = 10000 + Math.random() * 500
  flowData.value.input.power = Math.floor(baseInput)
  flowData.value.hvCabinet.power = Math.floor(baseInput * 0.988)
  flowData.value.transformer.power = Math.floor(baseInput * 0.963)
  flowData.value.lvCabinet.power = Math.floor(baseInput * 0.951)
  flowData.value.output.power = flowData.value.lvCabinet.power
  flowData.value.output.loadRate = Math.floor(70 + Math.random() * 15)
  flowData.value.powerFactor = +(0.92 + Math.random() * 0.06).toFixed(2)
}

onMounted(() => {
  updateInterval = setInterval(updateFlowData, 4000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped>
.power-flow-container {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(70, 211, 154, 0.05) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  height: 38%;
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

.efficiency-badge {
  padding: 6px 12px;
  background: linear-gradient(135deg, rgba(70, 211, 154, 0.2) 0%, rgba(33, 150, 243, 0.2) 100%);
  border: 1px solid rgba(70, 211, 154, 0.3);
  border-radius: 20px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.efficiency-value {
  color: #46d39a;
  font-weight: 700;
  font-family: 'DIN Alternate', 'Arial', sans-serif;
  margin-left: 5px;
}

.flow-chart {
  height: calc(100% - 45px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.flow-node {
  cursor: pointer;
  transition: all 0.3s ease;
}

.flow-node:hover {
  filter: brightness(1.2);
}

.flow-path {
  stroke-dasharray: 10 5;
  animation: flowDash 20s linear infinite;
}

@keyframes flowDash {
  to {
    stroke-dashoffset: -1000;
  }
}
</style>
