<template>
  <div ref="containerRef" class="three-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as THREE from 'three'
// Import OrbitControls directly from three/examples/jsm...
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const props = defineProps<{
  sites: any[]
  units: any[]
}>()

const emit = defineEmits(['site-click'])

const containerRef = ref<HTMLElement>()
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let frameId: number
const isInitialized = ref(false)

// Objects storage for updates
const siteMeshes: { [key: number]: THREE.Group } = {}
const unitMeshes: { [key: string]: THREE.Mesh } = {}

// Colors
const COLOR_GRID = 0x004080
const COLOR_GROUND = 0x000510
const COLOR_NORMAL = 0x00F0FF
const COLOR_WARNING = 0xFFD600
const COLOR_DANGER = 0xFF2E63

// Init Three.js
const init = () => {
  if (!containerRef.value) {
    // Retry a few times if container is not ready yet
    setTimeout(init, 100)
    return
  }

  if (isInitialized.value) return

  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight
  
  if (width === 0 || height === 0) {
    setTimeout(init, 100)
    return
  }

  // 1. Scene
  scene = new THREE.Scene()
  // scene.background = new THREE.Color(0x020406) // Transparent for CSS bg
  scene.fog = new THREE.FogExp2(0x020406, 0.002)

  // 2. Camera
  camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000)
  camera.position.set(0, 150, 200)
  camera.lookAt(0, 0, 0)

  // 3. Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  containerRef.value.appendChild(renderer.domElement)

  // 4. Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.maxPolarAngle = Math.PI / 2 - 0.1
  controls.minDistance = 50
  controls.maxDistance = 400
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.5

  // 5. Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)
  
  const dirLight = new THREE.DirectionalLight(0x00F0FF, 1)
  dirLight.position.set(50, 100, 50)
  scene.add(dirLight)

  const pointLight = new THREE.PointLight(0xFF2E63, 2, 100)
  pointLight.position.set(0, 20, 0)
  scene.add(pointLight)

  // 6. Environment
  createGround()
  createGrid()
  
  isInitialized.value = true

  // 7. Initial Objects
  updateSites()
  updateUnits()

  // 8. Event Listeners
  window.addEventListener('resize', onWindowResize)
  containerRef.value.addEventListener('click', onMouseClick)

  animate()
}

// --- Environment Creators ---

const createGround = () => {
  // A simple dark plane
  const geometry = new THREE.PlaneGeometry(500, 500)
  const material = new THREE.MeshBasicMaterial({ color: COLOR_GROUND, side: THREE.DoubleSide })
  const plane = new THREE.Mesh(geometry, material)
  plane.rotation.x = -Math.PI / 2
  plane.position.y = -0.5
  scene.add(plane)
}

const createGrid = () => {
  // Infinite-looking grid
  const gridHelper = new THREE.GridHelper(500, 50, COLOR_GRID, COLOR_GRID)
  gridHelper.position.y = 0
  gridHelper.material.opacity = 0.2
  gridHelper.material.transparent = true
  scene.add(gridHelper)

  // Secondary finer grid
  const subGrid = new THREE.GridHelper(500, 250, 0x002040, 0x002040)
  subGrid.position.y = 0.1
  subGrid.material.opacity = 0.1
  subGrid.material.transparent = true
  scene.add(subGrid)
}

// --- Dynamic Objects ---

const getStatusColor = (status: string) => {
  if (status === 'warning') return COLOR_WARNING
  if (status === 'danger') return COLOR_DANGER
  return COLOR_NORMAL
}

