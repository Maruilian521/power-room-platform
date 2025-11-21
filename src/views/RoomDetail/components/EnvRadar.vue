<template>
  <div class="env-radar-component">
    <div class="grid-layout">
      
      <!-- 左侧：平面雷达图 -->
      <div class="layout-col radar-section">
        <div class="module-card">
          <div class="module-header">
            <div class="header-left">
              <el-icon><Location /></el-icon>
              <span>站点环境雷达</span>
            </div>
            <div class="header-right">
              <span class="radar-status">SCANNING...</span>
            </div>
          </div>
          
          <div class="radar-map-container">
            <!-- 模拟平面图背景 -->
            <div class="floor-plan">
              <div class="room-shape main-room"></div>
              <div class="room-shape control-room"></div>
              
              <!-- 传感器点位 -->
              <div 
                v-for="sensor in sensors" 
                :key="sensor.id"
                class="sensor-point"
                :class="[sensor.type, sensor.status]"
                :style="{ left: sensor.x + '%', top: sensor.y + '%' }"
              >
                <div class="sensor-icon">
                  <el-icon v-if="sensor.type === 'smoke'"><Smoking /></el-icon>
                  <el-icon v-else-if="sensor.type === 'water'"><Pouring /></el-icon>
                  <el-icon v-else-if="sensor.type === 'door'"><Unlock /></el-icon>
                  <el-icon v-else><PartlyCloudy /></el-icon>
                </div>
                <div class="sensor-pulse" v-if="sensor.status === 'alarm'"></div>
                <div class="sensor-label">{{ sensor.name }}</div>
              </div>

              <!-- 雷达扫描线 -->
              <div class="radar-sweep"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧列 -->
      <div class="layout-col info-section">
        
        <!-- 气体与环境 -->
        <div class="module-card gas-card">
          <div class="module-header">
            <div class="header-left">
              <el-icon><Odometer /></el-icon>
              <span>生命维持指标</span>
            </div>
          </div>
          <div class="gas-dashboard">
            <div class="gas-item">
              <div class="gas-ring sf6">
                <span class="gas-val">0</span>
                <span class="gas-unit">PPM</span>
              </div>
              <span class="gas-name">SF6 浓度</span>
            </div>
            <div class="gas-item">
              <div class="gas-ring o2 safe">
                <span class="gas-val">20.9</span>
                <span class="gas-unit">%</span>
              </div>
              <span class="gas-name">O2 含量</span>
            </div>
            <div class="temp-humi-panel">
              <div class="th-row">
                <span class="th-label">平���温度</span>
                <span class="th-val">24.5°C</span>
                <div class="th-bar"><div class="fill" style="width: 45%"></div></div>
              </div>
              <div class="th-row">
                <span class="th-label">相对湿度</span>
                <span class="th-val">52%</span>
                <div class="th-bar"><div class="fill" style="width: 52%"></div></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 安防日志 -->
        <div class="module-card log-card">
          <div class="module-header">
            <div class="header-left">
              <el-icon><Lock /></el-icon>
              <span>安防事件日志</span>
            </div>
          </div>
          <div class="security-log-list">
            <div 
              v-for="(log, index) in securityLogs" 
              :key="index"
              class="log-item"
              :class="log.level"
            >
              <span class="log-time">{{ log.time }}</span>
              <span class="log-type">[{{ log.type }}]</span>
              <span class="log-content">{{ log.content }}</span>
            </div>
          </div>
        </div>

        <!-- 实时抓拍 -->
        <div class="module-card capture-card">
          <div class="module-header">
            <div class="header-left">
              <el-icon><Camera /></el-icon>
              <span>入侵检测抓拍</span>
            </div>
          </div>
          <div class="capture-view">
            <div class="no-signal">NO SIGNAL</div>
            <div class="capture-overlay">
              <div class="target-box"></div>
              <div class="target-info">TARGET LOCKED</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  Location, Smoking, Pouring, Unlock, PartlyCloudy,
  Odometer, Lock, Camera
} from '@element-plus/icons-vue'

defineProps<{
  roomId: string
}>()

// 模拟传感器数据
const sensors = ref([
  { id: 1, type: 'smoke', name: '烟感01', status: 'normal', x: 20, y: 30 },
  { id: 2, type: 'water', name: '水浸01', status: 'alarm', x: 45, y: 60 },
  { id: 3, type: 'door', name: '正门', status: 'normal', x: 10, y: 80 },
  { id: 4, type: 'temp', name: '温湿度01', status: 'normal', x: 70, y: 40 },
  { id: 5, type: 'smoke', name: '烟感02', status: 'normal', x: 80, y: 70 },
])

// 模拟日志
const securityLogs = ref([
  { time: '10:23:45', type: 'ALERT', content: '水浸传感器 #01 触发报警', level: 'danger' },
  { time: '10:20:12', type: 'INFO', content: '人员刷卡进门: 王工 (007)', level: 'info' },
  { time: '09:55:00', type: 'INFO', content: '红外双鉴探测器自检完成', level: 'info' },
  { time: '09:30:00', type: 'SYSTEM', content: '环境监测系统上线', level: 'success' },
])
</script>

<style scoped>
.env-radar-component {
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* 允许垂直滚动 */
}

.grid-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

.layout-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

/* 通���卡片样式 (继承自全局或重写) */
.module-card {
  background: rgba(13, 18, 26, 0.85);
  backdrop-filter: blur(10px);
  padding: 24px;
  box-shadow: 
    inset 0 0 20px rgba(0, 0, 0, 0.5),
    0 5px 15px rgba(0, 0, 0, 0.3);
  height: 100%; 
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: relative;
  clip-path: polygon(
    20px 0, 100% 0, 
    100% calc(100% - 20px), calc(100% - 20px) 100%, 
    0 100%, 0 20px
  );
}

