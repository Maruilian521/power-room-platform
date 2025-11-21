import { 
  Cpu, DataBoard, OfficeBuilding, Monitor, 
  Sunny, VideoCamera, Bell, Position, 
  Files, DataAnalysis, Setting 
} from '@element-plus/icons-vue'

export interface NavItem {
  id: string
  label: string // The display name (e.g., "CAMPAIGN")
  subLabel?: string // Optional Chinese label
  icon?: any
  path?: string // If it's a direct link
  children?: NavItem[]
}

export const navigationData: NavItem[] = [
  {
    id: 'cockpit',
    label: '驾驶舱',
    subLabel: 'COCKPIT',
    icon: DataBoard,
    children: [
      { id: 'ai-brain', label: 'AI大脑', subLabel: 'AI BRAIN', path: '/ai-brain', icon: Cpu },
      { id: 'overview', label: '运行总览', subLabel: 'OVERVIEW', path: '/dashboard/overview', icon: DataBoard },
      { id: 'main-device', label: '主设备总览', subLabel: 'MAIN DEVICES', path: '/dashboard/main-device', icon: Monitor },
      { id: 'security', label: '安全态势', subLabel: 'SECURITY', path: '/dashboard/security', icon: Sunny }
    ]
  },
  {
    id: 'room',
    label: '配电室管理',
    subLabel: 'ROOM',
    icon: OfficeBuilding,
    children: [
      { id: 'room-monitor', label: '实时监测', subLabel: 'MONITOR', path: '/room/overview/topology' },
      { id: 'ledger', label: '台账管理', subLabel: 'LEDGER', path: '/room/ledger/basic' },
      { id: 'operation', label: '运行管理', subLabel: 'OPERATION', path: '/room/operation/duty' }
    ]
  },
  {
    id: 'device',
    label: '设备管理',
    subLabel: 'DEVICE',
    icon: Monitor,
    children: [
      { id: 'dev-class', label: '设备分类', subLabel: 'CLASS', path: '/device/classification' },
      { id: 'dev-monitor', label: '运行监测', subLabel: 'MONITOR', path: '/device/monitoring' },
      { id: 'dev-lifecycle', label: '生命周期', subLabel: 'LIFECYCLE', path: '/device/lifecycle' }
    ]
  },
  {
    id: 'env',
    label: '环境与安防',
    subLabel: 'ENV & SEC',
    icon: Sunny,
    children: [
      { id: 'env-monitor', label: '环境监测', subLabel: 'ENVIRONMENT', path: '/environment/monitoring' },
      { id: 'sec-monitor', label: '安防监测', subLabel: 'SECURITY', path: '/environment/security' }
    ]
  },
  {
    id: 'video',
    label: '视频监控',
    subLabel: 'VIDEO',
    icon: VideoCamera,
    children: [
      { id: 'vid-monitor', label: '实时视频', subLabel: 'MONITORING', path: '/video/monitoring' },
      { id: 'vid-ai', label: 'AI识别', subLabel: 'AI RECOGNITION', path: '/video/ai' }
    ]
  },
  {
    id: 'alarm',
    label: '告警中心',
    subLabel: 'ALARM',
    icon: Bell,
    children: [
      { id: 'alarm-list', label: '告警分级', subLabel: 'LEVELS', path: '/alarm/list' },
      { id: 'alarm-source', label: '告警来源', subLabel: 'SOURCES', path: '/alarm/source' },
      { id: 'alarm-handle', label: '告警处理', subLabel: 'HANDLING', path: '/alarm/handle' }
    ]
  },
  {
    id: 'inspection',
    label: '巡检管理',
    subLabel: 'PATROL',
    icon: Position,
    children: [
      { id: 'insp-plan', label: '巡检计划', subLabel: 'PLAN', path: '/inspection/plan' },
      { id: 'insp-exec', label: '巡检执行', subLabel: 'EXECUTE', path: '/inspection/execute' },
      { id: 'insp-rep', label: '巡检报告', subLabel: 'REPORT', path: '/inspection/report' }
    ]
  },
  {
    id: 'workorder',
    label: '工单管理',
    subLabel: 'ORDER',
    icon: Files,
    children: [
      { id: 'wo-src', label: '工单来源', subLabel: 'SOURCE', path: '/workorder/source' },
      { id: 'wo-proc', label: '处理流程', subLabel: 'PROCESS', path: '/workorder/process' }
    ]
  },
  {
    id: 'report',
    label: '报表中心',
    subLabel: 'REPORT',
    icon: DataAnalysis,
    children: [
      { id: 'rep-ops', label: '运维报表', subLabel: 'OPS REPORT', path: '/report/operation' },
      { id: 'rep-health', label: '健康分析', subLabel: 'HEALTH', path: '/report/device-health' },
      { id: 'rep-power', label: '电能质量', subLabel: 'QUALITY', path: '/report/power-quality' }
    ]
  },
  {
    id: 'system',
    label: '系统管理',
    subLabel: 'SYSTEM',
    icon: Setting,
    children: [
      { id: 'sys-user', label: '用户管理', subLabel: 'USER', path: '/system/user' },
      { id: 'sys-alarm', label: '策略配置', subLabel: 'STRATEGY', path: '/system/alarm-strategy' },
      { id: 'sys-dict', label: '数据字典', subLabel: 'DICT', path: '/system/dictionary' }
    ]
  }
]
