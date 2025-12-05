<template>
  <div class="strategy-config-page">
    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 页面标题区 -->
      <div class="page-header">
        <div class="main-tabs-container">
          <div class="main-tabs">
            <div
              :class="['main-tab-item', { active: activeMainTab === 'alarm' }]"
              @click="activeMainTab = 'alarm'"
            >
              告警策略
            </div>
            <div
              :class="['main-tab-item', { active: activeMainTab === 'ai' }]"
              @click="activeMainTab = 'ai'"
            >
              AI识别策略
            </div>
            <div
              :class="['main-tab-item', { active: activeMainTab === 'template' }]"
              @click="activeMainTab = 'template'"
            >
              策略模板
            </div>
          </div>

          <!-- 策略状态标签 -->
          <div class="status-tabs-inline" v-if="activeMainTab !== 'template'">
            <div
              :class="['status-tab-inline', { active: activeStatus === 'all' }]"
              @click="activeStatus = 'all'"
            >
              全部 <span class="count">({{ strategyCount.all }})</span>
            </div>
            <div
              :class="['status-tab-inline', { active: activeStatus === 'enabled' }]"
              @click="activeStatus = 'enabled'"
            >
              已启用 <span class="count">({{ strategyCount.enabled }})</span>
            </div>
            <div
              :class="['status-tab-inline', { active: activeStatus === 'disabled' }]"
              @click="activeStatus = 'disabled'"
            >
              已禁用 <span class="count">({{ strategyCount.disabled }})</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 内容区容器 -->
      <div class="content-wrapper">
        <!-- =============== 告警策略配置 =============== -->
        <template v-if="activeMainTab === 'alarm'">
          <!-- 左侧分类树 -->
          <div class="left-tree-panel">
            <div class="tree-header">
              <button class="create-btn" @click="showCreateDialog('alarm')">
                <el-icon><Plus /></el-icon>
                <span>新建告警策略</span>
              </button>
            </div>

            <div
              v-for="category in alarmCategories"
              :key="category.id"
              :class="['tree-item', { active: activeAlarmCategory === category.id }]"
              @click="activeAlarmCategory = category.id"
            >
              <el-icon :class="category.iconClass"><component :is="category.icon" /></el-icon>
              <span class="tree-label">{{ category.name }}</span>
              <span class="tree-count">{{ getCategoryCount(category.id) }}</span>
            </div>
          </div>

          <!-- 右侧策略列表 -->
          <div class="right-content-panel">
            <!-- 操作按钮栏 -->
            <div class="action-buttons-bar">
              <div class="left-actions">
                <button class="action-btn btn-primary" @click="batchEnable">
                  <el-icon><CircleCheck /></el-icon>
                  <span>批量启用</span>
                </button>
                <button class="action-btn btn-warning" @click="batchDisable">
                  <el-icon><CircleClose /></el-icon>
                  <span>批量禁用</span>
                </button>
                <button class="action-btn btn-success" @click="importFromTemplate">
                  <el-icon><DocumentCopy /></el-icon>
                  <span>从模板导入</span>
                </button>
              </div>
              <div class="right-actions">
                <div class="search-box">
                  <el-icon class="search-icon"><Search /></el-icon>
                  <input type="text" placeholder="搜索策略名称" v-model="searchText" />
                </div>
              </div>
            </div>

            <!-- 策略列表表格 -->
            <div class="strategy-table-container">
              <el-table
                :data="filteredAlarmStrategies"
                style="width: 100%"
                @selection-change="handleSelectionChange"
                row-key="id"
              >
                <el-table-column type="selection" width="50" />
                <el-table-column type="index" label="序号" width="70" />
                <el-table-column label="策略名称" min-width="180">
                  <template #default="{ row }">
                    <div class="strategy-name-cell">
                      <span class="name">{{ row.name }}</span>
                      <span v-if="row.isDefault" class="default-badge">默认</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="告警类型" width="120">
                  <template #default="{ row }">
                    <span class="type-tag">{{ getAlarmTypeText(row.alarmType) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="触发条件" min-width="200">
                  <template #default="{ row }">
                    <span class="condition-text">{{ row.condition }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="告警等级" width="100">
                  <template #default="{ row }">
                    <span :class="['level-badge', row.level]">{{ getLevelText(row.level) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="通知方式" width="150">
                  <template #default="{ row }">
                    <div class="notify-icons">
                      <el-tooltip content="系统通知" v-if="row.notifyMethods.includes('system')">
                        <el-icon class="notify-icon"><Bell /></el-icon>
                      </el-tooltip>
                      <el-tooltip content="短信通知" v-if="row.notifyMethods.includes('sms')">
                        <el-icon class="notify-icon"><Message /></el-icon>
                      </el-tooltip>
                      <el-tooltip content="邮件通知" v-if="row.notifyMethods.includes('email')">
                        <el-icon class="notify-icon"><Promotion /></el-icon>
                      </el-tooltip>
                      <el-tooltip content="语音播报" v-if="row.notifyMethods.includes('voice')">
                        <el-icon class="notify-icon"><Microphone /></el-icon>
                      </el-tooltip>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="状态" width="100">
                  <template #default="{ row }">
                    <el-switch
                      v-model="row.enabled"
                      :active-color="'#00f3ff'"
                      :inactive-color="'#3E5878'"
                      @change="handleStatusChange(row)"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="140" fixed="right">
                  <template #default="{ row }">
                    <el-button link type="primary" size="small" @click="editStrategy(row)">编辑</el-button>
                    <el-button link type="danger" size="small" @click="deleteStrategy(row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 分页 -->
            <div class="pagination-bar">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next"
                :total="filteredAlarmStrategies.length"
              />
            </div>
          </div>
        </template>

        <!-- =============== AI识别策略配置 =============== -->
        <template v-if="activeMainTab === 'ai'">
          <!-- 左侧分类树 -->
          <div class="left-tree-panel">
            <div class="tree-header">
              <button class="create-btn" @click="showCreateDialog('ai')">
                <el-icon><Plus /></el-icon>
                <span>新建AI策略</span>
              </button>
            </div>

            <div
              v-for="category in aiCategories"
              :key="category.id"
              :class="['tree-item', { active: activeAICategory === category.id }]"
              @click="activeAICategory = category.id"
            >
              <el-icon :class="category.iconClass"><component :is="category.icon" /></el-icon>
              <span class="tree-label">{{ category.name }}</span>
              <span class="tree-count">{{ getAICategoryCount(category.id) }}</span>
            </div>
          </div>

          <!-- 右侧AI策略卡片列表 -->
          <div class="right-content-panel ai-panel">
            <!-- 操作按钮栏 -->
            <div class="action-buttons-bar">
              <div class="left-actions">
                <button class="action-btn btn-primary" @click="batchEnable">
                  <el-icon><CircleCheck /></el-icon>
                  <span>批量启用</span>
                </button>
                <button class="action-btn btn-warning" @click="batchDisable">
                  <el-icon><CircleClose /></el-icon>
                  <span>批量禁用</span>
                </button>
              </div>
              <div class="right-actions">
                <div class="search-box">
                  <el-icon class="search-icon"><Search /></el-icon>
                  <input type="text" placeholder="搜索AI策略" v-model="aiSearchText" />
                </div>
              </div>
            </div>

            <!-- AI策略卡片网格 -->
            <div class="ai-strategy-grid">
              <div
                v-for="strategy in filteredAIStrategies"
                :key="strategy.id"
                :class="['ai-strategy-card', { disabled: !strategy.enabled }]"
              >
                <div class="card-header">
                  <div class="card-icon" :class="strategy.category">
                    <el-icon><component :is="getAIIcon(strategy.category)" /></el-icon>
                  </div>
                  <div class="card-title">
                    <span class="name">{{ strategy.name }}</span>
                    <span class="category">{{ getAICategoryText(strategy.category) }}</span>
                  </div>
                  <el-switch
                    v-model="strategy.enabled"
                    :active-color="'#00f3ff'"
                    :inactive-color="'#3E5878'"
                    @change="handleAIStatusChange(strategy)"
                  />
                </div>

                <div class="card-body">
                  <div class="config-item">
                    <span class="label">灵敏度</span>
                    <div class="sensitivity-bar">
                      <div class="bar-fill" :style="{ width: strategy.sensitivity + '%' }"></div>
                      <span class="value">{{ strategy.sensitivity }}%</span>
                    </div>
                  </div>
                  <div class="config-item">
                    <span class="label">置信度阈值</span>
                    <span class="value highlight">{{ strategy.confidenceThreshold }}%</span>
                  </div>
                  <div class="config-item">
                    <span class="label">检测间隔</span>
                    <span class="value">{{ strategy.detectInterval }}秒</span>
                  </div>
                  <div class="config-item">
                    <span class="label">应用场景</span>
                    <div class="scene-tags">
                      <span v-for="scene in strategy.scenes" :key="scene" class="scene-tag">{{ scene }}</span>
                    </div>
                  </div>
                </div>

                <div class="card-footer">
                  <button class="card-btn edit" @click="editAIStrategy(strategy)">
                    <el-icon><Edit /></el-icon>
                    配置
                  </button>
                  <button class="card-btn delete" @click="deleteAIStrategy(strategy)">
                    <el-icon><Delete /></el-icon>
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- =============== 策略模板 =============== -->
        <template v-if="activeMainTab === 'template'">
          <div class="template-panel">
            <!-- 模板操作栏 -->
            <div class="template-header">
              <div class="left-actions">
                <button class="action-btn btn-primary" @click="createTemplate">
                  <el-icon><Plus /></el-icon>
                  <span>创建模板</span>
                </button>
              </div>
              <div class="right-actions">
                <el-radio-group v-model="templateType" class="template-type-switch">
                  <el-radio-button label="all">全部模板</el-radio-button>
                  <el-radio-button label="alarm">告警模板</el-radio-button>
                  <el-radio-button label="ai">AI模板</el-radio-button>
                  <el-radio-button label="system">系统预设</el-radio-button>
                </el-radio-group>
              </div>
            </div>

            <!-- 模板卡片列表 -->
            <div class="template-grid">
              <div
                v-for="template in filteredTemplates"
                :key="template.id"
                :class="['template-card', template.type]"
              >
                <div class="template-badge" v-if="template.isSystem">系统预设</div>
                <div class="template-icon">
                  <el-icon><component :is="template.type === 'alarm' ? 'Bell' : 'View'" /></el-icon>
                </div>
                <div class="template-info">
                  <h3 class="template-name">{{ template.name }}</h3>
                  <p class="template-desc">{{ template.description }}</p>
                  <div class="template-meta">
                    <span class="meta-item">
                      <el-icon><Setting /></el-icon>
                      {{ template.strategyCount }} 条策略
                    </span>
                    <span class="meta-item">
                      <el-icon><Clock /></el-icon>
                      {{ template.updateTime }}
                    </span>
                  </div>
                </div>
                <div class="template-actions">
                  <button class="template-btn apply" @click="applyTemplate(template)">
                    <el-icon><Check /></el-icon>
                    应用模板
                  </button>
                  <button class="template-btn preview" @click="previewTemplate(template)">
                    <el-icon><View /></el-icon>
                    预览
                  </button>
                  <button
                    v-if="!template.isSystem"
                    class="template-btn edit"
                    @click="editTemplate(template)"
                  >
                    <el-icon><Edit /></el-icon>
                    编辑
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- =============== 告警策略编辑弹窗 =============== -->
    <el-dialog
      v-model="alarmDialogVisible"
      :title="isEdit ? '编辑告警策略' : '新建告警策略'"
      width="700px"
      class="sc2-dialog"
      destroy-on-close
    >
      <div class="strategy-form">
        <el-form :model="alarmForm" label-width="100px" :rules="alarmRules" ref="alarmFormRef">
          <el-form-item label="策略名称" prop="name">
            <el-input v-model="alarmForm.name" placeholder="请输入策略名称" />
          </el-form-item>

          <el-form-item label="告警类型" prop="alarmType">
            <el-select v-model="alarmForm.alarmType" placeholder="选择告警类型" style="width: 100%">
              <el-option label="电压异常" value="voltage" />
              <el-option label="电流异常" value="current" />
              <el-option label="温度异常" value="temperature" />
              <el-option label="湿度异常" value="humidity" />
              <el-option label="开关状态" value="switch" />
              <el-option label="通信故障" value="communication" />
              <el-option label="局放预警" value="pd" />
            </el-select>
          </el-form-item>

          <el-form-item label="触发条件" prop="condition">
            <div class="condition-builder">
              <el-select v-model="alarmForm.conditionType" style="width: 120px">
                <el-option label="大于" value="gt" />
                <el-option label="小于" value="lt" />
                <el-option label="等于" value="eq" />
                <el-option label="区间外" value="out" />
              </el-select>
              <el-input-number
                v-model="alarmForm.threshold1"
                :min="0"
                placeholder="阈值"
                style="width: 150px"
              />
              <template v-if="alarmForm.conditionType === 'out'">
                <span class="condition-separator">~</span>
                <el-input-number
                  v-model="alarmForm.threshold2"
                  :min="0"
                  placeholder="阈值2"
                  style="width: 150px"
                />
              </template>
              <el-select v-model="alarmForm.unit" style="width: 80px">
                <el-option label="V" value="V" />
                <el-option label="A" value="A" />
                <el-option label="°C" value="°C" />
                <el-option label="%" value="%" />
              </el-select>
            </div>
          </el-form-item>

          <el-form-item label="持续时间">
            <el-input-number v-model="alarmForm.duration" :min="0" :max="3600" />
            <span class="form-hint">秒（0表示立即触发）</span>
          </el-form-item>

          <el-form-item label="告警等级" prop="level">
            <el-radio-group v-model="alarmForm.level" class="level-radio-group">
              <el-radio label="critical">
                <span class="level-option critical">严重</span>
              </el-radio>
              <el-radio label="warning">
                <span class="level-option warning">警告</span>
              </el-radio>
              <el-radio label="info">
                <span class="level-option info">提示</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="通知方式">
            <el-checkbox-group v-model="alarmForm.notifyMethods" class="notify-checkbox-group">
              <el-checkbox label="system">
                <el-icon><Bell /></el-icon> 系统通知
              </el-checkbox>
              <el-checkbox label="sms">
                <el-icon><Message /></el-icon> 短信
              </el-checkbox>
              <el-checkbox label="email">
                <el-icon><Promotion /></el-icon> 邮件
              </el-checkbox>
              <el-checkbox label="voice">
                <el-icon><Microphone /></el-icon> 语音播报
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="应用范围">
            <el-select v-model="alarmForm.applyScope" multiple placeholder="选择配电室" style="width: 100%">
              <el-option label="全部配电室" value="all" />
              <el-option label="圆心配电室" value="room1" />
              <el-option label="通州配电室" value="room2" />
              <el-option label="北理工配电室" value="room3" />
            </el-select>
          </el-form-item>

          <el-form-item label="策略描述">
            <el-input v-model="alarmForm.description" type="textarea" rows="3" placeholder="请输入策略描述" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="alarmDialogVisible = false">取消</button>
          <button class="btn-confirm" @click="submitAlarmForm">确定</button>
        </div>
      </template>
    </el-dialog>

    <!-- =============== AI策略编辑弹窗 =============== -->
    <el-dialog
      v-model="aiDialogVisible"
      :title="isEdit ? '编辑AI识别策略' : '新建AI识别策略'"
      width="700px"
      class="sc2-dialog"
      destroy-on-close
    >
      <div class="strategy-form">
        <el-form :model="aiForm" label-width="100px" :rules="aiRules" ref="aiFormRef">
          <el-form-item label="策略名称" prop="name">
            <el-input v-model="aiForm.name" placeholder="请输入策略名称" />
          </el-form-item>

          <el-form-item label="识别类型" prop="category">
            <el-select v-model="aiForm.category" placeholder="选择识别类型" style="width: 100%">
              <el-option label="安全帽检测" value="helmet" />
              <el-option label="工服检测" value="uniform" />
              <el-option label="火焰检测" value="fire" />
              <el-option label="烟雾检测" value="smoke" />
              <el-option label="区域入侵" value="intrusion" />
              <el-option label="人员聚集" value="gathering" />
              <el-option label="设备状态" value="device" />
            </el-select>
          </el-form-item>

          <el-form-item label="灵敏度">
            <div class="slider-container">
              <el-slider v-model="aiForm.sensitivity" :min="0" :max="100" show-input />
            </div>
          </el-form-item>

          <el-form-item label="置信度阈值">
            <div class="slider-container">
              <el-slider v-model="aiForm.confidenceThreshold" :min="50" :max="100" show-input />
            </div>
            <span class="form-hint">低于此值的识别结果将被忽略</span>
          </el-form-item>

          <el-form-item label="检测间隔">
            <el-input-number v-model="aiForm.detectInterval" :min="1" :max="60" />
            <span class="form-hint">秒</span>
          </el-form-item>

          <el-form-item label="应用场景">
            <el-checkbox-group v-model="aiForm.scenes" class="scene-checkbox-group">
              <el-checkbox label="配电室入口" />
              <el-checkbox label="高压区域" />
              <el-checkbox label="操作台前" />
              <el-checkbox label="变压器区" />
              <el-checkbox label="电缆沟" />
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="告警等级" prop="level">
            <el-radio-group v-model="aiForm.level" class="level-radio-group">
              <el-radio label="critical">
                <span class="level-option critical">严重</span>
              </el-radio>
              <el-radio label="warning">
                <span class="level-option warning">警告</span>
              </el-radio>
              <el-radio label="info">
                <span class="level-option info">提示</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="联动动作">
            <el-checkbox-group v-model="aiForm.actions" class="action-checkbox-group">
              <el-checkbox label="screenshot">截图保存</el-checkbox>
              <el-checkbox label="record">录像留存</el-checkbox>
              <el-checkbox label="broadcast">语音提醒</el-checkbox>
              <el-checkbox label="workorder">生成工单</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="aiDialogVisible = false">取消</button>
          <button class="btn-confirm" @click="submitAIForm">确定</button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Search, CircleCheck, CircleClose, DocumentCopy, Bell, Message,
  Promotion, Microphone, Edit, Delete, Setting, Clock, Check, View,
  Warning, Cpu, Sunny, Monitor, Lock, VideoCamera, Aim
} from '@element-plus/icons-vue'

// ========== 主标签切换 ==========
const activeMainTab = ref('alarm')
const activeStatus = ref('all')
const searchText = ref('')
const aiSearchText = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// ========== 告警策略数据 ==========
const activeAlarmCategory = ref('all')

const alarmCategories = [
  { id: 'all', name: '全部告警', icon: markRaw(Bell), iconClass: 'icon-all' },
  { id: 'power', name: '电力监控', icon: markRaw(Monitor), iconClass: 'icon-power' },
  { id: 'environment', name: '环境监测', icon: markRaw(Sunny), iconClass: 'icon-env' },
  { id: 'security', name: '安防告警', icon: markRaw(Lock), iconClass: 'icon-security' },
  { id: 'device', name: '设备故障', icon: markRaw(Cpu), iconClass: 'icon-device' }
]

interface AlarmStrategy {
  id: number
  name: string
  alarmType: string
  category: string
  condition: string
  level: string
  notifyMethods: string[]
  enabled: boolean
  isDefault?: boolean
}

const alarmStrategies = ref<AlarmStrategy[]>([
  {
    id: 1,
    name: '高压越限告警',
    alarmType: 'voltage',
    category: 'power',
    condition: '电压 > 10.5kV 持续30秒',
    level: 'critical',
    notifyMethods: ['system', 'sms', 'voice'],
    enabled: true,
    isDefault: true
  },
  {
    id: 2,
    name: '低压越限告警',
    alarmType: 'voltage',
    category: 'power',
    condition: '电压 < 9.5kV 持续30秒',
    level: 'critical',
    notifyMethods: ['system', 'sms'],
    enabled: true
  },
  {
    id: 3,
    name: '变压器温度过高',
    alarmType: 'temperature',
    category: 'environment',
    condition: '温度 > 85°C',
    level: 'warning',
    notifyMethods: ['system', 'email'],
    enabled: true
  },
  {
    id: 4,
    name: '环境湿度异常',
    alarmType: 'humidity',
    category: 'environment',
    condition: '湿度 > 80% 或 < 30%',
    level: 'warning',
    notifyMethods: ['system'],
    enabled: true
  },
  {
    id: 5,
    name: '通信中断告警',
    alarmType: 'communication',
    category: 'device',
    condition: '设备离线 > 60秒',
    level: 'critical',
    notifyMethods: ['system', 'sms', 'email'],
    enabled: true
  },
  {
    id: 6,
    name: '局放预警',
    alarmType: 'pd',
    category: 'power',
    condition: '局放值 > 警戒阈值',
    level: 'warning',
    notifyMethods: ['system', 'email'],
    enabled: false
  }
])

const selectedStrategies = ref<AlarmStrategy[]>([])

const getCategoryCount = (categoryId: string) => {
  if (categoryId === 'all') return alarmStrategies.value.length
  return alarmStrategies.value.filter(s => s.category === categoryId).length
}

const strategyCount = computed(() => {
  const strategies = activeMainTab.value === 'alarm' ? alarmStrategies.value : aiStrategies.value
  return {
    all: strategies.length,
    enabled: strategies.filter(s => s.enabled).length,
    disabled: strategies.filter(s => !s.enabled).length
  }
})

const filteredAlarmStrategies = computed(() => {
  return alarmStrategies.value.filter(s => {
    const matchCategory = activeAlarmCategory.value === 'all' || s.category === activeAlarmCategory.value
    const matchStatus = activeStatus.value === 'all' ||
      (activeStatus.value === 'enabled' && s.enabled) ||
      (activeStatus.value === 'disabled' && !s.enabled)
    const matchSearch = !searchText.value || s.name.includes(searchText.value)
    return matchCategory && matchStatus && matchSearch
  })
})

const getAlarmTypeText = (type: string) => {
  const map: Record<string, string> = {
    voltage: '电压异常',
    current: '电流异常',
    temperature: '温度异常',
    humidity: '湿度异常',
    switch: '开关状态',
    communication: '通信故障',
    pd: '局放预警'
  }
  return map[type] || type
}

const getLevelText = (level: string) => {
  const map: Record<string, string> = { critical: '严重', warning: '警告', info: '提示' }
  return map[level] || level
}

// ========== AI策略数据 ==========
const activeAICategory = ref('all')

const aiCategories = [
  { id: 'all', name: '全部AI策略', icon: markRaw(Cpu), iconClass: 'icon-all' },
  { id: 'safety', name: '安全防护', icon: markRaw(Warning), iconClass: 'icon-safety' },
  { id: 'fire', name: '消防检测', icon: markRaw(Aim), iconClass: 'icon-fire' },
  { id: 'intrusion', name: '入侵检测', icon: markRaw(VideoCamera), iconClass: 'icon-intrusion' },
  { id: 'device', name: '设备识别', icon: markRaw(Monitor), iconClass: 'icon-device' }
]

interface AIStrategy {
  id: number
  name: string
  category: string
  sensitivity: number
  confidenceThreshold: number
  detectInterval: number
  scenes: string[]
  level: string
  enabled: boolean
}

const aiStrategies = ref<AIStrategy[]>([
  {
    id: 1,
    name: '安全帽佩戴检测',
    category: 'helmet',
    sensitivity: 85,
    confidenceThreshold: 75,
    detectInterval: 5,
    scenes: ['配电室入口', '高压区域'],
    level: 'warning',
    enabled: true
  },
  {
    id: 2,
    name: '工服穿戴检测',
    category: 'uniform',
    sensitivity: 80,
    confidenceThreshold: 70,
    detectInterval: 10,
    scenes: ['配电室入口'],
    level: 'info',
    enabled: true
  },
  {
    id: 3,
    name: '火焰检测',
    category: 'fire',
    sensitivity: 95,
    confidenceThreshold: 85,
    detectInterval: 2,
    scenes: ['高压区域', '变压器区', '电缆沟'],
    level: 'critical',
    enabled: true
  },
  {
    id: 4,
    name: '烟雾检测',
    category: 'smoke',
    sensitivity: 90,
    confidenceThreshold: 80,
    detectInterval: 3,
    scenes: ['高压区域', '变压器区'],
    level: 'critical',
    enabled: true
  },
  {
    id: 5,
    name: '区域入侵检测',
    category: 'intrusion',
    sensitivity: 75,
    confidenceThreshold: 70,
    detectInterval: 5,
    scenes: ['高压区域', '操作台前'],
    level: 'warning',
    enabled: false
  },
  {
    id: 6,
    name: '人员聚集检测',
    category: 'gathering',
    sensitivity: 70,
    confidenceThreshold: 65,
    detectInterval: 15,
    scenes: ['配电室入口'],
    level: 'info',
    enabled: false
  }
])

const getAICategoryCount = (categoryId: string) => {
  if (categoryId === 'all') return aiStrategies.value.length
  const categoryMap: Record<string, string[]> = {
    safety: ['helmet', 'uniform'],
    fire: ['fire', 'smoke'],
    intrusion: ['intrusion', 'gathering'],
    device: ['device']
  }
  return aiStrategies.value.filter(s => categoryMap[categoryId]?.includes(s.category)).length
}

const filteredAIStrategies = computed(() => {
  return aiStrategies.value.filter(s => {
    const matchStatus = activeStatus.value === 'all' ||
      (activeStatus.value === 'enabled' && s.enabled) ||
      (activeStatus.value === 'disabled' && !s.enabled)
    const matchSearch = !aiSearchText.value || s.name.includes(aiSearchText.value)
    return matchStatus && matchSearch
  })
})

const getAICategoryText = (category: string) => {
  const map: Record<string, string> = {
    helmet: '安全帽检测',
    uniform: '工服检测',
    fire: '火焰检测',
    smoke: '烟雾检测',
    intrusion: '区域入侵',
    gathering: '人员聚集',
    device: '设备状态'
  }
  return map[category] || category
}

const getAIIcon = (category: string) => {
  const map: Record<string, any> = {
    helmet: Warning,
    uniform: Warning,
    fire: Aim,
    smoke: Aim,
    intrusion: VideoCamera,
    gathering: VideoCamera,
    device: Monitor
  }
  return map[category] || Cpu
}

// ========== 模板数据 ==========
const templateType = ref('all')

interface StrategyTemplate {
  id: number
  name: string
  type: 'alarm' | 'ai'
  description: string
  strategyCount: number
  updateTime: string
  isSystem: boolean
}

const templates = ref<StrategyTemplate[]>([
  {
    id: 1,
    name: '标准配电室告警模板',
    type: 'alarm',
    description: '适用于标准10kV配电室的基础告警策略配置，包含电压、温度、湿度等常用监测项',
    strategyCount: 12,
    updateTime: '2024-12-01',
    isSystem: true
  },
  {
    id: 2,
    name: '高安全等级告警模板',
    type: 'alarm',
    description: '适用于重要负荷配电室，告警阈值更严格，通知方式更全面',
    strategyCount: 18,
    updateTime: '2024-12-01',
    isSystem: true
  },
  {
    id: 3,
    name: '基础AI识别模板',
    type: 'ai',
    description: '包含安全帽、工服检测等基础安全AI识别策略',
    strategyCount: 6,
    updateTime: '2024-12-01',
    isSystem: true
  },
  {
    id: 4,
    name: '全功能AI模板',
    type: 'ai',
    description: '启用所有AI识别功能，包括消防、入侵、设备状态等',
    strategyCount: 10,
    updateTime: '2024-12-01',
    isSystem: true
  },
  {
    id: 5,
    name: '自定义告警模板1',
    type: 'alarm',
    description: '根据实际运维需求定制的告警策略模板',
    strategyCount: 8,
    updateTime: '2024-11-28',
    isSystem: false
  }
])

const filteredTemplates = computed(() => {
  if (templateType.value === 'all') return templates.value
  if (templateType.value === 'system') return templates.value.filter(t => t.isSystem)
  return templates.value.filter(t => t.type === templateType.value)
})

// ========== 弹窗与表单 ==========
const alarmDialogVisible = ref(false)
const aiDialogVisible = ref(false)
const isEdit = ref(false)
const alarmFormRef = ref()
const aiFormRef = ref()

interface AlarmForm {
  name: string
  alarmType: string
  conditionType: string
  threshold1: number
  threshold2: number
  unit: string
  duration: number
  level: string
  notifyMethods: string[]
  applyScope: string[]
  description: string
}

const alarmForm = ref<AlarmForm>({
  name: '',
  alarmType: '',
  conditionType: 'gt',
  threshold1: 0,
  threshold2: 0,
  unit: 'V',
  duration: 0,
  level: 'warning',
  notifyMethods: ['system'],
  applyScope: ['all'],
  description: ''
})

interface AIForm {
  name: string
  category: string
  sensitivity: number
  confidenceThreshold: number
  detectInterval: number
  scenes: string[]
  level: string
  actions: string[]
}

const aiForm = ref<AIForm>({
  name: '',
  category: '',
  sensitivity: 80,
  confidenceThreshold: 70,
  detectInterval: 5,
  scenes: [],
  level: 'warning',
  actions: ['screenshot']
})

const alarmRules = {
  name: [{ required: true, message: '请输入策略名称', trigger: 'blur' }],
  alarmType: [{ required: true, message: '请选择告警类型', trigger: 'change' }],
  level: [{ required: true, message: '请选择告警等级', trigger: 'change' }]
}

const aiRules = {
  name: [{ required: true, message: '请输入策略名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择识别类型', trigger: 'change' }],
  level: [{ required: true, message: '请选择告警等级', trigger: 'change' }]
}

// ========== 操作函数 ==========
const handleSelectionChange = (selection: AlarmStrategy[]) => {
  selectedStrategies.value = selection
}

const handleStatusChange = (row: AlarmStrategy) => {
  ElMessage.success(`策略"${row.name}"已${row.enabled ? '启用' : '禁用'}`)
}

const handleAIStatusChange = (row: AIStrategy) => {
  ElMessage.success(`AI策略"${row.name}"已${row.enabled ? '启用' : '禁用'}`)
}

const batchEnable = () => {
  if (selectedStrategies.value.length === 0) {
    ElMessage.warning('请先选择策略')
    return
  }
  selectedStrategies.value.forEach(s => { s.enabled = true })
  ElMessage.success(`已批量启用 ${selectedStrategies.value.length} 条策略`)
}

const batchDisable = () => {
  if (selectedStrategies.value.length === 0) {
    ElMessage.warning('请先选择策略')
    return
  }
  selectedStrategies.value.forEach(s => { s.enabled = false })
  ElMessage.success(`已批量禁用 ${selectedStrategies.value.length} 条策略`)
}

const showCreateDialog = (type: 'alarm' | 'ai') => {
  isEdit.value = false
  if (type === 'alarm') {
    alarmForm.value = {
      name: '',
      alarmType: '',
      conditionType: 'gt',
      threshold1: 0,
      threshold2: 0,
      unit: 'V',
      duration: 0,
      level: 'warning',
      notifyMethods: ['system'],
      applyScope: ['all'],
      description: ''
    }
    alarmDialogVisible.value = true
  } else {
    aiForm.value = {
      name: '',
      category: '',
      sensitivity: 80,
      confidenceThreshold: 70,
      detectInterval: 5,
      scenes: [],
      level: 'warning',
      actions: ['screenshot']
    }
    aiDialogVisible.value = true
  }
}

const editStrategy = (row: AlarmStrategy) => {
  isEdit.value = true
  alarmForm.value = {
    name: row.name,
    alarmType: row.alarmType,
    conditionType: 'gt',
    threshold1: 0,
    threshold2: 0,
    unit: 'V',
    duration: 0,
    level: row.level,
    notifyMethods: [...row.notifyMethods],
    applyScope: ['all'],
    description: ''
  }
  alarmDialogVisible.value = true
}

const deleteStrategy = (row: AlarmStrategy) => {
  ElMessageBox.confirm(`确定要删除策略"${row.name}"吗？`, '删除确认', {
    type: 'warning'
  }).then(() => {
    const index = alarmStrategies.value.findIndex(s => s.id === row.id)
    if (index > -1) {
      alarmStrategies.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const editAIStrategy = (row: AIStrategy) => {
  isEdit.value = true
  aiForm.value = {
    name: row.name,
    category: row.category,
    sensitivity: row.sensitivity,
    confidenceThreshold: row.confidenceThreshold,
    detectInterval: row.detectInterval,
    scenes: [...row.scenes],
    level: row.level,
    actions: ['screenshot']
  }
  aiDialogVisible.value = true
}

const deleteAIStrategy = (row: AIStrategy) => {
  ElMessageBox.confirm(`确定要删除AI策略"${row.name}"吗？`, '删除确认', {
    type: 'warning'
  }).then(() => {
    const index = aiStrategies.value.findIndex(s => s.id === row.id)
    if (index > -1) {
      aiStrategies.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const submitAlarmForm = async () => {
  try {
    await alarmFormRef.value?.validate()
    ElMessage.success(isEdit.value ? '策略修改成功' : '策略创建成功')
    alarmDialogVisible.value = false
  } catch (e) {
    // validation failed
  }
}

const submitAIForm = async () => {
  try {
    await aiFormRef.value?.validate()
    ElMessage.success(isEdit.value ? 'AI策略修改成功' : 'AI策略创建成功')
    aiDialogVisible.value = false
  } catch (e) {
    // validation failed
  }
}

const importFromTemplate = () => {
  activeMainTab.value = 'template'
}

const createTemplate = () => {
  ElMessage.info('创建模板功能开发中')
}

const applyTemplate = (template: StrategyTemplate) => {
  ElMessageBox.confirm(`确定要应用模板"${template.name}"吗？这将覆盖当前的策略配置。`, '应用模板', {
    type: 'warning'
  }).then(() => {
    ElMessage.success(`模板"${template.name}"应用成功`)
  }).catch(() => {})
}

const previewTemplate = (template: StrategyTemplate) => {
  ElMessage.info(`预览模板: ${template.name}`)
}

const editTemplate = (template: StrategyTemplate) => {
  ElMessage.info(`编辑模板: ${template.name}`)
}
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

.strategy-config-page {
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

/* 主标签容器 */
.main-tabs-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  background: transparent;
  gap: 20px;
}

.content-wrapper {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 主标签 - 科技切角风格 */
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
  position: relative;
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
  box-shadow: inset 0 0 20px rgba(0, 240, 255, 0.1);
}

/* 状态标签 */
.status-tabs-inline {
  display: flex;
  gap: 8px;
}

.status-tab-inline {
  padding: 8px 20px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  color: var(--text-sub);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
}

.status-tab-inline:hover {
  border-color: var(--tech-primary);
  color: var(--tech-primary);
}

.status-tab-inline.active {
  background: rgba(0, 240, 255, 0.15);
  border-color: var(--tech-primary);
  color: var(--text-bright);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}

.status-tab-inline .count {
  color: var(--tech-primary);
  margin-left: 4px;
  font-family: 'DIN Alternate', sans-serif;
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
  width: 220px;
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
  transform: translateY(-1px);
}

.tree-item {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  color: var(--text-sub);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  margin: 2px 0;
  border-left: 2px solid transparent;
  gap: 10px;
}

.tree-item:hover {
  background: rgba(0, 240, 255, 0.05);
  color: var(--text-bright);
  border-left-color: var(--tech-primary);
}

.tree-item.active {
  background: linear-gradient(to right, rgba(0, 240, 255, 0.1) 0%, transparent 100%);
  color: var(--text-bright);
  border-left-color: var(--tech-primary);
}

.tree-item .el-icon {
  font-size: 16px;
  color: var(--tech-primary);
}

.tree-label {
  flex: 1;
}

.tree-count {
  font-size: 12px;
  color: var(--tech-primary);
  font-family: 'DIN Alternate', sans-serif;
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
  width: 260px;
  clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
  transition: all 0.3s;
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
.strategy-table-container {
  flex: 1;
  border: 1px solid rgba(0, 240, 255, 0.15);
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);
  position: relative;
}

.strategy-table-container::before {
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

.strategy-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.strategy-name-cell .name {
  color: var(--text-bright);
  font-weight: 600;
}

.default-badge {
  font-size: 10px;
  padding: 2px 6px;
  background: rgba(0, 240, 255, 0.2);
  border: 1px solid var(--tech-primary);
  color: var(--tech-primary);
  border-radius: 2px;
}

.type-tag {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.3);
  color: var(--tech-primary);
  font-size: 12px;
}

.condition-text {
  color: var(--text-sub);
  font-size: 12px;
}

.level-badge {
  display: inline-block;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 2px;
}

.level-badge.critical {
  background: rgba(255, 42, 77, 0.2);
  border: 1px solid var(--status-danger);
  color: var(--status-danger);
}

.level-badge.warning {
  background: rgba(255, 179, 0, 0.2);
  border: 1px solid var(--status-warning);
  color: var(--status-warning);
}

.level-badge.info {
  background: rgba(0, 240, 255, 0.2);
  border: 1px solid var(--tech-primary);
  color: var(--tech-primary);
}

.notify-icons {
  display: flex;
  gap: 8px;
}

.notify-icon {
  font-size: 16px;
  color: var(--tech-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.notify-icon:hover {
  color: var(--text-bright);
  text-shadow: 0 0 8px var(--tech-primary);
}

/* 分页栏 */
.pagination-bar {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
}

/* ========== AI策略卡片样式 ========== */
.ai-panel {
  overflow-y: auto;
}

.ai-strategy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 4px;
}

.ai-strategy-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  padding: 20px;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.ai-strategy-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--tech-primary), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.ai-strategy-card:hover {
  border-color: var(--tech-primary);
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);
}

.ai-strategy-card:hover::before {
  opacity: 1;
}

.ai-strategy-card.disabled {
  opacity: 0.6;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
}

.card-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid;
  font-size: 24px;
}

.card-icon.helmet, .card-icon.uniform {
  color: var(--status-warning);
  border-color: var(--status-warning);
  background: rgba(255, 179, 0, 0.1);
}

.card-icon.fire, .card-icon.smoke {
  color: var(--status-danger);
  border-color: var(--status-danger);
  background: rgba(255, 42, 77, 0.1);
}

.card-icon.intrusion, .card-icon.gathering {
  color: var(--tech-primary);
  border-color: var(--tech-primary);
  background: rgba(0, 240, 255, 0.1);
}

.card-icon.device {
  color: var(--status-success);
  border-color: var(--status-success);
  background: rgba(0, 255, 157, 0.1);
}

.card-title {
  flex: 1;
}

.card-title .name {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-bright);
  margin-bottom: 4px;
}

.card-title .category {
  font-size: 12px;
  color: var(--text-sub);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.config-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.config-item .label {
  font-size: 12px;
  color: var(--text-sub);
}

.config-item .value {
  font-size: 13px;
  color: var(--text-bright);
  font-family: 'DIN Alternate', sans-serif;
}

.config-item .value.highlight {
  color: var(--tech-primary);
  text-shadow: 0 0 5px rgba(0, 240, 255, 0.3);
}

.sensitivity-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  max-width: 150px;
}

.bar-fill {
  height: 6px;
  background: linear-gradient(90deg, var(--tech-primary), var(--status-success));
  border-radius: 3px;
  flex: 1;
  position: relative;
}

.sensitivity-bar .value {
  min-width: 40px;
  text-align: right;
}

.scene-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.scene-tag {
  font-size: 11px;
  padding: 2px 8px;
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.3);
  color: var(--tech-primary);
}

.card-footer {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 240, 255, 0.1);
}

.card-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;
  background: transparent;
}

.card-btn.edit {
  border-color: var(--tech-primary);
  color: var(--tech-primary);
}

.card-btn.edit:hover {
  background: rgba(0, 240, 255, 0.1);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}

.card-btn.delete {
  border-color: var(--status-danger);
  color: var(--status-danger);
}

.card-btn.delete:hover {
  background: rgba(255, 42, 77, 0.1);
  box-shadow: 0 0 10px rgba(255, 42, 77, 0.3);
}

/* ========== 模板面板样式 ========== */
.template-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow: hidden;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.template-type-switch :deep(.el-radio-button__inner) {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 240, 255, 0.2);
  color: var(--text-sub);
}

.template-type-switch :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: rgba(0, 240, 255, 0.15);
  border-color: var(--tech-primary);
  color: var(--tech-primary);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
  overflow-y: auto;
  padding: 4px;
}

.template-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  padding: 24px;
  transition: all 0.3s;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.template-card:hover {
  border-color: var(--tech-primary);
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);
}

.template-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 10px;
  padding: 4px 8px;
  background: rgba(0, 255, 157, 0.2);
  border: 1px solid var(--status-success);
  color: var(--status-success);
}

.template-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  border: 1px solid var(--tech-primary);
  color: var(--tech-primary);
  background: rgba(0, 240, 255, 0.1);
}

.template-card.ai .template-icon {
  border-color: var(--status-warning);
  color: var(--status-warning);
  background: rgba(255, 179, 0, 0.1);
}

.template-info {
  flex: 1;
}

.template-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-bright);
  margin: 0 0 8px 0;
}

