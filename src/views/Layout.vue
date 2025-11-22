<template>
  <div class="layout-container">
    <!-- SC2 Style Top Navigation (Level 1) -->
    <div class="sc2-nav-level-1">
      <!-- Primary Menu Items -->
      <div class="nav-items">
        <div 
          v-for="item in navigationData" 
          :key="item.id"
          class="nav-item"
          :class="{ active: activeLevel1 === item.id }"
          @click="handleLevel1Click(item)"
          @mouseenter="handleLevel1Hover(item)"
        >
          <div class="item-content">
            <span class="item-label cn-font">{{ item.label }}</span>
            <span class="item-sub-label">{{ item.subLabel }}</span>
          </div>
          <div class="item-glow"></div>
        </div>
      </div>

      <!-- Right Status Area (User, Clock, etc.) -->
      <div class="nav-status">
        <div class="status-item">
          <el-icon><Bell /></el-icon>
          <span class="status-val text-danger">{{ unreadAlarms }}</span>
        </div>
        
        <el-dropdown trigger="click" @command="handleUserCommand" popper-class="sc2-dropdown-popper">
          <div class="status-item user-profile">
            <el-avatar :size="24" :src="avatarUrl" class="user-avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <span class="user-name">指挥官</span>
            <el-icon class="el-icon--right text-gray-400"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu class="sc2-dropdown">
              <el-dropdown-item command="profile">个人档案</el-dropdown-item>
              <el-dropdown-item command="settings">系统设置</el-dropdown-item>
              <el-dropdown-item divided command="logout" style="color: #F56C6C;">退出系统</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <div class="status-item clock">
          {{ currentTime }}
        </div>
      </div>
    </div>

    <!-- SC2 Style Secondary Navigation (Level 2) -->
    <div class="sc2-nav-level-2">
      <div class="sub-nav-container">
        <div 
          v-for="subItem in currentLevel2Items" 
          :key="subItem.id"
          class="sub-nav-item"
          :class="{ active: activeLevel2 === subItem.path }"
          @click="handleLevel2Click(subItem)"
        >
          <span class="sub-label cn-font">{{ subItem.label }}</span>
          <span class="sub-en">{{ subItem.subLabel }}</span>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="sc2-main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <!-- Theme Switcher (Floating) Removed -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Bell, User, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { navigationData, type NavItem } from '../config/navigation'

const route = useRoute()
const router = useRouter()

// State
const activeLevel1 = ref<string>('cockpit')
const hoverLevel1 = ref<string | null>(null) // For hover effects if needed
const currentTime = ref('')
const unreadAlarms = ref(12)
const avatarUrl = ref('')
let timer: number

// Computed: Get current Level 2 items based on Level 1 selection
const currentLevel2Items = computed(() => {
  const parentId = activeLevel1.value
  const parent = navigationData.find(item => item.id === parentId)
  return parent ? parent.children : []
})

// Computed: Active Level 2 path (current route)
const activeLevel2 = computed(() => route.path)

// Logic: Sync Level 1 activation with current route
const syncMenuWithRoute = () => {
  const currentPath = route.path
  // Find which Level 1 item contains this path
  for (const parent of navigationData) {
    if (parent.children?.some(child => child.path === currentPath)) {
      activeLevel1.value = parent.id
      return
    }
  }
  // Default to cockpit if no match (e.g. 404)
  if (currentPath === '/ai-brain') activeLevel1.value = 'cockpit'
}

watch(() => route.path, syncMenuWithRoute, { immediate: true })

// Handlers
const handleLevel1Click = (item: NavItem) => {
  activeLevel1.value = item.id
  // Automatically navigate to the first child if available
  if (item.children && item.children.length > 0) {
    const firstChild = item.children[0]
    if (firstChild && firstChild.path) {
      router.push(firstChild.path)
    }
  }
}

const handleLevel1Hover = (item: NavItem) => {
  hoverLevel1.value = item.id
}

const handleLevel2Click = (item: NavItem) => {
  if (item.path) {
    router.push(item.path)
  }
}

const handleUserCommand = (command: string) => {
  if (command === 'logout') {
    ElMessageBox.confirm(
      '确认要退出当前指挥系统吗？',
      '系统提示',
      {
        confirmButtonText: '确认退出',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'sc2-confirm-box',
        center: true
      }
    ).then(() => {
      // 清除可能的 token
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      ElMessage.success('已安全登出')
      router.push('/login')
    }).catch(() => {
      // cancel
    })
  } else if (command === 'profile') {
    ElMessage.info('指挥官档案访问受限 [权限不足]')
  } else if (command === 'settings') {
    router.push('/system/users')
  }
}

