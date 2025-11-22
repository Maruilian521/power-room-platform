import Mock from 'mockjs'
import type { Device, Alarm, WorkOrder, Statistics, Room, AlarmCategory } from '../types'

// 配置Mock
Mock.setup({
  timeout: '200-600'
})

// 生成配电室数据 (100个)
const generateRooms = (): Room[] => {
  const rooms: Room[] = []
  const districts = ['朝阳区', '海淀区', '丰台区', '大兴区', '通州区']
  
  for (let i = 1; i <= 100; i++) {
    const district = districts[i % districts.length]
    rooms.push({
      id: `ROOM-${String(i).padStart(3, '0')}`,
      code: `AST-RM-${String(i).padStart(4, '0')}`,
      name: `${district}No.${i}配电室`,
      region: district,
      commissionDate: Mock.Random.date('yyyy-MM-dd'),
      location: `${district}某街道${i}号`,
      manager: Mock.Random.cname(),
      phone: /^1[3-9]\d{9}$/.test('13800138000') ? Mock.mock(/^1[3-9]\d{9}$/) : '13800138000'
    })
  }
  return rooms
}

const rooms = generateRooms()

// 生成设备数据
const generateDevices = (): Device[] => {
  const devices: Device[] = []
  const types: Device['type'][] = ['transformer', 'switch', 'sensor', 'breaker', 'capacitor', 'camera']
  const manufacturers = ['西门子', 'ABB', '施耐德', '南瑞继保', '特变电工']
  
  rooms.forEach(room => {
    // 每个配电室生成一些设备
    const deviceCount = Mock.Random.integer(5, 15)
    for (let i = 0; i < deviceCount; i++) {
        const type = types[Math.floor(Math.random() * types.length)]!
        const manuf = manufacturers[Math.floor(Math.random() * manufacturers.length)]!
        
        // Warranty date: random within next 2 years or past 1 year
        const warrantyDate = new Date()
        warrantyDate.setFullYear(warrantyDate.getFullYear() + Math.floor(Math.random() * 3) - 1)
        warrantyDate.setMonth(Math.floor(Math.random() * 12))
        
        devices.push({
            id: `DEV-${room.id}-${i}`,
            assetCode: `AST-DV-${String(Math.floor(Math.random()*10000)).padStart(5, '0')}`,
            name: `${room.name}-${type === 'transformer' ? '变压器' : type === 'switch' ? '开关柜' : type === 'camera' ? '摄像头' : '设备'}-${i}`,
            model: `MOD-${String(Math.floor(Math.random()*100)).padStart(3, '0')}`,
            manufacturer: manuf,
            warrantyDate: warrantyDate.toISOString().split('T')[0],
            healthScore: Math.floor(60 + Math.random() * 40),
            roomId: room.id,
            roomName: room.name,
            type: type,
            status: Mock.Random.pick(['online', 'online', 'online', 'warning', 'offline']),
            voltage: type === 'transformer' ? Mock.Random.float(380, 420, 1, 2) : undefined,
            temperature: Mock.Random.float(20, 80, 1, 2),
            lastUpdate: new Date().toISOString()
        })
    }
  })
  
  return devices
}

// 生成备品备件数据
const generateSpareParts = () => {
    const parts = []
    const names = ['SF6压力表', '高压熔断器', '避雷器', '绝缘子', '控制模块', '指示灯']
    const types = ['开关柜', '变压器', '保护装置', '辅助设备']
    
    for(let i=0; i<50; i++) {
        const minStock = Math.floor(5 + Math.random() * 10)
        const stock = Math.floor(Math.random() * 30) // Can be less than min
        
        parts.push({
            id: `SP-${i}`,
            name: names[i % names.length],
            type: types[i % types.length],
            stock: stock,
            minStock: minStock,
            location: `仓库-${String.fromCharCode(65 + Math.floor(Math.random()*3))}-${Math.ceil(Math.random()*10)}`,
            supplier: 'XX电气物资有限公司',
            lastUpdate: new Date().toISOString()
        })
    }
    return parts
}

const spareParts = generateSpareParts()
Mock.mock('/api/spare-parts', 'get', { code: 200, data: spareParts, message: 'success' })

