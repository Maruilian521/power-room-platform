<template>
  <div class="power-quality-page">
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
              实时监测
            </div>
            <div
              :class="['main-tab-item', { active: activeMainTab === 'statistics' }]"
              @click="activeMainTab = 'statistics'"
            >
              统计分析
            </div>
            <div
              :class="['main-tab-item', { active: activeMainTab === 'assessment' }]"
              @click="activeMainTab = 'assessment'"
            >
              合格率考核
            </div>
            <div
              :class="['main-tab-item', { active: activeMainTab === 'standards' }]"
              @click="activeMainTab = 'standards'"
            >
              国标限值
            </div>
          </div>

          <!-- 视图切换与配电室选择 -->
          <div class="header-actions">
            <!-- 视图切换 -->
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
              v-if="activeMainTab !== 'realtime'"
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
        <!-- =============== 实时监测 =============== -->
        <template v-if="activeMainTab === 'realtime'">
          <!-- ===== 报表视图 ===== -->
          <template v-if="viewMode === 'report'">
          <!-- 顶部总览卡片 -->
          <div class="overview-cards">
            <div class="overview-card" :class="getQualityClass(overallQuality)">
              <div class="card-icon">
                <el-icon><Odometer /></el-icon>
              </div>
              <div class="card-content">
                <div class="card-label">综合电能质量</div>
                <div class="card-value">{{ overallQuality.toFixed(1) }}%</div>
                <div class="card-status">{{ getQualityStatus(overallQuality) }}</div>
              </div>
            </div>
            <div class="overview-card voltage">
              <div class="card-icon">
                <el-icon><Lightning /></el-icon>
              </div>
              <div class="card-content">
                <div class="card-label">电压偏差</div>
                <div class="card-value">{{ realtimeData.voltageDeviation.toFixed(2) }}%</div>
                <div class="card-limit">限值: ±7%</div>
              </div>
            </div>
            <div class="overview-card frequency">
              <div class="card-icon">
                <el-icon><Timer /></el-icon>
              </div>
              <div class="card-content">
                <div class="card-label">频率偏差</div>
                <div class="card-value">{{ realtimeData.frequencyDeviation.toFixed(3) }}Hz</div>
                <div class="card-limit">限值: ±0.2Hz</div>
              </div>
            </div>
            <div class="overview-card harmonic">
              <div class="card-icon">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="card-content">
                <div class="card-label">谐波畸变率</div>
                <div class="card-value">{{ realtimeData.thd.toFixed(2) }}%</div>
                <div class="card-limit">限值: ≤5%</div>
              </div>
            </div>
            <div class="overview-card unbalance">
              <div class="card-icon">
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <div class="card-content">
                <div class="card-label">三相不平衡度</div>
                <div class="card-value">{{ realtimeData.unbalance.toFixed(2) }}%</div>
                <div class="card-limit">限值: ≤2%</div>
              </div>
            </div>
            <div class="overview-card power-factor">
              <div class="card-icon">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="card-content">
                <div class="card-label">功率因数</div>
                <div class="card-value">{{ realtimeData.powerFactor.toFixed(3) }}</div>
                <div class="card-limit">要求: ≥0.9</div>
              </div>
            </div>
          </div>

          <!-- 详细指标面板 -->
          <div class="detail-panels">
            <!-- 左侧：电压质量 -->
            <div class="detail-panel">
              <div class="panel-header">
                <span class="panel-title">
                  <el-icon><Lightning /></el-icon>
                  电压质量指标
                </span>
                <span class="standard-ref">GB/T 12325-2008</span>
              </div>
              <div class="panel-body">
                <div class="metric-grid">
                  <div class="metric-item">
                    <div class="metric-label">A相电压</div>
                    <div class="metric-value">{{ realtimeData.voltageA.toFixed(1) }} V</div>
                    <div class="metric-deviation" :class="getDeviationClass(realtimeData.voltageDeviationA)">
                      偏差: {{ realtimeData.voltageDeviationA > 0 ? '+' : '' }}{{ realtimeData.voltageDeviationA.toFixed(2) }}%
                    </div>
                  </div>
                  <div class="metric-item">
                    <div class="metric-label">B相电压</div>
                    <div class="metric-value">{{ realtimeData.voltageB.toFixed(1) }} V</div>
                    <div class="metric-deviation" :class="getDeviationClass(realtimeData.voltageDeviationB)">
                      偏差: {{ realtimeData.voltageDeviationB > 0 ? '+' : '' }}{{ realtimeData.voltageDeviationB.toFixed(2) }}%
                    </div>
                  </div>
                  <div class="metric-item">
                    <div class="metric-label">C相电压</div>
                    <div class="metric-value">{{ realtimeData.voltageC.toFixed(1) }} V</div>
                    <div class="metric-deviation" :class="getDeviationClass(realtimeData.voltageDeviationC)">
                      偏差: {{ realtimeData.voltageDeviationC > 0 ? '+' : '' }}{{ realtimeData.voltageDeviationC.toFixed(2) }}%
                    </div>
                  </div>
                  <div class="metric-item">
                    <div class="metric-label">线电压UAB</div>
                    <div class="metric-value">{{ realtimeData.lineVoltageAB.toFixed(1) }} V</div>
                  </div>
                  <div class="metric-item">
                    <div class="metric-label">线电压UBC</div>
                    <div class="metric-value">{{ realtimeData.lineVoltageBC.toFixed(1) }} V</div>
                  </div>
                  <div class="metric-item">
                    <div class="metric-label">线电压UCA</div>
                    <div class="metric-value">{{ realtimeData.lineVoltageCA.toFixed(1) }} V</div>
                  </div>
                </div>
                <div class="voltage-gauge">
                  <div class="gauge-title">电压偏差实时监测</div>
                  <div class="gauge-bar">
                    <div class="gauge-scale">
                      <span>-10%</span>
                      <span>-7%</span>
                      <span>0</span>
                      <span>+7%</span>
                      <span>+10%</span>
                    </div>
                    <div class="gauge-track">
                      <div class="gauge-zone danger-low"></div>
                      <div class="gauge-zone warning-low"></div>
                      <div class="gauge-zone normal"></div>
                      <div class="gauge-zone warning-high"></div>
                      <div class="gauge-zone danger-high"></div>
                      <div
                        class="gauge-pointer"
                        :style="{ left: getGaugePosition(realtimeData.voltageDeviation) + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 右侧：谐波分析 -->
            <div class="detail-panel">
              <div class="panel-header">
                <span class="panel-title">
                  <el-icon><TrendCharts /></el-icon>
                  谐波分析
                </span>
                <span class="standard-ref">GB/T 14549-1993</span>
              </div>
              <div class="panel-body">
                <div class="harmonic-summary">
                  <div class="harmonic-item total">
                    <span class="harmonic-label">电压总谐波畸变率 THDu</span>
                    <span class="harmonic-value" :class="realtimeData.thd > 5 ? 'exceed' : ''">
                      {{ realtimeData.thd.toFixed(2) }}%
                    </span>
                    <span class="harmonic-limit">≤5%</span>
                  </div>
                  <div class="harmonic-item">
                    <span class="harmonic-label">电流总谐波畸变率 THDi</span>
                    <span class="harmonic-value">{{ realtimeData.thdI.toFixed(2) }}%</span>
                    <span class="harmonic-limit">-</span>
                  </div>
                </div>
                <div class="harmonic-chart">
                  <div class="chart-title">各次谐波含有率</div>
                  <div class="harmonic-bars">
                    <div
                      v-for="(h, index) in harmonicData"
                      :key="index"
                      class="harmonic-bar-item"
                    >
                      <div class="bar-wrapper">
                        <div
                          class="bar-fill"
                          :style="{ height: Math.min(h.value / h.limit * 100, 100) + '%' }"
                          :class="{ exceed: h.value > h.limit }"
                        ></div>
                        <div class="bar-limit-line" :style="{ bottom: '100%' }"></div>
                      </div>
                      <div class="bar-label">{{ h.order }}次</div>
                      <div class="bar-value">{{ h.value.toFixed(2) }}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 下方面板 -->
          <div class="bottom-panels">
            <!-- 频率与不平衡度 -->
            <div class="detail-panel small">
              <div class="panel-header">
                <span class="panel-title">
                  <el-icon><Timer /></el-icon>
                  频率监测
                </span>
                <span class="standard-ref">GB/T 15945-2008</span>
              </div>
              <div class="panel-body">
                <div class="frequency-display">
                  <div class="freq-main">
                    <span class="freq-value">{{ realtimeData.frequency.toFixed(3) }}</span>
                    <span class="freq-unit">Hz</span>
                  </div>
                  <div class="freq-deviation" :class="getFreqDeviationClass(realtimeData.frequencyDeviation)">
                    偏差: {{ realtimeData.frequencyDeviation > 0 ? '+' : '' }}{{ realtimeData.frequencyDeviation.toFixed(3) }} Hz
                  </div>
                  <div class="freq-limit">
                    <div class="limit-item">
                      <span class="limit-label">正常限值</span>
                      <span class="limit-value">±0.2 Hz</span>
                    </div>
                    <div class="limit-item">
                      <span class="limit-label">事故限值</span>
                      <span class="limit-value">±0.5 Hz</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 三相不平衡 -->
            <div class="detail-panel small">
              <div class="panel-header">
                <span class="panel-title">
                  <el-icon><DataAnalysis /></el-icon>
                  三相不平衡度
                </span>
                <span class="standard-ref">GB/T 15543-2008</span>
              </div>
              <div class="panel-body">
                <div class="unbalance-display">
                  <div class="unbalance-main">
                    <div class="unbalance-item">
                      <span class="unbalance-label">电压不平衡度</span>
                      <span class="unbalance-value" :class="realtimeData.voltageUnbalance > 2 ? 'exceed' : ''">
                        {{ realtimeData.voltageUnbalance.toFixed(2) }}%
                      </span>
                      <span class="unbalance-limit">≤2%</span>
                    </div>
                    <div class="unbalance-item">
                      <span class="unbalance-label">电流不平衡度</span>
                      <span class="unbalance-value" :class="realtimeData.currentUnbalance > 15 ? 'exceed' : ''">
                        {{ realtimeData.currentUnbalance.toFixed(2) }}%
                      </span>
                      <span class="unbalance-limit">≤15%</span>
                    </div>
                  </div>
                  <div class="phase-currents">
                    <div class="phase-item">
                      <span class="phase-label">IA</span>
                      <span class="phase-value">{{ realtimeData.currentA.toFixed(1) }} A</span>
                    </div>
                    <div class="phase-item">
                      <span class="phase-label">IB</span>
                      <span class="phase-value">{{ realtimeData.currentB.toFixed(1) }} A</span>
                    </div>
                    <div class="phase-item">
                      <span class="phase-label">IC</span>
                      <span class="phase-value">{{ realtimeData.currentC.toFixed(1) }} A</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 闪变与暂降 -->
            <div class="detail-panel small">
              <div class="panel-header">
                <span class="panel-title">
                  <el-icon><Warning /></el-icon>
                  闪变与电压暂降
                </span>
                <span class="standard-ref">GB/T 12326-2008</span>
              </div>
              <div class="panel-body">
                <div class="flicker-display">
                  <div class="flicker-item">
                    <span class="flicker-label">短时闪变 Pst</span>
                    <span class="flicker-value" :class="realtimeData.pst > 1.0 ? 'exceed' : ''">
                      {{ realtimeData.pst.toFixed(3) }}
                    </span>
                    <span class="flicker-limit">≤1.0</span>
                  </div>
                  <div class="flicker-item">
                    <span class="flicker-label">长时闪变 Plt</span>
                    <span class="flicker-value" :class="realtimeData.plt > 0.8 ? 'exceed' : ''">
                      {{ realtimeData.plt.toFixed(3) }}
                    </span>
                    <span class="flicker-limit">≤0.8</span>
                  </div>
                  <div class="sag-stats">
                    <div class="sag-item">
                      <span class="sag-label">今日电压暂降</span>
                      <span class="sag-value">{{ realtimeData.sagCount }} 次</span>
                    </div>
                    <div class="sag-item">
                      <span class="sag-label">今日电压暂升</span>
                      <span class="sag-value">{{ realtimeData.swellCount }} 次</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 功率因数 -->
            <div class="detail-panel small">
              <div class="panel-header">
                <span class="panel-title">
                  <el-icon><CircleCheck /></el-icon>
                  功率因数
                </span>
                <span class="standard-ref">力调电费考核</span>
              </div>
              <div class="panel-body">
                <div class="pf-display">
                  <div class="pf-main">
                    <span class="pf-value" :class="realtimeData.powerFactor < 0.9 ? 'warning' : ''">
                      {{ realtimeData.powerFactor.toFixed(3) }}
                    </span>
                    <span class="pf-type">{{ realtimeData.powerFactor >= 0 ? '滞后' : '超前' }}</span>
                  </div>
                  <div class="pf-detail">
                    <div class="pf-item">
                      <span class="pf-label">有功功率 P</span>
                      <span class="pf-data">{{ realtimeData.activePower.toFixed(1) }} kW</span>
                    </div>
                    <div class="pf-item">
                      <span class="pf-label">无功功率 Q</span>
                      <span class="pf-data">{{ realtimeData.reactivePower.toFixed(1) }} kvar</span>
                    </div>
                    <div class="pf-item">
                      <span class="pf-label">视在功率 S</span>
                      <span class="pf-data">{{ realtimeData.apparentPower.toFixed(1) }} kVA</span>
                    </div>
                  </div>
                  <div class="pf-requirement">
                    <span class="req-label">考核要求</span>
                    <span class="req-value">≥0.90（工业）/ ≥0.85（一般）</span>
                  </div>
                </div>
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
                    placeholder="搜索指标..."
                    style="width: 200px"
                    clearable
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                  <el-select v-model="listCategoryFilter" placeholder="类别筛选" style="width: 120px" clearable>
                    <el-option label="全部" value="" />
                    <el-option label="电压" value="voltage" />
                    <el-option label="谐波" value="harmonic" />
                    <el-option label="频率" value="frequency" />
                    <el-option label="不平衡" value="unbalance" />
                  </el-select>
                </div>
                <div class="toolbar-right">
                  <span class="record-count">共 {{ qualityListData.length }} 项指标</span>
                </div>
              </div>

              <!-- 列表卡片 -->
              <div class="list-cards">
                <div
                  v-for="item in qualityListData"
                  :key="item.id"
                  :class="['list-card', item.category, { exceed: item.isExceed }]"
                >
                  <div class="card-header">
                    <div class="card-category-info">
                      <span :class="['category-tag', item.category]">{{ item.categoryLabel }}</span>
                      <span class="card-name">{{ item.name }}</span>
                    </div>
                    <div :class="['card-status', item.status]">{{ item.statusLabel }}</div>
                  </div>
                  <div class="card-body">
                    <div class="value-display">
                      <span class="current-value" :class="{ exceed: item.isExceed }">{{ item.value }}</span>
                      <span class="value-unit">{{ item.unit }}</span>
                    </div>
                    <div class="limit-info">
                      <span class="limit-label">限值:</span>
                      <span class="limit-value">{{ item.limit }}</span>
                    </div>
                    <div class="standard-info" v-if="item.standard">
                      <el-icon><Document /></el-icon>
                      <span>{{ item.standard }}</span>
                    </div>
                  </div>
                  <div class="card-footer" v-if="item.deviation !== undefined">
                    <div class="deviation-info">
                      <span class="deviation-label">偏差:</span>
                      <span :class="['deviation-value', getDeviationClass(item.deviation)]">
                        {{ item.deviation > 0 ? '+' : '' }}{{ item.deviation.toFixed(2) }}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-if="qualityListData.length === 0" class="empty-state">
                <el-icon><Document /></el-icon>
                <span>暂无符合条件的指标</span>
              </div>
            </div>
          </template>
        </template>

        <!-- =============== 统计分析 =============== -->
        <template v-if="activeMainTab === 'statistics'">
          <div class="statistics-panel">
            <div class="stats-toolbar">
              <el-radio-group v-model="statsType">
                <el-radio-button label="voltage">电压统计</el-radio-button>
                <el-radio-button label="harmonic">谐波统计</el-radio-button>
                <el-radio-button label="unbalance">不平衡度统计</el-radio-button>
                <el-radio-button label="frequency">频率统计</el-radio-button>
              </el-radio-group>
              <button class="action-btn btn-primary" @click="exportStats">
                <el-icon><Download /></el-icon>
                <span>导出报表</span>
              </button>
            </div>

            <div class="stats-summary">
              <div class="summary-card">
                <div class="summary-label">统计周期</div>
                <div class="summary-value">{{ getDateRangeText() }}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">采样点数</div>
                <div class="summary-value">{{ statsData.sampleCount.toLocaleString() }}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">合格率</div>
                <div class="summary-value highlight">{{ statsData.qualifiedRate.toFixed(2) }}%</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">越限次数</div>
                <div class="summary-value warning">{{ statsData.exceedCount }}</div>
              </div>
            </div>

            <div class="stats-table">
              <el-table :data="statsTableData" style="width: 100%">
                <el-table-column prop="indicator" label="指标名称" width="180" />
                <el-table-column prop="unit" label="单位" width="80" />
                <el-table-column prop="limit" label="国标限值" width="120" />
                <el-table-column prop="max" label="最大值" width="100">
                  <template #default="{ row }">
                    <span :class="{ 'exceed-value': row.maxExceed }">{{ row.max }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="min" label="最小值" width="100" />
                <el-table-column prop="avg" label="平均值" width="100" />
                <el-table-column prop="p95" label="95%概率值" width="120" />
                <el-table-column prop="qualifiedRate" label="合格率" width="100">
                  <template #default="{ row }">
                    <span :class="getQualifiedRateClass(row.qualifiedRate)">
                      {{ row.qualifiedRate }}%
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="exceedCount" label="越限次数" width="100" />
              </el-table>
            </div>

            <div class="stats-chart-placeholder">
              <div class="chart-title">{{ getChartTitle() }} 趋势图</div>
              <div class="chart-area">
                <div class="chart-mock">
                  <div class="mock-line"></div>
                  <div class="mock-limit-line upper"></div>
                  <div class="mock-limit-line lower"></div>
                </div>
                <div class="chart-legend">
                  <span class="legend-item"><span class="legend-color data"></span>实测值</span>
                  <span class="legend-item"><span class="legend-color limit"></span>限值</span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- =============== 合格率考核 =============== -->
        <template v-if="activeMainTab === 'assessment'">
          <div class="assessment-panel">
            <!-- 考核总览 -->
            <div class="assessment-overview">
              <div class="assess-card main">
                <div class="assess-icon">
                  <el-icon><Trophy /></el-icon>
                </div>
                <div class="assess-content">
                  <div class="assess-label">综合合格率</div>
                  <div class="assess-value" :class="getAssessmentClass(assessmentData.overallRate)">
                    {{ assessmentData.overallRate.toFixed(2) }}%
                  </div>
                  <div class="assess-result" :class="assessmentData.overallRate >= 98 ? 'pass' : 'fail'">
                    {{ assessmentData.overallRate >= 98 ? '考核通过' : '考核不通过' }}
                  </div>
                </div>
              </div>
              <div class="assess-card">
                <div class="assess-content">
                  <div class="assess-label">电压合格率</div>
                  <div class="assess-value">{{ assessmentData.voltageRate.toFixed(2) }}%</div>
                  <div class="assess-limit">要求≥98%</div>
                </div>
              </div>
              <div class="assess-card">
                <div class="assess-content">
                  <div class="assess-label">频率合格率</div>
                  <div class="assess-value">{{ assessmentData.frequencyRate.toFixed(2) }}%</div>
                  <div class="assess-limit">要求≥99.5%</div>
                </div>
              </div>
              <div class="assess-card">
                <div class="assess-content">
                  <div class="assess-label">谐波合格率</div>
                  <div class="assess-value">{{ assessmentData.harmonicRate.toFixed(2) }}%</div>
                  <div class="assess-limit">要求≥95%</div>
                </div>
              </div>
              <div class="assess-card">
                <div class="assess-content">
                  <div class="assess-label">不平衡度合格率</div>
                  <div class="assess-value">{{ assessmentData.unbalanceRate.toFixed(2) }}%</div>
                  <div class="assess-limit">要求≥98%</div>
                </div>
              </div>
            </div>

            <!-- 考核标准说明 -->
            <div class="assessment-standards">
              <div class="standards-header">
                <el-icon><Document /></el-icon>
                <span>考核标准依据</span>
              </div>
              <div class="standards-body">
                <div class="standard-item">
                  <span class="std-name">GB/T 12325-2008</span>
                  <span class="std-desc">电能质量 供电电压偏差</span>
                </div>
                <div class="standard-item">
                  <span class="std-name">GB/T 15945-2008</span>
                  <span class="std-desc">电能质量 电力系统频率偏差</span>
                </div>
                <div class="standard-item">
                  <span class="std-name">GB/T 14549-1993</span>
                  <span class="std-desc">电能质量 公用电网谐波</span>
                </div>
                <div class="standard-item">
                  <span class="std-name">GB/T 15543-2008</span>
                  <span class="std-desc">电能质量 三相电压不平衡</span>
                </div>
                <div class="standard-item">
                  <span class="std-name">GB/T 12326-2008</span>
                  <span class="std-desc">电能质量 电压波动和闪变</span>
                </div>
                <div class="standard-item">
                  <span class="std-name">DB11/T 527-2021</span>
                  <span class="std-desc">配电室安全管理规范（北京市地方标准）</span>
                </div>
              </div>
            </div>

            <!-- 月度考核报表 -->
            <div class="assessment-report">
              <div class="report-header">
                <span class="report-title">月度考核报表</span>
                <div class="report-actions">
                  <el-select v-model="assessMonth" style="width: 150px">
                    <el-option label="2024年12月" value="2024-12" />
                    <el-option label="2024年11月" value="2024-11" />
                    <el-option label="2024年10月" value="2024-10" />
                  </el-select>
                  <button class="action-btn btn-primary" @click="generateReport">
                    <el-icon><Printer /></el-icon>
                    <span>生成报告</span>
                  </button>
                </div>
              </div>
              <div class="report-table">
                <el-table :data="monthlyReportData" style="width: 100%">
                  <el-table-column prop="date" label="日期" width="120" />
                  <el-table-column prop="voltageRate" label="电压合格率(%)" width="130">
                    <template #default="{ row }">
                      <span :class="row.voltageRate >= 98 ? '' : 'exceed-value'">
                        {{ row.voltageRate.toFixed(2) }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="frequencyRate" label="频率合格率(%)" width="130">
                    <template #default="{ row }">
                      <span :class="row.frequencyRate >= 99.5 ? '' : 'exceed-value'">
                        {{ row.frequencyRate.toFixed(2) }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="harmonicRate" label="谐波合格率(%)" width="130">
                    <template #default="{ row }">
                      <span :class="row.harmonicRate >= 95 ? '' : 'exceed-value'">
                        {{ row.harmonicRate.toFixed(2) }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="unbalanceRate" label="不平衡度合格率(%)" width="150">
                    <template #default="{ row }">
                      <span :class="row.unbalanceRate >= 98 ? '' : 'exceed-value'">
                        {{ row.unbalanceRate.toFixed(2) }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="overallRate" label="综合合格率(%)" width="130">
                    <template #default="{ row }">
                      <span :class="getAssessmentClass(row.overallRate)">
                        {{ row.overallRate.toFixed(2) }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="result" label="考核结果" width="100">
                    <template #default="{ row }">
                      <el-tag :type="row.result === '合格' ? 'success' : 'danger'">
                        {{ row.result }}
                      </el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
        </template>

        <!-- =============== 国标限值 =============== -->
        <template v-if="activeMainTab === 'standards'">
          <div class="standards-panel">
            <div class="standard-section">
              <div class="section-header">
                <el-icon><Lightning /></el-icon>
                <span>电压偏差限值 (GB/T 12325-2008)</span>
              </div>
              <div class="section-body">
                <el-table :data="voltageStandards" style="width: 100%">
                  <el-table-column prop="voltageLevel" label="电压等级" width="150" />
                  <el-table-column prop="supplyPoint" label="供电点" width="200" />
                  <el-table-column prop="upperLimit" label="上偏差限值" width="150" />
                  <el-table-column prop="lowerLimit" label="下偏差限值" width="150" />
                  <el-table-column prop="remark" label="备注" />
                </el-table>
              </div>
            </div>

            <div class="standard-section">
              <div class="section-header">
                <el-icon><Timer /></el-icon>
                <span>频率偏差限值 (GB/T 15945-2008)</span>
              </div>
              <div class="section-body">
                <el-table :data="frequencyStandards" style="width: 100%">
                  <el-table-column prop="systemType" label="系统类型" width="200" />
                  <el-table-column prop="normalLimit" label="正常运行限值" width="200" />
                  <el-table-column prop="accidentLimit" label="事故运行限值" width="200" />
                  <el-table-column prop="remark" label="备注" />
                </el-table>
              </div>
            </div>

            <div class="standard-section">
              <div class="section-header">
                <el-icon><TrendCharts /></el-icon>
                <span>谐波限值 (GB/T 14549-1993)</span>
              </div>
              <div class="section-body">
                <div class="harmonic-standards">
                  <div class="harmonic-std-item">
                    <span class="std-label">电压总谐波畸变率 THDu</span>
                    <div class="std-values">
                      <div class="std-value-item">
                        <span class="voltage-level">10kV</span>
                        <span class="limit-value">≤4%</span>
                      </div>
                      <div class="std-value-item">
                        <span class="voltage-level">0.38kV</span>
                        <span class="limit-value">≤5%</span>
                      </div>
                    </div>
                  </div>
                  <div class="harmonic-std-table">
                    <div class="std-table-title">各次谐波电压限值（0.38kV）</div>
                    <el-table :data="harmonicLimitsData" style="width: 100%" size="small">
                      <el-table-column prop="order" label="谐波次数" width="100" />
                      <el-table-column prop="limit" label="限值(%)" width="100" />
                      <el-table-column prop="order2" label="谐波次数" width="100" />
                      <el-table-column prop="limit2" label="限值(%)" width="100" />
                    </el-table>
                  </div>
                </div>
              </div>
            </div>

            <div class="standard-section">
              <div class="section-header">
                <el-icon><DataAnalysis /></el-icon>
                <span>三相电压不平衡限值 (GB/T 15543-2008)</span>
              </div>
              <div class="section-body">
                <el-table :data="unbalanceStandards" style="width: 100%">
                  <el-table-column prop="location" label="监测点位置" width="250" />
                  <el-table-column prop="shortTerm" label="短时限值" width="150" />
                  <el-table-column prop="longTerm" label="长时限值(95%概率)" width="200" />
                  <el-table-column prop="remark" label="备注" />
                </el-table>
              </div>
            </div>

            <div class="standard-section">
              <div class="section-header">
                <el-icon><Warning /></el-icon>
                <span>电压波动和闪变限值 (GB/T 12326-2008)</span>
              </div>
              <div class="section-body">
                <el-table :data="flickerStandards" style="width: 100%">
                  <el-table-column prop="voltageLevel" label="电压等级" width="150" />
                  <el-table-column prop="pst" label="短时闪变Pst" width="150" />
                  <el-table-column prop="plt" label="长时闪变Plt" width="150" />
                  <el-table-column prop="voltageChange" label="电压变动d(%)" width="150" />
                  <el-table-column prop="remark" label="备注" />
                </el-table>
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
  Odometer, Lightning, Timer, TrendCharts, DataAnalysis, CircleCheck,
  Warning, Download, Document, Printer, Trophy, List, Search
} from '@element-plus/icons-vue'

// ========== 基础数据 ==========
const activeMainTab = ref('realtime')
const viewMode = ref<'report' | 'list'>('report')
const selectedRoom = ref('room1')
const dateRange = ref<[Date, Date] | null>(null)
const statsType = ref('voltage')
const assessMonth = ref('2024-12')
const listSearchKeyword = ref('')
const listCategoryFilter = ref('')

const rooms = [
  { id: 'room1', name: '圆心配电室' },
  { id: 'room2', name: '通州配电室' },
  { id: 'room3', name: '北理工配电室' }
]

// ========== 实时数据 ==========
const realtimeData = ref({
  // 电压
  voltageA: 220.5,
  voltageB: 219.8,
  voltageC: 221.2,
  voltageDeviationA: 0.23,
  voltageDeviationB: -0.09,
  voltageDeviationC: 0.55,
  voltageDeviation: 0.55,
  lineVoltageAB: 381.2,
  lineVoltageBC: 380.5,
  lineVoltageCA: 381.8,
  // 频率
  frequency: 50.012,
  frequencyDeviation: 0.012,
  // 谐波
  thd: 3.25,
  thdI: 8.56,
  // 不平衡度
  unbalance: 1.25,
  voltageUnbalance: 1.25,
  currentUnbalance: 8.5,
  currentA: 125.6,
  currentB: 118.3,
  currentC: 122.1,
  // 功率因数
  powerFactor: 0.925,
  activePower: 85.6,
  reactivePower: 32.4,
  apparentPower: 91.5,
  // 闪变
  pst: 0.65,
  plt: 0.52,
  sagCount: 2,
  swellCount: 0
})

// 谐波数据
const harmonicData = ref([
  { order: 3, value: 2.1, limit: 5 },
  { order: 5, value: 1.8, limit: 6 },
  { order: 7, value: 0.9, limit: 5 },
  { order: 9, value: 0.5, limit: 1.5 },
  { order: 11, value: 0.6, limit: 3.5 },
  { order: 13, value: 0.4, limit: 3 },
  { order: 15, value: 0.2, limit: 0.5 },
  { order: 17, value: 0.3, limit: 2 }
])

// 列表视图数据
const qualityListData = computed(() => {
  const items = [
    // 电压指标
    {
      id: 'v1', category: 'voltage', categoryLabel: '电压',
      name: 'A相电压', value: realtimeData.value.voltageA.toFixed(1), unit: 'V',
      limit: '220V ±7%', standard: 'GB/T 12325-2008',
      deviation: realtimeData.value.voltageDeviationA,
      isExceed: Math.abs(realtimeData.value.voltageDeviationA) > 7,
      status: Math.abs(realtimeData.value.voltageDeviationA) > 7 ? 'danger' : 'normal',
      statusLabel: Math.abs(realtimeData.value.voltageDeviationA) > 7 ? '超限' : '正常'
    },
    {
      id: 'v2', category: 'voltage', categoryLabel: '电压',
      name: 'B相电压', value: realtimeData.value.voltageB.toFixed(1), unit: 'V',
      limit: '220V ±7%', standard: 'GB/T 12325-2008',
      deviation: realtimeData.value.voltageDeviationB,
      isExceed: Math.abs(realtimeData.value.voltageDeviationB) > 7,
      status: Math.abs(realtimeData.value.voltageDeviationB) > 7 ? 'danger' : 'normal',
      statusLabel: Math.abs(realtimeData.value.voltageDeviationB) > 7 ? '超限' : '正常'
    },
    {
      id: 'v3', category: 'voltage', categoryLabel: '电压',
      name: 'C相电压', value: realtimeData.value.voltageC.toFixed(1), unit: 'V',
      limit: '220V ±7%', standard: 'GB/T 12325-2008',
      deviation: realtimeData.value.voltageDeviationC,
      isExceed: Math.abs(realtimeData.value.voltageDeviationC) > 7,
      status: Math.abs(realtimeData.value.voltageDeviationC) > 7 ? 'danger' : 'normal',
      statusLabel: Math.abs(realtimeData.value.voltageDeviationC) > 7 ? '超限' : '正常'
    },
    // 频率指标
    {
      id: 'f1', category: 'frequency', categoryLabel: '频率',
      name: '系统频率', value: realtimeData.value.frequency.toFixed(3), unit: 'Hz',
      limit: '50Hz ±0.2Hz', standard: 'GB/T 15945-2008',
      deviation: realtimeData.value.frequencyDeviation * 100 / 0.2,
      isExceed: Math.abs(realtimeData.value.frequencyDeviation) > 0.2,
      status: Math.abs(realtimeData.value.frequencyDeviation) > 0.2 ? 'danger' : 'normal',
      statusLabel: Math.abs(realtimeData.value.frequencyDeviation) > 0.2 ? '超限' : '正常'
    },
    // 谐波指标
    {
      id: 'h1', category: 'harmonic', categoryLabel: '谐波',
      name: '电压总谐波畸变率', value: realtimeData.value.thd.toFixed(2), unit: '%',
      limit: '≤5%', standard: 'GB/T 14549-1993',
      isExceed: realtimeData.value.thd > 5,
      status: realtimeData.value.thd > 5 ? 'danger' : 'normal',
      statusLabel: realtimeData.value.thd > 5 ? '超限' : '正常'
    },
    {
      id: 'h2', category: 'harmonic', categoryLabel: '谐波',
      name: '电流总谐波畸变率', value: realtimeData.value.thdI.toFixed(2), unit: '%',
      limit: '-', standard: 'GB/T 14549-1993',
      isExceed: false,
      status: 'normal',
      statusLabel: '正常'
    },
    // 不平衡度指标
    {
      id: 'u1', category: 'unbalance', categoryLabel: '不平衡',
      name: '电压不平衡度', value: realtimeData.value.voltageUnbalance.toFixed(2), unit: '%',
      limit: '≤2%', standard: 'GB/T 15543-2008',
      isExceed: realtimeData.value.voltageUnbalance > 2,
      status: realtimeData.value.voltageUnbalance > 2 ? 'danger' : 'normal',
      statusLabel: realtimeData.value.voltageUnbalance > 2 ? '超限' : '正常'
    },
    {
      id: 'u2', category: 'unbalance', categoryLabel: '不平衡',
      name: '电流不平衡度', value: realtimeData.value.currentUnbalance.toFixed(2), unit: '%',
      limit: '≤15%', standard: 'GB/T 15543-2008',
      isExceed: realtimeData.value.currentUnbalance > 15,
      status: realtimeData.value.currentUnbalance > 15 ? 'danger' : 'normal',
      statusLabel: realtimeData.value.currentUnbalance > 15 ? '超限' : '正常'
    },
    // 功率因数
    {
      id: 'pf1', category: 'voltage', categoryLabel: '功率',
      name: '功率因数', value: realtimeData.value.powerFactor.toFixed(3), unit: '',
      limit: '≥0.9', standard: '力调电费考核',
      isExceed: realtimeData.value.powerFactor < 0.9,
      status: realtimeData.value.powerFactor < 0.9 ? 'warning' : 'normal',
      statusLabel: realtimeData.value.powerFactor < 0.9 ? '偏低' : '正常'
    },
    // 闪变
    {
      id: 'fl1', category: 'voltage', categoryLabel: '闪变',
      name: '短时闪变 Pst', value: realtimeData.value.pst.toFixed(3), unit: '',
      limit: '≤1.0', standard: 'GB/T 12326-2008',
      isExceed: realtimeData.value.pst > 1.0,
      status: realtimeData.value.pst > 1.0 ? 'danger' : 'normal',
      statusLabel: realtimeData.value.pst > 1.0 ? '超限' : '正常'
    },
    {
      id: 'fl2', category: 'voltage', categoryLabel: '闪变',
      name: '长时闪变 Plt', value: realtimeData.value.plt.toFixed(3), unit: '',
      limit: '≤0.8', standard: 'GB/T 12326-2008',
      isExceed: realtimeData.value.plt > 0.8,
      status: realtimeData.value.plt > 0.8 ? 'danger' : 'normal',
      statusLabel: realtimeData.value.plt > 0.8 ? '超限' : '正常'
    }
  ]

  return items.filter(item => {
    const matchKeyword = !listSearchKeyword.value ||
      item.name.includes(listSearchKeyword.value)
    const matchCategory = !listCategoryFilter.value || item.category === listCategoryFilter.value
    return matchKeyword && matchCategory
  })
})

// 综合质量评分
const overallQuality = computed(() => {
  let score = 100
  // 电压偏差扣分
  if (Math.abs(realtimeData.value.voltageDeviation) > 7) score -= 20
  else if (Math.abs(realtimeData.value.voltageDeviation) > 5) score -= 10
  // 频率偏差扣分
  if (Math.abs(realtimeData.value.frequencyDeviation) > 0.2) score -= 15
  else if (Math.abs(realtimeData.value.frequencyDeviation) > 0.15) score -= 5
  // 谐波扣分
  if (realtimeData.value.thd > 5) score -= 15
  else if (realtimeData.value.thd > 4) score -= 5
  // 不平衡度扣分
  if (realtimeData.value.voltageUnbalance > 2) score -= 10
  else if (realtimeData.value.voltageUnbalance > 1.5) score -= 3
  // 功率因数扣分
  if (realtimeData.value.powerFactor < 0.9) score -= 10
  else if (realtimeData.value.powerFactor < 0.92) score -= 3
  return Math.max(score, 0)
})

// ========== 统计数据 ==========
const statsData = ref({
  sampleCount: 43200,
  qualifiedRate: 99.12,
  exceedCount: 38
})

const statsTableData = ref([
  { indicator: '电压偏差', unit: '%', limit: '±7%', max: '6.85', min: '-5.23', avg: '0.52', p95: '5.12', qualifiedRate: 99.85, exceedCount: 6, maxExceed: false },
  { indicator: '频率偏差', unit: 'Hz', limit: '±0.2', max: '0.18', min: '-0.15', avg: '0.02', p95: '0.12', qualifiedRate: 99.98, exceedCount: 1, maxExceed: false },
  { indicator: '电压总谐波畸变率', unit: '%', limit: '≤5%', max: '4.85', min: '1.25', avg: '3.12', p95: '4.25', qualifiedRate: 99.52, exceedCount: 21, maxExceed: false },
  { indicator: '三相电压不平衡度', unit: '%', limit: '≤2%', max: '1.95', min: '0.25', avg: '1.12', p95: '1.75', qualifiedRate: 99.78, exceedCount: 10, maxExceed: false }
])

// ========== 考核数据 ==========
const assessmentData = ref({
  overallRate: 99.12,
  voltageRate: 99.85,
  frequencyRate: 99.98,
  harmonicRate: 99.52,
  unbalanceRate: 99.78
})

const monthlyReportData = ref([
  { date: '2024-12-01', voltageRate: 99.92, frequencyRate: 100, harmonicRate: 99.85, unbalanceRate: 99.95, overallRate: 99.93, result: '合格' },
  { date: '2024-12-02', voltageRate: 99.88, frequencyRate: 99.98, harmonicRate: 99.72, unbalanceRate: 99.88, overallRate: 99.87, result: '合格' },
  { date: '2024-12-03', voltageRate: 99.95, frequencyRate: 100, harmonicRate: 99.68, unbalanceRate: 99.92, overallRate: 99.89, result: '合格' },
  { date: '2024-12-04', voltageRate: 97.85, frequencyRate: 99.95, harmonicRate: 98.52, unbalanceRate: 99.15, overallRate: 98.87, result: '合格' }
])

// ========== 国标限值数据 ==========
const voltageStandards = ref([
  { voltageLevel: '35kV及以上', supplyPoint: '供电电压', upperLimit: '+5%', lowerLimit: '-5%', remark: '电压偏差绝对值之和不超过10%' },
  { voltageLevel: '10kV', supplyPoint: '供电电压', upperLimit: '+7%', lowerLimit: '-7%', remark: '' },
  { voltageLevel: '220V（单相）', supplyPoint: '供电电压', upperLimit: '+7%', lowerLimit: '-10%', remark: '' },
  { voltageLevel: '380V（三相）', supplyPoint: '供电电压', upperLimit: '+7%', lowerLimit: '-10%', remark: '' }
])

const frequencyStandards = ref([
  { systemType: '电力系统正常运行', normalLimit: '±0.2Hz', accidentLimit: '±0.5Hz', remark: '系统容量较小时可放宽' },
  { systemType: '系统容量较小', normalLimit: '±0.5Hz', accidentLimit: '±1.0Hz', remark: '需与供电部门协商确定' }
])

const harmonicLimitsData = ref([
  { order: '3次', limit: '5.0', order2: '11次', limit2: '3.5' },
  { order: '5次', limit: '6.0', order2: '13次', limit2: '3.0' },
  { order: '7次', limit: '5.0', order2: '17次', limit2: '2.0' },
  { order: '9次', limit: '1.5', order2: '19次', limit2: '1.5' }
])

const unbalanceStandards = ref([
  { location: '公共连接点（PCC）', shortTerm: '≤4%', longTerm: '≤2%', remark: '负序电压不平衡度' },
  { location: '用户受电端', shortTerm: '≤4%', longTerm: '≤2%', remark: '95%概率大值' }
])

const flickerStandards = ref([
  { voltageLevel: '10kV及以下', pst: '≤1.0', plt: '≤0.8', voltageChange: '≤4', remark: 'Pst为10min测量值' },
  { voltageLevel: '35kV', pst: '≤1.0', plt: '≤0.8', voltageChange: '≤3', remark: 'Plt为2h测量值' },
  { voltageLevel: '110kV', pst: '≤0.9', plt: '≤0.7', voltageChange: '≤2', remark: '' }
])

// ========== 辅助函数 ==========
const getQualityClass = (value: number) => {
  if (value >= 98) return 'excellent'
  if (value >= 95) return 'good'
  if (value >= 90) return 'normal'
  return 'poor'
}

const getQualityStatus = (value: number) => {
  if (value >= 98) return '优秀'
  if (value >= 95) return '良好'
  if (value >= 90) return '合格'
  return '不合格'
}

const getDeviationClass = (value: number) => {
  const abs = Math.abs(value)
  if (abs > 7) return 'exceed'
  if (abs > 5) return 'warning'
  return 'normal'
}

const getFreqDeviationClass = (value: number) => {
  const abs = Math.abs(value)
  if (abs > 0.2) return 'exceed'
  if (abs > 0.15) return 'warning'
  return 'normal'
}

const getGaugePosition = (value: number) => {
  // 将-10%到+10%映射到0-100%
  return Math.min(Math.max((value + 10) / 20 * 100, 0), 100)
}

const getQualifiedRateClass = (rate: number) => {
  if (rate >= 99) return 'rate-excellent'
  if (rate >= 98) return 'rate-good'
  if (rate >= 95) return 'rate-normal'
  return 'rate-poor'
}

const getAssessmentClass = (rate: number) => {
  if (rate >= 99) return 'excellent'
  if (rate >= 98) return 'good'
  if (rate >= 95) return 'normal'
  return 'poor'
}

const getDateRangeText = () => {
  if (!dateRange.value) return '最近7天'
  return `${dateRange.value[0].toLocaleDateString()} - ${dateRange.value[1].toLocaleDateString()}`
}

const getChartTitle = () => {
  const titles: Record<string, string> = {
    voltage: '电压偏差',
    harmonic: '谐波畸变率',
    unbalance: '三相不平衡度',
    frequency: '频率偏差'
  }
  return titles[statsType.value] || '电压偏差'
}

const exportStats = () => {
  ElMessage.success('报表导出成功')
}

const generateReport = () => {
  ElMessage.success('考核报告生成成功')
}

// 模拟实时数据更新
let timer: number | null = null

onMounted(() => {
  timer = window.setInterval(() => {
    // 模拟电压波动
    realtimeData.value.voltageA = 220 + (Math.random() - 0.5) * 2
    realtimeData.value.voltageB = 220 + (Math.random() - 0.5) * 2
    realtimeData.value.voltageC = 220 + (Math.random() - 0.5) * 2
    realtimeData.value.voltageDeviationA = (realtimeData.value.voltageA - 220) / 220 * 100
    realtimeData.value.voltageDeviationB = (realtimeData.value.voltageB - 220) / 220 * 100
    realtimeData.value.voltageDeviationC = (realtimeData.value.voltageC - 220) / 220 * 100
    realtimeData.value.voltageDeviation = Math.max(
      Math.abs(realtimeData.value.voltageDeviationA),
      Math.abs(realtimeData.value.voltageDeviationB),
      Math.abs(realtimeData.value.voltageDeviationC)
    )
    // 模拟频率波动
    realtimeData.value.frequency = 50 + (Math.random() - 0.5) * 0.04
    realtimeData.value.frequencyDeviation = realtimeData.value.frequency - 50
    // 模拟谐波波动
    realtimeData.value.thd = 3 + (Math.random() - 0.5) * 0.5
    // 模拟功率因数波动
    realtimeData.value.powerFactor = 0.92 + (Math.random() - 0.5) * 0.02
  }, 3000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
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

@keyframes corner-flicker {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; filter: drop-shadow(0 0 5px #00F0FF); }
}

.power-quality-page {
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

/* ========== 总览卡片 ========== */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
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

.overview-card .card-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  border: 1px solid;
}

.overview-card.excellent .card-icon {
  color: var(--status-success);
  border-color: var(--status-success);
  background: rgba(0, 230, 118, 0.1);
}

.overview-card.good .card-icon {
  color: var(--tech-primary);
  border-color: var(--tech-primary);
  background: rgba(0, 240, 255, 0.1);
}

.overview-card.normal .card-icon {
  color: var(--status-warning);
  border-color: var(--status-warning);
  background: rgba(255, 214, 0, 0.1);
}

.overview-card.poor .card-icon {
  color: var(--status-danger);
  border-color: var(--status-danger);
  background: rgba(255, 46, 99, 0.1);
}

.overview-card.voltage .card-icon {
  color: #60a5fa;
  border-color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
}

.overview-card.frequency .card-icon {
  color: #a78bfa;
  border-color: #a78bfa;
  background: rgba(167, 139, 250, 0.1);
}

.overview-card.harmonic .card-icon {
  color: #fbbf24;
  border-color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
}

.overview-card.unbalance .card-icon {
  color: #f87171;
  border-color: #f87171;
  background: rgba(248, 113, 113, 0.1);
}

.overview-card.power-factor .card-icon {
  color: var(--status-success);
  border-color: var(--status-success);
  background: rgba(0, 230, 118, 0.1);
}

.card-content {
  flex: 1;
}

.card-label {
  font-size: 12px;
  color: var(--text-sub);
  margin-bottom: 4px;
}

.card-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-bright);
  font-family: 'DIN Alternate', sans-serif;
}

.card-status {
  font-size: 12px;
  color: var(--status-success);
  margin-top: 4px;
}

.card-limit {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
}

/* ========== 详细面板 ========== */
.detail-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.bottom-panels {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.detail-panel {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  display: flex;
  flex-direction: column;
}

.detail-panel.small {
  min-height: 280px;
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

.standard-ref {
  font-size: 11px;
  color: var(--text-muted);
  padding: 2px 8px;
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.panel-body {
  flex: 1;
  padding: 20px;
}

/* 电压指标网格 */
.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.metric-item {
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.1);
}

.metric-label {
  font-size: 12px;
  color: var(--text-sub);
  margin-bottom: 4px;
}

.metric-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-bright);
  font-family: 'DIN Alternate', sans-serif;
}

.metric-deviation {
  font-size: 11px;
  margin-top: 4px;
}

.metric-deviation.normal {
  color: var(--status-success);
}

.metric-deviation.warning {
  color: var(--status-warning);
}

.metric-deviation.exceed {
  color: var(--status-danger);
}

/* 电压仪表 */
.voltage-gauge {
  margin-top: 16px;
}

.gauge-title {
  font-size: 12px;
  color: var(--text-sub);
  margin-bottom: 12px;
}

.gauge-bar {
  position: relative;
}

.gauge-scale {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.gauge-track {
  height: 20px;
  display: flex;
  position: relative;
  border-radius: 2px;
  overflow: hidden;
}

.gauge-zone {
  flex: 1;
}

.gauge-zone.danger-low { background: rgba(255, 46, 99, 0.6); }
.gauge-zone.warning-low { background: rgba(255, 214, 0, 0.4); }
.gauge-zone.normal { background: rgba(0, 230, 118, 0.4); flex: 2.8; }
.gauge-zone.warning-high { background: rgba(255, 214, 0, 0.4); }
.gauge-zone.danger-high { background: rgba(255, 46, 99, 0.6); }

.gauge-pointer {
  position: absolute;
  top: -4px;
  width: 4px;
  height: 28px;
  background: var(--tech-primary);
  transform: translateX(-50%);
  box-shadow: 0 0 10px var(--tech-primary);
}

.gauge-pointer::after {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 8px solid var(--tech-primary);
}

/* 谐波分析 */
.harmonic-summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.harmonic-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.1);
}

.harmonic-item.total {
  background: rgba(0, 240, 255, 0.05);
  border-color: rgba(0, 240, 255, 0.3);
}

.harmonic-label {
  font-size: 13px;
  color: var(--text-sub);
}

.harmonic-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--tech-primary);
  font-family: 'DIN Alternate', sans-serif;
}

.harmonic-value.exceed {
  color: var(--status-danger);
}

.harmonic-limit {
  font-size: 12px;
  color: var(--text-muted);
}

.harmonic-chart {
  margin-top: 16px;
}

.chart-title {
  font-size: 12px;
  color: var(--text-sub);
  margin-bottom: 12px;
}

.harmonic-bars {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  height: 120px;
  align-items: flex-end;
}

.harmonic-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.bar-wrapper {
  width: 100%;
  height: 80px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.1);
  position: relative;
  display: flex;
  align-items: flex-end;
}

.bar-fill {
  width: 100%;
  background: linear-gradient(180deg, var(--tech-primary), rgba(0, 240, 255, 0.5));
  transition: height 0.3s;
}

.bar-fill.exceed {
  background: linear-gradient(180deg, var(--status-danger), rgba(255, 46, 99, 0.5));
}

.bar-label {
  font-size: 10px;
  color: var(--text-muted);
}

.bar-value {
  font-size: 10px;
  color: var(--tech-primary);
  font-family: 'DIN Alternate', sans-serif;
}

/* 频率显示 */
.frequency-display {
  text-align: center;
}

.freq-main {
  margin-bottom: 12px;
}

.freq-value {
  font-size: 42px;
  font-weight: 700;
  color: var(--text-bright);
  font-family: 'DIN Alternate', sans-serif;
}

.freq-unit {
  font-size: 18px;
  color: var(--text-sub);
  margin-left: 4px;
}

.freq-deviation {
  font-size: 14px;
  margin-bottom: 16px;
}

.freq-deviation.normal {
  color: var(--status-success);
}

.freq-deviation.warning {
  color: var(--status-warning);
}

.freq-deviation.exceed {
  color: var(--status-danger);
}

.freq-limit {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.limit-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.limit-label {
  font-size: 11px;
  color: var(--text-muted);
}

.limit-value {
  font-size: 13px;
  color: var(--tech-primary);
}

/* 不平衡度显示 */
.unbalance-display {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.unbalance-main {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.unbalance-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.1);
}

.unbalance-label {
  font-size: 12px;
  color: var(--text-sub);
}

.unbalance-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--status-success);
  font-family: 'DIN Alternate', sans-serif;
}

.unbalance-value.exceed {
  color: var(--status-danger);
}

.unbalance-limit {
  font-size: 11px;
  color: var(--text-muted);
}

.phase-currents {
  display: flex;
  justify-content: space-between;
}

.phase-item {
  text-align: center;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.1);
  flex: 1;
}

.phase-label {
  font-size: 11px;
  color: var(--text-sub);
  display: block;
}

.phase-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-bright);
  font-family: 'DIN Alternate', sans-serif;
}

