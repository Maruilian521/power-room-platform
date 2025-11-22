<template>
  <div class="page-container room-ledger-detail">
    <!-- Header Section -->
    <div class="module-card mb-4">
      <div class="detail-header">
        <div class="header-left">
          <el-button link class="back-btn" @click="goBack">
            <el-icon><ArrowLeft /></el-icon> 返回台账列表
          </el-button>
          <div class="title-group">
            <h1 class="room-name">{{ roomInfo.name }}</h1>
            <el-tag effect="dark" type="info" class="code-tag">{{ roomInfo.code }}</el-tag>
            <el-tag effect="dark" :type="roomInfo.status === 'active' ? 'success' : 'danger'">
              {{ roomInfo.status === 'active' ? '在运' : '停运' }}
            </el-tag>
          </div>
        </div>
        <div class="header-right">
          <el-button type="primary" icon="Edit">编辑信息</el-button>
          <el-button icon="Printer">打印档案</el-button>
        </div>
      </div>
    </div>

    <!-- Main Content Tabs -->
    <div class="module-card flex-1 overflow-hidden flex-col">
      <el-tabs v-model="activeTab" class="sc2-tabs h-full flex flex-col">
        
        <!-- Tab 1: Basic Information -->
        <el-tab-pane label="基础属性" name="basic" class="h-full overflow-auto">
          <div class="p-4">
            <el-descriptions title="基本信息" :column="3" border class="sc2-descriptions mb-6">
              <el-descriptions-item label="站点名称">{{ roomInfo.name }}</el-descriptions-item>
              <el-descriptions-item label="行政区域">{{ roomInfo.region }}</el-descriptions-item>
              <el-descriptions-item label="详细地址">{{ roomInfo.location }}</el-descriptions-item>
              <el-descriptions-item label="投运日期">{{ roomInfo.commissionDate }}</el-descriptions-item>
              <el-descriptions-item label="设计寿命">30 年</el-descriptions-item>
              <el-descriptions-item label="建筑面积">120 平方米</el-descriptions-item>
              <el-descriptions-item label="产权性质">自有资产</el-descriptions-item>
              <el-descriptions-item label="电压等级">10kV / 0.4kV</el-descriptions-item>
              <el-descriptions-item label="变压器容量">2000 kVA</el-descriptions-item>
            </el-descriptions>

            <el-descriptions title="管理信息" :column="3" border class="sc2-descriptions">
              <el-descriptions-item label="资产负责人">{{ roomInfo.manager }}</el-descriptions-item>
              <el-descriptions-item label="联系电话">{{ roomInfo.phone }}</el-descriptions-item>
              <el-descriptions-item label="运维班组">城南检修一班</el-descriptions-item>
              <el-descriptions-item label="上次盘点">2023-10-15</el-descriptions-item>
              <el-descriptions-item label="盘点状态"><span class="text-success">账实相符</span></el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>

        <!-- Tab 2: Asset List -->
        <el-tab-pane label="关联资产 (Equipment)" name="assets" class="h-full flex flex-col">
          <div class="tab-toolbar p-4 pb-0 flex justify-between">
            <div class="stats">
              共关联设备 <span class="text-primary font-bold">12</span> 台，
              总价值 <span class="text-warning font-bold">¥ 4,500,000</span>
            </div>
            <el-input v-model="assetSearch" placeholder="搜索设备..." prefix-icon="Search" class="w-64 sc2-input" />
          </div>
          <div class="flex-1 p-4">
            <el-table :data="assets" class="sc2-table h-full" stripe>
              <el-table-column prop="name" label="设备名称" />
              <el-table-column prop="code" label="资产编号" />
              <el-table-column prop="type" label="类型" />
              <el-table-column prop="model" label="型号" />
              <el-table-column prop="installDate" label="安装日期" />
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag size="small" :type="row.status === 'normal' ? 'success' : 'warning'">{{ row.status === 'normal' ? '正常' : '异常' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default>
                  <el-button link type="primary" size="small">详情</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- Tab 3: Documents -->
        <el-tab-pane label="档案资料 (Docs)" name="docs" class="h-full">
          <div class="p-4 grid grid-cols-4 gap-4">
            <div v-for="doc in docs" :key="doc.id" class="doc-card">
              <div class="doc-icon"><el-icon><Document /></el-icon></div>
              <div class="doc-info">
                <div class="doc-name">{{ doc.name }}</div>
                <div class="doc-meta">{{ doc.type }} | {{ doc.size }}</div>
                <div class="doc-date">{{ doc.date }}</div>
              </div>
              <div class="doc-actions">
                <el-button circle size="small" icon="Download" />
                <el-button circle size="small" icon="View" />
              </div>
            </div>
            <!-- Add New Doc -->
            <div class="doc-card add-card">
              <el-icon><Plus /></el-icon>
              <span>上传新文档</span>
            </div>
          </div>
        </el-tab-pane>

        <!-- Tab 4: History -->
        <el-tab-pane label="变更记录 (History)" name="history" class="h-full p-4">
          <el-timeline>
            <el-timeline-item timestamp="2023-11-01" placement="top" type="primary">
              <div class="timeline-content">
                <h4>资产盘点</h4>
                <p>年度例行资产盘点，确认无误。操作人：张三</p>
              </div>
            </el-timeline-item>
            <el-timeline-item timestamp="2023-06-15" placement="top" type="warning">
              <div class="timeline-content">
                <h4>设备更换</h4>
                <p>更换 2# 电容器组 (SN: CAP-2019-888 -> CAP-2023-001)。操作人：李四</p>
              </div>
            </el-timeline-item>
            <el-timeline-item timestamp="2020-11-29" placement="top" type="success">
              <div class="timeline-content">
                <h4>建档投运</h4>
                <p>配电室正式投入运行，建立电子台账。</p>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>

      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Document, Plus } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const activeTab = ref('basic')
const assetSearch = ref('')

// Mock Data
const roomInfo = ref({
  id: route.params.id,
  name: '未知站点',
  code: 'UNKNOWN',
  region: '--',
  location: '--',
  commissionDate: '--',
  manager: '--',
  phone: '--',
  status: 'active'
})

const assets = ref([
  { name: '1# 变压器', code: 'AST-001', type: '变压器', model: 'SCB10-1000/10', installDate: '2020-11-29', status: 'normal' },
  { name: '高压进线柜', code: 'AST-002', type: '开关柜', model: 'KYN28-12', installDate: '2020-11-29', status: 'normal' },
  { name: '低压进线柜', code: 'AST-003', type: '开关柜', model: 'GCS', installDate: '2020-11-29', status: 'warning' },
])

const docs = ref([
  { id: 1, name: '房产证明.pdf', type: 'PDF', size: '2.4MB', date: '2020-11-01' },
  { id: 2, name: '一次接线图.dwg', type: 'CAD', size: '5.1MB', date: '2020-11-15' },
  { id: 3, name: '消防验收报告.jpg', type: 'IMG', size: '1.2MB', date: '2020-12-01' },
])

// Load Data
onMounted(() => {
  // Simulate fetch
  if (route.params.id) {
    roomInfo.value = {
      id: route.params.id as string,
      name: '海淀区 No.1 配电室',
      code: 'AST-RM-0001',
      region: '海淀区',
      location: '海淀区某街道1号',
      commissionDate: '2020-11-29',
      manager: '郭丽',
      phone: '14484553926',
      status: 'active'
    }
  }
})

const goBack = () => {
  router.push('/assets/rooms')
}
</script>

<style scoped>
.room-ledger-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  gap: 16px;
}