// Time
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.layout-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #050608; /* 深空黑 */
  /* 全局背景微纹理，模拟星际背景的深邃 */
  background-image: 
    radial-gradient(circle at 50% 0%, #1a253a 0%, transparent 60%),
    url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z' fill='%231a253a' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E");
  overflow: hidden;
}

/* 
   LEVEL 1 NAVIGATION (Top Bar) 
   Style: Heavy Metal, Brushed Steel, Trapezoid Highlights
*/
.sc2-nav-level-1 {
  height: 72px; /* 星际2标准高度 */
  display: flex;
  align-items: center;
  padding: 0;
  /* 金属拉丝背景模拟 */
  background: 
    linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.2) 100%),
    #0e1218;
  border-bottom: 1px solid #3e4c5e;
  box-shadow: 0 5px 15px rgba(0,0,0,0.8);
  position: relative;
  z-index: 100;
}

/* 顶部高光线 */
.sc2-nav-level-1::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255,255,255,0.15);
}

.nav-items {
  flex: 1;
  display: flex;
  height: 100%;
  gap: 0;
  justify-content: center;
  overflow-x: auto; /* 允许横向滚动 */
  overflow-y: hidden;
  scrollbar-width: none; /* Firefox 隐藏滚动条 */
  -ms-overflow-style: none; /* IE 10+ 隐��滚动条 */
}

.nav-items::-webkit-scrollbar { /* Chrome/Safari 隐藏滚动条 */
  display: none;
}

.nav-item {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  /* 浮雕分割线 */
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  border-left: 1px solid rgba(0, 0, 0, 0.5);
  flex-shrink: 0; /* 禁止压缩，防止换行 */
}

/* 选中态的梯形背景 (核心还原点) */
.nav-item.active {
  background: transparent; /* 移除默认背景 */
  z-index: 1; /* 提升层级 */
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  /* 蓝色梯形渐变背景 */
  background: linear-gradient(180deg, 
    rgba(13, 35, 60, 0) 0%, 
    rgba(13, 35, 60, 0.6) 40%, 
    rgba(0, 168, 255, 0.15) 100%
  );
  /* 底部高亮条 */
  border-bottom: 3px solid #00F0FF;
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.15);
  z-index: -1;
}

/* 选中态的顶部倒角装饰 */
.nav-item.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00F0FF, transparent);
  opacity: 0.5;
}

.nav-item .item-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transform: translateY(2px); /* 微调视觉中心 */
}

.nav-item .item-label {
  font-family: "Microsoft YaHei", "Heiti SC", sans-serif;
  font-size: 18px;
  font-weight: 700; /* 不用最粗，保持清晰 */
  color: #8b9bb4; /* 默认未选中是灰蓝色 */
  letter-spacing: 1px;
  transition: all 0.3s;
  text-transform: uppercase;
}

.nav-item.active .item-label {
  color: #FFFFFF;
  text-shadow: 
    0 0 10px rgba(0, 240, 255, 0.8),
    0 0 20px rgba(0, 240, 255, 0.4);
  font-weight: 900;
}

.nav-item .item-sub-label {
  font-family: 'Rajdhani', sans-serif;
  font-size: 10px;
  color: #4a5b6c;
  letter-spacing: 1px;
  margin-top: 3px;
  font-weight: 700;
  text-transform: uppercase;
  transition: color 0.3s;
}

.nav-item.active .item-sub-label {
  color: #4db8ff; /* 选中时副标题也变亮 */
}

/* Hover State */
.nav-item:hover:not(.active) .item-label {
  color: #d0e0f0;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
}

.nav-item:hover:not(.active) {
  background: radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 70%);
}

/* 右侧状态栏 - 战术监视器风格 */
.nav-status {
  display: flex;
  gap: 12px; /* 增加间距 */
  align-items: center;
  height: 100%;
  padding: 0 20px 0 40px;
  /* 斜切背景 */
  background: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.6) 20%);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

/* 装饰性斜线 */
.nav-status::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%) skewX(-20deg);
  width: 2px;
  height: 60%;
  background: rgba(255, 255, 255, 0.2);
}

