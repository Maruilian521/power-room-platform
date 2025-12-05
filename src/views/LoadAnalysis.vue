<template>
  <div class="load-analysis-page">
    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 页面标题区 -->
      <div class="page-header">
        <div class="main-tabs-container">
          <div class="main-tabs">
            <div
              :class="['main-tab-item', { active: activeMainTab === 'realtime' }]"
              @click="activeMainTab = 'realtime'"
            >
              实时负荷
            </div>
            <div
              :class="['main-tab-item', { active: activeMainTab === 'history' }]"
              @click="activeMainTab = 'history'"
            >
              历史分析
            </div>
            <div
              :class="['main-tab-item', { active: activeMainTab === 'prediction' }]"
              @click="activeMainTab = 'prediction'"
            >
              负荷预测
            </div>
            <div
              :class="['main-tab-item', { active: activeMainTab === 'demand' }]"
              @click="activeMainTab = 'demand'"
            >
              需量管理
            </div>
          </div>

          <!-- 视图切换与配电室选择 -->
          <div class="header-actions">
            <!-- 视图切换 (仅在实时负荷显示) -->
            <div class="view-switch" v-if="activeMainTab === 'realtime'">
              <button
                :class="['switch-btn', { active: viewMode === 'report' }]"
                @click="viewMode = 'report'"
                title="报表视图"
              >
                <el-icon><Document /></el-icon>
                <span>报表</span>
              </button>
              <button
                :class="['switch-btn', { active: viewMode === 'list' }]"
                @click="viewMode = 'list'"
                title="列表视图"
              >
                <el-icon><List /></el-icon>
                <span>列表</span>
              </button>
            </div>
            <el-select v-model="selectedRoom" placeholder="选择配电室" style="width: 200px">
              <el-option
                v-for="room in rooms"
                :key="room.id"
                :label="room.name"
                :value="room.id"
              />
            </el-select>
            <el-date-picker
              v-if="activeMainTab === 'history'"
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 280px"
            />
          </div>
        </div>
      </div>

      <!-- 内容区容器 -->
      <div class="content-wrapper">
        <!-- =============== 实时负荷 =============== -->
        <template v-if="activeMainTab === 'realtime'">
          <!-- ===== 报表视图 ===== -->
          <template v-if="viewMode === 'report'">
          <!-- 实时负荷总览 -->
          <div class="realtime-overview">
            <div class="overview-card main">
              <div class="card-icon">
                <el-icon><Lightning /></el-icon>
              </div>
              <div class="card-content">
                <div class="card-label">当前总负荷</div>
                <div class="card-value">{{ realtimeData.totalLoad.toFixed(1) }}<span class="unit">kW</span></div>
                <div class="card-trend" :class="realtimeData.loadTrend">
                  <el-icon v-if="realtimeData.loadTrend === 'up'"><Top /></el-icon>
                  <el-icon v-else-if="realtimeData.loadTrend === 'down'"><Bottom /></el-icon>
                  <span>较上小时 {{ realtimeData.loadChange > 0 ? '+' : '' }}{{ realtimeData.loadChange }}%</span>
                </div>
              </div>
            </div>
            <div class="overview-card">
              <div class="card-icon capacity">
                <el-icon><Odometer /></el-icon>
              </div>
              <div class="card-content">
                <div class="card-label">装机容量</div>
                <div class="card-value">{{ realtimeData.capacity }}<span class="unit">kVA</span></div>
                <div class="card-sub">变压器容量</div>
              </div>
            </div>
            <div class="overview-card">
              <div class="card-icon rate">
                <el-icon><DataLine /></el-icon>
              </div>
              <div class="card-content">
                <div class="card-label">负载率</div>
                <div class="card-value" :class="getLoadRateClass(realtimeData.loadRate)">
                  {{ realtimeData.loadRate.toFixed(1) }}<span class="unit">%</span>
                </div>
                <div class="card-sub">{{ getLoadRateStatus(realtimeData.loadRate) }}</div>
              </div>
            </div>
            <div class="overview-card">
              <div class="card-icon peak">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="card-content">
                <div class="card-label">今日峰值</div>
                <div class="card-value">{{ realtimeData.todayPeak }}<span class="unit">kW</span></div>
                <div class="card-sub">{{ realtimeData.peakTime }}</div>
              </div>
            </div>
            <div class="overview-card">
              <div class="card-icon valley">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="card-content">
                <div class="card-label">今日谷值</div>
                <div class="card-value">{{ realtimeData.todayValley }}<span class="unit">kW</span></div>
                <div class="card-sub">{{ realtimeData.valleyTime }}</div>
              </div>
            </div>
            <div class="overview-card">
              <div class="card-icon factor">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="card-content">
                <div class="card-label">功率因数</div>
                <div class="card-value" :class="realtimeData.powerFactor >= 0.9 ? 'good' : 'warning'">
                  {{ realtimeData.powerFactor.toFixed(3) }}
                </div>
                <div class="card-sub">{{ realtimeData.powerFactor >= 0.9 ? '达标' : '需优化' }}</div>
              </div>
            </div>
          </div>

          <!-- 各回路负荷分布 -->
          <div class="load-distribution-panel">
            <div class="panel-header">
              <span class="panel-title">
                <el-icon><Grid /></el-icon>
                各回路负荷分布
              </span>
              <span class="update-time">更新于 {{ lastUpdateTime }}</span>
            </div>
            <div class="circuit-load-grid">
              <div
                v-for="circuit in circuitLoads"
                :key="circuit.id"
                :class="['circuit-card', getLoadLevelClass(circuit.loadRate)]"
              >
                <div class="circuit-header">
                  <span class="circuit-name">{{ circuit.name }}</span>
                  <span class="circuit-status" :class="circuit.status">{{ circuit.status === 'normal' ? '正常' : '告警' }}</span>
                </div>
                <div class="circuit-metrics">
                  <div class="metric-main">
                    <span class="metric-value">{{ circuit.power.toFixed(1) }}</span>
                    <span class="metric-unit">kW</span>
                  </div>
                  <div class="metric-details">
                    <div class="detail-row">
                      <span class="label">电流</span>
                      <span class="value">{{ circuit.current.toFixed(1) }} A</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">电压</span>
                      <span class="value">{{ circuit.voltage.toFixed(0) }} V</span>
                    </div>
                  </div>
                </div>
                <div class="circuit-load-bar">
                  <div class="load-label">负载率</div>
                  <div class="load-bar-wrapper">
                    <div
                      class="load-bar-fill"
                      :class="getLoadLevelClass(circuit.loadRate)"
                      :style="{ width: Math.min(circuit.loadRate, 100) + '%' }"
                    ></div>
                  </div>
                  <span class="load-value">{{ circuit.loadRate.toFixed(1) }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 实时负荷曲线 -->
          <div class="realtime-chart-panel">
            <div class="panel-header">
              <span class="panel-title">
                <el-icon><TrendCharts /></el-icon>
                实时负荷曲线（最近24小时）
              </span>
              <div class="chart-controls">
                <el-radio-group v-model="chartInterval" size="small">
                  <el-radio-button label="1min">1分钟</el-radio-button>
                  <el-radio-button label="5min">5分钟</el-radio-button>
                  <el-radio-button label="15min">15分钟</el-radio-button>
                </el-radio-group>
              </div>
            </div>
            <div class="chart-area">
              <div class="chart-mock">
                <div class="mock-grid"></div>
                <svg class="mock-line" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke="url(#gradient)"
                    stroke-width="0.5"
                    points="0,30 5,28 10,25 15,22 20,18 25,20 30,22 35,15 40,12 45,15 50,18 55,20 60,22 65,25 70,20 75,18 80,15 85,18 90,22 95,25 100,20"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style="stop-color:#00f3ff" />
                      <stop offset="50%" style="stop-color:#00E676" />
                      <stop offset="100%" style="stop-color:#00f3ff" />
                    </linearGradient>
                  </defs>
                </svg>
                <div class="peak-marker" style="left: 40%">
                  <span class="marker-label">峰值 856kW</span>
                </div>
              </div>
              <div class="chart-legend">
                <span class="legend-item"><span class="legend-color load"></span>有功功率</span>
                <span class="legend-item"><span class="legend-color reactive"></span>无功功率</span>
                <span class="legend-item"><span class="legend-color limit"></span>容量限值</span>
              </div>
            </div>
          </div>
          </template>

          <!-- ===== 列表视图 ===== -->
          <template v-else>
            <div class="list-view-container">
              <!-- 列表工具栏 -->
              <div class="list-toolbar">
                <div class="toolbar-left">
                  <el-input
                    v-model="listSearchKeyword"
                    placeholder="搜索回路..."
                    style="width: 200px"
                    clearable
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                  <el-select v-model="listStatusFilter" placeholder="状态筛选" style="width: 120px" clearable>
                    <el-option label="全部" value="" />
                    <el-option label="正常" value="normal" />
                    <el-option label="告警" value="warning" />
                    <el-option label="超载" value="overload" />
                  </el-select>
                  <el-select v-model="listLoadLevelFilter" placeholder="负载等级" style="width: 120px" clearable>
                    <el-option label="全部" value="" />
                    <el-option label="轻载" value="low" />
                    <el-option label="正常" value="normal" />
                    <el-option label="高载" value="high" />
                    <el-option label="超载" value="overload" />
                  </el-select>
                </div>
                <div class="toolbar-right">
                  <span class="record-count">共 {{ circuitListData.length }} 个回路</span>
                </div>
              </div>

              <!-- 列表卡片 -->
              <div class="list-cards">
                <div
                  v-for="circuit in circuitListData"
                  :key="circuit.id"
                  :class="['list-card', getLoadLevelClass(circuit.loadRate), { warning: circuit.status === 'warning' }]"
                >
                  <div class="card-header">
                    <div class="card-circuit-info">
                      <span :class="['status-indicator', circuit.status]"></span>
                      <span class="circuit-name">{{ circuit.name }}</span>
                    </div>
                    <div :class="['card-status', circuit.status]">{{ circuit.status === 'normal' ? '正常' : '告警' }}</div>
                  </div>
                  <div class="card-body">
                    <div class="power-display">
                      <span class="power-value">{{ circuit.power.toFixed(1) }}</span>
                      <span class="power-unit">kW</span>
                    </div>
                    <div class="metrics-grid">
                      <div class="metric-item">
                        <span class="metric-label">电流</span>
                        <span class="metric-value">{{ circuit.current.toFixed(1) }} A</span>
                      </div>
                      <div class="metric-item">
                        <span class="metric-label">电压</span>
                        <span class="metric-value">{{ circuit.voltage.toFixed(0) }} V</span>
                      </div>
                      <div class="metric-item">
                        <span class="metric-label">负载率</span>
                        <span :class="['metric-value', getLoadLevelClass(circuit.loadRate)]">{{ circuit.loadRate.toFixed(1) }}%</span>
                      </div>
                    </div>
                  </div>
                  <div class="card-footer">
                    <div class="load-bar-display">
                      <div class="load-bar-bg">
                        <div
                          class="load-bar-fill"
                          :class="getLoadLevelClass(circuit.loadRate)"
                          :style="{ width: Math.min(circuit.loadRate, 100) + '%' }"
                        ></div>
                      </div>
                    </div>
                    <div class="load-level-tag" :class="getLoadLevelClass(circuit.loadRate)">
                      {{ getLoadLevelText(circuit.loadRate) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-if="circuitListData.length === 0" class="empty-state">
                <el-icon><Grid /></el-icon>
                <span>暂无符合条件的回路</span>
              </div>
            </div>
          </template>
        </template>

        <!-- =============== 历史分析 =============== -->
        <template v-if="activeMainTab === 'history'">
          <div class="history-panel">
            <!-- 分析维度选择 -->
            <div class="analysis-toolbar">
              <el-radio-group v-model="analysisDimension">
                <el-radio-button label="day">日分析</el-radio-button>
                <el-radio-button label="week">周分析</el-radio-button>
                <el-radio-button label="month">月分析</el-radio-button>
                <el-radio-button label="year">年分析</el-radio-button>
              </el-radio-group>
              <button class="action-btn btn-primary" @click="exportAnalysis">
                <el-icon><Download /></el-icon>
                <span>导出报表</span>
              </button>
            </div>

            <!-- 统计摘要 -->
            <div class="stats-summary">
              <div class="summary-card">
                <div class="summary-label">平均负荷</div>
                <div class="summary-value">{{ historyStats.avgLoad }}<span class="unit">kW</span></div>
              </div>
              <div class="summary-card">
                <div class="summary-label">最大负荷</div>
                <div class="summary-value highlight">{{ historyStats.maxLoad }}<span class="unit">kW</span></div>
                <div class="summary-sub">{{ historyStats.maxLoadTime }}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">最小负荷</div>
                <div class="summary-value">{{ historyStats.minLoad }}<span class="unit">kW</span></div>
                <div class="summary-sub">{{ historyStats.minLoadTime }}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">平均负载率</div>
                <div class="summary-value">{{ historyStats.avgLoadRate }}<span class="unit">%</span></div>
              </div>
              <div class="summary-card">
                <div class="summary-label">负荷率</div>
                <div class="summary-value">{{ historyStats.loadFactor }}<span class="unit">%</span></div>
                <div class="summary-sub">平均/最大</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">总用电量</div>
                <div class="summary-value">{{ historyStats.totalEnergy }}<span class="unit">kWh</span></div>
              </div>
            </div>

            <!-- 峰谷分析 -->
            <div class="peak-valley-panel">
              <div class="panel-header">
                <span class="panel-title">
                  <el-icon><DataAnalysis /></el-icon>
                  峰谷平分析
                </span>
                <span class="standard-ref">依据北京市峰谷电价时段</span>
              </div>
              <div class="peak-valley-content">
                <div class="pv-chart">
                  <div class="pv-bar peak">
                    <div class="bar-fill" :style="{ height: peakValleyData.peakPercent + '%' }"></div>
                    <div class="bar-label">尖峰</div>
                    <div class="bar-value">{{ peakValleyData.peakEnergy }} kWh</div>
                    <div class="bar-percent">{{ peakValleyData.peakPercent }}%</div>
                  </div>
                  <div class="pv-bar high">
                    <div class="bar-fill" :style="{ height: peakValleyData.highPercent + '%' }"></div>
                    <div class="bar-label">高峰</div>
                    <div class="bar-value">{{ peakValleyData.highEnergy }} kWh</div>
                    <div class="bar-percent">{{ peakValleyData.highPercent }}%</div>
                  </div>
                  <div class="pv-bar flat">
                    <div class="bar-fill" :style="{ height: peakValleyData.flatPercent + '%' }"></div>
                    <div class="bar-label">平段</div>
                    <div class="bar-value">{{ peakValleyData.flatEnergy }} kWh</div>
                    <div class="bar-percent">{{ peakValleyData.flatPercent }}%</div>
                  </div>
                  <div class="pv-bar valley">
                    <div class="bar-fill" :style="{ height: peakValleyData.valleyPercent + '%' }"></div>
                    <div class="bar-label">低谷</div>
                    <div class="bar-value">{{ peakValleyData.valleyEnergy }} kWh</div>
                    <div class="bar-percent">{{ peakValleyData.valleyPercent }}%</div>
                  </div>
                </div>
                <div class="pv-time-table">
                  <div class="time-row header">
                    <span class="time-period">时段</span>
                    <span class="time-range">时间范围</span>
                    <span class="time-price">电价(元/kWh)</span>
                  </div>
                  <div class="time-row peak">
                    <span class="time-period">尖峰</span>
                    <span class="time-range">10:00-15:00, 18:00-21:00</span>
                    <span class="time-price">1.4047</span>
                  </div>
                  <div class="time-row high">
                    <span class="time-period">高峰</span>
                    <span class="time-range">08:00-10:00, 15:00-18:00, 21:00-22:00</span>
                    <span class="time-price">1.1678</span>
                  </div>
                  <div class="time-row flat">
                    <span class="time-period">平段</span>
                    <span class="time-range">06:00-08:00, 22:00-23:00</span>
                    <span class="time-price">0.7408</span>
                  </div>
                  <div class="time-row valley">
                    <span class="time-period">低谷</span>
                    <span class="time-range">23:00-次日06:00</span>
                    <span class="time-price">0.3139</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 日负荷特性 -->
            <div class="daily-pattern-panel">
              <div class="panel-header">
                <span class="panel-title">
                  <el-icon><Clock /></el-icon>
                  日负荷特性曲线
                </span>
              </div>
              <div class="pattern-chart">
                <div class="hour-bars">
                  <div
                    v-for="(load, hour) in dailyPattern"
                    :key="hour"
                    class="hour-bar"
                    :class="getHourClass(hour)"
                  >
                    <div class="bar-fill" :style="{ height: (load / maxDailyLoad * 100) + '%' }"></div>
                    <span class="hour-label">{{ hour }}</span>
                  </div>
                </div>
                <div class="pattern-legend">
                  <span class="legend-item peak">尖峰时段</span>
                  <span class="legend-item high">高峰时段</span>
                  <span class="legend-item flat">平段时段</span>
                  <span class="legend-item valley">低谷时段</span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- =============== 负荷预测 =============== -->
        <template v-if="activeMainTab === 'prediction'">
          <div class="prediction-panel">
            <!-- 预测配置 -->
            <div class="prediction-config">
              <div class="config-item">
                <span class="config-label">预测周期</span>
                <el-radio-group v-model="predictionPeriod">
                  <el-radio-button label="day">未来24小时</el-radio-button>
                  <el-radio-button label="week">未来7天</el-radio-button>
                  <el-radio-button label="month">未来30天</el-radio-button>
                </el-radio-group>
              </div>
              <div class="config-item">
                <span class="config-label">预测模型</span>
                <el-select v-model="predictionModel" style="width: 180px">
                  <el-option label="LSTM神经网络" value="lstm" />
                  <el-option label="时间序列分析" value="arima" />
                  <el-option label="随机森林" value="rf" />
                </el-select>
              </div>
              <button class="action-btn btn-primary" @click="runPrediction">
                <el-icon><Cpu /></el-icon>
                <span>运行预测</span>
              </button>
            </div>

            <!-- 预测结果摘要 -->
            <div class="prediction-summary">
              <div class="summary-card">
                <div class="summary-icon">
                  <el-icon><TrendCharts /></el-icon>
                </div>
                <div class="summary-content">
                  <div class="summary-label">预测最大负荷</div>
                  <div class="summary-value">{{ predictionResult.maxLoad }}<span class="unit">kW</span></div>
                  <div class="summary-time">{{ predictionResult.maxLoadTime }}</div>
                </div>
              </div>
              <div class="summary-card">
                <div class="summary-icon warning">
                  <el-icon><WarningFilled /></el-icon>
                </div>
                <div class="summary-content">
                  <div class="summary-label">超容风险</div>
                  <div class="summary-value" :class="predictionResult.overloadRisk > 50 ? 'danger' : 'normal'">
                    {{ predictionResult.overloadRisk }}<span class="unit">%</span>
                  </div>
                  <div class="summary-time">概率评估</div>
                </div>
              </div>
              <div class="summary-card">
                <div class="summary-icon">
                  <el-icon><DataLine /></el-icon>
                </div>
                <div class="summary-content">
                  <div class="summary-label">预测用电量</div>
                  <div class="summary-value">{{ predictionResult.totalEnergy }}<span class="unit">kWh</span></div>
                  <div class="summary-time">预测周期内</div>
                </div>
              </div>
              <div class="summary-card">
                <div class="summary-icon">
                  <el-icon><Histogram /></el-icon>
                </div>
                <div class="summary-content">
                  <div class="summary-label">模型准确率</div>
                  <div class="summary-value">{{ predictionResult.accuracy }}<span class="unit">%</span></div>
                  <div class="summary-time">历史验证</div>
                </div>
              </div>
            </div>

            <!-- 预测曲线 -->
            <div class="prediction-chart-panel">
              <div class="panel-header">
                <span class="panel-title">
                  <el-icon><TrendCharts /></el-icon>
                  负荷预测曲线
                </span>
                <span class="confidence-label">置信区间: 95%</span>
              </div>
              <div class="chart-area prediction">
                <div class="chart-mock">
                  <div class="mock-grid"></div>
                  <div class="confidence-band"></div>
                  <svg class="mock-line" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <polyline
                      fill="none"
                      stroke="#00f3ff"
                      stroke-width="0.5"
                      stroke-dasharray="2,1"
                      points="0,25 10,22 20,20 30,18 40,22 50,15 60,12 70,18 80,20 90,22 100,18"
                    />
                  </svg>
                  <div class="threshold-line">
                    <span class="threshold-label">容量限值 1000kW</span>
                  </div>
                </div>
                <div class="chart-legend">
                  <span class="legend-item"><span class="legend-color predict"></span>预测值</span>
                  <span class="legend-item"><span class="legend-color confidence"></span>置信区间</span>
                  <span class="legend-item"><span class="legend-color limit"></span>容量限值</span>
                </div>
              </div>
            </div>

            <!-- 预警提示 -->
            <div class="prediction-alerts" v-if="predictionAlerts.length">
              <div class="panel-header">
                <span class="panel-title">
                  <el-icon><Warning /></el-icon>
                  预测预警
                </span>
              </div>
              <div class="alert-list">
                <div
                  v-for="alert in predictionAlerts"
                  :key="alert.id"
                  :class="['alert-item', alert.level]"
                >
                  <div class="alert-icon">
                    <el-icon><WarningFilled /></el-icon>
                  </div>
                  <div class="alert-content">
                    <div class="alert-title">{{ alert.title }}</div>
                    <div class="alert-desc">{{ alert.description }}</div>
                    <div class="alert-time">预计时间: {{ alert.time }}</div>
                  </div>
                  <div class="alert-action">
                    <button class="action-btn btn-primary" @click="handleAlert(alert)">
                      {{ alert.action }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- =============== 需量管理 =============== -->
        <template v-if="activeMainTab === 'demand'">
          <div class="demand-panel">
            <!-- 需量概览 -->
            <div class="demand-overview">
              <div class="demand-card main">
                <div class="demand-icon">
                  <el-icon><Odometer /></el-icon>
                </div>
                <div class="demand-content">
                  <div class="demand-label">当前需量</div>
                  <div class="demand-value">{{ demandData.currentDemand }}<span class="unit">kW</span></div>
                  <div class="demand-progress">
                    <div class="progress-bar">
                      <div
                        class="progress-fill"
                        :class="getDemandClass(demandData.demandRate)"
                        :style="{ width: demandData.demandRate + '%' }"
                      ></div>
                      <div class="progress-threshold" :style="{ left: '90%' }"></div>
                    </div>
                    <span class="progress-text">{{ demandData.demandRate.toFixed(1) }}% / 申报需量</span>
                  </div>
                </div>
              </div>
              <div class="demand-card">
                <div class="demand-content">
                  <div class="demand-label">申报需量</div>
                  <div class="demand-value">{{ demandData.declaredDemand }}<span class="unit">kW</span></div>
                  <div class="demand-sub">合同约定</div>
                </div>
              </div>
              <div class="demand-card">
                <div class="demand-content">
                  <div class="demand-label">本月最大需量</div>
                  <div class="demand-value highlight">{{ demandData.monthMaxDemand }}<span class="unit">kW</span></div>
                  <div class="demand-sub">{{ demandData.monthMaxTime }}</div>
                </div>
              </div>
              <div class="demand-card">
                <div class="demand-content">
                  <div class="demand-label">超需量次数</div>
                  <div class="demand-value" :class="demandData.overDemandCount > 0 ? 'warning' : ''">
                    {{ demandData.overDemandCount }}<span class="unit">次</span>
                  </div>
                  <div class="demand-sub">本月累计</div>
                </div>
              </div>
              <div class="demand-card">
                <div class="demand-content">
                  <div class="demand-label">预计基本电费</div>
                  <div class="demand-value">{{ demandData.estimatedFee }}<span class="unit">元</span></div>
                  <div class="demand-sub">按最大需量计</div>
                </div>
              </div>
            </div>

            <!-- 需量控制策略 -->
            <div class="demand-control-panel">
              <div class="panel-header">
                <span class="panel-title">
                  <el-icon><Setting /></el-icon>
                  需量控制策略
                </span>
                <el-switch
                  v-model="demandControlEnabled"
                  active-text="已启用"
                  inactive-text="已禁用"
                  :active-color="'#00f3ff'"
                  :inactive-color="'#3E5878'"
                />
              </div>
              <div class="control-strategies">
                <div
                  v-for="strategy in demandStrategies"
                  :key="strategy.id"
                  :class="['strategy-card', { active: strategy.enabled }]"
                >
                  <div class="strategy-header">
                    <span class="strategy-name">{{ strategy.name }}</span>
                    <el-switch
                      v-model="strategy.enabled"
                      :active-color="'#00f3ff'"
                      :inactive-color="'#3E5878'"
                      size="small"
                    />
                  </div>
                  <div class="strategy-content">
                    <div class="strategy-condition">
                      <span class="label">触发条件：</span>
                      <span class="value">{{ strategy.condition }}</span>
                    </div>
                    <div class="strategy-action">
                      <span class="label">控制动作：</span>
                      <span class="value">{{ strategy.action }}</span>
                    </div>
                    <div class="strategy-priority">
                      <span class="label">优先级：</span>
                      <span class="value">{{ strategy.priority }}</span>
                    </div>
                  </div>
                  <div class="strategy-footer">
                    <span class="trigger-count">已触发 {{ strategy.triggerCount }} 次</span>
                    <button class="action-btn btn-secondary" @click="editStrategy(strategy)">配置</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 需量优化建议 -->
            <div class="demand-suggestions-panel">
              <div class="panel-header">
                <span class="panel-title">
                  <el-icon><Sunny /></el-icon>
                  需量优化建议
                </span>
              </div>
              <div class="suggestion-list">
                <div
                  v-for="suggestion in demandSuggestions"
                  :key="suggestion.id"
                  class="suggestion-item"
                >
                  <div class="suggestion-icon" :class="suggestion.type">
                    <el-icon><component :is="getSuggestionIcon(suggestion.type)" /></el-icon>
                  </div>
                  <div class="suggestion-content">
                    <div class="suggestion-title">{{ suggestion.title }}</div>
                    <div class="suggestion-desc">{{ suggestion.description }}</div>
                    <div class="suggestion-benefit">
                      <span class="benefit-label">预计节省：</span>
                      <span class="benefit-value">{{ suggestion.benefit }}</span>
                    </div>
                  </div>
                  <div class="suggestion-action">
                    <button class="action-btn btn-primary" @click="applySuggestion(suggestion)">
                      {{ suggestion.action }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Lightning, Odometer, DataLine, TrendCharts, CircleCheck, Grid, Top, Bottom,
  DataAnalysis, Download, Clock, Cpu, WarningFilled, Histogram, Warning,
  Setting, Sunny, Document, List, Search
} from '@element-plus/icons-vue'

// ========== 基础数据 ==========
const activeMainTab = ref('realtime')
const viewMode = ref<'report' | 'list'>('report')
const selectedRoom = ref('room1')
const dateRange = ref<[Date, Date] | null>(null)
const chartInterval = ref('5min')
const analysisDimension = ref('day')
const predictionPeriod = ref('day')
const predictionModel = ref('lstm')
const demandControlEnabled = ref(true)
const listSearchKeyword = ref('')
const listStatusFilter = ref('')
const listLoadLevelFilter = ref('')

const rooms = [
  { id: 'room1', name: '圆心配电室' },
  { id: 'room2', name: '通州配电室' },
  { id: 'room3', name: '北理工配电室' }
]

const lastUpdateTime = ref('12:35:28')

// ========== 实时负荷数据 ==========
const realtimeData = ref({
  totalLoad: 756.8,
  loadTrend: 'up',
  loadChange: 3.2,
  capacity: 1000,
  loadRate: 75.68,
  todayPeak: 856,
  peakTime: '14:30',
  todayValley: 285,
  valleyTime: '04:15',
  powerFactor: 0.932
})

const circuitLoads = ref([
  { id: 1, name: '1#进线', power: 380.5, current: 565.2, voltage: 389, loadRate: 76.1, status: 'normal' },
  { id: 2, name: '2#进线', power: 376.3, current: 558.8, voltage: 391, loadRate: 75.3, status: 'normal' },
  { id: 3, name: '动力回路-1', power: 125.6, current: 186.5, voltage: 388, loadRate: 62.8, status: 'normal' },
  { id: 4, name: '动力回路-2', power: 98.4, current: 146.2, voltage: 390, loadRate: 49.2, status: 'normal' },
  { id: 5, name: '照明回路', power: 35.8, current: 53.2, voltage: 387, loadRate: 35.8, status: 'normal' },
  { id: 6, name: '空调回路', power: 85.2, current: 126.5, voltage: 389, loadRate: 85.2, status: 'warning' },
  { id: 7, name: '消防回路', power: 12.5, current: 18.6, voltage: 390, loadRate: 12.5, status: 'normal' },
  { id: 8, name: '备用回路', power: 22.8, current: 33.9, voltage: 388, loadRate: 22.8, status: 'normal' }
])

// ========== 历史分析数据 ==========
const historyStats = ref({
  avgLoad: 542,
  maxLoad: 856,
  maxLoadTime: '12月4日 14:30',
  minLoad: 285,
  minLoadTime: '12月4日 04:15',
  avgLoadRate: 54.2,
  loadFactor: 63.3,
  totalEnergy: 13008
})

const peakValleyData = ref({
  peakEnergy: 2860,
  peakPercent: 22,
  highEnergy: 3902,
  highPercent: 30,
  flatEnergy: 2601,
  flatPercent: 20,
  valleyEnergy: 3645,
  valleyPercent: 28
})

const dailyPattern = ref([
  320, 295, 285, 290, 305, 380, 520, 650, 720, 785, 820, 845,
  830, 815, 856, 825, 790, 810, 835, 780, 720, 580, 450, 365
])

const maxDailyLoad = computed(() => Math.max(...dailyPattern.value))

// 列表视图数据
const circuitListData = computed(() => {
  return circuitLoads.value.filter(circuit => {
    const matchKeyword = !listSearchKeyword.value ||
      circuit.name.includes(listSearchKeyword.value)
    const matchStatus = !listStatusFilter.value || circuit.status === listStatusFilter.value
    const matchLoadLevel = !listLoadLevelFilter.value || getLoadLevelClass(circuit.loadRate) === listLoadLevelFilter.value
    return matchKeyword && matchStatus && matchLoadLevel
  })
})

// ========== 负荷预测数据 ==========
const predictionResult = ref({
  maxLoad: 892,
  maxLoadTime: '明日 14:00-15:00',
  overloadRisk: 15,
  totalEnergy: 13500,
  accuracy: 94.5
})

const predictionAlerts = ref([
  {
    id: 1,
    level: 'warning',
    title: '预计负荷接近容量限值',
    description: '明日14:00-15:00时段预测负荷达892kW，接近变压器容量90%',
    time: '2024-12-05 14:00',
    action: '查看详情'
  },
  {
    id: 2,
    level: 'info',
    title: '用电高峰期提醒',
    description: '未来一周为月度用电高峰期，建议提前做好负荷调控准备',
    time: '2024-12-05 ~ 2024-12-12',
    action: '制定预案'
  }
])

// ========== 需量管理数据 ==========
const demandData = ref({
  currentDemand: 756,
  declaredDemand: 900,
  demandRate: 84,
  monthMaxDemand: 856,
  monthMaxTime: '12月4日 14:30',
  overDemandCount: 0,
  estimatedFee: 38520
})

const demandStrategies = ref([
  {
    id: 1,
    name: '一级负荷控制',
    enabled: true,
    condition: '需量达到申报值的95%',
    action: '切除非重要空调负荷',
    priority: '高',
    triggerCount: 2
  },
  {
    id: 2,
    name: '二级负荷控制',
    enabled: true,
    condition: '需量达到申报值的100%',
    action: '切除照明50%、空调全部',
    priority: '高',
    triggerCount: 0
  },
  {
    id: 3,
    name: '错峰用电',
    enabled: true,
    condition: '尖峰时段(10:00-15:00)',
    action: '延迟非紧急用电设备启动',
    priority: '中',
    triggerCount: 15
  },
  {
    id: 4,
    name: '谷电利用',
    enabled: false,
    condition: '低谷时段(23:00-06:00)',
    action: '启动储能充电、预加热设备',
    priority: '低',
    triggerCount: 0
  }
])

const demandSuggestions = ref([
  {
    id: 1,
    type: 'optimize',
    title: '优化峰谷用电结构',
    description: '当前尖峰时段用电占比22%，建议将部分负荷转移至低谷时段，可降低电费支出',
    benefit: '约3200元/月',
    action: '制定方案'
  },
  {
    id: 2,
    type: 'reduce',
    title: '降低申报需量',
    description: '近3个月最大需量均未超过856kW，可考虑将申报需量从900kW降至850kW',
    benefit: '约2250元/月',
    action: '申请调整'
  },
  {
    id: 3,
    type: 'storage',
    title: '配置储能系统',
    description: '安装储能系统进行削峰填谷，可有效降低最大需量和尖峰用电成本',
    benefit: '约8500元/月',
    action: '了解详情'
  }
])

// ========== 辅助函数 ==========
const getLoadRateClass = (rate: number) => {
  if (rate > 90) return 'danger'
  if (rate > 75) return 'warning'
  return 'normal'
}

const getLoadRateStatus = (rate: number) => {
  if (rate > 90) return '超载风险'
  if (rate > 75) return '较高负载'
  if (rate > 50) return '正常运行'
  return '轻载运行'
}

const getLoadLevelClass = (rate: number) => {
  if (rate > 90) return 'overload'
  if (rate > 75) return 'high'
  if (rate > 50) return 'normal'
  return 'low'
}

const getLoadLevelText = (rate: number) => {
  if (rate > 90) return '超载'
  if (rate > 75) return '高载'
  if (rate > 50) return '正常'
  return '轻载'
}

const getHourClass = (hour: number) => {
  if ((hour >= 10 && hour < 15) || (hour >= 18 && hour < 21)) return 'peak'
  if ((hour >= 8 && hour < 10) || (hour >= 15 && hour < 18) || (hour >= 21 && hour < 22)) return 'high'
  if ((hour >= 6 && hour < 8) || (hour >= 22 && hour < 23)) return 'flat'
  return 'valley'
}

const getDemandClass = (rate: number) => {
  if (rate > 100) return 'overload'
  if (rate > 90) return 'warning'
  return 'normal'
}

const getSuggestionIcon = (type: string) => {
  const map: Record<string, any> = {
    optimize: TrendCharts,
    reduce: DataLine,
    storage: Lightning
  }
  return map[type] || Sunny
}

const exportAnalysis = () => {
  ElMessage.success('负荷分析报表导出成功')
}

const runPrediction = () => {
  ElMessage.success('负荷预测计算完成')
}

const handleAlert = (alert: any) => {
  ElMessage.info(`处理预警: ${alert.title}`)
}

const editStrategy = (strategy: any) => {
  ElMessage.info(`配置策略: ${strategy.name}`)
}

const applySuggestion = (suggestion: any) => {
  ElMessage.success(`应用建议: ${suggestion.title}`)
}

// 模拟实时数据更新
let timer: number | null = null

onMounted(() => {
  timer = window.setInterval(() => {
    realtimeData.value.totalLoad = 750 + Math.random() * 20
    realtimeData.value.loadRate = realtimeData.value.totalLoad / realtimeData.value.capacity * 100
    realtimeData.value.powerFactor = 0.92 + Math.random() * 0.03

    const now = new Date()
    lastUpdateTime.value = now.toTimeString().slice(0, 8)
  }, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

@keyframes scanline {
  0% { background-position: 0% 0%; }
  100% { background-position: 0% 200%; }
}

.load-analysis-page {
  width: 100%;
  height: 100vh;
  background: var(--bg-deep);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 20px;
}

/* 页面标题区 */
.page-header {
  padding: 0 24px 20px 24px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  margin-bottom: 20px;
}

.main-tabs-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 0 24px 24px;
  gap: 20px;
}

/* 主标签 */
.main-tabs {
  display: flex;
  gap: 8px;
}

.main-tab-item {
  padding: 12px 32px;
  background: rgba(13, 18, 26, 0.85);
  color: var(--text-sub);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  border: 1px solid rgba(0, 240, 255, 0.1);
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  transition: all 0.3s;
  backdrop-filter: blur(10px);
}

.main-tab-item:hover {
  color: var(--tech-primary);
  border-color: rgba(0, 240, 255, 0.3);
}

.main-tab-item.active {
  background: rgba(0, 240, 255, 0.1);
  color: var(--tech-primary);
  border-color: var(--tech-primary);
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 主容器 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(13, 18, 26, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 240, 255, 0.2);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5), 0 5px 15px rgba(0, 0, 0, 0.3);
  position: relative;
  clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
}

.main-container::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  background: linear-gradient(180deg, rgba(0, 240, 255, 0.1) 0%, rgba(0, 240, 255, 0.6) 50%, rgba(0, 240, 255, 0.1) 100%);
  background-size: 100% 200%;
  animation: scanline 4s linear infinite;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0.6;
}

/* ========== 实时负荷总览 ========== */
.realtime-overview {
  display: grid;
  grid-template-columns: 1.5fr repeat(5, 1fr);
  gap: 16px;
}

.overview-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s;
}

.overview-card:hover {
  border-color: var(--tech-primary);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.2);
}

.overview-card.main {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 0, 0, 0.3));
  border-color: var(--tech-primary);
}