/* 闪变显示 */
.flicker-display {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.flicker-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.1);
}

.flicker-label {
  font-size: 12px;
  color: var(--text-sub);
}

.flicker-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--status-success);
  font-family: 'DIN Alternate', sans-serif;
}

.flicker-value.exceed {
  color: var(--status-danger);
}

.flicker-limit {
  font-size: 11px;
  color: var(--text-muted);
}

.sag-stats {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.sag-item {
  flex: 1;
  text-align: center;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.1);
}

.sag-label {
  font-size: 11px;
  color: var(--text-muted);
  display: block;
  margin-bottom: 4px;
}

.sag-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-bright);
}

/* 功率因数显示 */
.pf-display {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pf-main {
  text-align: center;
}

.pf-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--status-success);
  font-family: 'DIN Alternate', sans-serif;
}

.pf-value.warning {
  color: var(--status-warning);
}

.pf-type {
  font-size: 12px;
  color: var(--text-sub);
  margin-left: 4px;
}

.pf-detail {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pf-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.pf-label {
  color: var(--text-sub);
}

.pf-data {
  color: var(--text-bright);
  font-family: 'DIN Alternate', sans-serif;
}

.pf-requirement {
  padding: 8px 12px;
  background: rgba(0, 240, 255, 0.05);
  border: 1px solid rgba(0, 240, 255, 0.2);
  font-size: 11px;
  text-align: center;
}

.req-label {
  color: var(--text-muted);
}

.req-value {
  color: var(--tech-primary);
  margin-left: 8px;
}

/* ========== 统计分析 ========== */
.statistics-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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

.summary-value.highlight {
  color: var(--status-success);
}

.summary-value.warning {
  color: var(--status-warning);
}

.stats-table {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.15);
  padding: 16px;
}

