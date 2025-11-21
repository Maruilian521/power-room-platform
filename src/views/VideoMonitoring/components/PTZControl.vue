<template>
  <el-dialog
    v-model="dialogVisible"
    title="云台控制 (PTZ)"
    width="500px"
    :close-on-click-modal="false"
    align-center
    class="ptz-dialog"
  >
    <div v-if="camera" class="ptz-control-panel">
      <!-- 摄像头信息 -->
      <div class="camera-header">
        <el-icon class="camera-icon"><VideoCamera /></el-icon>
        <div class="camera-info">
          <h3>{{ camera.label }}</h3>
          <p>{{ camera.streamUrl }}</p>
        </div>
      </div>

      <!-- 方向控制 -->
      <div class="direction-control">
        <div class="control-grid">
          <!-- 上左 -->
          <div class="control-btn corner" @mousedown="startControl('leftUp')" @mouseup="stopControl" @mouseleave="stopControl">
            <el-icon><TopLeft /></el-icon>
          </div>

          <!-- 上 -->
          <div class="control-btn" @mousedown="startControl('up')" @mouseup="stopControl" @mouseleave="stopControl">
            <el-icon><Top /></el-icon>
          </div>

          <!-- 上右 -->
          <div class="control-btn corner" @mousedown="startControl('rightUp')" @mouseup="stopControl" @mouseleave="stopControl">
            <el-icon><TopRight /></el-icon>
          </div>

          <!-- 左 -->
          <div class="control-btn" @mousedown="startControl('left')" @mouseup="stopControl" @mouseleave="stopControl">
            <el-icon><Back /></el-icon>
          </div>

          <!-- 中心/停止 -->
          <div class="control-btn center" @click="handleStop">
            <el-icon><VideoPause /></el-icon>
          </div>

          <!-- 右 -->
          <div class="control-btn" @mousedown="startControl('right')" @mouseup="stopControl" @mouseleave="stopControl">
            <el-icon><Right /></el-icon>
          </div>

          <!-- 下左 -->
          <div class="control-btn corner" @mousedown="startControl('leftDown')" @mouseup="stopControl" @mouseleave="stopControl">
            <el-icon><BottomLeft /></el-icon>
          </div>

          <!-- 下 -->
          <div class="control-btn" @mousedown="startControl('down')" @mouseup="stopControl" @mouseleave="stopControl">
            <el-icon><Bottom /></el-icon>
          </div>

          <!-- 下右 -->
          <div class="control-btn corner" @mousedown="startControl('rightDown')" @mouseup="stopControl" @mouseleave="stopControl">
            <el-icon><BottomRight /></el-icon>
          </div>
        </div>
      </div>

      <!-- 缩放控制 -->
      <div class="zoom-control">
        <div class="zoom-group">
          <span class="control-label">焦距</span>
          <div class="zoom-buttons">
            <el-button @mousedown="startControl('zoomIn')" @mouseup="stopControl" @mouseleave="stopControl">
              <el-icon><ZoomIn /></el-icon>
              拉近
            </el-button>
            <el-button @mousedown="startControl('zoomOut')" @mouseup="stopControl" @mouseleave="stopControl">
              <el-icon><ZoomOut /></el-icon>
              拉远
            </el-button>
          </div>
        </div>

        <div class="zoom-group">
          <span class="control-label">聚焦</span>
          <div class="zoom-buttons">
            <el-button @mousedown="startControl('focusIn')" @mouseup="stopControl" @mouseleave="stopControl">
              <el-icon><Aim /></el-icon>
              聚焦+
            </el-button>
            <el-button @mousedown="startControl('focusOut')" @mouseup="stopControl" @mouseleave="stopControl">
              <el-icon><Aim /></el-icon>
              聚焦-
            </el-button>
          </div>
        </div>

        <div class="zoom-group">
          <span class="control-label">光圈</span>
          <div class="zoom-buttons">
            <el-button @mousedown="startControl('irisOpen')" @mouseup="stopControl" @mouseleave="stopControl">
              <el-icon><Sunny /></el-icon>
              开大
            </el-button>
            <el-button @mousedown="startControl('irisClose')" @mouseup="stopControl" @mouseleave="stopControl">
              <el-icon><Moon /></el-icon>
              缩小
            </el-button>
          </div>
        </div>
      </div>

      <!-- 速度控制 -->
      <div class="speed-control">
        <span class="control-label">移动速度</span>
        <el-slider v-model="speed" :min="1" :max="10" :marks="speedMarks" show-stops />
      </div>

      <!-- 预置位 -->
      <div class="preset-control">
        <div class="preset-header">
          <span class="control-label">预置位</span>
          <el-button size="small" text @click="showPresetDialog = true">
            <el-icon><Setting /></el-icon>
            管理
          </el-button>
        </div>

        <div class="preset-list">
          <el-button
            v-for="preset in presets"
            :key="preset.id"
            size="small"
            @click="gotoPreset(preset)"
          >
            {{ preset.name }}
          </el-button>
          <el-button size="small" type="primary" plain @click="savePreset">
            <el-icon><Plus /></el-icon>
            保存当前位置
          </el-button>
        </div>
      </div>

      <!-- 快捷功能 -->
      <div class="quick-actions">
        <el-button @click="handleAutoScan">
          <el-icon><Refresh /></el-icon>
          自动扫描
        </el-button>
        <el-button @click="handleAutoFocus">
          <el-icon><View /></el-icon>
          自动聚焦
        </el-button>
        <el-button @click="handleReset">
          <el-icon><RefreshLeft /></el-icon>
          复位
        </el-button>
      </div>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>

  <!-- 预置位管理对话框 -->
  <el-dialog
    v-model="showPresetDialog"
    title="预置位管理"
    width="400px"
    append-to-body
  >
    <el-table :data="presets" size="small">
      <el-table-column prop="name" label="名称" />
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button size="small" text type="danger" @click="deletePreset(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <el-button @click="showPresetDialog = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  VideoCamera,
  TopLeft,
  Top,
  TopRight,
  Back,
  Right,
  Bottom,
  BottomLeft,
  BottomRight,
  VideoPause,
  ZoomIn,
  ZoomOut,
  Aim,
  Sunny,
  Moon,
  Setting,
  Plus,
  Refresh,
  View,
  RefreshLeft
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Camera {
  id: string
  label: string
  streamUrl: string
  supportPTZ: boolean
}

