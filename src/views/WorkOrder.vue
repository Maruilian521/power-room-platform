<template>
  <div class="page-container">
    <div class="work-order">
      <!-- 统计看板 (Clickable) -->
      <div class="grid grid-cols-4" style="margin-bottom: 20px;">
        <div 
          class="stat-card-item" 
          :class="{ active: filterStatus === '' }" 
          @click="filterStatus = ''"
        >
          <div class="icon-wrapper">
            <el-icon><Document /></el-icon>
          </div>
          <div class="info">
            <div class="label">总工单</div>
            <div class="value">{{ totalCount }}</div>
          </div>
        </div>

        <div 
          class="stat-card-item warning"
          :class="{ active: filterStatus === 'pending' }"
          @click="filterStatus = 'pending'"
        >
          <div class="icon-wrapper">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="info">
            <div class="label">待处理</div>
            <div class="value">{{ pendingCount }}</div>
          </div>
        </div>

        <div 
          class="stat-card-item info"
          :class="{ active: filterStatus === 'in-progress' }"
          @click="filterStatus = 'in-progress'"
        >
          <div class="icon-wrapper">
            <el-icon><Loading /></el-icon>
          </div>
          <div class="info">
            <div class="label">进行中</div>
            <div class="value">{{ inProgressCount }}</div>
          </div>
        </div>

        <div 
          class="stat-card-item success"
          :class="{ active: filterStatus === 'completed' }"
          @click="filterStatus = 'completed'"
        >
          <div class="icon-wrapper">
            <el-icon><Select /></el-icon>
          </div>
          <div class="info">
            <div class="label">已完成</div>
            <div class="value">{{ completedCount }}</div>
          </div>
        </div>
      </div>

      <!-- 主体内容区 -->
      <div class="module-card">
        <div class="module-header">
           <span class="title">工单管理中心</span>
        </div>
        
        <div class="toolbar">
          <div class="left-tools">
             <!-- Quick filters if needed -->
          </div>
          <div class="right-tools">
            <el-input
              v-model="searchText"
              placeholder="搜索工单/设备/站点"
              style="width: 250px;"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            
            <el-select v-model="filterType" placeholder="类型" clearable style="width: 120px;">
              <el-option label="维修" value="repair" />
              <el-option label="保养" value="maintenance" />
              <el-option label="巡检" value="inspection" />
              <el-option label="紧急" value="emergency" />
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
          class="sc2-table"
        >
          <!-- 1. 状态/优先级 -->
          <el-table-column label="状态" width="80" align="center">
            <template #default="{ row }">
               <div class="status-indicator">
                  <el-icon v-if="row.priority === 'urgent'" class="priority-icon urgent" title="紧急"><WarningFilled /></el-icon>
                  <el-icon v-else-if="row.priority === 'high'" class="priority-icon high" title="高"><Top /></el-icon>
                  <div v-else class="status-dot" :class="row.status"></div>
               </div>
            </template>
          </el-table-column>

          <!-- 2. 工单标题 & ID -->
          <el-table-column label="工单信息" min-width="250">
            <template #default="{ row }">
              <div class="title-cell">
                <span class="wo-title" :class="{ 'text-danger': isOverdue(row) }">{{ row.title }}</span>
                <span class="wo-id">{{ row.id }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- 3. 所属站点 (Core) -->
          <el-table-column prop="roomName" label="所属站点" width="180">
             <template #default="{ row }">
                <span class="site-text">{{ row.roomName }}</span>
             </template>
          </el-table-column>

          <!-- 4. 关联对象 -->
          <el-table-column prop="deviceName" label="关联对象" width="150" show-overflow-tooltip />

          <!-- 5. 工单类型 -->
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getTypeTag(row.type)" effect="dark">
                {{ getTypeName(row.type) }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 6. 处理人 -->
          <el-table-column prop="assignee" label="负责人" width="100">
             <template #default="{ row }">
                <div class="user-cell">
                   <el-avatar :size="24" icon="UserFilled" class="small-avatar" />
                   <span>{{ row.assignee }}</span>
                </div>
             </template>
          </el-table-column>

          <!-- 7. 时效 -->
          <el-table-column label="时效" width="160">
            <template #default="{ row }">
              <div class="time-cell">
                <div class="create-time">{{ formatTimeShort(row.createTime) }}</div>
                <div v-if="row.status !== 'completed'" class="deadline-tag" :class="getDeadlineClass(row)">
                   {{ getDeadlineText(row) }}
                </div>
              </div>
            </template>
          </el-table-column>

          <!-- 8. 操作 -->
          <el-table-column label="操作" fixed="right" width="150">
            <template #default="{ row }">
              <el-button size="small" link type="primary" @click="viewWorkOrder(row)">详情</el-button>
              <el-button 
                v-if="row.status !== 'completed' && row.status !== 'cancelled'"
                size="small" 
                link 
                type="warning" 
                @click="handleWorkOrder(row)"
              >
                处理
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

      <!-- 工单详情/处理对话框 -->
      <el-dialog
        v-model="detailVisible"
        :title="isHandling ? '工单处理' : '工单详情'"
        width="700px"
        class="sc2-dialog"
      >
        <div v-if="selectedWorkOrder" class="sc2-info-panel detail-container">
          <!-- Header -->
          <div class="detail-header" :class="selectedWorkOrder.priority">
             <div class="header-main">
                <span class="wo-id-badge">{{ selectedWorkOrder.id }}</span>
                <span class="title">{{ selectedWorkOrder.title }}</span>
             </div>
             <el-tag :type="getStatusTag(selectedWorkOrder.status)">{{ getStatusName(selectedWorkOrder.status) }}</el-tag>
          </div>

          <div class="detail-body">
             <!-- Info Grid -->
             <div class="info-grid">
                <div class="info-item">
                    <span class="label">所属站点:</span>
                    <span class="val highlight">{{ selectedWorkOrder.roomName }}</span>
                </div>
                <div class="info-item">
                    <span class="label">关联设备:</span>
                    <span class="val">{{ selectedWorkOrder.deviceName }}</span>
                </div>
                <div class="info-item">
                    <span class="label">工单类型:</span>
                    <span class="val">{{ getTypeName(selectedWorkOrder.type) }}</span>
                </div>
                <div class="info-item">
                    <span class="label">负责人:</span>
                    <span class="val">{{ selectedWorkOrder.assignee }}</span>
                </div>
                <div class="info-item">
                    <span class="label">创建时间:</span>
                    <span class="val">{{ formatTime(selectedWorkOrder.createTime) }}</span>
                </div>
                <div class="info-item">
                    <span class="label">截止时间:</span>
                    <span class="val text-danger">{{ formatTime(selectedWorkOrder.deadline || '') }}</span>
                </div>
             </div>

             <div class="message-box">
                <div class="label">工单描述</div>
                <div class="content">{{ selectedWorkOrder.description }}</div>
             </div>

             <!-- Processing Form -->
             <div v-if="isHandling" class="process-section">
                <el-divider content-position="left">处理反馈</el-divider>
                <el-form label-width="80px">
                    <el-form-item label="流转动作">
                        <el-radio-group v-model="handleAction">
                            <el-radio label="in-progress">开始处理</el-radio>
                            <el-radio label="completed">完成工单</el-radio>
                            <el-radio label="transfer">转派</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="处理说明">
                        <el-input type="textarea" v-model="handleNote" rows="3" placeholder="请���入处理情况..." />
                    </el-form-item>
                </el-form>
             </div>
          </div>
        </div>
        <template #footer>
          <el-button @click="detailVisible = false">关闭</el-button>
          <el-button v-if="isHandling" type="primary" @click="confirmHandle">提交处理</el-button>
          <el-button v-else-if="selectedWorkOrder?.status !== 'completed'" type="warning" @click="switchToHandle">去处理</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, toRefs } from 'vue'
import { useDeviceStore } from '../stores/device'
import { ElMessage } from 'element-plus'
import { 
    Search, Document, Clock, Loading, Select, Plus, 
    WarningFilled, Top
} from '@element-plus/icons-vue'
import type { WorkOrder } from '../types'

const deviceStore = useDeviceStore()
const { workOrders, loading } = toRefs(deviceStore)

const searchText = ref('')
const filterType = ref('')
const filterStatus = ref('') // Can be set by clicking KPI cards
const currentPage = ref(1)
const pageSize = ref(20)

// Dialog State
const detailVisible = ref(false)
const selectedWorkOrder = ref<WorkOrder | null>(null)
const isHandling = ref(false)
const handleAction = ref('in-progress')
const handleNote = ref('')

const filteredWorkOrders = computed(() => {
  let result = workOrders.value

  // 搜索过滤 (Title, Device, Site)
  if (searchText.value) {
    const lowerSearch = searchText.value.toLowerCase()
    result = result.filter(wo =>
      wo.title.toLowerCase().includes(lowerSearch) ||
      wo.deviceName.toLowerCase().includes(lowerSearch) ||
      (wo.roomName && wo.roomName.toLowerCase().includes(lowerSearch))
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

// Helpers
const getTypeName = (type: string) => {
  const map: Record<string, string> = { repair: '维修', maintenance: '保养', inspection: '巡检', emergency: '紧急' }
  return map[type] || type
}

const getTypeTag = (type: string) => {
  const map: Record<string, string> = { repair: 'warning', maintenance: 'info', inspection: 'success', emergency: 'danger' }
  return map[type] || ''
}

const getStatusName = (status: string) => {
  const map: Record<string, string> = { pending: '待处理', assigned: '已分配', 'in-progress': '进行中', completed: '已完成', cancelled: '已取消' }
  return map[status] || status
}

const getStatusTag = (status: string) => {
  const map: Record<string, string> = { pending: 'danger', assigned: 'warning', 'in-progress': 'primary', completed: 'success', cancelled: 'info' }
  return map[status] || ''
}

const formatTime = (time: string) => new Date(time).toLocaleString('zh-CN')
const formatTimeShort = (time: string) => {
    const d = new Date(time)
    return `${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2,'0')}`
}

// Deadline Logic
const isOverdue = (row: WorkOrder) => {
    if (!row.deadline || row.status === 'completed') return false
    return new Date() > new Date(row.deadline)
}

const getDeadlineClass = (row: WorkOrder) => {
    if (isOverdue(row)) return 'overdue'
    return 'normal'
}

const getDeadlineText = (row: WorkOrder) => {
    if (!row.deadline) return ''
    if (isOverdue(row)) return '已超时'
    // Calc remaining hours
    const diff = new Date(row.deadline).getTime() - new Date().getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 24) return `剩余 ${hours}h`
    return `剩余 ${Math.floor(hours/24)}天`
}

// Actions
const viewWorkOrder = (row: WorkOrder) => {
  selectedWorkOrder.value = row
  isHandling.value = false
  detailVisible.value = true
}

const handleWorkOrder = (row: WorkOrder) => {
  selectedWorkOrder.value = row
  isHandling.value = true
  handleAction.value = row.status === 'pending' ? 'assigned' : 'in-progress' // Default next step
  handleNote.value = ''
  detailVisible.value = true
}

const switchToHandle = () => {
    isHandling.value = true
}

const createWorkOrder = () => {
  ElMessage.info('新建工单功能开发中...')
}

const confirmHandle = async () => {
  if (!selectedWorkOrder.value) return
  
  await deviceStore.updateWorkOrderStatus(selectedWorkOrder.value.id, handleAction.value as WorkOrder['status'])
  ElMessage.success('处理成功')
  detailVisible.value = false
}

onMounted(() => {
  deviceStore.fetchWorkOrders()
})
</script>

<style scoped>
.work-order {
  animation: fadeIn 0.5s ease-out;
}

/* KPI Cards - Interactive */
.stat-card-item {
    cursor: pointer;
    /* Inherits global .stat-card-item styles */
    border: 1px solid rgba(0, 240, 255, 0.1);
}
.stat-card-item.active {
    background: rgba(0, 240, 255, 0.15);
    border-color: var(--tech-primary);
    box-shadow: 0 0 15px rgba(0, 240, 255, 0.2);
}
.stat-card-item.warning.active { border-color: var(--status-warning); background: rgba(255, 214, 0, 0.15); }
.stat-card-item.success.active { border-color: var(--status-success); background: rgba(0, 230, 118, 0.15); }

/* Toolbar */
.toolbar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}
.right-tools {
    display: flex;
    gap: 12px;
}

/* Table Styles */
.status-indicator {
    display: flex;
    justify-content: center;
    align-items: center;
}
.priority-icon { font-size: 18px; }
.priority-icon.urgent { color: var(--status-danger); animation: pulse 1s infinite; }
.priority-icon.high { color: var(--status-warning); }

.status-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--text-sub);
}
.status-dot.pending { background: var(--status-danger); }
.status-dot.assigned { background: var(--status-warning); }
.status-dot.in-progress { background: var(--tech-primary); box-shadow: 0 0 5px var(--tech-primary); }
.status-dot.completed { background: var(--status-success); }

.title-cell {
    display: flex;
    flex-direction: column;
}
.wo-title {
    font-weight: 600;
    color: var(--text-bright);
    font-size: 14px;
    margin-bottom: 2px;
}
.wo-id {
    font-size: 11px;
    color: var(--text-sub);
    font-family: 'Rajdhani';
}
.text-danger { color: var(--status-danger) !important; }

.site-text {
    font-weight: 600;
    color: var(--tech-secondary);
}

.user-cell {
    display: flex;
    align-items: center;
    gap: 6px;
}
.small-avatar { background: var(--tech-primary); }

.time-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
}
.create-time { font-size: 12px; color: var(--text-sub); }
.deadline-tag {
    display: inline-block;
    font-size: 10px;
    padding: 0 4px;
    border-radius: 2px;
    width: fit-content;
}
.deadline-tag.overdue { color: #fff; background: var(--status-danger); }
.deadline-tag.normal { color: var(--status-warning); background: rgba(255, 214, 0, 0.1); }

/* Dialog */
.wo-id-badge {
    background: rgba(0,0,0,0.3);
    padding: 2px 6px;
    border: 1px solid var(--tech-primary);
    color: var(--tech-primary);
    font-family: 'Rajdhani';
    font-weight: bold;
    margin-right: 10px;
    font-size: 12px;
}

@keyframes pulse { 50% { opacity: 0.5; } }
</style>