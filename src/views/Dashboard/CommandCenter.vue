<template>
  <div class="page-container command-center">
    <!-- TOP HUD: Global Status Bar -->
        <div class="hud-top">
      <div class="hud-item">
        <span class="label">安全等级</span>
        <span class="value text-success">一级（安全）</span>
      </div>
      <div class="hud-item">
        <span class="label">总负荷</span>
        <span class="value text-primary">4,250 kVA</span>
      </div>
      <div class="hud-item flex-1 text-center">
        <span class="central-title">无人配电指挥中心</span>
      </div>
      <div class="hud-item">
        <span class="label">活动告警</span>
        <div class="alarm-counts">
          <span class="count text-danger" title="Critical">2</span>
          <span class="sep">/</span>
          <span class="count text-warning" title="Major">5</span>
          <span class="sep">/</span>
          <span class="count text-info" title="Minor">12</span>
        </div>
      </div>
      <div class="hud-item">
        <span class="label">最长未处理</span>
        <span class="value text-warning">04:12:00</span>
      </div>
    </div>


    <div class="main-viewport flex flex-1 overflow-hidden gap-4">
      
      <!-- LEFT FLANK: Power Quality & Environment -->
      <div class="flank-panel left-panel">
        <!-- Site Health Index -->
        <div class="sc2-panel mb-4">
          <div class="panel-header">
            <el-icon><Histogram /></el-icon> 运行态势
          </div>
          <div class="panel-content flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div class="health-ring-container">
              <div class="health-ring"></div>
              <div class="health-core">
                <span class="score">94</span>
                <span class="label">健康度</span>
              </div>
            </div>
            <div class="w-full mt-2 px-2 space-y-3">
              <div class="stat-row">
                <span class="text-sub text-xs">功率因数</span>
                <div class="flex items-center justify-between flex-1 ml-2">
                  <el-progress :percentage="98" status="success" :stroke-width="8" :show-text="false" class="flex-1 mr-2"/>
                  <span class="text-success text-xs font-mono">0.98</span>
                </div>
              </div>
              <div class="stat-row">
                <span class="text-sub text-xs">谐波 (THDi)</span>
                <div class="flex items-center justify-between flex-1 ml-2">
                  <el-progress :percentage="35" color="#e6a23c" :stroke-width="8" :show-text="false" class="flex-1 mr-2"/>
                  <span class="text-warning text-xs font-mono">3.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Environment & AI -->
        <div class="sc2-panel flex-1">
          <div class="panel-header">
            <el-icon><Odometer /></el-icon> 环境与AI洞察
          </div>
          <div class="panel-content p-4 flex flex-col gap-4">
            <!-- Env Grid -->
            <div class="grid grid-cols-2 gap-3">
              <div class="env-card">
                <div class="lbl">平均温度</div>
                <div class="val text-success">24.5°C</div>
              </div>
              <div class="env-card">
                <div class="lbl">湿度</div>
                <div class="val text-primary">45%</div>
              </div>
              <div class="env-card">
                <div class="lbl">SF6 压力</div>
                <div class="val text-success">正常</div>
              </div>
              <div class="env-card warning">
                <div class="lbl">门禁</div>
                <div class="val text-warning">开门 (1)</div>
              </div>
            </div>

            <!-- AI Suggestion -->
            <div class="ai-box mt-auto">
              <div class="ai-header">
                <el-icon class="animate-pulse"><Cpu /></el-icon> AI 建议
              </div>
              <div class="ai-body">
                <p>> 变压器 T-01 负载率预测将在 2h 后达到 85%。</p>
                <p>> 建议：检查散热/风道运行状态，考虑投入 #2 变压器分担。</p>
                <div class="ai-action">
                  <el-button type="primary" size="small" link>查看详情 ></el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CENTER: Electrical Topology -->
      <div class="center-stage flex-1 relative" @click.self="clearSelection">
        <div class="room-switcher" @click.stop>
          <span class="label">配电室</span>
          <el-select v-model="selectedRoomId" size="small" class="room-select">
            <el-option 
              v-for="room in rooms" 
              :key="room.id" 
              :label="room.name" 
              :value="room.id" 
            />
          </el-select>
        </div>
        <!-- Decorative Corners -->
        <div class="corner top-left"></div>
        <div class="corner top-right"></div>
        <div class="corner bottom-left"></div>
        <div class="corner bottom-right"></div>
        
        <!-- Topology Map Component -->
        <TopologyMap 
          :devices="currentDevices" 
          @device-click="handleDeviceClick" 
        />

        <!-- Device Control Popup (StarCraft Style) -->
        <transition name="hud-zoom">
          <div v-if="selectedDevice" 
               class="device-hud-card"
               style="top: 50%; left: 50%; transform: translate(-50%, -50%);"
               @click.stop
          >
            <div class="hud-header">
              <span>{{ selectedDevice.name }}</span>
              <span class="status-tag" :class="selectedDevice.status">{{ selectedDevice.status.toUpperCase() }}</span>
            </div>
            <div class="hud-body">
              <div class="device-img-placeholder">
                <!-- Placeholder for device image/camera stream -->
                <div v-if="selectedDevice.type === 'camera'" class="live-feed-mock">
                  <el-icon class="animate-pulse"><VideoCamera /></el-icon> 视频流连接中...
                </div>
                <div v-else class="device-schematic">
                  <el-icon><Switch /></el-icon>
                </div>
              </div>
              
              <div class="hud-stats">
                <div class="stat-pair">
                  <span class="l">电流</span>
                  <span class="v">125 A</span>
                </div>
                <div class="stat-pair">
                  <span class="l">温度</span>
                  <span class="v text-warning">45°C</span>
                </div>
              </div>

              <div class="hud-actions">
                <div v-if="selectedDevice.type === 'breaker'">
                   <el-button type="danger" class="w-full mb-2 pixel-btn" @click="confirmAction('OPEN')">
                     远程分闸
                   </el-button>
                   <el-button type="success" class="w-full pixel-btn" @click="confirmAction('CLOSE')">
                     远程合闸
                   </el-button>
                </div>
                <div v-else>
                  <el-button type="primary" class="w-full pixel-btn">查看历史</el-button>
                </div>
              </div>
              
              <div class="safety-check" v-if="selectedDevice.type === 'breaker'">
                <el-icon class="text-warning"><Warning /></el-icon> 请按 SOP 确认
              </div>
            </div>
            <button class="close-btn" @click="selectedDevice = null">×</button>
          </div>
        </transition>

        <!-- Bottom Ticker -->
        <div class="telemetry-ticker">
          <div class="ticker-content">
            <span v-for="(log, i) in systemLogs" :key="i" class="mr-8">
              <span class="text-primary">[{{ log.time }}]</span> {{ log.msg }}
            </span>
          </div>
        </div>
      </div>

      <!-- RIGHT FLANK: Events & Controls -->
      <div class="flank-panel right-panel">
        <!-- Event Timeline -->
        <div class="sc2-panel flex-1 mb-4">
          <div class="panel-header text-warning">
            <el-icon><List /></el-icon> 事件时间线
          </div>
          <div class="panel-content p-0 overflow-hidden flex flex-col relative">
            <div class="event-list p-2 overflow-y-auto custom-scrollbar">
              <div v-for="event in eventTimeline" :key="event.id" class="event-item animate-in">
                <div class="event-time-line">
                  <div class="dot" :class="event.type"></div>
                  <div class="line"></div>
                </div>
                <div class="event-content">
                  <div class="time">{{ event.time }}</div>
                  <div class="msg">{{ event.message }}</div>
                  <div class="meta text-sub">{{ event.device }}</div>
                </div>
              </div>
            </div>
            <div class="feed-overlay"></div>
          </div>
        </div>

        <!-- Remote Controls -->
        <div class="sc2-panel h-[300px]">
          <div class="panel-header text-danger">
            <el-icon><Aim /></el-icon> 远方控制
          </div>
          <div class="panel-content p-4 grid grid-cols-2 gap-3">
            <button class="tac-btn primary">
              <el-icon><Switch /></el-icon>
              <span>开关遥控</span>
              <span class="sub">开关遥控</span>
            </button>
            <button class="tac-btn warning">
              <el-icon><VideoCamera /></el-icon>
              <span>视频巡检</span>
              <span class="sub">巡检</span>
            </button>
            <button class="tac-btn info">
              <el-icon><WindPower /></el-icon>
              <span>新风策略</span>
              <span class="sub">空调控制</span>
            </button>
            <button class="tac-btn danger">
              <el-icon><TurnOff /></el-icon>
              <span>紧急切断</span>
              <span class="sub">应急断开</span>
            </button>
            <div class="col-span-2 mt-2 border-t border-white/10 pt-2">
              <div class="flex items-center justify-between text-xs text-sub mb-1">
                <span>授权: 管理员</span>
                <span>令牌: 有效</span>
              </div>
              <button class="tac-btn success w-full">
                <el-icon><DocumentChecked /></el-icon>
                <span>生成操作票</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { 
  Histogram, Odometer, Switch, VideoCamera, Aim, Warning,
  List, WindPower, TurnOff, DocumentChecked, Cpu
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import TopologyMap from './components/TopologyMap.vue'

// --- Data & State ---

// 多配电室与设备
const rooms = ref([
  {
    id: 'room-a',
    name: 'A 区配电室',
    devices: [
      { id: 'cb1', name: '10kV 进线', type: 'breaker', x: 25, y: 30, status: 'closed' },
      { id: 'cb2', name: '10kV 馈线', type: 'breaker', x: 75, y: 30, status: 'closed' },
      { id: 'tr1', name: '#1 变压器', type: 'transformer', x: 25, y: 50, status: 'normal' },
      { id: 'tr2', name: '#2 变压器', type: 'transformer', x: 75, y: 50, status: 'warning' },
      { id: 'cam1', name: '摄像头-01', type: 'camera', x: 50, y: 10, status: 'active' },
      { id: 'env1', name: '环境传感器', type: 'env', x: 50, y: 90, status: 'normal' }
    ]
  },
  {
    id: 'room-b',
    name: 'B 区配电室',
    devices: [
      { id: 'cb3', name: '10kV 备用进线', type: 'breaker', x: 30, y: 35, status: 'closed' },
      { id: 'cb4', name: '0.4kV 馈线-01', type: 'breaker', x: 70, y: 35, status: 'closed' },
      { id: 'tr3', name: '#3 变压器', type: 'transformer', x: 30, y: 55, status: 'normal' },
      { id: 'tr4', name: '#4 变压器', type: 'transformer', x: 70, y: 55, status: 'normal' },
      { id: 'cam2', name: '摄像头-02', type: 'camera', x: 50, y: 15, status: 'active' },
      { id: 'env2', name: '环境传感器-02', type: 'env', x: 50, y: 88, status: 'normal' }
    ]
  }
])

const selectedRoomId = ref('room-a')

const currentDevices = computed(() => {
  const room = rooms.value.find(r => r.id === selectedRoomId.value)
  return room ? room.devices : []
})

const selectedDevice = ref<any>(null)

// Event Timeline
const eventTimeline = ref([
  { id: 1, time: '12:14:05', type: 'danger', device: '#2 变压器', message: '温度超限报警 (85°C)' },
  { id: 2, time: '12:10:22', type: 'info', device: '摄像头-01', message: '自动巡检抓拍完成' },
  { id: 3, time: '11:55:00', type: 'success', device: '10kV 进线', message: '遥测数据上传成功' },
  { id: 4, time: '10:30:00', type: 'warning', device: '门禁', message: '未授权闯入尝试' },
  { id: 5, time: '09:00:00', type: 'info', device: '系统', message: '系统自检完成' },
])

const systemLogs = ref([
  { time: '12:14:05', msg: '数据链路稳定 (5ms)。' },
  { time: '12:14:10', msg: '预警：变压器温度偏高。' },
  { time: '12:14:15', msg: '视频流同步中...' }
])

// --- Logic ---

const handleDeviceClick = (device: any) => {
  selectedDevice.value = device
}

const clearSelection = () => {
  selectedDevice.value = null
}

const confirmAction = (action: string) => {
  ElMessageBox.confirm(
    `确认执行 ${action} 到 ${selectedDevice.value.name} 吗？需要二级授权。`,
    '安全联锁确认',
    {
      confirmButtonText: '执行',
      cancelButtonText: '取消',
      type: 'warning',
      icon: Warning
    }
  ).then(() => {
    ElMessage.success(`指令已下发：已执行 ${action}。`)
  }).catch(() => {
    ElMessage.info('操作已取消')
  })
}

// Simulation Loop for Timeline
let simInterval: any = null

const addEvent = () => {
  const newEvent = {
    id: Date.now(),
    time: new Date().toLocaleTimeString(),
    type: Math.random() > 0.8 ? 'warning' : 'info',
    device: '系统',
    message: '定期数据刷新...'
  }
  eventTimeline.value.unshift(newEvent)
  if (eventTimeline.value.length > 20) eventTimeline.value.pop()
}

onMounted(() => {
  simInterval = setInterval(() => {
    if (Math.random() > 0.8) addEvent()
  }, 5000)
})

onUnmounted(() => {
  if (simInterval) clearInterval(simInterval)
})
</script>

<style scoped>
.command-center {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #020406;
  padding: 16px;
  gap: 16px;
  font-family: 'Rajdhani', 'Microsoft YaHei', 'PingFang SC', sans-serif;
  overflow: hidden;
  color: #fff;
}

/* Layout Containers */
.main-viewport {
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: 16px;
}

/* === HUD Top === */
.hud-top {
  display: flex;
  align-items: center;
  background: linear-gradient(to bottom, rgba(0, 20, 40, 0.95), rgba(0, 10, 20, 0.9));
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-top: 2px solid var(--tech-primary);
  padding: 0 24px;
  height: 70px;
  flex-shrink: 0;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.1);
  justify-content: space-between;
}
.hud-item { 
  display: flex; 
  flex-direction: column; 
  padding: 0 20px; 
  justify-content: center; 
}
.hud-item .label { font-size: 11px; color: var(--text-sub); letter-spacing: 2px; font-weight: 600; }
.hud-item .value { font-size: 24px; font-weight: bold; font-family: 'Orbitron'; line-height: 1; text-shadow: 0 0 5px currentColor; }
.alarm-counts { display: flex; align-items: center; font-family: 'Orbitron'; font-size: 20px; font-weight: bold; }
.alarm-counts .sep { color: #555; margin: 0 5px; font-size: 14px; }
.central-title {
  font-family: 'Orbitron'; font-size: 28px; font-weight: bold; letter-spacing: 6px;
  background: linear-gradient(to bottom, #fff, #00F0FF); -webkit-background-clip: text; color: transparent;
  text-shadow: 0 0 20px rgba(0, 240, 255, 0.6);
}

/* === Panels Common === */
.flank-panel { width: 360px; display: flex; flex-direction: column; gap: 16px; flex-shrink: 0; }
.sc2-panel {
  background: rgba(5, 15, 30, 0.9);
  border: 1px solid rgba(0, 240, 255, 0.2);
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.8);
  display: flex; flex-direction: column; overflow: hidden; backdrop-filter: blur(4px); position: relative;
}
.sc2-panel::before { content: ''; position: absolute; top: 0; left: 0; width: 8px; height: 8px; border-top: 2px solid var(--tech-primary); border-left: 2px solid var(--tech-primary); }
.sc2-panel::after { content: ''; position: absolute; bottom: 0; right: 0; width: 8px; height: 8px; border-bottom: 2px solid var(--tech-primary); border-right: 2px solid var(--tech-primary); }
.panel-header {
  background: linear-gradient(90deg, rgba(0, 240, 255, 0.15), transparent);
  padding: 10px 16px; font-size: 16px; font-weight: bold; color: var(--tech-primary);
  display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  text-transform: uppercase; letter-spacing: 1px; font-family: 'Orbitron';
}

/* === Health Ring === */
.health-ring-container { position: relative; width: 120px; height: 120px; margin: 10px 0; display: flex; align-items: center; justify-content: center; }
.health-ring {
  position: absolute; inset: 0; border: 6px solid rgba(0, 240, 255, 0.1);
  border-top-color: var(--tech-primary); border-left-color: var(--tech-primary);
  border-radius: 50%; box-shadow: 0 0 15px rgba(0, 240, 255, 0.2); animation: spin 8s linear infinite;
}
.health-core .score { font-size: 32px; font-weight: bold; color: #fff; font-family: 'Orbitron'; text-shadow: 0 0 10px var(--tech-primary); display: block; text-align: center; }
.health-core .label { font-size: 10px; color: var(--tech-primary); letter-spacing: 1px; }

/* === Env Cards === */
.env-card {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); padding: 8px; text-align: center;
}
.env-card.warning { border-color: var(--status-warning); background: rgba(230, 162, 60, 0.1); }
.env-card .lbl { font-size: 10px; color: var(--text-sub); margin-bottom: 4px; }
.env-card .val { font-size: 16px; font-weight: bold; font-family: 'Orbitron'; }

/* === AI Box === */
.ai-box { border: 1px solid rgba(0, 240, 255, 0.3); background: rgba(0, 240, 255, 0.05); padding: 10px; font-size: 12px; }
.ai-header { color: var(--tech-primary); font-weight: bold; margin-bottom: 8px; display: flex; align-items: center; gap: 5px; }
.ai-body { color: #eee; line-height: 1.4; font-family: 'Share Tech Mono', monospace; }
.ai-action { text-align: right; margin-top: 5px; }

/* === Map Area === */
.center-stage {
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  padding-bottom: 32px;
  box-sizing: border-box;
  border: 1px solid rgba(0, 240, 255, 0.3);
  background-color: #020406;
  position: relative; overflow: hidden;
}
.room-switcher {
  position: absolute;
  top: 8px;
  left: 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: 2px;
  backdrop-filter: blur(4px);
}
.room-switcher .label {
  font-size: 12px;
  color: var(--text-sub);
  letter-spacing: 1px;
}
.room-switcher .room-select {
  width: 150px;
}

/* Device HUD Popup */
.device-hud-card {
  position: absolute; width: 280px; background: rgba(5, 15, 30, 0.98);
  border: 1px solid var(--tech-primary); 
  z-index: 100; backdrop-filter: blur(10px);
  box-shadow: 0 0 50px rgba(0,0,0,0.9);
  display: flex; flex-direction: column;
}
.close-btn { position: absolute; top: 5px; right: 5px; background: none; border: none; color: var(--tech-primary); cursor: pointer; font-size: 16px; }
.hud-header {
  background: rgba(0, 240, 255, 0.2); padding: 10px; font-weight: bold; font-family: 'Orbitron';
  display: flex; justify-content: space-between; align-items: center; font-size: 14px;
}
.hud-body { padding: 15px; }
.device-img-placeholder { height: 100px; background: #000; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; border: 1px dashed #333; }
.live-feed-mock { color: var(--tech-primary); font-size: 12px; display: flex; flex-direction: column; align-items: center; gap: 5px; }
.hud-stats { display: flex; gap: 10px; margin-bottom: 15px; }
.stat-pair { flex: 1; background: rgba(255,255,255,0.05); padding: 5px; text-align: center; }
.stat-pair .l { font-size: 10px; color: var(--text-sub); display: block; }
.stat-pair .v { font-size: 14px; font-weight: bold; font-family: 'Rajdhani'; }
.pixel-btn { font-family: 'Rajdhani'; font-weight: bold; letter-spacing: 1px; border-radius: 0; }
.safety-check { margin-top: 10px; color: var(--status-warning); font-size: 11px; display: flex; align-items: center; gap: 5px; justify-content: center; }

/* Event Timeline */
.event-list { height: 100%; font-family: 'Share Tech Mono', monospace; font-size: 12px; }
.event-item { display: flex; margin-bottom: 12px; }
.event-time-line { display: flex; flex-direction: column; align-items: center; margin-right: 10px; width: 10px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: #555; }
.dot.danger { background: var(--status-danger); box-shadow: 0 0 5px var(--status-danger); }
.dot.warning { background: var(--status-warning); }
.dot.info { background: var(--tech-primary); }
.dot.success { background: var(--tech-success); }
.line { flex: 1; width: 1px; background: #333; margin-top: 2px; }
.event-content { flex: 1; }
.event-content .time { color: var(--text-sub); font-size: 10px; }
.event-content .msg { color: #fff; margin: 2px 0; }

/* Tactical Buttons */
.tac-btn {
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  color: var(--text-bright); padding: 10px; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
  font-family: 'Rajdhani'; font-weight: bold; transition: all 0.2s;
}
.tac-btn:hover { background: rgba(0, 240, 255, 0.1); border-color: var(--tech-primary); color: var(--tech-primary); }
.tac-btn .sub { font-size: 8px; opacity: 0.6; }
.tac-btn.danger:hover { background: rgba(255, 46, 99, 0.1); border-color: var(--status-danger); color: var(--status-danger); }

/* Animations */
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
.animate-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }

/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }

/* Ticker */
.telemetry-ticker {
  position: absolute; bottom: 0; left: 0; right: 0; height: 28px;
  background: rgba(0, 10, 20, 0.9); border-top: 1px solid rgba(0, 240, 255, 0.2);
  display: flex; align-items: center; overflow: hidden; white-space: nowrap; z-index: 5;
  pointer-events: none;
}
.ticker-content {
  animation: ticker 30s linear infinite; padding-left: 100%;
  font-family: 'Share Tech Mono', monospace; font-size: 11px; color: var(--tech-primary);
  pointer-events: none;
}
</style>
