<template>
  <div class="page-container">
    <div class="alarm-center">
      <!-- 顶部统计概览 -->
      <div class="dashboard-header">
        <div class="stat-card-item critical">
          <div class="icon-wrapper">
            <el-icon><CircleCloseFilled /></el-icon>
          </div>
          <div class="info">
            <div class="label">严重告警</div>
            <div class="value">{{ criticalCount }}</div>
          </div>
        </div>
        <div class="stat-card-item warning">
          <div class="icon-wrapper">
            <el-icon><WarningFilled /></el-icon>
          </div>
          <div class="info">
            <div class="label">一般预警</div>
            <div class="value">{{ warningCount }}</div>
          </div>
        </div>
        <div class="stat-card-item ai">
          <div class="icon-wrapper">
            <el-icon><View /></el-icon>
          </div>
          <div class="info">
            <div class="label">AI 识别异常</div>
            <div class="value">{{ aiCount }}</div>
          </div>
        </div>
        <div class="stat-card-item today">
          <div class="icon-wrapper">
            <el-icon><DataLine /></el-icon>
          </div>
          <div class="info">
            <div class="label">今日告警总数</div>
            <div class="value">{{ todayCount }}</div>
          </div>
        </div>
      </div>

      <!-- 主体内容区 -->
      <div class="main-content module-card">
        <div class="module-header">
            <span class="title">告警监控台</span>
        </div>
        <!-- 筛选工具栏 -->
        <div class="toolbar">
          <div class="left-tools">
            <el-radio-group v-model="activeCategory" @change="handleCategoryChange">
              <el-radio-button label="">全部</el-radio-button>
              <el-radio-button label="power">电力监控</el-radio-button>
              <el-radio-button label="environment">环境监测</el-radio-button>
              <el-radio-button label="ai">AI 识别</el-radio-button>
              <el-radio-button label="security">安防监控</el-radio-button>
            </el-radio-group>
          </div>
          <div class="right-tools">
            <el-select v-model="selectedRoom" placeholder="选择配电室" clearable filterable style="width: 200px">
              <el-option
                v-for="room in rooms"
                :key="room.id"
                :label="room.name"
                :value="room.id"
              />
            </el-select>
            <el-select v-model="filterLevel" placeholder="告警级别" clearable style="width: 120px">
              <el-option label="严重" value="critical" />
              <el-option label="警告" value="warning" />
              <el-option label="信息" value="info" />
            </el-select>
            <el-input
              v-model="searchText"
              placeholder="搜索设备/告警内容"
              prefix-icon="Search"
              style="width: 250px"
              clearable
            />
            <el-button type="primary" @click="refreshData">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 告警表格 -->
        <el-table
          :data="paginatedAlarms"
          style="width: 100%"
          v-loading="loading"
          stripe
        >
          <el-table-column type="expand">
            <template #default="props">
              <div class="alarm-expand-detail">
                <p><strong>告警详情：</strong>{{ props.row.message }}</p>
                <p><strong>位置信息：</strong>{{ getRoomLocation(props.row.roomId) }}</p>
                <p v-if="props.row.value"><strong>触发值：</strong>{{ props.row.value }}</p>
                <p><strong>发生时间：</strong>{{ props.row.time }}</p>
                <div v-if="props.row.snapshotUrl" class="snapshot-preview">
                   <img :src="props.row.snapshotUrl" alt="现场快照" />
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="time" label="发生时间" width="180" sortable />
          
          <el-table-column label="告警级别" width="100">
            <template #default="{ row }">
              <el-tag :type="getLevelTag(row.level)" effect="dark">
                {{ getLevelText(row.level) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="���警类型" width="150">
             <template #default="{ row }">
                <div class="type-cell">
                    <el-icon v-if="row.category === 'ai'" class="ai-icon"><View /></el-icon>
                    <span>{{ row.type }}</span>
                </div>
             </template>
          </el-table-column>

          <el-table-column prop="roomName" label="所属配电室" min-width="150" />
          <el-table-column prop="message" label="告警内容" min-width="300" show-overflow-tooltip />
          
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusTag(row.status)">{{ getStatusText(row.status) }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column fixed="right" label="操作" width="180">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleViewDetail(row)">查看</el-button>
              <el-button 
                v-if="row.status !== 'resolved'"
                link 
                type="warning" 
                size="small" 
                @click="handleProcess(row)"
              >
                处理
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="filteredAlarms.length"
          />
        </div>
      </div>

      <!-- 详情弹窗 -->
      <el-dialog 
        v-model="dialogVisible" 
        title="告警详情处理" 
        width="700px" 
        destroy-on-close
        class="sc2-dialog"
      >
        <div v-if="currentAlarm" class="sc2-info-panel detail-container">
           <div class="detail-header" :class="currentAlarm.level">
              <div class="header-main">
                 <span class="level-badge">{{ getLevelText(currentAlarm.level) }}</span>
                 <span class="title">{{ currentAlarm.type }} - {{ currentAlarm.roomName }}</span>
              </div>
              <div class="time">{{ currentAlarm.time }}</div>
           </div>

           <div class="detail-body">
              <div class="info-grid">
                  <div class="info-item">
                      <span class="label">告警ID:</span>
                      <span class="val">{{ currentAlarm.id }}</span>
                  </div>
                  <div class="info-item">
                      <span class="label">设备名称:</span>
                      <span class="val">{{ currentAlarm.deviceName || '-' }}</span>
                  </div>
                  <div class="info-item">
                      <span class="label">告警分类:</span>
                      <span class="val">{{ getCategoryText(currentAlarm.category) }}</span>
                  </div>
                  <div class="info-item">
                      <span class="label">触发值:</span>
                      <span class="val highlight">{{ currentAlarm.value || '-' }}</span>
                  </div>
              </div>

              <div class="message-box">
                  <div class="label">详细描述:</div>
                  <div class="content">{{ currentAlarm.message }}</div>
              </div>

              <div v-if="currentAlarm.snapshotUrl" class="snapshot-section">
                  <div class="label">现场快照 (AI/安防):</div>
                  <div class="image-box">
                      <img :src="currentAlarm.snapshotUrl" alt="Snapshot" />
                  </div>
              </div>
           </div>

           <div class="process-section" v-if="currentAlarm.status !== 'resolved'">
              <el-divider content-position="left">处置操作</el-divider>
              <el-form :model="processForm" label-width="80px">
                  <el-form-item label="处理意见">
                      <el-input v-model="processForm.note" type="textarea" rows="3" placeholder="请输入处理情况说明..." />
                  </el-form-item>
                  <el-form-item>
                      <el-button type="primary" @click="submitProcess">确认处理</el-button>
                      <el-button @click="dialogVisible = false">取消</el-button>
                  </el-form-item>
              </el-form>
           </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useDeviceStore } from '../stores/device'
import { ElMessage } from 'element-plus'
import { 
    CircleCloseFilled, 
    WarningFilled, 
    DataLine, 
    Refresh,
    View
} from '@element-plus/icons-vue'
import type { Alarm, Room } from '../types'

const store = useDeviceStore()
const { alarms, loading } = storeToRefs(store)
// Explicitly cast store to any to avoid TS inference issues with recently added state
const rooms = computed<Room[]>(() => (store as any).rooms || [])

// Filters
const activeCategory = ref('')
const selectedRoom = ref('')
const filterLevel = ref('')
const searchText = ref('')

// Pagination
const currentPage = ref(1)
const pageSize = ref(20)

// Dialog
const dialogVisible = ref(false)
const currentAlarm = ref<Alarm | null>(null)
const processForm = ref({
    note: ''
})

// Computed Stats
const criticalCount = computed(() => alarms.value.filter(a => a.level === 'critical').length)
const warningCount = computed(() => alarms.value.filter(a => a.level === 'warning').length)
const aiCount = computed(() => alarms.value.filter(a => a.category === 'ai').length)
const todayCount = computed(() => {
    const today = new Date().toISOString().split('T')[0] as string
    return alarms.value.filter(a => a.time.startsWith(today)).length
})

// Filtered Data
const filteredAlarms = computed(() => {
    return alarms.value.filter(alarm => {
        const matchCategory = !activeCategory.value || alarm.category === activeCategory.value
        const matchRoom = !selectedRoom.value || alarm.roomId === selectedRoom.value
        const matchLevel = !filterLevel.value || alarm.level === filterLevel.value
        const matchSearch = !searchText.value || 
            alarm.message.toLowerCase().includes(searchText.value.toLowerCase()) ||
            alarm.type.toLowerCase().includes(searchText.value.toLowerCase()) ||
            (alarm.deviceName && alarm.deviceName.includes(searchText.value))
        
        return matchCategory && matchRoom && matchLevel && matchSearch
    })
})

const paginatedAlarms = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredAlarms.value.slice(start, start + pageSize.value)
})

