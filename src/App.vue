<template>
  <router-view />
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
#app {
  width: 100%;
  height: 100%;
}
</style>
