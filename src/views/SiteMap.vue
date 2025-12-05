<template>
  <div class="site-map-page">
    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <!-- 搜索和筛选 -->
        <div class="search-section">
          <div class="search-box">
            <el-icon><Search /></el-icon>
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索配电室名称或地址..."
              @input="handleSearch"
            />
          </div>
          <div class="filter-row">
            <el-select v-model="filterStatus" placeholder="状态筛选" size="small" clearable style="width: 100px">
              <el-option label="全部" value="" />
              <el-option label="正常" value="normal" />
              <el-option label="告警" value="warning" />
              <el-option label="故障" value="critical" />
              <el-option label="离线" value="offline" />
            </el-select>
            <el-select v-model="filterDistrict" placeholder="区域" size="small" clearable style="width: 100px">
              <el-option label="全部" value="" />
              <el-option label="海淀区" value="haidian" />
              <el-option label="朝阳区" value="chaoyang" />
              <el-option label="通州区" value="tongzhou" />
              <el-option label="大兴区" value="daxing" />
            </el-select>
          </div>
        </div>

        <!-- 统计概览 -->
        <div class="stats-overview">
          <div class="stats-header">
            <span class="stats-title">站点统计</span>
            <span class="stats-total">共 {{ siteStats.total }} 个站点</span>
          </div>
          <div class="stats-grid">
            <div class="stats-item normal" @click="filterByStatus('normal')">
              <div class="stats-icon">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="stats-info">
                <span class="stats-count">{{ siteStats.normal }}</span>
                <span class="stats-label">正常</span>
              </div>
            </div>
            <div class="stats-item warning" @click="filterByStatus('warning')">
              <div class="stats-icon">
                <el-icon><WarningFilled /></el-icon>
              </div>
              <div class="stats-info">
                <span class="stats-count">{{ siteStats.warning }}</span>
                <span class="stats-label">告警</span>
              </div>
            </div>
            <div class="stats-item critical" @click="filterByStatus('critical')">
              <div class="stats-icon">
                <el-icon><CircleCloseFilled /></el-icon>
              </div>
              <div class="stats-info">
                <span class="stats-count">{{ siteStats.critical }}</span>
                <span class="stats-label">故障</span>
              </div>
            </div>
            <div class="stats-item offline" @click="filterByStatus('offline')">
              <div class="stats-icon">
                <el-icon><Remove /></el-icon>
              </div>
              <div class="stats-info">
                <span class="stats-count">{{ siteStats.offline }}</span>
                <span class="stats-label">离线</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 站点列表 -->
        <div class="site-list-section">
          <div class="list-header">
            <span class="list-title">站点列表</span>
            <el-radio-group v-model="listViewMode" size="small">
              <el-radio-button label="list">列表</el-radio-button>
              <el-radio-button label="card">卡片</el-radio-button>
            </el-radio-group>
          </div>
          <div class="site-list" :class="listViewMode">
            <div
              v-for="site in filteredSites"
              :key="site.id"
              :class="['site-item', site.status, { active: selectedSite?.id === site.id }]"
              @click="selectSite(site)"
            >
              <div class="site-status-indicator" :class="site.status"></div>
              <div class="site-info">
                <div class="site-name">{{ site.name }}</div>
                <div class="site-address">{{ site.address }}</div>
                <div class="site-meta">
                  <span class="meta-item">
                    <el-icon><Cpu /></el-icon>
                    {{ site.deviceCount }}台设备
                  </span>
                  <span class="meta-item">
                    <el-icon><Lightning /></el-icon>
                    {{ site.load }}kW
                  </span>
                </div>
              </div>
              <div class="site-alerts" v-if="site.alertCount > 0">
                <span class="alert-badge">{{ site.alertCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 地图区域 -->
      <div class="map-section">
        <!-- 地图工具栏 -->
        <div class="map-toolbar">
          <div class="toolbar-left">
            <span class="map-title">
              <el-icon><MapLocation /></el-icon>
              北京市配电室分布图
            </span>
            <span class="standard-ref">依据 DB11/T 527-2021</span>
          </div>
          <div class="toolbar-right">
            <button class="tool-btn" @click="zoomIn" title="放大">
              <el-icon><ZoomIn /></el-icon>
            </button>
            <button class="tool-btn" @click="zoomOut" title="缩小">
              <el-icon><ZoomOut /></el-icon>
            </button>
            <button class="tool-btn" @click="resetView" title="重置视图">
              <el-icon><Aim /></el-icon>
            </button>
            <button class="tool-btn" :class="{ active: showHeatmap }" @click="toggleHeatmap" title="热力图">
              <el-icon><DataAnalysis /></el-icon>
            </button>
            <button class="tool-btn" @click="fullscreenMap" title="全屏">
              <el-icon><FullScreen /></el-icon>
            </button>
          </div>
        </div>

        <!-- 模拟地图 -->
        <div class="map-container" ref="mapContainer">
          <!-- 地图背景网格 -->
          <div class="map-grid"></div>

          <!-- 区域标签 -->
          <div class="district-labels">
            <div class="district-label" style="left: 25%; top: 30%">海淀区</div>
            <div class="district-label" style="left: 55%; top: 25%">朝阳区</div>
            <div class="district-label" style="left: 75%; top: 55%">通州区</div>
            <div class="district-label" style="left: 45%; top: 70%">大兴区</div>
          </div>

          <!-- 站点标记 -->
          <div
            v-for="site in filteredSites"
            :key="site.id"
            :class="['site-marker', site.status, { selected: selectedSite?.id === site.id }]"
            :style="{ left: site.position.x + '%', top: site.position.y + '%' }"
            @click="selectSite(site)"
          >
            <div class="marker-icon">
              <el-icon><OfficeBuilding /></el-icon>
            </div>
            <div class="marker-pulse" v-if="site.status === 'warning' || site.status === 'critical'"></div>
            <div class="marker-label">{{ site.name }}</div>
          </div>

          <!-- 选中站点信息卡片 -->
          <div
            v-if="selectedSite"
            class="site-info-card"
            :style="{ left: Math.min(selectedSite.position.x + 3, 70) + '%', top: selectedSite.position.y + '%' }"
          >
            <div class="card-header">
              <span class="card-title">{{ selectedSite.name }}</span>
              <span :class="['card-status', selectedSite.status]">{{ getStatusText(selectedSite.status) }}</span>
              <button class="card-close" @click.stop="selectedSite = null">×</button>
            </div>
            <div class="card-body">
              <div class="card-row">
                <span class="row-label">地址</span>
                <span class="row-value">{{ selectedSite.address }}</span>
              </div>
              <div class="card-row">
                <span class="row-label">运维等级</span>
                <span class="row-value level">{{ selectedSite.level }}</span>
              </div>
              <div class="card-row">
                <span class="row-label">设备数量</span>
                <span class="row-value">{{ selectedSite.deviceCount }} 台</span>
              </div>
              <div class="card-row">
                <span class="row-label">当前负荷</span>
                <span class="row-value">{{ selectedSite.load }} kW / {{ selectedSite.capacity }} kVA</span>
              </div>
              <div class="card-row">
                <span class="row-label">负载率</span>
                <span class="row-value" :class="getLoadRateClass(selectedSite.loadRate)">
                  {{ selectedSite.loadRate }}%
                </span>
              </div>
              <div class="card-row" v-if="selectedSite.alertCount > 0">
                <span class="row-label">告警数</span>
                <span class="row-value alert">{{ selectedSite.alertCount }} 条</span>
              </div>
              <div class="card-metrics">
                <div class="metric-item">
                  <span class="metric-label">温度</span>
                  <span class="metric-value">{{ selectedSite.temperature }}°C</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">湿度</span>
                  <span class="metric-value">{{ selectedSite.humidity }}%</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">功率因数</span>
                  <span class="metric-value">{{ selectedSite.powerFactor }}</span>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <button class="action-btn btn-primary" @click="enterSite(selectedSite)">
                <el-icon><Monitor /></el-icon>
                进入监控
              </button>
              <button class="action-btn btn-secondary" @click="viewAlarms(selectedSite)">
                <el-icon><Bell /></el-icon>
                查看告警
              </button>
            </div>
          </div>

          <!-- 地图图例 -->
          <div class="map-legend">
            <div class="legend-title">图例</div>
            <div class="legend-items">
              <div class="legend-item">
                <span class="legend-marker normal"></span>
                <span class="legend-text">正常运行</span>
              </div>
              <div class="legend-item">
                <span class="legend-marker warning"></span>
                <span class="legend-text">告警状态</span>
              </div>
              <div class="legend-item">
                <span class="legend-marker critical"></span>
                <span class="legend-text">故障状态</span>
              </div>
              <div class="legend-item">
                <span class="legend-marker offline"></span>
                <span class="legend-text">通讯中断</span>
              </div>
            </div>
          </div>

          <!-- 缩放控制 -->
          <div class="zoom-control">
            <button class="zoom-btn" @click="zoomIn">+</button>
            <span class="zoom-level">{{ zoomLevel }}%</span>
            <button class="zoom-btn" @click="zoomOut">-</button>
          </div>
        </div>
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <!-- 实时告警 -->
        <div class="alert-section">
          <div class="section-header">
            <span class="section-title">
              <el-icon><Bell /></el-icon>
              实时告警
            </span>
            <span class="alert-count">{{ realtimeAlerts.length }}</span>
          </div>
          <div class="alert-list">
            <div
              v-for="alert in realtimeAlerts"
              :key="alert.id"
              :class="['alert-item', alert.level]"
              @click="locateSite(alert.siteId)"
            >
              <div class="alert-icon">
                <el-icon><WarningFilled /></el-icon>
              </div>
              <div class="alert-content">
                <div class="alert-title">{{ alert.title }}</div>
                <div class="alert-site">{{ alert.siteName }}</div>
                <div class="alert-time">{{ alert.time }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 运行指标 -->
        <div class="metrics-section">
          <div class="section-header">
            <span class="section-title">
              <el-icon><DataLine /></el-icon>
              运行指标
            </span>
          </div>
          <div class="metrics-list">
            <div class="metric-card">
              <div class="metric-header">
                <span class="metric-name">总负荷</span>
                <span class="metric-trend up">+2.3%</span>
              </div>
              <div class="metric-value-large">{{ overallMetrics.totalLoad }}<span class="unit">MW</span></div>
              <div class="metric-bar">
                <div class="metric-bar-fill" :style="{ width: overallMetrics.loadRate + '%' }"></div>
              </div>
              <div class="metric-sub">总容量 {{ overallMetrics.totalCapacity }} MVA</div>
            </div>
            <div class="metric-card">
              <div class="metric-header">
                <span class="metric-name">平均负载率</span>
              </div>
              <div class="metric-value-large" :class="getLoadRateClass(overallMetrics.avgLoadRate)">
                {{ overallMetrics.avgLoadRate }}<span class="unit">%</span>
              </div>
              <div class="metric-sub">依据 DB11/T 527-2021 建议 ≤80%</div>
            </div>
            <div class="metric-card">
              <div class="metric-header">
                <span class="metric-name">平均功率因数</span>
              </div>
              <div class="metric-value-large" :class="overallMetrics.avgPowerFactor >= 0.9 ? 'good' : 'warning'">
                {{ overallMetrics.avgPowerFactor }}
              </div>
              <div class="metric-sub">要求 ≥0.90</div>
            </div>
            <div class="metric-card">
              <div class="metric-header">
                <span class="metric-name">设备在线率</span>
              </div>
              <div class="metric-value-large good">{{ overallMetrics.onlineRate }}<span class="unit">%</span></div>
              <div class="metric-sub">{{ overallMetrics.onlineDevices }}/{{ overallMetrics.totalDevices }} 台在线</div>
            </div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="quick-actions">
          <div class="section-header">
            <span class="section-title">
              <el-icon><Operation /></el-icon>
              快捷操作
            </span>
          </div>
          <div class="action-grid">
            <button class="quick-btn" @click="batchInspection">
              <el-icon><Position /></el-icon>
              <span>批量巡检</span>
            </button>
            <button class="quick-btn" @click="exportReport">
              <el-icon><Download /></el-icon>
              <span>导出报表</span>
            </button>
            <button class="quick-btn" @click="viewStatistics">
              <el-icon><TrendCharts /></el-icon>
              <span>统计分析</span>
            </button>
            <button class="quick-btn" @click="systemSettings">
              <el-icon><Setting /></el-icon>
              <span>系统设置</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Search, CircleCheck, WarningFilled, CircleCloseFilled, Remove,
  Cpu, Lightning, MapLocation, ZoomIn, ZoomOut, Aim, DataAnalysis,
  FullScreen, OfficeBuilding, Monitor, Bell, DataLine, Operation,
  Position, Download, TrendCharts, Setting
} from '@element-plus/icons-vue'

const router = useRouter()

// ========== 基础状态 ==========
const searchKeyword = ref('')
const filterStatus = ref('')
const filterDistrict = ref('')
const listViewMode = ref('list')
const selectedSite = ref<any>(null)
const showHeatmap = ref(false)
const zoomLevel = ref(100)

// ========== 站点统计 ==========
const siteStats = ref({
  total: 12,
  normal: 8,
  warning: 2,
  critical: 1,
  offline: 1
})

// ========== 站点数据 ==========
const sites = ref([
  {
    id: 1, name: '圆心科技配电室', address: '海淀区中关村软件园二期',
    status: 'normal', level: 'A级', district: 'haidian',
    deviceCount: 156, load: 756, capacity: 1000, loadRate: 75.6,
    temperature: 24, humidity: 45, powerFactor: 0.932,
    alertCount: 0, position: { x: 22, y: 28 }
  },
  {
    id: 2, name: '通州数据中心', address: '通州区新华西街',
    status: 'warning', level: 'A级', district: 'tongzhou',
    deviceCount: 245, load: 1850, capacity: 2500, loadRate: 74,
    temperature: 26, humidity: 52, powerFactor: 0.918,
    alertCount: 3, position: { x: 78, y: 45 }
  },
  {
    id: 3, name: '北理工配电室', address: '海淀区中关村南大街',
    status: 'normal', level: 'B级', district: 'haidian',
    deviceCount: 89, load: 425, capacity: 630, loadRate: 67.5,
    temperature: 23, humidity: 48, powerFactor: 0.945,
    alertCount: 0, position: { x: 28, y: 42 }
  },
  {
    id: 4, name: '朝阳CBD配电站', address: '朝阳区建国路88号',
    status: 'critical', level: 'A级', district: 'chaoyang',
    deviceCount: 312, load: 2100, capacity: 3150, loadRate: 66.7,
    temperature: 32, humidity: 58, powerFactor: 0.912,
    alertCount: 5, position: { x: 62, y: 32 }
  },
  {
    id: 5, name: '大兴产业园配电室', address: '大兴区亦庄经济开发区',
    status: 'normal', level: 'B级', district: 'daxing',
    deviceCount: 78, load: 380, capacity: 500, loadRate: 76,
    temperature: 25, humidity: 44, powerFactor: 0.938,
    alertCount: 0, position: { x: 48, y: 75 }
  },
  {
    id: 6, name: '望京科技园配电室', address: '朝阳区望京街道',
    status: 'normal', level: 'B级', district: 'chaoyang',
    deviceCount: 124, load: 620, capacity: 800, loadRate: 77.5,
    temperature: 24, humidity: 46, powerFactor: 0.925,
    alertCount: 0, position: { x: 58, y: 22 }
  },
  {
    id: 7, name: '西二旗配电站', address: '海淀区西二旗大街',
    status: 'warning', level: 'A级', district: 'haidian',
    deviceCount: 198, load: 1420, capacity: 2000, loadRate: 71,
    temperature: 27, humidity: 55, powerFactor: 0.908,
    alertCount: 2, position: { x: 18, y: 18 }
  },
  {
    id: 8, name: '通州副中心配电室', address: '通州区运河商务区',
    status: 'normal', level: 'A级', district: 'tongzhou',
    deviceCount: 268, load: 1680, capacity: 2500, loadRate: 67.2,
    temperature: 23, humidity: 47, powerFactor: 0.942,
    alertCount: 0, position: { x: 82, y: 58 }
  },
  {
    id: 9, name: '中关村创新园', address: '海淀区四季青镇',
    status: 'normal', level: 'B级', district: 'haidian',
    deviceCount: 92, load: 445, capacity: 630, loadRate: 70.6,
    temperature: 24, humidity: 49, powerFactor: 0.935,
    alertCount: 0, position: { x: 15, y: 38 }
  },
  {
    id: 10, name: '亦庄开发区配电站', address: '大兴区亦庄荣华路',
    status: 'normal', level: 'A级', district: 'daxing',
    deviceCount: 186, load: 1250, capacity: 1600, loadRate: 78.1,
    temperature: 25, humidity: 46, powerFactor: 0.928,
    alertCount: 0, position: { x: 55, y: 82 }
  },
  {
    id: 11, name: '国贸商圈配电室', address: '朝阳区国贸三期',
    status: 'offline', level: 'A级', district: 'chaoyang',
    deviceCount: 156, load: 0, capacity: 1250, loadRate: 0,
    temperature: 0, humidity: 0, powerFactor: 0,
    alertCount: 1, position: { x: 65, y: 38 }
  },
  {
    id: 12, name: '上地信息产业园', address: '海淀区上地十街',
    status: 'normal', level: 'B级', district: 'haidian',
    deviceCount: 145, load: 720, capacity: 1000, loadRate: 72,
    temperature: 24, humidity: 47, powerFactor: 0.931,
    alertCount: 0, position: { x: 20, y: 12 }
  }
])

// ========== 筛选后的站点 ==========
const filteredSites = computed(() => {
  return sites.value.filter(site => {
    const matchKeyword = !searchKeyword.value ||
      site.name.includes(searchKeyword.value) ||
      site.address.includes(searchKeyword.value)
    const matchStatus = !filterStatus.value || site.status === filterStatus.value
    const matchDistrict = !filterDistrict.value || site.district === filterDistrict.value
    return matchKeyword && matchStatus && matchDistrict
  })
})

// ========== 实时告警 ==========
const realtimeAlerts = ref([
  { id: 1, title: '变压器温度过高', siteName: '朝阳CBD配电站', siteId: 4, level: 'critical', time: '2分钟前' },
  { id: 2, title: '通讯中断', siteName: '国贸商圈配电室', siteId: 11, level: 'critical', time: '5分钟前' },
  { id: 3, title: '负载率超过80%', siteName: '通州数据中心', siteId: 2, level: 'warning', time: '12分钟前' },
  { id: 4, title: '功率因数偏低', siteName: '西二旗配电站', siteId: 7, level: 'warning', time: '18分钟前' },
  { id: 5, title: '环境湿度超标', siteName: '朝阳CBD配电站', siteId: 4, level: 'warning', time: '25分钟前' }
])

// ========== 运行指标 ==========
const overallMetrics = ref({
  totalLoad: 11.65,
  totalCapacity: 16.56,
  loadRate: 70.3,
  avgLoadRate: 68.5,
  avgPowerFactor: 0.926,
  onlineRate: 91.7,
  onlineDevices: 1892,
  totalDevices: 2063
})

// ========== 辅助函数 ==========
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    normal: '正常运行',
    warning: '告警状态',
    critical: '故障状态',
    offline: '通讯中断'
  }
  return map[status] || status
}

