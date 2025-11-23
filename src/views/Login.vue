<template>
  <div class="login-container">
    <!-- Three.js 背景容器 -->
    <div ref="threeContainer" class="three-background"></div>

    <!-- 登录 UI 层 -->
    <div class="login-overlay">
      <!-- 顶部公司 Logo (新增) -->
      <div class="company-logo-header">
        <img src="/logo.png" alt="JYD 竞业达" />
      </div>

      <div class="sc2-login-box">
        <!-- Logo -->
        <div class="sc2-logo">
          <div class="logo-text cn-title">配电室智能运维平台</div>
          <!-- <div class="logo-sub cn-font">智慧运维</div> -->
          <div class="logo-expansion">INTELLIGENT MONITORING PLATFORM</div>
        </div>

        <!-- 登录表单 -->
        <div class="login-form">
          <div class="form-group">
            <input 
              type="text" 
              v-model="form.username" 
              placeholder="EMAIL ADDRESS"
              class="sc2-input"
              @focus="playSound('hover')"
            />
          </div>
          <div class="form-group">
            <input 
              type="password" 
              v-model="form.password" 
              placeholder="PASSWORD" 
              class="sc2-input"
              @focus="playSound('hover')"
            />
          </div>
          
          <div class="login-actions">
            <button class="sc2-btn-login" @click="handleLogin" @mouseenter="playSound('hover')">
              <span class="btn-text">LOG IN</span>
              <div class="btn-glow"></div>
            </button>
          </div>

          <div class="login-footer">
            <a href="#" class="footer-link">Create Account</a>
            <span class="divider">|</span>
            <a href="#" class="footer-link">Can't Log In?</a>
          </div>
          
          <div class="region-selector">
            <span class="region-label">REGION:</span>
            <span class="region-value">KR/TW (ASIA)</span>
          </div>
        </div>
      </div>
      
      <!-- 底部版本号 -->
      <div class="version-info">
        VERSION 5.0.11.90870
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as THREE from 'three'

const router = useRouter()
const threeContainer = ref<HTMLElement>()
const form = ref({
  username: '',
  password: ''
})

// Three.js 变量
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let stars: THREE.Points
let nebula: THREE.Mesh
let powerNetwork: THREE.Group
let energyPulses: THREE.Mesh[] = []
let animationId: number
let mouseX = 0
let mouseY = 0

// 初始化 Three.js 场景
const initThree = () => {
  if (!threeContainer.value) return

  // 1. 场景
  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x000000, 0.0005)

  // 2. 相机
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
  camera.position.z = 500

  // 3. 渲染器
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  threeContainer.value.appendChild(renderer.domElement)

  // 4. 创建星空
  createStarfield()
  
  // 5. 创建"虚空"能量雾
  createVoidNebula()

  // 6. 创建电力能源网络 (新增)
  createPowerNetwork()

  // 7. 监听鼠标移动以产生视差效果
  document.addEventListener('mousemove', onDocumentMouseMove)
  window.addEventListener('resize', onWindowResize)

  animate()
}

const createStarfield = () => {
  // ... (保持原有星空代码不变) ...
  const geometry = new THREE.BufferGeometry()
  const vertices = []
  const colors = []

  const colorPalette = [
    new THREE.Color('#00F0FF'), // Cyan
    new THREE.Color('#FFFFFF'), // White
    new THREE.Color('#4D88FF')  // Blue
  ]

  for (let i = 0; i < 3000; i++) {
    const x = (Math.random() - 0.5) * 2000
    const y = (Math.random() - 0.5) * 2000
    const z = (Math.random() - 0.5) * 2000
    vertices.push(x, y, z)

    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)] || new THREE.Color('#FFFFFF')
    colors.push(color.r, color.g, color.b)
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 2,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  })

  stars = new THREE.Points(geometry, material)
  scene.add(stars)
}

const createVoidNebula = () => {
  // ... (保持原有雾气代码不变) ...
  const geometry = new THREE.IcosahedronGeometry(300, 2)
  const material = new THREE.MeshBasicMaterial({
    color: 0x003366,
    wireframe: true,
    transparent: true,
    opacity: 0.2, // 增加不透明度
    side: THREE.BackSide
  })
  
  nebula = new THREE.Mesh(geometry, material)
  scene.add(nebula)
}

