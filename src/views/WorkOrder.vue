<template>
  <div class="page-container">
    <div class="work-order">
      <!-- 统计卡片 -->
      <div class="grid grid-cols-4" style="margin-bottom: 20px;">
        <div class="stat-card">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">总工单</div>
              <div style="font-size: 28px; font-weight: 700; color: var(--color-primary);">
                {{ totalCount }}
              </div>
            </div>
            <el-icon size="48" color="rgba(24, 144, 255, 0.3)"><Document /></el-icon>
          </div>
        </div>

        <div class="stat-card warning">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">待处理</div>
              <div style="font-size: 28px; font-weight: 700; color: var(--color-warning);">
                {{ pendingCount }}
              </div>
            </div>
            <el-icon size="48" color="rgba(255, 181, 71, 0.3)"><Clock /></el-icon>
          </div>
        </div>

        <div class="stat-card info">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">进行中</div>
              <div style="font-size: 28px; font-weight: 700; color: var(--color-info);">
                {{ inProgressCount }}
              </div>
            </div>
            <el-icon size="48" color="rgba(33, 150, 243, 0.3)"><Loading /></el-icon>
          </div>
        </div>

        <div class="stat-card success">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">已完成</div>
              <div style="font-size: 28px; font-weight: 700; color: var(--color-success);">
                {{ completedCount }}
              </div>
            </div>
            <el-icon size="48" color="rgba(70, 211, 154, 0.3)"><Select /></el-icon>
          </div>
        </div>
      </div>

      <div class="card">
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; font-size: 20px; color: var(--text-primary);">工单列表</h2>
          <div style="display: flex; gap: 12px;">
            <el-input
              v-model="searchText"
              placeholder="搜索工单标题或设备"
              style="width: 300px;"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="filterType" placeholder="筛选类型" clearable style="width: 120px;">
              <el-option label="全部" value="" />
              <el-option label="维修" value="repair" />
              <el-option label="保养" value="maintenance" />
              <el-option label="巡检" value="inspection" />
              <el-option label="紧急" value="emergency" />
            </el-select>
            <el-select v-model="filterStatus" placeholder="筛选状态" clearable style="width: 120px;">
              <el-option label="全部" value="" />
              <el-option label="待处理" value="pending" />
              <el-option label="已分配" value="assigned" />
              <el-option label="进行中" value="in-progress" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
            <el-button type="primary" @click="createWorkOrder">
              <el-icon><Plus /></el-icon>
              新建工单
            </el-button>
          </div>
        </div>

        <el-table
          :data="paginatedWorkOrders"
          stripe
          v-loading="loading"
          style="width: 100%"
        >
          <el-table-column prop="id" label="工单ID" width="120" />
          <el-table-column prop="title" label="工单标题" min-width="200" show-overflow-tooltip />
          <el-table-column prop="type" label="工单类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getTypeTag(row.type)">
                {{ getTypeName(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="deviceName" label="设备名称" width="150" />
          <el-table-column prop="priority" label="优先级" width="100">
            <template #default="{ row }">
              <el-tag
                :type="row.priority === 'urgent' ? 'danger' : row.priority === 'high' ? 'warning' : row.priority === 'medium' ? 'info' : ''"
                effect="dark"
              >
                {{ getPriorityName(row.priority) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusTag(row.status)" size="small">
                {{ getStatusName(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="assignee" label="负责人" width="100" />
          <el-table-column prop="createTime" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatTime(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="200">
            <template #default="{ row }">
              <el-button size="small" type="primary" link @click="viewWorkOrder(row)">
                详情
              </el-button>
              <el-button
                v-if="row.status !== 'completed' && row.status !== 'cancelled'"
                size="small"
                type="success"
                link
                @click="updateStatus(row)"
              >
                更新状态
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
            :total="filteredWorkOrders.length"
          />
        </div>
      </div>

      <!-- 工单详情对话框 -->
      <el-dialog
        v-model="detailVisible"
        title="工单详情"
        width="700px"
      >
        <div v-if="selectedWorkOrder">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="工单ID">{{ selectedWorkOrder.id }}</el-descriptions-item>
            <el-descriptions-item label="工单类型">
              <el-tag :type="getTypeTag(selectedWorkOrder.type)">
                {{ getTypeName(selectedWorkOrder.type) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="工单标题" :span="2">{{ selectedWorkOrder.title }}</el-descriptions-item>
            <el-descriptions-item label="设备ID">{{ selectedWorkOrder.deviceId }}</el-descriptions-item>
            <el-descriptions-item label="设备名称">{{ selectedWorkOrder.deviceName }}</el-descriptions-item>
            <el-descriptions-item label="优先级">
              <el-tag
                :type="selectedWorkOrder.priority === 'urgent' ? 'danger' : selectedWorkOrder.priority === 'high' ? 'warning' : selectedWorkOrder.priority === 'medium' ? 'info' : ''"
                effect="dark"
              >
                {{ getPriorityName(selectedWorkOrder.priority) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusTag(selectedWorkOrder.status)">
                {{ getStatusName(selectedWorkOrder.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="负责人">{{ selectedWorkOrder.assignee }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatTime(selectedWorkOrder.createTime) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatTime(selectedWorkOrder.updateTime) }}</el-descriptions-item>
            <el-descriptions-item v-if="selectedWorkOrder.completeTime" label="完成时间">
              {{ formatTime(selectedWorkOrder.completeTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="工单描述" :span="2">
              {{ selectedWorkOrder.description }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <template #footer>
          <el-button @click="detailVisible = false">关闭</el-button>
          <el-button
            v-if="selectedWorkOrder && selectedWorkOrder.status !== 'completed' && selectedWorkOrder.status !== 'cancelled'"
            type="primary"
            @click="updateStatus(selectedWorkOrder)"
          >
            更新状态
          </el-button>
        </template>
      </el-dialog>

      <!-- 更新状态对话框 -->
      <el-dialog
        v-model="statusVisible"
        title="更新工单状态"
        width="400px"
      >
        <el-form label-width="80px">
          <el-form-item label="当前状态">
            <el-tag :type="getStatusTag(selectedWorkOrder?.status || '')">
              {{ getStatusName(selectedWorkOrder?.status || '') }}
            </el-tag>
          </el-form-item>
          <el-form-item label="新状态">
            <el-select v-model="newStatus" placeholder="请选择新状态" style="width: 100%;">
              <el-option label="待处理" value="pending" />
              <el-option label="已分配" value="assigned" />
              <el-option label="进行中" value="in-progress" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="statusVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmUpdateStatus">确定</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, toRefs } from 'vue'
import { useDeviceStore } from '../stores/device'
import { ElMessage } from 'element-plus'
import { Search, Document, Clock, Loading, Select, Plus } from '@element-plus/icons-vue'
import type { WorkOrder } from '../types'

const deviceStore = useDeviceStore()
const { workOrders, loading } = toRefs(deviceStore)

const searchText = ref('')
const filterType = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const detailVisible = ref(false)
const statusVisible = ref(false)
const selectedWorkOrder = ref<WorkOrder | null>(null)
const newStatus = ref('')

const filteredWorkOrders = computed(() => {
  let result = workOrders.value

  // 搜索过滤
  if (searchText.value) {
    result = result.filter(wo =>
      wo.title.toLowerCase().includes(searchText.value.toLowerCase()) ||
      wo.deviceName.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }

  // 类型过滤
  if (filterType.value) {
    result = result.filter(wo => wo.type === filterType.value)
  }

  // 状态过滤
  if (filterStatus.value) {
    result = result.filter(wo => wo.status === filterStatus.value)
  }

  return result
})

const paginatedWorkOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredWorkOrders.value.slice(start, end)
})

const totalCount = computed(() => workOrders.value.length)
const pendingCount = computed(() => workOrders.value.filter(wo => wo.status === 'pending').length)
const inProgressCount = computed(() => workOrders.value.filter(wo => wo.status === 'in-progress').length)
const completedCount = computed(() => workOrders.value.filter(wo => wo.status === 'completed').length)

const getTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    repair: '维修',
    maintenance: '保养',
    inspection: '巡检',
    emergency: '紧急'
  }
  return typeMap[type] || type
}

const getTypeTag = (type: string) => {
  const tagMap: Record<string, string> = {
    repair: 'warning',
    maintenance: 'info',
    inspection: 'success',
    emergency: 'danger'
  }
  return tagMap[type] || ''
}

const getPriorityName = (priority: string) => {
  const priorityMap: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  }
  return priorityMap[priority] || priority
}

const getStatusName = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待处理',
    assigned: '已分配',
    'in-progress': '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

const getStatusTag = (status: string) => {
  const tagMap: Record<string, string> = {
    pending: 'info',
    assigned: 'warning',
    'in-progress': 'primary',
    completed: 'success',
    cancelled: 'danger'
  }
  return tagMap[status] || ''
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

const viewWorkOrder = (workOrder: WorkOrder) => {
  selectedWorkOrder.value = workOrder
  detailVisible.value = true
}

const createWorkOrder = () => {
  ElMessage.info('新建工单功能开发中...')
}

const updateStatus = (workOrder: WorkOrder) => {
  selectedWorkOrder.value = workOrder
  newStatus.value = workOrder.status
  statusVisible.value = true
  detailVisible.value = false
}

const confirmUpdateStatus = async () => {
  if (!selectedWorkOrder.value || !newStatus.value) return

  await deviceStore.updateWorkOrderStatus(selectedWorkOrder.value.id, newStatus.value as WorkOrder['status'])
  ElMessage.success('工单状态更新成功')
  statusVisible.value = false
  selectedWorkOrder.value = null
}

onMounted(() => {
  deviceStore.fetchWorkOrders()
})
</script>

<style scoped>
.work-order {
  animation: fadeIn 0.5s ease-out;
}
</style>