.card-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  border: 1px solid var(--tech-primary);
  color: var(--tech-primary);
  background: rgba(0, 240, 255, 0.1);
}

.card-icon.capacity { color: #60a5fa; border-color: #60a5fa; background: rgba(96, 165, 250, 0.1); }
.card-icon.rate { color: var(--status-success); border-color: var(--status-success); background: rgba(0, 230, 118, 0.1); }
.card-icon.peak { color: var(--status-danger); border-color: var(--status-danger); background: rgba(255, 46, 99, 0.1); }
.card-icon.valley { color: #a78bfa; border-color: #a78bfa; background: rgba(167, 139, 250, 0.1); }
.card-icon.factor { color: var(--status-success); border-color: var(--status-success); background: rgba(0, 230, 118, 0.1); }

.card-label {
  font-size: 12px;
  color: var(--text-sub);
  margin-bottom: 4px;
}

.card-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-bright);
  font-family: 'DIN Alternate', sans-serif;
}

.card-value .unit {
  font-size: 14px;
  color: var(--text-sub);
  margin-left: 4px;
}

.card-value.normal { color: var(--status-success); }
.card-value.warning { color: var(--status-warning); }
.card-value.danger { color: var(--status-danger); }
.card-value.good { color: var(--status-success); }

.card-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.card-trend.up { color: var(--status-danger); }
.card-trend.down { color: var(--status-success); }

