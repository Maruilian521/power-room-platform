<template>
  <div class="energy-report-page">
    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 页面标题区 -->
      <div class="page-header">
        <div class="header-left">
          <span class="page-title">
            <el-icon><Histogram /></el-icon>
            电能报表
          </span>
          <span class="standard-ref">每月抄表记录 | 依据 DB11/T 527-2021</span>
        </div>
        <div class="header-actions">
          <!-- 视图切换 -->
          <div class="view-switch">
            <button
              :class="['switch-btn', { active: viewMode === 'report' }]"
              @click="viewMode = 'report'"
              title="报表视图"
            >
              <el-icon><Document /></el-icon>
              <span>报表</span>
            </button>
            <button
              :class="['switch-btn', { active: viewMode === 'list' }]"
              @click="viewMode = 'list'"
              title="列表视图"
            >
              <el-icon><List /></el-icon>
              <span>列表</span>
            </button>
          </div>
          <el-select v-model="selectedRoom" placeholder="选择配电室" style="width: 200px">
            <el-option
              v-for="room in rooms"
              :key="room.id"
              :label="room.name"
              :value="room.id"
            />
          </el-select>
          <el-date-picker
            v-model="selectedMonth"
            type="month"
            placeholder="选择月份"
            format="YYYY年MM月"
            value-format="YYYY-MM"
            style="width: 160px"
          />
          <el-select v-model="selectedCabinet" placeholder="配电柜" style="width: 120px" clearable>
            <el-option label="全部" value="" />
            <el-option v-for="cab in cabinetList" :key="cab" :label="cab" :value="cab" />
          </el-select>
          <button class="action-btn btn-primary" @click="refreshData">
            <el-icon><Refresh /></el-icon>
            <span>刷新数据</span>
          </button>
          <button class="action-btn btn-primary" @click="exportReport">
            <el-icon><Download /></el-icon>
            <span>导出报表</span>
          </button>
        </div>
      </div>

      <!-- 内容区容器 -->
      <div class="content-wrapper">
        <!-- ==================== 报表视图 ==================== -->
        <template v-if="viewMode === 'report'">
        <!-- 报表信息头 -->
        <div class="report-info-header">
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">配电室名称</span>
              <span class="info-value">{{ currentRoom?.name || '1号配电室' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">报表周期</span>
              <span class="info-value">{{ formatMonth(selectedMonth) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">抄表总数</span>
              <span class="info-value highlight">{{ filteredRecords.length }} 条</span>
            </div>
            <div class="info-item">
              <span class="info-label">本月总用电</span>
              <span class="info-value highlight">{{ totalConsumption.toFixed(2) }} kWh</span>
            </div>
            <div class="info-item">
              <span class="info-label">数据状态</span>
              <span class="info-value status" :class="dataStatus">
                <span class="status-dot"></span>
                {{ dataStatus === 'complete' ? '数据完整' : '部分缺失' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 统计卡片 -->
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><Histogram /></el-icon>
            </div>
            <div class="stat-content">
              <span class="stat-label">本月用电量</span>
              <span class="stat-value">{{ monthlyStats.totalConsumption.toFixed(2) }}</span>
              <span class="stat-unit">kWh</span>
            </div>
            <div class="stat-trend" :class="monthlyStats.consumptionTrend > 0 ? 'up' : 'down'">
              <el-icon><Top v-if="monthlyStats.consumptionTrend > 0" /><Bottom v-else /></el-icon>
              {{ Math.abs(monthlyStats.consumptionTrend).toFixed(1) }}%
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon warning">
              <el-icon><Lightning /></el-icon>
            </div>
            <div class="stat-content">
              <span class="stat-label">最大单回路用电</span>
              <span class="stat-value">{{ monthlyStats.maxConsumption.toFixed(2) }}</span>
              <span class="stat-unit">kWh</span>
            </div>
            <div class="stat-sub">{{ monthlyStats.maxConsumptionCircuit }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon success">
              <el-icon><Odometer /></el-icon>
            </div>
            <div class="stat-content">
              <span class="stat-label">平均单回路用电</span>
              <span class="stat-value">{{ monthlyStats.avgConsumption.toFixed(2) }}</span>
              <span class="stat-unit">kWh</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon info">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="stat-content">
              <span class="stat-label">同比上月</span>
              <span class="stat-value" :class="monthlyStats.momChange > 0 ? 'up' : 'down'">
                {{ monthlyStats.momChange > 0 ? '+' : '' }}{{ monthlyStats.momChange.toFixed(1) }}%
              </span>
            </div>
          </div>
        </div>

        <!-- 主记录表格 -->
        <div class="report-table-panel">
          <div class="panel-header">
            <span class="panel-title">
              <el-icon><Document /></el-icon>
              电能抄表记录（月度）
            </span>
            <div class="panel-actions">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索回路名称..."
                style="width: 200px"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </div>
          <div class="table-container">
            <table class="report-table">
              <thead>
                <tr>
                  <th class="cabinet-col">配电柜</th>
                  <th class="drawer-col">抽屉柜编号</th>
                  <th class="location-col">具体位置</th>
                  <th class="date-col">上次抄表日期</th>
                  <th class="reading-col">上次抄表底数</th>
                  <th class="date-col">本次抄表日期</th>
                  <th class="reading-col">本次抄表底数</th>
                  <th class="consumption-col">本月用电量(kWh)</th>
                  <th class="status-col">状态</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(group, cabinet) in groupedRecords" :key="cabinet">
                  <tr
                    v-for="(record, index) in group"
                    :key="record.id"
                    :class="{ 'highlight-row': record.consumption > 10000 }"
                  >
                    <td v-if="index === 0" :rowspan="group.length" class="cabinet-cell">
                      <div class="cabinet-name-wrapper">
                        <span
                          v-if="editingCabinet !== cabinet"
                          class="cabinet-name"
                          @dblclick="startEditCabinet(cabinet as string)"
                        >
                          {{ cabinetNames[cabinet as string] || cabinet }}
                        </span>
                        <input
                          v-else
                          ref="cabinetInput"
                          v-model="editingCabinetName"
                          class="cabinet-edit-input"
                          @blur="saveCabinetName(cabinet as string)"
                          @keyup.enter="saveCabinetName(cabinet as string)"
                          @keyup.escape="cancelEditCabinet"
                        />
                        <el-icon
                          v-if="editingCabinet !== cabinet"
                          class="edit-icon"
                          @click="startEditCabinet(cabinet as string)"
                        >
                          <Edit />
                        </el-icon>
                      </div>
                    </td>
                    <td class="drawer-cell">{{ record.drawerCode }}</td>
                    <td class="location-cell">{{ record.location }}</td>
                    <td class="date-cell">{{ record.lastDate }}</td>
                    <td class="reading-cell">{{ record.lastReading.toFixed(2) }}</td>
                    <td class="date-cell">{{ record.currentDate }}</td>
                    <td class="reading-cell">{{ record.currentReading.toFixed(2) }}</td>
                    <td class="consumption-cell" :class="getConsumptionClass(record.consumption)">
                      {{ record.consumption.toFixed(2) }}
                    </td>
                    <td class="status-cell">
                      <span v-if="record.status === 'normal'" class="status-tag normal">正常</span>
                      <span v-else-if="record.status === 'high'" class="status-tag warning">偏高</span>
                      <span v-else-if="record.status === 'abnormal'" class="status-tag danger">异常</span>
                    </td>
                  </tr>
                </template>
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="7" class="total-label">合计</td>
                  <td class="total-value">{{ totalConsumption.toFixed(2) }}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- 用电分析 -->
        <div class="analysis-section">
          <div class="analysis-card">
            <div class="card-header">
              <el-icon><PieChart /></el-icon>
              <span>配电柜用电占比</span>
            </div>
            <div class="card-body">
              <div class="pie-chart-placeholder">
                <div
                  v-for="(item, index) in cabinetStats"
                  :key="item.cabinet"
                  class="pie-item"
                  :style="{ '--color': pieColors[index % pieColors.length] }"
                >
                  <div class="pie-bar" :style="{ width: item.percentage + '%' }"></div>
                  <div class="pie-info">
                    <span class="pie-label">{{ item.cabinet }}</span>
                    <span class="pie-value">{{ item.consumption.toFixed(0) }} kWh</span>
                    <span class="pie-percent">{{ item.percentage.toFixed(1) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="analysis-card">
            <div class="card-header">
              <el-icon><TrendCharts /></el-icon>
              <span>近6个月用电趋势</span>
            </div>
            <div class="card-body">
              <div class="trend-chart">
                <div class="chart-bars">
                  <div
                    v-for="item in monthlyTrend"
                    :key="item.month"
                    class="bar-item"
                  >
                    <div class="bar-value">{{ (item.value / 1000).toFixed(0) }}k</div>
                    <div class="bar" :style="{ height: (item.value / maxTrendValue * 100) + '%' }"></div>
                    <div class="bar-label">{{ item.month }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="analysis-card">
            <div class="card-header">
              <el-icon><Warning /></el-icon>
              <span>用电异常提醒</span>
            </div>
            <div class="card-body">
              <div class="alert-list">
                <div v-for="alert in consumptionAlerts" :key="alert.id" class="alert-item" :class="alert.level">
                  <el-icon><WarningFilled /></el-icon>
                  <div class="alert-content">
                    <div class="alert-title">{{ alert.title }}</div>
                    <div class="alert-desc">{{ alert.description }}</div>
                  </div>
                </div>
                <div v-if="consumptionAlerts.length === 0" class="no-alert">
                  <el-icon><CircleCheck /></el-icon>
                  <span>本月用电无异常</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </template>

        <!-- ==================== 列表视图 ==================== -->
        <template v-else>
          <div class="list-view-container">
            <!-- 列表工具栏 -->
            <div class="list-toolbar">
              <div class="toolbar-left">
                <el-input
                  v-model="listSearchKeyword"
                  placeholder="搜索位置、编号..."
                  style="width: 200px"
                  clearable
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
                <el-select v-model="listStatusFilter" placeholder="状态筛选" style="width: 120px" clearable>
                  <el-option label="全部" value="" />
                  <el-option label="正常" value="normal" />
                  <el-option label="偏高" value="high" />
                  <el-option label="异常" value="abnormal" />
                </el-select>
              </div>
              <div class="toolbar-right">
                <span class="record-count">共 {{ listFilteredRecords.length }} 条记录</span>
              </div>
            </div>

            <!-- 列表卡片 -->
            <div class="list-cards">
              <div
                v-for="record in listFilteredRecords"
                :key="record.id"
                :class="['list-card', record.status]"
              >
                <div class="card-header">
                  <div class="card-cabinet">
                    <span class="cabinet-code">{{ cabinetNames[record.cabinet] || record.cabinet }}</span>
                    <span class="drawer-code">{{ record.drawerCode }}</span>
                  </div>
                  <div :class="['card-status', record.status]">
                    <span v-if="record.status === 'normal'">正常</span>
                    <span v-else-if="record.status === 'high'">偏高</span>
                    <span v-else>异常</span>
                  </div>
                </div>
                <div class="card-body">
                  <div class="location-info">
                    <el-icon><Location /></el-icon>
                    <span>{{ record.location }}</span>
                  </div>
                  <div class="reading-section">
                    <div class="reading-item">
                      <div class="reading-label">上次抄表</div>
                      <div class="reading-date">{{ record.lastDate }}</div>
                      <div class="reading-value">{{ record.lastReading.toFixed(2) }}</div>
                    </div>
                    <div class="reading-arrow">
                      <el-icon><Right /></el-icon>
                    </div>
                    <div class="reading-item current">
                      <div class="reading-label">本次抄表</div>
                      <div class="reading-date">{{ record.currentDate }}</div>
                      <div class="reading-value">{{ record.currentReading.toFixed(2) }}</div>
                    </div>
                  </div>
                  <div class="consumption-display">
                    <span class="consumption-label">本月用电量</span>
                    <span :class="['consumption-value', getConsumptionClass(record.consumption)]">
                      {{ record.consumption.toFixed(2) }}
                      <span class="consumption-unit">kWh</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="listFilteredRecords.length === 0" class="empty-state">
              <el-icon><Document /></el-icon>
              <span>暂无符合条件的记录</span>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 导出对话框 -->
    <el-dialog
      v-model="exportDialogVisible"
      title="导出电能报表"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="export-options">
        <div class="option-group">
          <span class="option-label">导出格式</span>
          <el-radio-group v-model="exportFormat">
            <el-radio label="excel">Excel (.xlsx)</el-radio>
            <el-radio label="pdf">PDF</el-radio>
            <el-radio label="print">直接打印</el-radio>
          </el-radio-group>
        </div>
        <div class="option-group">
          <span class="option-label">导出范围</span>
          <el-radio-group v-model="exportRange">
            <el-radio label="current">当前月份</el-radio>
            <el-radio label="quarter">本季度</el-radio>
            <el-radio label="year">本年度</el-radio>
            <el-radio label="custom">自定义范围</el-radio>
          </el-radio-group>
        </div>
        <div class="option-group" v-if="exportRange === 'custom'">
          <span class="option-label">月份范围</span>
          <el-date-picker
            v-model="exportMonthRange"
            type="monthrange"
            range-separator="至"
            start-placeholder="开始月份"
            end-placeholder="结束月份"
            style="width: 100%"
          />
        </div>
        <div class="option-group">
          <span class="option-label">包含内容</span>
          <el-checkbox-group v-model="exportContent">
            <el-checkbox label="records">抄表记录</el-checkbox>
            <el-checkbox label="stats">统计分析</el-checkbox>
            <el-checkbox label="trend">趋势图表</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <template #footer>
        <button class="action-btn btn-secondary" @click="exportDialogVisible = false">取消</button>
        <button class="action-btn btn-primary" @click="confirmExport">
          <el-icon><Download /></el-icon>
          确认导出
        </button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Histogram, Refresh, Download, Document, Search, Lightning,
  Odometer, DataAnalysis, PieChart, TrendCharts, Warning,
  WarningFilled, CircleCheck, Top, Bottom, Edit, List, Location, Right
} from '@element-plus/icons-vue'

// ========== 基础数据 ==========
const viewMode = ref<'report' | 'list'>('report')
const selectedRoom = ref('room1')
const selectedMonth = ref(new Date().toISOString().slice(0, 7))
const selectedCabinet = ref('')
const searchKeyword = ref('')
const dataStatus = ref('complete')
const exportDialogVisible = ref(false)
const listSearchKeyword = ref('')
const listStatusFilter = ref('')
const exportFormat = ref('excel')
const exportRange = ref('current')
const exportMonthRange = ref<[Date, Date] | null>(null)
const exportContent = ref(['records', 'stats', 'trend'])

const rooms = [
  { id: 'room1', name: '1号配电室', code: 'PDR-001' },
  { id: 'room2', name: '2号配电室', code: 'PDR-002' },
  { id: 'room3', name: '3号配电室', code: 'PDR-003' }
]

const currentRoom = computed(() => rooms.find(r => r.id === selectedRoom.value))

const cabinetList = ['AA6', 'AA7', 'AA8', 'AA9', 'AA10', 'AA11', 'AA12', 'AA13', 'AA14', 'AA15', 'AA16']

// ========== 配电柜名称编辑 ==========
const editingCabinet = ref<string | null>(null)
const editingCabinetName = ref('')
const cabinetInput = ref<HTMLInputElement | null>(null)
const cabinetNames = ref<Record<string, string>>({
  'AA6': 'AA6',
  'AA7': 'AA7',
  'AA8': 'AA8',
  'AA9': 'AA9',
  'AA10': 'AA10',
  'AA11': 'AA11',
  'AA12': 'AA12',
  'AA13': 'AA13',
  'AA14': 'AA14',
  'AA15': 'AA15',
  'AA16': 'AA16'
})

const startEditCabinet = (cabinet: string) => {
  editingCabinet.value = cabinet
  editingCabinetName.value = cabinetNames.value[cabinet] || cabinet
  // 等待DOM更新后聚焦输入框
  setTimeout(() => {
    const input = document.querySelector('.cabinet-edit-input') as HTMLInputElement
    if (input) {
      input.focus()
      input.select()
    }
  }, 10)
}

const saveCabinetName = (cabinet: string) => {
  if (editingCabinetName.value.trim()) {
    cabinetNames.value[cabinet] = editingCabinetName.value.trim()
    ElMessage.success(`配电柜名称已更新为: ${editingCabinetName.value.trim()}`)
  }
  editingCabinet.value = null
  editingCabinetName.value = ''
}

const cancelEditCabinet = () => {
  editingCabinet.value = null
  editingCabinetName.value = ''
}

const pieColors = [
  '#00f0ff', '#00e676', '#ffab00', '#ff5252', '#7c4dff',
  '#18ffff', '#69f0ae', '#ffd740', '#ff6e40', '#e040fb'
]

// ========== 记录数据类型 ==========
interface EnergyRecord {
  id: number
  cabinet: string
  drawerCode: string
  location: string
  lastDate: string
  lastReading: number
  currentDate: string
  currentReading: number
  consumption: number
  status: string
}

// ========== 抄表记录数据 ==========
const energyRecords = ref<EnergyRecord[]>([
  // AA6
  { id: 1, cabinet: 'AA6', drawerCode: '+1-B2-AL24', location: 'B2区城餐饮照明总柜1', lastDate: '10月1日', lastReading: 31.36, currentDate: '11月1日', currentReading: 31.36, consumption: 0, status: 'normal' },
  { id: 2, cabinet: 'AA6', drawerCode: '+1-B2-AL26', location: 'B2区城餐饮照明总柜2', lastDate: '10月1日', lastReading: 0.08, currentDate: '11月1日', currentReading: 0.08, consumption: 0, status: 'normal' },
  { id: 3, cabinet: 'AA6', drawerCode: '+1-B2-AL27', location: 'B2区城餐饮照明总柜7', lastDate: '10月1日', lastReading: 8562.00, currentDate: '11月1日', currentReading: 9090.08, consumption: 528.08, status: 'normal' },
  { id: 4, cabinet: 'AA6', drawerCode: 'AL3015', location: '室外景观照明', lastDate: '10月1日', lastReading: 6045.00, currentDate: '11月1日', currentReading: 6050.4, consumption: 5.4, status: 'normal' },
  { id: 5, cabinet: 'AA6', drawerCode: '+1-B2-AF1', location: 'B2消业空调负荷1', lastDate: '10月1日', lastReading: 72808.00, currentDate: '11月1日', currentReading: 80624.8, consumption: 7816.8, status: 'high' },
  // AA7
  { id: 6, cabinet: 'AA7', drawerCode: '1AAR-9', location: '人防电力电源', lastDate: '10月1日', lastReading: 73.12, currentDate: '11月1日', currentReading: 73.12, consumption: 0, status: 'normal' },
  { id: 7, cabinet: 'AA7', drawerCode: '1AAR-14', location: '人防电力电源', lastDate: '10月1日', lastReading: 97.60, currentDate: '11月1日', currentReading: 97.68, consumption: 0.08, status: 'normal' },
  { id: 8, cabinet: 'AA7', drawerCode: '11AA1', location: '配电总柜', lastDate: '10月1日', lastReading: 283275.20, currentDate: '11月1日', currentReading: 293168.58, consumption: 9893.38, status: 'normal' },
  // AA8
  { id: 9, cabinet: 'AA8', drawerCode: '+1-B2-ALOY2', location: 'B2区城餐饮照明总柜0', lastDate: '10月1日', lastReading: 12.48, currentDate: '11月1日', currentReading: 12.48, consumption: 0, status: 'normal' },
  { id: 10, cabinet: 'AA8', drawerCode: '+1-B2-AL21', location: 'B2区城餐饮照明总柜', lastDate: '10月1日', lastReading: 2083.10, currentDate: '11月1日', currentReading: 2088.35, consumption: 5.25, status: 'normal' },
  { id: 11, cabinet: 'AA8', drawerCode: '1AAR-3', location: '人防照明电源', lastDate: '10月1日', lastReading: 143991.54, currentDate: '11月1日', currentReading: 149707.06, consumption: 5715.52, status: 'normal' },
  { id: 12, cabinet: 'AA8', drawerCode: '1AAR-18', location: '人防照明电源', lastDate: '10月1日', lastReading: 90344.43, currentDate: '11月1日', currentReading: 94708.35, consumption: 4363.92, status: 'normal' },
  // AA9
  { id: 13, cabinet: 'AA9', drawerCode: '+1-JP-ALSW', location: '室外设备预留', lastDate: '10月1日', lastReading: 0.16, currentDate: '11月1日', currentReading: 0.16, consumption: 0, status: 'normal' },
  { id: 14, cabinet: 'AA9', drawerCode: '+1-B2-ATRP0', location: 'B2人防弱电同电源', lastDate: '10月1日', lastReading: 19708.00, currentDate: '11月1日', currentReading: 20730.24, consumption: 1022.24, status: 'normal' },
  { id: 15, cabinet: 'AA9', drawerCode: '+1-B1-ATRP1', location: 'B1人防弱电同电源', lastDate: '10月1日', lastReading: 17842.44, currentDate: '11月1日', currentReading: 18721.23, consumption: 878.79, status: 'normal' },
  { id: 16, cabinet: 'AA9', drawerCode: '+1-B2-ALP6', location: '新增泛光照明', lastDate: '10月1日', lastReading: 28.66, currentDate: '11月1日', currentReading: 28.65, consumption: 0, status: 'normal' },
  { id: 17, cabinet: 'AA9', drawerCode: '+1-B1-ALBP0', location: '变电所', lastDate: '10月1日', lastReading: 679.83, currentDate: '11月1日', currentReading: 680.04, consumption: 0.21, status: 'normal' },
  // AA10
  { id: 18, cabinet: 'AA10', drawerCode: '+1-B1-ATS21', location: '潜水泵3', lastDate: '10月1日', lastReading: 12083.92, currentDate: '11月1日', currentReading: 14968.32, consumption: 2884.4, status: 'normal' },
  { id: 19, cabinet: 'AA10', drawerCode: '+1-B2-ATS22', location: 'B2潜水泵2', lastDate: '10月1日', lastReading: 0.10, currentDate: '11月1日', currentReading: 0.1, consumption: 0, status: 'normal' },
  // AA11
  { id: 20, cabinet: 'AA11', drawerCode: '1AAR-12', location: '人防应急电源', lastDate: '10月1日', lastReading: 9447.48, currentDate: '11月1日', currentReading: 9448.08, consumption: 0.6, status: 'normal' },
  { id: 21, cabinet: 'AA11', drawerCode: '1AAR-2', location: '人防应急电源', lastDate: '10月1日', lastReading: 123.41, currentDate: '11月1日', currentReading: 123.6, consumption: 0.19, status: 'normal' },
  // AA12
  { id: 22, cabinet: 'AA12', drawerCode: '1AAR-17', location: '人防应急电源', lastDate: '10月1日', lastReading: 33521.16, currentDate: '11月1日', currentReading: 33537.54, consumption: 16.38, status: 'normal' },
  { id: 23, cabinet: 'AA12', drawerCode: '+1-B2-APE7', location: 'B2消防风机2', lastDate: '10月1日', lastReading: 1278.48, currentDate: '11月1日', currentReading: 1304.04, consumption: 25.56, status: 'normal' },
  { id: 24, cabinet: 'AA12', drawerCode: '+BP2-APE1', location: '人防应急电源', lastDate: '10月1日', lastReading: 15996.48, currentDate: '11月1日', currentReading: 16102.72, consumption: 106.24, status: 'normal' },
  // AA13
  { id: 25, cabinet: 'AA13', drawerCode: '+1-B2-APE11', location: 'B2消防风机3', lastDate: '10月1日', lastReading: 969.70, currentDate: '11月1日', currentReading: 982.6, consumption: 12.9, status: 'normal' },
  { id: 26, cabinet: 'AA13', drawerCode: '1AAR-7', location: '人防应急电源', lastDate: '10月1日', lastReading: 249.20, currentDate: '11月1日', currentReading: 250.86, consumption: 1.66, status: 'normal' },
  // AA14
  { id: 27, cabinet: 'AA14', drawerCode: '+RP10-APE1', location: '人防应急电源', lastDate: '10月1日', lastReading: 15374.72, currentDate: '11月1日', currentReading: 15520.56, consumption: 145.84, status: 'normal' },
  { id: 28, cabinet: 'AA14', drawerCode: '+RP5-APE1', location: '人防应急电源', lastDate: '10月1日', lastReading: 16362.96, currentDate: '11月1日', currentReading: 16370.45, consumption: 7.49, status: 'normal' },
  // AA15
  { id: 29, cabinet: 'AA15', drawerCode: '+1-B2-APod9', location: 'B1充电桩8(27)慢', lastDate: '10月1日', lastReading: 0.16, currentDate: '11月1日', currentReading: 0.16, consumption: 0, status: 'normal' },
  { id: 30, cabinet: 'AA15', drawerCode: '+1-B2-APod7', location: 'B1充电桩7(21)慢', lastDate: '10月1日', lastReading: 15050.32, currentDate: '11月1日', currentReading: 18738.40, consumption: 3688.08, status: 'high' },
  { id: 31, cabinet: 'AA15', drawerCode: '+1-B2-APod1', location: 'B2充电桩1(16)慢', lastDate: '10月1日', lastReading: 0.10, currentDate: '11月1日', currentReading: 0.1, consumption: 0, status: 'normal' },
  { id: 32, cabinet: 'AA15', drawerCode: '+1-B2-APod3', location: 'B2充电桩3(16)慢', lastDate: '10月1日', lastReading: 18325.15, currentDate: '11月1日', currentReading: 21579.40, consumption: 3254.25, status: 'high' },
  { id: 33, cabinet: 'AA15', drawerCode: '+1-B2-APod4', location: 'B2充电桩4(11)慢', lastDate: '10月1日', lastReading: 0.15, currentDate: '11月1日', currentReading: 0.15, consumption: 0, status: 'normal' },
  { id: 34, cabinet: 'AA15', drawerCode: '+1-B1-APod3', location: 'B1充电桩3(18)慢', lastDate: '10月1日', lastReading: 0.15, currentDate: '11月1日', currentReading: 0.15, consumption: 0, status: 'normal' },
  // AA16
  { id: 35, cabinet: 'AA16', drawerCode: '+1-B1-APod6', location: 'B1充电桩6(12)慢', lastDate: '10月1日', lastReading: 3090.90, currentDate: '11月1日', currentReading: 4423.25, consumption: 1332.35, status: 'normal' },
  { id: 36, cabinet: 'AA16', drawerCode: '+1-B2-APod6', location: 'B2充电桩6(11)慢', lastDate: '10月1日', lastReading: 0.15, currentDate: '11月1日', currentReading: 0.15, consumption: 0, status: 'normal' },
  { id: 37, cabinet: 'AA16', drawerCode: '+1-B1-APod8', location: 'B1充电桩8(14)慢', lastDate: '10月1日', lastReading: 0.15, currentDate: '11月1日', currentReading: 0.25, consumption: 0.1, status: 'normal' }
])

// ========== 筛选后的记录 ==========
const filteredRecords = computed(() => {
  return energyRecords.value.filter(record => {
    const matchCabinet = !selectedCabinet.value || record.cabinet === selectedCabinet.value
    const matchKeyword = !searchKeyword.value ||
      record.location.includes(searchKeyword.value) ||
      record.drawerCode.includes(searchKeyword.value)
    return matchCabinet && matchKeyword
  })
})

// ========== 列表视图筛选 ==========
const listFilteredRecords = computed(() => {
  return filteredRecords.value.filter(record => {
    const matchKeyword = !listSearchKeyword.value ||
      record.location.includes(listSearchKeyword.value) ||
      record.drawerCode.includes(listSearchKeyword.value) ||
      record.cabinet.includes(listSearchKeyword.value)
    const matchStatus = !listStatusFilter.value || record.status === listStatusFilter.value
    return matchKeyword && matchStatus
  })
})

// ========== 按配电柜分组 ==========
const groupedRecords = computed(() => {
  const groups: Record<string, EnergyRecord[]> = {}
  filteredRecords.value.forEach(record => {
    if (!groups[record.cabinet]) {
      groups[record.cabinet] = []
    }
    groups[record.cabinet].push(record)
  })
  return groups
})

// ========== 总用电量 ==========
const totalConsumption = computed(() => {
  return filteredRecords.value.reduce((sum, record) => sum + record.consumption, 0)
})

// ========== 月度统计 ==========
const monthlyStats = ref({
  totalConsumption: 41805.81,
  consumptionTrend: 3.2,
  maxConsumption: 9893.38,
  maxConsumptionCircuit: 'AA7-11AA1 配电总柜',
  avgConsumption: 1130.43,
  momChange: -2.5
})

// ========== 配电柜统计 ==========
const cabinetStats = computed(() => {
  const stats: Record<string, number> = {}
  filteredRecords.value.forEach(record => {
    if (!stats[record.cabinet]) {
      stats[record.cabinet] = 0
    }
    stats[record.cabinet] += record.consumption
  })

  const total = Object.values(stats).reduce((a, b) => a + b, 0)
  return Object.entries(stats)
    .map(([cabinet, consumption]) => ({
      cabinet,
      consumption,
      percentage: total > 0 ? (consumption / total) * 100 : 0
    }))
    .sort((a, b) => b.consumption - a.consumption)
})

// ========== 近6个月趋势 ==========
const monthlyTrend = ref([
  { month: '6月', value: 38500 },
  { month: '7月', value: 42300 },
  { month: '8月', value: 45800 },
  { month: '9月', value: 43200 },
  { month: '10月', value: 40500 },
  { month: '11月', value: 41806 }
])

const maxTrendValue = computed(() => {
  return Math.max(...monthlyTrend.value.map(item => item.value))
})

// ========== 用电异常提醒 ==========
const consumptionAlerts = ref([
  { id: 1, level: 'warning', title: 'B2消业空调负荷1 用电偏高', description: '本月用电7816.8kWh，较上月增长12.5%' },
  { id: 2, level: 'warning', title: 'B1充电桩7(21)慢 用电偏高', description: '本月用电3688.08kWh，建议检查充电频率' }
])

// ========== 辅助函数 ==========
const formatMonth = (month: string) => {
  const [year, m] = month.split('-')
  return `${year}年${m}月`
}

const getConsumptionClass = (consumption: number) => {
  if (consumption > 5000) return 'high'
  if (consumption > 1000) return 'medium'
  return ''
}

const refreshData = () => {
  ElMessage.success('数据刷新成功')
}

const exportReport = () => {
  exportDialogVisible.value = true
}

const confirmExport = () => {
  const formatMap: Record<string, string> = {
    excel: 'Excel报表',
    pdf: 'PDF文件',
    print: '打印任务'
  }
  ElMessage.success(`${formatMap[exportFormat.value]}已生成`)
  exportDialogVisible.value = false
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

@keyframes scanline {
  0% { background-position: 0% 0%; }
  100% { background-position: 0% 200%; }
}

.energy-report-page {
  width: 100%;
  height: 100vh;
  background: var(--bg-deep);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 20px;
}

/* 页面标题区 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px 20px 24px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: var(--tech-primary);
}

.standard-ref {
  font-size: 12px;
  color: var(--text-muted);
  padding: 4px 12px;
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 0 24px 24px;
  gap: 20px;
}

/* 主容器 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(13, 18, 26, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 240, 255, 0.2);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5), 0 5px 15px rgba(0, 0, 0, 0.3);
  position: relative;
  clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
}

.main-container::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  background: linear-gradient(180deg, rgba(0, 240, 255, 0.1) 0%, rgba(0, 240, 255, 0.6) 50%, rgba(0, 240, 255, 0.1) 100%);
  background-size: 100% 200%;
  animation: scanline 4s linear infinite;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0.6;
}

/* 报表信息头 */
.report-info-header {
  background: rgba(0, 240, 255, 0.05);
  border: 1px solid rgba(0, 240, 255, 0.2);
  padding: 16px 20px;
}

.info-row {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-label {
  font-size: 12px;
  color: var(--text-sub);
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-bright);
}

.info-value.highlight {
  color: var(--tech-primary);
}

.info-value.status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.info-value.status.complete .status-dot {
  background: var(--status-success);
}

.info-value.status.incomplete .status-dot {
  background: var(--status-warning);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.3);
  color: var(--tech-primary);
  font-size: 22px;
}

.stat-icon.warning {
  background: rgba(255, 214, 0, 0.1);
  border-color: rgba(255, 214, 0, 0.3);
  color: var(--status-warning);
}

.stat-icon.success {
  background: rgba(0, 230, 118, 0.1);
  border-color: rgba(0, 230, 118, 0.3);
  color: var(--status-success);
}

.stat-icon.info {
  background: rgba(96, 165, 250, 0.1);
  border-color: rgba(96, 165, 250, 0.3);
  color: #60a5fa;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 12px;
  color: var(--text-sub);
  display: block;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-bright);
  font-family: 'DIN Alternate', sans-serif;
}

.stat-value.up {
  color: var(--status-danger);
}

.stat-value.down {
  color: var(--status-success);
}

.stat-unit {
  font-size: 12px;
  color: var(--text-sub);
  margin-left: 4px;
}

.stat-trend {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 2px;
}

.stat-trend.up {
  background: rgba(255, 46, 99, 0.15);
  color: var(--status-danger);
}

.stat-trend.down {
  background: rgba(0, 230, 118, 0.15);
  color: var(--status-success);
}

.stat-sub {
  font-size: 11px;
  color: var(--text-muted);
  position: absolute;
  bottom: 12px;
  right: 12px;
}

/* 记录表格面板 */
.report-table-panel {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  background: rgba(0, 240, 255, 0.03);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--tech-primary);
}

.panel-actions {
  display: flex;
  gap: 12px;
}

/* 表格容器 */
.table-container {
  overflow-x: auto;
  padding: 16px;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.report-table th,
.report-table td {
  padding: 10px 12px;
  text-align: center;
  border: 1px solid rgba(0, 240, 255, 0.15);
}

.report-table th {
  background: rgba(0, 240, 255, 0.08);
  color: var(--tech-primary);
  font-weight: 600;
  white-space: nowrap;
}

.report-table td {
  background: rgba(0, 0, 0, 0.2);
  color: var(--text-bright);
}

.report-table tr:hover td {
  background: rgba(0, 240, 255, 0.08);
}

.report-table tr.highlight-row td {
  background: rgba(255, 214, 0, 0.08);
}

.cabinet-col { width: 80px; }
.drawer-col { width: 140px; }
.location-col { min-width: 180px; }
.date-col { width: 100px; }
.reading-col { width: 120px; }
.consumption-col { width: 130px; }
.status-col { width: 80px; }

.cabinet-cell {
  background: rgba(0, 240, 255, 0.1) !important;
  font-weight: 600;
  color: var(--tech-primary) !important;
  vertical-align: middle;
}

.cabinet-name-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  position: relative;
}

.cabinet-name {
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 2px;
  transition: all 0.2s;
}

.cabinet-name:hover {
  background: rgba(0, 240, 255, 0.2);
}

.cabinet-edit-input {
  width: 80px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid var(--tech-primary);
  color: var(--tech-primary);
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  outline: none;
  border-radius: 2px;
}

.cabinet-edit-input:focus {
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.4);
}

.edit-icon {
  font-size: 12px;
  color: var(--text-muted);
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
}

.cabinet-name-wrapper:hover .edit-icon {
  opacity: 1;
}

.edit-icon:hover {
  color: var(--tech-primary);
}

.drawer-cell {
  font-family: 'Consolas', monospace;
  font-size: 12px;
}

.location-cell {
  text-align: left !important;
  color: var(--text-sub) !important;
}

.reading-cell {
  font-family: 'DIN Alternate', monospace;
}

.consumption-cell {
  font-family: 'DIN Alternate', monospace;
  font-weight: 600;
}

.consumption-cell.high {
  color: var(--status-warning) !important;
  background: rgba(255, 214, 0, 0.1) !important;
}

.consumption-cell.medium {
  color: var(--tech-primary) !important;
}

.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 2px;
  font-size: 11px;
}

.status-tag.normal {
  background: rgba(0, 230, 118, 0.15);
  color: var(--status-success);
}

.status-tag.warning {
  background: rgba(255, 214, 0, 0.15);
  color: var(--status-warning);
}

.status-tag.danger {
  background: rgba(255, 46, 99, 0.15);
  color: var(--status-danger);
}

.total-row td {
  background: rgba(0, 240, 255, 0.1) !important;
  font-weight: 600;
}

.total-label {
  text-align: right !important;
  color: var(--tech-primary) !important;
}

.total-value {
  color: var(--tech-primary) !important;
  font-family: 'DIN Alternate', monospace;
  font-size: 15px;
}

/* 分析区域 */
.analysis-section {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

.analysis-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.analysis-card .card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  font-size: 13px;
  font-weight: 600;
  color: var(--tech-primary);
}

.analysis-card .card-body {
  padding: 16px;
}

/* 饼图占位 */
.pie-chart-placeholder {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pie-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pie-bar {
  height: 8px;
  background: var(--color, var(--tech-primary));
  border-radius: 2px;
  min-width: 4px;
}

.pie-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  min-width: 180px;
}

.pie-label {
  color: var(--text-sub);
  width: 50px;
}

.pie-value {
  color: var(--text-bright);
  font-family: 'DIN Alternate', monospace;
  flex: 1;
}

.pie-percent {
  color: var(--tech-primary);
  font-weight: 600;
}

/* 趋势图 */
.trend-chart {
  height: 180px;
  display: flex;
  align-items: flex-end;
}

.chart-bars {
  flex: 1;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 100%;
  padding-bottom: 24px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.bar-value {
  font-size: 11px;
  color: var(--text-sub);
  font-family: 'DIN Alternate', monospace;
}

.bar {
  width: 32px;
  background: linear-gradient(180deg, var(--tech-primary), rgba(0, 240, 255, 0.3));
  border-radius: 2px 2px 0 0;
  min-height: 4px;
}

.bar-label {
  font-size: 11px;
  color: var(--text-muted);
  position: absolute;
  bottom: 0;
}

/* 异常提醒 */
.alert-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-left: 3px solid;
}

.alert-item.warning {
  border-color: var(--status-warning);
}

.alert-item.warning .el-icon {
  color: var(--status-warning);
}

.alert-item.danger {
  border-color: var(--status-danger);
}

.alert-item.danger .el-icon {
  color: var(--status-danger);
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-bright);
  margin-bottom: 4px;
}

.alert-desc {
  font-size: 11px;
  color: var(--text-sub);
}

.no-alert {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  color: var(--status-success);
  font-size: 13px;
}

/* 通用按钮 */
.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border: 1px solid;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(0, 0, 0, 0.3);
  clip-path: polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px);
}

.btn-primary { border-color: var(--tech-primary); color: var(--tech-primary); }
.btn-primary:hover { box-shadow: 0 0 10px rgba(0, 240, 255, 0.3); }

.btn-secondary { border-color: var(--text-sub); color: var(--text-sub); }
.btn-secondary:hover { border-color: var(--tech-primary); color: var(--tech-primary); }

/* 滚动条 */
.content-wrapper::-webkit-scrollbar,
.table-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.content-wrapper::-webkit-scrollbar-track,
.table-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

.content-wrapper::-webkit-scrollbar-thumb,
.table-container::-webkit-scrollbar-thumb {
  background: rgba(0, 240, 255, 0.2);
}

.content-wrapper::-webkit-scrollbar-thumb:hover,
.table-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 240, 255, 0.3);
}