.status-item {
  display: flex;
  align-items: center;
  height: 36px; /* 统一高度 */
  padding: 0 12px;
  border-radius: 2px;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
}

/* 报警模块 - 红色警戒 */
.status-item:first-child {
  border: 1px solid rgba(255, 46, 99, 0.3);
  background: rgba(255, 46, 99, 0.05);
  color: #FF2E63;
  box-shadow: 0 0 10px rgba(255, 46, 99, 0.1);
}

.status-item:first-child:hover {
  background: rgba(255, 46, 99, 0.15);
  box-shadow: 0 0 15px rgba(255, 46, 99, 0.3);
  border-color: #FF2E63;
}

.status-val.text-danger {
  font-family: "Impact", sans-serif; /* 更有力量感的数字 */
  font-size: 18px;
  margin-left: 8px;
  letter-spacing: 1px;
  color: #FF2E63;
  text-shadow: 0 0 5px #FF2E63;
}

/* 用户模块 - ID卡 */
.status-item.user-profile {
  gap: 10px;
  border: 1px solid rgba(0, 240, 255, 0.3);
  background: rgba(0, 240, 255, 0.05);
  margin-right: 0;
  padding-right: 16px;
}

.status-item.user-profile:hover {
  background: rgba(0, 240, 255, 0.15);
  border-color: #00F0FF;
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.2);
}

.user-avatar {
  border: 1px solid #00F0FF;
  box-shadow: 0 0 5px rgba(0, 240, 255, 0.5);
}

.user-name { 
  color: #00F0FF; 
  font-family: "Microsoft YaHei", sans-serif; 
  font-size: 14px;
  font-weight: 700;
  text-shadow: 0 0 5px rgba(0, 240, 255, 0.3);
}

/* 时钟模块 - 战术计时 */
.status-item.clock {
  border: none;
  background: transparent;
  font-family: "Consolas", "Monaco", monospace;
  font-size: 22px; 
  letter-spacing: 2px; 
  color: #e2e8f0; 
  font-weight: 700;
  text-shadow: 0 0 10px rgba(255,255,255,0.3);
  padding-right: 0;
  cursor: default;
}

.status-item.clock:hover {
  color: #FFF;
  text-shadow: 0 0 15px rgba(255,255,255,0.6);
}

/* 
   LEVEL 2 NAVIGATION (Sub Bar)
   Style: Recessed Groove, Deep Dark
*/
.sc2-nav-level-2 {
  height: 42px; /* 二级菜单比较窄 */
  background: #050608;
  /* 强烈的内阴影模拟凹槽 */
  box-shadow: 
    inset 0 5px 10px rgba(0,0,0,0.8),
    inset 0 -1px 0 rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center; /* 居中对齐 */
  z-index: 99;
  position: relative;
}

/* 二级菜单背景纹理 */
.sc2-nav-level-2::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(90deg, transparent 0%, rgba(30, 144, 255, 0.03) 50%, transparent 100%);
  pointer-events: none;
}

.sub-nav-container {
  display: flex;
  gap: 2px; /* 紧凑 */
  height: 100%;
  align-items: center;
}

.sub-nav-item {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  height: 100%;
  opacity: 0.6;
  transition: all 0.2s;
  position: relative;
  border-right: 1px solid rgba(255, 255, 255, 0.02);
}

.sub-label {
  font-family: "Microsoft YaHei", sans-serif;
  font-size: 13px; /* 字体较小 */
  font-weight: 600;
  color: #8b9bb4;
  letter-spacing: 1px;
  transition: color 0.2s;
}

.sub-en {
  display: none; /* 隐藏英文，保持极简，或作为 tooltip */
}

.sub-nav-item:hover {
  opacity: 1;
  background: rgba(255,255,255,0.02);
}

.sub-nav-item:hover .sub-label {
  color: #d0e0f0;
  text-shadow: 0 0 5px rgba(255,255,255,0.3);
}

.sub-nav-item.active {
  opacity: 1;
  background: rgba(0, 240, 255, 0.05);
  box-shadow: inset 0 -2px 0 #00F0FF; /* 底部亮线 */
}

.sub-nav-item.active .sub-label {
  color: #FFFFFF;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.6);
}

/* 
   MAIN CONTENT 
*/
.sc2-main-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  padding: 24px; /* 给内容留出呼吸空间 */
}

/* Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>