.exceed-value {
  color: var(--status-danger) !important;
}

.rate-excellent { color: var(--status-success); }
.rate-good { color: var(--tech-primary); }
.rate-normal { color: var(--status-warning); }
.rate-poor { color: var(--status-danger); }

.stats-chart-placeholder {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.15);
  padding: 20px;
}

.stats-chart-placeholder .chart-title {
  font-size: 14px;
  color: var(--tech-primary);
  margin-bottom: 16px;
}

.chart-area {
  height: 200px;
  position: relative;
}

.chart-mock {
  height: 160px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.1);
  position: relative;
}

.mock-line {
  position: absolute;
  bottom: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--tech-primary), var(--status-success), var(--tech-primary));
}

.mock-limit-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--status-danger);
  opacity: 0.5;
}

.mock-limit-line.upper { top: 20%; }
.mock-limit-line.lower { bottom: 20%; }

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 12px;
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

.legend-color.data { background: var(--tech-primary); }
.legend-color.limit { background: var(--status-danger); }

/* ========== 考核页面 ========== */
.assessment-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.assessment-overview {
  display: grid;
  grid-template-columns: 1.5fr repeat(4, 1fr);
  gap: 16px;
}

.assess-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.assess-card.main {
  background: linear-gradient(135deg, rgba(0, 230, 118, 0.1), rgba(0, 0, 0, 0.3));
  border-color: var(--status-success);
}

