<template>
  <div class="page-container">
    <div class="device-list">
      <div class="main-content module-card">
        <div class="module-header">
           <span class="title">设备资源库 (ASSETS)</span>
        </div>
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
          <div class="left-tools">
            <el-radio-group v-model="viewMode" size="small" class="sc2-radio-group">
              <el-radio-button label="list"><el-icon><List /></el-icon> 列表</el-radio-button>
              <el-radio-button label="grid"><el-icon><Grid /></el-icon> 视图</el-radio-button>
            </el-radio-group>
          </div>
          <div style="display: flex; gap: 12px;">
            <el-input
              v-model="searchText"
              placeholder="搜索设备名称或ID"
              style="width: 300px;"
              clearable
              class="sc2-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="filterStatus" placeholder="筛选状态" clearable style="width: 150px;">
              <el-option label="全部" value="" />
              <el-option label="在线" value="online" />
              <el-option label="离线" value="offline" />
              <el-option label="告警" value="warning" />
              <el-option label="故障" value="alarm" />
            </el-select>
          </div>
        </div>

        <!-- Grid View (Unit Cards) -->
        <div v-if="viewMode === 'grid'" class="unit-grid">
          <div 
            v-for="device in paginatedDevices" 
            :key="device.id" 
            class="sc2-unit-card"
            :class="device.status"
            @click="viewDevice(device)"
          >
            <div class="unit-visual">
              <!-- Placeholder for Unit Portrait/Icon -->
              <el-icon :size="40" class="unit-icon"><component :is="getDeviceIcon(device.type)" /></el-icon>
              <div class="unit-status-bar" :class="device.status"></div>
            </div>
            <div class="unit-info">
              <div class="unit-name" :title="device.name">{{ device.name }}</div>
              <div class="unit-type">{{ getDeviceTypeName(device.type) }}</div>
              <div class="unit-meta">
                <div class="meta-row">
                  <span class="label">LOC:</span>
                  <span class="val">{{ device.roomName }}</span>
                </div>
                <div class="meta-row" v-if="device.voltage">
                  <span class="label">PWR:</span>
                  <span class="val">{{ device.voltage.toFixed(1) }} V</span>
                </div>
                <div class="meta-row" v-if="device.temperature">
                  <span class="label">TMP:</span>
                  <span class="val" :style="{ color: getTempColor(device.temperature) }">{{ device.temperature.toFixed(1) }} °C</span>
                </div>
              </div>
              <div class="unit-actions">
                 <el-button size="small" type="primary" link @click.stop="viewDevice(device)">详情</el-button>
                 <el-button size="small" type="warning" link @click.stop="editDevice(device)">维护</el-button>
              </div>
            </div>
            <!-- Holographic Corner -->
            <div class="card-corner corner-tr"></div>
            <div class="card-corner corner-bl"></div>
          </div>
        </div>

        <!-- List View (Table) -->
        <el-table
          v-else
          :data="paginatedDevices"
          stripe
          v-loading="loading"
          style="width: 100%"
          class="sc2-table"
        >
          <el-table-column prop="id" label="设备ID" width="140" />
          <el-table-column prop="name" label="设备名称" width="200" />
          <el-table-column prop="type" label="设备类型" width="140">
            <template #default="{ row }">
              <el-tag :type="getDeviceTypeTag(row.type)" effect="dark">
                {{ getDeviceTypeName(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="运行状态" width="120">
            <template #default="{ row }">
              <span :class="['status-badge', row.status]">
                {{ getStatusName(row.status) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="roomName" label="所属配电室" width="180" />
          <el-table-column prop="voltage" label="电压(V)" width="120">
            <template #default="{ row }">
              <span v-if="row.voltage !== undefined" :style="{ color: getValueColor(row.voltage, 380, 420), fontFamily: 'Rajdhani', fontWeight: 'bold' }">
                {{ row.voltage.toFixed(1) }}
              </span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="current" label="电流(A)" width="120">
            <template #default="{ row }">
              <span style="font-family: 'Rajdhani'">{{ row.current?.toFixed(1) || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="power" label="功率(kW)" width="120">
            <template #default="{ row }">
              <span style="font-family: 'Rajdhani'">{{ row.power?.toFixed(1) || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="temperature" label="温度(°C)" width="120">
            <template #default="{ row }">
              <span v-if="row.temperature !== undefined" :style="{ color: getTempColor(row.temperature), fontFamily: 'Rajdhani' }">
                {{ row.temperature.toFixed(1) }}
              </span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="lastUpdate" label="更新时间" width="180">
            <template #default="{ row }">
              <span class="time-text">{{ formatTime(row.lastUpdate) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="180">
            <template #default="{ row }">
              <el-button size="small" type="primary" link @click="viewDevice(row)">
                详情
              </el-button>
              <el-button size="small" type="warning" link @click="editDevice(row)">
                编辑
              </el-button>
              <el-button
                size="small"
                :type="row.status === 'online' ? 'danger' : 'success'"
                link
                @click="toggleDeviceStatus(row)"
              >
                {{ row.status === 'online' ? '停用' : '启用' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="filteredDevices.length"
          />
        </div>
      </div>

      <!-- 设备详情对话框 -->
      <el-dialog
        v-model="detailVisible"
        title="设备详情"
        width="600px"
        class="sc2-dialog"
      >
        <div v-if="selectedDevice" class="sc2-info-panel">
          <el-descriptions :column="2" border class="sc2-descriptions">
            <el-descriptions-item label="设备ID">{{ selectedDevice.id }}</el-descriptions-item>
            <el-descriptions-item label="设备名称">{{ selectedDevice.name }}</el-descriptions-item>
            <el-descriptions-item label="设备类型">{{ getDeviceTypeName(selectedDevice.type) }}</el-descriptions-item>
            <el-descriptions-item label="运行状态">
              <span :class="['status-badge', selectedDevice.status]">
                {{ getStatusName(selectedDevice.status) }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="所属配电室">{{ selectedDevice.roomName }}</el-descriptions-item>
            <el-descriptions-item label="电压">{{ selectedDevice.voltage?.toFixed(2) || '-' }} V</el-descriptions-item>
            <el-descriptions-item label="电流">{{ selectedDevice.current?.toFixed(2) || '-' }} A</el-descriptions-item>
            <el-descriptions-item label="功率">{{ selectedDevice.power?.toFixed(2) || '-' }} kW</el-descriptions-item>
            <el-descriptions-item label="温度">{{ selectedDevice.temperature?.toFixed(2) || '-' }} °C</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatTime(selectedDevice.lastUpdate) }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, toRefs } from 'vue'
import { useDeviceStore } from '../stores/device'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, Grid, List, 
  Cpu, VideoCamera, Switch, 
  Lightning, Connection, Operation 
} from '@element-plus/icons-vue'
import type { Device } from '../types'

const deviceStore = useDeviceStore()
const { devices, loading } = toRefs(deviceStore)

const viewMode = ref<'list' | 'grid'>('grid')
const searchText = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const detailVisible = ref(false)
const selectedDevice = ref<Device | null>(null)

const filteredDevices = computed(() => {
  let result = devices.value

  // 搜索过滤
  if (searchText.value) {
    const lowerSearch = searchText.value.toLowerCase()
    result = result.filter(device =>
      device.name?.toLowerCase().includes(lowerSearch) ||
      device.id?.toLowerCase().includes(lowerSearch)
    )
  }

  // 状态过滤
  if (filterStatus.value) {
    result = result.filter(device => device.status === filterStatus.value)
  }

  return result
})

const paginatedDevices = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredDevices.value.slice(start, end)
})

const getDeviceTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    transformer: '变压器',
    switch: '开关柜',
    sensor: '传感器',
    breaker: '断路器',
    capacitor: '电容器',
    camera: '摄像头',
    robot: '巡检机器人'
  }
  return typeMap[type] || type
}

const getDeviceTypeTag = (type: string) => {
  const tagMap: Record<string, string> = {
    transformer: 'danger',
    switch: 'warning',
    sensor: 'info',
    breaker: 'success',
    capacitor: '',
    camera: '',
    robot: 'primary'
  }
  return tagMap[type] || ''
}

const getStatusName = (status: string) => {
  const statusMap: Record<string, string> = {
    online: '在线',
    offline: '离线',
    warning: '告警',
    alarm: '故障'
  }
  return statusMap[status] || status
}

const getDeviceIcon = (type: string) => {
  const map: Record<string, any> = {
    transformer: Lightning,
    switch: Switch,
    sensor: Connection,
    breaker: Operation,
    capacitor: Cpu,
    camera: VideoCamera,
    robot:  Cpu // Fallback
  }
  return map[type] || Cpu
}

const getValueColor = (value: number, min: number, max: number) => {
  if (value < min || value > max) {
    return 'var(--color-danger)'
  }
  if (value < min + 5 || value > max - 5) {
    return 'var(--color-warning)'
  }
  return 'var(--color-success)'
}

const getTempColor = (temp: number) => {
  if (temp > 60) return 'var(--color-danger)'
  if (temp > 50) return 'var(--color-warning)'
  return 'var(--color-success)'
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

const viewDevice = (device: Device) => {
  selectedDevice.value = device
  detailVisible.value = true
}

const editDevice = (_device: Device) => {
  ElMessage.info('编辑功能开发中...')
}

const toggleDeviceStatus = async (device: Device) => {
  const action = device.status === 'online' ? '停用' : '启用'

  try {
    await ElMessageBox.confirm(
      `确定要${action}设备 ${device.name} 吗?`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const newStatus = device.status === 'online' ? 'offline' : 'online'
    await deviceStore.updateDeviceStatus(device.id, newStatus)
    ElMessage.success(`${action}成功`)
  } catch (error) {
    // 用户取消操作
  }
}

onMounted(() => {
  deviceStore.fetchDevices()
})
</script>

<style scoped>
.device-list {
  animation: fadeIn 0.5s ease-out;
}

.module-header {
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  padding-bottom: 10px;
}

.module-header .title {
    font-family: 'Orbitron', sans-serif;
    font-size: 20px;
    color: var(--tech-primary);
    text-transform: uppercase;
    letter-spacing: 2px;
    text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
}

.time-text {
  font-family: 'Rajdhani', sans-serif;
  color: var(--text-secondary);
}

/* Unit Grid (Card View) */
.unit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding-bottom: 20px;
}

.sc2-unit-card {
  background: rgba(13, 18, 26, 0.6);
  border: 1px solid rgba(0, 240, 255, 0.2);
  display: flex;
  height: 140px;
  position: relative;
  transition: all 0.2s ease;
  cursor: pointer;
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
}

.sc2-unit-card:hover {
  background: rgba(0, 240, 255, 0.05);
  border-color: var(--tech-primary);
  transform: translateY(-2px);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.15);
}

.sc2-unit-card.warning { border-color: var(--status-warning); }
.sc2-unit-card.offline { border-color: var(--text-sub); opacity: 0.7; }
.sc2-unit-card.alarm { border-color: var(--status-danger); box-shadow: 0 0 10px var(--status-danger); }

/* Left Visual Side */
.unit-visual {
  width: 100px;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.unit-icon {
  color: var(--tech-secondary);
  filter: drop-shadow(0 0 5px rgba(0, 120, 215, 0.5));
}

.unit-status-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--status-success);
  box-shadow: 0 0 5px var(--status-success);
}
.unit-status-bar.warning { background: var(--status-warning); box-shadow: 0 0 5px var(--status-warning); }
.unit-status-bar.offline { background: var(--text-sub); box-shadow: none; }
.unit-status-bar.alarm { background: var(--status-danger); box-shadow: 0 0 8px var(--status-danger); }

/* Right Info Side */
.unit-info {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
}

.unit-name {
  font-family: 'Microsoft YaHei', sans-serif;
  font-weight: 700;
  color: var(--text-bright);
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.unit-type {
  font-size: 12px;
  color: var(--tech-secondary);
  margin-bottom: 8px;
  text-transform: uppercase;
  font-family: 'Rajdhani', sans-serif;
}

.unit-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.meta-row .label { color: var(--text-sub); font-family: 'Rajdhani', sans-serif; }
.meta-row .val { color: var(--text-main); font-family: 'Rajdhani', sans-serif; font-weight: 600; }

.unit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.sc2-unit-card:hover .unit-actions {
  opacity: 1;
}

/* Decor Corner */
.card-corner {
  position: absolute;
  width: 6px;
  height: 6px;
  border: 1px solid var(--tech-primary);
  transition: opacity 0.3s;
  opacity: 0.5;
}
.corner-tr { top: 0; right: 0; border-bottom: 0; border-left: 0; }
.corner-bl { bottom: 0; left: 0; border-top: 0; border-right: 0; }

.sc2-unit-card:hover .card-corner {
  opacity: 1;
  box-shadow: 0 0 5px var(--tech-primary);
}
</style>
