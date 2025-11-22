<template>
  <div class="topology-map-container">
    <!-- Background Grid/Schematic Lines -->
    <div class="schematic-grid"></div>
    
    <!-- Floor Plan Layer (simplified) -->
    <div class="floor-plan">
      <div class="room-zone zone-hv">
        <span class="zone-label">高压室（10kV）</span>
      </div>
      <div class="room-zone zone-tr">
        <span class="zone-label">变压器区</span>
      </div>
      <div class="room-zone zone-lv">
        <span class="zone-label">低压室（0.4kV）</span>
      </div>
    </div>

    <!-- Electrical Topology Layer (SVG Overlay) -->
    <svg class="topology-svg" width="100%" height="100%">
      <!-- Busbars -->
      <line x1="10%" y1="20%" x2="40%" y2="20%" class="busbar hv" />
      <line x1="60%" y1="20%" x2="90%" y2="20%" class="busbar hv" />
      
      <line x1="10%" y1="80%" x2="90%" y2="80%" class="busbar lv" />

      <!-- Connections -->
      <path d="M 25% 20% V 40%" class="connection" />
      <path d="M 75% 20% V 40%" class="connection" />
      
      <path d="M 25% 60% V 80%" class="connection" />
      <path d="M 75% 60% V 80%" class="connection" />
    </svg>

    <!-- Device Nodes -->
    <div class="device-node" 
         v-for="device in devices" 
         :key="device.id"
         :style="{ left: device.x + '%', top: device.y + '%' }"
         :class="[device.type, device.status]"
         @click="$emit('device-click', device)"
    >
      <div class="node-icon">
        <el-icon v-if="device.type === 'breaker'"><Switch /></el-icon>
        <el-icon v-else-if="device.type === 'transformer'"><Cpu /></el-icon>
        <el-icon v-else-if="device.type === 'camera'"><VideoCamera /></el-icon>
        <el-icon v-else-if="device.type === 'env'"><Odometer /></el-icon>
      </div>
      <div class="node-label">{{ device.name }}</div>
      <div class="node-status-indicator"></div>
      
      <!-- Quick Action Hover (StarCraft style selection ring) -->
      <div class="selection-ring"></div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { Switch, Cpu, VideoCamera, Odometer } from '@element-plus/icons-vue'

defineProps<{
  devices: Array<{
    id: string | number,
    name: string,
    type: string,
    x: number,
    y: number,
    status: string
  }>
}>()

defineEmits(['device-click'])
</script>

<style scoped>
.topology-map-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: #050a10;
  user-select: none;
}

.schematic-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

.floor-plan {
  position: absolute;
  inset: 20px;
  display: flex;
  gap: 20px;
  opacity: 0.2;
  pointer-events: none;
}

.room-zone {
  border: 2px dashed #00f0ff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.zone-hv { width: 40%; background: rgba(0, 240, 255, 0.05); }
.zone-tr { width: 20%; background: rgba(255, 200, 0, 0.05); border-color: #ffc800; }
.zone-lv { width: 40%; background: rgba(0, 255, 100, 0.05); border-color: #00ff62; }

.zone-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 24px;
  font-weight: bold;
  color: rgba(255,255,255,0.1);
  transform: rotate(-45deg);
}

.topology-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
}

.busbar {
  stroke-width: 6;
  stroke-linecap: round;
  filter: drop-shadow(0 0 5px currentColor);
}
.busbar.hv { stroke: #ff4d4d; color: #ff4d4d; }
.busbar.lv { stroke: #00f0ff; color: #00f0ff; }

.connection {
  stroke: #555;
  stroke-width: 2;
  fill: none;
  stroke-dasharray: 5,5;
}

/* Device Nodes */
.device-node {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  z-index: 10;
  cursor: pointer;
  transition: all 0.3s ease;
}

.device-node:hover {
  transform: translate(-50%, -50%) scale(1.2);
  z-index: 20;
}

.node-icon {
  width: 100%;
  height: 100%;
  background: #0a1525;
  border: 1px solid #00f0ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00f0ff;
  font-size: 20px;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
  clip-path: polygon(10% 0, 100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%);
}

.device-node.warning .node-icon { border-color: #e6a23c; color: #e6a23c; box-shadow: 0 0 10px rgba(230, 162, 60, 0.3); }
.device-node.danger .node-icon { border-color: #f56c6c; color: #f56c6c; box-shadow: 0 0 15px rgba(245, 108, 108, 0.5); animation: pulse-danger 1s infinite; }

.node-label {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 5px;
  font-size: 10px;
  color: #fff;
  white-space: nowrap;
  background: rgba(0,0,0,0.7);
  padding: 2px 4px;
  border-radius: 2px;
  pointer-events: none;
  font-family: 'Rajdhani', sans-serif;
}

.selection-ring {
  position: absolute;
  inset: -5px;
  border: 1px solid transparent;
  border-radius: 50%;
  transition: all 0.3s;
}

.device-node:hover .selection-ring {
  border-color: rgba(255, 255, 255, 0.5);
  animation: spin 4s linear infinite;
  border-top-color: transparent;
  border-bottom-color: transparent;
}

@keyframes pulse-danger {
  0% { box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(245, 108, 108, 0); }
  100% { box-shadow: 0 0 0 0 rgba(245, 108, 108, 0); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