// Helpers
const getLevelTag = (level: string) => {
    const map: Record<string, string> = { critical: 'danger', warning: 'warning', info: 'info' }
    return map[level] || 'info'
}

const getLevelText = (level: string) => {
    const map: Record<string, string> = { critical: '严重', warning: '警告', info: '提示' }
    return map[level] || level
}

const getStatusTag = (status: string) => {
    const map: Record<string, string> = { pending: 'danger', processing: 'warning', resolved: 'success' }
    return map[status] || ''
}

const getStatusText = (status: string) => {
    const map: Record<string, string> = { pending: '待处理', processing: '处理中', resolved: '已解决' }
    return map[status] || status
}

const getCategoryText = (cat: string) => {
    const map: Record<string, string> = { power: '电力', environment: '环境', ai: 'AI识别', security: '安防', device: '设备' }
    return map[cat] || cat
}

const getRoomLocation = (roomId: string) => {
    const room = rooms.value.find(r => r.id === roomId)
    return room ? room.location : '未知位置'
}

// Actions
const refreshData = () => {
    store.fetchAlarms()
}

const handleCategoryChange = () => {
    currentPage.value = 1
}

const handleViewDetail = (row: Alarm) => {
    currentAlarm.value = row
    processForm.value.note = ''
    dialogVisible.value = true
}