.assess-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: var(--status-success);
  border: 2px solid var(--status-success);
  background: rgba(0, 230, 118, 0.1);
}

.assess-label {
  font-size: 12px;
  color: var(--text-sub);
  margin-bottom: 4px;
}

.assess-value {
  font-size: 28px;
  font-weight: 700;
  font-family: 'DIN Alternate', sans-serif;
}

.assess-value.excellent { color: var(--status-success); }
.assess-value.good { color: var(--tech-primary); }
.assess-value.normal { color: var(--status-warning); }
.assess-value.poor { color: var(--status-danger); }

.assess-result {
  font-size: 14px;
  font-weight: 600;
  margin-top: 4px;
}

.assess-result.pass { color: var(--status-success); }
.assess-result.fail { color: var(--status-danger); }

.assess-limit {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
}

/* 考核标准 */
.assessment-standards {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.15);
}

.standards-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  font-size: 14px;
  font-weight: 600;
  color: var(--tech-primary);
}

.standards-body {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 20px;
}

.standard-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.1);
}

.std-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--tech-primary);
}

.std-desc {
  font-size: 12px;
  color: var(--text-sub);
}

/* 月度报表 */
.assessment-report {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.15);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
}

.report-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--tech-primary);
}

.report-actions {
  display: flex;
  gap: 12px;
}