const getLoadRateClass = (rate: number) => {
  if (rate > 90) return 'danger'
  if (rate > 80) return 'warning'
  return 'good'
}

const handleSearch = () => {
  // 搜索处理
}

const filterByStatus = (status: string) => {
  filterStatus.value = filterStatus.value === status ? '' : status
}

const selectSite = (site: any) => {
  selectedSite.value = site
}

const locateSite = (siteId: number) => {
  const site = sites.value.find(s => s.id === siteId)
  if (site) {
    selectSite(site)
  }
}

const enterSite = (site: any) => {
  router.push(`/room/detail/${site.id}`)
}

const viewAlarms = (_site: any) => {
  router.push('/om/alarms')
}

const zoomIn = () => {
  if (zoomLevel.value < 200) zoomLevel.value += 20
}

const zoomOut = () => {
  if (zoomLevel.value > 50) zoomLevel.value -= 20
}

const resetView = () => {
  zoomLevel.value = 100
  selectedSite.value = null
}

const toggleHeatmap = () => {
  showHeatmap.value = !showHeatmap.value
  ElMessage.info(showHeatmap.value ? '热力图已开启' : '热力图已关闭')
}

const fullscreenMap = () => {
  ElMessage.info('全屏模式')
}

const batchInspection = () => {
  router.push('/om/inspection')
}