.card-sub {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
}

/* 面板通用样式 */
.load-distribution-panel, .realtime-chart-panel, .peak-valley-panel, .daily-pattern-panel,
.prediction-chart-panel, .prediction-alerts, .demand-control-panel, .demand-suggestions-panel {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  background: rgba(0, 240, 255, 0.03);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--tech-primary);
}

.update-time, .standard-ref, .confidence-label {
  font-size: 11px;
  color: var(--text-muted);
  padding: 2px 8px;
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.2);
}

/* 回路负荷网格 */
.circuit-load-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 20px;
}

.circuit-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.15);
  padding: 16px;
  transition: all 0.3s;
}

.circuit-card:hover {
  border-color: var(--tech-primary);
}

.circuit-card.overload { border-left: 3px solid var(--status-danger); }
.circuit-card.high { border-left: 3px solid var(--status-warning); }
.circuit-card.normal { border-left: 3px solid var(--status-success); }
.circuit-card.low { border-left: 3px solid var(--tech-primary); }

.circuit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.circuit-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-bright);
}

.circuit-status {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 2px;
}

.circuit-status.normal { background: rgba(0, 230, 118, 0.2); color: var(--status-success); }
.circuit-status.warning { background: rgba(255, 214, 0, 0.2); color: var(--status-warning); }

