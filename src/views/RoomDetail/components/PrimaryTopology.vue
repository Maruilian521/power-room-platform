<template>
  <div class="topology-container">
    <div class="main-diagram-area">
      <!-- 顶部标题 -->
      <div class="diag-header">
        <div class="diag-title">PRIMARY SYSTEM TOPOLOGY - 10kV/0.4kV</div>
        <div class="diag-status">LIVE FEED</div>
      </div>

      <!-- 核心拓扑图绘制区 -->
      <div class="diagram-canvas">
        
        <!-- 10kV 进线 -->
        <div class="line hv-line-in">
          <div class="label-tag top">10kV 进线</div>
          <div class="current-flow"></div>
        </div>

        <!-- 高压断路器 -->
        <div class="breaker hv-breaker closed">
          <div class="breaker-symbol"></div>
          <div class="breaker-label">QF1</div>
        </div>

        <!-- 10kV 母线 -->
        <div class="busbar hv-busbar">
          <div class="label-tag">10kV I段母线</div>
        </div>

        <!-- 变压器分支 -->
        <div class="line transformer-branch">
          <div class="current-flow delay-1"></div>
        </div>

        <!-- 变压器本体 -->
        <div class="transformer-box">
          <div class="tf-symbol">
            <div class="circle c1"></div>
            <div class="circle c2"></div>
          </div>
          <div class="tf-info">
            <div class="tf-name">1# 主变</div>
            <div class="tf-cap">1600 kVA</div>
            <div class="tf-temp">56°C</div>
          </div>
        </div>

        <!-- 低压进线 -->
        <div class="line lv-line-in">
          <div class="current-flow delay-2"></div>
        </div>

        <!-- 低压主断路器 -->
        <div class="breaker lv-main-breaker closed">
          <div class="breaker-symbol"></div>
          <div class="breaker-label">QF2</div>
        </div>

        <!-- 0.4kV 母线 -->
        <div class="busbar lv-busbar">
          <div class="label-tag">0.4kV 母线</div>
        </div>

        <!-- 低压出线回路 (多个) -->
        <div class="lv-feeders">
          <div class="feeder" v-for="i in 6" :key="i">
            <div class="line feeder-line">
              <div class="current-flow delay-3"></div>
            </div>
            <div class="breaker feeder-switch closed"></div>
            <div class="load-arrow"></div>
            <div class="feeder-label">回路 {{i}}</div>
          </div>
        </div>

      </div>
    </div>

    <!-- 右侧：遥测数据悬浮窗 -->
    <div class="telemetry-sidebar">
      <div class="panel-title">REAL-TIME TELEMETRY</div>
      
      <!-- A相电压 -->
      <div class="telemetry-card">
        <div class="t-header">
          <span>PHASE A - VOLTAGE</span>
          <span class="val">10.2 kV</span>
        </div>
        <div class="waveform-mock wave-a"></div>
      </div>

      <!-- B相电压 -->
      <div class="telemetry-card">
        <div class="t-header">
          <span>PHASE B - VOLTAGE</span>
          <span class="val">10.3 kV</span>
        </div>
        <div class="waveform-mock wave-b"></div>
      </div>

      <!-- 负荷曲线 -->
      <div class="telemetry-card large">
        <div class="t-header">
          <span>TOTAL LOAD TREND</span>
          <span class="val">85%</span>
        </div>
        <div class="chart-mock">
          <div class="bar" v-for="n in 20" :key="n" :style="{ height: Math.random() * 100 + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 纯展示组件，暂无逻辑
</script>

<style scoped>
.topology-container {
  height: 100%;
  display: flex;
  background: #050608;
  position: relative;
  overflow: hidden;
}

