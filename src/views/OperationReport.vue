<template>
  <div class="page-container operation-report">
    <!-- Top Command Bar -->
    <div class="module-card command-bar mb-4">
      <div class="bar-left">
        <el-icon class="bar-icon"><DataAnalysis /></el-icon>
        <span class="bar-title">运维态势分析报告 (O&M TACTICAL REPORT)</span>
      </div>
      <div class="bar-right">
        <el-radio-group v-model="timeRange" class="sc2-radio-group mr-4" size="small">
          <el-radio-button label="week">本周</el-radio-button>
          <el-radio-button label="month">本月</el-radio-button>
          <el-radio-button label="quarter">本季度</el-radio-button>
        </el-radio-group>
        <el-select v-model="selectedSites" multiple collapse-tags placeholder="选择站点" class="sc2-select w-64 mr-4">
          <el-option label="总部大楼 #1" value="1" />
          <el-option label="科技园区 #2" value="2" />
          <el-option label="物流中心 #3" value="3" />
        </el-select>
        <el-button type="primary" icon="Search" @click="refreshData">生成报告</el-button>
        <el-button class="sc2-btn-outline" icon="Download">导出 PDF</el-button>
      </div>
    </div>

    <!-- KPI Dashboard (Global) -->
    <div class="grid grid-cols-4 gap-4 mb-4">
      <div class="stat-card-item">
        <div class="icon-wrapper primary"><el-icon><Files /></el-icon></div>
        <div class="info">
          <div class="label">工单总数</div>
          <div class="value">{{ kpi.workOrders }}</div>
          <div class="sub-val">环比 <span class="text-success">↑ 5%</span></div>
        </div>
      </div>
      <div class="stat-card-item success">
        <div class="icon-wrapper"><el-icon><Position /></el-icon></div>
        <div class="info">
          <div class="label">巡检覆盖率</div>
          <div class="value">{{ kpi.inspectionRate }}%</div>
          <div class="sub-val">计划执行无误</div>
        </div>
      </div>
      <div class="stat-card-item danger">
        <div class="icon-wrapper"><el-icon><Warning /></el-icon></div>
        <div class="info">
          <div class="label">新增缺陷</div>
          <div class="value">{{ kpi.defects }}</div>
          <div class="sub-val">主要集中在低压侧</div>
        </div>
      </div>
      <div class="stat-card-item info">
        <div class="icon-wrapper"><el-icon><Document /></el-icon></div>
        <div class="info">
          <div class="label">两票合格率</div>
          <div class="value">{{ kpi.ticketPassRate }}%</div>
          <div class="sub-val">本月无违章</div>
        </div>
      </div>
    </div>

    <!-- Main Tabs -->
    <div class="module-card flex-1 flex flex-col overflow-hidden">
      <el-tabs v-model="activeTab" class="sc2-tabs h-full flex flex-col">
        
        <!-- Tab 1: OVERVIEW -->
        <el-tab-pane label="综合态势 (OVERVIEW)" name="overview" class="h-full">
          <div class="flex flex-col h-full gap-4 p-4">
            <div class="chart-container flex-1 relative min-h-[300px]">
              <div class="chart-header">30天运维趋势 (30-Day Trend)</div>
              <div ref="trendChartRef" class="w-full h-full" style="min-height: 300px;"></div>
            </div>
            <div class="flex-1 flex flex-col min-h-[250px]">
              <div class="chart-header">配电室工作量排名 (Workload Ranking)</div>
              <el-table :data="rankingData" class="sc2-table flex-1" size="small">
                <el-table-column type="index" label="排名" width="60" />
                <el-table-column prop="name" label="站点名称" />
                <el-table-column prop="score" label="综合评分" width="100">
                   <template #default="{ row }"><span class="text-primary font-bold">{{ row.score }}</span></template>
                </el-table-column>
                <el-table-column prop="woCount" label="工单数" width="100" />
                <el-table-column prop="defectCount" label="缺陷数" width="100" />
                <el-table-column prop="manager" label="负责人" width="100" />
              </el-table>
            </div>
          </div>
        </el-tab-pane>

        <!-- Tab 2: DEFECTS -->
        <el-tab-pane label="缺陷分析 (DEFECTS)" name="defects" class="h-full">
          <div class="flex flex-col h-full gap-4 p-4">
             <div class="grid grid-cols-3 gap-4 h-[300px]">
                <div class="sub-module flex flex-col">
                  <div class="chart-header">缺陷等级分布</div>
                  <div ref="defectPieRef" class="flex-1 w-full" style="min-height: 200px;"></div>
                </div>
                <div class="sub-module flex flex-col">
                  <div class="chart-header">消缺闭环率趋势</div>
                  <div ref="defectRateRef" class="flex-1 w-full" style="min-height: 200px;"></div>
                </div>
                <div class="sub-module flex flex-col">
                  <div class="chart-header">高发缺陷类型 TOP5</div>
                  <div ref="defectBarRef" class="flex-1 w-full" style="min-height: 200px;"></div>
                </div>
             </div>
             <div class="flex-1 flex flex-col">
                <div class="chart-header">站点缺陷频次排名 (Defect Frequency)</div>
                <el-table :data="defectRankingData" class="sc2-table flex-1" size="small">
                   <el-table-column type="index" label="排名" width="60" />
                   <el-table-column prop="name" label="站点名称" />
                   <el-table-column prop="p1" label="紧急缺陷" width="100">
                      <template #default="{ row }"><span class="text-danger">{{ row.p1 }}</span></template>
                   </el-table-column>
                   <el-table-column prop="p2" label="重大缺陷" width="100" />
                   <el-table-column prop="p3" label="一般缺陷" width="100" />
                   <el-table-column prop="total" label="总计" width="100" sortable />
                </el-table>
             </div>
          </div>
        </el-tab-pane>

        <!-- Tab 3: EFFICIENCY -->
        <el-tab-pane label="工单效率 (EFFICIENCY)" name="workorders" class="h-full">
          <div class="grid grid-cols-3 gap-4 h-full p-4">
            <div class="sub-module flex flex-col">
              <div class="chart-header">工单来源占比</div>
              <div ref="woSourceRef" class="flex-1 w-full" style="min-height: 250px;"></div>
            </div>
            <div class="sub-module flex flex-col">
              <div class="chart-header">平均处理时长 (小时)</div>
              <div ref="woDurationRef" class="flex-1 w-full" style="min-height: 250px;"></div>
            </div>
            <div class="sub-module flex flex-col">
              <div class="chart-header">工单逾期趋势</div>
              <div ref="woOverdueRef" class="flex-1 w-full" style="min-height: 250px;"></div>
            </div>
          </div>
        </el-tab-pane>

        <!-- Tab 4: INSPECTION -->
        <el-tab-pane label="巡检表现 (INSPECTION)" name="inspection" class="h-full">
          <div class="flex flex-col h-full gap-4 p-4">
             <div class="grid grid-cols-2 gap-4 h-[300px]">
                <div class="sub-module flex flex-col">
                   <div class="chart-header">巡检计划完成情况</div>
                   <div ref="inspPieRef" class="flex-1 w-full" style="min-height: 200px;"></div>
                </div>
                <div class="sub-module flex flex-col">
                   <div class="chart-header">巡检异常发现趋势</div>
                   <div ref="inspTrendRef" class="flex-1 w-full" style="min-height: 200px;"></div>
                </div>
             </div>
             <div class="flex-1 flex flex-col">
                <div class="chart-header">巡检执行明细 (Execution Details)</div>
                <el-table :data="inspectionData" class="sc2-table flex-1" size="small">
                   <el-table-column prop="date" label="日期" width="120" />
                   <el-table-column prop="site" label="站点" />
                   <el-table-column prop="task" label="任务名称" />
                   <el-table-column prop="status" label="状态" width="100">
                      <template #default="{ row }">
                         <el-tag :type="row.status === 'Done' ? 'success' : 'warning'" size="small">{{ row.status }}</el-tag>
                      </template>
                   </el-table-column>
                   <el-table-column prop="issues" label="发现隐患" width="100" />
                   <el-table-column prop="person" label="执行人" width="100" />
                </el-table>
             </div>
          </div>
        </el-tab-pane>

        <!-- Tab 5: PERMITS -->
        <el-tab-pane label="两票管理 (PERMITS)" name="permits" class="h-full">
          <div class="flex flex-col h-full gap-4 p-4">
             <!-- Mini KPI for Tickets -->
             <div class="grid grid-cols-3 gap-4">
                <div class="sub-module py-4 flex items-center justify-between">
                   <span>工作票总数</span>
                   <span class="text-xl font-bold text-primary">128</span>
                </div>
                <div class="sub-module py-4 flex items-center justify-between">
                   <span>操作票总数</span>
                   <span class="text-xl font-bold text-warning">85</span>
                </div>
                <div class="sub-module py-4 flex items-center justify-between">
                   <span>综合合规率</span>
                   <span class="text-xl font-bold text-success">99.8%</span>
                </div>
             </div>
             
             <div class="h-[300px] sub-module flex flex-col">
                <div class="chart-header">两票开具数量趋势</div>
                <div ref="ticketLineRef" class="flex-1 w-full" style="min-height: 200px;"></div>
             </div>

             <div class="flex-1 flex flex-col">
                <div class="chart-header">近期两票记录 (Recent Tickets)</div>
                <el-table :data="ticketData" class="sc2-table flex-1" size="small">
                   <el-table-column prop="id" label="票号" width="140" />
                   <el-table-column prop="type" label="类型" width="100">
                      <template #default="{ row }">
                         <el-tag :type="row.type === '工作票' ? '' : 'warning'" size="small" effect="dark">{{ row.type }}</el-tag>
                      </template>
                   </el-table-column>
                   <el-table-column prop="content" label="工作/操作任务" show-overflow-tooltip />
                   <el-table-column prop="site" label="站点" width="150" />
                   <el-table-column prop="date" label="时间" width="160" />
                   <el-table-column prop="status" label="状态" width="100">
                      <template #default="{ row }">
                         <span class="text-success" v-if="row.status === 'Qualified'">合格</span>
                         <span class="text-danger" v-else>不合格</span>
                      </template>
                   </el-table-column>
                </el-table>
             </div>
          </div>
        </el-tab-pane>

      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { DataAnalysis, Files, Position, Warning, Document } from '@element-plus/icons-vue'

