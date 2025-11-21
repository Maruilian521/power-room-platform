<template>
  <div class="ai-brain-page">
    <!-- 顶部统计卡片 -->
    <div class="stats-row">
      <div class="stat-card" v-for="stat in stats" :key="stat.label">
        <div class="stat-icon" :style="{ background: stat.bgColor }">
          <el-icon :size="32" :color="stat.iconColor">
            <component :is="stat.icon" />
          </el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value">{{ stat.value }}</div>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="main-content">
      <!-- 左侧区域 -->
      <div class="left-section">
        <!-- 常用功能 -->
        <div class="module-card">
          <div class="module-header">
            <el-icon><Grid /></el-icon>
            <span>常用功能</span>
            <el-button text size="small">
              <el-icon><EditPen /></el-icon>
              自定义
            </el-button>
          </div>
          <div class="function-grid">
            <div class="function-item" v-for="func in functions" :key="func.name">
              <div class="function-icon" :style="{ background: func.bgColor }">
                <el-icon :size="28" :color="func.iconColor">
                  <component :is="func.icon" />
                </el-icon>
              </div>
              <div class="function-name">{{ func.name }}</div>
            </div>
          </div>
          <!-- 左右翻页按钮 -->
          <div class="function-nav">
            <el-button circle size="small" :icon="ArrowLeft" />
            <el-button circle size="small" :icon="ArrowRight" />
          </div>
        </div>

        <!-- 历史统计 -->
        <div class="module-card">
          <div class="module-header">
            <el-icon><PieChart /></el-icon>
            <span>历史统计</span>
            <span class="stat-tip">计量工单 5</span>
          </div>
          <div ref="pieChartRef" class="pie-chart"></div>
        </div>
      </div>

      <!-- 中间区域 - 待办业务 -->
      <div class="middle-section">
        <div class="module-card todo-module">
          <div class="module-header">
            <el-icon><List /></el-icon>
            <span>待办业务</span>
          </div>
          <div class="todo-tabs">
            <span class="todo-tab active">全部待办</span>
            <span class="todo-tab">告警工单</span>
            <span class="todo-tab">巡检工单</span>
            <span class="todo-tab">缺陷工单</span>
            <span class="todo-tab">维修工单</span>
            <span class="todo-tab">故障抢修</span>
            <span class="todo-tab">运维</span>
          </div>
          <div class="todo-list">
            <div class="todo-item" v-for="(todo, index) in todos" :key="index">
              <div class="todo-tag" :class="todo.type">{{ todo.typeLabel }}</div>
              <div class="todo-content">
                <div class="todo-title">{{ todo.title }}</div>
                <div class="todo-date">
                  <el-icon><Calendar /></el-icon>
                  {{ todo.date }}
                </div>
              </div>
              <el-button type="primary" size="small" round>去处理</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧区域 - 知识库 -->
      <div class="right-section">
        <div class="module-card knowledge-module">
          <div class="module-header">
            <el-icon><Reading /></el-icon>
            <span>知识库</span>
            <el-button text size="small">查看更多 ></el-button>
          </div>
          <div class="knowledge-list">
            <div class="knowledge-item" v-for="(item, index) in knowledgeList" :key="index">
              <div class="knowledge-dot" :class="item.type"></div>
              <div class="knowledge-content">
                <div class="knowledge-tag">[{{ item.tag }}]</div>
                <div class="knowledge-title">{{ item.title }}</div>
              </div>
              <div class="knowledge-date">{{ item.date }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部 - 关注指标 -->
    <div class="bottom-section">
      <div class="module-header">
        <el-icon><TrendCharts /></el-icon>
        <span>关注指标</span>
      </div>
      <div class="metrics-grid">
        <div class="metric-card" v-for="metric in metrics" :key="metric.title">
          <div class="metric-header">
            <div class="metric-title">{{ metric.title }}</div>
            <div class="metric-line" :style="{ background: metric.lineColor }"></div>
          </div>
          <div class="metric-items">
            <div class="metric-item" v-for="item in metric.items" :key="item.label">
              <div class="metric-label">{{ item.label }}</div>
              <div class="metric-status">
                <span class="status-dot" :class="item.status"></span>
                <span class="metric-key">{{ item.key }}</span>
                <span class="metric-value">{{ item.value }}</span>
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
  User, Monitor, Tools, Calendar, Files, DataAnalysis,
  Grid, EditPen, ArrowLeft, ArrowRight, PieChart, List,
  Reading, TrendCharts
} from '@element-plus/icons-vue'