const exportReport = () => {
  ElMessage.success('报表导出成功')
}

const viewStatistics = () => {
  router.push('/analytics/operation')
}

const systemSettings = () => {
  router.push('/system/strategies')
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(2); opacity: 0; }
}

@keyframes scanline {
  0% { background-position: 0% 0%; }
  100% { background-position: 0% 200%; }
}

.site-map-page {
  width: 100%;
  height: 100vh;
  background: var(--bg-deep);
  padding: 20px;
  overflow: hidden;
}

.main-container {
  height: 100%;
  display: grid;
  grid-template-columns: 320px 1fr 300px;
  gap: 20px;
}

/* ========== 左侧面板 ========== */
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(13, 18, 26, 0.85);
  border: 1px solid rgba(0, 240, 255, 0.2);
  padding: 16px;
  overflow: hidden;
}

.search-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.search-box .el-icon {
  color: var(--tech-primary);
  font-size: 18px;
}

.search-box input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-bright);
  font-size: 13px;
}

.search-box input::placeholder {
  color: var(--text-muted);
}

.filter-row {
  display: flex;
  gap: 10px;
}

/* 统计概览 */
.stats-overview {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.15);
  padding: 14px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stats-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--tech-primary);
}

.stats-total {
  font-size: 11px;
  color: var(--text-muted);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.stats-item:hover {
  border-color: var(--tech-primary);
}

.stats-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  border-radius: 4px;
}

