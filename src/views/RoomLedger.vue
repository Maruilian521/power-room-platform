<template>
  <div class="page-container room-ledger">
    <!-- Top Stats -->
    <div class="grid grid-cols-4 gap-4 mb-4">
      <div class="stat-card-item">
        <div class="icon-wrapper primary"><el-icon><OfficeBuilding /></el-icon></div>
        <div class="info">
          <div class="label">总站点数</div>
          <div class="value">{{ totalRooms }}</div>
        </div>
      </div>
      <div class="stat-card-item success">
        <div class="icon-wrapper"><el-icon><CircleCheckFilled /></el-icon></div>
        <div class="info">
          <div class="label">在用站点</div>
          <div class="value">{{ activeRooms }}</div>
        </div>
      </div>
      <div class="stat-card-item danger">
        <div class="icon-wrapper"><el-icon><WarningFilled /></el-icon></div>
        <div class="info">
          <div class="label">即将到期</div>
          <div class="value">{{ expiringRooms }}</div>
        </div>
      </div>
      <div class="stat-card-item info">
        <div class="icon-wrapper"><el-icon><Document /></el-icon></div>
        <div class="info">
          <div class="label">文档覆盖率</div>
          <div class="value">98%</div>
        </div>
      </div>
    </div>

    <!-- Map View Placeholder (Mini) -->
    <div class="module-card map-section mb-4">
        <div class="module-header">
            <div class="header-left">
                <el-icon><MapLocation /></el-icon>
                <span>站点分布概览 (GIS TACTICAL VIEW)</span>
            </div>
            <div class="header-right">
                <el-button size="small" class="sc2-btn-outline" @click="viewFullMap">
                    <el-icon><FullScreen /></el-icon> 
                    全屏模式
                </el-button>
            </div>
        </div>
        <div class="map-placeholder">
            <div class="map-grid"></div>
            <div class="map-terrain"></div>
            <div class="radar-scan"></div>
            <div v-for="i in 5" :key="i" class="map-point" :style="{ top: (20 + Math.random()*60) + '%', left: (10 + Math.random()*80) + '%' }">
                <div class="point-ring"></div>
                <div class="point-dot"></div>
                <div class="point-label">UNIT-{{ i }}</div>
            </div>
            <div class="map-overlay-text">SYSTEM ONLINE // SATELLITE LINK ESTABLISHED</div>
        </div>
    </div>

    <!-- Main Table -->
    <div class="module-card flex-1 overflow-hidden flex-col">
      <div class="module-header">
        <div class="header-left">
            <el-icon><List /></el-icon>
            <span>站点台账列表</span>
        </div>
        <div class="header-right toolbar-actions">
            <div class="filter-set">
                <el-input v-model="searchText" placeholder="搜索名称/编码..." :prefix-icon="Search" class="sc2-input search-wide" />
                <el-select v-model="filterRegion" placeholder="行政区域" class="sc2-select region-select" clearable>
                    <el-option label="全部区域" value="" />
                    <el-option label="朝阳区" value="朝阳区" />
                    <el-option label="海淀区" value="海淀区" />
                    <el-option label="丰台区" value="丰台区" />
                </el-select>
            </div>
            <div class="btn-set">
                <el-button type="primary" icon="Plus">新建台账</el-button>
                <el-button class="sc2-btn-outline" icon="Download">导出</el-button>
            </div>
        </div>
      </div>

      <el-table :data="paginatedRooms" class="sc2-table flex-1" stripe v-loading="loading">
        <el-table-column prop="name" label="站点名称" min-width="180">
            <template #default="{ row }">
                <span class="room-link" @click="viewRoomDetail(row)">{{ row.name }}</span>
            </template>
        </el-table-column>
        <el-table-column prop="code" label="站点编码" width="140" />
        <el-table-column prop="region" label="行政区域" width="100" />
        <el-table-column prop="location" label="详细地址" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
                <span class="address-text">{{ row.location }}</span>
                <el-icon class="copy-icon" title="复制地��"><CopyDocument /></el-icon>
            </template>
        </el-table-column>
        <el-table-column prop="manager" label="负责人" width="100" />
        <el-table-column prop="phone" label="联系电话" width="120" />
        <el-table-column prop="commissionDate" label="投运日期" width="120" />
        <el-table-column label="状态" width="100">
            <template #default>
                <el-tag type="success" effect="dark" class="sc2-tag">正常使用</el-tag>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
                <el-button link type="primary" size="small" @click="viewDocs()">文档</el-button>
                <el-button link type="info" size="small" @click="viewRoomDetail(row)">详情</el-button>
                <el-button link type="warning" size="small">编辑</el-button>
            </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredRooms.length"
        />
      </div>
    </div>

    <!-- Docs Dialog -->
    <el-dialog v-model="docsVisible" title="站点文档资料" width="600px" class="sc2-dialog">
        <div class="docs-list">
            <div class="doc-item" v-for="doc in mockDocs" :key="doc.name">
                <el-icon class="doc-icon"><Document /></el-icon>
                <div class="doc-info">
                    <div class="name">{{ doc.name }}</div>
                    <div class="meta">{{ doc.size }} | {{ doc.date }}</div>
                </div>
                <el-button size="small" icon="Download" circle />
            </div>
        </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
    OfficeBuilding, CircleCheckFilled, WarningFilled, Document, 
    MapLocation, List, Search, CopyDocument, FullScreen 
} from '@element-plus/icons-vue'
import { useDeviceStore } from '../stores/device'

const router = useRouter()
const store = useDeviceStore()
const rooms = ref<any[]>([])
const loading = ref(false)

const searchText = ref('')
const filterRegion = ref('')
const currentPage = ref(1)
const pageSize = ref(15)