/* Header */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.back-btn {
  color: var(--text-sub);
  font-size: 14px;
  padding: 0;
  justify-content: flex-start;
}
.back-btn:hover { color: var(--tech-primary); }

.title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.room-name {
  font-family: 'Microsoft YaHei';
  font-size: 24px;
  color: var(--text-bright);
  margin: 0;
  font-weight: bold;
  letter-spacing: 1px;
}

.code-tag {
  font-family: 'Rajdhani';
  font-weight: bold;
}

/* Tabs Styling */
:deep(.el-tabs__header) {
  margin-bottom: 0;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  background: rgba(0,0,0,0.2);
  padding: 0 20px;
}

:deep(.el-tabs__item) {
  color: var(--text-sub);
  height: 50px;
  line-height: 50px;
  font-size: 14px;
}

:deep(.el-tabs__item.is-active) {
  color: var(--tech-primary);
  font-weight: bold;
}

:deep(.el-tabs__nav-wrap::after) {
  background-color: transparent;
}

:deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
  padding: 0;
}

/* Descriptions Override */
:deep(.sc2-descriptions .el-descriptions__label) {
  width: 120px;
  background: rgba(0, 240, 255, 0.05);
}

/* Docs Cards */
.doc-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
}
.doc-card:hover {
  border-color: var(--tech-primary);
  background: rgba(0, 240, 255, 0.05);
}

.doc-icon {
  font-size: 32px;
  color: var(--tech-secondary);
}

.doc-info {
  flex: 1;
  overflow: hidden;
}

.doc-name {
  color: var(--text-bright);
  font-weight: bold;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doc-meta {
  font-size: 12px;
  color: var(--text-sub);
  font-family: 'Rajdhani';
}

.doc-date {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.doc-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.add-card {
  justify-content: center;
  flex-direction: column;
  border: 1px dashed rgba(255,255,255,0.2);
  cursor: pointer;
  color: var(--text-sub);
}
.add-card:hover {
  color: var(--tech-primary);
  border-color: var(--tech-primary);
}

/* Timeline */
.timeline-content h4 {
  margin: 0 0 4px;
  color: var(--text-bright);
}
.timeline-content p {
  margin: 0;
  color: var(--text-sub);
  font-size: 13px;
}
</style>