.circuit-metrics {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.metric-main .metric-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--tech-primary);
  font-family: 'DIN Alternate', sans-serif;
}

.metric-main .metric-unit {
  font-size: 12px;
  color: var(--text-sub);
}

.metric-details .detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  margin-bottom: 2px;
}

.detail-row .label { color: var(--text-muted); }
.detail-row .value { color: var(--text-sub); }

.circuit-load-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.load-label {
  font-size: 11px;
  color: var(--text-sub);
  white-space: nowrap;
}

.load-bar-wrapper {
  flex: 1;
  height: 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  overflow: hidden;
}

.load-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}

.load-bar-fill.low { background: var(--tech-primary); }
.load-bar-fill.normal { background: var(--status-success); }
.load-bar-fill.high { background: var(--status-warning); }
.load-bar-fill.overload { background: var(--status-danger); }

.load-value {
  font-size: 12px;
  color: var(--tech-primary);
  font-family: 'DIN Alternate', sans-serif;
  min-width: 45px;
  text-align: right;
}

/* 图表区域 */
.chart-area {
  padding: 20px;
}

.chart-mock {
  height: 200px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.mock-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 240, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}

.mock-line {
  position: absolute;
  inset: 20px;
  width: calc(100% - 40px);
  height: calc(100% - 40px);
}

