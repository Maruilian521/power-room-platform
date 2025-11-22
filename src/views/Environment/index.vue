<template>
  <div class="page-container">
    <!-- 顶部状态栏 -->
    <div class="env-toolbar">
      <div class="stat-group">
        <div class="stat-item">
          <div class="label">监控站点</div>
          <div class="value highlight">100</div>
        </div>
        <div class="stat-item">
          <div class="label">异常温度</div>
          <div class="value danger">{{ abnormalTemp }}</div>
        </div>
        <div class="stat-item">
          <div class="label">水浸告警</div>
          <div class="value warning">{{ waterLeak }}</div>
        </div>
        <div class="stat-item">
          <div class="label">安防入侵</div>
          <div class="value danger">{{ securityAlert }}</div>
        </div>
      </div>
      <div class="search-box">
        <el-input v-model="searchQuery" placeholder="搜索配电室..." :prefix-icon="Search" clearable />
      </div>
    </div>

    <!-- 站点环境矩阵 -->
    <div class="env-grid-container">
      <div class="env-grid">
        <div 
          v-for="room in filteredRooms" 
          :key="room.id" 
          class="env-unit-card module-card"
          :class="getRoomStatusClass(room)"
          @click="navigateToDetail(room.id)"
        >
          <!-- 头部信息 -->
          <div class="unit-header">
            <div class="room-name">{{ room.name }}</div>
            <div class="status-badge">
              <span class="status-dot"></span>
              {{ getStatusLabel(room) }}
            </div>
          </div>

          <!-- 核心环境指��� -->
          <div class="unit-body">
            <div class="metric-row">
              <div class="metric">
                <el-icon><Odometer /></el-icon>
                <span class="val" :class="getTempColor(room.temp)">{{ room.temp }}°C</span>
              </div>
              <div class="metric">
                <el-icon><PartlyCloudy /></el-icon>
                <span class="val">{{ room.humidity }}%</span>
              </div>
            </div>
            
            <!-- 告警图标指示器 -->
            <div class="alarm-indicators">
              <el-tooltip content="烟感正常" v-if="!room.smokeAlarm">
                <el-icon class="safe"><Smoking /></el-icon>
              </el-tooltip>
              <el-tooltip content="烟感报警!" v-else>
                <el-icon class="danger pulse"><Smoking /></el-icon>
              </el-tooltip>

              <el-tooltip content="无水浸" v-if="!room.waterAlarm">
                <el-icon class="safe"><Pouring /></el-icon>
              </el-tooltip>
              <el-tooltip content="水浸报警!" v-else>
                <el-icon class="danger pulse"><Pouring /></el-icon>
              </el-tooltip>

              <el-tooltip content="门禁正常" v-if="!room.doorOpen">
                <el-icon class="safe"><Lock /></el-icon>
              </el-tooltip>
              <el-tooltip content="非法开门!" v-else>
                <el-icon class="warning"><Unlock /></el-icon>
              </el-tooltip>
            </div>
          </div>

          <!-- 底部 SF6/O2 简报 -->
          <div class="unit-footer">
            <div class="gas-info">
              <span class="label">SF6:</span>
              <span class="val" :class="room.sf6 > 1000 ? 'danger' : 'safe'">{{ room.sf6 }} ppm</span>
            </div>
            <div class="gas-info">
              <span class="label">O2:</span>
              <span class="val" :class="parseFloat(room.o2) < 18 ? 'danger' : 'safe'">{{ room.o2 }}%</span>
            </div>
          </div>

          <!-- 装饰 -->
          <div class="card-corner tl"></div>
          <div class="card-corner br"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Odometer, PartlyCloudy, Smoking, Pouring, Lock, Unlock } from '@element-plus/icons-vue'

const router = useRouter()
const searchQuery = ref('')

// 模拟数据生成
const generateEnvData = () => {
  const data = []
  const locations = ['科技园', '总部', '生产区', '数据中心', '物流园']
  for(let i=1; i<=100; i++) {
    const isTempHigh = Math.random() > 0.9
    const isWaterLeak = Math.random() > 0.98
    const isSmoke = Math.random() > 0.99
    const isDoor = Math.random() > 0.95
    
    data.push({
      id: `room-${i}`,
      name: `${locations[i % 5]} #${Math.ceil(i/5)}配电室`,
      temp: isTempHigh ? (35 + Math.random() * 10).toFixed(1) : (22 + Math.random() * 5).toFixed(1),
      humidity: (40 + Math.random() * 20).toFixed(0),
      smokeAlarm: isSmoke,
      waterAlarm: isWaterLeak,
      doorOpen: isDoor,
      sf6: Math.floor(Math.random() * 50),
      o2: (20.9 - Math.random() * 0.5).toFixed(1)
    })
  }
  // Sort alarms first
  return data.sort((a, b) => {
    const scoreA = (a.smokeAlarm?10:0) + (a.waterAlarm?5:0) + (parseFloat(a.temp)>35?2:0)
    const scoreB = (b.smokeAlarm?10:0) + (b.waterAlarm?5:0) + (parseFloat(b.temp)>35?2:0)
    return scoreB - scoreA
  })
}

