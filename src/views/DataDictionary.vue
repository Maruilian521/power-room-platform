<template>
  <div class="data-dictionary-page">
    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 页面标题区 -->
      <div class="page-header">
        <div class="main-tabs-container">
          <div class="main-tabs">
            <div
              :class="['main-tab-item', { active: activeMainTab === 'system' }]"
              @click="activeMainTab = 'system'"
            >
              系统基础字典
            </div>
            <div
              :class="['main-tab-item', { active: activeMainTab === 'business' }]"
              @click="activeMainTab = 'business'"
            >
              业务配置字典
            </div>
          </div>

          <!-- 搜索框 -->
          <div class="header-actions">
            <div class="search-box">
              <el-icon class="search-icon"><Search /></el-icon>
              <input type="text" placeholder="搜索字典类型或字典项" v-model="globalSearchText" />
            </div>
          </div>
        </div>
      </div>

      <!-- 内容区容器 -->
      <div class="content-wrapper">
        <!-- 左侧字典类型树 -->
        <div class="left-tree-panel">
          <div class="tree-header">
            <button class="create-btn" @click="showCreateTypeDialog">
              <el-icon><Plus /></el-icon>
              <span>新建字典类型</span>
            </button>
          </div>

          <!-- 字典类型树 -->
          <div class="dict-tree">
            <div
              v-for="dictType in currentDictTypes"
              :key="dictType.id"
              class="dict-type-group"
            >
              <div
                :class="['dict-type-item', { active: activeDictType === dictType.code, expanded: dictType.expanded }]"
                @click="selectDictType(dictType)"
              >
                <el-icon class="expand-icon" @click.stop="toggleExpand(dictType)">
                  <CaretRight v-if="!dictType.expanded" />
                  <CaretBottom v-else />
                </el-icon>
                <el-icon class="type-icon"><component :is="dictType.icon" /></el-icon>
                <span class="type-name">{{ dictType.name }}</span>
                <span class="type-count">{{ dictType.itemCount }}</span>
                <div class="type-actions" @click.stop>
                  <el-dropdown trigger="click" @command="handleTypeCommand($event, dictType)">
                    <el-icon class="more-icon"><MoreFilled /></el-icon>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="edit">
                          <el-icon><Edit /></el-icon> 编辑
                        </el-dropdown-item>
                        <el-dropdown-item command="addChild">
                          <el-icon><Plus /></el-icon> 添加子类型
                        </el-dropdown-item>
                        <el-dropdown-item command="delete" divided>
                          <el-icon><Delete /></el-icon> 删除
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>

              <!-- 子类型 -->
              <template v-if="dictType.expanded && dictType.children?.length">
                <div
                  v-for="child in dictType.children"
                  :key="child.id"
                  :class="['dict-type-item', 'child-item', { active: activeDictType === child.code }]"
                  @click="selectDictType(child)"
                >
                  <span class="child-indent"></span>
                  <el-icon class="type-icon child"><component :is="child.icon || 'Document'" /></el-icon>
                  <span class="type-name">{{ child.name }}</span>
                  <span class="type-count">{{ child.itemCount }}</span>
                  <div class="type-actions" @click.stop>
                    <el-dropdown trigger="click" @command="handleTypeCommand($event, child)">
                      <el-icon class="more-icon"><MoreFilled /></el-icon>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="edit">
                            <el-icon><Edit /></el-icon> 编辑
                          </el-dropdown-item>
                          <el-dropdown-item command="delete">
                            <el-icon><Delete /></el-icon> 删除
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- 右侧字典项列表 -->
        <div class="right-content-panel">
          <!-- 当前字典类型信息 -->
          <div class="dict-type-header" v-if="currentDictTypeInfo">
            <div class="type-info">
              <div class="type-title">
                <el-icon><component :is="currentDictTypeInfo.icon" /></el-icon>
                <span>{{ currentDictTypeInfo.name }}</span>
                <el-tag v-if="currentDictTypeInfo.isSystem" type="info" size="small">系统内置</el-tag>
              </div>
              <div class="type-meta">
                <span class="meta-item">
                  <span class="label">字典编码：</span>
                  <span class="value code">{{ currentDictTypeInfo.code }}</span>
                </span>
                <span class="meta-item">
                  <span class="label">字典项数量：</span>
                  <span class="value">{{ currentDictTypeInfo.itemCount }}</span>
                </span>
                <span class="meta-item" v-if="currentDictTypeInfo.description">
                  <span class="label">描述：</span>
                  <span class="value">{{ currentDictTypeInfo.description }}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- 操作按钮栏 -->
          <div class="action-buttons-bar">
            <div class="left-actions">
              <button class="action-btn btn-primary" @click="showCreateItemDialog">
                <el-icon><Plus /></el-icon>
                <span>新增字典项</span>
              </button>
              <button class="action-btn btn-success" @click="showBatchAddDialog">
                <el-icon><DocumentAdd /></el-icon>
                <span>批量添加</span>
              </button>
              <button class="action-btn btn-warning" @click="handleExport">
                <el-icon><Download /></el-icon>
                <span>导出</span>
              </button>
            </div>
            <div class="right-actions">
              <div class="search-box small">
                <el-icon class="search-icon"><Search /></el-icon>
                <input type="text" placeholder="搜索字典项" v-model="itemSearchText" />
              </div>
            </div>
          </div>

          <!-- 字典项表格 -->
          <div class="dict-table-container">
            <el-table
              :data="filteredDictItems"
              style="width: 100%"
              row-key="id"
              :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
              default-expand-all
            >
              <el-table-column type="index" label="序号" width="70" />
              <el-table-column label="字典标签" min-width="180">
                <template #default="{ row }">
                  <div class="label-cell">
                    <span
                      v-if="row.color"
                      class="color-dot"
                      :style="{ backgroundColor: row.color }"
                    ></span>
                    <span class="label-text">{{ row.label }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="value" label="字典值" width="150">
                <template #default="{ row }">
                  <span class="value-text">{{ row.value }}</span>
                </template>
              </el-table-column>
              <el-table-column label="扩展属性" min-width="200">
                <template #default="{ row }">
                  <div class="ext-attrs" v-if="row.extAttrs && Object.keys(row.extAttrs).length">
                    <el-tooltip
                      v-for="(val, key) in row.extAttrs"
                      :key="key"
                      :content="`${key}: ${val}`"
                    >
                      <span class="ext-tag">{{ key }}: {{ val }}</span>
                    </el-tooltip>
                  </div>
                  <span v-else class="no-data">-</span>
                </template>
              </el-table-column>
              <el-table-column prop="sort" label="排序" width="80">
                <template #default="{ row }">
                  <span class="sort-value">{{ row.sort }}</span>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-switch
                    v-model="row.enabled"
                    :active-color="'#00f3ff'"
                    :inactive-color="'#3E5878'"
                    :disabled="row.isSystem"
                    @change="handleItemStatusChange(row)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="editItem(row)">编辑</el-button>
                  <el-button
                    v-if="!row.isSystem"
                    link
                    type="primary"
                    size="small"
                    @click="addChildItem(row)"
                  >
                    添加子项
                  </el-button>
                  <el-button
                    v-if="!row.isSystem"
                    link
                    type="danger"
                    size="small"
                    @click="deleteItem(row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 分页 -->
          <div class="pagination-bar">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next"
              :total="totalItems"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- =============== 新建/编辑字典类型弹窗 =============== -->
    <el-dialog
      v-model="typeDialogVisible"
      :title="isEditType ? '编辑字典类型' : '新建字典类型'"
      width="550px"
      class="sc2-dialog"
      destroy-on-close
    >
      <div class="dict-form">
        <el-form :model="typeForm" label-width="100px" :rules="typeRules" ref="typeFormRef">
          <el-form-item label="类型名称" prop="name">
            <el-input v-model="typeForm.name" placeholder="请输入字典类型名称" />
          </el-form-item>

          <el-form-item label="类型编码" prop="code">
            <el-input
              v-model="typeForm.code"
              placeholder="请输入字典类型编码（英文）"
              :disabled="isEditType && typeForm.isSystem"
            />
            <div class="form-tip">编码用于程序调用，建议使用英文下划线格式，如：device_type</div>
          </el-form-item>

          <el-form-item label="上级类型">
            <el-select v-model="typeForm.parentId" placeholder="选择上级类型（可选）" clearable style="width: 100%">
              <el-option
                v-for="type in availableParentTypes"
                :key="type.id"
                :label="type.name"
                :value="type.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="图标">
            <el-select v-model="typeForm.icon" placeholder="选择图标" style="width: 100%">
              <el-option
                v-for="icon in iconOptions"
                :key="icon.value"
                :label="icon.label"
                :value="icon.value"
              >
                <div class="icon-option">
                  <el-icon><component :is="icon.value" /></el-icon>
                  <span>{{ icon.label }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="描述">
            <el-input v-model="typeForm.description" type="textarea" rows="3" placeholder="请输入描述信息" />
          </el-form-item>

          <el-form-item label="排序">
            <el-input-number v-model="typeForm.sort" :min="0" :max="999" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="typeDialogVisible = false">取消</button>
          <button class="btn-confirm" @click="submitTypeForm">确定</button>
        </div>
      </template>
    </el-dialog>

    <!-- =============== 新建/编辑字典项弹窗 =============== -->
    <el-dialog
      v-model="itemDialogVisible"
      :title="isEditItem ? '编辑字典项' : '新增字典项'"
      width="600px"
      class="sc2-dialog"
      destroy-on-close
    >
      <div class="dict-form">
        <el-form :model="itemForm" label-width="100px" :rules="itemRules" ref="itemFormRef">
          <el-form-item label="字典标签" prop="label">
            <el-input v-model="itemForm.label" placeholder="请输入字典标签（显示名称）" />
          </el-form-item>

          <el-form-item label="字典值" prop="value">
            <el-input v-model="itemForm.value" placeholder="请输入字典值（存储值）" />
          </el-form-item>

          <el-form-item label="上级字典项">
            <el-cascader
              v-model="itemForm.parentId"
              :options="parentItemOptions"
              :props="{ checkStrictly: true, value: 'id', label: 'label', emitPath: false }"
              placeholder="选择上级字典项（可选）"
              clearable
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="标签颜色">
            <div class="color-picker-row">
              <el-color-picker v-model="itemForm.color" show-alpha />
              <div class="preset-colors">
                <span
                  v-for="color in presetColors"
                  :key="color"
                  class="preset-color"
                  :style="{ backgroundColor: color }"
                  :class="{ active: itemForm.color === color }"
                  @click="itemForm.color = color"
                ></span>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="扩展属性">
            <div class="ext-attrs-editor">
              <div
                v-for="(attr, index) in itemForm.extAttrsList"
                :key="index"
                class="ext-attr-row"
              >
                <el-input v-model="attr.key" placeholder="属性名" style="width: 120px" />
                <span class="attr-separator">:</span>
                <el-input v-model="attr.value" placeholder="属性值" style="width: 180px" />
                <el-button type="danger" link @click="removeExtAttr(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <el-button type="primary" link @click="addExtAttr">
                <el-icon><Plus /></el-icon> 添加扩展属性
              </el-button>
            </div>
          </el-form-item>

          <el-form-item label="排序">
            <el-input-number v-model="itemForm.sort" :min="0" :max="999" />
          </el-form-item>

          <el-form-item label="状态">
            <el-switch
              v-model="itemForm.enabled"
              :active-color="'#00f3ff'"
              :inactive-color="'#3E5878'"
              active-text="启用"
              inactive-text="禁用"
            />
          </el-form-item>

          <el-form-item label="备注">
            <el-input v-model="itemForm.remark" type="textarea" rows="2" placeholder="备注信息" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="itemDialogVisible = false">取消</button>
          <button class="btn-confirm" @click="submitItemForm">确定</button>
        </div>
      </template>
    </el-dialog>

    <!-- =============== 批量添加弹窗 =============== -->
    <el-dialog
      v-model="batchDialogVisible"
      title="批量添加字典项"
      width="650px"
      class="sc2-dialog"
      destroy-on-close
    >
      <div class="batch-form">
        <div class="batch-tip">
          <el-icon><InfoFilled /></el-icon>
          <span>每行一个字典项，格式：<code>标签,值</code> 或 <code>标签,值,排序</code></span>
        </div>
        <el-input
          v-model="batchContent"
          type="textarea"
          rows="12"
          placeholder="示例：
在线,online,1
离线,offline,2
告警,alarm,3
故障,fault,4"
        />
        <div class="batch-preview" v-if="batchPreviewItems.length">
          <div class="preview-title">预览（{{ batchPreviewItems.length }} 项）</div>
          <div class="preview-list">
            <div v-for="(item, index) in batchPreviewItems" :key="index" class="preview-item">
              <span class="preview-label">{{ item.label }}</span>
              <span class="preview-arrow">→</span>
              <span class="preview-value">{{ item.value }}</span>
              <span class="preview-sort" v-if="item.sort">#{{ item.sort }}</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="batchDialogVisible = false">取消</button>
          <button class="btn-confirm" @click="submitBatchAdd">确定添加</button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, markRaw } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Search, Edit, Delete, MoreFilled, CaretRight, CaretBottom,
  Document, DocumentAdd, Download, InfoFilled,
  Setting, Monitor, Bell, Warning, Files, User, Location,
  Cpu, Sunny, Lock, VideoCamera, Tools, Odometer, Connection
} from '@element-plus/icons-vue'