.peak-marker {
  position: absolute;
  top: 15%;
  transform: translateX(-50%);
}

.marker-label {
  font-size: 10px;
  padding: 2px 6px;
  background: rgba(255, 46, 99, 0.8);
  color: white;
  white-space: nowrap;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-sub);
}

.legend-color {
  width: 20px;
  height: 3px;
}

.legend-color.load { background: var(--tech-primary); }
.legend-color.reactive { background: #a78bfa; }
.legend-color.limit { background: var(--status-danger); }
.legend-color.predict { background: var(--tech-primary); }
.legend-color.confidence { background: rgba(0, 240, 255, 0.3); }

/* ========== 历史分析 ========== */
.history-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.analysis-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.summary-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  padding: 20px;
  text-align: center;
}

.summary-label {
  font-size: 12px;
  color: var(--text-sub);
  margin-bottom: 8px;
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-bright);
  font-family: 'DIN Alternate', sans-serif;
}

.summary-value .unit {
  font-size: 12px;
  color: var(--text-sub);
}

.summary-value.highlight { color: var(--tech-primary); }

.summary-sub {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
}

/* 峰谷分析 */
.peak-valley-content {
  display: flex;
  gap: 40px;
  padding: 20px;
}

.pv-chart {
  display: flex;
  gap: 24px;
  align-items: flex-end;
  height: 200px;
}

