<template>
  <div class="page-container">
    <div class="alarm-list">
      <!-- 统计卡片 -->
      <div class="grid grid-cols-3" style="margin-bottom: 20px;">
        <div class="stat-card danger">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">严重告警</div>
              <div style="font-size: 28px; font-weight: 700; color: var(--color-danger);">
                {{ criticalCount }}
              </div>
            </div>
            <el-icon size="48" color="rgba(255, 82, 82, 0.3)"><CircleClose /></el-icon>
          </div>
        </div>

        <div class="stat-card warning">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">告警预警</div>
              <div style="font-size: 28px; font-weight: 700; color: var(--color-warning);">
                {{ warningCount }}
              </div>
            </div>
            <el-icon size="48" color="rgba(255, 181, 71, 0.3)"><Warning /></el-icon>
          </div>
        </div>

        <div class="stat-card info">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">一般信息</div>
              <div style="font-size: 28px; font-weight: 700; color: var(--color-info);">
                {{ infoCount }}
              </div>
            </div>
            <el-icon size="48" color="rgba(33, 150, 243, 0.3)"><InfoFilled /></el-icon>
          </div>
        </div>
      </div>

      <div class="card">
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; font-size: 20px; color: var(--text-primary);">告警列表</h2>
          <div style="display: flex; gap: 12px;">
            <el-input
              v-model="searchText"
              placeholder="搜索设备或告警类型"
              style="width: 300px;"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="filterLevel" placeholder="筛选级别" clearable style="width: 120px;">
              <el-option label="全部" value="" />
              <el-option label="严重" value="critical" />
              <el-option label="告警" value="warning" />
              <el-option label="信息" value="info" />
            </el-select>
            <el-select v-model="filterStatus" placeholder="筛选状态" clearable style="width: 120px;">
              <el-option label="全部" value="" />
              <el-option label="待处理" value="pending" />
              <el-option label="处理中" value="processing" />
              <el-option label="已解决" value="resolved" />
            </el-select>
          </div>
        </div>

        <el-table
          :data="paginatedAlarms"
          stripe
          v-loading="loading"
          style="width: 100%"
        >
          <el-table-column prop="id" label="告警ID" width="140" />
          <el-table-column prop="deviceName" label="设备名称" width="150" />
          <el-table-column prop="level" label="告警级别" width="100">
            <template #default="{ row }">
              <el-tag
                :type="row.level === 'critical' ? 'danger' : row.level === 'warning' ? 'warning' : 'info'"
                effect="dark"
              >
                {{ getLevelName(row.level) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="告警类型" width="120" />
          <el-table-column prop="message" label="告警信息" min-width="250" show-overflow-tooltip />
          <el-table-column prop="time" label="告警时间" width="180">
            <template #default="{ row }">
              {{ formatTime(row.time) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="处理状态" width="100">
            <template #default="{ row }">
              <el-tag
                :type="getStatusTag(row.status)"
                size="small"
              >
                {{ getStatusName(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="200">
            <template #default="{ row }">
              <el-button size="small" type="primary" link @click="viewAlarm(row)">
                详情
              </el-button>
              <el-button
                v-if="row.status === 'pending'"
                size="small"
                type="warning"
                link
                @click="processAlarm(row)"
              >
                处理
              </el-button>
              <el-button
                v-if="row.status === 'processing'"
                size="small"
                type="success"
                link
                @click="resolveAlarm(row)"
              >
                解决
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
            :total="filteredAlarms.length"
          />
        </div>
      </div>

      <!-- 告警详情对话框 -->
      <el-dialog
        v-model="detailVisible"
        title="告警详情"
        width="600px"
      >
        <div v-if="selectedAlarm">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="告警ID">{{ selectedAlarm.id }}</el-descriptions-item>
            <el-descriptions-item label="设备ID">{{ selectedAlarm.deviceId }}</el-descriptions-item>
            <el-descriptions-item label="设备名称">{{ selectedAlarm.deviceName }}</el-descriptions-item>
            <el-descriptions-item label="告警级别">
              <el-tag
                :type="selectedAlarm.level === 'critical' ? 'danger' : selectedAlarm.level === 'warning' ? 'warning' : 'info'"
                effect="dark"
              >
                {{ getLevelName(selectedAlarm.level) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="告警类型">{{ selectedAlarm.type }}</el-descriptions-item>
            <el-descriptions-item label="告警时间">{{ formatTime(selectedAlarm.time) }}</el-descriptions-item>
            <el-descriptions-item label="处理状态">
              <el-tag :type="getStatusTag(selectedAlarm.status)">
                {{ getStatusName(selectedAlarm.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="告警信息" :span="2">
              {{ selectedAlarm.message }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <template #footer>
          <el-button @click="detailVisible = false">关闭</el-button>
          <el-button
            v-if="selectedAlarm?.status === 'pending'"
            type="warning"
            @click="processAlarm(selectedAlarm)"
          >
            开始处理
          </el-button>
          <el-button
            v-if="selectedAlarm?.status === 'processing'"
            type="success"
            @click="resolveAlarm(selectedAlarm)"
          >
            标记为已解决
          </el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, toRefs } from 'vue'
import { useDeviceStore } from '../stores/device'
import { ElMessage } from 'element-plus'
import { Search, CircleClose, Warning, InfoFilled } from '@element-plus/icons-vue'
import type { Alarm } from '../types'

const deviceStore = useDeviceStore()
const { alarms, loading } = toRefs(deviceStore)

const searchText = ref('')
const filterLevel = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const detailVisible = ref(false)
const selectedAlarm = ref<Alarm | null>(null)

const filteredAlarms = computed(() => {
  let result = alarms.value

  // 搜索过滤
  if (searchText.value) {
    result = result.filter(alarm =>
      alarm.deviceName.toLowerCase().includes(searchText.value.toLowerCase()) ||
      alarm.type.toLowerCase().includes(searchText.value.toLowerCase()) ||
      alarm.message.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }

  // 级别过滤
  if (filterLevel.value) {
    result = result.filter(alarm => alarm.level === filterLevel.value)
  }

  // 状态过滤
  if (filterStatus.value) {
    result = result.filter(alarm => alarm.status === filterStatus.value)
  }

  return result
})

const paginatedAlarms = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredAlarms.value.slice(start, end)
})

const criticalCount = computed(() => alarms.value.filter(a => a.level === 'critical').length)
const warningCount = computed(() => alarms.value.filter(a => a.level === 'warning').length)
const infoCount = computed(() => alarms.value.filter(a => a.level === 'info').length)

const getLevelName = (level: string) => {
  const levelMap: Record<string, string> = {
    critical: '严重',
    warning: '告警',
    info: '信息'
  }
  return levelMap[level] || level
}

const getStatusName = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决'
  }
  return statusMap[status] || status
}

const getStatusTag = (status: string) => {
  const tagMap: Record<string, string> = {
    pending: 'danger',
    processing: 'warning',
    resolved: 'success'
  }
  return tagMap[status] || ''
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

const viewAlarm = (alarm: Alarm) => {
  selectedAlarm.value = alarm
  detailVisible.value = true
}

const processAlarm = (alarm: Alarm) => {
  ElMessage.success(`告警 ${alarm.id} 开始处理`)
  // 这里可以调用API更新告警状态
  detailVisible.value = false
}

const resolveAlarm = (alarm: Alarm) => {
  ElMessage.success(`告警 ${alarm.id} 已标记为已解决`)
  // 这里可以调用API更新告警状态
  detailVisible.value = false
}

onMounted(() => {
  deviceStore.fetchAlarms()
})
</script>

<style scoped>
.alarm-list {
  animation: fadeIn 0.5s ease-out;
}
</style>
