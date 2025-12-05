<template>
  <div class="orbital-command-container">
    <!-- Background Video/Effect Layer -->
    <div class="scanlines"></div>
    <div class="bg-grid"></div>

    <!-- Top Header: Orbital Status -->
    <header class="terran-header">
      <div class="header-decoration left"></div>
      <div class="header-content">
        <div class="time-display">
          <span class="label">SYS.TIME</span>
          <span class="value">{{ currentTime }}</span>
        </div>
        <div class="title-block">
          <h1 class="glitch-text" data-text="ORBITAL COMMAND">ORBITAL COMMAND</h1>
          <div class="sub-title">:: TACTICAL POWER MONITORING ::</div>
        </div>
        <div class="status-display">
          <span class="label">DEFCON</span>
          <span class="value status-ok">5</span>
        </div>
      </div>
      <div class="header-decoration right"></div>
    </header>

    <!-- Main Content Grid -->
    <main class="terran-grid">
      
      <!-- Left Column: Resource & Units -->
      <aside class="column left-col">
        <div class="panel resource-panel">
          <div class="panel-header">
            <span class="icon">⚡</span> ENERGY OUTPUT
          </div>
          <div class="panel-body">
            <div class="resource-row">
              <div class="res-label">TOTAL LOAD</div>
              <div class="res-bar-container">
                <div class="res-bar" style="width: 65%"></div>
              </div>
              <div class="res-value">65%</div>
            </div>
            <div class="resource-row">
              <div class="res-label">VOLTAGE A</div>
              <div class="res-bar-container">
                <div class="res-bar" style="width: 98%; background: var(--neon-green)"></div>
              </div>
              <div class="res-value">10.2kV</div>
            </div>
            <div class="resource-row">
              <div class="res-label">TEMP CORE</div>
              <div class="res-bar-container">
                <div class="res-bar warning" style="width: 45%"></div>
              </div>
              <div class="res-value">45°C</div>
            </div>
          </div>
        </div>

        <div class="panel unit-panel">
          <div class="panel-header">
            <span class="icon">⚙</span> UNIT STATUS
          </div>
          <div class="panel-body scrollable">
            <div v-for="unit in units" :key="unit.id" class="unit-card" :class="unit.status">
              <div class="unit-icon"></div>
              <div class="unit-info">
                <div class="unit-name">{{ unit.name }}</div>
                <div class="unit-hp-bar">
                  <div class="fill" :style="{width: unit.hp + '%'}"></div>
                </div>
              </div>
              <div class="unit-status-text">{{ unit.status.toUpperCase() }}</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Center Column: Holomap -->
      <section class="column center-col">
        <div class="holomap-container">
          <div class="holo-ring ring-1"></div>
          <div class="holo-ring ring-2"></div>
          <div class="holo-ring ring-3"></div>
          <div class="holo-core">
            <div class="holo-object"></div> <!-- CSS Cube or Sphere -->
          </div>
          <div class="map-overlay">
            <div class="target-reticle"></div>
            <div class="data-readout">
              SCANNING SECTOR 7G...<br>
              NO ANOMALIES DETECTED.
            </div>
          </div>
        </div>
        
        <!-- Bottom Command Card -->
        <div class="command-card">
          <div class="card-grid">
            <button class="cmd-btn" @click="sendCommand('scan')">
              <span class="cmd-icon">🔍</span>
              <span class="cmd-label">SCAN</span>
            </button>
            <button class="cmd-btn" @click="sendCommand('lock')">
              <span class="cmd-icon">🔒</span>
              <span class="cmd-label">LOCKDOWN</span>
            </button>
            <button class="cmd-btn warning" @click="sendCommand('alert')">
              <span class="cmd-icon">⚠</span>
              <span class="cmd-label">ALERT</span>
            </button>
            <button class="cmd-btn active">
              <span class="cmd-icon">👁</span>
              <span class="cmd-label">VIEW</span>
            </button>
            <div class="cmd-info">
              <div class="info-line">CMD: WAITING...</div>
              <div class="info-line">AUTH: ADMIN</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Right Column: Comms & Intel -->
      <aside class="column right-col">
        <div class="panel video-panel">
          <div class="panel-header">
            <span class="icon">📹</span> VISUAL FEED
          </div>
          <div class="video-placeholder">
            <div class="rec-indicator">● REC</div>
            <div class="noise-overlay"></div>
            <div class="camera-label">CAM-01: MAIN GATE</div>
          </div>
        </div>

        <div class="panel log-panel">
          <div class="panel-header">
            <span class="icon">📡</span> TRANSMISSIONS
          </div>
          <div class="panel-body scrollable">
            <div v-for="(log, i) in logs" :key="i" class="log-entry">
              <span class="log-time">[{{ log.time }}]</span>
              <span class="log-msg" :class="log.type">{{ log.msg }}</span>
            </div>
          </div>
        </div>
      </aside>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const currentTime = ref('')