// ========== 主标签切换 ==========
const activeMainTab = ref('system')
const activeDictType = ref('device_type')
const globalSearchText = ref('')
const itemSearchText = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

// ========== 图标选项 ==========
const iconOptions = [
  { label: '设置', value: 'Setting' },
  { label: '监控', value: 'Monitor' },
  { label: '告警', value: 'Bell' },
  { label: '警告', value: 'Warning' },
  { label: '文件', value: 'Files' },
  { label: '用户', value: 'User' },
  { label: '位置', value: 'Location' },
  { label: '设备', value: 'Cpu' },
  { label: '环境', value: 'Sunny' },
  { label: '安全', value: 'Lock' },
  { label: '视频', value: 'VideoCamera' },
  { label: '工具', value: 'Tools' },
  { label: '仪表', value: 'Odometer' },
  { label: '连接', value: 'Connection' },
  { label: '文档', value: 'Document' }
]

// ========== 预设颜色 ==========
const presetColors = [
  '#00f3ff', '#00E676', '#FFD600', '#FF6D00', '#FF2A4D',
  '#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171'
]

// ========== 系统字典类型 ==========
interface DictType {
  id: number
  name: string
  code: string
  icon: any
  itemCount: number
  description?: string
  isSystem?: boolean
  parentId?: number | null
  expanded?: boolean
  sort: number
  children?: DictType[]
}

