<template>
  <div class="page-container ticket-page">
    <!-- 顶部 KPI -->
    <div class="ticket-stats grid grid-cols-4">
      <div class="stat-card-item danger">
        <div class="icon-wrapper"><el-icon><WarningFilled /></el-icon></div>
        <div class="info">
          <div class="label">待签发/审批</div>
          <div class="value">{{ auditCount }}</div>
        </div>
      </div>
      <div class="stat-card-item success">
        <div class="icon-wrapper"><el-icon><VideoPlay /></el-icon></div>
        <div class="info">
          <div class="label">执行中/许可中</div>
          <div class="value">{{ executingCount }}</div>
        </div>
      </div>
      <div class="stat-card-item info">
        <div class="icon-wrapper"><el-icon><FolderChecked /></el-icon></div>
        <div class="info">
          <div class="label">已归档</div>
          <div class="value">{{ finishedCount }}</div>
        </div>
      </div>
      <div class="stat-card-item primary">
        <div class="icon-wrapper"><el-icon><PieChart /></el-icon></div>
        <div class="info">
          <div class="label">本月合格率</div>
          <div class="value">99.2%</div>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="module-card main-area">
      <!-- 顶部 Tabs -->
      <div class="module-header">
        <div class="header-left">
          <el-radio-group v-model="activeType" class="sc2-radio-group" @change="handleTypeChange">
            <el-radio-button label="work">工作票管理</el-radio-button>
            <el-radio-button label="operation">操作票管理</el-radio-button>
          </el-radio-group>
        </div>
        <div class="header-right">
          <el-input v-model="searchQuery" placeholder="搜索票号/任务..." :prefix-icon="Search" class="search-input" />
          <el-button type="primary"><el-icon><Plus /></el-icon> 开票</el-button>
        </div>
      </div>

      <!-- 工作票表格 -->
      <el-table
        v-if="activeType === 'work'"
        :data="paginatedTickets"
        class="sc2-table"
        stripe
        v-loading="loading"
      >
        <el-table-column prop="no" label="票号" width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="ticket-no">{{ row.no }}</span>
          </template>
        </el-table-column>
        <el-table-column label="票种" width="140">
          <template #default="{ row }">
            <el-tag :type="row.category === 'work_1' ? 'danger' : 'primary'" effect="dark" class="ticket-tag">
              {{ row.category === 'work_1' ? '第一种工作票' : '第二种工作票' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="stationName" label="所属站点" width="180" />
        <el-table-column prop="task" label="工作任务" min-width="200" show-overflow-tooltip />
        <el-table-column label="当前环节" width="120">
          <template #default="{ row }">
            <div class="step-capsule" :class="row.status">
              {{ row.currentStep }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="关键人员" width="180">
          <template #default="{ row }">
            <div class="person-row">
              <span class="role">负责人:</span> <span class="name">{{ row.leader }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="时间范围" width="200">
          <template #default="{ row }">
            <div class="time-range">
              <div>{{ formatDate(row.startTime) }}</div>
              <div class="to">TO</div>
              <div>{{ formatDate(row.endTime) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="180">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewTicket(row)">详情</el-button>
            <el-button link type="success" size="small" v-if="row.status === 'permit'">许可</el-button>
            <el-button link type="warning" size="small" v-if="row.status === 'audit'">签发</el-button>
            <el-button link size="small" icon="Printer">打印</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 操作票表格 -->
      <el-table
        v-else
        :data="paginatedTickets"
        class="sc2-table"
        stripe
        v-loading="loading"
      >
        <el-table-column prop="no" label="票号" width="160" />
        <el-table-column label="票种" width="120">
          <template #default>
            <el-tag color="#6200ea" effect="dark" class="ticket-tag op-tag">倒闸操作票</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="stationName" label="所属站点" width="180" />
        <el-table-column prop="task" label="操作任务" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作状态" width="120">
          <template #default="{ row }">
            <div class="step-capsule" :class="row.status">
              {{ row.currentStep }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="监护/操作" width="180">
          <template #default="{ row }">
            <div class="person-row"><span class="role">监护:</span> {{ row.guardian || '-' }}</div>
            <div class="person-row"><span class="role">操作:</span> {{ row.leader }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="220">
          <template #default="{ row }">
            <el-button link type="info" size="small" icon="Monitor" @click="simulateOp(row)">预演</el-button>
            <el-button link type="success" size="small" v-if="row.status === 'executing'">执行</el-button>
            <el-button link type="primary" size="small" @click="viewTicket(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          layout="total, sizes, prev, pager, next"
          :total="filteredData.length"
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="作业票据详情"
      width="900px"
      class="sc2-dialog ticket-dialog"
      destroy-on-close
    >
      <div v-if="currentTicket" class="ticket-viewer">
        <!-- 顶部流程条 -->
        <div class="process-stepper">
          <div class="step active">1. 草稿</div>
          <div class="step-line active"></div>
          <div class="step" :class="{ active: ['audit', 'permit', 'executing', 'finished'].includes(currentTicket.status) }">2. 签发/审核</div>
          <div class="step-line" :class="{ active: ['permit', 'executing', 'finished'].includes(currentTicket.status) }"></div>
          <div class="step" :class="{ active: ['permit', 'executing', 'finished'].includes(currentTicket.status) }">3. 许可/预演</div>
          <div class="step-line" :class="{ active: ['executing', 'finished'].includes(currentTicket.status) }"></div>
          <div class="step" :class="{ active: ['executing', 'finished'].includes(currentTicket.status) }">4. 执行</div>
          <div class="step-line" :class="{ active: currentTicket.status === 'finished' }"></div>
          <div class="step" :class="{ active: currentTicket.status === 'finished' }">5. 终结</div>
        </div>

        <!-- 电子票面 -->
        <div class="digital-ticket-paper">
          <div class="paper-header">
            <h2>{{ currentTicket.category === 'operation' ? '倒闸操作票' : '电力线路工作票' }}</h2>
            <div class="paper-no">NO: {{ currentTicket.no }}</div>
          </div>
          
          <div class="paper-row">
            <span class="label">工作单位:</span> <span class="val">检修一班</span>
            <span class="label ml-4">编号:</span> <span class="val">{{ currentTicket.id }}</span>
          </div>
          <div class="paper-row">
            <span class="label">工作负责人:</span> <span class="val">{{ currentTicket.leader }}</span>
            <span class="label ml-4">班组:</span> <span class="val">变电运维组</span>
          </div>
          <div class="paper-row">
            <span class="label">工作任务:</span> 
            <div class="val content-box">{{ currentTicket.task }}</div>
          </div>
          <div class="paper-row">
            <span class="label">计划时间:</span>
            <span class="val">{{ formatDate(currentTicket.startTime) }} 至 {{ formatDate(currentTicket.endTime) }}</span>
          </div>

          <!-- 安全措施 / 操作步骤 -->
          <div class="paper-section">
            <div class="sec-title">{{ currentTicket.category === 'operation' ? '操作顺序' : '安全措施' }}</div>
            <div class="sec-content">
              <div class="check-item" v-for="i in 3" :key="i">
                <span class="idx">{{ i }}.</span>
                <span class="desc">拉开 10{{i}} 断路器，检查确在断开位置。</span>
                <span class="check-box"></span>
              </div>
            </div>
          </div>

          <!-- 签名区 -->
          <div class="sign-area">
            <div class="sign-box">
              <span class="lbl">签发人:</span>
              <span class="sign-val">李四 (已签)</span>
            </div>
            <div class="sign-box">
              <span class="lbl">许可人:</span>
              <span class="sign-btn">点击签名</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  WarningFilled, VideoPlay, FolderChecked, PieChart, 
  Search, Plus 
} from '@element-plus/icons-vue'
import type { Ticket } from '../types'

const loading = ref(false)
const activeType = ref('work')
const searchQuery = ref('')
const tickets = ref<Ticket[]>([])

// Dialog
const detailVisible = ref(false)
const currentTicket = ref<Ticket | null>(null)

// Fetch Data
const fetchTickets = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/tickets')
    const data = await res.json()
    tickets.value = data.data
  } finally {
    loading.value = false
  }
}

// Computed
const filteredData = computed(() => {
  return tickets.value.filter(t => {
    const typeMatch = activeType.value === 'work' 
      ? (t.category === 'work_1' || t.category === 'work_2')
      : t.category === 'operation'
    const searchMatch = !searchQuery.value || t.no.includes(searchQuery.value) || t.task.includes(searchQuery.value)
    return typeMatch && searchMatch
  })
})

const currentPage = ref(1)
const pageSize = ref(10)
const paginatedTickets = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

// Stats
const auditCount = computed(() => tickets.value.filter(t => t.status === 'audit').length)
const executingCount = computed(() => tickets.value.filter(t => t.status === 'executing' || t.status === 'permit').length)
const finishedCount = computed(() => tickets.value.filter(t => t.status === 'finished').length)

// Actions
const handleTypeChange = () => {
  currentPage.value = 1
}

const formatDate = (str: string) => {
  return new Date(str).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const viewTicket = (row: Ticket) => {
  currentTicket.value = row
  detailVisible.value = true
}

const simulateOp = (row: Ticket) => {
  // Go to topology or simulation view
  console.log('Simulating', row.no)
}

onMounted(() => {
  fetchTickets()
})
</script>

<style scoped>
.ticket-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

/* Stats */
.ticket-stats {
  gap: 20px;
}

.stat-card-item {
  /* Inherits global styles, add specifics */
  cursor: default;
}

/* Header */
.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  padding-bottom: 10px;
}

.sc2-radio-group :deep(.el-radio-button__inner) {
  width: 120px;
}

.header-right {
  display: flex;
  gap: 10px;
}
.search-input { width: 250px; }

/* Table Styling Enhancements */
.ticket-no {
  font-family: 'Rajdhani';
  font-weight: 700;
  color: var(--tech-primary);
  letter-spacing: 1px;
  cursor: pointer;
}
.ticket-no:hover { text-decoration: underline; }

.ticket-tag {
  font-weight: bold;
  font-family: 'Microsoft YaHei';
  letter-spacing: 1px;
}
.op-tag {
  background: rgba(98, 0, 234, 0.2);
  border-color: #6200ea;
  color: #b388ff;
}

.step-capsule {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--text-sub);
}
.step-capsule.audit { border-color: var(--status-danger); color: var(--status-danger); }
.step-capsule.permit { border-color: var(--status-warning); color: var(--status-warning); }
.step-capsule.executing { border-color: var(--status-success); color: var(--status-success); background: rgba(0, 230, 118, 0.1); }

.person-row {
  font-size: 12px;
  margin-bottom: 2px;
}
.person-row .role { color: var(--text-sub); margin-right: 4px; }
.person-row .name { color: var(--text-bright); font-weight: 600; }

.time-range {
  font-size: 12px;
  font-family: 'Rajdhani';
  color: var(--text-sub);
}
.time-range .to { color: var(--tech-secondary); font-size: 10px; margin: 2px 0; }

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* Dialog Styles */
.ticket-viewer {
  padding: 10px;
}

/* Stepper */
.process-stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  padding: 0 20px;
}
.step {
  font-size: 12px;
  color: var(--text-sub);
  position: relative;
}
.step.active { color: var(--tech-primary); font-weight: bold; text-shadow: 0 0 5px var(--tech-primary); }
.step-line { flex: 1; height: 2px; background: rgba(255,255,255,0.1); margin: 0 10px; }
.step-line.active { background: var(--tech-primary); box-shadow: 0 0 5px var(--tech-primary); }

/* Paper */
.digital-ticket-paper {
  background: #fff; /* Real paper look */
  color: #000;
  padding: 30px;
  font-family: "SimSun", serif; /* 宋体，更像打印件 */
  border: 1px solid #ccc;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
  position: relative;
}
/* In dark mode, maybe invert? No, keep it paper-like for realism or adapt */
/* Let's adapt to dark mode SC2 style but "paper" layout */
.digital-ticket-paper {
  background: rgba(10, 16, 24, 0.95);
  color: #cfd8dc;
  border: 2px solid var(--tech-secondary);
  font-family: "Microsoft YaHei", sans-serif;
}

.paper-header {
  text-align: center;
  border-bottom: 2px solid var(--tech-secondary);
  margin-bottom: 20px;
  padding-bottom: 10px;
  position: relative;
}
.paper-header h2 { margin: 0; color: var(--tech-primary); letter-spacing: 4px; }
.paper-no { position: absolute; right: 0; bottom: 10px; font-family: 'Rajdhani'; color: var(--status-danger); font-weight: bold; }

.paper-row {
  display: flex;
  margin-bottom: 12px;
  align-items: baseline;
  font-size: 14px;
}
.paper-row .label { font-weight: bold; color: var(--tech-secondary); width: 90px; text-align: right; margin-right: 10px; }
.paper-row .val { border-bottom: 1px solid #444; flex: 1; padding-left: 8px; color: #fff; }
.ml-4 { margin-left: 20px; }

.content-box {
  border: 1px solid #444;
  padding: 8px;
  min-height: 40px;
  background: rgba(0,0,0,0.2);
}

.paper-section {
  margin-top: 20px;
  border: 1px solid var(--tech-secondary);
  padding: 10px;
}
.sec-title {
  background: var(--tech-secondary);
  color: #000;
  display: inline-block;
  padding: 2px 8px;
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 10px;
}
.check-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  border-bottom: 1px dashed #333;
  padding-bottom: 4px;
}
.check-item .idx { margin-right: 8px; color: var(--tech-primary); }
.check-item .desc { flex: 1; }
.check-box { width: 16px; height: 16px; border: 1px solid #666; }

.sign-area {
  margin-top: 30px;
  display: flex;
  justify-content: space-around;
}
.sign-box {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sign-val { font-family: 'Ma Shan Zheng', cursive; font-size: 18px; color: var(--text-bright); }
.sign-btn { color: var(--status-warning); cursor: pointer; border-bottom: 1px solid; }
</style>
