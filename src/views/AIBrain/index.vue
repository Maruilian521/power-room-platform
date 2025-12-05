<template>
  <div class="ai-brain-page">
    <!-- 顶部统计卡片 -->
    <div class="stats-row">
      <div class="stat-card-item" v-for="stat in stats" :key="stat.label">
        <div class="stat-icon-wrapper" :class="stat.type">
          <el-icon :size="24">
            <component :is="stat.icon" />
          </el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value-group">
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-unit" v-if="stat.unit">{{ stat.unit }}</span>
          </div>
        </div>
        <!-- 装饰角标 -->
        <div class="card-corner corner-tl"></div>
        <div class="card-corner corner-br"></div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="main-content">
      <!-- 左侧区域 -->
      <div class="left-section">
        <!-- 常用功能 -->
        <div class="module-card">
          <div class="module-header">
            <div class="header-left">
              <el-icon><Grid /></el-icon>
              <span>常用功能</span>
            </div>
            <el-button link class="action-btn">
              <el-icon><EditPen /></el-icon>
              自定义
            </el-button>
          </div>
          <div class="function-grid">
            <div class="function-item" v-for="func in functions" :key="func.name">
              <div class="function-icon">
                <el-icon :size="24">
                  <component :is="func.icon" />
                </el-icon>
              </div>
              <div class="function-name">{{ func.name }}</div>
            </div>
          </div>
        </div>

        <!-- 历史统计 -->
        <div class="module-card">
          <div class="module-header">
            <div class="header-left">
              <el-icon><PieChart /></el-icon>
              <span>工单统计</span>
            </div>
            <span class="stat-tip">本月累计</span>
          </div>
          <div ref="pieChartRef" class="pie-chart"></div>
        </div>
      </div>

      <!-- 中间区域 - 待办业务 -->
      <div class="middle-section">
        <div class="module-card todo-module">
          <div class="module-header">
            <div class="header-left">
              <el-icon><List /></el-icon>
              <span>待办业务</span>
            </div>
            <el-tag size="small" effect="dark" class="header-tag">3 项待处理</el-tag>
          </div>
          
          <div class="todo-tabs">
            <div class="tab-item active">全部待办</div>
            <div class="tab-item">告警工单</div>
            <div class="tab-item">巡检工单</div>
            <div class="tab-item">缺陷工单</div>
          </div>

          <div class="todo-list">
            <div class="todo-item" v-for="(todo, index) in todos" :key="index">
              <div class="todo-status-bar" :class="todo.type"></div>
              <div class="todo-main">
                <div class="todo-header">
                  <span class="todo-type-badge" :class="todo.type">{{ todo.typeLabel }}</span>
                  <span class="todo-time">{{ todo.date }}</span>
                </div>
                <div class="todo-title">{{ todo.title }}</div>
              </div>
              <el-button type="primary" size="small" plain class="handle-btn">处理</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧区域 - 知识库 -->
      <div class="right-section">
        <div class="module-card knowledge-module">
          <div class="module-header">
            <div class="header-left">
              <el-icon><Reading /></el-icon>
              <span>知识库</span>
            </div>
            <el-button link class="action-btn">更多 ></el-button>
          </div>
          <div class="knowledge-list">
            <div class="knowledge-item" v-for="(item, index) in knowledgeList" :key="index">
              <div class="k-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="k-content">
                <div class="k-title">{{ item.title }}</div>
                <div class="k-meta">
                  <span class="k-tag">{{ item.tag }}</span>
                  <span class="k-date">{{ item.date }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部 - 关注指标 -->
    <div class="bottom-section">
      <div class="module-header">
        <div class="header-left">
          <el-icon><TrendCharts /></el-icon>
          <span>关键指标监控</span>
        </div>
      </div>
      <div class="metrics-grid">
        <div class="metric-card" v-for="metric in metrics" :key="metric.title">
          <div class="metric-header-row">
            <div class="metric-title">{{ metric.title }}</div>
            <div class="status-light normal"></div>
          </div>
          <div class="metric-items">
            <div class="metric-item" v-for="item in metric.items" :key="item.label">
              <span class="m-label">{{ item.label }}</span>
              <div class="m-value-group">
                <span class="m-key">{{ item.key }}</span>
                <span class="m-value">{{ item.value || '--' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import {
  Document, Clock, Warning, Check, Position, Operation,
  User, Monitor, Tools, Files,
  Grid, EditPen, PieChart, List,
  Reading, TrendCharts
} from '@element-plus/icons-vue'

// 顶部统计数据
const stats = ref([
  { label: '工单总量', value: 128, unit: '个', icon: Document, type: 'primary' },
  { label: '待办工单', value: 12, unit: '个', icon: Clock, type: 'warning' },
  { label: '超期工单', value: 3, unit: '个', icon: Warning, type: 'danger' },
  { label: '已完成', value: 105, unit: '个', icon: Check, type: 'success' },
  { label: '转派中', value: 8, unit: '个', icon: Position, type: 'info' },
  { label: '待审核', value: 5, unit: '个', icon: Operation, type: 'primary' }
])

// 常用功能
const functions = ref([
  { name: '值班统计', icon: User },
  { name: '巡检报告', icon: Files },
  { name: '维修报告', icon: Tools },
  { name: '事件报告', icon: Warning },
  { name: '处置报告', icon: Check },
  { name: '巡检工单', icon: Monitor }
])

// 待办业务
const todos = ref([
  { type: 'danger', typeLabel: '紧急缺陷', title: '10kV II段母线绝缘异常报警', date: '10:23:45' },
  { type: 'warning', typeLabel: '维修', title: '1#变压器温控器显示异常', date: '09:15:00' },
  { type: 'success', typeLabel: '巡检', title: '每日例行设备巡视任务', date: '08:30:00' },
  { type: 'success', typeLabel: '巡检', title: '消防设施专项检查', date: '昨天' }
])

// 知识库
const knowledgeList = ref([
  { type: 'emergency', tag: '应急预案', title: '配电室水浸事故应急处置流程', date: '2023-10-11' },
  { type: 'emergency', tag: '操作规程', title: '10kV开关柜停送电操作规范', date: '2023-09-20' },
  { type: 'emergency', tag: '安全规范', title: '触电急救与心肺复苏操作指南', date: '2023-08-15' },
  { type: 'emergency', tag: '案例分析', title: '某变电站误操作故分析报告', date: '2023-07-10' },
])

// 关注指标
const metrics = ref([
  {
    title: '10kV 4# 母线 AH03柜',
    items: [
      { label: 'A相电压', key: 'Ua', value: '10.2 kV' },
      { label: 'A相电流', key: 'Ia', value: '12.5 A' },
      { label: '有功功率', key: 'P', value: '453 kW' },
      { label: '功率因数', key: 'PF', value: '0.92' }
    ]
  },
  {
    title: '10kV 5# 母线 AH04柜',
    items: [
      { label: 'A相电压', key: 'Ua', value: '10.3 kV' },
      { label: 'A相电流', key: 'Ia', value: '11.8 A' },
      { label: '有功功率', key: 'P', value: '420 kW' },
      { label: '功率因数', key: 'PF', value: '0.94' }
    ]
  },
  {
    title: '10kV 6# 母线 AH09柜',
    items: [
      { label: 'A相电压', key: 'Ua', value: '10.2 kV' },
      { label: 'A相电流', key: 'Ia', value: '13.1 A' },
      { label: '有功功率', key: 'P', value: '480 kW' },
      { label: '功率因数', key: 'PF', value: '0.91' }
    ]
  }
])

const pieChartRef = ref<HTMLElement>()
let pieChart: echarts.ECharts | null = null

// 初始化饼图
const initPieChart = () => {
  if (!pieChartRef.value) return

  pieChart = echarts.init(pieChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0,0,0,0.8)',
      borderColor: '#00F3FF',
      textStyle: { color: '#fff' }
    },
    legend: {
      bottom: '0',
      left: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        color: '#94A3B8'
      }
    },
    series: [
      {
        name: '工单统计',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '40%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#0B1325',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
            color: '#fff'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 961, name: '已完成', itemStyle: { color: '#00F3FF' } },
          { value: 283, name: '进行中', itemStyle: { color: '#0078D7' } },
          { value: 116, name: '待接单', itemStyle: { color: '#1D4ED8' } },
          { value: 22, name: '已超时', itemStyle: { color: '#FF2E63' } },
          { value: 5, name: '挂起', itemStyle: { color: '#FFD600' } }
        ]
      }
    ]
  }

  pieChart.setOption(option)
}

