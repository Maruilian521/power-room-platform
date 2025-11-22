<template>
  <div class="page-container">
    <!-- 顶部战术工具栏 -->
    <div class="tactical-toolbar">
      <div class="toolbar-left">
        <div class="filter-group">
          <div 
            class="filter-btn" 
            :class="{ active: currentFilter === 'all' }"
            @click="currentFilter = 'all'"
          >
            全部 ({{ totalRooms }})
          </div>
          <div 
            class="filter-btn status-danger" 
            :class="{ active: currentFilter === 'alarm' }"
            @click="currentFilter = 'alarm'"
          >
            <el-icon><Warning /></el-icon>
            报警 ({{ alarmRooms }})
          </div>
          <div 
            class="filter-btn status-offline" 
            :class="{ active: currentFilter === 'offline' }"
            @click="currentFilter = 'offline'"
          >
            <el-icon><CircleClose /></el-icon>
            离线 ({{ offlineRooms }})
          </div>
        </div>
      </div>
      <div class="toolbar-right">
        <div class="sc2-search">
          <el-icon class="search-icon"><Search /></el-icon>
          <input type="text" v-model="searchText" placeholder="SEARCH UNIT..." />
        </div>
      </div>
    </div>

    <!-- 配电室矩阵 -->
    <div class="room-grid-container">
      <div class="room-grid">
        <div 
          v-for="room in filteredRooms" 
          :key="room.id"
          class="room-unit-card"
          :class="[room.status, room.type, { 'pulse-alert': room.status === 'alarm' }]"
          @click="handleRoomClick(room)"
        >
          <!-- 装饰角标 -->
          <div class="card-corner tl"></div>
          <div class="card-corner tr"></div>
          <div class="card-corner bl"></div>
          <div class="card-corner br"></div>

          <!-- 1. 头部：名称与类型 -->
          <div class="card-header">
            <div class="room-info">
              <div class="room-name">{{ room.name }}</div>
              <div class="room-type-badge" :class="room.type">{{ getRoomTypeLabel(room.type) }}</div>
            </div>
            <div class="room-status-indicator" :class="room.status"></div>
          </div>

          <!-- 2. 能量流布局 -->
          <div class="energy-flow-container">
            
            <!-- 高压侧 (HV) -->
            <div class="flow-section hv-section" v-if="room.type === 'mix' || room.type === 'hv'">
              <div class="section-title">高压侧 (10kV)</div>
              <div class="metrics-row">
                <div class="metric-tiny">
                  <span class="lbl">接点温度</span>
                  <span class="val" :class="getTempColor(room.hvTemp)">{{ room.hvTemp }}°C</span>
                </div>
                <div class="metric-tiny">
                  <span class="lbl">局放状态</span>
                  <span class="val" :class="room.pdStatus === 'warning' ? 'text-danger' : 'text-success'">
                    {{ room.pdStatus === 'warning' ? '异常' : '正常' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 连接线/变压器 -->
            <div class="flow-connector" v-if="room.type === 'mix'">
              <div class="transformer-icon">
                <div class="tf-load-bar">
                  <div class="tf-fill" :style="{ width: room.transformerLoad + '%' }" :class="getLoadColor(room.transformerLoad)"></div>
                </div>
                <span class="tf-label">{{ room.transformerLoad }}%</span>
              </div>
            </div>

            <!-- 低压侧 (LV) -->
            <div class="flow-section lv-section" v-if="room.type === 'mix' || room.type === 'lv'">
              <div class="section-title">低压侧 (0.4kV)</div>
              <div class="metrics-row">
                <div class="metric-tiny">
                  <span class="lbl">功率因数</span>
                  <span class="val" :class="getPfColor(room.powerFactor)">{{ room.powerFactor }}</span>
                </div>
                <div class="metric-tiny">
                  <span class="lbl">不平衡度</span>
                  <span class="val" :class="room.unbalanceRate > 15 ? 'text-warning' : 'text-normal'">{{ room.unbalanceRate }}%</span>
                </div>
              </div>
              <div class="power-total">
                <span class="lbl">总功率</span>
                <span class="val">{{ room.totalPower }} kW</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Warning, CircleClose } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentFilter = ref('all')
const searchText = ref('')

// 模拟更真实的混合数据
const generateMockRooms = () => {
  const rooms = []
  const locations = ['科技园区', '生产基地', '总部大楼', '数据中心', '物流仓储']
  const types = ['mix', 'mix', 'mix', 'hv', 'lv'] // 混合型居多
  
  for (let i = 1; i <= 24; i++) {
    const type = types[i % 5] as 'mix' | 'hv' | 'lv'
    // 随机生成状态
    const isAlarm = Math.random() > 0.85
    const isOffline = Math.random() > 0.95
    
    rooms.push({
      id: i,
      name: `${locations[i % 5]} #${Math.ceil(i/5)}`,
      type: type,
      status: isAlarm ? 'alarm' : (isOffline ? 'offline' : 'normal'),
      
      // 高压数据
      hvTemp: Math.floor(30 + Math.random() * 40), // 30-70度
      pdStatus: Math.random() > 0.9 ? 'warning' : 'normal',
      
      // 变压器/通用数据
      transformerLoad: Math.floor(30 + Math.random() * 60),
      
      // 低压数据
      powerFactor: (0.85 + Math.random() * 0.14).toFixed(2),
      unbalanceRate: Math.floor(Math.random() * 20),
      totalPower: Math.floor(200 + Math.random() * 800)
    })
  }
  return rooms.sort((a, b) => {
    if (a.status === 'alarm' && b.status !== 'alarm') return -1
    if (a.status !== 'alarm' && b.status === 'alarm') return 1
    return 0
  })
}

const rooms = ref(generateMockRooms())

const totalRooms = computed(() => rooms.value.length)
const alarmRooms = computed(() => rooms.value.filter(r => r.status === 'alarm').length)
const offlineRooms = computed(() => rooms.value.filter(r => r.status === 'offline').length)

const filteredRooms = computed(() => {
  return rooms.value.filter(room => {
    if (currentFilter.value === 'alarm' && room.status !== 'alarm') return false
    if (currentFilter.value === 'offline' && room.status !== 'offline') return false
    if (searchText.value && !room.name.includes(searchText.value)) return false
    return true
  })
})

const getRoomTypeLabel = (type: string) => {
  const map: Record<string, string> = { 'mix': '混合', 'hv': '高压', 'lv': '低压' }
  return map[type]
}

const getLoadColor = (val: number) => {
  if (val > 80) return 'bg-danger'
  if (val > 60) return 'bg-warning'
  return 'bg-success'
}

const getTempColor = (val: number) => {
  if (val > 60) return 'text-danger'
  if (val > 50) return 'text-warning'
  return 'text-normal'
}

const getPfColor = (val: string) => {
  const v = parseFloat(val)
  if (v < 0.9) return 'text-warning'
  return 'text-success'
}

const handleRoomClick = (room: any) => {
  // 进入详情页
  router.push(`/room/detail/${room.id}`)
}
</script>

<style scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;
}

