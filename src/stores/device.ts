import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Device, Alarm, WorkOrder, Statistics, RealtimeData } from '../types'

export const useDeviceStore = defineStore('device', () => {
  // 状态
  const devices = ref<Device[]>([])
  const alarms = ref<Alarm[]>([])
  const workOrders = ref<WorkOrder[]>([])
  const statistics = ref<Statistics>({
    totalDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    warningDevices: 0,
    alarmDevices: 0,
    totalAlarms: 0,
    criticalAlarms: 0,
    warningAlarms: 0,
    infoAlarms: 0,
    totalWorkOrders: 0,
    pendingWorkOrders: 0,
    completedWorkOrders: 0
  })
  const realtimeData = ref<RealtimeData>({
    timestamp: '',
    voltage: [],
    current: [],
    power: [],
    temperature: []
  })
  const loading = ref(false)

  // 获取设备列表
  const fetchDevices = async () => {
    loading.value = true
    try {
      const response = await fetch('/api/devices')
      const result = await response.json()
      devices.value = result.data
    } catch (error) {
      console.error('获取设备列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 获取单个设备
  const fetchDevice = async (id: string) => {
    try {
      const response = await fetch(`/api/devices/${id}`)
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('获取设备详情失败:', error)
      return null
    }
  }

  // 获取告警列表
  const fetchAlarms = async () => {
    loading.value = true
    try {
      const response = await fetch('/api/alarms')
      const result = await response.json()
      alarms.value = result.data
    } catch (error) {
      console.error('获取告警列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 获取工单列表
  const fetchWorkOrders = async () => {
    loading.value = true
    try {
      const response = await fetch('/api/workorders')
      const result = await response.json()
      workOrders.value = result.data
    } catch (error) {
      console.error('获取工单列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 获取统计数据
  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/statistics')
      const result = await response.json()
      statistics.value = result.data
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }

  // 获取实时数据
  const fetchRealtimeData = async () => {
    try {
      const response = await fetch('/api/realtime')
      const result = await response.json()
      realtimeData.value = result.data
    } catch (error) {
      console.error('获取实时数据失败:', error)
    }
  }

  // 更新设备状态
  const updateDeviceStatus = async (id: string, status: Device['status']) => {
    try {
      const response = await fetch(`/api/devices/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })
      const result = await response.json()
      if (result.code === 200) {
        await fetchDevices()
        await fetchStatistics()
      }
      return result.data
    } catch (error) {
      console.error('更新设备状态失败:', error)
      return null
    }
  }

  // 更新工单状态
  const updateWorkOrderStatus = async (id: string, status: WorkOrder['status']) => {
    try {
      const response = await fetch(`/api/workorders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })
      const result = await response.json()
      if (result.code === 200) {
        await fetchWorkOrders()
        await fetchStatistics()
      }
      return result.data
    } catch (error) {
      console.error('更新工单状态失败:', error)
      return null
    }
  }

  return {
    devices,
    alarms,
    workOrders,
    statistics,
    realtimeData,
    loading,
    fetchDevices,
    fetchDevice,
    fetchAlarms,
    fetchWorkOrders,
    fetchStatistics,
    fetchRealtimeData,
    updateDeviceStatus,
    updateWorkOrderStatus
  }
})