.template-desc {
  font-size: 13px;
  color: var(--text-sub);
  line-height: 1.5;
  margin: 0 0 12px 0;
}

.template-meta {
  display: flex;
  gap: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
}

.meta-item .el-icon {
  color: var(--tech-primary);
}

.template-actions {
  display: flex;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 240, 255, 0.1);
}

.template-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;
  background: transparent;
}

.template-btn.apply {
  border-color: var(--status-success);
  color: var(--status-success);
}

.template-btn.apply:hover {
  background: rgba(0, 255, 157, 0.1);
  box-shadow: 0 0 10px rgba(0, 255, 157, 0.3);
}

.template-btn.preview {
  border-color: var(--tech-primary);
  color: var(--tech-primary);
}

.template-btn.preview:hover {
  background: rgba(0, 240, 255, 0.1);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}

.template-btn.edit {
  border-color: var(--status-warning);
  color: var(--status-warning);
}

.template-btn.edit:hover {
  background: rgba(255, 179, 0, 0.1);
  box-shadow: 0 0 10px rgba(255, 179, 0, 0.3);
}

/* ========== 弹窗样式 ========== */
.strategy-form {
  padding: 20px;
}

.condition-builder {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.condition-separator {
  color: var(--text-sub);
  font-size: 16px;
}

.form-hint {
  margin-left: 10px;
  font-size: 12px;
  color: var(--text-muted);
}

.level-radio-group {
  display: flex;
  gap: 20px;
}

.level-option {
  font-weight: 600;
}

.level-option.critical {
  color: var(--status-danger);
}

.level-option.warning {
  color: var(--status-warning);
}

.level-option.info {
  color: var(--tech-primary);
}

.notify-checkbox-group,
.scene-checkbox-group,
.action-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.slider-container {
  width: 100%;
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

/* 滚动条样式 */
.left-tree-panel::-webkit-scrollbar,
.ai-panel::-webkit-scrollbar,
.template-grid::-webkit-scrollbar {
  width: 8px;
}

.left-tree-panel::-webkit-scrollbar-track,
.ai-panel::-webkit-scrollbar-track,
.template-grid::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

.left-tree-panel::-webkit-scrollbar-thumb,
.ai-panel::-webkit-scrollbar-thumb,
.template-grid::-webkit-scrollbar-thumb {
  background: rgba(0, 240, 255, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.4);
}

.left-tree-panel::-webkit-scrollbar-thumb:hover,
.ai-panel::-webkit-scrollbar-thumb:hover,
.template-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 240, 255, 0.3);
}
</style>