.pv-bar {
  width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.pv-bar .bar-fill {
  width: 100%;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s;
}

.pv-bar.peak .bar-fill { background: linear-gradient(180deg, #ff2a4d, #ff6d00); }
.pv-bar.high .bar-fill { background: linear-gradient(180deg, #ff6d00, #ffd600); }
.pv-bar.flat .bar-fill { background: linear-gradient(180deg, #00f3ff, #60a5fa); }
.pv-bar.valley .bar-fill { background: linear-gradient(180deg, #00E676, #34d399); }

.bar-label {
  font-size: 12px;
  color: var(--text-sub);
}

.bar-value {
  font-size: 11px;
  color: var(--text-bright);
}

.bar-percent {
  font-size: 14px;
  font-weight: 600;
  color: var(--tech-primary);
  font-family: 'DIN Alternate', sans-serif;
}

.pv-time-table {
  flex: 1;
}

.time-row {
  display: grid;
  grid-template-columns: 80px 1fr 120px;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
}

.time-row.header {
  background: rgba(0, 240, 255, 0.05);
  font-size: 12px;
  color: var(--tech-primary);
  font-weight: 600;
}

.time-row.peak .time-period { color: var(--status-danger); }
.time-row.high .time-period { color: var(--status-warning); }
.time-row.flat .time-period { color: var(--tech-primary); }
.time-row.valley .time-period { color: var(--status-success); }

.time-period { font-weight: 600; }
.time-range { color: var(--text-sub); font-size: 12px; }
.time-price { color: var(--text-bright); font-family: 'DIN Alternate', sans-serif; }

/* 日负荷特性 */
.pattern-chart {
  padding: 20px;
}

.hour-bars {
  display: flex;
  align-items: flex-end;
  height: 150px;
  gap: 4px;
}

.hour-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.hour-bar .bar-fill {
  width: 100%;
  border-radius: 2px 2px 0 0;
  transition: height 0.3s;
}

.hour-bar.peak .bar-fill { background: var(--status-danger); }
.hour-bar.high .bar-fill { background: var(--status-warning); }
.hour-bar.flat .bar-fill { background: var(--tech-primary); }
.hour-bar.valley .bar-fill { background: var(--status-success); }

.hour-label {
  font-size: 10px;
  color: var(--text-muted);
}

.pattern-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
}

.pattern-legend .legend-item {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 2px;
}

.pattern-legend .legend-item.peak { background: rgba(255, 46, 99, 0.2); color: var(--status-danger); }
.pattern-legend .legend-item.high { background: rgba(255, 214, 0, 0.2); color: var(--status-warning); }
.pattern-legend .legend-item.flat { background: rgba(0, 240, 255, 0.2); color: var(--tech-primary); }
.pattern-legend .legend-item.valley { background: rgba(0, 230, 118, 0.2); color: var(--status-success); }

/* ========== 负荷预测 ========== */
.prediction-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.prediction-config {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.config-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.config-label {
  font-size: 13px;
  color: var(--text-sub);
}

.prediction-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.prediction-summary .summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.summary-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--tech-primary);
  border: 1px solid var(--tech-primary);
  background: rgba(0, 240, 255, 0.1);
}

.summary-icon.warning {
  color: var(--status-warning);
  border-color: var(--status-warning);
  background: rgba(255, 214, 0, 0.1);
}

.summary-content .summary-label {
  text-align: left;
}

.summary-content .summary-value {
  text-align: left;
}

.summary-content .summary-value.danger { color: var(--status-danger); }
.summary-content .summary-value.normal { color: var(--status-success); }

.summary-time {
  font-size: 11px;
  color: var(--text-muted);
}

/* 预测图表 */
.chart-area.prediction .confidence-band {
  position: absolute;
  top: 30%;
  bottom: 30%;
  left: 20px;
  right: 20px;
  background: rgba(0, 240, 255, 0.1);
  border: 1px dashed rgba(0, 240, 255, 0.3);
}

.threshold-line {
  position: absolute;
  top: 20%;
  left: 0;
  right: 0;
  border-top: 2px dashed var(--status-danger);
}

.threshold-label {
  position: absolute;
  right: 10px;
  top: -20px;
  font-size: 10px;
  color: var(--status-danger);
  background: rgba(0, 0, 0, 0.8);
  padding: 2px 6px;
}

/* 预警列表 */
.alert-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.1);
}

.alert-item.warning { border-left: 3px solid var(--status-warning); }
.alert-item.info { border-left: 3px solid var(--tech-primary); }

.alert-icon {
  font-size: 24px;
}

.alert-item.warning .alert-icon { color: var(--status-warning); }
.alert-item.info .alert-icon { color: var(--tech-primary); }

.alert-content {
  flex: 1;
}

.alert-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-bright);
  margin-bottom: 4px;
}

.alert-desc {
  font-size: 12px;
  color: var(--text-sub);
  margin-bottom: 4px;
}

.alert-time {
  font-size: 11px;
  color: var(--text-muted);
}

/* ========== 需量管理 ========== */
.demand-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.demand-overview {
  display: grid;
  grid-template-columns: 1.5fr repeat(4, 1fr);
  gap: 16px;
}

.demand-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.demand-card.main {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 0, 0, 0.3));
  border-color: var(--tech-primary);
}

.demand-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: var(--tech-primary);
  border: 1px solid var(--tech-primary);
  background: rgba(0, 240, 255, 0.1);
}