.stats-item.normal .stats-icon { color: var(--status-success); background: rgba(0, 230, 118, 0.1); }
.stats-item.warning .stats-icon { color: var(--status-warning); background: rgba(255, 214, 0, 0.1); }
.stats-item.critical .stats-icon { color: var(--status-danger); background: rgba(255, 46, 99, 0.1); }
.stats-item.offline .stats-icon { color: var(--text-muted); background: rgba(255, 255, 255, 0.05); }

.stats-count {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-bright);
  font-family: 'DIN Alternate', sans-serif;
}

.stats-label {
  font-size: 11px;
  color: var(--text-sub);
}

/* 站点列表 */
.site-list-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.list-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--tech-primary);
}

.site-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.site-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.site-item:hover, .site-item.active {
  border-color: var(--tech-primary);
  background: rgba(0, 240, 255, 0.05);
}

.site-status-indicator {
  width: 4px;
  height: 40px;
  border-radius: 2px;
}

.site-status-indicator.normal { background: var(--status-success); }
.site-status-indicator.warning { background: var(--status-warning); }
.site-status-indicator.critical { background: var(--status-danger); }
.site-status-indicator.offline { background: var(--text-muted); }

.site-info {
  flex: 1;
  min-width: 0;
}

.site-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-bright);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.site-address {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 4px 0;
}