// 顶部统计数据
const stats = ref([
  { label: '工单总量', value: 10, icon: Document, bgColor: 'linear-gradient(135deg, #FFE5E5, #FFF)', iconColor: '#FF6B6B' },
  { label: '待办工单', value: 0, icon: Clock, bgColor: 'linear-gradient(135deg, #E5FFE5, #FFF)', iconColor: '#51CF66' },
  { label: '超期工单', value: 0, icon: Warning, bgColor: 'linear-gradient(135deg, #FFE5D5, #FFF)', iconColor: '#FF922B' },
  { label: '已完成工单', value: 1, icon: Check, bgColor: 'linear-gradient(135deg, #E5E5FF, #FFF)', iconColor: '#5C7CFA' },
  { label: '转派工单', value: 1, icon: Position, bgColor: 'linear-gradient(135deg, #FFE5F5, #FFF)', iconColor: '#FF6B9D' },
  { label: '待审核', value: 109, icon: Operation, bgColor: 'linear-gradient(135deg, #FFE5E5, #FFF)', iconColor: '#FF8787' }
])

// 常用功能
const functions = ref([
  { name: '值班统计', icon: User, bgColor: 'rgba(99, 152, 255, 0.1)', iconColor: '#6398FF' },
  { name: '巡检报告', icon: Files, bgColor: 'rgba(82, 196, 26, 0.1)', iconColor: '#52C41A' },
  { name: '维修报告', icon: Tools, bgColor: 'rgba(255, 146, 43, 0.1)', iconColor: '#FF922B' },
  { name: '事件报告', icon: Warning, bgColor: 'rgba(250, 173, 20, 0.1)', iconColor: '#FAAD14' },
  { name: '处置报告', icon: Check, bgColor: 'rgba(82, 196, 26, 0.1)', iconColor: '#52C41A' },
  { name: '巡检工单', icon: Monitor, bgColor: 'rgba(114, 46, 209, 0.1)', iconColor: '#722ED1' }
])

// 待办业务
const todos = ref([
  { type: 'alarm', typeLabel: '缺陷', title: '线路绝缘故障段—D20251117123024', date: '10月11日~10月17日' },
  { type: 'repair', typeLabel: '维修', title: '线路绝缘故障段—D20251117123024', date: '10月11日~10月13日' },
  { type: 'inspection', typeLabel: '巡检', title: '线路绝缘故障段—D20251117123024', date: '10月11日~10月18日' },
  { type: 'inspection', typeLabel: '巡检', title: '线路绝缘故障段—D20251117123024', date: '10月11日~10月18日' }
])

// 知识库
const knowledgeList = ref([
  { type: 'emergency', tag: '应急预案', title: '异常处理无人配电室管理..', date: '2022-10-11' },
  { type: 'emergency', tag: '应急预案', title: '停电处理、关有关规定...', date: '2022-10-11' },
  { type: 'emergency', tag: '应急预案', title: '触电处理、配电室有关...', date: '2022-10-11' },
  { type: 'emergency', tag: '应急预案', title: '市暴雨处理、配电室有关...', date: '2022-10-11' },
  { type: 'emergency', tag: '应急预案', title: '电器设备火灾事件处理...', date: '2022-10-11' },
  { type: 'training', tag: '教育培训', title: '设备巡检', date: '2022-10-11' },
  { type: 'training', tag: '教育培训', title: '自动化提醒', date: '2022-10-11' },
  { type: 'training', tag: '教育培训', title: '操作安全生产', date: '2022-10-11' },
  { type: 'training', tag: '教育培训', title: '应急救援', date: '2022-10-11' }
])