/* 战术工具栏 */
.tactical-toolbar {
  height: 50px;
  background: rgba(13, 18, 26, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.filter-group {
  display: flex;
  gap: 2px;
}

.filter-btn {
  padding: 6px 16px;
  cursor: pointer;
  color: #5f748a;
  font-family: "Microsoft YaHei", sans-serif;
  font-weight: 600;
  font-size: 14px;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.filter-btn:hover {
  color: #FFF;
  background: rgba(255, 255, 255, 0.05);
}

.filter-btn.active {
  background: rgba(0, 240, 255, 0.1);
  border-color: rgba(0, 240, 255, 0.3);
  color: #00F0FF;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.1);
}

.filter-btn.status-danger.active {
  background: rgba(255, 46, 99, 0.1);
  border-color: rgba(255, 46, 99, 0.3);
  color: #FF2E63;
  box-shadow: 0 0 10px rgba(255, 46, 99, 0.1);
}

.filter-btn.status-offline.active {
  background: rgba(148, 163, 184, 0.1);
  border-color: rgba(148, 163, 184, 0.3);
  color: #94A3B8;
}

/* SC2 搜索框 */
.sc2-search {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 10px;
  height: 32px;
  width: 240px;
}

.search-icon {
  color: #00F0FF;
  margin-right: 8px;
}

.sc2-search input {
  background: transparent;
  border: none;
  color: #FFF;
  width: 100%;
  outline: none;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
  letter-spacing: 1px;
}

/* 房间矩阵 */
.room-grid-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

/* 
   核心：战术卡片单元 (SC2 Card Style) 
*/
.room-unit-card {
  background: rgba(13, 18, 26, 0.85);
  border: 1px solid rgba(0, 240, 255, 0.1);
  padding: 16px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  /* 硬朗切角 */
  clip-path: polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px);
  display: flex;
  flex-direction: column;
  min-height: 180px;
}

.room-unit-card:hover {
  background: rgba(20, 30, 40, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  border-color: #00F0FF;
}

/* 报警态 */
.room-unit-card.alarm {
  border-color: #FF2E63;
  background: rgba(40, 10, 20, 0.8);
  box-shadow: inset 0 0 30px rgba(255, 46, 99, 0.2);
}
.room-unit-card.alarm:hover { border-color: #FF2E63; }

/* 脉冲动画 */
@keyframes pulse-red {
  0% { box-shadow: 0 0 0 rgba(255, 46, 99, 0); }
  50% { box-shadow: 0 0 20px rgba(255, 46, 99, 0.4); }
  100% { box-shadow: 0 0 0 rgba(255, 46, 99, 0); }
}
.room-unit-card.pulse-alert { animation: pulse-red 1.5s infinite; }

/* 头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.room-name {
  font-family: "Microsoft YaHei", sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #E2E8F0;
  letter-spacing: 1px;
}

.room-type-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 2px;
  background: rgba(255,255,255,0.1);
  color: #94A3B8;
  display: inline-block;
  margin-top: 4px;
}
.room-type-badge.mix { color: #00F0FF; background: rgba(0, 240, 255, 0.1); }
.room-type-badge.hv { color: #FFD600; background: rgba(255, 214, 0, 0.1); }

.room-status-indicator {
  width: 8px;
  height: 8px;
  background: #00E676;
  border-radius: 50%;
  box-shadow: 0 0 5px #00E676;
}
.room-status-indicator.alarm { background: #FF2E63; box-shadow: 0 0 8px #FF2E63; }
.room-status-indicator.offline { background: #475569; box-shadow: none; }

/* 能量流布局 */
.energy-flow-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 区域块 */
.flow-section {
  background: rgba(0, 0, 0, 0.2);
  padding: 8px;
  border-radius: 2px;
  border-left: 2px solid transparent;
}
.hv-section { border-left-color: #FFD600; } /* 高压黄 */
.lv-section { border-left-color: #00F0FF; } /* 低压蓝 */

.section-title {
  font-size: 10px;
  color: #5f748a;
  margin-bottom: 6px;
  text-transform: uppercase;
  font-weight: 600;
}

.metrics-row {
  display: flex;
  justify-content: space-between;
}

.metric-tiny {
  display: flex;
  flex-direction: column;
}
.metric-tiny .lbl { font-size: 10px; color: #5f748a; }
.metric-tiny .val { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 14px; color: #FFF; }

.text-danger { color: #FF2E63; }
.text-warning { color: #FFD600; }
.text-success { color: #00E676; }
.text-normal { color: #FFF; }

/* 变压器连接处 */
.flow-connector {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 16px;
  position: relative;
}
.flow-connector::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(255,255,255,0.1);
  z-index: 0;
}

.transformer-icon {
  background: #1a2129;
  padding: 2px 8px;
  border-radius: 10px;
  z-index: 1;
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  gap: 6px;
  width: 80%;
}

.tf-load-bar {
  flex: 1;
  height: 4px;
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
  overflow: hidden;
}
.tf-fill { height: 100%; }
.bg-success { background: #00E676; }
.bg-warning { background: #FFD600; }
.bg-danger { background: #FF2E63; }

.tf-label { font-size: 10px; color: #94A3B8; width: 28px; text-align: right; }

/* 低压侧总功率 */
.power-total {
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px dashed rgba(255,255,255,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.power-total .val { font-size: 16px; color: #00F0FF; font-weight: 700; }

/* 装饰角标 */
.card-corner {
  position: absolute;
  width: 8px;
  height: 8px;
  border: 1px solid rgba(0, 240, 255, 0.3);
  transition: all 0.3s;
}
.tl { top: 0; left: 0; border-right: none; border-bottom: none; }
.tr { top: 0; right: 0; border-left: none; border-bottom: none; }
.bl { bottom: 0; left: 0; border-right: none; border-top: none; }
.br { bottom: 0; right: 0; border-left: none; border-top: none; }

.room-unit-card:hover .card-corner {
  border-color: #00F0FF;
  box-shadow: 0 0 5px #00F0FF;
}
</style>