.site-meta {
  display: flex;
  gap: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-sub);
}

.meta-item .el-icon {
  font-size: 12px;
  color: var(--tech-primary);
}

.site-alerts {
  position: relative;
}

.alert-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: var(--status-danger);
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 50%;
}

/* ========== 地图区域 ========== */
.map-section {
  display: flex;
  flex-direction: column;
  background: rgba(13, 18, 26, 0.85);
  border: 1px solid rgba(0, 240, 255, 0.2);
  overflow: hidden;
}

.map-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  background: rgba(0, 240, 255, 0.03);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.map-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--tech-primary);
}

.standard-ref {
  font-size: 11px;
  color: var(--text-muted);
  padding: 2px 8px;
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.tool-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  color: var(--text-sub);
  cursor: pointer;
  transition: all 0.2s;
}

.tool-btn:hover, .tool-btn.active {
  border-color: var(--tech-primary);
  color: var(--tech-primary);
}

/* 地图容器 */
.map-container {
  flex: 1;
  position: relative;
  background: rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.map-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

.district-labels .district-label {
  position: absolute;
  font-size: 14px;
  color: rgba(0, 240, 255, 0.3);
  font-weight: 600;
  pointer-events: none;
}

/* 站点标记 */
.site-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 10;
}

.marker-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  border: 2px solid;
  border-radius: 8px;
  transition: all 0.3s;
}