interface Preset {
  id: number
  name: string
  pan: number
  tilt: number
  zoom: number
}

interface Props {
  visible: boolean
  camera: Camera | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'control', command: string, params: any): void
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 控制状态
const currentCommand = ref('')
const speed = ref(5)
const showPresetDialog = ref(false)

// 速度标记
const speedMarks = {
  1: '慢',
  5: '中',
  10: '快'
}

// 预置位列表
const presets = ref<Preset[]>([
  { id: 1, name: '主进线柜', pan: 0, tilt: 0, zoom: 1 },
  { id: 2, name: '变压器区', pan: 90, tilt: 0, zoom: 2 },
  { id: 3, name: '配电柜全景', pan: 180, tilt: 0, zoom: 1 }
])

// 开始控制
const startControl = (command: string) => {
  currentCommand.value = command
  const params = {
    speed: speed.value,
    command: command
  }

  emit('control', command, params)
  console.log('PTZ Control Start:', command, params)
}

// 停止控制
const stopControl = () => {
  if (currentCommand.value) {
    emit('control', 'stop', { command: currentCommand.value })
    console.log('PTZ Control Stop:', currentCommand.value)
    currentCommand.value = ''
  }
}

// 停止按钮
const handleStop = () => {
  stopControl()
  ElMessage.info('已停止云台运动')
}

// 跳转到预置位
const gotoPreset = (preset: Preset) => {
  emit('control', 'gotoPreset', preset)
  ElMessage.success(`正在跳转到预置位: ${preset.name}`)
}

// 保存预置位
const savePreset = () => {
  ElMessageBox.prompt('请输入预置位名称', '保存预置位', {
    confirmButtonText: '保存',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '名称不能为空'
  }).then(({ value }) => {
    const newPreset: Preset = {
      id: presets.value.length + 1,
      name: value,
      pan: Math.random() * 360,
      tilt: Math.random() * 90,
      zoom: Math.random() * 5
    }
    presets.value.push(newPreset)
    ElMessage.success('预置位保存成功')
  }).catch(() => {
    // 取消操作
  })
}

// 删除预置位
const deletePreset = (preset: Preset) => {
  ElMessageBox.confirm(`确定要删除预置位 "${preset.name}" 吗?`, '确认删除', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = presets.value.findIndex(p => p.id === preset.id)
    if (index !== -1) {
      presets.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 自动扫描
const handleAutoScan = () => {
  emit('control', 'autoScan', {})
  ElMessage.success('已启动自动扫描')
}

// 自动聚焦
const handleAutoFocus = () => {
  emit('control', 'autoFocus', {})
  ElMessage.success('正在自动聚焦')
}

// 复位
const handleReset = () => {
  emit('control', 'reset', {})
  ElMessage.success('云台正在复位')
}

// 监听对话框关闭，停止所有控制
watch(dialogVisible, (val) => {
  if (!val) {
    stopControl()
  }
})
</script>

<style scoped>
.ptz-control-panel {
  padding: 20px;
}

/* 摄像头信息头部 */
.camera-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  margin-bottom: 24px;
}

.camera-icon {
  font-size: 32px;
  color: var(--color-success);
}

.camera-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.camera-info p {
  margin: 0;
  font-size: 12px;
  color: var(--text-tertiary);
  font-family: 'Courier New', monospace;
}

/* 方向控制网格 */
.direction-control {
  margin-bottom: 24px;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  max-width: 280px;
  margin: 0 auto;
}

.control-btn {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-bg);
  border: 2px solid var(--glass-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  font-size: 24px;
  color: var(--text-secondary);
}

.control-btn:hover {
  background: rgba(var(--el-color-primary-rgb), 0.1);
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: scale(1.05);
}

.control-btn:active {
  background: rgba(var(--el-color-primary-rgb), 0.2);
  transform: scale(0.95);
}

.control-btn.center {
  background: rgba(var(--el-color-danger-rgb), 0.1);
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.control-btn.center:hover {
  background: rgba(var(--el-color-danger-rgb), 0.2);
}

.control-btn.corner {
  opacity: 0.7;
}

/* 缩放控制 */
.zoom-control {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.zoom-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 60px;
}

.zoom-buttons {
  flex: 1;
  display: flex;
  gap: 8px;
}

.zoom-buttons .el-button {
  flex: 1;
}

/* 速度控制 */
.speed-control {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
}

.speed-control .control-label {
  display: block;
  margin-bottom: 12px;
}

/* 预置位 */
.preset-control {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
}

.preset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.preset-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-list .el-button {
  flex: 0 0 calc(50% - 4px);
}

/* 快捷功能 */
.quick-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-actions .el-button {
  flex: 1;
  min-width: 120px;
}

/* 对话框样式 */
:deep(.ptz-dialog) {
  border-radius: 12px;
}

:deep(.ptz-dialog .el-dialog__header) {
  background: var(--glass-bg);
  border-bottom: 1px solid var(--glass-border);
}

:deep(.ptz-dialog .el-dialog__body) {
  padding: 0;
}
</style>
