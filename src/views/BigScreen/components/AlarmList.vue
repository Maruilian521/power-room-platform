<template>
  <div class="alarm-list-container">
    <div class="section-title">
      <div class="title-bar"></div>
      <span>实时告警</span>
      <div class="alarm-count">
        <span class="count-badge danger">{{ alarms.filter(a => a.level === 'critical').length }}</span>
        <span class="count-badge warning">{{ alarms.filter(a => a.level === 'warning').length }}</span>
      </div>
    </div>

    <div class="alarm-list">
      <div
        v-for="alarm in alarms"
        :key="alarm.id"
        :class="['alarm-item', `level-${alarm.level}`]"
      >
        <div class="alarm-icon">
          <span v-if="alarm.level === 'critical'">🔴</span>
          <span v-else-if="alarm.level === 'warning'">🟡</span>
          <span v-else>🔵</span>
        </div>
        <div class="alarm-content">
          <div class="alarm-header">
            <span class="alarm-device">{{ alarm.device }}</span>
            <span class="alarm-time">{{ alarm.time }}</span>
          </div>
          <div class="alarm-message">{{ alarm.message }}</div>
          <div class="alarm-value" v-if="alarm.value">
            当前值: {{ alarm.value }} (阈值: {{ alarm.threshold }})
          </div>
        </div>
      </div>

      <div v-if="alarms.length === 0" class="no-alarm">
        <span class="no-alarm-icon">✅</span>
        <span class="no-alarm-text">暂无告警</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Alarm {
  id: number
  level: 'critical' | 'warning' | 'info'
  device: string
  message: string
  time: string
  value?: string
  threshold?: string
}

const alarms = ref<Alarm[]>([
  {
    id: 1,
    level: 'critical',
    device: '主变压器',
    message: '温度过高告警',
    time: '2分钟前',
    value: '85°C',
    threshold: '75°C'
  },
  {
    id: 2,
    level: 'warning',
    device: '低压柜3#',
    message: '电流偏高',
    time: '5分钟前',
    value: '1950A',
    threshold: '1800A'
  },
  {
    id: 3,
    level: 'warning',
    device: '环境监测',
    message: '湿度超标',
    time: '10分钟前',
    value: '75%',
    threshold: '70%'
  },
  {
    id: 4,
    level: 'info',
    device: '电容补偿柜',
    message: '自动投切成功',
    time: '15分钟前'
  }
])
</script>

<style scoped>
.alarm-list-container {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(70, 211, 154, 0.05) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  height: 340px;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.title-bar {
  width: 4px;
  height: 18px;
  background: linear-gradient(180deg, #2196f3 0%, #46d39a 100%);
  border-radius: 2px;
  margin-right: 10px;
}

.alarm-count {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.count-badge {
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.count-badge.danger {
  background: rgba(255, 82, 82, 0.2);
  color: #ff5252;
  border: 1px solid rgba(255, 82, 82, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

.count-badge.warning {
  background: rgba(255, 181, 71, 0.2);
  color: #ffb547;
  border: 1px solid rgba(255, 181, 71, 0.3);
}

.alarm-list {
  height: calc(100% - 45px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(33, 150, 243, 0.3) transparent;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alarm-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: rgba(10, 25, 41, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  border-left: 3px solid;
  transition: all 0.3s ease;
}

.alarm-item.level-critical {
  border-left-color: #ff5252;
  animation: alarmBlink 2s ease-in-out infinite;
}

.alarm-item.level-warning {
  border-left-color: #ffb547;
}

.alarm-item.level-info {
  border-left-color: #2196f3;
}

.alarm-item:hover {
  background: rgba(10, 25, 41, 0.6);
  transform: translateX(5px);
}

.alarm-icon {
  flex-shrink: 0;
  font-size: 20px;
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
}

.alarm-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.alarm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alarm-device {
  font-size: 13px;
  font-weight: 600;
  color: #2196f3;
}

.alarm-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.alarm-message {
  font-size: 12px;
  color: #fff;
  line-height: 1.4;
}

.alarm-value {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'DIN Alternate', 'Arial', sans-serif;
}

.no-alarm {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 10px;
}

.no-alarm-icon {
  font-size: 48px;
}

.no-alarm-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes alarmBlink {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(255, 82, 82, 0);
  }
}
</style>
