<template>
  <div class="theme-switcher">
    <!-- 旗舰版深色主题 -->
    <div
      class="theme-btn theme-btn-matrix"
      :class="{ active: currentTheme === 'iot-matrix' }"
      @click="switchTheme('iot-matrix')"
      title="深空指控中心"
    >
      <div class="theme-btn-icon">💠</div>
    </div>

    <!-- Air版浅色主题 -->
    <div
      class="theme-btn theme-btn-light"
      :class="{ active: currentTheme === 'light-blue' }"
      @click="switchTheme('light-blue')"
      title="云端实验室"
    >
      <div class="theme-btn-icon">☁️</div>
    </div>

    <!-- Terran人族主题 -->
    <div
      class="theme-btn theme-btn-terran"
      :class="{ active: currentTheme === 'terran-command' }"
      @click="switchTheme('terran-command')"
      title="人族指挥官"
    >
      <div class="theme-btn-icon">🚀</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

type ThemeType = 'iot-matrix' | 'light-blue' | 'terran-command'

const currentTheme = ref<ThemeType>('iot-matrix')

const switchTheme = (theme: ThemeType) => {
  currentTheme.value = theme
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('app-theme', theme)
  window.dispatchEvent(new CustomEvent('theme-change', { detail: theme }))
}

onMounted(() => {
  const savedTheme = localStorage.getItem('app-theme') as ThemeType | null
  if (savedTheme) {
    currentTheme.value = savedTheme
    document.documentElement.setAttribute('data-theme', savedTheme)
  } else {
    // 默认使用 IotMatrix 旗舰主题
    switchTheme('iot-matrix')
  }
})
</script>

<style scoped>
/* ... existing styles ... */

/* Matrix 主题按钮 */
.theme-btn-matrix {
  background: linear-gradient(135deg, #00F3FF, #0078D7);
  box-shadow: 0 0 10px rgba(0, 243, 255, 0.4);
}

/* Terran 主题按钮 */
.theme-btn-terran {
  background: linear-gradient(135deg, #1a1f26, #005f8c);
  border: 1px solid #00F0FF;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3), inset 0 0 15px rgba(0,0,0,0.8);
}

/* 浅色主题按钮 */
.theme-btn-light {
  background: linear-gradient(135deg, #F59E0B, #FCD34D);
}

.theme-btn-icon {
  font-size: 20px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}
</style>