.report-table {
  padding: 20px;
}

/* ========== 国标限值页面 ========== */
.standards-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.standard-section {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.15);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  font-size: 14px;
  font-weight: 600;
  color: var(--tech-primary);
  background: rgba(0, 240, 255, 0.03);
}

.section-body {
  padding: 20px;
}

.harmonic-standards {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.harmonic-std-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.1);
}

.std-label {
  font-size: 14px;
  color: var(--text-bright);
}

.std-values {
  display: flex;
  gap: 24px;
}

.std-value-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.voltage-level {
  font-size: 12px;
  color: var(--text-sub);
  padding: 2px 8px;
  background: rgba(0, 240, 255, 0.1);
}

.limit-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--tech-primary);
}

.harmonic-std-table {
  margin-top: 16px;
}

.std-table-title {
  font-size: 13px;
  color: var(--text-sub);
  margin-bottom: 12px;
}

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

.btn-primary {
  border-color: var(--tech-primary);
  color: var(--tech-primary);
}

.btn-primary:hover {
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}

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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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

.list-card.voltage {
  border-left: 3px solid #60a5fa;
}

.list-card.harmonic {
  border-left: 3px solid #fbbf24;
}

.list-card.frequency {
  border-left: 3px solid #a78bfa;
}

.list-card.unbalance {
  border-left: 3px solid #f87171;
}