const systemDictTypes = ref<DictType[]>([
  {
    id: 1,
    name: '设备类型',
    code: 'device_type',
    icon: markRaw(Cpu),
    itemCount: 8,
    description: '配电室设备类型分类',
    isSystem: true,
    expanded: true,
    sort: 1,
    children: [
      { id: 11, name: '高压设备', code: 'device_type_hv', icon: markRaw(Odometer), itemCount: 4, isSystem: true, parentId: 1, sort: 1 },
      { id: 12, name: '低压设备', code: 'device_type_lv', icon: markRaw(Odometer), itemCount: 3, isSystem: true, parentId: 1, sort: 2 },
      { id: 13, name: '辅助设备', code: 'device_type_aux', icon: markRaw(Tools), itemCount: 5, isSystem: true, parentId: 1, sort: 3 }
    ]
  },
  {
    id: 2,
    name: '告警等级',
    code: 'alarm_level',
    icon: markRaw(Bell),
    itemCount: 4,
    description: '告警严重程度等级',
    isSystem: true,
    expanded: false,
    sort: 2
  },
  {
    id: 3,
    name: '告警类型',
    code: 'alarm_type',
    icon: markRaw(Warning),
    itemCount: 12,
    description: '告警类型分类',
    isSystem: true,
    expanded: false,
    sort: 3
  },
  {
    id: 4,
    name: '工单状态',
    code: 'workorder_status',
    icon: markRaw(Files),
    itemCount: 6,
    description: '工单流转状态',
    isSystem: true,
    expanded: false,
    sort: 4
  },
  {
    id: 5,
    name: '工单类型',
    code: 'workorder_type',
    icon: markRaw(Files),
    itemCount: 5,
    description: '工单业务类型',
    isSystem: true,
    expanded: false,
    sort: 5
  },
  {
    id: 6,
    name: '用户角色',
    code: 'user_role',
    icon: markRaw(User),
    itemCount: 5,
    description: '系统用户角色类型',
    isSystem: true,
    expanded: false,
    sort: 6
  }
])

