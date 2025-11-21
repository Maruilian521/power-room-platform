import Mock from 'mockjs'
import type { Device, Alarm, WorkOrder, Statistics } from '../types'

// 配置Mock
Mock.setup({
  timeout: '200-600'
})

// 生成设备数据
const generateDevices = (): Device[] => {
  const devices: Device[] = []
  const types: Device['type'][] = ['transformer', 'switch', 'sensor', 'breaker', 'capacitor']
  const statuses: Device['status'][] = ['online', 'online', 'online', 'warning', 'offline']
  const locations = ['A区1号配电室', 'A区2号配电室', 'B区1号配电室', 'B区2号配电室', 'C区配电室']

  for (let i = 1; i <= 24; i++) {
    const deviceType = types[i % types.length]!
    const deviceStatus = statuses[i % statuses.length]!
    const deviceLocation = locations[i % locations.length]!

    devices.push({
      id: `DEV-${String(i).padStart(4, '0')}`,
      name: `${deviceType === 'transformer' ? '变压器' :
              deviceType === 'switch' ? '开关柜' :
              deviceType === 'sensor' ? '传感器' :
              deviceType === 'breaker' ? '断路器' : '电容器'}-${i}`,
      type: deviceType,
      status: deviceStatus,
      location: deviceLocation,
      voltage: Mock.Random.float(380, 420, 1, 2),
      current: Mock.Random.float(10, 200, 1, 2),
      power: Mock.Random.float(50, 500, 1, 2),
      temperature: Mock.Random.float(25, 75, 1, 2),
      lastUpdate: new Date().toISOString()
    })
  }
  return devices
}

// 生成告警数据
const generateAlarms = (): Alarm[] => {
  const alarms: Alarm[] = []
  const levels: Alarm['level'][] = ['critical', 'warning', 'info']
  const types = ['温度异常', '电压异常', '电流异常', '设备离线', '功率异常', '通信故障']
  const statuses: Alarm['status'][] = ['pending', 'processing', 'resolved']

  for (let i = 1; i <= 50; i++) {
    const level = levels[i % levels.length]!
    const alarmType = types[i % types.length]!
    const alarmStatus = statuses[i % statuses.length]!

    alarms.push({
      id: `ALARM-${String(i).padStart(5, '0')}`,
      deviceId: `DEV-${String(Mock.Random.integer(1, 24)).padStart(4, '0')}`,
      deviceName: `设备-${Mock.Random.integer(1, 24)}`,
      level,
      type: alarmType,
      message: `${alarmType}: ${level === 'critical' ? '严重告警，请立即处理' :
                level === 'warning' ? '告警预警，请关注' : '一般信息'}`,
      time: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
      status: alarmStatus
    })
  }
  return alarms.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
}

// 生成工单数据
const generateWorkOrders = (): WorkOrder[] => {
  const workOrders: WorkOrder[] = []
  const types: WorkOrder['type'][] = ['repair', 'maintenance', 'inspection', 'emergency']
  const statuses: WorkOrder['status'][] = ['pending', 'assigned', 'in-progress', 'completed', 'cancelled']
  const priorities: WorkOrder['priority'][] = ['low', 'medium', 'high', 'urgent']
  const assignees = ['张三', '李四', '王五', '赵六', '钱七']

  for (let i = 1; i <= 30; i++) {
    const status = statuses[i % statuses.length]!
    const workOrderType = types[i % types.length]!
    const priority = priorities[i % priorities.length]!
    const assignee = assignees[i % assignees.length]!
    const createTime = Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')

    workOrders.push({
      id: `WO-${String(i).padStart(5, '0')}`,
      title: `${workOrderType === 'repair' ? '设备维修' :
              workOrderType === 'maintenance' ? '定期保养' :
              workOrderType === 'inspection' ? '巡检任务' : '紧急处理'}工单-${i}`,
      type: workOrderType,
      deviceId: `DEV-${String(Mock.Random.integer(1, 24)).padStart(4, '0')}`,
      deviceName: `设备-${Mock.Random.integer(1, 24)}`,
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

// 生成初始数据
let devices = generateDevices()
let alarms = generateAlarms()
let workOrders = generateWorkOrders()
let statistics = generateStatistics(devices, alarms, workOrders)

// Mock API接口
Mock.mock('/api/devices', 'get', () => {
  return {
    code: 200,
    data: devices,
    message: 'success'
  }
})

Mock.mock(/\/api\/devices\/\w+/, 'get', (options) => {
  const id = options.url.split('/').pop()
  const device = devices.find(d => d.id === id)
  return {
    code: 200,
    data: device,
    message: 'success'
  }
})

Mock.mock('/api/alarms', 'get', () => {
  return {
    code: 200,
    data: alarms,
    message: 'success'
  }
})

Mock.mock('/api/workorders', 'get', () => {
  return {
    code: 200,
    data: workOrders,
    message: 'success'
  }
})

Mock.mock('/api/statistics', 'get', () => {
  return {
    code: 200,
    data: statistics,
    message: 'success'
  }
})

Mock.mock('/api/realtime', 'get', () => {
  const now = new Date()
  const data = {
    timestamp: now.toISOString(),
    voltage: [Mock.Random.float(380, 420, 1, 2), Mock.Random.float(380, 420, 1, 2), Mock.Random.float(380, 420, 1, 2)],
    current: [Mock.Random.float(50, 200, 1, 2), Mock.Random.float(50, 200, 1, 2), Mock.Random.float(50, 200, 1, 2)],
    power: [Mock.Random.float(100, 500, 1, 2), Mock.Random.float(100, 500, 1, 2), Mock.Random.float(100, 500, 1, 2)],
    temperature: [Mock.Random.float(30, 70, 1, 2), Mock.Random.float(30, 70, 1, 2), Mock.Random.float(30, 70, 1, 2)]
  }
  return {
    code: 200,
    data,
    message: 'success'
  }
})

// 更新设备状态的Mock接口
Mock.mock(/\/api\/devices\/\w+\/status/, 'put', (options) => {
  const id = options.url.split('/')[3]
  const body = JSON.parse(options.body)
  const device = devices.find(d => d.id === id)
  if (device) {
    device.status = body.status
    device.lastUpdate = new Date().toISOString()
  }
  return {
    code: 200,
    data: device,
    message: 'success'
  }
})

// 更新工单状态
Mock.mock(/\/api\/workorders\/\w+\/status/, 'put', (options) => {
  const id = options.url.split('/')[3]
  const body = JSON.parse(options.body)
  const workOrder = workOrders.find(w => w.id === id)
  if (workOrder) {
    workOrder.status = body.status
    workOrder.updateTime = new Date().toISOString()
    if (body.status === 'completed') {
      workOrder.completeTime = new Date().toISOString()
    }
  }
  return {
    code: 200,
    data: workOrder,
    message: 'success'
  }
})

// 定期更新设备数据
export const updateDeviceData = () => {
  devices.forEach(device => {
    if (device.status === 'online' || device.status === 'warning') {
      device.voltage = Mock.Random.float(380, 420, 1, 2)
      device.current = Mock.Random.float(10, 200, 1, 2)
      device.power = Mock.Random.float(50, 500, 1, 2)
      device.temperature = Mock.Random.float(25, 75, 1, 2)
      device.lastUpdate = new Date().toISOString()
    }
  })
  statistics = generateStatistics(devices, alarms, workOrders)
}

export { devices, alarms, workOrders, statistics }
