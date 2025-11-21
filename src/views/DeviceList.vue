<template>
  <div class="page-container">
    <div class="device-list">
      <div class="card">
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; font-size: 20px; color: var(--text-primary);">设备列表</h2>
          <div style="display: flex; gap: 12px;">
            <el-input
              v-model="searchText"
              placeholder="搜索设备名称或ID"
              style="width: 300px;"
              clearable
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

        <el-table
          :data="filteredDevices"
          stripe
          v-loading="loading"
          style="width: 100%"
        >
          <el-table-column prop="id" label="设备ID" width="120" />
          <el-table-column prop="name" label="设备名称" width="180" />
          <el-table-column prop="type" label="设备类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getDeviceTypeTag(row.type)">
                {{ getDeviceTypeName(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="运行状态" width="100">
            <template #default="{ row }">
              <span :class="['status-badge', row.status]">
                {{ getStatusName(row.status) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="location" label="位置" width="160" />
          <el-table-column prop="voltage" label="电压(V)" width="100">
            <template #default="{ row }">
              <span :style="{ color: getValueColor(row.voltage, 380, 420) }">
                {{ row.voltage.toFixed(1) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="current" label="电流(A)" width="100">
            <template #default="{ row }">
              {{ row.current.toFixed(1) }}
            </template>
          </el-table-column>
          <el-table-column prop="power" label="功率(kW)" width="100">
            <template #default="{ row }">
              {{ row.power.toFixed(1) }}
            </template>
          </el-table-column>
          <el-table-column prop="temperature" label="温度(°C)" width="100">
            <template #default="{ row }">
              <span :style="{ color: getTempColor(row.temperature) }">
                {{ row.temperature.toFixed(1) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="lastUpdate" label="更新时间" width="180">
            <template #default="{ row }">
              {{ formatTime(row.lastUpdate) }}
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
      >
        <div v-if="selectedDevice">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="设备ID">{{ selectedDevice.id }}</el-descriptions-item>
            <el-descriptions-item label="设备名称">{{ selectedDevice.name }}</el-descriptions-item>
            <el-descriptions-item label="设备类型">{{ getDeviceTypeName(selectedDevice.type) }}</el-descriptions-item>
            <el-descriptions-item label="运行状态">
              <span :class="['status-badge', selectedDevice.status]">
                {{ getStatusName(selectedDevice.status) }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="位置">{{ selectedDevice.location }}</el-descriptions-item>
            <el-descriptions-item label="电压">{{ selectedDevice.voltage.toFixed(2) }} V</el-descriptions-item>
            <el-descriptions-item label="电流">{{ selectedDevice.current.toFixed(2) }} A</el-descriptions-item>
            <el-descriptions-item label="功率">{{ selectedDevice.power.toFixed(2) }} kW</el-descriptions-item>
            <el-descriptions-item label="温度">{{ selectedDevice.temperature.toFixed(2) }} °C</el-descriptions-item>
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
import { Search } from '@element-plus/icons-vue'
import type { Device } from '../types'

const deviceStore = useDeviceStore()
const { devices, loading } = toRefs(deviceStore)

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
    result = result.filter(device =>
      device.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
      device.id.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }

  // 状态过滤
  if (filterStatus.value) {
    result = result.filter(device => device.status === filterStatus.value)
  }

  return result
})

const getDeviceTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    transformer: '变压器',
    switch: '开关柜',
    sensor: '传感器',
    breaker: '断路器',
    capacitor: '电容器'
  }
  return typeMap[type] || type
}

const getDeviceTypeTag = (type: string) => {
  const tagMap: Record<string, string> = {
    transformer: 'danger',
    switch: 'warning',
    sensor: 'info',
    breaker: 'success',
    capacitor: ''
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
</style>