<style>
/* el-table SC2 科技风格 */
.strategy-config-page .el-table {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(0, 240, 255, 0.05);
  --el-table-header-text-color: #00f3ff;
  --el-table-text-color: #e2e8f0;
  --el-table-border-color: rgba(0, 240, 255, 0.15);
  --el-table-row-hover-bg-color: rgba(0, 240, 255, 0.08);
  background: transparent !important;
}

.strategy-config-page .el-table th.el-table__cell {
  background: rgba(0, 240, 255, 0.05) !important;
  color: #00f3ff !important;
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 2px solid rgba(0, 240, 255, 0.2) !important;
}

.strategy-config-page .el-table td.el-table__cell {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  color: #e2e8f0;
  font-size: 13px;
}

.strategy-config-page .el-table__body tr:hover > td.el-table__cell {
  background: rgba(0, 240, 255, 0.08) !important;
}

.strategy-config-page .el-checkbox__inner {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 240, 255, 0.4);
}

.strategy-config-page .el-checkbox__input.is-checked .el-checkbox__inner {
  background: #00f3ff;
  border-color: #00f3ff;
}

/* Switch 样式 */
.strategy-config-page .el-switch.is-checked .el-switch__core {
  border-color: #00f3ff;
  background-color: rgba(0, 240, 255, 0.3);
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

.sc2-dialog .el-slider__runway {
  background: rgba(0, 240, 255, 0.1);
}

.sc2-dialog .el-slider__bar {
  background: linear-gradient(90deg, #00f3ff, #00E676);
}

.sc2-dialog .el-slider__button {
  border-color: #00f3ff;
}

/* Pagination 样式 */
.strategy-config-page .el-pagination {
  --el-pagination-bg-color: transparent;
  --el-pagination-text-color: var(--text-sub);
  --el-pagination-button-bg-color: rgba(0, 0, 0, 0.3);
  --el-pagination-hover-color: #00f3ff;
}

.strategy-config-page .el-pagination .el-pager li {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.strategy-config-page .el-pagination .el-pager li.is-active {
  background: rgba(0, 240, 255, 0.15);
  border-color: #00f3ff;
  color: #00f3ff;
}
</style>