// ========== 业务字典类型 ==========
const businessDictTypes = ref<DictType[]>([
  {
    id: 101,
    name: '配电室类型',
    code: 'room_type',
    icon: markRaw(Location),
    itemCount: 4,
    description: '配电室类型分类',
    expanded: true,
    sort: 1,
    children: [
      { id: 111, name: '按电压等级', code: 'room_type_voltage', icon: markRaw(Odometer), itemCount: 3, parentId: 101, sort: 1 },
      { id: 112, name: '按用途', code: 'room_type_usage', icon: markRaw(Setting), itemCount: 4, parentId: 101, sort: 2 }
    ]
  },
  {
    id: 102,
    name: '电压等级',
    code: 'voltage_level',
    icon: markRaw(Odometer),
    itemCount: 5,
    description: '电力系统电压等级',
    expanded: false,
    sort: 2
  },
  {
    id: 103,
    name: '巡检项目',
    code: 'inspection_item',
    icon: markRaw(Monitor),
    itemCount: 18,
    description: '设备巡检检查项目',
    expanded: true,
    sort: 3,
    children: [
      { id: 131, name: '外观检查', code: 'inspection_appearance', icon: markRaw(VideoCamera), itemCount: 6, parentId: 103, sort: 1 },
      { id: 132, name: '运行参数', code: 'inspection_params', icon: markRaw(Odometer), itemCount: 8, parentId: 103, sort: 2 },
      { id: 133, name: '安全检查', code: 'inspection_safety', icon: markRaw(Lock), itemCount: 4, parentId: 103, sort: 3 }
    ]
  },
  {
    id: 104,
    name: '环境参数类型',
    code: 'env_param_type',
    icon: markRaw(Sunny),
    itemCount: 6,
    description: '环境监测参数类型',
    expanded: false,
    sort: 4
  },
  {
    id: 105,
    name: '通知方式',
    code: 'notify_method',
    icon: markRaw(Bell),
    itemCount: 4,
    description: '系统通知发送方式',
    expanded: false,
    sort: 5
  },
  {
    id: 106,
    name: '证书类型',
    code: 'certificate_type',
    icon: markRaw(Document),
    itemCount: 6,
    description: '人员资质证书类型',
    expanded: false,
    sort: 6
  }
])

const currentDictTypes = computed(() => {
  return activeMainTab.value === 'system' ? systemDictTypes.value : businessDictTypes.value
})

const currentDictTypeInfo = computed(() => {
  const allTypes = [...systemDictTypes.value, ...businessDictTypes.value]
  for (const type of allTypes) {
    if (type.code === activeDictType.value) return type
    if (type.children) {
      const child = type.children.find(c => c.code === activeDictType.value)
      if (child) return child
    }
  }
  return null
})

const availableParentTypes = computed(() => {
  return currentDictTypes.value.filter(t => !t.parentId)
})

// ========== 字典项数据 ==========
interface DictItem {
  id: number
  label: string
  value: string
  color?: string
  extAttrs?: Record<string, string>
  sort: number
  enabled: boolean
  isSystem?: boolean
  parentId?: number | null
  children?: DictItem[]
  remark?: string
}

const dictItemsMap = ref<Record<string, DictItem[]>>({
  device_type: [
    { id: 1, label: '变压器', value: 'transformer', color: '#00f3ff', sort: 1, enabled: true, isSystem: true, extAttrs: { icon: 'transformer', category: 'primary' } },
    { id: 2, label: '开关柜', value: 'switchgear', color: '#00E676', sort: 2, enabled: true, isSystem: true, extAttrs: { icon: 'switchgear' } },
    { id: 3, label: '断路器', value: 'breaker', color: '#FFD600', sort: 3, enabled: true, isSystem: true },
    { id: 4, label: '电容器', value: 'capacitor', color: '#a78bfa', sort: 4, enabled: true },
    { id: 5, label: '传感器', value: 'sensor', color: '#60a5fa', sort: 5, enabled: true },
    { id: 6, label: '摄像头', value: 'camera', color: '#34d399', sort: 6, enabled: true },
    { id: 7, label: '巡检机器人', value: 'robot', color: '#fbbf24', sort: 7, enabled: true },
    { id: 8, label: 'UPS电源', value: 'ups', color: '#f87171', sort: 8, enabled: true }
  ],
  alarm_level: [
    { id: 101, label: '紧急', value: 'critical', color: '#FF2A4D', sort: 1, enabled: true, isSystem: true, extAttrs: { priority: '1', notify: 'all' } },
    { id: 102, label: '重要', value: 'major', color: '#FF6D00', sort: 2, enabled: true, isSystem: true, extAttrs: { priority: '2' } },
    { id: 103, label: '次要', value: 'minor', color: '#FFD600', sort: 3, enabled: true, isSystem: true, extAttrs: { priority: '3' } },
    { id: 104, label: '提示', value: 'info', color: '#00f3ff', sort: 4, enabled: true, isSystem: true, extAttrs: { priority: '4' } }
  ],
  alarm_type: [
    {
      id: 201, label: '电力告警', value: 'power', color: '#FF2A4D', sort: 1, enabled: true, isSystem: true,
      children: [
        { id: 2011, label: '电压过高', value: 'voltage_high', sort: 1, enabled: true, parentId: 201 },
        { id: 2012, label: '电压过低', value: 'voltage_low', sort: 2, enabled: true, parentId: 201 },
        { id: 2013, label: '电流过载', value: 'current_overload', sort: 3, enabled: true, parentId: 201 },
        { id: 2014, label: '功率因数低', value: 'power_factor_low', sort: 4, enabled: true, parentId: 201 }
      ]
    },
    {
      id: 202, label: '环境告警', value: 'environment', color: '#FFD600', sort: 2, enabled: true, isSystem: true,
      children: [
        { id: 2021, label: '温度过高', value: 'temp_high', sort: 1, enabled: true, parentId: 202 },
        { id: 2022, label: '湿度异常', value: 'humidity_abnormal', sort: 2, enabled: true, parentId: 202 },
        { id: 2023, label: '烟感报警', value: 'smoke', sort: 3, enabled: true, parentId: 202 },
        { id: 2024, label: '水浸报警', value: 'water_leak', sort: 4, enabled: true, parentId: 202 }
      ]
    },
    { id: 203, label: '设备故障', value: 'device_fault', color: '#FF6D00', sort: 3, enabled: true, isSystem: true },
    { id: 204, label: '通信中断', value: 'communication', color: '#a78bfa', sort: 4, enabled: true, isSystem: true }
  ],
  workorder_status: [
    { id: 301, label: '待分配', value: 'pending', color: '#6d8bad', sort: 1, enabled: true, isSystem: true },
    { id: 302, label: '已分配', value: 'assigned', color: '#60a5fa', sort: 2, enabled: true, isSystem: true },
    { id: 303, label: '执行中', value: 'in_progress', color: '#fbbf24', sort: 3, enabled: true, isSystem: true },
    { id: 304, label: '待验收', value: 'pending_review', color: '#a78bfa', sort: 4, enabled: true, isSystem: true },
    { id: 305, label: '已完成', value: 'completed', color: '#00E676', sort: 5, enabled: true, isSystem: true },
    { id: 306, label: '已取消', value: 'cancelled', color: '#f87171', sort: 6, enabled: true, isSystem: true }
  ],
  voltage_level: [
    { id: 401, label: '220kV', value: '220', sort: 1, enabled: true, extAttrs: { level: 'extra_high' } },
    { id: 402, label: '110kV', value: '110', sort: 2, enabled: true, extAttrs: { level: 'high' } },
    { id: 403, label: '35kV', value: '35', sort: 3, enabled: true, extAttrs: { level: 'high' } },
    { id: 404, label: '10kV', value: '10', sort: 4, enabled: true, extAttrs: { level: 'medium' } },
    { id: 405, label: '380V', value: '0.38', sort: 5, enabled: true, extAttrs: { level: 'low' } }
  ],
  notify_method: [
    { id: 501, label: '系统消息', value: 'system', color: '#00f3ff', sort: 1, enabled: true, extAttrs: { icon: 'Bell' } },
    { id: 502, label: '短信通知', value: 'sms', color: '#00E676', sort: 2, enabled: true, extAttrs: { icon: 'Message' } },
    { id: 503, label: '邮件通知', value: 'email', color: '#60a5fa', sort: 3, enabled: true, extAttrs: { icon: 'Promotion' } },
    { id: 504, label: '语音播报', value: 'voice', color: '#fbbf24', sort: 4, enabled: true, extAttrs: { icon: 'Microphone' } }
  ]
})