// 生成告警数据
const generateAlarms = (): Alarm[] => {
  const alarms: Alarm[] = []
  const alarmTypes = [
    { type: 'voltage_high', label: '电压过高', category: 'power', level: 'critical' },
    { type: 'voltage_low', label: '电压过低', category: 'power', level: 'warning' },
    { type: 'switch_fail', label: '开关柜故障', category: 'device', level: 'critical' },
    { type: 'temp_high', label: '温度过高', category: 'environment', level: 'warning' },
    { type: 'smoke', label: '烟感报警', category: 'environment', level: 'critical' },
    { type: 'pd_warning', label: '局部放电', category: 'power', level: 'warning' },
    { type: 'ai_helmet', label: '未戴安全帽', category: 'ai', level: 'warning' },
    { type: 'ai_fire', label: '明火识别', category: 'ai', level: 'critical' },
    { type: 'ai_uniform', label: '工服检测异常', category: 'ai', level: 'info' },
    { type: 'ai_intrusion', label: '区域入侵', category: 'security', level: 'critical' }
  ]
  
  const statuses: Alarm['status'][] = ['pending', 'processing', 'resolved']

  // 生成2500条告警
  for (let i = 0; i < 2500; i++) {
    const room = rooms[Math.floor(Math.random() * rooms.length)]!
    const alarmConfig = alarmTypes[Math.floor(Math.random() * alarmTypes.length)]!
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    // 30% probability of being today, otherwise within last 30 days
    const isToday = Math.random() < 0.3
    const date = new Date()
    if (!isToday) {
        date.setDate(date.getDate() - Math.floor(Math.random() * 30))
    }
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60))
    const time = date.toISOString().replace('T', ' ').substring(0, 19)
    
    alarms.push({
      id: `ALM-${Date.now()}-${i}`,
      roomId: room.id,
      roomName: room.name,
      deviceId: `DEV-${room.id}-${Math.floor(Math.random() * 5)}`, // Mock device ID
      deviceName: `${room.name}-设备`,
      category: alarmConfig.category as AlarmCategory,
      level: alarmConfig.level as any,
      type: alarmConfig.type,
      message: `${room.name} 监测到 ${alarmConfig.label}`,
      value: Mock.Random.float(10, 100, 1, 2),
      time: time,
      status: status as any,
      snapshotUrl: ['ai', 'security'].includes(alarmConfig.category) ? `https://via.placeholder.com/300x200?text=${alarmConfig.label}` : undefined
    })
  }
  
  // Sort by time desc
  return alarms.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
}

// 生成工单数据
const generateWorkOrders = (): WorkOrder[] => {
  const workOrders: WorkOrder[] = []
  const types: WorkOrder['type'][] = ['repair', 'maintenance', 'inspection', 'emergency']
  const statuses: WorkOrder['status'][] = ['pending', 'assigned', 'in-progress', 'completed', 'cancelled']
  const priorities: WorkOrder['priority'][] = ['low', 'medium', 'high', 'urgent']
  const assignees = ['张三', '李四', '王五', '赵六', '钱七']

  for (let i = 1; i <= 50; i++) {
    const status = statuses[i % statuses.length]!
    const workOrderType = types[i % types.length]!
    const priority = priorities[i % priorities.length]!
    const assignee = assignees[i % assignees.length]!
    const room = rooms[Math.floor(Math.random() * rooms.length)]!
    
    // Create time within last 7 days
    const createDate = new Date()
    createDate.setDate(createDate.getDate() - Math.floor(Math.random() * 7))
    const createTime = createDate.toISOString()

    // Deadline is 24-72 hours after creation
    const deadlineDate = new Date(createDate)
    deadlineDate.setHours(deadlineDate.getHours() + 24 + Math.floor(Math.random() * 48))
    const deadline = deadlineDate.toISOString()

    workOrders.push({
      id: `WO-${String(i).padStart(5, '0')}`,
      title: `${workOrderType === 'repair' ? '设备维修' :
              workOrderType === 'maintenance' ? '定期保养' :
              workOrderType === 'inspection' ? '巡检任务' : '紧急处理'} - ${room.name}`,
      type: workOrderType,
      deviceId: `DEV-${String(Mock.Random.integer(1, 24)).padStart(4, '0')}`,
      deviceName: `设备-${Mock.Random.integer(1, 24)}`,
      roomName: room.name,
      deadline: deadline,
      description: `${Mock.Random.cparagraph(1, 3)}`,
      status,
      priority,
      assignee,
      createTime,
      updateTime: createTime,
      completeTime: status === 'completed' ? Mock.Random.datetime('yyyy-MM-dd HH:mm:ss') : undefined
    })
  }
  return workOrders.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
}

