<template>
  <el-dialog
    v-model="dialogVisible"
    title="TACTICAL PTZ CONTROL"
    width="400px"
    :close-on-click-modal="false"
    align-center
    class="sc2-dialog ptz-dialog"
    :show-close="false"
  >
    <template #header>
        <div class="sc2-dialog-header">
            <span class="title">TACTICAL PTZ CONTROL</span>
            <div class="close-btn" @click="dialogVisible = false">
                <el-icon><Close /></el-icon>
            </div>
        </div>
    </template>

    <div v-if="camera" class="ptz-control-panel">
      <!-- Target Info -->
      <div class="target-readout">
        <div class="label">TARGET_LOCK:</div>
        <div class="value">{{ camera.label }}</div>
        <div class="signal-bar">
            <div class="bar-fill"></div>
        </div>
      </div>

      <!-- Directional Command -->
      <div class="command-interface">
        <div class="d-pad-container">
            <div class="d-pad">
                <!-- Diagonals -->
                <div class="d-btn corner tl" @mousedown="startControl('leftUp')" @mouseup="stopControl"><div class="arrow"></div></div>
                <div class="d-btn corner tr" @mousedown="startControl('rightUp')" @mouseup="stopControl"><div class="arrow"></div></div>
                <div class="d-btn corner bl" @mousedown="startControl('leftDown')" @mouseup="stopControl"><div class="arrow"></div></div>
                <div class="d-btn corner br" @mousedown="startControl('rightDown')" @mouseup="stopControl"><div class="arrow"></div></div>
                
                <!-- Cardinals -->
                <div class="d-btn up" @mousedown="startControl('up')" @mouseup="stopControl"><el-icon><CaretTop /></el-icon></div>
                <div class="d-btn left" @mousedown="startControl('left')" @mouseup="stopControl"><el-icon><CaretLeft /></el-icon></div>
                <div class="d-btn right" @mousedown="startControl('right')" @mouseup="stopControl"><el-icon><CaretRight /></el-icon></div>
                <div class="d-btn down" @mousedown="startControl('down')" @mouseup="stopControl"><el-icon><CaretBottom /></el-icon></div>
                
                <!-- Center Stop -->
                <div class="d-btn center" @click="handleStop"><div class="stop-icon"></div></div>
            </div>
        </div>

        <div class="zoom-slider-group">
            <div class="slider-row">
                <span class="label">ZOOM</span>
                <div class="zoom-btns">
                    <el-button class="sc2-btn small" @mousedown="startControl('zoomIn')" @mouseup="stopControl">+</el-button>
                    <el-button class="sc2-btn small" @mousedown="startControl('zoomOut')" @mouseup="stopControl">-</el-button>
                </div>
            </div>
            <div class="slider-row">
                <span class="label">FOCUS</span>
                <div class="zoom-btns">
                    <el-button class="sc2-btn small" @mousedown="startControl('focusIn')" @mouseup="stopControl">+</el-button>
                    <el-button class="sc2-btn small" @mousedown="startControl('focusOut')" @mouseup="stopControl">-</el-button>
                </div>
            </div>
            <div class="slider-row">
                <span class="label">SPEED</span>
                <el-slider v-model="speed" :min="1" :max="10" size="small" class="sc2-slider" />
            </div>
        </div>
      </div>

      <div class="action-grid">
        <el-button class="sc2-btn full" @click="handleAutoScan">AUTO SCAN</el-button>
        <el-button class="sc2-btn full" @click="handleReset">RESET POS</el-button>
        <el-button class="sc2-btn full" @click="savePreset">SAVE PRESET</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Close, CaretTop, CaretBottom, CaretLeft, CaretRight
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface Camera {
  id: string
  label: string
  streamUrl: string
  supportPTZ: boolean
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

const currentCommand = ref('')
const speed = ref(5)

const startControl = (command: string) => {
  currentCommand.value = command
  emit('control', command, { speed: speed.value })
}

const stopControl = () => {
  if (currentCommand.value) {
    emit('control', 'stop', {})
    currentCommand.value = ''
  }
}

const handleStop = () => {
  stopControl()
  ElMessage.info('HOLD POSITION')
}

const handleAutoScan = () => {
  emit('control', 'autoScan', {})
  ElMessage.success('SCANNING AREA...')
}

const handleReset = () => {
  emit('control', 'reset', {})
}

const savePreset = () => {
    ElMessage.success('COORDINATES SAVED')
}

watch(dialogVisible, (val) => {
  if (!val) stopControl()
})
</script>

<style scoped>
/* SC2 Dialog Header Override */
.sc2-dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background: rgba(0, 240, 255, 0.05);
    border-bottom: 1px solid rgba(0, 240, 255, 0.2);
}
.sc2-dialog-header .title {
    font-family: 'Orbitron', sans-serif;
    color: var(--tech-primary);
    letter-spacing: 1px;
}
.close-btn {
    cursor: pointer;
    color: var(--text-sub);
}
.close-btn:hover { color: var(--tech-primary); }

