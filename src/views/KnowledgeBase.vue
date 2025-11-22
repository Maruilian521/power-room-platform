<template>
  <div class="page-container knowledge-base">
    <!-- Header Stats -->
    <div class="grid grid-cols-4 gap-4 mb-4">
      <div class="stat-card-item primary">
        <div class="icon-wrapper"><el-icon><Reading /></el-icon></div>
        <div class="info">
          <div class="label">文档总数</div>
          <div class="value">1,248</div>
        </div>
      </div>
      <div class="stat-card-item warning">
        <div class="icon-wrapper"><el-icon><WarningFilled /></el-icon></div>
        <div class="info">
          <div class="label">典型缺陷案例</div>
          <div class="value">342</div>
        </div>
      </div>
      <div class="stat-card-item success">
        <div class="icon-wrapper"><el-icon><Guide /></el-icon></div>
        <div class="info">
          <div class="label">SOP 操作规程</div>
          <div class="value">156</div>
        </div>
      </div>
      <div class="stat-card-item info">
        <div class="icon-wrapper"><el-icon><Timer /></el-icon></div>
        <div class="info">
          <div class="label">本周更新</div>
          <div class="value">+12</div>
        </div>
      </div>
    </div>

    <div class="flex flex-1 overflow-hidden gap-4">
      <!-- Left Sidebar: Categories -->
      <div class="module-card w-64 flex flex-col p-0">
        <div class="sidebar-header p-4 border-b border-white/10">
          <span class="font-orbitron text-lg text-primary">DATA ARCHIVES</span>
        </div>
        <div class="flex-1 overflow-y-auto py-2">
          <div 
            v-for="cat in categories" 
            :key="cat.id"
            class="nav-item"
            :class="{ active: currentCategory === cat.id }"
            @click="currentCategory = cat.id"
          >
            <el-icon><component :is="cat.icon" /></el-icon>
            <span>{{ cat.label }}</span>
            <span class="count">{{ cat.count }}</span>
          </div>
        </div>
      </div>

      <!-- Right Content Area -->
      <div class="module-card flex-1 flex flex-col">
        <!-- Toolbar -->
        <div class="module-header">
          <div class="header-left">
            <span class="text-lg font-bold text-bright">{{ currentCategoryLabel }}</span>
            <span class="text-sm text-sub ml-2 font-rajdhani">{{ currentCategorySubLabel }}</span>
          </div>
          <div class="header-right flex gap-3">
            <el-input 
              v-model="searchText" 
              placeholder="搜索知识库..." 
              prefix-icon="Search" 
              class="sc2-input w-64" 
            />
            <el-button type="primary" icon="Upload">上传文档</el-button>
          </div>
        </div>

        <!-- Content List/Grid -->
        <div class="flex-1 overflow-y-auto p-4">
          <!-- List View for Defects/SOP -->
          <div v-if="currentCategory === 'defects' || currentCategory === 'sop'" class="flex flex-col gap-2">
            <el-table :data="filteredDocs" class="sc2-table" stripe>
              <el-table-column prop="title" label="标题" min-width="200">
                <template #default="{ row }">
                  <div class="flex items-center gap-2 cursor-pointer hover:text-primary" @click="viewDoc(row)">
                    <el-icon v-if="row.type === 'pdf'" class="text-danger"><Document /></el-icon>
                    <el-icon v-else class="text-primary"><Reading /></el-icon>
                    <span class="font-bold">{{ row.title }}</span>
                    <el-tag v-if="row.isNew" size="small" effect="dark" type="danger">NEW</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="code" label="编号" width="140" />
              <el-table-column prop="tags" label="标签" width="200">
                <template #default="{ row }">
                  <div class="flex gap-1">
                    <el-tag v-for="tag in row.tags" :key="tag" size="small" class="sc2-tag">{{ tag }}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="author" label="作者" width="100" />
              <el-table-column prop="date" label="更新日期" width="120" />
              <el-table-column label="操作" width="120" fixed="right">
                <template #default>
                  <el-button link type="primary" icon="View">查看</el-button>
                  <el-button link type="primary" icon="Download">下载</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- Grid View for Manuals/Handbook -->
          <div v-else class="grid grid-cols-4 gap-4">
            <div 
              v-for="doc in filteredDocs" 
              :key="doc.id" 
              class="doc-card"
              @click="viewDoc(doc)"
            >
              <div class="card-cover">
                <div class="icon-placeholder">
                  <el-icon :size="40"><component :is="doc.icon || 'Document'" /></el-icon>
                </div>
                <div class="overlay">
                  <el-button type="primary" circle icon="View" />
                </div>
              </div>
              <div class="card-body">
                <div class="title" :title="doc.title">{{ doc.title }}</div>
                <div class="meta">
                  <span>{{ doc.size }}</span>
                  <span>{{ doc.date }}</span>
                </div>
                <div class="tags mt-2">
                  <el-tag v-for="tag in doc.tags.slice(0,2)" :key="tag" size="small" type="info">{{ tag }}</el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pagination -->
        <div class="p-4 border-t border-white/10 flex justify-end">
          <el-pagination 
            layout="total, prev, pager, next" 
            :total="100" 
            background 
          />
        </div>
      </div>
    </div>

    <!-- Document Viewer Dialog (Mock) -->
    <el-dialog v-model="dialogVisible" :title="currentDoc?.title" width="800px" class="sc2-dialog">
      <div class="doc-content-mock p-4 bg-black/20 min-h-[400px] font-mono text-sm">
        <p class="text-primary mb-4">> INITIALIZING NEURAL LINK...</p>
        <p class="text-text-main mb-4">> LOADING DOCUMENT CONTENT...</p>
        <div class="p-4 border border-dashed border-white/20 rounded">
          <h3 class="text-lg font-bold mb-2">1. 概述 (Overview)</h3>
          <p class="mb-4 leading-relaxed">
            本文档详细描述了 {{ currentDoc?.title }} 的操作规范与故障处理流程。
            所有的操作���须严格遵守《电力安全工作规程》。
          </p>
          <h3 class="text-lg font-bold mb-2">2. 核心步骤 (Procedures)</h3>
          <ul class="list-disc pl-5 space-y-2">
            <li>检查设备状态指示灯是否正常。</li>
            <li>确认主回路已断开，并挂好接地线。</li>
            <li>使用红外热像仪进行温度复核。</li>
          </ul>
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" icon="Download">下载源文件</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Reading, WarningFilled, Guide, Timer, Document
} from '@element-plus/icons-vue'