const timeRange = ref('month')
const selectedSites = ref([])
const activeTab = ref('overview')

// KPI Data
const kpi = ref({
  workOrders: 342,
  inspectionRate: 98.5,
  defects: 12,
  ticketPassRate: 99.8
})

// Table Data
const rankingData = ref<any[]>([])
const defectRankingData = ref<any[]>([])
const inspectionData = ref<any[]>([])
const ticketData = ref<any[]>([])

// Chart Refs
const trendChartRef = ref()
const defectPieRef = ref()
const defectRateRef = ref()
const defectBarRef = ref()
const woSourceRef = ref()
const woDurationRef = ref()
const woOverdueRef = ref()
const inspPieRef = ref()
const inspTrendRef = ref() // New
const ticketLineRef = ref()

let charts: echarts.ECharts[] = []

// Colors
const colors = {
  primary: '#00F0FF',
  secondary: '#0078D7',
  danger: '#FF2E63',
  warning: '#FFD600',
  success: '#00E676',
  text: '#94A3B8',
  grid: 'rgba(255,255,255,0.05)'
}

// --- Data Generators ---

const generateTables = () => {
  // Ranking
  rankingData.value = Array.from({length: 5}, (_, i) => ({
    name: `配电室 #${i + 101}`,
    score: (90 + Math.random() * 10).toFixed(1),
    woCount: Math.floor(Math.random() * 50),
    defectCount: Math.floor(Math.random() * 5),
    manager: ['张三', '李四', '王五'][i % 3]
  }))

  // Defect Ranking
  defectRankingData.value = Array.from({length: 5}, (_, i) => ({
    name: `站点 A-${i}`,
    p1: Math.floor(Math.random() * 2),
    p2: Math.floor(Math.random() * 5),
    p3: Math.floor(Math.random() * 10),
    total: 0
  })).map(d => ({ ...d, total: d.p1 + d.p2 + d.p3 })).sort((a, b) => b.total - a.total)

  // Inspection List
  inspectionData.value = Array.from({length: 8}, (_, i) => ({
    date: '2023-11-' + (20 - i),
    site: `科技园 #${i+1}`,
    task: '月度例行巡检',
    status: Math.random() > 0.1 ? 'Done' : 'Pending',
    issues: Math.floor(Math.random() * 3),
    person: '运维组 A'
  }))

  // Ticket List
  ticketData.value = Array.from({length: 8}, (_, i) => ({
    id: `T-20231122-${100+i}`,
    type: Math.random() > 0.5 ? '工作票' : '操作票',
    content: Math.random() > 0.5 ? '1#变压器检修' : '10kV 母线倒闸操作',
    site: '总部大楼 #1',
    date: '2023-11-' + (22 - i),
    status: 'Qualified'
  }))
}

