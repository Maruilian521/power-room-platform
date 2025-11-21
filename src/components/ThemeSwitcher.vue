<template>
  <div class="theme-switcher">
    <div
      class="theme-btn theme-btn-blue"
      :class="{ active: currentTheme === 'light-blue' }"
      @click="switchTheme('light-blue')"
      title="浅色蓝主题"
    >
      <div class="theme-btn-icon">☀️</div>
    </div>
    <div
      class="theme-btn theme-btn-dark"
      :class="{ active: currentTheme === 'dark-blue' }"
      @click="switchTheme('dark-blue')"
      title="深色蓝主题"
    >
      <div class="theme-btn-icon">🌙</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const currentTheme = ref<'light-blue' | 'dark-blue'>('light-blue')

const switchTheme = (theme: 'light-blue' | 'dark-blue') => {
  currentTheme.value = theme
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('app-theme', theme)

  // 触发主题切换事件
  window.dispatchEvent(new CustomEvent('theme-change', { detail: theme }))
}

onMounted(() => {
  const savedTheme = localStorage.getItem('app-theme') as 'light-blue' | 'dark-blue' | null
  if (savedTheme) {
    currentTheme.value = savedTheme
  } else {
    // 默认使用浅色蓝主题
    switchTheme('light-blue')
  }
})
</script>

<style scoped>
.theme-switcher {
  position: fixed;
  bottom: 32px;
  right: 32px;
  display: flex;
  gap: 12px;
  z-index: 1000;
}

.theme-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
}

.theme-btn-icon {
  font-size: 24px;
}

.theme-btn-blue {
  background: linear-gradient(135deg, #4B7CF3, #3461E0);
  box-shadow: 0 4px 15px rgba(75, 124, 243, 0.3);
}

.theme-btn-blue:hover {
  box-shadow: 0 6px 25px rgba(75, 124, 243, 0.5);
  transform: scale(1.1) rotate(5deg);
}

.theme-btn-dark {
  background: linear-gradient(135deg, #1E3A8A, #1E293B);
  box-shadow: 0 4px 15px rgba(30, 58, 138, 0.3);
}

.theme-btn-dark:hover {
  box-shadow: 0 6px 25px rgba(30, 58, 138, 0.5);
  transform: scale(1.1) rotate(5deg);
}

.theme-btn.active {
  border-color: #FFFFFF;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
}
</style>