const currentDictItems = computed(() => {
  return dictItemsMap.value[activeDictType.value] || []
})

const filteredDictItems = computed(() => {
  if (!itemSearchText.value) return currentDictItems.value
  const search = itemSearchText.value.toLowerCase()
  return currentDictItems.value.filter(item =>
    item.label.toLowerCase().includes(search) ||
    item.value.toLowerCase().includes(search)
  )
})

const totalItems = computed(() => filteredDictItems.value.length)

const parentItemOptions = computed(() => {
  return currentDictItems.value.filter(item => !item.parentId)
})

// ========== 字典类型操作 ==========
const selectDictType = (dictType: DictType) => {
  activeDictType.value = dictType.code
}

const toggleExpand = (dictType: DictType) => {
  dictType.expanded = !dictType.expanded
}

const handleTypeCommand = (command: string, dictType: DictType) => {
  switch (command) {
    case 'edit':
      editDictType(dictType)
      break
    case 'addChild':
      addChildType(dictType)
      break
    case 'delete':
      deleteDictType(dictType)
      break
  }
}

// ========== 字典类型弹窗 ==========
const typeDialogVisible = ref(false)
const isEditType = ref(false)
const typeFormRef = ref()

interface TypeForm {
  id?: number
  name: string
  code: string
  icon: string
  description: string
  parentId: number | null
  sort: number
  isSystem?: boolean
}

const typeForm = ref<TypeForm>({
  name: '',
  code: '',
  icon: 'Setting',
  description: '',
  parentId: null,
  sort: 0
})

const typeRules = {
  name: [{ required: true, message: '请输入字典类型名称', trigger: 'blur' }],
  code: [
    { required: true, message: '请输入字典类型编码', trigger: 'blur' },
    { pattern: /^[a-z][a-z0-9_]*$/, message: '编码必须以小写字母开头，只能包含小写字母、数字和下划线', trigger: 'blur' }
  ]
}

const showCreateTypeDialog = () => {
  isEditType.value = false
  typeForm.value = {
    name: '',
    code: '',
    icon: 'Setting',
    description: '',
    parentId: null,
    sort: 0
  }
  typeDialogVisible.value = true
}

const editDictType = (dictType: DictType) => {
  isEditType.value = true
  typeForm.value = {
    id: dictType.id,
    name: dictType.name,
    code: dictType.code,
    icon: typeof dictType.icon === 'string' ? dictType.icon : 'Setting',
    description: dictType.description || '',
    parentId: dictType.parentId || null,
    sort: dictType.sort,
    isSystem: dictType.isSystem
  }
  typeDialogVisible.value = true
}

const addChildType = (parentType: DictType) => {
  isEditType.value = false
  typeForm.value = {
    name: '',
    code: '',
    icon: 'Document',
    description: '',
    parentId: parentType.id,
    sort: 0
  }
  typeDialogVisible.value = true
}