.list-card.exceed {
  background: rgba(255, 46, 99, 0.05);
  border-color: var(--status-danger);
}

.list-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  background: rgba(0, 240, 255, 0.03);
}

.card-category-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.category-tag {
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 2px;
}

.category-tag.voltage {
  background: rgba(96, 165, 250, 0.15);
  color: #60a5fa;
}

.category-tag.harmonic {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.category-tag.frequency {
  background: rgba(167, 139, 250, 0.15);
  color: #a78bfa;
}

.category-tag.unbalance {
  background: rgba(248, 113, 113, 0.15);
  color: #f87171;
}

.card-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-bright);
}

.card-status {
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 2px;
}

.card-status.normal {
  background: rgba(0, 230, 118, 0.15);
  color: var(--status-success);
}

.card-status.warning {
  background: rgba(255, 214, 0, 0.15);
  color: var(--status-warning);
}

.card-status.danger {
  background: rgba(255, 46, 99, 0.15);
  color: var(--status-danger);
}

.list-card .card-body {
  padding: 16px;
}

.value-display {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 12px;
}

.current-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-bright);
  font-family: 'DIN Alternate', sans-serif;
}

.current-value.exceed {
  color: var(--status-danger);
}

.value-unit {
  font-size: 14px;
  color: var(--text-sub);
}