onMounted(() => {
  initPieChart()

  window.addEventListener('resize', () => {
    pieChart?.resize()
  })
})

onUnmounted(() => {
  pieChart?.dispose()
})
</script>

<style scoped>
.ai-brain-page {
  /* 使用 CSS 变量自适应容器 */
  height: 100%;
  overflow-y: auto; /* 允许整体滚动 */
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  color: var(--text-main);
}

/* 顶部统行 */
.stats-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

/* Local stat icon styling (layout specific) */
.stat-icon-wrapper {
  /* Base layout only, colors are global */
}

.stat-icon-wrapper.primary { color: var(--tech-primary); background: rgba(0,243,255,0.1); }
.stat-icon-wrapper.warning { color: var(--status-warning); background: rgba(255,214,0,0.1); }
.stat-icon-wrapper.danger { color: var(--status-danger); background: rgba(255,46,99,0.1); }
.stat-icon-wrapper.success { color: var(--status-success); background: rgba(0,230,118,0.1); }
.stat-icon-wrapper.info { color: var(--status-info); background: rgba(0,176,255,0.1); }

/* 布局结构 */
.main-content {
  display: grid;
  grid-template-columns: 320px 1fr 320px;
  gap: 20px;
  min-height: 600px;
}

.left-section, .right-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.middle-section {
  display: flex;
  flex-direction: column;
}