.site-marker.normal .marker-icon {
  background: rgba(0, 230, 118, 0.2);
  border-color: var(--status-success);
  color: var(--status-success);
}

.site-marker.warning .marker-icon {
  background: rgba(255, 214, 0, 0.2);
  border-color: var(--status-warning);
  color: var(--status-warning);
}

.site-marker.critical .marker-icon {
  background: rgba(255, 46, 99, 0.2);
  border-color: var(--status-danger);
  color: var(--status-danger);
}

.site-marker.offline .marker-icon {
  background: rgba(100, 100, 100, 0.2);
  border-color: var(--text-muted);
  color: var(--text-muted);
}

.site-marker.selected .marker-icon {
  transform: scale(1.2);
  box-shadow: 0 0 20px currentColor;
}

.marker-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  transform: translate(-50%, -50%);
  animation: pulse 2s infinite;
}

.site-marker.warning .marker-pulse { background: var(--status-warning); }
.site-marker.critical .marker-pulse { background: var(--status-danger); }

.marker-label {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-bright);
  white-space: nowrap;
  background: rgba(0, 0, 0, 0.7);
  padding: 2px 6px;
  border-radius: 2px;
}

/* 站点信息卡片 */
.site-info-card {
  position: absolute;
  width: 280px;
  background: rgba(13, 18, 26, 0.95);
  border: 1px solid rgba(0, 240, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  z-index: 100;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  background: rgba(0, 240, 255, 0.05);
}

.card-title {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-bright);
}