/* 左侧图纸区 */
.main-diagram-area {
  flex: 1;
  position: relative;
  background-image: 
    linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.diag-header {
  position: absolute;
  top: 20px;
  left: 20px;
}

.diag-title {
  font-family: 'Orbitron';
  font-size: 18px;
  color: #00F0FF;
  letter-spacing: 2px;
}

.diag-status {
  font-family: 'Rajdhani';
  color: #00E676;
  font-weight: 700;
  animation: blink 2s infinite;
}

@keyframes blink { 50% { opacity: 0.5; } }

/* 画布 */
.diagram-canvas {
  width: 800px;
  height: 600px;
  position: relative;
  /* transform: scale(0.9); */
}

/* 通用线条 */
.line {
  position: absolute;
  background: #1a253a;
  overflow: hidden;
}

/* 电流动画 */
.current-flow {
  position: absolute;
  background: linear-gradient(90deg, transparent, #00F0FF, transparent);
  box-shadow: 0 0 10px #00F0FF;
}

@keyframes flow-v { 0% { top: -100%; } 100% { top: 100%; } }
@keyframes flow-h { 0% { left: -100%; } 100% { left: 100%; } }

/* 1. 10kV 进线 (竖线) */
.hv-line-in {
  width: 4px;
  height: 100px;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
}
.hv-line-in .current-flow {
  width: 100%; height: 50%;
  animation: flow-v 2s linear infinite;
}

.label-tag {
  position: absolute;
  color: #5f748a;
  font-size: 12px;
  white-space: nowrap;
}
.label-tag.top { top: -20px; left: -20px; }

/* 高压断路器 */
.hv-breaker {
  position: absolute;
  top: 150px;
  left: 50%;
  transform: translateX(-50%);
}

.breaker-symbol {
  width: 30px;
  height: 30px;
  border: 2px solid #00F0FF;
  background: rgba(0, 240, 255, 0.1);
  border-radius: 2px;
}
.breaker.closed .breaker-symbol { background: #FF2E63; border-color: #FF2E63; box-shadow: 0 0 10px #FF2E63; } /* 红色表示合闸(电力行业习惯) */

.breaker-label {
  position: absolute;
  right: -40px; top: 5px;
  color: #00F0FF;
  font-size: 12px;
}

/* 10kV 母线 (横线) */
.hv-busbar {
  position: absolute;
  top: 200px;
  left: 200px;
  width: 400px;
  height: 6px;
  background: #3E5878;
  border-radius: 3px;
  box-shadow: 0 0 10px rgba(62, 88, 120, 0.5);
}
.hv-busbar .label-tag { top: -20px; left: 0; }

/* 变压器分支 (竖线) */
.transformer-branch {
  width: 4px;
  height: 60px;
  top: 206px;
  left: 50%;
  transform: translateX(-50%);
}
.transformer-branch .current-flow {
  width: 100%; height: 50%;
  animation: flow-v 2s linear infinite;
}

/* 变压器 */
.transformer-box {
  position: absolute;
  top: 266px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tf-symbol {
  position: relative;
  width: 40px;
  height: 60px;
}
.tf-symbol .circle {
  width: 30px; height: 30px;
  border: 2px solid #FFD600;
  border-radius: 50%;
  position: absolute;
  left: 5px;
}
.c1 { top: 0; }
.c2 { bottom: 0; }

.tf-info {
  position: absolute;
  right: -120px;
  top: 10px;
  background: rgba(0,0,0,0.5);
  border: 1px solid #FFD600;
  padding: 5px 10px;
  width: 100px;
}
.tf-name { color: #FFD600; font-weight: 700; }
.tf-temp { color: #FF2E63; }

/* 低压进线 */
.lv-line-in {
  width: 4px;
  height: 60px;
  top: 326px;
  left: 50%;
  transform: translateX(-50%);
}
.lv-line-in .current-flow {
  width: 100%; height: 50%;
  animation: flow-v 2s linear infinite;
}

/* 低压断路器 */
.lv-main-breaker {
  position: absolute;
  top: 386px;
  left: 50%;
  transform: translateX(-50%);
}
.lv-main-breaker .breaker-symbol { border-color: #00F0FF; }
.lv-main-breaker.closed .breaker-symbol { background: #FF2E63; border-color: #FF2E63; }

/* 0.4kV 母线 */
.lv-busbar {
  position: absolute;
  top: 436px;
  left: 100px;
  width: 600px;
  height: 8px;
  background: #3E5878;
  box-shadow: 0 0 10px rgba(62, 88, 120, 0.5);
}

/* 低压出线 */
.lv-feeders {
  position: absolute;
  top: 444px;
  left: 100px;
  width: 600px;
  display: flex;
  justify-content: space-around;
}

.feeder {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100px;
  position: relative;
}

.feeder-line {
  width: 2px;
  height: 40px;
  background: #1a253a;
}
.feeder-line .current-flow {
  width: 100%; height: 50%;
  animation: flow-v 2s linear infinite;
}

.feeder-switch {
  width: 16px; height: 16px;
  background: #1a2129;
  border: 1px solid #00F0FF;
  margin-top: -2px;
}
.feeder-switch.closed { background: #FF2E63; border-color: #FF2E63; }

.load-arrow {
  width: 0; height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 8px solid #00F0FF;
  margin-top: 20px;
}

.feeder-label {
  font-size: 10px;
  color: #5f748a;
  margin-top: 5px;
}

/* 右侧侧边栏 */
.telemetry-sidebar {
  width: 300px;
  background: rgba(10, 14, 20, 0.9);
  border-left: 1px solid rgba(0, 240, 255, 0.2);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  backdrop-filter: blur(10px);
}

.panel-title {
  color: #00F0FF;
  font-family: 'Orbitron';
  border-bottom: 1px solid #00F0FF;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.telemetry-card {
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 10px;
  border-radius: 2px;
}

.t-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #8b9bb4;
  margin-bottom: 8px;
}
.t-header .val { color: #FFF; font-weight: 700; font-family: 'Rajdhani'; font-size: 16px; }

.waveform-mock {
  height: 40px;
  background: repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,240,255,0.1) 10px, rgba(0,240,255,0.1) 11px);
  border-bottom: 1px solid rgba(0,240,255,0.3);
  position: relative;
}
.waveform-mock::after {
  content: '';
  position: absolute;
  left: 0; right: 0; bottom: 10px;
  height: 2px;
  background: #00E676;
  box-shadow: 0 0 5px #00E676;
  clip-path: polygon(0 50%, 10% 0, 20% 100%, 30% 50%, 40% 0, 50% 100%, 60% 50%, 70% 0, 80% 100%, 90% 50%, 100% 50%);
}

.chart-mock {
  height: 100px;
  display: flex;
  align-items: flex-end;
  gap: 2px;
}
.chart-mock .bar {
  flex: 1;
  background: #00F0FF;
  opacity: 0.5;
  transition: height 0.5s;
}

.delay-1 { animation-delay: 0.5s !important; }
.delay-2 { animation-delay: 1s !important; }
.delay-3 { animation-delay: 1.5s !important; }
</style>
