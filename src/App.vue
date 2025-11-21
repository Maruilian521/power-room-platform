<template>
  <div class="app-frame">
    <!-- Main Viewport -->
    <div class="app-viewport">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { updateDeviceData } from './mock'

let timer: number

// 每5秒更新一次设备数据
onMounted(() => {
  timer = setInterval(() => {
    updateDeviceData()
  }, 5000)
})

// 清理定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
/* Base App Structure */
.app-frame {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
}

.app-viewport {
  flex: 1;
  overflow: hidden;
  position: relative;
  z-index: 1;
}
</style>