.module-card::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.3), rgba(0, 240, 255, 0.05)); 
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 1;
}

.module-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  position: relative;
}

.module-header::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 50px;
  height: 3px;
  background: #00F0FF;
  box-shadow: 0 0 10px #00F0FF;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  color: #FFF;
  letter-spacing: 1px;
  font-family: "Microsoft YaHei", sans-serif;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}

.header-left .el-icon {
  color: #00F0FF;
  font-size: 18px;
  filter: drop-shadow(0 0 5px #00F0FF);
}

/* 雷达地图 */
.radar-section {
  height: 100%;
}

.radar-section .module-card {
  flex: 1;
}

.radar-status {
  font-family: 'Rajdhani', sans-serif;
  color: #00F0FF;
  animation: blink 2s infinite;
}

@keyframes blink { 50% { opacity: 0.5; } }

.radar-map-container {
  flex: 1;
  width: 100%;
  min-height: 400px;
  background: #0a0e14;
  border: 1px solid rgba(255,255,255,0.05);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: 
    linear-gradient(rgba(0, 240, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
}

.floor-plan {
  width: 80%;
  height: 70%;
  position: relative;
  border: 2px solid #3E5878;
  box-shadow: 0 0 20px rgba(62, 88, 120, 0.2);
}

.room-shape {
  position: absolute;
  border: 1px solid #5f748a;
  background: rgba(62, 88, 120, 0.1);
}

.main-room { top: 0; left: 0; width: 70%; height: 100%; border-right: none; }
.control-room { top: 0; right: 0; width: 30%; height: 60%; border-left: 2px solid #3E5878; }

/* 传感器点位 */
.sensor-point {
  position: absolute;
  width: 32px;
  height: 32px;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
}

.sensor-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #1a2129;
  border: 1px solid #00F0FF;
  color: #00F0FF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.3s;
}

.sensor-label {
  position: absolute;
  top: 30px;
  width: 100px;
  text-align: center;
  font-size: 12px;
  color: #8b9bb4;
  text-shadow: 0 0 2px #000;
  pointer-events: none;
}

/* 状态样式 */
.sensor-point.alarm .sensor-icon {
  background: #FF2E63;
  border-color: #FFF;
  color: #FFF;
  box-shadow: 0 0 10px #FF2E63;
}

.sensor-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border: 2px solid #FF2E63;
  border-radius: 50%;
  animation: ripple 1.5s infinite;
  z-index: -1;
}

@keyframes ripple {
  0% { width: 0; height: 0; opacity: 1; }
  100% { width: 300%; height: 300%; opacity: 0; }
}

.radar-sweep {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: conic-gradient(
    from 0deg at 50% 50%,
    transparent 0deg,
    rgba(0, 240, 255, 0.1) 60deg,
    transparent 60deg
  );
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: radar-spin 4s linear infinite;
  pointer-events: none;
}

@keyframes radar-spin {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

/* 右侧仪表盘 */
.gas-dashboard {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 10px;
  gap: 20px;
}

.gas-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.gas-ring {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid #1C2B3C;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px rgba(0,0,0,0.5);
  background: rgba(0,0,0,0.3);
}

.gas-ring.safe { border-color: #00E676; box-shadow: 0 0 10px rgba(0, 230, 118, 0.2); }
.gas-ring.sf6 { border-color: #00F0FF; }

.gas-val {
  font-family: 'DIN Alternate', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #FFF;
}

.gas-unit { font-size: 10px; color: #5f748a; }
.gas-name { font-size: 12px; color: #8b9bb4; }

.temp-humi-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-left: 20px;
  border-left: 1px solid rgba(255,255,255,0.1);
}

.th-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.th-label { color: #5f748a; width: 60px; }
.th-val { color: #FFF; font-weight: 700; width: 50px; }
.th-bar {
  flex: 1;
  height: 6px;
  background: #1a2129;
  border-radius: 3px;
}
.th-bar .fill { height: 100%; background: #00F0FF; border-radius: 3px; box-shadow: 0 0 5px #00F0FF; }

.log-card { flex: 1.5; min-height: 0; }

.security-log-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: 'Rajdhani', 'Microsoft YaHei', sans-serif;
}

.log-item {
  display: flex;
  gap: 10px;
  padding: 8px;
  background: rgba(255,255,255,0.02);
  border-left: 2px solid transparent;
  font-size: 13px;
}

.log-item.danger { border-left-color: #FF2E63; background: rgba(255, 46, 99, 0.05); color: #FF2E63; }
.log-item.info { border-left-color: #00F0FF; color: #aabecf; }
.log-item.success { border-left-color: #00E676; color: #00E676; }

.log-time { color: #5f748a; }
.log-type { font-weight: 700; }

.capture-card { flex: 1.2; min-height: 200px; }

.capture-view {
  flex: 1;
  background: #000;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #333;
}

.no-signal {
  color: #333;
  font-family: 'Orbitron';
  letter-spacing: 2px;
  animation: signal-flicker 3s infinite;
}

@keyframes signal-flicker {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.2; }
}

.capture-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none;
}

.target-box {
  position: absolute;
  top: 30%; left: 40%; width: 20%; height: 40%;
  border: 2px dashed #FF2E63;
  box-shadow: 0 0 10px #FF2E63;
}

.target-info {
  position: absolute;
  top: 25%; left: 40%;
  color: #FF2E63;
  font-size: 10px;
  font-weight: 700;
  background: rgba(0,0,0,0.8);
  padding: 2px 4px;
}
</style>