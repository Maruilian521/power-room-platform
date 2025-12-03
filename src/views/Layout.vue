<template>
  <div class="layout-container">
    <!-- SC2 Style Top Navigation (Level 1) -->
    <div class="sc2-nav-level-1">
      <!-- Product Logo -->
      <div class="product-logo">
        <img src="/ProductLogo.png" alt="Product Logo" />
      </div>

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
            <span class="item-label">{{ item.label }}</span>
            <span class="item-sub-label">{{ item.subLabel }}</span>
          </div>
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
          <span class="sub-label">{{ subItem.label }}</span>
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
    router.push('/user/profile')
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
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Roboto:wght@500&display=swap');

.layout-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #050608; 
  /* Background pattern */
  background-image: 
    radial-gradient(circle at 50% 0%, #1a253a 0%, transparent 60%),
    url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z' fill='%231a253a' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E");
  overflow: hidden;
  font-family: 'Segoe UI', 'Roboto', sans-serif;
}

/* 
   LEVEL 1 NAVIGATION (Top Bar) 
   Ref: menuStyle.html (Main Nav)
*/
.sc2-nav-level-1 {
  height: 78px;
  display: flex;
  align-items: center;
  /* Reference background and border */
  background: #05080e; 
  border-bottom: 2px solid #000;
  position: relative;
  z-index: 100;
  padding: 0; /* Ensure full width */
}

/* Product Logo */
.product-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 78px;
  height: 78px;
  background: rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.product-logo img {
  width: 45px;
  height: 45px;
  object-fit: cover;
  border-radius: 4px;
  filter: drop-shadow(0 0 8px rgba(0, 243, 255, 0.3));
  transition: filter 0.3s;
}

.product-logo img:hover {
  filter: drop-shadow(0 0 12px rgba(0, 243, 255, 0.6));
}

.nav-items {
  flex: 1;
  display: flex;
  height: 100%;
  justify-content: flex-start; /* Align menu items to the left */
}

.nav-item {
  flex: 0 1 200px; /* Approx width, adjust as needed */
  max-width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Typography - 使用苹方/思源字体 */
  font-family: 'PingFang SC', 'Source Han Sans CN', 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 2px;

  /* Default State colors (using previous color palette variables where suitable or sticking to reference for effect) */
  color: #6d8bad; /* Reference inactive color */
  /* To respect "previous colors", if the user prefers the blue-grey of their theme, this #6d8bad is actually very close to their old #8b9bb4 */

  /* Borders from reference */
  border-right: 1px solid rgba(255,255,255,0.05);
  border-left: 1px solid rgba(0,0,0,0.8);

  cursor: pointer;
  transition: color 0.2s;
  position: relative;
  overflow: hidden;
}

.nav-item .item-content {
  position: relative;
  z-index: 1; /* Ensure text is above effects */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.nav-item .item-sub-label {
  font-family: 'PingFang SC', 'Source Han Sans CN', 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  color: #4a5b6c;
  letter-spacing: 1px;
  margin-top: 2px;
  font-weight: 500;
  text-transform: uppercase;
  transition: color 0.3s;
  opacity: 0.8;
}

.nav-item.active .item-sub-label {
  color: var(--tech-primary);
  text-shadow: 0 0 5px var(--tech-primary);
}

/* 
   ACTIVE STATE (The Core Request)
*/
.nav-item.active {
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
  
  /* Background: Deep blue projection light */
  background: linear-gradient(
    to top, 
    rgba(0, 240, 255, 0.15) 0%, 
    rgba(0, 0, 0, 0) 60%, 
    transparent 100%
  );
}

/* Texture Effect */
.nav-item.active::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  /* Radial mesh texture */
  background-image: radial-gradient(var(--tech-primary) 1px, transparent 1px);
  background-size: 8px 8px;
  mask-image: linear-gradient(to top, black, transparent);
  -webkit-mask-image: linear-gradient(to top, black, transparent);
  z-index: 0;
  opacity: 0.2;
}

/* Bottom Energy Bar */
.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  
  /* Cyan/Blue energy line */
  background: linear-gradient(90deg, transparent 0%, var(--tech-primary) 50%, transparent 100%);
  
  /* Glow */
  box-shadow: 0 0 10px 2px var(--tech-primary);
  z-index: 2;
}