const generateTrendData = () => {
  const days = 30
  const workOrders = [], inspections = [], defects = []
  for (let i = 0; i < days; i++) {
    workOrders.push(Math.floor(10 + Math.random() * 15 + Math.sin(i/3) * 5))
    inspections.push(Math.floor(20 + Math.random() * 5))
    defects.push(Math.floor(Math.random() * 4))
  }
  return { workOrders, inspections, defects }
}

// --- Chart Inits ---

const initTrendChart = () => {
  if (!trendChartRef.value) return
  const chart = echarts.init(trendChartRef.value)
  const data = generateTrendData()
  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    legend: { textStyle: { color: colors.text }, bottom: 0 },
    grid: { top: 40, right: 40, bottom: 40, left: 40, containLabel: true },
    xAxis: { type: 'category', data: Array.from({length:30},(_,i)=>`${i+1}`), axisLine:{lineStyle:{color:colors.grid}} },
    yAxis: { type: 'value', splitLine:{lineStyle:{color:colors.grid}} },
    series: [
      { name: '工单', type: 'line', smooth: true, data: data.workOrders, itemStyle: { color: colors.primary }, areaStyle: { opacity: 0.1 } },
      { name: '巡检', type: 'line', smooth: true, data: data.inspections, itemStyle: { color: colors.success } },
      { name: '缺陷', type: 'line', smooth: true, data: data.defects, itemStyle: { color: colors.danger } }
    ]
  })
  charts.push(chart)
}

