// 综合态势大屏 - Mock数据服务
import { ref } from 'vue'

// 100个配电室站点数据
export interface SiteStatus {
  id: number
  name: string
  district: string
  lat: number
  lng: number
  status: 'normal' | 'warning' | 'critical' | 'offline'
  healthScore: number
  load: number // 当前负荷 MW
  temperature: number
  humidity: number
  hasAlarm: boolean
  alarmLevel?: 'info' | 'warning' | 'critical'
}

// 全局KPI数据
export interface GlobalKPI {
  safeDays: number // 安全运行天数
  onlineRate: number // 在线率 98/100
  totalOnline: number
  totalSites: number
  todayAlarms: number // 今日告警总数
  urgentWorkOrders: number // 待处理急单
  totalLoad: number // 实时总负荷 MW
  todayEnergy: number // 今日能耗 MWh
}

// 环境安防聚合数据
export interface EnvSecurityStats {
  highTemp: number // 高温预警站点数
  waterLeak: number // 水浸站点数
  smoke: number // 烟感站点数
  intrusion: number // 非法入侵站点数
}

// 设备健康度分布
export interface DeviceHealthDist {
  lowLoad: number // 负载<50%的站点数
  mediumLoad: number // 50%-80%
  highLoad: number // >80%
  overLoad: number // 超负荷
}

// 物资预警
export interface InventoryAlert {
  lowStock: number // 库存不足类数
  expiringSoon: number // 即将过期类数
}

// 实时告警流
export interface LiveAlarm {
  id: number
  time: string
  siteName: string
  type: string
  level: 'info' | 'warning' | 'critical' | 'ai'
  description: string
  imageUrl?: string
}

// 工单执行漏斗
export interface WorkOrderFunnel {
  created: number
  inProgress: number
  completed: number
  overdue: number
}

// AI快照
export interface AISnapshot {
  id: number
  time: string
  siteName: string
  type: string
  imageUrl: string
  confidence: number
}

// 负荷趋势数据（24小时）
export interface LoadTrend {
  time: string
  load: number // MW
  energy: number // MWh累计
}

// 巡检进度
export interface InspectionProgress {
  totalPlanned: number
  completed: number
  completionRate: number
}

// ========== Mock数据生成 ==========

// 100个配电室站点
const districts = ['海淀区', '朝阳区', '东城区', '西城区', '丰台区', '石景山区', '通州区', '大兴区']
const generateSites = (): SiteStatus[] => {
  const sites: SiteStatus[] = []
  const statusOptions: SiteStatus['status'][] = ['normal', 'normal', 'normal', 'normal', 'warning', 'critical', 'offline']

  for (let i = 1; i <= 100; i++) {
    const statusRandom = statusOptions[Math.floor(Math.random() * statusOptions.length)]
    const status = statusRandom || 'normal'
    const healthScore = status === 'normal' ? 85 + Math.random() * 15 :
                       status === 'warning' ? 60 + Math.random() * 25 :
                       status === 'critical' ? 30 + Math.random() * 30 :
                       0

    const districtRandom = districts[i % districts.length]
    const district = districtRandom || '海淀区'
    sites.push({
      id: i,
      name: `${district}No.${i}配电室`,
      district: district,
      lat: 39.9 + (Math.random() - 0.5) * 0.2,
      lng: 116.4 + (Math.random() - 0.5) * 0.3,
      status: status,
      healthScore: Math.round(healthScore),
      load: +(Math.random() * 2 + 0.5).toFixed(2),
      temperature: +(20 + Math.random() * 35).toFixed(1),
      humidity: +(40 + Math.random() * 40).toFixed(1),
      hasAlarm: status === 'warning' || status === 'critical',
      ...(status === 'warning' || status === 'critical' ? { alarmLevel: status === 'warning' ? 'warning' as const : 'critical' as const } : {})
    })
  }
  return sites
}

// 生成24小时负荷趋势
const generateLoadTrend = (): LoadTrend[] => {
  const data: LoadTrend[] = []
  let cumulativeEnergy = 0

  for (let i = 0; i < 24; i++) {
    // 模拟用电高峰：8-12点和18-22点
    let baseFactor = 0.6
    if ((i >= 8 && i <= 12) || (i >= 18 && i <= 22)) {
      baseFactor = 0.9 + Math.random() * 0.1
    } else if (i >= 0 && i <= 6) {
      baseFactor = 0.3 + Math.random() * 0.2
    }

    const load = +(baseFactor * 180 + Math.random() * 20).toFixed(2)
    cumulativeEnergy += load

    data.push({
      time: `${String(i).padStart(2, '0')}:00`,
      load,
      energy: +cumulativeEnergy.toFixed(2)
    })
  }

  return data
}