/* Hover Effect (Non-active) */
.nav-item:hover:not(.active) {
  color: #d0e0f0;
  background: rgba(255, 255, 255, 0.02);
}

/* 
   LEVEL 2 NAVIGATION (Sub Nav)
   Ref: menuStyle.html (Sub Nav)
*/
.sc2-nav-level-2 {
  height: 56px;
  /* Black glass texture */
  background: linear-gradient(to bottom, #0a111a, #000000);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  border-top: 1px solid #1a2a3a; /* Top reflection */
  position: relative;
  z-index: 99;
}

.sub-nav-container {
  display: flex;
  align-items: center;
  height: 100%;
  padding-left: 78px; /* Align with main menu (logo width) */
}

.sub-nav-item {
  font-family: 'PingFang SC', 'Source Han Sans CN', 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
  padding: 0 20px;
  color: #5a7a9a; /* Reference sub color */
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  cursor: pointer;
  transition: all 0.2s;
  
  /* Simulate the divider from reference using border on one side, or just gap */
  border-right: 1px solid rgba(255, 255, 255, 0.02);
}

.sub-nav-item:last-child {
  border-right: none;
}

.sub-nav-item:hover {
  color: #fff;
}

.sub-nav-item.active {
  color: #fff;
  font-weight: bold;
  
  /* Active Glow Fog Effect */
  background: radial-gradient(
    ellipse at center, 
    rgba(0, 100, 200, 0.5) 0%, 
    rgba(0, 50, 100, 0.1) 60%, 
    transparent 80%
  );
}

/* 
   STATUS BAR (Right side)
   Adapting to new height and style
*/
.nav-status {
  display: flex;
  gap: 12px;
  align-items: center;
  height: 100%;
  padding: 0 20px;
  position: absolute; /* Float to right */
  right: 0;
  top: 0;
}

.status-item {
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 12px;
  cursor: pointer;
  color: #6d8bad;
  transition: all 0.3s;
}

.status-item:hover {
  color: #fff;
}

.status-item .el-icon {
  font-size: 22px;
}

.status-val.text-danger {
  font-family: "Impact", sans-serif;
  font-size: 20px;
  margin-left: 8px;
  color: #FF2E63;
  text-shadow: 0 0 5px #FF2E63;
}

.user-profile {
  gap: 10px;
}

/* SC2风格头像样式 */
.user-avatar {
  background: linear-gradient(135deg, #0a1929 0%, #1a2f42 100%) !important;
  border: 2px solid var(--tech-primary) !important;
  box-shadow:
    0 0 10px rgba(0, 243, 255, 0.5),
    inset 0 0 10px rgba(0, 243, 255, 0.2) !important;
  position: relative;
  overflow: visible !important;
}

.user-avatar::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, var(--tech-primary), transparent, var(--tech-primary));
  border-radius: 50%;
  animation: rotate-border 3s linear infinite;
  z-index: -1;
  opacity: 0.5;
}

