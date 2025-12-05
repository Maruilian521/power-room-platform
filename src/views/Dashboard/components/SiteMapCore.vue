<template>
  <div class="site-map-core">
    <div class="module-card map-card">
      <div class="module-header">
        <div class="header-left">
          <el-icon><MapLocation /></el-icon>
          <span>GIS站点分布态势</span>
        </div>
        <div class="header-right">
          <el-autocomplete
            v-model="searchKeyword"
            :fetch-suggestions="querySearch"
            placeholder="搜索站点名称"
            @select="handleSearchSelect"
            :trigger-on-focus="false"
            clearable
            size="small"
            class="site-search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #default="{ item }">
              <div class="search-item">
                <span class="search-item-name">{{ item.name }}</span>
                <el-tag
                  size="small"
                  :type="getStatusTagType(item.status)"
                  effect="plain"
                >
                  {{ getStatusText(item.status) }}
                </el-tag>
              </div>
            </template>
          </el-autocomplete>
          <el-tag size="small" effect="dark" type="success">{{ onlineSites }}/{{ totalSites }} 在线</el-tag>
        </div>
      </div>

      <!-- 地图主体 - 使用Google地图背景 + ECharts散点图 -->
      <div class="map-wrapper">
        <div class="map-background"></div>
        <div ref="mapChartRef" class="map-chart-container"></div>
      </div>

      <!-- 重点关注站点列表（悬浮在地图角落） -->
      <div class="watch-list-overlay">
        <div class="watch-list-title">
          <el-icon><Warning /></el-icon>
          <span>重点关注站点</span>
        </div>
        <div class="watch-list-items">
          <div
            v-for="site in topWatchSites"
            :key="site.id"
            class="watch-item"
            :class="`status-${site.status}`"
            @click="handleSiteClick(site)"
          >
            <div class="watch-item-name">{{ site.name }}</div>
            <div class="watch-item-metrics">
              <span class="metric">负荷: {{ site.load }}MW</span>
              <span class="metric">温度: {{ site.temperature }}°C</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { MapLocation, Warning, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { getAllSites, type SiteStatus } from '../../../api/integrated-ops'

interface SearchSuggestion {
  value: string
  name: string
  status: string
  id: string
  lat: number
  lng: number
}

const sites = ref<SiteStatus[]>([])
const mapChartRef = ref<HTMLElement>()
let mapChart: ECharts | null = null
const searchKeyword = ref('')
const selectedSiteId = ref<string | null>(null)

// 计算在线站点数
const onlineSites = computed(() => {
  return sites.value.filter(s => s.status !== 'offline').length
})

const totalSites = computed(() => sites.value.length)

// 获取Top 3重点关注站点（负荷最高或温度最高）
const topWatchSites = computed(() => {
  const sortedByLoad = [...sites.value]
    .filter(s => s.status !== 'offline')
    .sort((a, b) => b.load - a.load)
    .slice(0, 2)

  const sortedByTemp = [...sites.value]
    .filter(s => s.status !== 'offline')
    .sort((a, b) => b.temperature - a.temperature)
    .slice(0, 1)

  return [...sortedByLoad, ...sortedByTemp]
})

const initMapChart = () => {
  if (!mapChartRef.value) return
  mapChart = echarts.init(mapChartRef.value)

  // 根据状态分组站点
  const normalSites = sites.value.filter(s => s.status === 'normal')
  const warningSites = sites.value.filter(s => s.status === 'warning')
  const criticalSites = sites.value.filter(s => s.status === 'critical')
  const offlineSites = sites.value.filter(s => s.status === 'offline')

  // 获取选中的站点用于高亮
  const selectedSite = selectedSiteId.value ? sites.value.find(s => s.id === selectedSiteId.value) : null

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(11, 19, 37, 0.95)',
      borderColor: '#00F3FF',
      borderWidth: 1,
      textStyle: { color: '#fff', fontSize: 12 },
      formatter: (params: any) => {
        const site = params.data
        return `
          <div style="padding: 5px;">
            <div style="font-weight: bold; margin-bottom: 5px; color: #00F3FF;">${site.name}</div>
            <div style="font-size: 11px; line-height: 1.6;">
              健康分: <span style="color: ${site.healthScore > 80 ? '#00E676' : site.healthScore > 60 ? '#FFD600' : '#FF2E63'}">${site.healthScore}</span><br/>
              负荷: ${site.load} MW<br/>
              温度: ${site.temperature}°C | 湿度: ${site.humidity}%
            </div>
          </div>
        `
      }
    },
    // 使用grid布局，直接在背景图上绘制
    grid: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      containLabel: false
    },
    xAxis: {
      type: 'value',
      min: 116.2,
      max: 116.6,
      show: false
    },
    yAxis: {
      type: 'value',
      min: 39.7,
      max: 40.1,
      show: false
    },
    series: [
      // 离线站点
      {
        name: '离线',
        type: 'scatter',
        symbolSize: (data: any) => {
          return selectedSite && data.id === selectedSite.id ? 16 : 8
        },
        itemStyle: {
          color: (params: any) => {
            return selectedSite && params.data.id === selectedSite.id ? '#00F3FF' : '#64748B'
          },
          opacity: (params: any) => {
            return selectedSite && params.data.id === selectedSite.id ? 1 : 0.6
          },
          shadowBlur: (params: any) => {
            return selectedSite && params.data.id === selectedSite.id ? 20 : 0
          },
          shadowColor: 'rgba(0, 243, 255, 0.8)'
        },
        data: offlineSites.map(s => ({
          value: [s.lng, s.lat],
          ...s
        }))
      },
      // 正常站点
      {
        name: '正常',
        type: 'scatter',
        symbolSize: (data: any) => {
          return selectedSite && data.id === selectedSite.id ? 18 : 10
        },
        itemStyle: {
          color: (params: any) => {
            return selectedSite && params.data.id === selectedSite.id ? '#00F3FF' : '#00E676'
          },
          shadowBlur: (params: any) => {
            return selectedSite && params.data.id === selectedSite.id ? 25 : 10
          },
          shadowColor: (params: any) => {
            return selectedSite && params.data.id === selectedSite.id
              ? 'rgba(0, 243, 255, 0.9)'
              : 'rgba(0, 230, 118, 0.5)'
          }
        },
        data: normalSites.map(s => ({
          value: [s.lng, s.lat],
          ...s
        }))
      },
      // 告警站点
      {
        name: '告警',
        type: 'scatter',
        symbolSize: (data: any) => {
          return selectedSite && data.id === selectedSite.id ? 20 : 12
        },
        itemStyle: {
          color: (params: any) => {
            return selectedSite && params.data.id === selectedSite.id ? '#00F3FF' : '#FFD600'
          },
          shadowBlur: (params: any) => {
            return selectedSite && params.data.id === selectedSite.id ? 30 : 15
          },
          shadowColor: (params: any) => {
            return selectedSite && params.data.id === selectedSite.id
              ? 'rgba(0, 243, 255, 0.9)'
              : 'rgba(255, 214, 0, 0.6)'
          }
        },
        data: warningSites.map(s => ({
          value: [s.lng, s.lat],
          ...s
        }))
      },
      // 严重告警站点（带动画效果）
      {
        name: '严重',
        type: 'effectScatter',
        symbolSize: (data: any) => {
          return selectedSite && data.id === selectedSite.id ? 22 : 14
        },
        rippleEffect: {
          brushType: 'stroke',
          scale: (params: any) => {
            return selectedSite && params.id === selectedSite.id ? 4 : 3
          },
          period: 2
        },
        itemStyle: {
          color: (params: any) => {
            return selectedSite && params.data.id === selectedSite.id ? '#00F3FF' : '#FF2E63'
          },
          shadowBlur: (params: any) => {
            return selectedSite && params.data.id === selectedSite.id ? 35 : 20
          },
          shadowColor: (params: any) => {
            return selectedSite && params.data.id === selectedSite.id
              ? 'rgba(0, 243, 255, 1)'
              : 'rgba(255, 46, 99, 0.8)'
          }
        },
        data: criticalSites.map(s => ({
          value: [s.lng, s.lat],
          ...s
        }))
      },
      // 高亮选中站点的标注圆环（如果有选中的站点）
      ...(selectedSite ? [{
        name: '选中标记',
        type: 'scatter',
        symbolSize: 28,
        symbol: 'circle',
        itemStyle: {
          color: 'transparent',
          borderColor: '#00F3FF',
          borderWidth: 2,
          shadowBlur: 15,
          shadowColor: 'rgba(0, 243, 255, 0.6)'
        },
        data: [{
          value: [selectedSite.lng, selectedSite.lat],
          ...selectedSite
        }],
        z: 999
      }] : [])
    ]
  }

  mapChart.setOption(option)
}

