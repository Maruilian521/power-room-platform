<template>
  <div class="camera-tree">
    <el-tree
      :data="treeData"
      :props="treeProps"
      :filter-node-method="filterNode"
      :expand-on-click-node="false"
      default-expand-all
      highlight-current
      node-key="id"
      ref="treeRef"
      @node-click="handleNodeClick"
    >
      <template #default="{ data }">
        <div
          class="tree-node"
          :class="{
            'is-zone': data.type === 'zone',
            'is-camera': data.type === 'camera',
            'is-selected': data.id === selectedCamera
          }"
          @dblclick="handleNodeDoubleClick(data)"
        >
          <!-- 区域节点 -->
          <template v-if="data.type === 'zone'">
            <el-icon class="node-icon zone-icon"><OfficeBuilding /></el-icon>
            <span class="node-label">{{ data.label }}</span>
            <span class="camera-count">
              {{ getCameraCount(data) }}
            </span>
          </template>

          <!-- 摄像头节点 -->
          <template v-else-if="data.type === 'camera'">
            <el-icon class="node-icon camera-icon" :class="data.status">
              <VideoCamera />
            </el-icon>
            <span class="node-label">{{ data.label }}</span>

            <div class="node-actions">
              <!-- 状态指示器 -->
              <div class="status-indicator" :class="data.status" :title="data.status === 'online' ? '在线' : '离线'"></div>

              <!-- PTZ支持标识 -->
              <el-icon v-if="data.supportPTZ" class="ptz-icon" title="支持云台"><Aim /></el-icon>

              <!-- 右���菜单触发器 -->
              <el-dropdown trigger="click" @command="handleCommand($event, data)">
                <el-icon class="more-icon"><More /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu class="sc2-dropdown-menu">
                    <el-dropdown-item command="play" :disabled="data.status === 'offline'">
                      <el-icon><VideoPlay /></el-icon> 播放
                    </el-dropdown-item>
                    <el-dropdown-item command="ptz" :disabled="!data.supportPTZ || data.status === 'offline'">
                      <el-icon><Aim /></el-icon> 云台控制
                    </el-dropdown-item>
                    <el-dropdown-item command="refresh">
                      <el-icon><Refresh /></el-icon> 刷新状态
                    </el-dropdown-item>
                    <el-dropdown-item command="config" divided>
                      <el-icon><Setting /></el-icon> 配置
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  OfficeBuilding,
  VideoCamera,
  Aim,
  More,
  VideoPlay,
  Refresh,
  Setting
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface TreeNode {
  id: string
  label: string
  type: 'zone' | 'camera'
  status?: 'online' | 'offline'
  supportPTZ?: boolean
  streamUrl?: string
  children?: TreeNode[]
}

interface Props {
  treeData: TreeNode[]
  selectedCamera?: string
}

withDefaults(defineProps<Props>(), {
  selectedCamera: ''
})

const emit = defineEmits<{
  (e: 'camera-click', camera: TreeNode): void
  (e: 'camera-dbclick', camera: TreeNode): void
}>()

const treeRef = ref()

const treeProps = {
  children: 'children',
  label: 'label'
}

// 过滤节点
const filterNode = (value: string, data: TreeNode) => {
  if (!value) return true
  return data.label.toLowerCase().includes(value.toLowerCase())
}

// 获取区域下的摄像头数量
const getCameraCount = (zone: TreeNode) => {
  if (!zone.children) return 0
  const total = zone.children.length
  const online = zone.children.filter(c => c.status === 'online').length
  return `[${online}/${total}]`
}

// 节点点击
const handleNodeClick = (data: TreeNode) => {
  if (data.type === 'camera') {
    emit('camera-click', data)
  }
}

// 节点双击
const handleNodeDoubleClick = (data: TreeNode) => {
  if (data.type === 'camera') {
    emit('camera-dbclick', data)
  }
}

// 右键菜单命令
const handleCommand = (command: string, data: TreeNode) => {
  switch (command) {
    case 'play':
      emit('camera-dbclick', data)
      break
    case 'ptz':
      ElMessage.info(`打开 ${data.label} 的云台控制`)
      // TODO: 触发PTZ控制面板
      break
    case 'refresh':
      ElMessage.success(`已刷新 ${data.label} 状态`)
      break
    case 'config':
      ElMessage.info(`打开 ${data.label} 配置`)
      break
  }
}

defineExpose({
  treeRef
})
</script>

<style scoped>
.camera-tree {
  height: 100%;
  padding: 8px;
}

/* 树节点样式 */
.tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 2px;
  transition: all 0.2s ease;
  min-height: 32px;
  cursor: pointer;
  border: 1px solid transparent;
}

.tree-node:hover {
  background: rgba(0, 240, 255, 0.1);
  border-color: rgba(0, 240, 255, 0.3);
}

.tree-node.is-selected {
  background: rgba(0, 240, 255, 0.15);
  border-color: var(--tech-primary);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.1);
}

/* 区域节点 */
.tree-node.is-zone {
  font-family: 'Orbitron', sans-serif;
  font-size: 13px;
  color: var(--tech-secondary);
  letter-spacing: 1px;
}

.zone-icon {
  color: var(--tech-secondary);
  font-size: 16px;
}

/* 摄像头节点 */
.tree-node.is-camera {
  font-family: 'Rajdhani', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-main);
}

.camera-icon {
  font-size: 14px;
}
.camera-icon.online { color: var(--status-success); text-shadow: 0 0 5px var(--status-success); }
.camera-icon.offline { color: var(--text-muted); }

.node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 节点操作区 */
.node-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tree-node:hover .node-actions {
  opacity: 1;
}

/* 状态指示器 */
.status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.status-indicator.online { background: var(--status-success); box-shadow: 0 0 5px var(--status-success); }
.status-indicator.offline { background: var(--text-muted); }

/* PTZ图标 */
.ptz-icon {
  color: var(--tech-primary);
  font-size: 14px;
}

/* 更多按钮 */
.more-icon {
  color: var(--text-sub);
  font-size: 16px;
}
.more-icon:hover { color: var(--tech-primary); }

/* 摄像头计数标签 */
.camera-count {
  font-family: 'Rajdhani', sans-serif;
  font-size: 12px;
  color: var(--text-sub);
}

/* 树组件样式覆盖 */
:deep(.el-tree) {
  background: transparent;
  color: var(--text-primary);
}

:deep(.el-tree-node__content) {
  background: transparent;
  height: 36px; /* Taller rows */
}

:deep(.el-tree-node__content:hover) {
  background: transparent; /* Handle hover manually in .tree-node */
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: transparent;
}

:deep(.el-tree-node__expand-icon) {
  color: var(--tech-primary);
}

:deep(.el-tree-node__expand-icon.is-leaf) {
  color: transparent;
}
</style>