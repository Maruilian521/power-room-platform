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
      redirect: '/login',
      children: [
        // AI大脑
        {
          path: 'ai-brain',
          name: 'AIBrain',
          component: () => import('../views/AIBrain/index.vue'),
          meta: { title: 'AI大脑', icon: 'Cpu' }
        },

        // 2. 驾驶舱
        {
          path: 'dashboard/overview',
          name: 'DashboardOverview',
          component: () => import('../views/Dashboard.vue'),
          meta: { title: '运行总览', icon: 'DataBoard' }
        },
        {
          path: 'dashboard/main-device',
          name: 'MainDeviceOverview',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '主设备运行总览', icon: 'Monitor' }
        },
        {
          path: 'dashboard/security',
          name: 'SecuritySituation',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '安全态势与AI风险', icon: 'Warning' }
        },

        // 3. 配电室管理
        // 3.1 配电室台账
        {
          path: 'room/ledger/basic',
          name: 'RoomLedgerBasic',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '配电室基础信息', icon: 'Document' }
        },
        {
          path: 'room/ledger/transformer',
          name: 'RoomLedgerTransformer',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '主变基本资料', icon: 'Document' }
        },
        {
          path: 'room/ledger/primary-equipment',
          name: 'RoomLedgerPrimaryEquipment',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '一次设备清单', icon: 'Document' }
        },
        {
          path: 'room/ledger/secondary-equipment',
          name: 'RoomLedgerSecondaryEquipment',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '二次设备资料', icon: 'Document' }
        },
        {
          path: 'room/ledger/grounding',
          name: 'RoomLedgerGrounding',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '接地系统资料', icon: 'Document' }
        },
        {
          path: 'room/ledger/drawings',
          name: 'RoomLedgerDrawings',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '图纸资料', icon: 'Document' }
        },

        // 3.2 配电室运行概览 (矩阵入口)
        {
          path: 'room/overview/topology',
          name: 'RoomOverviewTopology',
          component: () => import('../views/RoomMonitoring/index.vue'),
          meta: { title: '一次接线拓扑', icon: 'Monitor' }
        },
        // 新增：配电室详情页 (带参数)
        {
          path: 'room/detail/:id',
          name: 'RoomDetail',
          component: () => import('../views/RoomDetail/index.vue'),
          meta: { title: '配电室详情', icon: 'Document' }
        },
        {
          path: 'room/overview/transformer-data',
          name: 'RoomOverviewTransformerData',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '主变实时数据', icon: 'Monitor' }
        },
        {
          path: 'room/overview/cabinet-diagram',
          name: 'RoomOverviewCabinetDiagram',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '高压柜组态图', icon: 'Monitor' }
        },
        {
          path: 'room/overview/environment',
          name: 'RoomOverviewEnvironment',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '环境监测', icon: 'Monitor' }
        },
        {
          path: 'room/overview/power-quality',
          name: 'RoomOverviewPowerQuality',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '电能质量概览', icon: 'Monitor' }
        },
        {
          path: 'room/overview/security',
          name: 'RoomOverviewSecurity',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '安防信息', icon: 'Monitor' }
        },

        // 3.3 运行管理
        {
          path: 'room/operation/work-permit',
          name: 'WorkPermit',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '工作票管理', icon: 'Tickets' }
        },
        {
          path: 'room/operation/operation-ticket',
          name: 'OperationTicket',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '操作票管理', icon: 'Tickets' }
        },
        {
          path: 'room/operation/duty',
          name: 'DutyManagement',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '值班管理', icon: 'Notebook' }
        },
        {
          path: 'room/operation/inspection',
          name: 'InspectionRecords',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '巡视检查记录', icon: 'Document' }
        },
        {
          path: 'room/operation/defect',
          name: 'DefectManagement',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '缺陷管理', icon: 'Tools' }
        },
        {
          path: 'room/operation/fault',
          name: 'FaultRecords',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '故障记录', icon: 'Warning' }
        },
        {
          path: 'room/operation/preventive-test',
          name: 'PreventiveTest',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '预防性试验', icon: 'Document' }
        },

        // 4. 设备管理
        {
          path: 'device/classification',
          name: 'DeviceClassification',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '设备分类管理', icon: 'Menu' }
        },
        {
          path: 'device/monitoring',
          name: 'DeviceMonitoring',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '设备运行监测', icon: 'Monitor' }
        },
        {
          path: 'device/lifecycle',
          name: 'DeviceLifecycle',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '设备生命周期管理', icon: 'Timer' }
        },

        // 5. 环境与安防管理
        {
          path: 'environment/monitoring',
          name: 'EnvironmentMonitoring',
          component: () => import('../views/Environment/index.vue'),
          meta: { title: '环境监测', icon: 'Sunny' }
        },
        {
          path: 'environment/security',
          name: 'SecurityMonitoring',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '安防监测', icon: 'Lock' }
        },

        // 6. 视频与AI管理
        {
          path: 'video/monitoring',
          name: 'VideoMonitoring',
          component: () => import('../views/VideoMonitoring/index.vue'),
          meta: { title: '视频监控', icon: 'VideoCamera' }
        },
        {
          path: 'video/ai',
          name: 'AIRecognition',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: 'AI识别', icon: 'View' }
        },

        // 7. 实时监控中心
        {
          path: 'monitoring/telemetry',
          name: 'TelemetryMonitoring',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '遥测监控', icon: 'DataLine' }
        },
        {
          path: 'monitoring/trend',
          name: 'TrendAnalysis',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '趋势分析', icon: 'TrendCharts' }
        },
        {
          path: 'monitoring/power-quality',
          name: 'PowerQualityMonitoring',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '电能质量监测', icon: 'CoffeeCup' }
        },

        // 8. 告警中心
        {
          path: 'alarm/list',
          name: 'AlarmList',
          component: () => import('../views/AlarmList.vue'),
          meta: { title: '告警分级', icon: 'Bell' }
        },
        {
          path: 'alarm/source',
          name: 'AlarmSource',
          component: () => import('../views/AlarmList.vue'),
          meta: { title: '告警来源', icon: 'Position' }
        },
        {
          path: 'alarm/handle',
          name: 'AlarmHandle',
          component: () => import('../views/AlarmList.vue'),
          meta: { title: '告警处理', icon: 'Tools' }
        },

        // 9. 巡检中心
        {
          path: 'inspection/plan',
          name: 'InspectionPlan',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '巡检计划', icon: 'Calendar' }
        },
        {
          path: 'inspection/execute',
          name: 'InspectionExecute',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '巡检执行', icon: 'Position' }
        },
        {
          path: 'inspection/report',
          name: 'InspectionReport',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '巡检报告', icon: 'Document' }
        },

        // 10. 工单中心
        {
          path: 'workorder/source',
          name: 'WorkOrderSource',
          component: () => import('../views/WorkOrder.vue'),
          meta: { title: '工单来源', icon: 'Position' }
        },
        {
          path: 'workorder/process',
          name: 'WorkOrderProcess',
          component: () => import('../views/WorkOrder.vue'),
          meta: { title: '工单处理流程', icon: 'Edit' }
        },

        // 11. 报表中心
        {
          path: 'report/operation',
          name: 'OperationReport',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '运维报表', icon: 'Document' }
        },
        {
          path: 'report/device-health',
          name: 'DeviceHealthReport',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '设备健康分析', icon: 'DataAnalysis' }
        },
        {
          path: 'report/power-quality',
          name: 'PowerQualityReport',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '电能质量报表', icon: 'Histogram' }
        },

        // 12. 系统管理
        {
          path: 'system/user',
          name: 'UserManagement',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '用户与权限管理', icon: 'User' }
        },
        {
          path: 'system/alarm-strategy',
          name: 'AlarmStrategy',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '告警与AI策略', icon: 'Setting' }
        },
        {
          path: 'system/dictionary',
          name: 'DataDictionary',
          component: () => import('../views/DeviceList.vue'),
          meta: { title: '数据字典', icon: 'Collection' }
        }
      ]
    }
  ]
})

export default router
