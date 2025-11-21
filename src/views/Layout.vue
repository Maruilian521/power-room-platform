<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '225px'" class="sidebar">
      <div class="logo">
        <el-icon size="28" color="#FFFFFF"><Operation /></el-icon>
        <h1 v-show="!isCollapse">配电室智慧运维平台</h1>
      </div>

      <!-- 搜索框 -->
      <div class="search-box" v-show="!isCollapse">
        <el-input
          v-model="searchText"
          placeholder="搜索功能"
          :prefix-icon="Search"
          clearable
        />
      </div>

      <el-scrollbar class="menu-scrollbar">
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          router
          :unique-opened="true"
          class="main-menu"
        >
          <!-- 2. 驾驶舱 -->
          <el-sub-menu index="2">
            <template #title>
              <el-icon><DataBoard /></el-icon>
              <span>驾驶舱</span>
            </template>
            <el-menu-item index="/dashboard/overview">
              <el-icon><DataLine /></el-icon>
              <span>运行总览</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/main-device">
              <el-icon><Monitor /></el-icon>
              <span>主设备运行总览</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/security">
              <el-icon><Warning /></el-icon>
              <span>安全态势与AI风险</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 3. 配电室管理 -->
          <el-sub-menu index="3">
            <template #title>
              <el-icon><OfficeBuilding /></el-icon>
              <span>配电室管理</span>
            </template>

            <!-- 3.1 配电室台账 -->
            <el-sub-menu index="3-1">
              <template #title>
                <el-icon><Document /></el-icon>
                <span>配电室台账</span>
              </template>
              <el-menu-item index="/room/ledger/basic">
                <span>配电室基础信息</span>
              </el-menu-item>
              <el-menu-item index="/room/ledger/transformer">
                <span>主变基本资料</span>
              </el-menu-item>
              <el-menu-item index="/room/ledger/primary-equipment">
                <span>一次设备清单</span>
              </el-menu-item>
              <el-menu-item index="/room/ledger/secondary-equipment">
                <span>二次设备资料</span>
              </el-menu-item>
              <el-menu-item index="/room/ledger/grounding">
                <span>接地系统资料</span>
              </el-menu-item>
              <el-menu-item index="/room/ledger/drawings">
                <span>图纸资料</span>
              </el-menu-item>
            </el-sub-menu>

            <!-- 3.2 配电室运行概览 -->
            <el-sub-menu index="3-2">
              <template #title>
                <el-icon><Monitor /></el-icon>
                <span>配电室运行概览</span>
              </template>
              <el-menu-item index="/room/overview/topology">
                <span>一次接线拓扑</span>
              </el-menu-item>
              <el-menu-item index="/room/overview/transformer-data">
                <span>主变实时数据</span>
              </el-menu-item>
              <el-menu-item index="/room/overview/cabinet-diagram">
                <span>高压柜组态图</span>
              </el-menu-item>
              <el-menu-item index="/room/overview/environment">
                <span>环境监测</span>
              </el-menu-item>
              <el-menu-item index="/room/overview/power-quality">
                <span>电能质量概览</span>
              </el-menu-item>
              <el-menu-item index="/room/overview/security">
                <span>安防信息</span>
              </el-menu-item>
            </el-sub-menu>

            <!-- 3.3 运行管理 -->
            <el-sub-menu index="3-3">
              <template #title>
                <el-icon><Setting /></el-icon>
                <span>运行管理</span>
              </template>
              <el-menu-item index="/room/operation/work-permit">
                <span>工作票管理</span>
              </el-menu-item>
              <el-menu-item index="/room/operation/operation-ticket">
                <span>操作票管理</span>
              </el-menu-item>
              <el-menu-item index="/room/operation/duty">
                <span>值班管理</span>
              </el-menu-item>
              <el-menu-item index="/room/operation/inspection">
                <span>巡视检查记录</span>
              </el-menu-item>
              <el-menu-item index="/room/operation/defect">
                <span>缺陷管理</span>
              </el-menu-item>
              <el-menu-item index="/room/operation/fault">
                <span>故障记录</span>
              </el-menu-item>
              <el-menu-item index="/room/operation/preventive-test">
                <span>预防性试验</span>
              </el-menu-item>
            </el-sub-menu>
          </el-sub-menu>

          <!-- 4. 设备管理 -->
          <el-sub-menu index="4">
            <template #title>
              <el-icon><Menu /></el-icon>
              <span>设备管理</span>
            </template>
            <el-menu-item index="/device/classification">
              <el-icon><Menu /></el-icon>
              <span>设备分类管理</span>
            </el-menu-item>
            <el-menu-item index="/device/monitoring">
              <el-icon><Monitor /></el-icon>
              <span>设备运行监测</span>
            </el-menu-item>
            <el-menu-item index="/device/lifecycle">
              <el-icon><Timer /></el-icon>
              <span>设备生命周期管理</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 5. 环境与安防管理 -->
          <el-sub-menu index="5">
            <template #title>
              <el-icon><Sunny /></el-icon>
              <span>环境与安防管理</span>
            </template>
            <el-menu-item index="/environment/monitoring">
              <el-icon><Sunny /></el-icon>
              <span>环境监测</span>
            </el-menu-item>
            <el-menu-item index="/environment/security">
              <el-icon><Lock /></el-icon>
              <span>安防监测</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 6. 视频与AI管理 -->
          <el-sub-menu index="6">
            <template #title>
              <el-icon><VideoCamera /></el-icon>
              <span>视频与AI管理</span>
            </template>
            <el-menu-item index="/video/monitoring">
              <el-icon><VideoCamera /></el-icon>
              <span>视频监控</span>
            </el-menu-item>
            <el-menu-item index="/video/ai">
              <el-icon><View /></el-icon>
              <span>AI识别</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 7. 实时监控中心 -->
          <el-sub-menu index="7">
            <template #title>
              <el-icon><Monitor /></el-icon>
              <span>实时监控中心</span>
            </template>
            <el-menu-item index="/monitoring/telemetry">
              <el-icon><DataLine /></el-icon>
              <span>遥测监控</span>
            </el-menu-item>
            <el-menu-item index="/monitoring/trend">
              <el-icon><TrendCharts /></el-icon>
              <span>趋势分析</span>
            </el-menu-item>
            <el-menu-item index="/monitoring/power-quality">
              <el-icon><CoffeeCup /></el-icon>
              <span>电能质量监测</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 8. 告警中心 -->
          <el-sub-menu index="8">
            <template #title>
              <el-icon><Bell /></el-icon>
              <span>告警中心</span>
            </template>
            <el-menu-item index="/alarm/list">
              <el-icon><Bell /></el-icon>
              <span>告警分级</span>
            </el-menu-item>
            <el-menu-item index="/alarm/source">
              <el-icon><Position /></el-icon>
              <span>告警来源</span>
            </el-menu-item>
            <el-menu-item index="/alarm/handle">
              <el-icon><Tools /></el-icon>
              <span>告警处理</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 9. 巡检中心 -->
          <el-sub-menu index="9">
            <template #title>
              <el-icon><Position /></el-icon>
              <span>巡检中心</span>
            </template>
            <el-menu-item index="/inspection/plan">
              <el-icon><Calendar /></el-icon>
              <span>巡检计划</span>
            </el-menu-item>
            <el-menu-item index="/inspection/execute">
              <el-icon><Position /></el-icon>
              <span>巡检执行</span>
            </el-menu-item>
            <el-menu-item index="/inspection/report">
              <el-icon><Document /></el-icon>
              <span>巡检报告</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 10. 工单中心 -->
          <el-sub-menu index="10">
            <template #title>
              <el-icon><Files /></el-icon>
              <span>工单中心</span>
            </template>
            <el-menu-item index="/workorder/source">
              <el-icon><Position /></el-icon>
              <span>工单来源</span>
            </el-menu-item>
            <el-menu-item index="/workorder/process">
              <el-icon><Edit /></el-icon>
              <span>工单处理流程</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 11. 报表中心 -->
          <el-sub-menu index="11">
            <template #title>
              <el-icon><DataAnalysis /></el-icon>
              <span>报表中心</span>
            </template>
            <el-menu-item index="/report/operation">
              <el-icon><Document /></el-icon>
              <span>运维报表</span>
            </el-menu-item>
            <el-menu-item index="/report/device-health">
              <el-icon><DataAnalysis /></el-icon>
              <span>设备健康分析</span>
            </el-menu-item>
            <el-menu-item index="/report/power-quality">
              <el-icon><Histogram /></el-icon>
              <span>电能质量报表</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 12. 系统管理 -->
          <el-sub-menu index="12">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/system/user">
              <el-icon><User /></el-icon>
              <span>用户与权限管理</span>
            </el-menu-item>
            <el-menu-item index="/system/alarm-strategy">
              <el-icon><Setting /></el-icon>
              <span>告警与AI策略</span>
            </el-menu-item>
            <el-menu-item index="/system/dictionary">
              <el-icon><Collection /></el-icon>
              <span>数据字典</span>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <el-header class="main-header">
        <div class="header-content">
          <div class="header-left">
            <el-button text @click="toggleCollapse" class="collapse-btn">
              <el-icon size="20"><Fold v-if="!isCollapse" /><Expand v-else /></el-icon>
            </el-button>

            <!-- 顶部标签页导航 -->
            <div class="top-tabs">
              <div
                v-for="tab in topTabs"
                :key="tab.name"
                :class="['tab-item', { active: activeTab === tab.name }]"
                @click="switchTab(tab.name)"
              >
                <el-icon><component :is="tab.icon" /></el-icon>
                <span>{{ tab.label }}</span>
              </div>
            </div>
          </div>
          <div class="header-right">
            <el-icon size="20" class="header-icon"><Setting /></el-icon>
            <el-badge :value="unreadAlarms" :max="99" class="alarm-badge">
              <el-icon size="20" class="alarm-icon"><Bell /></el-icon>
            </el-badge>
            <el-icon size="20" class="header-icon"><QuestionFilled /></el-icon>
            <el-dropdown>
              <span class="user-info">
                <el-avatar size="small" :src="avatarUrl">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span>马瑞莲</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>个人中心</el-dropdown-item>
                  <el-dropdown-item>系统设置</el-dropdown-item>
                  <el-dropdown-item divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>

      <el-main>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>

    <!-- 主题切换器 -->
    <ThemeSwitcher />
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Operation, Monitor, DataBoard, DataLine, TrendCharts, VideoCamera,
  Warning, Tools, Document, DataAnalysis, Setting,
  Tickets, Memo, Box, Files, Bell, User, Notebook,
  Picture, Lock, OfficeBuilding, Menu, Timer,
  Sunny, View, CoffeeCup, DocumentCopy, Calendar, Position,
  Edit, Histogram, Collection,
  Fold, Expand, Search, QuestionFilled, MagicStick, Cpu, TrendCharts as TrendChartsIcon
} from '@element-plus/icons-vue'
import ThemeSwitcher from '../components/ThemeSwitcher.vue'