@keyframes rotate-border {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.user-avatar .el-icon {
  color: var(--tech-primary) !important;
  font-size: 16px !important;
  filter: drop-shadow(0 0 3px var(--tech-primary));
}

.user-name {
  font-family: "Orbitron", sans-serif;
  font-size: 18px;
  color: #e2e8f0;
  text-shadow: 0 0 5px rgba(0, 243, 255, 0.3);
}

.status-item.clock {
  font-family: "Orbitron", sans-serif;
  font-size: 20px;
  color: #e2e8f0;
}

/* Main Content */
.sc2-main-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  padding: 24px;
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

<style>
/* SC2风格确认框样式 (全局样式，不使用scoped) */
.sc2-confirm-box {
  background: linear-gradient(to bottom, #0a111a, #000000) !important;
  border: 2px solid var(--tech-primary) !important;
  border-radius: 0 !important;
  box-shadow: 0 0 30px rgba(0, 243, 255, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.8) !important;
}

.sc2-confirm-box .el-message-box__header {
  background: rgba(0, 243, 255, 0.1);
  border-bottom: 1px solid var(--tech-primary);
  padding: 15px 20px;
}

.sc2-confirm-box .el-message-box__title {
  font-family: 'Orbitron', sans-serif !important;
  font-size: 18px !important;
  font-weight: 700 !important;
  color: var(--tech-primary) !important;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-shadow: 0 0 10px var(--tech-primary);
}

.sc2-confirm-box .el-message-box__content {
  padding: 30px 20px !important;
  color: #e2e8f0 !important;
}

.sc2-confirm-box .el-message-box__message {
  font-family: 'Microsoft YaHei', sans-serif !important;
  font-size: 16px !important;
  color: #e2e8f0 !important;
  line-height: 1.6;
}

.sc2-confirm-box .el-message-box__btns {
  padding: 10px 20px 20px !important;
  display: flex;
  gap: 15px;
  justify-content: center;
}

/* 确认按钮 - 危险样式 */
.sc2-confirm-box .el-button--primary {
  background: linear-gradient(180deg, #8B0000, #4B0000) !important;
  border: 1px solid #FF2E63 !important;
  color: #fff !important;
  font-family: 'Orbitron', sans-serif !important;
  font-weight: 700 !important;
  letter-spacing: 1px;
  padding: 12px 30px !important;
  border-radius: 0 !important;
  text-transform: uppercase;
  font-size: 14px !important;
  box-shadow: 0 0 10px rgba(255, 46, 99, 0.3) !important;
  transition: all 0.3s !important;
}

.sc2-confirm-box .el-button--primary:hover {
  background: linear-gradient(180deg, #FF2E63, #8B0000) !important;
  border-color: #FF4571 !important;
  box-shadow: 0 0 20px rgba(255, 46, 99, 0.6) !important;
  transform: translateY(-1px);
}

/* 取消按钮 */
.sc2-confirm-box .el-button--default {
  background: linear-gradient(180deg, #1E2E42, #0B1420) !important;
  border: 1px solid #3E5878 !important;
  color: #7B98BC !important;
  font-family: 'Orbitron', sans-serif !important;
  font-weight: 700 !important;
  letter-spacing: 1px;
  padding: 12px 30px !important;
  border-radius: 0 !important;
  text-transform: uppercase;
  font-size: 14px !important;
  transition: all 0.3s !important;
}

.sc2-confirm-box .el-button--default:hover {
  border-color: var(--tech-primary) !important;
  color: #fff !important;
  background: linear-gradient(180deg, #2E3E52, #1B2430) !important;
  box-shadow: 0 0 15px rgba(0, 243, 255, 0.2) !important;
}

/* 移除默认图标样式 */
.sc2-confirm-box .el-message-box__status {
  display: none !important;
}

/* SC2风格 Message 提示框样式 */
.el-message {
  background: linear-gradient(to bottom, #0a111a, #000000) !important;
  border: 1px solid var(--tech-primary) !important;
  border-radius: 0 !important;
  box-shadow: 0 0 20px rgba(0, 243, 255, 0.4), inset 0 0 15px rgba(0, 0, 0, 0.6) !important;
  padding: 15px 20px !important;
  min-width: 300px;
}

.el-message__content {
  font-family: 'Microsoft YaHei', sans-serif !important;
  font-size: 14px !important;
  color: #e2e8f0 !important;
  font-weight: 500;
}

/* Success 样式 */
.el-message--success {
  border-color: #00E676 !important;
  box-shadow: 0 0 20px rgba(0, 230, 118, 0.4), inset 0 0 15px rgba(0, 0, 0, 0.6) !important;
}

.el-message--success .el-message__icon {
  color: #00E676 !important;
  font-size: 18px !important;
}

/* Info 样式 */
.el-message--info {
  border-color: var(--tech-primary) !important;
}

.el-message--info .el-message__icon {
  color: var(--tech-primary) !important;
  font-size: 18px !important;
}

/* Warning 样式 */
.el-message--warning {
  border-color: #FFD600 !important;
  box-shadow: 0 0 20px rgba(255, 214, 0, 0.4), inset 0 0 15px rgba(0, 0, 0, 0.6) !important;
}

.el-message--warning .el-message__icon {
  color: #FFD600 !important;
  font-size: 18px !important;
}

/* Error 样式 */
.el-message--error {
  border-color: #FF2E63 !important;
  box-shadow: 0 0 20px rgba(255, 46, 99, 0.4), inset 0 0 15px rgba(0, 0, 0, 0.6) !important;
}

.el-message--error .el-message__icon {
  color: #FF2E63 !important;
  font-size: 18px !important;
}
</style>