// 实时告警流（模拟滚动数据）
const generateLiveAlarms = (): LiveAlarm[] => {
  const alarmTypes = [
    { type: '高温告警', level: 'warning' as const },
    { type: '设备过载', level: 'critical' as const },
    { type: '烟雾识别', level: 'critical' as const },
    { type: '未戴安全帽', level: 'ai' as const },
    { type: '明火识别', level: 'critical' as const },
    { type: '水浸告警', level: 'critical' as const },
    { type: '电压异常', level: 'warning' as const },
    { type: '非法入侵', level: 'critical' as const },
  ]

  const alarms: LiveAlarm[] = []
  const now = new Date()

  for (let i = 0; i < 20; i++) {
    const alarmTypeRandom = alarmTypes[Math.floor(Math.random() * alarmTypes.length)]
    if (!alarmTypeRandom) continue

    const time = new Date(now.getTime() - i * 60000 * Math.random() * 10)
    const districtNameRandom = districts[Math.floor(Math.random() * districts.length)]
    const districtName = districtNameRandom || '海淀区'

    alarms.push({
      id: Date.now() + i,
      time: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      siteName: `${districtName}No.${Math.floor(Math.random() * 100 + 1)}配电室`,
      type: alarmTypeRandom.type,
      level: alarmTypeRandom.level,
      description: `${alarmTypeRandom.type}，请立即处理`,
      ...(alarmTypeRandom.level === 'ai' ? { imageUrl: '/api/snapshot/placeholder.jpg' } : {})
    })
  }

  return alarms.sort((a, b) => {
    const timeA = a.time.split(':').map(Number)
    const timeB = b.time.split(':').map(Number)
    const secondsA = (timeA[0] || 0) * 3600 + (timeA[1] || 0) * 60 + (timeA[2] || 0)
    const secondsB = (timeB[0] || 0) * 3600 + (timeB[1] || 0) * 60 + (timeB[2] || 0)
    return secondsB - secondsA
  })
}

// AI快照数据
const generateAISnapshots = (): AISnapshot[] => {
  const aiTypes = ['未戴安全帽', '明火识别', '烟雾检测', '人员倒地', '违规操作']
  const snapshots: AISnapshot[] = []
  const now = new Date()

  for (let i = 0; i < 5; i++) {
    const time = new Date(now.getTime() - i * 120000 * Math.random())
    const districtNameRandom = districts[Math.floor(Math.random() * districts.length)]
    const districtName = districtNameRandom || '海淀区'
    const aiType = aiTypes[i % aiTypes.length] || '未戴安全帽'
    snapshots.push({
      id: i + 1,
      time: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      siteName: `${districtName}No.${Math.floor(Math.random() * 100 + 1)}配电室`,
      type: aiType,
      imageUrl: `/api/ai-snapshot/${i + 1}.jpg`,
      confidence: +(0.85 + Math.random() * 0.14).toFixed(2)
    })
  }

  return snapshots
}

// ========== 导出响应式数据 ==========

export const mockIntegratedOpsData = {
  sites: ref<SiteStatus[]>(generateSites()),

  globalKPI: ref<GlobalKPI>({
    safeDays: 128,
    onlineRate: 98,
    totalOnline: 98,
    totalSites: 100,
    todayAlarms: 564,
    urgentWorkOrders: 10,
    totalLoad: 167.8,
    todayEnergy: 2856.3
  }),

  envSecurityStats: ref<EnvSecurityStats>({
    highTemp: 8,
    waterLeak: 0,
    smoke: 0,
    intrusion: 2
  }),

  deviceHealthDist: ref<DeviceHealthDist>({
    lowLoad: 42,
    mediumLoad: 48,
    highLoad: 8,
    overLoad: 2
  }),

  inventoryAlert: ref<InventoryAlert>({
    lowStock: 18,
    expiringSoon: 5
  }),

  liveAlarms: ref<LiveAlarm[]>(generateLiveAlarms()),

  workOrderFunnel: ref<WorkOrderFunnel>({
    created: 50,
    inProgress: 28,
    completed: 12,
    overdue: 10
  }),

  aiSnapshots: ref<AISnapshot[]>(generateAISnapshots()),

  loadTrend: ref<LoadTrend[]>(generateLoadTrend()),

  inspectionProgress: ref<InspectionProgress>({
    totalPlanned: 100,
    completed: 98,
    completionRate: 98.5
  })
}

// ========== API函数 ==========

// 获取全局KPI
export const getGlobalKPI = async (): Promise<GlobalKPI> => {
  return new Promise(resolve => {
    setTimeout(() => {
      // 模拟数据实时更新
      const kpi = mockIntegratedOpsData.globalKPI.value
      kpi.todayAlarms = 560 + Math.floor(Math.random() * 20)
      kpi.totalLoad = +(165 + Math.random() * 10).toFixed(1)
      resolve(kpi)
    }, 300)
  })
}

// 获取所有站点状态
export const getAllSites = async (): Promise<SiteStatus[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockIntegratedOpsData.sites.value)
    }, 300)
  })
}

// 获取环境安防统计
export const getEnvSecurityStats = async (): Promise<EnvSecurityStats> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockIntegratedOpsData.envSecurityStats.value)
    }, 200)
  })
}

// 获取设备健康度分布
export const getDeviceHealthDist = async (): Promise<DeviceHealthDist> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockIntegratedOpsData.deviceHealthDist.value)
    }, 200)
  })
}

// 获取物资预警
export const getInventoryAlert = async (): Promise<InventoryAlert> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockIntegratedOpsData.inventoryAlert.value)
    }, 200)
  })
}

// 获取实时告警流
export const getLiveAlarms = async (): Promise<LiveAlarm[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      // 模拟新告警加入
      const alarms = generateLiveAlarms()
      mockIntegratedOpsData.liveAlarms.value = alarms
      resolve(alarms)
    }, 300)
  })
}

// 获取工单漏斗
export const getWorkOrderFunnel = async (): Promise<WorkOrderFunnel> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockIntegratedOpsData.workOrderFunnel.value)
    }, 200)
  })
}

// 获取AI快照
export const getAISnapshots = async (): Promise<AISnapshot[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockIntegratedOpsData.aiSnapshots.value)
    }, 200)
  })
}

// 获取负荷趋势
export const getLoadTrend = async (): Promise<LoadTrend[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockIntegratedOpsData.loadTrend.value)
    }, 200)
  })
}

// 获取巡检进度
export const getInspectionProgress = async (): Promise<InspectionProgress> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockIntegratedOpsData.inspectionProgress.value)
    }, 200)
  })
}