.card-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 2px;
}

.card-status.normal { background: rgba(0, 230, 118, 0.2); color: var(--status-success); }
.card-status.warning { background: rgba(255, 214, 0, 0.2); color: var(--status-warning); }
.card-status.critical { background: rgba(255, 46, 99, 0.2); color: var(--status-danger); }
.card-status.offline { background: rgba(100, 100, 100, 0.2); color: var(--text-muted); }

.card-close {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 16px;
}

.card-close:hover {
  color: var(--tech-primary);
}

.card-body {
  padding: 14px 16px;
}

.card-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
}

.row-label { color: var(--text-sub); }
.row-value { color: var(--text-bright); }
.row-value.level { color: var(--tech-primary); }
.row-value.alert { color: var(--status-danger); }
.row-value.good { color: var(--status-success); }
.row-value.warning { color: var(--status-warning); }
.row-value.danger { color: var(--status-danger); }

.card-metrics {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 240, 255, 0.1);
}

.card-metrics .metric-item {
  flex: 1;
  text-align: center;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
}

.card-metrics .metric-label {
  font-size: 10px;
  color: var(--text-muted);
  display: block;
  margin-bottom: 4px;
}

.card-metrics .metric-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--tech-primary);
  font-family: 'DIN Alternate', sans-serif;
}

.card-footer {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid rgba(0, 240, 255, 0.1);
}

.card-footer .action-btn {
  flex: 1;
  justify-content: center;
}

/* 地图图例 */
.map-legend {
  position: absolute;
  left: 16px;
  bottom: 16px;
  background: rgba(13, 18, 26, 0.9);
  border: 1px solid rgba(0, 240, 255, 0.2);
  padding: 12px 16px;
}

.legend-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--tech-primary);
  margin-bottom: 10px;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-marker {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-marker.normal { background: var(--status-success); }
.legend-marker.warning { background: var(--status-warning); }
.legend-marker.critical { background: var(--status-danger); }
.legend-marker.offline { background: var(--text-muted); }

.legend-text {
  font-size: 11px;
  color: var(--text-sub);
}

/* 缩放控制 */
.zoom-control {
  position: absolute;
  right: 16px;
  bottom: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: rgba(13, 18, 26, 0.9);
  border: 1px solid rgba(0, 240, 255, 0.2);
  padding: 8px;
}

.zoom-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  color: var(--tech-primary);
  font-size: 16px;
  cursor: pointer;
}

.zoom-btn:hover {
  background: rgba(0, 240, 255, 0.1);
}

.zoom-level {
  font-size: 11px;
  color: var(--text-sub);
  padding: 4px 0;
}