.demand-label {
  font-size: 12px;
  color: var(--text-sub);
  margin-bottom: 4px;
}

.demand-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-bright);
  font-family: 'DIN Alternate', sans-serif;
}

.demand-value .unit {
  font-size: 14px;
  color: var(--text-sub);
}

.demand-value.highlight { color: var(--tech-primary); }
.demand-value.warning { color: var(--status-warning); }

.demand-sub {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
}

.demand-progress {
  margin-top: 12px;
}

.progress-bar {
  height: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  overflow: visible;
  position: relative;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-fill.normal { background: linear-gradient(90deg, var(--status-success), var(--tech-primary)); }
.progress-fill.warning { background: linear-gradient(90deg, var(--status-warning), var(--status-danger)); }
.progress-fill.overload { background: var(--status-danger); }

.progress-threshold {
  position: absolute;
  top: -4px;
  width: 2px;
  height: 16px;
  background: var(--status-danger);
}

.progress-text {
  font-size: 11px;
  color: var(--text-sub);
  margin-top: 4px;
}

/* 控制策略 */
.control-strategies {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 20px;
}

.strategy-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.15);
  padding: 16px;
  opacity: 0.6;
  transition: all 0.3s;
}

.strategy-card.active {
  opacity: 1;
  border-color: var(--tech-primary);
}