const initDefectCharts = () => {
  if (defectPieRef.value) {
    const pie = echarts.init(defectPieRef.value)
    pie.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item' },
      legend: { bottom: 0, textStyle: { color: colors.text } },
      series: [{
        type: 'pie', radius: ['40%', '65%'], center: ['50%', '45%'],
        itemStyle: { borderRadius: 5, borderColor: '#000', borderWidth: 2 },
        data: [
          { value: Math.floor(Math.random()*5), name: '紧急 (P1)', itemStyle: { color: colors.danger } },
          { value: Math.floor(Math.random()*10), name: '重要 (P2)', itemStyle: { color: colors.warning } },
          { value: Math.floor(Math.random()*20), name: '一般 (P3)', itemStyle: { color: colors.secondary } }
        ]
      }]
    })
    charts.push(pie)
  }
  if (defectRateRef.value) {
    const line = echarts.init(defectRateRef.value)
    line.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['W1', 'W2', 'W3', 'W4'] },
      yAxis: { type: 'value', min: 80, max: 100 },
      series: [{ type: 'line', data: [85, 89, 94, 96], itemStyle: { color: colors.success } }]
    })
    charts.push(line)
  }
  if (defectBarRef.value) {
    const bar = echarts.init(defectBarRef.value)
    bar.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      grid: { top: 10, bottom: 20, left: 10, right: 20, containLabel: true },
      xAxis: { type: 'value', show: false },
      yAxis: { type: 'category', data: ['绝缘', '通讯', '温度', '机构', '其他'] },
      series: [{ type: 'bar', data: [12, 10, 8, 6, 4], itemStyle: { color: colors.warning } }]
    })
    charts.push(bar)
  }
}

const initEfficiencyCharts = () => {
  // Reusing similar logic as before for WO Source, Duration, Overdue
  if (woSourceRef.value) {
    const pie = echarts.init(woSourceRef.value)
    pie.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie', radius: '60%',
        data: [{value:40, name:'自动'}, {value:30, name:'人工'}, {value:30, name:'巡检'}]
      }]
    })
    charts.push(pie)
  }
  if (woDurationRef.value) {
    const bar = echarts.init(woDurationRef.value)
    bar.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['抢修', '消缺', '维护'] },
      yAxis: {},
      series: [{ type: 'bar', data: [4, 24, 48], itemStyle: { color: colors.primary } }]
    })
    charts.push(bar)
  }
  if (woOverdueRef.value) {
    const line = echarts.init(woOverdueRef.value)
    line.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['W1', 'W2', 'W3', 'W4'] },
      yAxis: {},
      series: [{ type: 'line', data: [5, 3, 2, 1], itemStyle: { color: colors.danger } }]
    })
    charts.push(line)
  }
}

const initInspectionCharts = () => {
  if (inspPieRef.value) {
    const pie = echarts.init(inspPieRef.value)
    pie.setOption({
      tooltip: { trigger: 'item' },
      title: { text: '98%', left: 'center', top: '40%', textStyle: { color: '#fff' } },
      series: [{
        type: 'pie', radius: ['50%', '70%'], avoidLabelOverlap: false,
        data: [{value:98, itemStyle:{color:colors.success}}, {value:2, itemStyle:{color:colors.text}}]
      }]
    })
    charts.push(pie)
  }
  if (inspTrendRef.value) {
    const line = echarts.init(inspTrendRef.value)
    line.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['W1', 'W2', 'W3', 'W4'] },
      yAxis: {},
      series: [{ type: 'line', data: [2, 5, 1, 0], itemStyle: { color: colors.warning } }]
    })
    charts.push(line)
  }
}