// 新增：创建电力能源网络
const createPowerNetwork = () => {
  powerNetwork = new THREE.Group()
  scene.add(powerNetwork)

  // 1. 节点 (Substations / Nodes)
  const nodeCount = 40
  const nodeGeometry = new THREE.IcosahedronGeometry(4, 0)
  const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x00F0FF, wireframe: true })
  const nodes: THREE.Vector3[] = []

  for (let i = 0; i < nodeCount; i++) {
    const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial)
    const x = (Math.random() - 0.5) * 800
    const y = (Math.random() - 0.5) * 600
    const z = (Math.random() - 0.5) * 400
    mesh.position.set(x, y, z)
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
    powerNetwork.add(mesh)
    nodes.push(mesh.position)
  }

  // 2. 连线 (Transmission Lines)
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x005588, transparent: true, opacity: 0.3 })
  const lineGeometry = new THREE.BufferGeometry()
  const linePositions: number[] = []

  // 简单的距离连接算法
  nodes.forEach((nodeA, i) => {
    nodes.forEach((nodeB, j) => {
      if (i < j) {
        const dist = nodeA.distanceTo(nodeB)
        if (dist < 250) { // 只连接一定范围内的点
          linePositions.push(nodeA.x, nodeA.y, nodeA.z)
          linePositions.push(nodeB.x, nodeB.y, nodeB.z)
          
          // 3. 能量脉冲 (Energy Pulses)
          // 为每条线随机添加脉冲
          if (Math.random() > 0.5) {
            // 尺寸 1.0，天蓝色
            const pulseGeo = new THREE.SphereGeometry(1.0, 8, 8) 
            const pulseMat = new THREE.MeshBasicMaterial({ color: 0x33CCFF }) 
            const pulse = new THREE.Mesh(pulseGeo, pulseMat)
            
            // 存储脉冲的元数据：起点、终点、当前进度(0-1)、速度
            pulse.userData = {
              start: nodeA,
              end: nodeB,
              progress: Math.random(),
              // 适中偏慢速度 - 明显的流动感
              speed: 0.0005 + Math.random() * 0.0005 
            }
            // 初始化位置
            pulse.position.copy(nodeA).lerp(nodeB, pulse.userData.progress)
            energyPulses.push(pulse)
            powerNetwork.add(pulse)
          }
        }
      }
    })
  })

  lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial)
  powerNetwork.add(lines)
}

const onDocumentMouseMove = (event: MouseEvent) => {
  mouseX = (event.clientX - window.innerWidth / 2) * 0.5
  mouseY = (event.clientY - window.innerHeight / 2) * 0.5
}

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

const animate = () => {
  animationId = requestAnimationFrame(animate)

  // 星空缓慢旋转 (极慢)
  stars.rotation.y += 0.00005 
  stars.rotation.x += 0.00002

  // 星云脉动 (舒缓)
  nebula.rotation.y -= 0.0002 
  const scale = 1 + Math.sin(Date.now() * 0.0005) * 0.05 // 频率减半
  nebula.scale.set(scale, scale, scale)

  // 能源网络整体微动
  if (powerNetwork) {
    powerNetwork.rotation.y += 0.0002
    powerNetwork.rotation.z += 0.0001
  }

  // 更新能量脉冲位置
  energyPulses.forEach(pulse => {
    const data = pulse.userData
    data.progress += data.speed
    
    if (data.progress >= 1) {
      data.progress = 0 // 循环流动
    }
    
    pulse.position.copy(data.start).lerp(data.end, data.progress)
    
    // 简单的呼吸效果
    const scale = 1 + Math.sin(data.progress * Math.PI) * 0.5
    pulse.scale.set(scale, scale, scale)
  })

  // 鼠标视差
  camera.position.x += (mouseX - camera.position.x) * 0.02
  camera.position.y += (-mouseY - camera.position.y) * 0.02
  camera.lookAt(scene.position)

  renderer.render(scene, camera)
}

// 模拟音效（占位）
const playSound = (_type?: string) => {
  // 实际项目中可以添加 Audio 播放
  // console.log('Play sound:', _type)
}

const handleLogin = () => {
  // 简单的登录逻辑
  if (form.value.username && form.value.password) {
    // 模拟加载延迟
    setTimeout(() => {
      // 设置主题为 Terran 以匹配之前的要求
      document.documentElement.setAttribute('data-theme', 'terran-command')
      localStorage.setItem('app-theme', 'terran-command')
      localStorage.setItem('token', 'mock-token') // Set mock token
      localStorage.setItem('user', JSON.stringify({ name: '指挥官', role: 'admin' }))
      router.push('/dashboard/overview')
    }, 800)
  } else {
    // 也可以直接进入，方便测试
    document.documentElement.setAttribute('data-theme', 'terran-command')
    localStorage.setItem('app-theme', 'terran-command')
    localStorage.setItem('token', 'mock-token') // Set mock token
    localStorage.setItem('user', JSON.stringify({ name: '指挥官', role: 'admin' }))
    router.push('/dashboard/overview')
  }
}

onMounted(() => {
  initThree()
})

onUnmounted(() => {
  if (threeContainer.value && renderer) {
    threeContainer.value.removeChild(renderer.domElement)
  }
  window.removeEventListener('resize', onWindowResize)
  document.removeEventListener('mousemove', onDocumentMouseMove)
  cancelAnimationFrame(animationId)
})
</script>