const handleSiteClick = (site: SiteStatus) => {
  ElMessage.info(`查看站点详情: ${site.name}`)
  // 这里可以跳转到站点详情页或弹窗显示详情
}

// 搜索建议查询
const querySearch = (queryString: string, cb: (suggestions: SearchSuggestion[]) => void) => {
  const results = queryString
    ? sites.value
        .filter(site => site.name.toLowerCase().includes(queryString.toLowerCase()))
        .map(site => ({
          value: site.name,
          name: site.name,
          status: site.status,
          id: site.id,
          lat: site.lat,
          lng: site.lng
        }))
    : []
  cb(results)
}

// 选择搜索结果
const handleSearchSelect = (item: SearchSuggestion) => {
  selectedSiteId.value = item.id
  // 高亮选中的站点并居中显示
  highlightSite(item.id)
  ElMessage.success(`已定位到站点: ${item.name}`)
}

// 高亮站点
const highlightSite = (siteId: string) => {
  if (!mapChart) return

  const site = sites.value.find(s => s.id === siteId)
  if (!site) return

  // 重新渲染图表，为选中的站点添加高亮效果
  initMapChart()

  // 显示该站点的tooltip
  const siteIndex = sites.value.findIndex(s => s.id === siteId)
  if (siteIndex !== -1) {
    // 计算该站点在对应series中的索引
    const statusMap: { [key: string]: number } = {
      'offline': 0,
      'normal': 1,
      'warning': 2,
      'critical': 3
    }
    const seriesIndex = statusMap[site.status] || 0

    // 计算在该series中的数据索引
    const sitesInSeries = sites.value.filter(s => s.status === site.status)
    const dataIndex = sitesInSeries.findIndex(s => s.id === siteId)

    if (dataIndex !== -1) {
      mapChart.dispatchAction({
        type: 'showTip',
        seriesIndex: seriesIndex,
        dataIndex: dataIndex
      })
    }
  }
}

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  const typeMap: { [key: string]: 'success' | 'warning' | 'danger' | 'info' } = {
    'normal': 'success',
    'warning': 'warning',
    'critical': 'danger',
    'offline': 'info'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: { [key: string]: string } = {
    'normal': '正常',
    'warning': '告警',
    'critical': '严重',
    'offline': '离线'
  }
  return textMap[status] || '未知'
}

