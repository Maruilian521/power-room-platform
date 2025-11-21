// TypeScript类型定义

// 设备类型
export interface Device {
  id: string
  name: string
  type: 'transformer' | 'switch' | 'sensor' | 'breaker' | 'capacitor'
  status: 'online' | 'offline' | 'warning' | 'alarm'
  location: string
  voltage: number
  current: number
  power: number
  temperature: number
  lastUpdate: string
}

// 告警信息
export interface Alarm {
  id: string
  deviceId: string
  deviceName: string
  level: 'critical' | 'warning' | 'info'
  type: string
  message: string
  time: string
  status: 'pending' | 'processing' | 'resolved'
}

// 工单
export interface WorkOrder {
  id: string
  title: string
  type: 'repair' | 'maintenance' | 'inspection' | 'emergency'
  deviceId: string
  deviceName: string
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