const rooms = ref(generateEnvData())

// 统计
const abnormalTemp = computed(() => rooms.value.filter(r => parseFloat(r.temp) > 35).length)
const waterLeak = computed(() => rooms.value.filter(r => r.waterAlarm).length)
const securityAlert = computed(() => rooms.value.filter(r => r.doorOpen).length)

const filteredRooms = computed(() => {
  if (!searchQuery.value) return rooms.value
  return rooms.value.filter(r => r.name.includes(searchQuery.value))
})

// Helpers
const getRoomStatusClass = (room: any) => {
  if (room.smokeAlarm || room.waterAlarm) return 'status-critical'
  if (parseFloat(room.temp) > 35 || room.doorOpen) return 'status-warning'
  return 'status-normal'
}

const getStatusLabel = (room: any) => {
  if (room.smokeAlarm) return '烟感告警'
  if (room.waterAlarm) return '水浸告警'
  if (parseFloat(room.temp) > 35) return '高温预��'
  if (room.doorOpen) return '门禁开启'
  return '正常运行'
}

const getTempColor = (temp: string) => {
  return parseFloat(temp) > 35 ? 'text-danger' : 'text-safe'
}

const navigateToDetail = (id: string) => {
  router.push(`/room/detail/${id}`)
}

</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  gap: 20px;
}

/* 顶部工具栏 */
.env-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(13, 18, 26, 0.85);
  border: 1px solid var(--border-light);
  padding: 15px 20px;
  box-shadow: var(--shadow-card);
}

.stat-group {
  display: flex;
  gap: 40px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-item .label {
  font-size: 12px;
  color: var(--text-sub);
  text-transform: uppercase;
}

.stat-item .value {
  font-family: 'Orbitron', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-bright);
}
.value.highlight { color: var(--tech-primary); text-shadow: 0 0 10px var(--tech-primary); }
.value.danger { color: var(--status-danger); text-shadow: 0 0 10px var(--status-danger); }
.value.warning { color: var(--status-warning); text-shadow: 0 0 10px var(--status-warning); }

.search-box {
  width: 300px;
}

/* 矩阵容器 */
.env-grid-container {
  flex: 1;
  overflow-y: auto;
}

.env-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

/* 环境单元卡片 */
.env-unit-card {
  cursor: pointer;
  min-height: 160px;
  transition: transform 0.2s, box-shadow 0.2s;
  background: rgba(13, 18, 26, 0.6);
}

.env-unit-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
  border-color: var(--tech-primary);
}

/* 状态边框 */
.status-critical { border-color: var(--status-danger) !important; background: rgba(255, 46, 99, 0.1); }
.status-warning { border-color: var(--status-warning) !important; background: rgba(255, 214, 0, 0.05); }

/* 卡片内部布局 */
.unit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.room-name {
  font-weight: 700;
  color: var(--text-bright);
  font-size: 14px;
}

.status-badge {
  font-size: 10px;
  color: var(--text-sub);
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--status-success);
  box-shadow: 0 0 5px var(--status-success);
}
.status-critical .status-dot { background: var(--status-danger); box-shadow: 0 0 8px var(--status-danger); }
.status-warning .status-dot { background: var(--status-warning); box-shadow: 0 0 8px var(--status-warning); }

.unit-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.metric-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-sub);
  font-size: 12px;
}

.metric .val {
  font-family: 'Rajdhani', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-bright);
}
.text-danger { color: var(--status-danger) !important; }
.text-safe { color: var(--status-success) !important; }

.alarm-indicators {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.alarm-indicators .el-icon {
  font-size: 18px;
  padding: 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s;
}
.safe { color: var(--text-sub); }
.danger { color: var(--status-danger); background: rgba(255, 46, 99, 0.2) !important; border: 1px solid var(--status-danger); }
.warning { color: var(--status-warning); background: rgba(255, 214, 0, 0.2) !important; border: 1px solid var(--status-warning); }

.pulse { animation: pulse-red 1.5s infinite; }
@keyframes pulse-red {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 46, 99, 0.7); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(255, 46, 99, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 46, 99, 0); }
}

.unit-footer {
  background: rgba(0, 0, 0, 0.2);
  padding: 8px;
  border-radius: 2px;
  display: flex;
  justify-content: space-around;
  font-size: 11px;
}

.gas-info {
  display: flex;
  gap: 4px;
  align-items: baseline;
}
.gas-info .label { color: var(--text-sub); }
.gas-info .val { font-family: 'Rajdhani', sans-serif; font-weight: 600; color: var(--text-bright); }
.gas-info .val.danger { color: var(--status-warning); }

/* Corners */
.card-corner {
  position: absolute;
  width: 6px;
  height: 6px;
  border: 1px solid var(--tech-primary);
  opacity: 0.5;
  transition: opacity 0.3s;
}
.tl { top: 0; left: 0; border-right: 0; border-bottom: 0; }
.br { bottom: 0; right: 0; border-left: 0; border-top: 0; }

.env-unit-card:hover .card-corner { opacity: 1; box-shadow: 0 0 5px var(--tech-primary); }
</style>