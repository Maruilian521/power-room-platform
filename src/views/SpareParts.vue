<template>
  <div class="page-container spare-parts">
    <!-- 顶部统计 Dashboard -->
    <div class="stats-dashboard grid grid-cols-5 gap-4 mb-4">
      <div class="stat-card-item primary">
        <div class="icon-wrapper"><el-icon><Box /></el-icon></div>
        <div class="info">
          <div class="label">库存总量</div>
          <div class="value">{{ totalStock }}</div>
        </div>
      </div>
      <div class="stat-card-item warning">
        <div class="icon-wrapper"><el-icon><Warning /></el-icon></div>
        <div class="info">
          <div class="label">库存告警</div>
          <div class="value">{{ lowStockCount }}</div>
        </div>
      </div>
      <div class="stat-card-item danger">
        <div class="icon-wrapper"><el-icon><Timer /></el-icon></div>
        <div class="info">
          <div class="label">即将过期</div>
          <div class="value">{{ expiringCount }}</div>
        </div>
      </div>
      <div class="stat-card-item success">
        <div class="icon-wrapper"><el-icon><Money /></el-icon></div>
        <div class="info">
          <div class="label">库存总值</div>
          <div class="value text-sm">¥{{ totalValue.toLocaleString() }}</div>
        </div>
      </div>
      <div class="stat-card-item info">
        <div class="icon-wrapper"><el-icon><SoldOut /></el-icon></div>
        <div class="info">
          <div class="label">本月消耗</div>
          <div class="value">{{ monthlyUsage }}</div>
        </div>
      </div>
    </div>

    <!-- 主功能区 -->
    <div class="module-card flex-1 flex flex-col overflow-hidden">
      <div class="module-header">
        <div class="header-left">
          <el-icon><List /></el-icon>
          <span>备件库存列表</span>
        </div>
        <div class="header-right toolbar-actions">
          <div class="filter-set">
            <el-input v-model="searchText" placeholder="备件名称/型号/库位..." :prefix-icon="Search" class="sc2-input search-wide" />
            <el-select v-model="filterType" placeholder="备件类型" class="sc2-select w-32" clearable>
              <el-option label="全部" value="" />
              <el-option label="开关柜" value="开关柜" />
              <el-option label="变压器" value="变压器" />
              <el-option label="保护装置" value="保护装置" />
              <el-option label="辅助设备" value="辅助设备" />
            </el-select>
            <el-select v-model="filterStatus" placeholder="状态" class="sc2-select w-32" clearable>
              <el-option label="充足" value="normal" />
              <el-option label="告警" value="low" />
              <el-option label="缺货" value="out" />
            </el-select>
          </div>
          <div class="btn-set">
            <el-button type="primary" icon="Plus" @click="handleInbound">入库</el-button>
            <el-button type="warning" icon="Minus" @click="handleOutbound">出库</el-button>
            <el-button class="sc2-btn-outline" icon="Download">导出</el-button>
          </div>
        </div>
      </div>

      <el-table :data="paginatedData" class="sc2-table flex-1" stripe v-loading="loading">
        <el-table-column prop="name" label="备件名称" min-width="150" show-overflow-tooltip>
            <template #default="{ row }">
                <span class="name-text">{{ row.name }}</span>
                <el-tag v-if="row.stock < row.minStock" size="small" type="danger" effect="dark" class="ml-2">缺货</el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="120">
            <template #default="{ row }">
                <el-tag class="sc2-tag type-tag">{{ row.type }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column label="库存状态" width="200">
            <template #default="{ row }">
                <div class="stock-bar-container">
                    <div class="stock-info">
                        <span :class="getStockColor(row.stock, row.minStock)">{{ row.stock }}</span>
                        <span class="divider">/</span>
                        <span class="min-stock">最低: {{ row.minStock }}</span>
                    </div>
                    <el-progress 
                        :percentage="Math.min((row.stock / (row.minStock * 2)) * 100, 100)" 
                        :status="row.stock < row.minStock ? 'exception' : 'success'"
                        :show-text="false" 
                        :stroke-width="4"
                    />
                </div>
            </template>
        </el-table-column>
        <el-table-column prop="location" label="存放位置" width="150" show-overflow-tooltip />
        <el-table-column prop="supplier" label="供应商" width="180" show-overflow-tooltip />
        <el-table-column label="最近更新" width="160">
            <template #default="{ row }">
                <span class="time-text">{{ formatTime(row.lastUpdate) }}</span>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
                <el-button link type="primary" size="small" @click="viewHistory(row)">流水</el-button>
                <el-button link type="warning" size="small" @click="handleAdjust()">盘点</el-button>
                <el-button link type="danger" size="small" @click="handleScrap()">报废</el-button>
            </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredData.length"
        />
      </div>
    </div>

    <!-- 入库 Dialog -->
    <el-dialog v-model="inboundVisible" title="备件入库登记" width="500px" class="sc2-dialog">
        <el-form :model="inboundForm" label-width="80px">
            <el-form-item label="备件名称">
                <el-input v-model="inboundForm.name" placeholder="请输入名称" />
            </el-form-item>
            <el-form-item label="入库数量">
                <el-input-number v-model="inboundForm.amount" :min="1" />
            </el-form-item>
            <el-form-item label="存放位置">
                <el-input v-model="inboundForm.location" placeholder="例如: A-01-02" />
            </el-form-item>
            <el-form-item label="供应商">
                <el-input v-model="inboundForm.supplier" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="inboundVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmInbound">确认入库</el-button>
        </template>
    </el-dialog>

    <!-- 出库 Dialog (Simple Mock) -->
    <el-dialog v-model="outboundVisible" title="备件领用出库" width="500px" class="sc2-dialog">
        <el-form :model="outboundForm" label-width="80px">
            <el-form-item label="关联工单">
                <el-select v-model="outboundForm.workOrderId" placeholder="选择工单" class="w-full">
                    <el-option label="WO-20231122-01 (维修)" value="WO-01" />
                    <el-option label="WO-20231122-02 (保养)" value="WO-02" />
                </el-select>
            </el-form-item>
            <el-form-item label="领用备件">
                <el-select v-model="outboundForm.spareId" placeholder="选择备件" class="w-full">
                    <el-option v-for="s in spares" :key="s.id" :label="s.name" :value="s.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="领用数量">
                <el-input-number v-model="outboundForm.amount" :min="1" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="outboundVisible = false">取消</el-button>
            <el-button type="warning" @click="confirmOutbound">确认出库</el-button>
        </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Box, Warning, Timer, Money, SoldOut, List, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { SparePart } from '../types'

const loading = ref(false)
const spares = ref<SparePart[]>([])
const searchText = ref('')
const filterType = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(15)

// Stats
const totalStock = computed(() => spares.value.reduce((sum, item) => sum + item.stock, 0))
const lowStockCount = computed(() => spares.value.filter(i => i.stock < i.minStock).length)
const expiringCount = ref(5) // Mock
const totalValue = ref(1258000) // Mock
const monthlyUsage = ref(42) // Mock

// Dialogs
const inboundVisible = ref(false)
const outboundVisible = ref(false)
const inboundForm = ref({ name: '', amount: 1, location: '', supplier: '' })
const outboundForm = ref({ workOrderId: '', spareId: '', amount: 1 })

// Fetch
const fetchSpares = async () => {
    loading.value = true
    try {
        const res = await fetch('/api/spare-parts')
        const data = await res.json()
        spares.value = data.data
    } finally {
        loading.value = false
    }
}

const filteredData = computed(() => {
    return spares.value.filter(item => {
        const matchSearch = !searchText.value || item.name.includes(searchText.value) || item.location.includes(searchText.value)
        const matchType = !filterType.value || item.type === filterType.value
        let matchStatus = true
        if (filterStatus.value === 'low') matchStatus = item.stock < item.minStock && item.stock > 0
        if (filterStatus.value === 'out') matchStatus = item.stock === 0
        if (filterStatus.value === 'normal') matchStatus = item.stock >= item.minStock
        
        return matchSearch && matchType && matchStatus
    })
})

const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredData.value.slice(start, start + pageSize.value)
})