const logs = ref([
  { time: '14:00:01', msg: 'System initialized.', type: 'info' },
  { time: '14:00:05', msg: 'Connecting to satellite...', type: 'info' },
  { time: '14:01:20', msg: 'Power fluctuation in Sector 4.', type: 'warning' },
  { time: '14:05:00', msg: 'Patrol drone returned.', type: 'success' },
])

const units = ref([
  { id: 1, name: 'Transformer Alpha', hp: 95, status: 'online' },
  { id: 2, name: 'Transformer Beta', hp: 82, status: 'online' },
  { id: 3, name: 'Capacitor Bank', hp: 40, status: 'warning' },
  { id: 4, name: 'Backup Gen', hp: 100, status: 'standby' },
  { id: 5, name: 'Cooling Sys', hp: 98, status: 'online' },
])

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', { hour12: false })
}

let timer: any
onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})

const sendCommand = (cmd: string) => {
  logs.value.unshift({
    time: new Date().toLocaleTimeString('en-US', { hour12: false }),
    msg: `Command executed: ${cmd.toUpperCase()}`,
    type: 'info'
  })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Share+Tech+Mono&display=swap');

:root {
  --neon-blue: #00f3ff;
  --neon-green: #0aff0a;
  --neon-red: #ff003c;
  --neon-amber: #ffcc00;
  --bg-dark: #050505;
  --panel-bg: rgba(10, 15, 20, 0.85);
  --border-color: rgba(0, 243, 255, 0.3);
}

.orbital-command-container {
  width: 100%;
  height: 100%;
  background-color: var(--bg-dark);
  color: var(--neon-blue);
  font-family: 'Share Tech Mono', monospace;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  --neon-blue: #00f3ff; /* Define locally if root is not accessible */
  --neon-green: #0aff0a;
  --neon-amber: #ffcc00;
}

/* === Background Effects === */
.scanlines {
  position: absolute; inset: 0; pointer-events: none; z-index: 2;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
  background-size: 100% 2px, 3px 100%;
}
.bg-grid {
  position: absolute; inset: 0; pointer-events: none; z-index: 1;
  background-image: 
    linear-gradient(rgba(0, 243, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 243, 255, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  perspective: 1000px;
  transform: rotateX(60deg) translateY(-100px) scale(2);
  opacity: 0.3;
}

/* === Header === */
.terran-header {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid var(--neon-blue);
  background: linear-gradient(to bottom, #0a1015, #020202);
  position: relative;
  z-index: 10;
  padding: 0 20px;
  box-shadow: 0 0 20px rgba(0, 243, 255, 0.1);
}
.header-content { flex: 1; display: flex; justify-content: space-between; align-items: center; }
.title-block { text-align: center; }
h1 { margin: 0; font-family: 'Orbitron', sans-serif; font-size: 2.5rem; letter-spacing: 4px; text-shadow: 0 0 10px var(--neon-blue); color: #fff; }
.sub-title { font-size: 0.8rem; opacity: 0.7; letter-spacing: 2px; }
.label { font-size: 0.7rem; color: #888; display: block; margin-bottom: 2px; }
.value { font-family: 'Orbitron', sans-serif; font-size: 1.5rem; font-weight: bold; }
.status-ok { color: var(--neon-green); }

/* === Main Grid === */
.terran-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  gap: 10px;
  padding: 10px;
  position: relative;
  z-index: 5;
}

.column { display: flex; flex-direction: column; gap: 10px; }

/* === Panels === */
.panel {
  background: rgba(6, 11, 16, 0.8);
  border: 1px solid var(--neon-blue);
  display: flex;
  flex-direction: column;
  /* Clip corners */
  clip-path: polygon(
    10px 0, 100% 0, 
    100% calc(100% - 10px), calc(100% - 10px) 100%, 
    0 100%, 0 10px
  );
}
.panel-header {
  background: rgba(0, 243, 255, 0.1);
  padding: 8px 12px;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid rgba(0, 243, 255, 0.2);
  display: flex; align-items: center; gap: 8px;
  font-family: 'Orbitron';
}
.panel-body { padding: 10px; flex: 1; }
.scrollable { overflow-y: auto; }

/* Resource Bars */
.resource-row { margin-bottom: 10px; }
.res-label { font-size: 0.7rem; margin-bottom: 2px; color: #aaa; }
.res-bar-container { height: 6px; background: #111; border: 1px solid #333; margin-bottom: 2px; }
.res-bar { height: 100%; background: var(--neon-blue); box-shadow: 0 0 5px var(--neon-blue); }
.res-bar.warning { background: var(--neon-amber); box-shadow: 0 0 5px var(--neon-amber); }
.res-value { text-align: right; font-size: 0.8rem; }

/* Unit Cards */
.unit-card {
  background: rgba(255,255,255,0.02);
  border-left: 2px solid #333;
  padding: 8px; margin-bottom: 5px;
  display: flex; align-items: center; gap: 10px;
}
.unit-card.online { border-left-color: var(--neon-green); }
.unit-card.warning { border-left-color: var(--neon-amber); }
.unit-card.standby { border-left-color: #666; }

.unit-icon { width: 20px; height: 20px; background: #222; border: 1px solid #444; }
.unit-info { flex: 1; }
.unit-name { font-size: 0.75rem; margin-bottom: 2px; }
.unit-hp-bar { height: 3px; background: #111; width: 100%; }
.unit-hp-bar .fill { height: 100%; background: currentColor; }
.unit-status-text { font-size: 0.6rem; opacity: 0.8; }

/* === Holomap Center === */
.holomap-container {
  flex: 1;
  border: 1px solid rgba(0, 243, 255, 0.2);
  background: radial-gradient(circle at center, #0a1520 0%, #000 100%);
  position: relative;
  display: flex; align-items: center; justify-content: center;
  perspective: 800px;
  overflow: hidden;
}
.holo-ring {
  position: absolute; border-radius: 50%; border: 1px dashed rgba(0, 243, 255, 0.3);
  transform-style: preserve-3d;
}
.ring-1 { width: 200px; height: 200px; animation: spin 10s linear infinite; border-color: var(--neon-blue); }
.ring-2 { width: 300px; height: 300px; animation: spin 15s linear infinite reverse; border-color: rgba(0, 243, 255, 0.15); }
.ring-3 { width: 100px; height: 100px; animation: spinX 8s linear infinite; border: 2px solid var(--neon-blue); }

.holo-object {
  width: 40px; height: 40px; background: var(--neon-blue);
  box-shadow: 0 0 40px var(--neon-blue);
  animation: pulse 2s infinite;
}

.map-overlay { position: absolute; inset: 0; pointer-events: none; }
.target-reticle {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 250px; height: 250px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}
.target-reticle::after {
  content: ''; position: absolute; top: -10px; left: 50%; width: 2px; height: 20px; background: var(--neon-blue);
}
.data-readout {
  position: absolute; bottom: 20px; left: 20px;
  font-size: 0.8rem; color: var(--neon-blue);
  text-shadow: 0 0 2px black;
  background: rgba(0,0,0,0.5);
  padding: 5px;
}

/* === Command Card === */
.command-card {
  height: 120px;
  background: #080808;
  border-top: 2px solid #333;
  padding: 10px;
}
.card-grid {
  display: grid; grid-template-columns: repeat(4, 1fr) 2fr; gap: 5px; height: 100%;
}
.cmd-btn {
  background: #151a20; border: 1px solid #333; color: #888;
  cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center;
  transition: all 0.1s;
}
.cmd-btn:hover { border-color: #fff; color: #fff; background: #222; }
.cmd-btn:active { background: #333; transform: translateY(1px); }
.cmd-btn.active { border-color: var(--neon-blue); color: var(--neon-blue); background: rgba(0, 243, 255, 0.1); box-shadow: inset 0 0 10px rgba(0, 243, 255, 0.2); }
.cmd-btn.warning { color: var(--neon-amber); }
.cmd-icon { font-size: 1.5rem; margin-bottom: 5px; }
.cmd-label { font-size: 0.7rem; font-weight: bold; }
.cmd-info { padding: 5px; color: #555; font-size: 0.7rem; border: 1px solid #222; display: flex; flex-direction: column; justify-content: center; }

/* === Right Col === */
.video-panel { height: 200px; }
.video-placeholder {
  background: #000; flex: 1; position: relative; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}
.rec-indicator { position: absolute; top: 10px; right: 10px; color: red; font-size: 0.7rem; animation: blink 1s infinite; }
.noise-overlay {
  position: absolute; inset: 0; opacity: 0.1;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}
.camera-label { position: absolute; bottom: 5px; left: 5px; font-size: 0.7rem; background: #000; color: #fff; padding: 2px; }
.log-panel { flex: 1; }
.log-entry { font-size: 0.75rem; margin-bottom: 4px; border-bottom: 1px solid #111; padding-bottom: 2px; }
.log-time { color: #666; margin-right: 5px; }
.log-msg.info { color: #aaa; }
.log-msg.warning { color: var(--neon-amber); }
.log-msg.success { color: var(--neon-green); }

/* Animations */
@keyframes spin { 0% { transform: rotateX(70deg) rotateZ(0deg); } 100% { transform: rotateX(70deg) rotateZ(360deg); } }
@keyframes spinX { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(360deg); } }
@keyframes pulse { 0%, 100% { opacity: 0.8; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }
@keyframes blink { 50% { opacity: 0; } }

</style>