const handleProcess = (row: Alarm) => {
    handleViewDetail(row)
}

const submitProcess = async () => {
    if (!currentAlarm.value) return
    
    // Mock API call
    ElMessage.success('处理成功')
    // Update local state for immediate feedback
    currentAlarm.value.status = 'resolved'
    dialogVisible.value = false
    // In real app: await store.updateAlarmStatus(...)
}

onMounted(() => {
    store.fetchRooms()
    store.fetchAlarms()
})
</script>

<style scoped>
.alarm-center {
    padding: 20px;
    background-color: var(--bg-color);
    min-height: calc(100vh - 84px);
}

/* Stats Header */
.dashboard-header {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 20px;
}

.stat-card-item {
    /* Handled by themes.css for the most part, just layout here */
    display: flex;
    align-items: center;
    padding: 20px;
    transition: transform 0.2s;
}

.stat-card-item:hover {
    transform: translateY(-2px);
}

.stat-card-item.critical .icon-wrapper { color: var(--status-danger); background: rgba(255, 46, 99, 0.1); }
.stat-card-item.warning .icon-wrapper { color: var(--status-warning); background: rgba(255, 214, 0, 0.1); }
.stat-card-item.ai .icon-wrapper { color: var(--tech-secondary); background: rgba(0, 240, 255, 0.1); }
.stat-card-item.today .icon-wrapper { color: var(--status-success); background: rgba(0, 230, 118, 0.1); }

.icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 2px; /* Match AIBrain */
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-right: 16px;
    border: 1px solid currentColor;
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
}

.info .label {
    font-size: 12px;
    color: var(--text-sub);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 4px;
}

.info .value {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-bright);
    font-family: 'DIN Alternate', sans-serif;
    text-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}

/* Main Content */
.main-content {
    /* Handled by .module-card in themes.css */
    min-height: 600px;
}

.module-header {
    margin-bottom: 20px;
}

.module-header .title {
    font-family: 'Orbitron', sans-serif;
    font-size: 20px;
    color: var(--tech-primary);
    text-transform: uppercase;
    letter-spacing: 2px;
}

.toolbar {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 20px;
}

.right-tools {
    display: flex;
    gap: 12px;
    align-items: center;
}

.type-cell {
    display: flex;
    align-items: center;
    gap: 8px;
}

.ai-icon {
    color: #409eff;
}

.alarm-expand-detail {
    padding: 10px 20px;
    background: var(--bg-tertiary);
    border-radius: 4px;
}

.snapshot-preview img {
    max-width: 200px;
    border-radius: 4px;
    margin-top: 10px;
    border: 1px solid var(--border-color);
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

/* Detail Dialog */
.detail-container {
    padding: 10px;
    /* Inherit sc2-info-panel styles */
    height: auto !important; /* Override fixed height if set */
}

.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(0, 240, 255, 0.2);
    margin-bottom: 15px;
}

.detail-header .header-main {
    display: flex;
    align-items: center;
    gap: 10px;
}

.detail-header .title {
    font-family: 'Orbitron', sans-serif;
    font-size: 18px;
    font-weight: bold;
    letter-spacing: 1px;
}

.detail-header.critical .title { color: var(--status-danger); text-shadow: 0 0 5px var(--status-danger); }
.detail-header.warning .title { color: var(--status-warning); text-shadow: 0 0 5px var(--status-warning); }
.detail-header.info .title { color: var(--status-info); }

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-bottom: 20px;
}

.info-item {
    display: flex;
    gap: 8px;
    align-items: baseline;
}

.info-item .label {
    color: var(--text-sub);
    font-size: 12px;
    min-width: 70px;
}

.info-item .val {
    color: var(--text-bright);
    font-family: 'Rajdhani', sans-serif;
    font-weight: 600;
}

.val.highlight {
    color: var(--tech-primary);
    font-weight: bold;
    text-shadow: 0 0 5px var(--tech-primary);
}

.message-box {
    background: rgba(0, 0, 0, 0.2);
    padding: 15px;
    border: 1px solid rgba(0, 240, 255, 0.1);
    border-radius: 2px;
    margin-bottom: 20px;
}

.message-box .label {
    color: var(--tech-secondary);
    font-size: 12px;
    margin-bottom: 8px;
    text-transform: uppercase;
}

.message-box .content {
    color: var(--text-main);
    line-height: 1.6;
}

.snapshot-section {
    margin-bottom: 20px;
}

.snapshot-section .label {
    color: var(--tech-secondary);
    font-size: 12px;
    margin-bottom: 8px;
    text-transform: uppercase;
}

.snapshot-section .image-box {
    margin-top: 10px;
    border: 1px solid var(--tech-primary);
    border-radius: 2px;
    overflow: hidden;
    position: relative;
}

.snapshot-section .image-box::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(rgba(0, 240, 255, 0.1), transparent);
    pointer-events: none;
}

.snapshot-section img {
    width: 100%;
    max-height: 300px;
    object-fit: cover;
    display: block;
    filter: contrast(1.1) saturate(1.1); /* Tech look */
}

/* Table Row Styles */
/* Global theme handles table transparency and borders now */
</style>