const deleteDictType = (dictType: DictType) => {
  if (dictType.isSystem) {
    ElMessage.warning('系统内置字典类型不可删除')
    return
  }
  ElMessageBox.confirm(`确定要删除字典类型"${dictType.name}"吗？该操作将同时删除所有字典项。`, '删除确认', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const submitTypeForm = async () => {
  try {
    await typeFormRef.value?.validate()
    ElMessage.success(isEditType.value ? '修改成功' : '创建成功')
    typeDialogVisible.value = false
  } catch (e) {
    // validation failed
  }
}

// ========== 字典项弹窗 ==========
const itemDialogVisible = ref(false)
const isEditItem = ref(false)
const itemFormRef = ref()
const editingParentId = ref<number | null>(null)

interface ExtAttr {
  key: string
  value: string
}

interface ItemForm {
  id?: number
  label: string
  value: string
  color: string
  extAttrsList: ExtAttr[]
  sort: number
  enabled: boolean
  parentId: number | null
  remark: string
}

const itemForm = ref<ItemForm>({
  label: '',
  value: '',
  color: '',
  extAttrsList: [],
  sort: 0,
  enabled: true,
  parentId: null,
  remark: ''
})

const itemRules = {
  label: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
  value: [{ required: true, message: '请输入字典值', trigger: 'blur' }]
}

const showCreateItemDialog = () => {
  isEditItem.value = false
  editingParentId.value = null
  itemForm.value = {
    label: '',
    value: '',
    color: '',
    extAttrsList: [],
    sort: currentDictItems.value.length + 1,
    enabled: true,
    parentId: null,
    remark: ''
  }
  itemDialogVisible.value = true
}

const editItem = (item: DictItem) => {
  isEditItem.value = true
  const extAttrsList: ExtAttr[] = item.extAttrs
    ? Object.entries(item.extAttrs).map(([key, value]) => ({ key, value }))
    : []
  itemForm.value = {
    id: item.id,
    label: item.label,
    value: item.value,
    color: item.color || '',
    extAttrsList,
    sort: item.sort,
    enabled: item.enabled,
    parentId: item.parentId || null,
    remark: item.remark || ''
  }
  itemDialogVisible.value = true
}

const addChildItem = (parentItem: DictItem) => {
  isEditItem.value = false
  editingParentId.value = parentItem.id
  itemForm.value = {
    label: '',
    value: '',
    color: parentItem.color || '',
    extAttrsList: [],
    sort: (parentItem.children?.length || 0) + 1,
    enabled: true,
    parentId: parentItem.id,
    remark: ''
  }
  itemDialogVisible.value = true
}

const deleteItem = (item: DictItem) => {
  ElMessageBox.confirm(`确定要删除字典项"${item.label}"吗？`, '删除确认', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const addExtAttr = () => {
  itemForm.value.extAttrsList.push({ key: '', value: '' })
}

const removeExtAttr = (index: number) => {
  itemForm.value.extAttrsList.splice(index, 1)
}

const submitItemForm = async () => {
  try {
    await itemFormRef.value?.validate()
    ElMessage.success(isEditItem.value ? '修改成功' : '添加成功')
    itemDialogVisible.value = false
  } catch (e) {
    // validation failed
  }
}

const handleItemStatusChange = (item: DictItem) => {
  ElMessage.success(`字典项"${item.label}"已${item.enabled ? '启用' : '禁用'}`)
}

// ========== 批量添加 ==========
const batchDialogVisible = ref(false)
const batchContent = ref('')

const batchPreviewItems = computed(() => {
  if (!batchContent.value.trim()) return []
  const lines = batchContent.value.trim().split('\n')
  return lines.map(line => {
    const parts = line.split(',').map(p => p.trim())
    return {
      label: parts[0] || '',
      value: parts[1] || '',
      sort: parts[2] ? parseInt(parts[2]) : undefined
    }
  }).filter(item => item.label && item.value)
})

const showBatchAddDialog = () => {
  batchContent.value = ''
  batchDialogVisible.value = true
}

const submitBatchAdd = () => {
  if (batchPreviewItems.value.length === 0) {
    ElMessage.warning('请输入有效的字典项数据')
    return
  }
  ElMessage.success(`成功添加 ${batchPreviewItems.value.length} 个字典项`)
  batchDialogVisible.value = false
}

// ========== 导出 ==========
const handleExport = () => {
  ElMessage.success('字典数据导出成功')
}

// ========== Watch ==========
watch(activeMainTab, () => {
  const types = currentDictTypes.value
  if (types.length > 0) {
    activeDictType.value = types[0].code
  }
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

/* 全局动画 */
@keyframes scanline {
  0% { background-position: 0% 0%; }
  100% { background-position: 0% 200%; }
}

@keyframes corner-flicker {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; filter: drop-shadow(0 0 5px #00F0FF); }
}

.data-dictionary-page {
  width: 100%;
  height: 100vh;
  background: var(--bg-deep);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 20px;
}

/* 页面标题区 */
.page-header {
  padding: 0 24px 20px 24px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  margin-bottom: 20px;
}

.main-tabs-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.content-wrapper {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 主标签 */
.main-tabs {
  display: flex;
  gap: 8px;
}

.main-tab-item {
  padding: 12px 32px;
  background: rgba(13, 18, 26, 0.85);
  color: var(--text-sub);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  border: 1px solid rgba(0, 240, 255, 0.1);
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  transition: all 0.3s;
  backdrop-filter: blur(10px);
}

.main-tab-item:hover {
  color: var(--tech-primary);
  border-color: rgba(0, 240, 255, 0.3);
}

.main-tab-item.active {
  background: rgba(0, 240, 255, 0.1);
  color: var(--tech-primary);
  border-color: var(--tech-primary);
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 主容器 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(13, 18, 26, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 240, 255, 0.2);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5), 0 5px 15px rgba(0, 0, 0, 0.3);
  position: relative;
  clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
}

.main-container::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  background: linear-gradient(180deg, rgba(0, 240, 255, 0.1) 0%, rgba(0, 240, 255, 0.6) 50%, rgba(0, 240, 255, 0.1) 100%);
  background-size: 100% 200%;
  animation: scanline 4s linear infinite;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0.6;
}

.main-container::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, #00F0FF 15px, transparent 0) top left,
    linear-gradient(-45deg, #00F0FF 15px, transparent 0) bottom right;
  background-size: 25px 25px;
  background-repeat: no-repeat;
  pointer-events: none;
  opacity: 0.4;
  animation: corner-flicker 3s infinite alternate;
}

/* 左侧树面板 */
.left-tree-panel {
  width: 280px;
  background: rgba(0, 0, 0, 0.2);
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(0, 240, 255, 0.1);
}

.tree-header {
  margin-bottom: 16px;
}

.create-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(0, 240, 255, 0.05);
  border: 1px solid rgba(0, 240, 255, 0.3);
  color: var(--tech-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
}

.create-btn:hover {
  background: rgba(0, 240, 255, 0.15);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}

/* 字典类型树 */
.dict-tree {
  flex: 1;
  overflow-y: auto;
}

.dict-type-group {
  margin-bottom: 4px;
}

.dict-type-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  color: var(--text-sub);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 2px solid transparent;
  gap: 8px;
  position: relative;
}

.dict-type-item:hover {
  background: rgba(0, 240, 255, 0.05);
  color: var(--text-bright);
}

.dict-type-item.active {
  background: linear-gradient(to right, rgba(0, 240, 255, 0.1) 0%, transparent 100%);
  color: var(--text-bright);
  border-left-color: var(--tech-primary);
}

.dict-type-item.child-item {
  padding-left: 20px;
}

.child-indent {
  width: 16px;
  height: 1px;
  background: rgba(0, 240, 255, 0.2);
  margin-right: 4px;
}

.expand-icon {
  font-size: 12px;
  color: var(--tech-primary);
  transition: transform 0.2s;
  cursor: pointer;
}

.type-icon {
  font-size: 16px;
  color: var(--tech-primary);
}

.type-icon.child {
  font-size: 14px;
  color: var(--text-sub);
}

.type-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.type-count {
  font-size: 11px;
  color: var(--tech-primary);
  font-family: 'DIN Alternate', sans-serif;
  padding: 2px 6px;
  background: rgba(0, 240, 255, 0.1);
  border-radius: 2px;
}

.type-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.dict-type-item:hover .type-actions {
  opacity: 1;
}

.more-icon {
  font-size: 14px;
  color: var(--text-sub);
  cursor: pointer;
  padding: 4px;
}

.more-icon:hover {
  color: var(--tech-primary);
}

/* 右侧内容面板 */
.right-content-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow: hidden;
  gap: 16px;
}

/* 字典类型头部信息 */
.dict-type-header {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.15);
  padding: 16px 20px;
}

.type-info .type-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-bright);
  margin-bottom: 10px;
}

.type-info .type-title .el-icon {
  color: var(--tech-primary);
  font-size: 20px;
}

.type-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.meta-item {
  font-size: 13px;
}

.meta-item .label {
  color: var(--text-sub);
}

.meta-item .value {
  color: var(--text-bright);
}

.meta-item .value.code {
  font-family: 'Consolas', monospace;
  color: var(--tech-primary);
  background: rgba(0, 240, 255, 0.1);
  padding: 2px 8px;
  border-radius: 2px;
}

/* 操作按钮栏 */
.action-buttons-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-actions, .right-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border: 1px solid;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(0, 0, 0, 0.3);
  clip-path: polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px);
}