/* 视图切换按钮 */
.view-switch {
  display: flex;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  padding: 2px;
}

.switch-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent;
  border: none;
  color: var(--text-sub);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.switch-btn:hover {
  color: var(--tech-primary);
}

.switch-btn.active {
  background: rgba(0, 240, 255, 0.15);
  color: var(--tech-primary);
}

.switch-btn .el-icon {
  font-size: 16px;
}

/* ==================== 列表视图样式 ==================== */
.list-view-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.list-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(0, 240, 255, 0.05);
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.toolbar-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.record-count {
  font-size: 13px;
  color: var(--text-sub);
}

.list-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
  flex: 1;
  overflow-y: auto;
}

.list-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  transition: all 0.3s;
}

.list-card:hover {
  border-color: var(--tech-primary);
  box-shadow: 0 4px 20px rgba(0, 240, 255, 0.1);
}

.list-card.high {
  border-left: 3px solid var(--status-warning);
}

.list-card.abnormal {
  border-left: 3px solid var(--status-danger);
}

.list-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  background: rgba(0, 240, 255, 0.03);
}

.card-cabinet {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cabinet-code {
  font-size: 16px;
  font-weight: 700;
  color: var(--tech-primary);
}

.drawer-code {
  font-size: 12px;
  color: var(--text-sub);
  font-family: 'Consolas', monospace;
}

.card-status {
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 2px;
}

.card-status.normal {
  background: rgba(0, 230, 118, 0.15);
  color: var(--status-success);
}

.card-status.high {
  background: rgba(255, 214, 0, 0.15);
  color: var(--status-warning);
}

.card-status.abnormal {
  background: rgba(255, 46, 99, 0.15);
  color: var(--status-danger);
}

.list-card .card-body {
  padding: 16px;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.2);
  margin-bottom: 14px;
  font-size: 13px;
  color: var(--text-sub);
}