.ptz-control-panel {
    padding: 20px;
    background: #0b1325;
}

/* Target Info */
.target-readout {
    margin-bottom: 20px;
    border: 1px solid rgba(0, 240, 255, 0.1);
    padding: 10px;
    background: rgba(0, 0, 0, 0.3);
}
.target-readout .label { font-size: 10px; color: var(--tech-secondary); }
.target-readout .value { font-family: 'Rajdhani', sans-serif; font-size: 16px; color: var(--text-bright); font-weight: bold; }
.signal-bar { height: 2px; background: #333; margin-top: 5px; width: 100%; }
.bar-fill { width: 80%; height: 100%; background: var(--status-success); box-shadow: 0 0 5px var(--status-success); }

/* Command Interface */
.command-interface {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
}

/* D-Pad Styling - Mechanical Look */
.d-pad-container {
    position: relative;
    width: 140px;
    height: 140px;
    background: radial-gradient(circle, #1a2635 0%, #05080a 70%);
    border-radius: 50%;
    border: 2px solid rgba(0, 240, 255, 0.2);
    box-shadow: inset 0 0 20px rgba(0,0,0,0.8);
}

.d-pad {
    position: relative;
    width: 100%;
    height: 100%;
}

.d-btn {
    position: absolute;
    background: rgba(0, 240, 255, 0.1);
    border: 1px solid rgba(0, 240, 255, 0.3);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--tech-primary);
    transition: all 0.1s;
}
.d-btn:active { background: var(--tech-primary); color: #000; box-shadow: 0 0 10px var(--tech-primary); }

.d-btn.up { top: 5px; left: 50px; width: 40px; height: 30px; border-radius: 4px 4px 0 0; }
.d-btn.down { bottom: 5px; left: 50px; width: 40px; height: 30px; border-radius: 0 0 4px 4px; }
.d-btn.left { left: 5px; top: 50px; width: 30px; height: 40px; border-radius: 4px 0 0 4px; }
.d-btn.right { right: 5px; top: 50px; width: 30px; height: 40px; border-radius: 0 4px 4px 0; }
.d-btn.center { 
    top: 50px; left: 50px; width: 40px; height: 40px; 
    background: rgba(255, 46, 99, 0.1); border-color: var(--status-danger); border-radius: 50%;
}
.d-btn.center .stop-icon { width: 12px; height: 12px; background: var(--status-danger); }

/* Corner Diagonals */
.d-btn.corner { width: 25px; height: 25px; border-radius: 50%; border: none; background: rgba(255,255,255,0.05); }
.d-btn.tl { top: 20px; left: 20px; }
.d-btn.tr { top: 20px; right: 20px; }
.d-btn.bl { bottom: 20px; left: 20px; }
.d-btn.br { bottom: 20px; right: 20px; }

/* Sliders & Zooms */
.zoom-slider-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 10px;
}

.slider-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.slider-row .label { font-size: 10px; color: var(--text-sub); width: 40px; }
.zoom-btns { display: flex; gap: 2px; }

.sc2-btn {
    background: rgba(0, 240, 255, 0.1);
    border: 1px solid rgba(0, 240, 255, 0.3);
    color: var(--tech-primary);
    font-family: 'Rajdhani', sans-serif;
    font-weight: bold;
}
.sc2-btn:hover {
    background: var(--tech-primary);
    color: #000;
    box-shadow: 0 0 10px var(--tech-primary);
}
.sc2-btn.small {
    padding: 5px 10px;
    min-height: 24px;
}
.sc2-btn.full {
    width: 100%;
    margin: 0 !important;
}

.action-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
    margin-top: 10px;
}

:deep(.sc2-slider .el-slider__bar) { background-color: var(--tech-primary); }
:deep(.sc2-slider .el-slider__button) { border-color: var(--tech-primary); }
</style>