.todo-module {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 常用功能 */
.function-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.function-item {
  background: rgba(255,255,255,0.02);
  border: 1px solid transparent;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.function-item:hover {
  background: rgba(0,243,255,0.05);
  border-color: var(--border-dim);
  transform: translateY(-2px);
}

.function-icon {
  color: var(--tech-secondary);
  transition: color 0.3s;
}

.function-item:hover .function-icon {
  color: var(--tech-primary);
}

.function-name {
  font-size: 12px;
  color: var(--text-sub);
}

/* 饼图 */
.pie-chart {
  flex: 1;
  min-height: 200px;
}

/* 待办业务 */
.todo-tabs {
  display: flex;
  gap: 2px;
  background: rgba(255,255,255,0.05);
  padding: 2px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 6px 0;
  font-size: 13px;
  cursor: pointer;
  color: var(--text-sub);
  transition: all 0.3s;
  border-radius: 2px;
}

.tab-item.active {
  background: var(--tech-secondary);
  color: #fff;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  flex: 1;
  padding-right: 4px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border-dim);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.todo-item:hover {
  background: rgba(255,255,255,0.05);
  border-color: var(--tech-secondary);
}

.todo-status-bar {
  width: 3px;
  height: 24px;
  background: var(--text-sub);
  border-radius: 2px;
}
.todo-status-bar.danger { background: var(--status-danger); box-shadow: 0 0 5px var(--status-danger); }
.todo-status-bar.warning { background: var(--status-warning); box-shadow: 0 0 5px var(--status-warning); }
.todo-status-bar.success { background: var(--status-success); box-shadow: 0 0 5px var(--status-success); }

.todo-main {
  flex: 1;
  overflow: hidden;
}

.todo-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.todo-type-badge {
  font-size: 12px;
  padding: 0 6px;
  border-radius: 2px;
  background: rgba(255,255,255,0.1);
}

.todo-type-badge.danger { color: var(--status-danger); background: rgba(255,46,99,0.1); }
.todo-type-badge.warning { color: var(--status-warning); background: rgba(255,214,0,0.1); }

.todo-time {
  font-size: 12px;
  color: var(--text-sub);
}

.todo-title {
  font-size: 14px;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 知识库 */
.knowledge-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  overflow-y: auto;
}

.knowledge-item {
  display: flex;
  gap: 12px;
  padding: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  cursor: pointer;
  transition: all 0.3s;
}

.knowledge-item:hover {
  background: rgba(255,255,255,0.02);
  padding-left: 14px;
}

.k-icon {
  color: var(--tech-primary);
  margin-top: 2px;
}

.k-content {
  flex: 1;
}

.k-title {
  font-size: 13px;
  color: var(--text-main);
  margin-bottom: 4px;
  line-height: 1.4;
}

.k-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-sub);
}

.k-tag {
  color: var(--tech-secondary);
}

/* 底部指标 */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.metric-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--border-dim);
}

.metric-title {
  font-weight: 600;
  color: var(--tech-primary);
}

.status-light {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--status-success);
  box-shadow: 0 0 8px var(--status-success);
}

.metric-items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.m-label {
  font-size: 12px;
  color: var(--text-sub);
}

.m-value-group {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  background: var(--bg-sidebar-input);
  padding: 4px 8px;
  border-radius: 2px;
}

.m-key {
  font-size: 12px;
  color: var(--text-muted);
  font-family: monospace;
}

.m-value {
  font-size: 14px;
  color: var(--text-bright);
  font-weight: 600;
  font-family: 'DIN Alternate', sans-serif;
}

/* 响应式适配 */
@media (max-width: 1600px) {
  .stats-row { grid-template-columns: repeat(3, 1fr); }
  .main-content { grid-template-columns: 280px 1fr 280px; }
}

@media (max-width: 1200px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .main-content { grid-template-columns: 1fr; grid-template-rows: auto auto auto; }
  .left-section, .right-section { height: auto; }
  .metrics-grid { grid-template-columns: 1fr; }
}
</style>
