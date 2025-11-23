import { 
  DataBoard, Warning, Monitor, VideoCamera, Sunny, 
  Bell, Files, Position, Document, Tools, 
  Histogram, TrendCharts, DataAnalysis, Setting, 
  User, Collection, MapLocation, List, Reading, Aim
} from '@element-plus/icons-vue'

export interface NavItem {
  id: string
  label: string
  subLabel?: string
  icon?: any
  path?: string
  children?: NavItem[]
}

export const navigationData: NavItem[] = [
  {
    id: 'cockpit',
    label: '驾驶舱',
    subLabel: 'DASHBOARD',
    icon: DataBoard,
    children: [
      { id: 'integrated-ops', label: '智慧运维中心', subLabel: 'OPS CENTER', path: '/dashboard/integrated-ops', icon: Monitor },
      { id: 'command-center', label: '无人配电指挥中心', subLabel: 'COMMAND CENTER', path: '/dashboard/command-center', icon: Aim },
      { id: 'security-situation', label: 'AI安全态势', subLabel: 'AI SECURITY', path: '/dashboard/ai-security', icon: Warning }
    ]
  },
  {
    id: 'monitoring',
    label: '智能监控中心',
    subLabel: 'MONITORING',
    icon: Monitor,
    children: [
      { id: 'site-list', label: '站点列表监控', subLabel: 'SITE LIST', path: '/monitoring/site-list', icon: List },
      { id: 'video-patrol', label: '视频巡视中心', subLabel: 'VIDEO', path: '/monitoring/video', icon: VideoCamera },
      { id: 'env-security', label: '环境与安防', subLabel: 'ENV & SEC', path: '/monitoring/environment', icon: Sunny },
      { id: 'site-map', label: '站点监控地图', subLabel: 'GIS MAP', path: '/monitoring/site-map', icon: MapLocation }
    ]
  },
  {
    id: 'om',
    label: '运维作业中心',
    subLabel: 'O&M',
    icon: Tools,
    children: [
      { id: 'alarm-center', label: '告警与事件', subLabel: 'ALARMS', path: '/om/alarms', icon: Bell },
      { id: 'work-order', label: '工单管理', subLabel: 'WORK ORDERS', path: '/om/work-orders', icon: Files },
      { id: 'inspection', label: '巡检管理', subLabel: 'INSPECTION', path: '/om/inspection', icon: Position },
      { id: 'tickets', label: '两票管理', subLabel: 'TICKETS', path: '/om/tickets', icon: Document },
      { id: 'knowledge-base', label: '知识库', subLabel: 'KNOWLEDGE', path: '/om/knowledge', icon: Reading }
    ]
  },
  {
    id: 'assets',
    label: '资产台账管理',
    subLabel: 'ASSETS',
    icon: Collection,
    children: [
      { id: 'room-ledger', label: '配电室台账', subLabel: 'ROOMS', path: '/assets/rooms', icon: Document },
      { id: 'device-ledger', label: '设备台账', subLabel: 'DEVICES', path: '/assets/devices', icon: Monitor },
      { id: 'spare-parts', label: '备品备件', subLabel: 'SPARES', path: '/assets/spares', icon: Box }
    ]
  },
  {
    id: 'analytics',
    label: '分析与报表',
    subLabel: 'ANALYTICS',
    icon: DataAnalysis,
    children: [
      { id: 'ops-report', label: '运维报表', subLabel: 'OPS REPORT', path: '/analytics/operation', icon: Document },
      { id: 'power-quality', label: '电能质量', subLabel: 'QUALITY', path: '/analytics/power-quality', icon: Histogram },
      { id: 'device-health', label: '设备健康', subLabel: 'HEALTH', path: '/analytics/health', icon: DataAnalysis },
      { id: 'load-analysis', label: '负荷分析', subLabel: 'LOAD', path: '/analytics/load', icon: TrendCharts }
    ]
  },
  {
    id: 'system',
    label: '系统配置',
    subLabel: 'SYSTEM',
    icon: Setting,
    children: [
      { id: 'user-mgmt', label: '用户管理', subLabel: 'USERS', path: '/system/users', icon: User },
      { id: 'strategy', label: '策略配置', subLabel: 'STRATEGY', path: '/system/strategies', icon: Setting },
      { id: 'dict', label: '数据字典', subLabel: 'DICT', path: '/system/dictionary', icon: Collection }
    ]
  }
]

// Add Box icon import workaround if needed, or reuse Collection
import { Box } from '@element-plus/icons-vue'
