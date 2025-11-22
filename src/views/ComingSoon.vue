<template>
  <div class="page-container coming-soon">
    <div class="module-card content-box">
      <div class="icon-wrapper">
        <el-icon class="icon"><Setting /></el-icon>
      </div>
      <h2 class="title">功能开发中</h2>
      <p class="subtitle">Feature Under Construction</p>
      <div class="construction-bar"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Setting } from '@element-plus/icons-vue'
</script>

<style scoped>
.coming-soon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.content-box {
  width: 100%;
  max-width: 500px;
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: rgba(13, 18, 26, 0.8);
  border: 1px solid var(--tech-primary);
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.1);
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(0, 240, 255, 0.05);
  border: 2px solid var(--tech-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);
  animation: pulse 3s infinite;
}

.icon {
  font-size: 40px;
  color: var(--tech-primary);
  animation: rotate 10s linear infinite;
}

.title {
  font-family: 'Orbitron', sans-serif;
  font-size: 24px;
  color: var(--text-bright);
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.subtitle {
  font-family: 'Rajdhani', sans-serif;
  font-size: 14px;
  color: var(--text-sub);
  letter-spacing: 4px;
  text-transform: uppercase;
  margin-bottom: 30px;
}

.construction-bar {
  width: 200px;
  height: 4px;
  background: repeating-linear-gradient(
    45deg,
    var(--status-warning),
    var(--status-warning) 10px,
    #000 10px,
    #000 20px
  );
  box-shadow: 0 0 10px var(--status-warning);
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(0, 240, 255, 0.4); }
  70% { box-shadow: 0 0 0 20px rgba(0, 240, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 240, 255, 0); }
}
</style>