const currentCategory = ref('defects')
const searchText = ref('')
const dialogVisible = ref(false)
const currentDoc = ref<any>(null)

const categories = [
  { id: 'defects', label: '典型缺陷库', subLabel: 'DEFECT DATABASE', icon: 'WarningFilled', count: 342 },
  { id: 'handbook', label: '故障处理手册', subLabel: 'FAULT HANDBOOK', icon: 'Notebook', count: 89 },
  { id: 'sop', label: '操作规程库 (SOP)', subLabel: 'SOP LIBRARY', icon: 'Guide', count: 156 },
  { id: 'manuals', label: '设备资料库', subLabel: 'DEVICE MANUALS', icon: 'Monitor', count: 661 }
]

const currentCategoryLabel = computed(() => categories.find(c => c.id === currentCategory.value)?.label)
const currentCategorySubLabel = computed(() => categories.find(c => c.id === currentCategory.value)?.subLabel)

// Mock Data Generator
const generateDocs = (type: string) => {
  const count = 12
  return Array.from({ length: count }, (_, i) => {
    if (type === 'defects') {
      return {
        id: i, title: `10kV 开关柜局部放电异常案例分析 #${i+100}`, code: `DEF-2023-${i+1}`, 
        tags: ['开关柜', '局放', '绝缘'], author: '专家组', date: '2023-11-15', type: 'pdf', isNew: i < 2
      }
    } else if (type === 'sop') {
      return {
        id: i, title: `变压器停送电标准操作票 (SOP) #${i+10}`, code: `SOP-TR-${i+1}`,
        tags: ['变压器', '倒闸操作'], author: '安监部', date: '2023-10-01', type: 'doc', isNew: false
      }
    } else {
      return {
        id: i, title: `ABB UniGear ZS1 维护手册 V${i}.0`, size: '12.5 MB',
        tags: ['ABB', '维护', '高压'], date: '2022-05-20', icon: 'Notebook'
      }
    }
  })
}

// In a real app, this would fetch from API based on category
const allDocs = {
  defects: generateDocs('defects'),
  handbook: generateDocs('handbook'),
  sop: generateDocs('sop'),
  manuals: generateDocs('manuals')
}

const filteredDocs = computed(() => {
  const docs = allDocs[currentCategory.value as keyof typeof allDocs]
  if (!searchText.value) return docs
  return docs.filter((d: any) => d.title.includes(searchText.value) || d.tags.includes(searchText.value))
})

const viewDoc = (doc: any) => {
  currentDoc.value = doc
  dialogVisible.value = true
}
</script>

<style scoped>
.knowledge-base {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  gap: 16px;
}

/* Stats */
.stat-card-item {
  padding: 16px;
  gap: 12px;
}

/* Sidebar */
.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  color: var(--text-sub);
  transition: all 0.2s;
  border-left: 3px solid transparent;
  font-family: 'Rajdhani';
  font-weight: 600;
  letter-spacing: 1px;
}
.nav-item:hover {
  background: rgba(255,255,255,0.05);
  color: var(--text-bright);
}
.nav-item.active {
  background: rgba(0, 240, 255, 0.1);
  color: var(--tech-primary);
  border-left-color: var(--tech-primary);
}
.nav-item .el-icon { margin-right: 10px; font-size: 18px; }
.nav-item .count { 
  margin-left: auto; 
  font-size: 12px; 
  background: rgba(0,0,0,0.3); 
  padding: 2px 6px; 
  border-radius: 10px; 
}

/* Header */
.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

/* Grid Cards */
.doc-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}
.doc-card:hover {
  transform: translateY(-2px);
  border-color: var(--tech-primary);
  box-shadow: 0 4px 15px rgba(0, 240, 255, 0.15);
}
.card-cover {
  height: 120px;
  background: linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0, 240, 255, 0.05) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.icon-placeholder { color: var(--tech-secondary); opacity: 0.5; }
.card-cover .overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}
.doc-card:hover .overlay { opacity: 1; }

.card-body { padding: 12px; }
.card-body .title {
  font-weight: bold;
  color: var(--text-bright);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}
.card-body .meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-muted);
  font-family: 'Rajdhani';
}
</style>