const updateSites = () => {
  if (!isInitialized.value) return
  // Clear old if needed? For now assumes static site list, dynamic status
  props.sites.forEach((site) => {
    if (!siteMeshes[site.id]) {
      // Create Building
      const group = new THREE.Group()
      
      // Base
      const geo = new THREE.BoxGeometry(10, 20 + Math.random() * 20, 10) // Random height
      const mat = new THREE.MeshLambertMaterial({ 
        color: getStatusColor(site.status), 
        transparent: true, 
        opacity: 0.8,
        emissive: getStatusColor(site.status),
        emissiveIntensity: 0.2
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.y = 10 // Half height roughly
      group.add(mesh)

      // Wireframe outline
      const edges = new THREE.EdgesGeometry(geo)
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 }))
      line.position.y = 10
      group.add(line)

      // Label (simplified as a floating glowing orb for now)
      const labelGeo = new THREE.SphereGeometry(1, 8, 8)
      const labelMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
      const label = new THREE.Mesh(labelGeo, labelMat)
      label.position.y = 40
      group.add(label)

      // Position map: x/y 0-100 -> world -100 to 100
      group.position.x = (site.x - 50) * 4
      group.position.z = (site.y - 50) * 4
      
      group.userData = { id: site.id, type: 'site' } // For raycasting
      
      scene.add(group)
      siteMeshes[site.id] = group
    } else {
      // Update status color
      const group = siteMeshes[site.id]!
      const mesh = group.children[0] as THREE.Mesh
      const color = getStatusColor(site.status)
      ;(mesh.material as THREE.MeshLambertMaterial).color.setHex(color)
      ;(mesh.material as THREE.MeshLambertMaterial).emissive.setHex(color)
    }
  })
}

const updateUnits = () => {
  if (!isInitialized.value) return
  props.units.forEach(unit => {
    let mesh = unitMeshes[unit.id]
    if (!mesh) {
      // Create Unit
      const geometry = unit.type === 'drone' 
        ? new THREE.ConeGeometry(2, 5, 4) // Drone shape
        : new THREE.BoxGeometry(3, 3, 3) // Robot shape
      
      const material = new THREE.MeshBasicMaterial({ 
        color: unit.type === 'drone' ? 0x00ff00 : 0xffaa00,
        wireframe: true
      })
      
      mesh = new THREE.Mesh(geometry, material)
      if (unit.type === 'drone') {
        mesh.rotation.x = Math.PI / 2 // Point forward
        mesh.position.y = 20 // Flying
      } else {
        mesh.position.y = 2 // Ground
      }
      
      scene.add(mesh)
      unitMeshes[unit.id] = mesh
    }

    // Update position
    const targetX = (unit.x - 50) * 4
    const targetZ = (unit.y - 50) * 4
    
    // Smooth lerp
    mesh.position.x += (targetX - mesh.position.x) * 0.1
    mesh.position.z += (targetZ - mesh.position.z) * 0.1
    
    // Rotate drone?
    if (unit.type === 'drone') {
      mesh.rotation.z += 0.1
    }
  })
}

// --- Animation Loop ---

const animate = () => {
  frameId = requestAnimationFrame(animate)
  controls.update()
  
  // Pulse effect for buildings
  const time = Date.now() * 0.001
  Object.values(siteMeshes).forEach((group, i) => {
    const mesh = group.children[0] as THREE.Mesh
    const mat = mesh.material as THREE.MeshLambertMaterial
    mat.opacity = 0.6 + Math.sin(time + i) * 0.2
  })

  renderer.render(scene, camera)
}

// --- Interaction ---

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

const onMouseClick = (event: MouseEvent) => {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children, true)

  for (const intersect of intersects) {
    // Traverse up to find the group with userData
    let obj = intersect.object
    while (obj.parent && obj.parent !== scene) {
      if (obj.parent.userData && obj.parent.userData.type === 'site') {
        const siteId = obj.parent.userData.id
        const site = props.sites.find(s => s.id === siteId)
        if (site) emit('site-click', site, event)
        return
      }
      obj = obj.parent
    }
  }
  emit('site-click', null) // Clicked void
}

const onWindowResize = () => {
  if (!containerRef.value || !camera || !renderer) return
  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

// Watchers for prop updates
watch(() => props.units, updateUnits, { deep: true })
watch(() => props.sites, updateSites, { deep: true })

onMounted(async () => {
  await nextTick()
  init()
})

onUnmounted(() => {
  cancelAnimationFrame(frameId)
  window.removeEventListener('resize', onWindowResize)
  if (renderer) renderer.dispose()
  if (controls) controls.dispose()
})
</script>

<style scoped>
.three-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  outline: none;
  z-index: 1; /* Ensure it sits below HUD overlay but above background */
}
</style>