// 关注指标
const metrics = ref([
  {
    title: '10kv 4# 母线 AH03柜',
    lineColor: '#6398FF',
    items: [
      { label: '综保跳闸', status: 'normal', key: 'UA电压', value: '10269V' },
      { label: '综保合闸', status: 'normal', key: 'IA电流', value: '1.9A' },
      { label: '综保超高温', status: 'normal', key: 'P正向有功', value: '453W' },
      { label: '综保高温', status: 'normal', key: 'P正向无功', value: '' }
    ]
  },
  {
    title: '10kv 5# 母线 AH04柜',
    lineColor: '#52C41A',
    items: [
      { label: '综保跳闸', status: 'normal', key: 'UA电压', value: '10269V' },
      { label: '综保合闸', status: 'normal', key: 'IA电流', value: '1.9A' },
      { label: '综保超高温', status: 'normal', key: 'P正向有功', value: '453W' },
      { label: '综保高温', status: 'normal', key: 'P正向无功', value: '' }
    ]
  },
  {
    title: '10kv 6# 母线 AH09柜',
    lineColor: '#FF922B',
    items: [
      { label: '综保跳闸', status: 'normal', key: 'UA电压', value: '10269V' },
      { label: '综保合闸', status: 'normal', key: 'IA电流', value: '1.9A' },
      { label: '综保超高温', status: 'normal', key: 'P正向有功', value: '453W' },
      { label: '综保高温', status: 'normal', key: 'P正向无功', value: '' }
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
      trigger: 'item'
    },
    legend: {
      bottom: '10',
      left: 'center',
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        fontSize: 12,
        color: '#666'
      }
    },
    series: [
      {
        name: '工单统计',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '40%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n{d}%',
          fontSize: 12
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 10
        },
        data: [
          { value: 961, name: '合格', itemStyle: { color: '#5B8FF9' } },
          { value: 283, name: '故障维修中', itemStyle: { color: '#61DDAA' } },
          { value: 516, name: '技师维修中', itemStyle: { color: '#F6BD16' } },
          { value: 22, name: '定期运维22', itemStyle: { color: '#E8684A' } },
          { value: 5, name: '计量工单', itemStyle: { color: '#6DC8EC' } },
          { value: 0, name: '报损', itemStyle: { color: '#9270CA' } },
          { value: 0, name: '待评', itemStyle: { color: '#FF9845' } }
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
  padding: 20px;
  background: var(--bg-color-page);
  min-height: 100vh;
  overflow-y: auto;
}

/* 顶部统计卡片 */
.stats-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

/* 主要内容区 */
.main-content {
  display: grid;
  grid-template-columns: 360px 1fr 320px;
  gap: 20px;
  margin-bottom: 20px;
}

.module-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.module-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.module-header .el-icon {
  color: #6398FF;
}

.module-header .el-button {
  margin-left: auto;
  color: #6398FF;
}

.stat-tip {
  margin-left: auto;
  font-size: 12px;
  color: #999;
  font-weight: normal;
}

/* 常用功能 */
.function-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.function-item:hover {
  transform: translateY(-4px);
}

.function-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.function-name {
  font-size: 13px;
  color: #666;
}

.function-nav {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* 饼图 */
.pie-chart {
  width: 100%;
  height: 300px;
}

/* 待办业务 */
.todo-module {
  height: fit-content;
}

.todo-tabs {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid #F0F0F0;
  padding-bottom: 12px;
}

.todo-tab {
  font-size: 14px;
  color: #666;
  cursor: pointer;
  padding: 4px 8px;
  transition: all 0.3s ease;
}

.todo-tab.active {
  color: #6398FF;
  font-weight: 600;
  position: relative;
}

.todo-tab.active::after {
  content: '';
  position: absolute;
  bottom: -13px;
  left: 0;
  right: 0;
  height: 2px;
  background: #6398FF;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #FAFAFA;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.todo-item:hover {
  background: #F5F5F5;
}

.todo-tag {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.todo-tag.alarm {
  background: #FFE5E5;
  color: #FF4D4F;
}

.todo-tag.repair {
  background: #FFE7D5;
  color: #FF922B;
}

.todo-tag.inspection {
  background: #E5F7E5;
  color: #52C41A;
}

.todo-content {
  flex: 1;
}

.todo-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.todo-date {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 知识库 */
.knowledge-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.knowledge-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #FAFAFA;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.knowledge-item:hover {
  background: #F5F5F5;
}

.knowledge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.knowledge-dot.emergency {
  background: #FF4D4F;
}

.knowledge-dot.training {
  background: #999;
}

.knowledge-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.knowledge-tag {
  color: #FF4D4F;
  font-weight: 600;
}

.knowledge-title {
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.knowledge-date {
  font-size: 12px;
  color: #999;
}

/* 关注指标 */
.bottom-section {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.metric-card {
  border: 1px solid #E8E8E8;
  border-radius: 8px;
  padding: 16px;
  background: #FAFAFA;
}

.metric-header {
  margin-bottom: 16px;
}

.metric-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.metric-line {
  height: 3px;
  border-radius: 2px;
  width: 60px;
}

.metric-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  font-size: 13px;
  color: #666;
}

.metric-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.normal {
  background: #52C41A;
}

.metric-key {
  color: #666;
}

.metric-value {
  color: #333;
  font-weight: 600;
  min-width: 60px;
  text-align: right;
}

@media (max-width: 1600px) {
  .stats-row {
    grid-template-columns: repeat(3, 1fr);
  }

  .main-content {
    grid-template-columns: 1fr;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1200px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