const route = useRoute()
const router = useRouter()
const currentTime = ref('')
const isCollapse = ref(false)
const unreadAlarms = ref(8)
const avatarUrl = ref('')
const searchText = ref('')
const activeTab = ref('ai-brain')
let timer: number

const activeMenu = computed(() => route.path)

// 顶部标签页配置
const topTabs = ref([
  { name: 'ai-brain', label: 'AI大脑', icon: Cpu, route: '/ai-brain' },
  { name: 'room-management', label: '配电室管理', icon: OfficeBuilding, route: '/room/overview/topology' },
  { name: 'device-management', label: '设备管理', icon: Monitor, route: '/device/monitoring' },
  { name: 'environment-security', label: '环境与安防管理', icon: Lock, route: '/environment/monitoring' },
  { name: 'alarm-center', label: '告警中心', icon: Bell, route: '/alarm/list' },
  { name: 'inspection-center', label: '巡检中心', icon: Position, route: '/inspection/plan' },
  { name: 'report-center', label: '报表中心', icon: DataAnalysis, route: '/report/operation' }
])

// 切换标签页
const switchTab = (tabName: string) => {
  activeTab.value = tabName
  // 根据标签页切换路由
  const tab = topTabs.value.find(t => t.name === tabName)
  if (tab && tab.route) {
    router.push(tab.route)
  }
}

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 打开全屏大屏
const openBigScreen = () => {
  router.push('/bigscreen')
}

const currentPageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/dashboard/overview': '运行总览',
    '/dashboard/main-device': '主设备运行总览',
    '/dashboard/security': '安全态势与AI风险',

    // 配电室台账
    '/room/ledger/basic': '配电室基础信息',
    '/room/ledger/transformer': '主变基本资料',
    '/room/ledger/primary-equipment': '一次设备清单',
    '/room/ledger/secondary-equipment': '二次设备资料',
    '/room/ledger/grounding': '接地系统资料',
    '/room/ledger/drawings': '图纸资料',

    // 配电室运行概览
    '/room/overview/topology': '一次接线拓扑',
    '/room/overview/transformer-data': '主变实时数据',
    '/room/overview/cabinet-diagram': '高压柜组态图',
    '/room/overview/environment': '环境监测',
    '/room/overview/power-quality': '电能质量概览',
    '/room/overview/security': '安防信息',

    // 运行管理
    '/room/operation/work-permit': '工作票管理',
    '/room/operation/operation-ticket': '操作票管理',
    '/room/operation/duty': '值班管理',
    '/room/operation/inspection': '巡视检查记录',
    '/room/operation/defect': '缺陷管理',
    '/room/operation/fault': '故障记录',
    '/room/operation/preventive-test': '预防性试验',
    '/device/classification': '设备分类管理',
    '/device/monitoring': '设备运行监测',
    '/device/lifecycle': '设备生命周期管理',
    '/environment/monitoring': '环境监测',
    '/environment/security': '安防监测',
    '/video/monitoring': '视频监控',
    '/video/ai': 'AI识别',
    '/monitoring/telemetry': '遥测监控',
    '/monitoring/trend': '趋势分析',
    '/monitoring/power-quality': '电能质量监测',
    '/alarm/list': '告警分级',
    '/alarm/source': '告警来源',
    '/alarm/handle': '告警处理',
    '/inspection/plan': '巡检计划',
    '/inspection/execute': '巡检执行',
    '/inspection/report': '巡检报告',
    '/workorder/source': '工单来源',
    '/workorder/process': '工单处理流程',
    '/report/operation': '运维报表',
    '/report/device-health': '设备健康分析',
    '/report/power-quality': '电能质量报表',
    '/system/user': '用户与权限管理',
    '/system/alarm-strategy': '告警与AI策略',
    '/system/dictionary': '数据字典'
  }
  return titles[route.path] || '运行总览'
})

const updateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.layout-container {
  width: 100%;
  height: 100vh;
}

.sidebar {
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-right: none;
  background: var(--bg-color-sidebar);
  box-shadow: var(--shadow-md);
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64px;
  padding: 16px;
  gap: 10px;
  background: transparent;
  position: relative;
  overflow: hidden;
}

.logo h1 {
  font-size: 15px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.search-box {
  padding: 12px 16px;
  margin-bottom: 8px;
}

.search-box :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  box-shadow: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.search-box :deep(.el-input__inner) {
  color: #FFFFFF;
}

.search-box :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.6);
}

.search-box :deep(.el-input__prefix) {
  color: rgba(255, 255, 255, 0.6);
}

.menu-scrollbar {
  height: calc(100vh - 60px);
}

/* 菜单滚动条样式 - 默认隐藏 */
.menu-scrollbar :deep(.el-scrollbar__bar) {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.menu-scrollbar:hover :deep(.el-scrollbar__bar) {
  opacity: 1;
}

.menu-scrollbar :deep(.el-scrollbar__bar.is-horizontal) {
  display: none;
}

.main-menu {
  border-right: none;
  height: 100%;
}

.main-menu:not(.el-menu--collapse) {
  width: 240px;
}

.main-header {
  display: flex;
  align-items: center;
  padding: 0 24px;
  height: 64px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-color-header);
  box-shadow: var(--shadow-sm);
  position: relative;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
}

.collapse-btn {
  padding: 8px;
  color: var(--text-color-secondary);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.collapse-btn:hover {
  color: var(--primary-color);
  background: var(--primary-light);
}

/* 顶部标签页 */
.top-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 14px;
  color: var(--text-color-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;
}

.tab-item:hover {
  color: var(--primary-color);
  background: var(--primary-light);
}

.tab-item.active {
  color: var(--primary-color);
  background: var(--primary-light);
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--primary-color);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  color: var(--text-color-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.header-icon:hover {
  color: var(--primary-color);
}

.alarm-badge {
  cursor: pointer;
  transition: all 0.3s ease;
}

.alarm-icon {
  color: var(--text-color-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.alarm-badge:hover .alarm-icon {
  color: var(--error-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text-color-primary);
  padding: 4px 12px 4px 4px;
  border-radius: 20px;
  background: var(--border-color-light);
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
}

.user-info:hover {
  background: var(--border-color);
}

.el-main {
  padding: 0;
  height: calc(100vh - 60px);
  overflow: hidden;
  background: var(--bg-color-page);
}

/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 菜单项样式优化 */
:deep(.el-menu) {
  border-right: none;
  background: transparent;
}

:deep(.el-sub-menu__title) {
  font-size: 14px;
  font-weight: 500;
  color: var(--menu-text-color);
  height: 48px;
  line-height: 48px;
}

:deep(.el-menu-item) {
  font-size: 13px;
  color: var(--menu-text-color);
  height: 42px;
  line-height: 42px;
}

:deep(.el-sub-menu__title:hover) {
  background-color: var(--menu-bg-hover);
  color: var(--menu-text-hover);
}

:deep(.el-menu-item:hover) {
  background-color: var(--menu-bg-hover);
  color: var(--menu-text-hover);
}

:deep(.el-menu-item.is-active) {
  background: var(--menu-bg-active);
  color: var(--menu-text-hover);
  border-left: 3px solid var(--menu-text-hover);
  font-weight: 500;
}

:deep(.el-sub-menu .el-menu) {
  background: var(--menu-submenu-bg);
}

:deep(.el-sub-menu__icon-arrow) {
  color: var(--menu-text-color);
}

/* 折叠状态下的菜单样式 */
:deep(.el-menu--collapse) {
  width: 64px;
}

:deep(.el-menu--collapse .el-sub-menu__title span),
:deep(.el-menu--collapse .el-menu-item span) {
  display: none;
}

</style>
