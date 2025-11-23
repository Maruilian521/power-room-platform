<template>
  <div class="realtime-command-panel">
    <!-- 实时告警滚动流 -->
    <div class="module-card alarm-feed-card">
      <div class="module-header">
        <div class="header-left">
          <el-icon><Bell /></el-icon>
          <span>实时告警监控</span>
        </div>
        <div class="header-right">
          <el-tag size="small" effect="dark" type="danger">{{ criticalAlarmCount }} 严重</el-tag>
        </div>
      </div>

      <div class="alarm-scroll-container" ref="alarmScrollRef">
        <div
          v-for="alarm in liveAlarms"
          :key="alarm.id"
          class="alarm-item"
          :class="`level-${alarm.level}`"
        >
          <div class="alarm-time">{{ alarm.time }}</div>
          <div class="alarm-content">
            <div class="alarm-header">
              <span class="alarm-site">{{ alarm.siteName }}</span>
              <el-tag size="small" :type="getAlarmTagType(alarm.level)">{{ alarm.type }}</el-tag>
            </div>
            <div class="alarm-desc">{{ alarm.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 工单执行漏斗 -->
    <div class="module-card work-order-funnel-card">
      <div class="module-header">
        <div class="header-left">
          <el-icon><Tickets /></el-icon>
          <span>工单执行态势</span>
        </div>
      </div>

      <div class="funnel-container">
        <div class="funnel-item">
          <div class="funnel-label">新建工单</div>
          <div class="funnel-bar" style="width: 100%; background: rgba(0, 176, 255, 0.3);">
            <span class="funnel-value">{{ workOrderFunnel.created }}</span>
          </div>
        </div>
        <div class="funnel-arrow"><el-icon><ArrowDown /></el-icon></div>
        <div class="funnel-item">
          <div class="funnel-label">进行中</div>
          <div class="funnel-bar" style="width: 80%; background: rgba(0, 243, 255, 0.4);">
            <span class="funnel-value">{{ workOrderFunnel.inProgress }}</span>
          </div>
        </div>
        <div class="funnel-arrow"><el-icon><ArrowDown /></el-icon></div>
        <div class="funnel-item">
          <div class="funnel-label">已完成</div>
          <div class="funnel-bar" style="width: 60%; background: rgba(0, 230, 118, 0.4);">
            <span class="funnel-value">{{ workOrderFunnel.completed }}</span>
          </div>
        </div>
        <div class="overdue-alert" v-if="workOrderFunnel.overdue > 0">
          <el-icon><WarnTriangleFilled /></el-icon>
          <span>{{ workOrderFunnel.overdue }} 个工单超时未完成</span>
        </div>
      </div>
    </div>

    <!-- AI视觉快照 -->
    <div class="module-card ai-snapshot-card">
      <div class="module-header">
        <div class="header-left">
          <el-icon><Camera /></el-icon>
          <span>AI视觉快照</span>
        </div>
      </div>

      <div class="snapshot-grid">
        <div
          v-for="snapshot in aiSnapshots"
          :key="snapshot.id"
          class="snapshot-item"
          @click="handleSnapshotClick(snapshot)"
        >
          <div class="snapshot-image-placeholder">
            <el-icon><PictureFilled /></el-icon>
          </div>
          <div class="snapshot-info">
            <div class="snapshot-type">{{ snapshot.type }}</div>
            <div class="snapshot-site">{{ snapshot.siteName }}</div>
            <div class="snapshot-meta">
              <span class="snapshot-time">{{ snapshot.time }}</span>
              <span class="snapshot-confidence">{{ (snapshot.confidence * 100).toFixed(0) }}%</span>
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
  Bell, Tickets, Camera, ArrowDown, WarnTriangleFilled, PictureFilled
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  getLiveAlarms,
  getWorkOrderFunnel,
  getAISnapshots,
  type LiveAlarm,
  type WorkOrderFunnel,
  type AISnapshot
} from '../../../api/integrated-ops'

const liveAlarms = ref<LiveAlarm[]>([])
const workOrderFunnel = ref<WorkOrderFunnel>({
  created: 0,
  inProgress: 0,
  completed: 0,
  overdue: 0
})
const aiSnapshots = ref<AISnapshot[]>([])
const alarmScrollRef = ref<HTMLElement>()

const criticalAlarmCount = computed(() => {
  return liveAlarms.value.filter(a => a.level === 'critical' || a.level === 'ai').length
})

const getAlarmTagType = (level: string) => {
  switch (level) {
    case 'critical':
      return 'danger'
    case 'warning':
      return 'warning'
    case 'ai':
      return 'danger'
    default:
      return 'info'
  }
}

const handleSnapshotClick = (snapshot: AISnapshot) => {
  ElMessage.info(`查看AI快照: ${snapshot.type} - ${snapshot.siteName}`)
}

let refreshTimer: number

const fetchData = async () => {
  try {
    const [alarms, funnel, snapshots] = await Promise.all([
      getLiveAlarms(),
      getWorkOrderFunnel(),
      getAISnapshots()
    ])

    liveAlarms.value = alarms
    workOrderFunnel.value = funnel
    aiSnapshots.value = snapshots
  } catch (error) {
    console.error('Failed to fetch realtime command data:', error)
  }
}

onMounted(() => {
  fetchData()
  // 每10秒刷新告警数据
  refreshTimer = setInterval(fetchData, 10000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<style scoped>
.realtime-command-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.module-card {
  background: var(--bg-panel-transparent);
  backdrop-filter: var(--backdrop-blur);
  border: 1px solid var(--border-light);
  border-radius: var(--card-radius);
  padding: 20px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
}

.module-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--line-grid);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-bright);
}

.header-left .el-icon {
  color: var(--tech-primary);
  font-size: 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ========== 告警滚动流 ========== */
.alarm-feed-card {
  flex: 1;
  min-height: 280px;
  max-height: none;
}

.alarm-scroll-container {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 4px;
}

/* 自定义滚动条 */
.alarm-scroll-container::-webkit-scrollbar {
  width: 4px;
}

.alarm-scroll-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.alarm-scroll-container::-webkit-scrollbar-thumb {
  background: var(--tech-primary);
  border-radius: 2px;
}

.alarm-item {
  background: rgba(0, 0, 0, 0.3);
  border-left: 3px solid var(--border-dim);
  border-radius: 4px;
  padding: 10px;
  transition: all 0.3s;
}

.alarm-item:hover {
  background: rgba(0, 243, 255, 0.05);
  transform: translateX(2px);
}

.alarm-item.level-critical,
.alarm-item.level-ai {
  border-left-color: var(--status-danger);
  background: rgba(255, 46, 99, 0.05);
}

.alarm-item.level-warning {
  border-left-color: var(--status-warning);
}

.alarm-time {
  font-size: 11px;
  color: var(--text-muted);
  font-family: 'DIN Alternate', sans-serif;
  margin-bottom: 6px;
}

.alarm-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.alarm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.alarm-site {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-bright);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.alarm-desc {
  font-size: 12px;
  color: var(--text-sub);
}

/* ========== 工单漏斗 ========== */
.work-order-funnel-card {
  flex-shrink: 0;
  min-height: 200px;
  max-height: 220px;
  overflow: hidden;
}

.funnel-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  max-height: 160px;
}

/* 工单漏斗滚动条 */
.funnel-container::-webkit-scrollbar {
  width: 4px;
}

.funnel-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.funnel-container::-webkit-scrollbar-thumb {
  background: var(--tech-primary);
  border-radius: 2px;
}

.funnel-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.funnel-label {
  font-size: 12px;
  color: var(--text-sub);
  font-weight: 600;
}

.funnel-bar {
  height: 32px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.funnel-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-bright);
  font-family: 'DIN Alternate', sans-serif;
}