const fetchData = async () => {
  try {
    const allSites = await getAllSites()
    sites.value = allSites
    initMapChart()
  } catch (error) {
    console.error('Failed to fetch sites:', error)
  }
}

onMounted(() => {
  fetchData()

  window.addEventListener('resize', () => {
    mapChart?.resize()
  })
})

onUnmounted(() => {
  mapChart?.dispose()
})
</script>

<style scoped>
.site-map-core {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.map-card {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 0;
}

.module-card {
  background: var(--bg-panel-transparent);
  backdrop-filter: var(--backdrop-blur);
  border: 1px solid var(--border-light);
  border-radius: var(--card-radius);
  padding: 20px;
  box-shadow: var(--shadow-card);
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
  font-size: 16px;
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
  gap: 10px;
}

.site-search-input {
  width: 220px;
}

.site-search-input :deep(.el-input__wrapper) {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-light);
  box-shadow: none;
}

.site-search-input :deep(.el-input__wrapper:hover) {
  border-color: var(--tech-primary);
}

.site-search-input :deep(.el-input__wrapper.is-focus) {
  border-color: var(--tech-primary);
  box-shadow: 0 0 0 1px var(--tech-primary-dim);
}

.site-search-input :deep(.el-input__inner) {
  color: var(--text-bright);
}

.site-search-input :deep(.el-input__inner::placeholder) {
  color: var(--text-dim);
}

.site-search-input :deep(.el-icon) {
  color: var(--tech-primary);
}

.search-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 4px 0;
}

.search-item-name {
  font-size: 13px;
  color: var(--text-bright);
  flex: 1;
}

/* 地图容器包装 */
.map-wrapper {
  flex: 1;
  width: 100%;
  position: relative;
  min-height: 400px;
}

/* Google地图背景 */
.map-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/map-bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.7;
  border-radius: 4px;
  z-index: 0;
  filter: brightness(0.8) contrast(1.1);
}

.map-chart-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* 重点关注列表（悬浮层） */
.watch-list-overlay {
  position: absolute;
  top: 80px;
  right: 30px;
  width: 280px;
  background: rgba(11, 19, 37, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid var(--tech-primary);
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 10;
}

.watch-list-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--tech-primary);
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 243, 255, 0.2);
}

.watch-list-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.watch-item {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-dim);
  border-radius: 4px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.watch-item:hover {
  background: rgba(0, 243, 255, 0.1);
  border-color: var(--tech-primary);
  transform: translateX(-2px);
}

.watch-item.status-warning {
  border-left: 3px solid var(--status-warning);
}

.watch-item.status-critical {
  border-left: 3px solid var(--status-danger);
}

.watch-item-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-bright);
  margin-bottom: 6px;
}

.watch-item-metrics {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.metric {
  font-size: 11px;
  color: var(--text-sub);
  font-family: 'DIN Alternate', sans-serif;
}
</style>
