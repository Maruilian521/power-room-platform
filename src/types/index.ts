// TypeScript类型定义

export interface Room {
  id: string
  name: string
  code?: string // 站点编码
  region?: string // 所属区域
  commissionDate?: string // 投运日期
  location: string
  manager: string
  phone: string
}

export interface SparePart {
  id: string
  name: string
  type: string // 关联设备类型
  stock: number
  minStock: number
  location: string // 存放位置
  supplier: string
  lastUpdate: string
}

// 设备类型
export interface Device {
  id: string
  assetCode?: string // 资产编号
  name: string
  model?: string // 型号规格
  manufacturer?: string // 厂家
  warrantyDate?: string // 质保截止日期
  healthScore?: number // 健康评分
  roomId: string
  roomName: string
  type: 'transformer' | 'switch' | 'sensor' | 'breaker' | 'capacitor' | 'camera' | 'robot'
  status: 'online' | 'offline' | 'warning' | 'alarm'
  voltage?: number
  current?: number
  power?: number
  temperature?: number
  humidity?: number
  lastUpdate: string
}

export type AlarmCategory = 'power' | 'environment' | 'security' | 'device' | 'ai'

// 告警信息
export interface Alarm {
  id: string
  deviceId?: string
  deviceName?: string
  roomId: string
  roomName: string
  category: AlarmCategory
  level: 'critical' | 'warning' | 'info'
  type: string // e.g., 'temp_high', 'smoke', 'no_hard_hat', 'intrusion'
  message: string
  value?: string | number // Current value triggering alarm
  threshold?: string | number
  snapshotUrl?: string // For AI/Security alarms
  time: string
  status: 'pending' | 'processing' | 'resolved'
  handler?: string
  handleTime?: string
  solution?: string
}

// 工单
export interface WorkOrder {
  id: string
  title: string
  type: 'repair' | 'maintenance' | 'inspection' | 'emergency'
  deviceId: string
  deviceName: string
  roomName: string // Added
  deadline?: string // Added
  description: string
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignee: string
  createTime: string
  updateTime: string
  completeTime?: string
}

// 实时数据
export interface RealtimeData {
  timestamp: string
  voltage: number[]
  current: number[]
  power: number[]
  temperature: number[]
}

// 统计数据
export interface Statistics {
  totalDevices: number
  onlineDevices: number
  offlineDevices: number
  warningDevices: number
  alarmDevices: number
  totalAlarms: number
  criticalAlarms: number
  warningAlarms: number
  infoAlarms: number
  totalWorkOrders: number
  pendingWorkOrders: number
  completedWorkOrders: number
}

// 两票管理
export type TicketCategory = 'work_1' | 'work_2' | 'operation'
export type TicketStatus = 'draft' | 'audit' | 'permit' | 'executing' | 'finished'

export interface Ticket {
  id: string
  no: string
  category: TicketCategory
  stationName: string
  task: string
  status: TicketStatus
  currentStep: string // e.g. "待签发"
  leader: string // 负责人/操作人
  guardian?: string // 监护人 (操作票)
  issuer?: string // 签发人
  licensor?: string // 许可人
  startTime: string
  endTime: string
  createTime: string
  content?: string // 操作步骤或安全措施
}