.funnel-arrow {
  text-align: center;
  color: var(--tech-primary);
  font-size: 16px;
  margin: 4px 0;
}

.overdue-alert {
  margin-top: 8px;
  padding: 10px;
  background: rgba(255, 46, 99, 0.1);
  border: 1px solid rgba(255, 46, 99, 0.3);
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--status-danger);
}

.overdue-alert .el-icon {
  font-size: 16px;
}

/* ========== AI快照 ========== */
.ai-snapshot-card {
  flex-shrink: 0;
  min-height: 220px;
  max-height: 240px;
}

.snapshot-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.snapshot-item {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-dim);
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.snapshot-item:hover {
  border-color: var(--tech-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 243, 255, 0.2);
}

.snapshot-image-placeholder {
  width: 100%;
  height: 80px;
  background: linear-gradient(135deg, rgba(0, 20, 40, 0.5), rgba(0, 40, 80, 0.5));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--tech-primary);
  font-size: 32px;
}

.snapshot-info {
  padding: 8px;
}

.snapshot-type {
  font-size: 12px;
  font-weight: 600;
  color: var(--status-danger);
  margin-bottom: 3px;
}

.snapshot-site {
  font-size: 11px;
  color: var(--text-sub);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.snapshot-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
}

.snapshot-time {
  color: var(--text-muted);
  font-family: 'DIN Alternate', sans-serif;
}

.snapshot-confidence {
  color: var(--status-success);
  font-weight: 600;
  font-family: 'DIN Alternate', sans-serif;
}
</style>