/* ========== 右侧面板 ========== */
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(13, 18, 26, 0.85);
  border: 1px solid rgba(0, 240, 255, 0.2);
  padding: 16px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--tech-primary);
}

.alert-count {
  background: var(--status-danger);
  color: white;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
}

/* 告警列表 */
.alert-section {
  flex-shrink: 0;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.alert-item:hover {
  border-color: var(--tech-primary);
}

.alert-item.critical { border-left: 3px solid var(--status-danger); }
.alert-item.warning { border-left: 3px solid var(--status-warning); }

.alert-icon {
  font-size: 16px;
}

.alert-item.critical .alert-icon { color: var(--status-danger); }
.alert-item.warning .alert-icon { color: var(--status-warning); }

.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-bright);
  margin-bottom: 2px;
}

.alert-site {
  font-size: 11px;
  color: var(--text-sub);
}

.alert-time {
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 4px;
}

/* 运行指标 */
.metrics-section {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.metrics-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
}

.metric-card {
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.1);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.metric-name {
  font-size: 12px;
  color: var(--text-sub);
}

.metric-trend {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 2px;
}

.metric-trend.up { color: var(--status-success); background: rgba(0, 230, 118, 0.1); }
.metric-trend.down { color: var(--status-danger); background: rgba(255, 46, 99, 0.1); }

.metric-value-large {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-bright);
  font-family: 'DIN Alternate', sans-serif;
}

.metric-value-large .unit {
  font-size: 12px;
  color: var(--text-sub);
  margin-left: 4px;
}

.metric-value-large.good { color: var(--status-success); }
.metric-value-large.warning { color: var(--status-warning); }
.metric-value-large.danger { color: var(--status-danger); }

.metric-bar {
  height: 4px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
  margin: 8px 0;
  overflow: hidden;
}

.metric-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--status-success), var(--tech-primary));
  border-radius: 2px;
}

.metric-sub {
  font-size: 10px;
  color: var(--text-muted);
}

/* 快捷操作 */
.quick-actions {
  flex-shrink: 0;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.quick-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.15);
  color: var(--text-sub);
  cursor: pointer;
  transition: all 0.3s;
}

.quick-btn:hover {
  border-color: var(--tech-primary);
  color: var(--tech-primary);
  background: rgba(0, 240, 255, 0.05);
}

.quick-btn .el-icon {
  font-size: 20px;
}

.quick-btn span {
  font-size: 11px;
}

/* 通用按钮 */
.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(0, 0, 0, 0.3);
}

.btn-primary { border-color: var(--tech-primary); color: var(--tech-primary); }
.btn-primary:hover { box-shadow: 0 0 10px rgba(0, 240, 255, 0.3); }

.btn-secondary { border-color: var(--text-sub); color: var(--text-sub); }
.btn-secondary:hover { border-color: var(--tech-primary); color: var(--tech-primary); }

/* 滚动条 */
.site-list::-webkit-scrollbar,
.alert-list::-webkit-scrollbar,
.metrics-list::-webkit-scrollbar {
  width: 6px;
}

.site-list::-webkit-scrollbar-track,
.alert-list::-webkit-scrollbar-track,
.metrics-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

.site-list::-webkit-scrollbar-thumb,
.alert-list::-webkit-scrollbar-thumb,
.metrics-list::-webkit-scrollbar-thumb {
  background: rgba(0, 240, 255, 0.2);
}

.site-list::-webkit-scrollbar-thumb:hover,
.alert-list::-webkit-scrollbar-thumb:hover,
.metrics-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 240, 255, 0.3);
}
</style>

<style>
/* Element Plus 组件样式覆盖 */
.site-map-page .el-select__wrapper {
  background: rgba(0, 0, 0, 0.3) !important;
  border-color: rgba(0, 240, 255, 0.2) !important;
  box-shadow: none !important;
}

.site-map-page .el-radio-button__inner {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 240, 255, 0.2);
  color: var(--text-sub);
  padding: 5px 10px;
}

.site-map-page .el-radio-button__original-radio:checked + .el-radio-button__inner {
  background: rgba(0, 240, 255, 0.15);
  border-color: var(--tech-primary);
  color: var(--tech-primary);
}
</style>