.btn-primary {
  border-color: var(--tech-primary);
  color: var(--tech-primary);
}

.btn-primary:hover {
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}

.btn-success {
  border-color: var(--status-success);
  color: var(--status-success);
}

.btn-success:hover {
  box-shadow: 0 0 10px rgba(0, 255, 157, 0.3);
}

.btn-warning {
  border-color: var(--status-warning);
  color: var(--status-warning);
}

.btn-warning:hover {
  box-shadow: 0 0 10px rgba(255, 179, 0, 0.3);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  width: 280px;
  clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
  transition: all 0.3s;
}

.search-box.small {
  width: 220px;
  padding: 8px 14px;
}

.search-box:focus-within {
  border-color: var(--tech-primary);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.2);
}

.search-icon {
  color: var(--tech-primary);
  font-size: 14px;
}

.search-box input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-bright);
  font-size: 13px;
}

.search-box input::placeholder {
  color: var(--text-sub);
}

/* 表格容器 */
.dict-table-container {
  flex: 1;
  border: 1px solid rgba(0, 240, 255, 0.15);
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);
  position: relative;
}

.dict-table-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--tech-primary), transparent);
  box-shadow: 0 0 10px var(--tech-primary);
  opacity: 0.5;
  pointer-events: none;
  z-index: 10;
}

.label-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.label-text {
  color: var(--text-bright);
  font-weight: 500;
}

.value-text {
  font-family: 'Consolas', monospace;
  color: var(--tech-primary);
  background: rgba(0, 240, 255, 0.1);
  padding: 2px 8px;
  border-radius: 2px;
  font-size: 12px;
}

.ext-attrs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ext-tag {
  font-size: 11px;
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  color: var(--text-sub);
  border-radius: 2px;
  cursor: default;
}

.no-data {
  color: var(--text-muted);
}

.sort-value {
  font-family: 'DIN Alternate', sans-serif;
  color: var(--text-sub);
}

/* 分页栏 */
.pagination-bar {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
}

/* ========== 弹窗样式 ========== */
.dict-form {
  padding: 20px;
}

.form-tip {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 6px;
}

.icon-option {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-option .el-icon {
  color: var(--tech-primary);
}

.color-picker-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.preset-colors {
  display: flex;
  gap: 8px;
}

.preset-color {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.preset-color:hover {
  transform: scale(1.1);
}

.preset-color.active {
  border-color: #fff;
  box-shadow: 0 0 8px currentColor;
}

.ext-attrs-editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ext-attr-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.attr-separator {
  color: var(--text-sub);
  font-weight: bold;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 20px 20px;
}

.btn-cancel,
.btn-confirm {
  padding: 12px 32px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid;
}

.btn-cancel {
  background: transparent;
  border-color: rgba(0, 240, 255, 0.3);
  color: var(--text-sub);
}

.btn-cancel:hover {
  border-color: var(--tech-primary);
  color: var(--tech-primary);
}

.btn-confirm {
  background: rgba(0, 240, 255, 0.15);
  border-color: var(--tech-primary);
  color: var(--tech-primary);
}

.btn-confirm:hover {
  background: rgba(0, 240, 255, 0.25);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.4);
}

/* ========== 批量添加样式 ========== */
.batch-form {
  padding: 20px;
}

.batch-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.2);
  color: var(--text-sub);
  font-size: 13px;
  margin-bottom: 16px;
}