.limit-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
}

.limit-label {
  color: var(--text-muted);
}

.limit-info .limit-value {
  color: var(--tech-primary);
  font-weight: 600;
}

.standard-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-muted);
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.2);
}

.standard-info .el-icon {
  font-size: 12px;
}

.list-card .card-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(0, 240, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.deviation-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.deviation-label {
  color: var(--text-muted);
}

.deviation-value {
  font-weight: 600;
  font-family: 'DIN Alternate', sans-serif;
}

.deviation-value.normal {
  color: var(--status-success);
}

.deviation-value.warning {
  color: var(--status-warning);
}

.deviation-value.exceed {
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
.power-quality-page .el-table {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(0, 240, 255, 0.05);
  --el-table-header-text-color: #00f3ff;
  --el-table-text-color: #e2e8f0;
  --el-table-border-color: rgba(0, 240, 255, 0.15);
  --el-table-row-hover-bg-color: rgba(0, 240, 255, 0.08);
  background: transparent !important;
}

.power-quality-page .el-table th.el-table__cell {
  background: rgba(0, 240, 255, 0.05) !important;
  color: #00f3ff !important;
  font-weight: 700;
  font-size: 12px;
  border-bottom: 2px solid rgba(0, 240, 255, 0.2) !important;
}

.power-quality-page .el-table td.el-table__cell {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  color: #e2e8f0;
  font-size: 13px;
}

.power-quality-page .el-radio-button__inner {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 240, 255, 0.2);
  color: var(--text-sub);
}

.power-quality-page .el-radio-button__original-radio:checked + .el-radio-button__inner {
  background: rgba(0, 240, 255, 0.15);
  border-color: var(--tech-primary);
  color: var(--tech-primary);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}

.power-quality-page .el-select__wrapper {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 240, 255, 0.2);
  box-shadow: none;
}

.power-quality-page .el-date-editor {
  --el-input-bg-color: rgba(0, 0, 0, 0.3);
  --el-input-border-color: rgba(0, 240, 255, 0.2);
}

.power-quality-page .el-tag--success {
  background: rgba(0, 230, 118, 0.2);
  border-color: var(--status-success);
  color: var(--status-success);
}

.power-quality-page .el-tag--danger {
  background: rgba(255, 46, 99, 0.2);
  border-color: var(--status-danger);
  color: var(--status-danger);
}
</style>