// Stats
const totalRooms = computed(() => rooms.value.length)
const activeRooms = computed(() => Math.floor(rooms.value.length * 0.95))
const expiringRooms = ref(3) // Mock

// Fetch
onMounted(async () => {
    loading.value = true
    await store.fetchRooms()
    try {
        const res = await fetch('/api/rooms')
        const data = await res.json()
        rooms.value = data.data
    } finally {
        loading.value = false
    }
})

const filteredRooms = computed(() => {
    return rooms.value.filter(r => {
        const matchSearch = !searchText.value || r.name.includes(searchText.value) || r.location.includes(searchText.value) || (r.code && r.code.includes(searchText.value))
        const matchRegion = !filterRegion.value || r.region === filterRegion.value
        return matchSearch && matchRegion
    })
})

const paginatedRooms = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredRooms.value.slice(start, start + pageSize.value)
})

// Actions
const viewRoomDetail = (row: any) => {
    router.push(`/assets/room-ledger/${row.id}`)
}

const viewFullMap = () => {
    router.push('/monitoring/site-map')
}

// Docs
const docsVisible = ref(false)
const mockDocs = [
    { name: '配电室平面布置图.pdf', size: '2.4 MB', date: '2023-01-15' },
    { name: '一次系统接线图.dwg', size: '5.1 MB', date: '2023-01-15' },
    { name: '消防验收合格证.jpg', size: '1.2 MB', date: '2023-02-20' }
]
const viewDocs = () => {
    docsVisible.value = true
}
</script>

<style scoped>
.room-ledger {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 20px;
    gap: 16px;
}

/* Map Section */
.map-section {
    height: 320px;
    position: relative;
    display: flex;
    flex-direction: column;
}
.map-placeholder {
    flex: 1;
    background: #05080a;
    position: relative;
    overflow: hidden;
    border-top: 1px solid rgba(0,240,255,0.1);
    box-shadow: inset 0 0 20px rgba(0,0,0,0.8);
}
/* Holographic Grid */
.map-grid {
    position: absolute;
    inset: 0;
    background-image: 
        linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px);
    background-size: 40px 40px;
    perspective: 500px;
    transform: perspective(500px) rotateX(20deg) scale(1.2);
    opacity: 0.3;
}
/* Scanning Radar Effect */
.radar-scan {
    position: absolute;
    top: 50%; left: 50%;
    width: 150%; height: 150%;
    background: conic-gradient(from 0deg, transparent 0deg, rgba(0, 240, 255, 0.1) 60deg, transparent 60deg);
    transform: translate(-50%, -50%);
    animation: radar-spin 4s linear infinite;
    border-radius: 50%;
    pointer-events: none;
}
@keyframes radar-spin { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }

.map-point {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform: translate(-50%, -50%);
    cursor: pointer;
}
.point-dot {
    width: 6px; height: 6px; background: var(--tech-primary); border-radius: 50%;
    box-shadow: 0 0 10px var(--tech-primary);
}
.point-ring {
    position: absolute;
    width: 20px; height: 20px;
    border: 1px solid var(--tech-primary);
    border-radius: 50%;
    animation: ping 2s infinite;
    top: -7px; left: -7px;
}
.point-label {
    margin-top: 4px;
    font-size: 10px;
    color: var(--tech-primary);
    font-family: 'Rajdhani';
    background: rgba(0,0,0,0.5);
    padding: 0 4px;
}

.map-overlay-text {
    position: absolute;
    bottom: 10px;
    right: 10px;
    font-family: 'Orbitron';
    color: var(--tech-secondary);
    opacity: 0.7;
    letter-spacing: 2px;
    font-size: 12px;
    text-shadow: 0 0 5px var(--tech-secondary);
}

/* Toolbar Actions */
.toolbar-actions {
    display: flex;
    gap: 20px;
    align-items: center;
}
.filter-set {
    display: flex;
    gap: 10px;
}
.search-wide { width: 240px; }
.region-select { width: 140px; }
.btn-set {
    display: flex;
    gap: 10px;
    padding-left: 20px;
    border-left: 1px solid rgba(255,255,255,0.1);
}

/* Custom SC2 Outline Button */
.sc2-btn-outline {
    background: transparent !important;
    border: 1px solid rgba(0, 240, 255, 0.3) !important;
    color: var(--tech-primary) !important;
    font-family: 'Rajdhani', sans-serif;
    font-weight: 600;
}
.sc2-btn-outline:hover {
    background: rgba(0, 240, 255, 0.1) !important;
    border-color: var(--tech-primary) !important;
    box-shadow: 0 0 10px rgba(0, 240, 255, 0.2);
}

/* Table Styles */
.room-link {
    color: var(--tech-primary);
    font-weight: bold;
    cursor: pointer;
    text-decoration: none;
}
.room-link:hover { text-decoration: underline; text-shadow: 0 0 8px var(--tech-primary); }

.address-text { color: var(--text-main); font-size: 13px; }
.copy-icon { margin-left: 8px; cursor: pointer; color: var(--text-sub); font-size: 14px; vertical-align: middle; }
.copy-icon:hover { color: var(--tech-primary); }

/* Stats */
.icon-wrapper.primary { color: var(--tech-primary); background: rgba(0,240,255,0.1); }

/* Docs List */
.docs-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.doc-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 4px;
    transition: all 0.2s;
}
.doc-item:hover { border-color: var(--tech-primary); background: rgba(0,240,255,0.05); }
.doc-icon { font-size: 24px; color: var(--tech-secondary); }
.doc-info { flex: 1; }
.doc-info .name { font-weight: bold; color: var(--text-bright); font-size: 14px; }
.doc-info .meta { font-size: 12px; color: var(--text-sub); }
</style>