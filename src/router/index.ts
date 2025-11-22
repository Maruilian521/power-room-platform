import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../views/Layout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 登录页
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { title: '登录' }
    },
    // 全屏大屏（独立路由，无Layout）
    {
      path: '/bigscreen',
      name: 'BigScreenFullscreen',
      component: () => import('../views/BigScreen/index.vue'),
      meta: { title: '监控大屏' }
    },
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard/overview',
      children: [
        // 1. 驾驶舱 (Dashboard)
        {
          path: 'dashboard/overview',
          name: 'DashboardOverview',
          component: () => import('../views/Dashboard.vue'),
          meta: { title: '运行总览', icon: 'DataBoard' }
        },
        {
          path: 'dashboard/ai-security',
          name: 'AISecurity',
          component: () => import('../views/AIBrain/index.vue'), // Using existing AI Brain
          meta: { title: 'AI安全态势', icon: 'Warning' }
        },

        // 2. 智能监控中心 (Monitoring)
        {
          path: 'monitoring/site-map',
          name: 'SiteMap',
          component: () => import('../views/ComingSoon.vue'), // Placeholder
          meta: { title: '站点监控地图', icon: 'MapLocation' }
        },
        {
          path: 'monitoring/site-list',
          name: 'SiteList',
          component: () => import('../views/SiteList.vue'),
          meta: { title: '站点列表监控', icon: 'List' }
        },
        {
          path: 'monitoring/video',
          name: 'VideoPatrol',
          component: () => import('../views/VideoMonitoring/index.vue'),
          meta: { title: '视频巡视中心', icon: 'VideoCamera' }
        },
        {
          path: 'monitoring/environment',
          name: 'EnvSecurity',
          component: () => import('../views/Environment/index.vue'),
          meta: { title: '环境与安防总览', icon: 'Sunny' }
        },
        // 配电室详情 (Hidden from menu, accessible via map/list)
        {
          path: 'room/detail/:id',
          name: 'RoomDetail',
          component: () => import('../views/RoomDetail/index.vue'),
          meta: { title: '配电室详情', hidden: true }
        },

        // 3. 运维作业中心 (O&M)
        {
          path: 'om/alarms',
          name: 'AlarmCenter',
          component: () => import('../views/AlarmList.vue'),
          meta: { title: '告警与事件中心', icon: 'Bell' }
        },
        {
          path: 'om/work-orders',
          name: 'WorkOrderManagement',
          component: () => import('../views/WorkOrder.vue'),
          meta: { title: '工单管理', icon: 'Files' }
        },
        {
          path: 'om/inspection',
          name: 'InspectionManagement',
          component: () => import('../views/ComingSoon.vue'), // Placeholder for group
          meta: { title: '巡检管理', icon: 'Position' }
        },
        {
          path: 'om/tickets',
          name: 'TicketManagement',
          component: () => import('../views/TicketManagement.vue'),
          meta: { title: '两票管理', icon: 'Document' }
        },

        // 4. 资产台账管理 (Assets)
        {
          path: 'assets/rooms',
          name: 'RoomLedger',
          component: () => import('../views/RoomLedger.vue'),
          meta: { title: '配电室台账', icon: 'Document' }
        },
        {
          path: 'assets/room-ledger/:id',
          name: 'RoomLedgerDetail',
          component: () => import('../views/RoomLedgerDetail.vue'),
          meta: { title: '台账详情', hidden: true }
        },
        {
          path: 'assets/devices',
          name: 'DeviceLedger',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '设备台账', icon: 'Monitor' }
        },
        {
          path: 'assets/spares',
          name: 'SpareParts',
          component: () => import('../views/SpareParts.vue'),
          meta: { title: '备品备件管理', icon: 'Box' }
        },

        // 5. 分析与报表中心 (Analytics)
        {
          path: 'analytics/operation',
          name: 'OperationReport',
          component: () => import('../views/OperationReport.vue'),
          meta: { title: '运维报表', icon: 'Document' }
        },
        {
          path: 'analytics/power-quality',
          name: 'PowerQualityAnalytics',
          component: () => import('../views/ComingSoon.vue'), // Placeholder
          meta: { title: '电能质量报表', icon: 'Histogram' }
        },
        {
          path: 'analytics/health',
          name: 'DeviceHealthAnalytics',
          component: () => import('../views/ComingSoon.vue'), // Placeholder
          meta: { title: '设备健康报告', icon: 'DataAnalysis' }
        },
        {
          path: 'analytics/load',
          name: 'LoadAnalysis',
          component: () => import('../views/ComingSoon.vue'), // Placeholder
          meta: { title: '负荷/趋势分析', icon: 'TrendCharts' }
        },

        // 6. 系统与策略配置 (System)
        {
          path: 'system/users',
          name: 'UserManagement',
          component: () => import('../views/ComingSoon.vue'), // Placeholder
          meta: { title: '用户与权限管理', icon: 'User' }
        },
        {
          path: 'system/strategies',
          name: 'SystemStrategies',
          component: () => import('../views/ComingSoon.vue'), // Placeholder
          meta: { title: '告警与AI策略', icon: 'Setting' }
        },
        {
          path: 'system/dictionary',
          name: 'DataDictionary',
          component: () => import('../views/ComingSoon.vue'), // Placeholder
          meta: { title: '数据字典', icon: 'Collection' }
        }
      ]
    }
  ]
})

export default router