.location-info .el-icon {
  color: var(--tech-primary);
}

.reading-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 16px;
}

.reading-item {
  flex: 1;
  text-align: center;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
}

.reading-item.current {
  background: rgba(0, 240, 255, 0.08);
}

.reading-label {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.reading-date {
  font-size: 12px;
  color: var(--text-sub);
  margin-bottom: 6px;
}

.reading-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-bright);
  font-family: 'DIN Alternate', monospace;
}

.reading-arrow {
  color: var(--tech-primary);
  font-size: 20px;
}

.consumption-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(0, 240, 255, 0.05);
  border: 1px solid rgba(0, 240, 255, 0.15);
}

.consumption-label {
  font-size: 13px;
  color: var(--text-sub);
}

.consumption-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-bright);
  font-family: 'DIN Alternate', monospace;
}

.consumption-value.high {
  color: var(--status-warning);
}

.consumption-value.medium {
  color: var(--tech-primary);
}

.consumption-unit {
  font-size: 12px;
  color: var(--text-sub);
  margin-left: 4px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px;
  color: var(--text-muted);
}

.empty-state .el-icon {
  font-size: 48px;
}

/* 导出对话框 */
.export-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-bright);
}
</style>

<style>
/* Element Plus 组件样式覆盖 */
.energy-report-page .el-select__wrapper {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 240, 255, 0.2);
  box-shadow: none;
}

.energy-report-page .el-date-editor {
  --el-input-bg-color: rgba(0, 0, 0, 0.3);
  --el-input-border-color: rgba(0, 240, 255, 0.2);
}

.energy-report-page .el-input__wrapper {
  background: rgba(0, 0, 0, 0.3);
  box-shadow: 0 0 0 1px rgba(0, 240, 255, 0.2) inset;
}

.energy-report-page .el-dialog {
  background: rgba(13, 18, 26, 0.95);
  border: 1px solid rgba(0, 240, 255, 0.3);
}

.energy-report-page .el-dialog__header {
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
}

.energy-report-page .el-dialog__title {
  color: var(--tech-primary);
}

.energy-report-page .el-radio__label,
.energy-report-page .el-checkbox__label {
  color: var(--text-sub);
}

.energy-report-page .el-radio__input.is-checked .el-radio__inner {
  border-color: var(--tech-primary);
  background: var(--tech-primary);
}

.energy-report-page .el-checkbox__input.is-checked .el-checkbox__inner {
  border-color: var(--tech-primary);
  background: var(--tech-primary);
}

.energy-report-page .el-dialog__footer {
  border-top: 1px solid rgba(0, 240, 255, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