// 生成统计数据
const generateStatistics = (devices: Device[], alarms: Alarm[], workOrders: WorkOrder[]): Statistics => {
  return {
    totalDevices: devices.length,
    onlineDevices: devices.filter(d => d.status === 'online').length,
    offlineDevices: devices.filter(d => d.status === 'offline').length,
    warningDevices: devices.filter(d => d.status === 'warning').length,
    alarmDevices: devices.filter(d => d.status === 'alarm').length,
    totalAlarms: alarms.length,
    criticalAlarms: alarms.filter(a => a.level === 'critical').length,
    warningAlarms: alarms.filter(a => a.level === 'warning').length,
    infoAlarms: alarms.filter(a => a.level === 'info').length,
    totalWorkOrders: workOrders.length,
    pendingWorkOrders: workOrders.filter(w => w.status === 'pending').length,
    completedWorkOrders: workOrders.filter(w => w.status === 'completed').length
  }
}

let devices = generateDevices()
let alarms = generateAlarms()
let workOrders = generateWorkOrders()
let statistics = generateStatistics(devices, alarms, workOrders)

// Mock API
Mock.mock('/api/rooms', 'get', { code: 200, data: rooms, message: 'success' })
Mock.mock('/api/devices', 'get', { code: 200, data: devices, message: 'success' })
Mock.mock('/api/alarms', 'get', { code: 200, data: alarms, message: 'success' })
Mock.mock('/api/workorders', 'get', { code: 200, data: workOrders, message: 'success' })
Mock.mock('/api/statistics', 'get', { code: 200, data: statistics, message: 'success' })

// 生成两票数据
const generateTickets = () => {
  const tickets = []
  const workTasks = ['1#主变更换硅胶', '10kV母线检修', '低压开关柜清扫', '更换2#电容器']
  const opTasks = ['10kV I段母线由运行转检修', '1#变压器停电操作', '倒闸操作']
  
  for (let i = 1; i <= 30; i++) {
    const isOp = Math.random() > 0.6
    const category = isOp ? 'operation' : (Math.random() > 0.5 ? 'work_1' : 'work_2')
    const room = rooms[Math.floor(Math.random() * rooms.length)]!
    const statusList = ['draft', 'audit', 'permit', 'executing', 'finished']
    const status = statusList[Math.floor(Math.random() * statusList.length)] as any
    
    // Step mapping
    const stepMap: Record<string, string> = {
        'draft': '草稿拟定',
        'audit': '待签发',
        'permit': '待许可',
        'executing': '作业中',
        'finished': '已终结'
    }

    tickets.push({
      id: `T-${i}`,
      no: `${category === 'operation' ? 'CZ' : 'GZ'}-2025${String(Math.floor(Math.random()*12)+1).padStart(2,'0')}${String(i).padStart(2,'0')}`,
      category,
      stationName: room.name,
      task: isOp ? opTasks[i % opTasks.length] : workTasks[i % workTasks.length],
      status,
      currentStep: stepMap[status],
      leader: Mock.Random.cname(),
      guardian: isOp ? Mock.Random.cname() : undefined,
      startTime: Mock.Random.datetime(),
      endTime: Mock.Random.datetime(),
      createTime: Mock.Random.datetime()
    })
  }
  return tickets
}

const tickets = generateTickets()
Mock.mock('/api/tickets', 'get', { code: 200, data: tickets, message: 'success' })

// Helper to update data (optional)
export const updateDeviceData = () => {
    // Refresh logic
}

// Patch window.fetch to use XMLHttpRequest for /api/ requests so Mock.js can intercept them
const originalFetch = window.fetch
window.fetch = async (url, options) => {
  if (typeof url === 'string' && url.startsWith('/api/')) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open(options?.method || 'GET', url)
      
      // Set headers
      if (options?.headers) {
        const headers = options.headers as Record<string, string>
        for (const key in headers) {
          xhr.setRequestHeader(key, headers[key]!)
        }
      }

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          const response = {
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            statusText: xhr.statusText,
            headers: new Headers(), // Mock headers if needed
            json: async () => JSON.parse(xhr.responseText),
            text: async () => xhr.responseText,
            blob: async () => new Blob([xhr.response]),
            formData: async () => new FormData()
          }
          resolve(response as unknown as Response)
        }
      }
      
      xhr.onerror = () => reject(new TypeError('Network request failed'))
      xhr.send(options?.body as any)
    })
  }
  return originalFetch(url, options)
}

export { devices, alarms, workOrders, statistics, rooms }