.strategy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.strategy-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-bright);
}

.strategy-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.strategy-condition, .strategy-action, .strategy-priority {
  font-size: 12px;
}

.strategy-content .label { color: var(--text-sub); }
.strategy-content .value { color: var(--text-bright); }

.strategy-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 240, 255, 0.1);
}

.trigger-count {
  font-size: 11px;
  color: var(--text-muted);
}

/* 优化建议 */
.suggestion-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.1);
}

.suggestion-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: 1px solid;
}

.suggestion-icon.optimize { color: var(--tech-primary); border-color: var(--tech-primary); background: rgba(0, 240, 255, 0.1); }
.suggestion-icon.reduce { color: var(--status-success); border-color: var(--status-success); background: rgba(0, 230, 118, 0.1); }
.suggestion-icon.storage { color: #a78bfa; border-color: #a78bfa; background: rgba(167, 139, 250, 0.1); }

.suggestion-content {
  flex: 1;
}

.suggestion-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-bright);
  margin-bottom: 4px;
}

.suggestion-desc {
  font-size: 12px;
  color: var(--text-sub);
  margin-bottom: 8px;
}

.suggestion-benefit {
  font-size: 12px;
}

.benefit-label { color: var(--text-sub); }
.benefit-value { color: var(--status-success); font-weight: 600; }

/* 通用按钮 */
.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border: 1px solid;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(0, 0, 0, 0.3);
  clip-path: polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px);
}

.btn-primary { border-color: var(--tech-primary); color: var(--tech-primary); }
.btn-primary:hover { box-shadow: 0 0 10px rgba(0, 240, 255, 0.3); }

.btn-secondary { border-color: var(--text-sub); color: var(--text-sub); }
.btn-secondary:hover { border-color: var(--tech-primary); color: var(--tech-primary); }

/* 滚动条 */
.content-wrapper::-webkit-scrollbar {
  width: 8px;
}

.content-wrapper::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

.content-wrapper::-webkit-scrollbar-thumb {
  background: rgba(0, 240, 255, 0.2);
}

.content-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 240, 255, 0.3);
}

/* ========== 视图切换与列表视图 ========== */
.view-switch {
  display: flex;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  padding: 2px;
  margin-right: 12px;
}

.switch-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent;
  border: none;
  color: var(--text-sub);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.switch-btn:hover {
  color: var(--tech-primary);
}

.switch-btn.active {
  background: rgba(0, 240, 255, 0.15);
  color: var(--tech-primary);
}

.switch-btn .el-icon {
  font-size: 16px;
}

.list-view-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  flex: 1;
}

.list-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(0, 240, 255, 0.05);
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.toolbar-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.record-count {
  font-size: 13px;
  color: var(--text-sub);
}

.list-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.list-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  transition: all 0.3s;
}

.list-card:hover {
  border-color: var(--tech-primary);
  box-shadow: 0 4px 20px rgba(0, 240, 255, 0.1);
}

.list-card.low {
  border-left: 3px solid var(--tech-primary);
}

.list-card.normal {
  border-left: 3px solid var(--status-success);
}

.list-card.high {
  border-left: 3px solid var(--status-warning);
}

.list-card.overload {
  border-left: 3px solid var(--status-danger);
}

.list-card.warning {
  background: rgba(255, 214, 0, 0.05);
}

.list-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  background: rgba(0, 240, 255, 0.03);
}

.card-circuit-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-indicator.normal { background: var(--status-success); }
.status-indicator.warning { background: var(--status-warning); }

.list-card .circuit-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-bright);
}

.list-card .card-status {
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 2px;
}

.list-card .card-status.normal {
  background: rgba(0, 230, 118, 0.15);
  color: var(--status-success);
}

.list-card .card-status.warning {
  background: rgba(255, 214, 0, 0.15);
  color: var(--status-warning);
}

.list-card .card-body {
  padding: 16px;
}

.power-display {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 16px;
}

.power-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--tech-primary);
  font-family: 'DIN Alternate', sans-serif;
}

.power-unit {
  font-size: 14px;
  color: var(--text-sub);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  background: rgba(0, 240, 255, 0.05);
  border: 1px solid rgba(0, 240, 255, 0.1);
  text-align: center;
}

.metric-item .metric-label {
  font-size: 11px;
  color: var(--text-muted);
}

.metric-item .metric-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-bright);
  font-family: 'DIN Alternate', sans-serif;
}

.metric-item .metric-value.low { color: var(--tech-primary); }
.metric-item .metric-value.normal { color: var(--status-success); }
.metric-item .metric-value.high { color: var(--status-warning); }
.metric-item .metric-value.overload { color: var(--status-danger); }

.list-card .card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid rgba(0, 240, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.load-bar-display {
  flex: 1;
  margin-right: 16px;
}

.load-bar-bg {
  height: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.load-bar-display .load-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.load-bar-display .load-bar-fill.low { background: var(--tech-primary); }
.load-bar-display .load-bar-fill.normal { background: var(--status-success); }
.load-bar-display .load-bar-fill.high { background: var(--status-warning); }
.load-bar-display .load-bar-fill.overload { background: var(--status-danger); }

.load-level-tag {
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 2px;
}

.load-level-tag.low {
  background: rgba(0, 240, 255, 0.15);
  color: var(--tech-primary);
}

.load-level-tag.normal {
  background: rgba(0, 230, 118, 0.15);
  color: var(--status-success);
}

.load-level-tag.high {
  background: rgba(255, 214, 0, 0.15);
  color: var(--status-warning);
}

.load-level-tag.overload {
  background: rgba(255, 46, 99, 0.15);
  color: var(--status-danger);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px;
  color: var(--text-muted);
}

.empty-state .el-icon {
  font-size: 48px;
}
</style>

<style>
/* Element Plus 组件样式覆盖 */
.load-analysis-page .el-radio-button__inner {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 240, 255, 0.2);
  color: var(--text-sub);
}

.load-analysis-page .el-radio-button__original-radio:checked + .el-radio-button__inner {
  background: rgba(0, 240, 255, 0.15);
  border-color: var(--tech-primary);
  color: var(--tech-primary);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}

.load-analysis-page .el-select__wrapper {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 240, 255, 0.2);
  box-shadow: none;
}

.load-analysis-page .el-date-editor {
  --el-input-bg-color: rgba(0, 0, 0, 0.3);
  --el-input-border-color: rgba(0, 240, 255, 0.2);
}

.load-analysis-page .el-switch.is-checked .el-switch__core {
  border-color: #00f3ff;
  background-color: rgba(0, 240, 255, 0.3);
}
</style>