<style scoped>
/* 字体引入已经在全局做过 (Orbitron, Rajdhani) */

.login-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background-color: #000;
}

.three-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  /* 底部径向渐变模拟虚空之遗的深蓝背景 */
  background: radial-gradient(circle at center, #0b1a2a 0%, #000000 100%);
}

.login-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* 扫描线叠加 */
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.1),
    rgba(0, 0, 0, 0.1) 1px,
    transparent 1px,
    transparent 2px
  );
}

/* 公司 Logo 区域 */
.company-logo-header {
  position: absolute;
  top: 40px;
  left: 40px;
  z-index: 10;
  opacity: 0.9;
  transition: opacity 0.3s;
}

.company-logo-header img {
  height: 48px; /* 适中的高度 */
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
}

.company-logo-header:hover {
  opacity: 1;
}

.sc2-login-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 400px;
  margin-top: -50px; /* 视觉上移一点 */
}

/* SC2 Logo 样式 */
.sc2-logo {
  text-align: center;
  margin-bottom: 60px;
  filter: drop-shadow(0 0 15px rgba(0, 240, 255, 0.4));
}

.logo-text {
  font-family: 'Orbitron', sans-serif;
  font-size: 48px;
  font-weight: 900;
  color: #FFF;
  letter-spacing: 4px;
  background: linear-gradient(180deg, #FFFFFF 0%, #8BA4C2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
}

.logo-text.cn-title {
  font-family: "Microsoft YaHei", "Heiti SC", sans-serif;
  font-size: 56px; /* 中文大标题 */
  letter-spacing: 8px;
  margin-bottom: 10px;
  /* 移除背景色，保留文字渐变 */
  background: linear-gradient(180deg, #FFFFFF 0%, #00F0FF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  /* 增加光晕 */
  filter: drop-shadow(0 0 10px rgba(0, 240, 255, 0.5));
}

/* .logo-sub { ... }  (已移除) */

.logo-expansion {
  font-family: 'Rajdhani', sans-serif;
  font-size: 16px;
  color: #00F0FF;
  letter-spacing: 6px;
  margin-top: 0px;
  text-shadow: 0 0 10px #00F0FF;
  opacity: 0.8;
}

/* 表单样式 */
.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  position: relative;
}

.sc2-input {
  width: 100%;
  height: 50px;
  background: rgba(8, 16, 30, 0.85);
  border: 1px solid #1C3B58; /* 默认暗边框 */
  border-radius: 0; /* 星际风格直角 */
  padding: 0 20px;
  color: #00F0FF;
  font-family: 'Rajdhani', sans-serif;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.8);
}

.sc2-input::placeholder {
  color: #364F6B;
  font-weight: 500;
}

.sc2-input:focus {
  border-color: #00F0FF;
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.3), inset 0 0 10px rgba(0, 0, 0, 0.5);
  background: rgba(10, 25, 45, 0.9);
}

/* 登录按钮 - SC2 经典样式 */
.sc2-btn-login {
  width: 100%;
  height: 60px;
  background: linear-gradient(180deg, #1E2E42 0%, #0B1420 100%);
  border: 1px solid #3E5878;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
}

.sc2-btn-login .btn-text {
  font-family: 'Orbitron', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #7B98BC;
  letter-spacing: 2px;
  z-index: 2;
  transition: color 0.2s;
}

.sc2-btn-login:hover {
  border-color: #00F0FF;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);
}

.sc2-btn-login:hover .btn-text {
  color: #FFFFFF;
  text-shadow: 0 0 10px #00F0FF;
}

/* 按钮高光效果 */
.sc2-btn-login::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #FFFFFF, transparent);
  opacity: 0.3;
}

.sc2-btn-login:active {
  transform: scale(0.98);
  background: linear-gradient(180deg, #00F0FF 0%, #0078D7 100%);
}

.sc2-btn-login:active .btn-text {
  color: #000;
  text-shadow: none;
}

/* 底部链接 */
.login-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.footer-link {
  color: #506A88;
  text-decoration: none;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: color 0.3s;
}

.footer-link:hover {
  color: #00F0FF;
  text-shadow: 0 0 8px #00F0FF;
}

.divider {
  color: #2C3E50;
}

/* 区域选择器 */
.region-selector {
  margin-top: 40px;
  text-align: center;
  border: 1px solid #1C3B58;
  background: rgba(0, 0, 0, 0.5);
  padding: 8px 20px;
  display: inline-flex;
  gap: 10px;
  align-self: center;
  cursor: pointer;
  transition: all 0.3s;
}

.region-selector:hover {
  border-color: #00F0FF;
}

.region-label {
  color: #506A88;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700;
}

.region-value {
  color: #00F0FF;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
}

/* 版本号 */
.version-info {
  position: absolute;
  bottom: 20px;
  right: 20px;
  color: #364F6B;
  font-family: monospace;
  font-size: 12px;
}
</style>