.batch-tip .el-icon {
  color: var(--tech-primary);
  font-size: 16px;
}

.batch-tip code {
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  color: var(--tech-primary);
  font-family: 'Consolas', monospace;
}

.batch-preview {
  margin-top: 16px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.15);
}

.preview-title {
  font-size: 13px;
  color: var(--tech-primary);
  margin-bottom: 12px;
  font-weight: 600;
}

.preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(0, 240, 255, 0.05);
  border: 1px solid rgba(0, 240, 255, 0.2);
  font-size: 12px;
}

.preview-label {
  color: var(--text-bright);
}

.preview-arrow {
  color: var(--tech-primary);
}

.preview-value {
  font-family: 'Consolas', monospace;
  color: var(--tech-primary);
}

.preview-sort {
  color: var(--text-muted);
  font-size: 11px;
}

/* 滚动条样式 */
.left-tree-panel::-webkit-scrollbar,
.dict-tree::-webkit-scrollbar {
  width: 6px;
}

.left-tree-panel::-webkit-scrollbar-track,
.dict-tree::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

.left-tree-panel::-webkit-scrollbar-thumb,
.dict-tree::-webkit-scrollbar-thumb {
  background: rgba(0, 240, 255, 0.2);
}

.left-tree-panel::-webkit-scrollbar-thumb:hover,
.dict-tree::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 240, 255, 0.3);
}
</style>

<style>
/* el-table SC2 科技风格 */
.data-dictionary-page .el-table {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(0, 240, 255, 0.05);
  --el-table-header-text-color: #00f3ff;
  --el-table-text-color: #e2e8f0;
  --el-table-border-color: rgba(0, 240, 255, 0.15);
  --el-table-row-hover-bg-color: rgba(0, 240, 255, 0.08);
  background: transparent !important;
}

.data-dictionary-page .el-table th.el-table__cell {
  background: rgba(0, 240, 255, 0.05) !important;
  color: #00f3ff !important;
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 2px solid rgba(0, 240, 255, 0.2) !important;
}

.data-dictionary-page .el-table td.el-table__cell {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  color: #e2e8f0;
  font-size: 13px;
}

.data-dictionary-page .el-table__body tr:hover > td.el-table__cell {
  background: rgba(0, 240, 255, 0.08) !important;
}

.data-dictionary-page .el-table__indent,
.data-dictionary-page .el-table__expand-icon {
  color: var(--tech-primary);
}

/* Dialog 样式 */
.sc2-dialog .el-dialog {
  background: rgba(13, 18, 26, 0.95);
  border: 1px solid rgba(0, 240, 255, 0.3);
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.2);
}

.sc2-dialog .el-dialog__header {
  border-bottom: 1px solid rgba(0, 240, 255, 0.2);
  padding: 20px;
}

.sc2-dialog .el-dialog__title {
  color: #00f3ff;
  font-weight: 600;
  letter-spacing: 1px;
}

.sc2-dialog .el-dialog__body {
  padding: 0;
}

.sc2-dialog .el-form-item__label {
  color: var(--text-sub);
}

.sc2-dialog .el-input__wrapper,
.sc2-dialog .el-textarea__inner,
.sc2-dialog .el-select__wrapper {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 240, 255, 0.2);
  box-shadow: none;
}

.sc2-dialog .el-input__wrapper:focus,
.sc2-dialog .el-input__wrapper.is-focus,
.sc2-dialog .el-textarea__inner:focus,
.sc2-dialog .el-select__wrapper.is-focused {
  border-color: #00f3ff;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.2);
}

.sc2-dialog .el-input__inner,
.sc2-dialog .el-textarea__inner {
  color: var(--text-bright);
}

/* Dropdown 样式 */
.data-dictionary-page .el-dropdown-menu {
  background: rgba(13, 18, 26, 0.95);
  border: 1px solid rgba(0, 240, 255, 0.3);
}

.data-dictionary-page .el-dropdown-menu__item {
  color: var(--text-sub);
}

.data-dictionary-page .el-dropdown-menu__item:hover {
  background: rgba(0, 240, 255, 0.1);
  color: var(--tech-primary);
}

/* Tag 样式 */
.data-dictionary-page .el-tag--info {
  background: rgba(0, 240, 255, 0.1);
  border-color: rgba(0, 240, 255, 0.3);
  color: var(--tech-primary);
}

/* Cascader 样式 */
.el-cascader-panel {
  background: rgba(13, 18, 26, 0.95);
  border: 1px solid rgba(0, 240, 255, 0.3);
}

.el-cascader-node {
  color: var(--text-sub);
}

.el-cascader-node:hover {
  background: rgba(0, 240, 255, 0.1);
}

.el-cascader-node.is-active {
  color: var(--tech-primary);
}

/* Pagination 样式 */
.data-dictionary-page .el-pagination {
  --el-pagination-bg-color: transparent;
  --el-pagination-text-color: var(--text-sub);
  --el-pagination-button-bg-color: rgba(0, 0, 0, 0.3);
  --el-pagination-hover-color: #00f3ff;
}

.data-dictionary-page .el-pagination .el-pager li {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.data-dictionary-page .el-pagination .el-pager li.is-active {
  background: rgba(0, 240, 255, 0.15);
  border-color: #00f3ff;
  color: #00f3ff;
}

/* Switch 样式 */
.data-dictionary-page .el-switch.is-checked .el-switch__core {
  border-color: #00f3ff;
  background-color: rgba(0, 240, 255, 0.3);
}
</style>