// Helpers
const formatTime = (t: string) => new Date(t).toLocaleDateString()
const getStockColor = (stock: number, min: number) => {
    if (stock === 0) return 'text-gray-500'
    if (stock < min) return 'text-danger font-bold'
    return 'text-success font-bold'
}

// Actions
const handleInbound = () => inboundVisible.value = true
const handleOutbound = () => outboundVisible.value = true
const confirmInbound = () => {
    ElMessage.success('入库成功')
    inboundVisible.value = false
}
const confirmOutbound = () => {
    ElMessage.success('出库成功，已关联工单')
    outboundVisible.value = false
}
const viewHistory = (row: any) => ElMessage.info(`查看 ${row.name} ���水记录`)
const handleAdjust = () => ElMessage.info('盘点功能开发中')
const handleScrap = () => ElMessage.warning('报废需审批')

onMounted(() => {
    fetchSpares()
})
</script>

<style scoped>
.spare-parts {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 20px;
    gap: 16px;
}

/* Stats */
.stats-dashboard {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
}
.stat-card-item {
    /* Inherits global */
    padding: 16px;
    gap: 12px;
}
.stat-card-item .value { font-size: 24px; }
.text-sm { font-size: 18px !important; }

/* Header */
.module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid rgba(0, 240, 255, 0.1);
    padding-bottom: 10px;
}
.header-left {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    font-family: 'Orbitron';
    color: var(--tech-primary);
}
.toolbar-actions {
    display: flex;
    gap: 20px;
}
.filter-set { display: flex; gap: 10px; }
.btn-set { display: flex; gap: 10px; padding-left: 20px; border-left: 1px solid rgba(255,255,255,0.1); }
.search-wide { width: 240px; }

/* Table */
.name-text { font-weight: bold; color: var(--text-bright); }
.type-tag {
    background: rgba(0,240,255,0.1);
    border: 1px solid rgba(0,240,255,0.3);
    color: var(--tech-secondary);
}

.stock-bar-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.stock-info {
    font-family: 'Rajdhani';
    font-size: 14px;
}
.divider { margin: 0 4px; color: var(--text-sub); }
.min-stock { font-size: 12px; color: var(--text-sub); margin-left: 8px; }
.text-danger { color: var(--status-danger); }
.text-success { color: var(--status-success); }
.text-gray-500 { color: var(--text-muted); }

.time-text {
    font-family: 'Rajdhani';
    color: var(--text-sub);
    font-size: 13px;
}
</style>