const initPermitCharts = () => {
  if (ticketLineRef.value) {
    const line = echarts.init(ticketLineRef.value)
    line.setOption({
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0 },
      xAxis: { type: 'category', data: Array.from({length:7},(_,i)=>`D${i+1}`) },
      yAxis: {},
      series: [
        { name: '工作票', type: 'line', data: [2,4,1,5,3,2,4], itemStyle:{color:colors.primary} },
        { name: '操作票', type: 'line', data: [1,3,2,4,2,1,3], itemStyle:{color:colors.warning} }
      ]
    })
    charts.push(line)
  }
}

const refreshData = async () => {
  // Generate new data
  kpi.value = {
    workOrders: 300 + Math.floor(Math.random() * 100),
    inspectionRate: +(95 + Math.random() * 5).toFixed(1),
    defects: Math.floor(Math.random() * 20),
    ticketPassRate: +(98 + Math.random() * 2).toFixed(1)
  }
  generateTables()
  
  // Reset Charts
  charts.forEach(c => c.dispose())
  charts = []
  
  // Manual Tab Refresh
  const current = activeTab.value
  activeTab.value = 'temp'
  await nextTick()
  activeTab.value = current
}

watch(activeTab, async (val) => {
  if (val === 'temp') return
  await nextTick()
  // Small delay to allow flexbox to settle
  setTimeout(() => {
    charts.forEach(c => c.dispose())
    charts = []
    
    if (val === 'overview') initTrendChart()
    else if (val === 'defects') initDefectCharts()
    else if (val === 'workorders') initEfficiencyCharts()
    else if (val === 'inspection') initInspectionCharts()
    else if (val === 'permits') initPermitCharts()
  }, 50)
})

onMounted(async () => {
  generateTables()
  await nextTick()
  if (activeTab.value === 'overview') initTrendChart()
  window.addEventListener('resize', () => charts.forEach(c => c.resize()))
})

onUnmounted(() => {
  charts.forEach(c => c.dispose())
})
</script>

<style scoped>
/* Tab Fixes */
.sc2-tabs {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden; /* Prevent tab container itself from overflowing */
}

:deep(.el-tabs__content) { 
  flex: 1; 
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0; /* Critical for nested flex scroll */
}
:deep(.el-tab-pane) { 
  height: 100%; 
  overflow-y: auto; 
  padding-bottom: 20px; /* Prevent bottom cutoff */
}
:deep(.el-tabs__header) {
  margin-bottom: 0; /* Remove default margin to control spacing manually */
  flex-shrink: 0;
}
:deep(.el-tabs__item) {
  color: var(--text-sub);
  font-family: 'Rajdhani';
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s;
}
:deep(.el-tabs__item.is-active) {
  color: var(--tech-primary);
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
}
:deep(.el-tabs__item:hover) {
  color: var(--tech-primary);
}
:deep(.el-tabs__nav-wrap::after) {
  background-color: rgba(0, 240, 255, 0.1);
  height: 1px;
}

.operation-report {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  gap: 16px;
}

.command-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  flex-shrink: 0;
}

.bar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--tech-primary);
}
.bar-icon { font-size: 24px; }
.bar-title { font-family: 'Orbitron'; font-weight: bold; font-size: 18px; letter-spacing: 1px; }

.bar-right {
  display: flex;
  align-items: center;
}

/* Stats */
.stat-card-item {
  padding: 20px;
  gap: 16px;
}
.sub-val { font-size: 12px; color: var(--text-sub); margin-top: 4px; }
.text-success { color: var(--status-success); font-weight: bold; }
.text-danger { color: var(--status-danger); font-weight: bold; }
.text-primary { color: var(--tech-primary); }
.text-warning { color: var(--status-warning); }

/* Charts */
.chart-container {
  position: relative;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 4px;
  background: rgba(0,0,0,0.2);
  padding: 16px;
}
.chart-header {
  font-family: 'Microsoft YaHei';
  font-weight: bold;
  color: var(--text-bright);
  margin-bottom: 10px;
  border-left: 3px solid var(--tech-primary);
  padding-left: 10px;
}

.sub-module {
  background: rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 4px;
  padding: 16px;
}
</style>