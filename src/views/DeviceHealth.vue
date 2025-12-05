<template>
  <div class="device-health-page">
    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 页面标题区 -->
      <div class="page-header">
        <div class="main-tabs-container">
          <div class="main-tabs">
            <div
              :class="['main-tab-item', { active: activeMainTab === 'overview' }]"
              @click="activeMainTab = 'overview'"
            >
              设备状态总览
            </div>
            <div
              :class="['main-tab-item', { active: activeMainTab === 'health' }]"
              @click="activeMainTab = 'health'"
            >
              健康评估
            </div>
            <div
              :class="['main-tab-item', { active: activeMainTab === 'predictive' }]"
              @click="activeMainTab = 'predictive'"
            >
              预测性维护
            </div>
            <div
              :class="['main-tab-item', { active: activeMainTab === 'lifecycle' }]"
              @click="activeMainTab = 'lifecycle'"
            >
              全生命周期
            </div>
          </div>

          <!-- 视图切换与配电室选择 -->
          <div class="header-actions">
            <!-- 视图切换 (仅在设备状态总览显示) -->
            <div class="view-switch" v-if="activeMainTab === 'overview'">
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
              v-if="activeMainTab !== 'overview'"
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
        <!-- =============== 设备状态总览 =============== -->
        <template v-if="activeMainTab === 'overview'">
          <!-- ===== 报表视图 ===== -->
          <template v-if="viewMode === 'report'">
          <!-- 顶部统计卡片 -->
          <div class="overview-stats">
            <div class="stat-card total">
              <div class="stat-icon">
                <el-icon><Cpu /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-label">设备总数</div>
                <div class="stat-value">{{ overviewData.totalDevices }}</div>
                <div class="stat-sub">{{ overviewData.deviceTypes }} 种类型</div>
              </div>
            </div>
            <div class="stat-card online">
              <div class="stat-icon">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-label">在线设备</div>
                <div class="stat-value">{{ overviewData.onlineDevices }}</div>
                <div class="stat-sub">在线率 {{ overviewData.onlineRate }}%</div>
              </div>
            </div>
            <div class="stat-card healthy">
              <div class="stat-icon">
                <el-icon><SuccessFilled /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-label">健康设备</div>
                <div class="stat-value">{{ overviewData.healthyDevices }}</div>
                <div class="stat-sub">健康率 {{ overviewData.healthRate }}%</div>
              </div>
            </div>
            <div class="stat-card warning">
              <div class="stat-icon">
                <el-icon><WarningFilled /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-label">预警设备</div>
                <div class="stat-value">{{ overviewData.warningDevices }}</div>
                <div class="stat-sub">需关注</div>
              </div>
            </div>
            <div class="stat-card fault">
              <div class="stat-icon">
                <el-icon><CircleCloseFilled /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-label">故障设备</div>
                <div class="stat-value">{{ overviewData.faultDevices }}</div>
                <div class="stat-sub">需处理</div>
              </div>
            </div>
            <div class="stat-card maintenance">
              <div class="stat-icon">
                <el-icon><Tools /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-label">维护中</div>
                <div class="stat-value">{{ overviewData.maintenanceDevices }}</div>
                <div class="stat-sub">计划维护</div>
              </div>
            </div>
          </div>

          <!-- 设备分类状态 -->
          <div class="device-category-panel">
            <div class="panel-header">
              <span class="panel-title">
                <el-icon><Grid /></el-icon>
                设备分类状态
              </span>
              <span class="standard-ref">DB11/T 527-2021</span>
            </div>
            <div class="category-grid">
              <div
                v-for="category in deviceCategories"
                :key="category.id"
                class="category-card"
                @click="selectCategory(category)"
              >
                <div class="category-icon" :class="category.status">
                  <el-icon><component :is="category.icon" /></el-icon>
                </div>
                <div class="category-info">
                  <div class="category-name">{{ category.name }}</div>
                  <div class="category-count">{{ category.count }} 台</div>
                </div>
                <div class="category-health">
                  <div class="health-bar">
                    <div class="health-fill" :style="{ width: category.healthRate + '%' }"></div>
                  </div>
                  <span class="health-text">{{ category.healthRate }}%</span>
                </div>
                <div class="category-status-dots">
                  <span class="status-dot healthy" :title="`健康: ${category.healthy}`">{{ category.healthy }}</span>
                  <span class="status-dot warning" :title="`预警: ${category.warning}`">{{ category.warning }}</span>
                  <span class="status-dot fault" :title="`故障: ${category.fault}`">{{ category.fault }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 关键设备监控 -->
          <div class="critical-devices-panel">
            <div class="panel-header">
              <span class="panel-title">
                <el-icon><Warning /></el-icon>
                关键设备实时状态
              </span>
              <button class="action-btn btn-primary" @click="refreshDevices">
                <el-icon><Refresh /></el-icon>
                <span>刷新</span>
              </button>
            </div>
            <div class="critical-devices-grid">
              <div
                v-for="device in criticalDevices"
                :key="device.id"
                :class="['device-card', device.status]"
              >
                <div class="device-header">
                  <span class="device-name">{{ device.name }}</span>
                  <span :class="['device-status-tag', device.status]">{{ getStatusText(device.status) }}</span>
                </div>
                <div class="device-metrics">
                  <div class="metric-row">
                    <span class="metric-label">运行温度</span>
                    <span class="metric-value" :class="getTempClass(device.temperature)">
                      {{ device.temperature }}°C
                    </span>
                  </div>
                  <div class="metric-row">
                    <span class="metric-label">负载率</span>
                    <span class="metric-value" :class="getLoadClass(device.loadRate)">
                      {{ device.loadRate }}%
                    </span>
                  </div>
                  <div class="metric-row">
                    <span class="metric-label">运行时长</span>
                    <span class="metric-value">{{ device.runHours }}h</span>
                  </div>
                </div>
                <div class="device-health-score">
                  <div class="score-ring" :class="getScoreClass(device.healthScore)">
                    <span class="score-value">{{ device.healthScore }}</span>
                  </div>
                  <span class="score-label">健康评分</span>
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
                    placeholder="搜索设备..."
                    style="width: 200px"
                    clearable
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                  <el-select v-model="listStatusFilter" placeholder="状态筛选" style="width: 120px" clearable>
                    <el-option label="全部" value="" />
                    <el-option label="健康" value="healthy" />
                    <el-option label="预警" value="warning" />
                    <el-option label="故障" value="fault" />
                  </el-select>
                  <el-select v-model="listCategoryFilter" placeholder="类别筛选" style="width: 120px" clearable>
                    <el-option label="全部" value="" />
                    <el-option label="变压器" value="transformer" />
                    <el-option label="开关柜" value="switchgear" />
                    <el-option label="传感器" value="sensor" />
                  </el-select>
                </div>
                <div class="toolbar-right">
                  <span class="record-count">共 {{ deviceListData.length }} 台设备</span>
                </div>
              </div>

              <!-- 列表卡片 -->
              <div class="list-cards">
                <div
                  v-for="device in deviceListData"
                  :key="device.id"
                  :class="['list-card', device.status]"
                >
                  <div class="card-header">
                    <div class="card-device-info">
                      <span :class="['status-indicator', device.status]"></span>
                      <span class="device-name">{{ device.name }}</span>
                    </div>
                    <div :class="['card-status', device.status]">{{ getStatusText(device.status) }}</div>
                  </div>
                  <div class="card-body">
                    <div class="device-category">
                      <el-icon><component :is="device.icon" /></el-icon>
                      <span>{{ device.category }}</span>
                    </div>
                    <div class="metrics-grid">
                      <div class="metric-item" v-if="device.temperature !== undefined">
                        <span class="metric-label">温度</span>
                        <span :class="['metric-value', getTempClass(device.temperature)]">{{ device.temperature }}°C</span>
                      </div>
                      <div class="metric-item" v-if="device.loadRate !== undefined">
                        <span class="metric-label">负载率</span>
                        <span :class="['metric-value', getLoadClass(device.loadRate)]">{{ device.loadRate }}%</span>
                      </div>
                      <div class="metric-item" v-if="device.runHours !== undefined">
                        <span class="metric-label">运行时长</span>
                        <span class="metric-value">{{ device.runHours }}h</span>
                      </div>
                    </div>
                  </div>
                  <div class="card-footer">
                    <div class="health-score-display">
                      <span class="score-label">健康评分</span>
                      <span :class="['score-value', getScoreClass(device.healthScore)]">{{ device.healthScore }}</span>
                    </div>
                    <div class="location-info" v-if="device.location">
                      <el-icon><Location /></el-icon>
                      <span>{{ device.location }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-if="deviceListData.length === 0" class="empty-state">
                <el-icon><Cpu /></el-icon>
                <span>暂无符合条件的设备</span>
              </div>
            </div>
          </template>
        </template>

        <!-- =============== 健康评估 =============== -->
        <template v-if="activeMainTab === 'health'">
          <div class="health-assessment-panel">
            <!-- 评估模型说明 -->
            <div class="assessment-model">
              <div class="model-header">
                <el-icon><DataAnalysis /></el-icon>
                <span>设备健康评估模型</span>
                <span class="model-version">v2.1 (基于GB/T 37931-2019)</span>
              </div>
              <div class="model-factors">
                <div class="factor-item">
                  <span class="factor-name">运行参数</span>
                  <span class="factor-weight">权重 30%</span>
                  <div class="factor-desc">温度、电流、电压等运行数据偏离度</div>
                </div>
                <div class="factor-item">
                  <span class="factor-name">设备状态</span>
                  <span class="factor-weight">权重 25%</span>
                  <div class="factor-desc">开关状态、绝缘状态、接地状态等</div>
                </div>
                <div class="factor-item">
                  <span class="factor-name">历史故障</span>
                  <span class="factor-weight">权重 20%</span>
                  <div class="factor-desc">历史故障次数、故障类型、修复质量</div>
                </div>
                <div class="factor-item">
                  <span class="factor-name">使用年限</span>
                  <span class="factor-weight">权重 15%</span>
                  <div class="factor-desc">设备使用年限与设计寿命对比</div>
                </div>
                <div class="factor-item">
                  <span class="factor-name">维护记录</span>
                  <span class="factor-weight">权重 10%</span>
                  <div class="factor-desc">巡检频次、维护质量、保养记录</div>
                </div>
              </div>
            </div>

            <!-- 健康评估结果 -->
            <div class="assessment-results">
              <div class="results-header">
                <span class="results-title">设备健康评估结果</span>
                <div class="results-actions">
                  <el-select v-model="healthFilter" placeholder="筛选" style="width: 120px">
                    <el-option label="全部" value="all" />
                    <el-option label="优秀" value="excellent" />
                    <el-option label="良好" value="good" />
                    <el-option label="一般" value="normal" />
                    <el-option label="较差" value="poor" />
                  </el-select>
                  <button class="action-btn btn-primary" @click="exportHealthReport">
                    <el-icon><Download /></el-icon>
                    <span>导出报告</span>
                  </button>
                </div>
              </div>
              <div class="assessment-table">
                <el-table :data="healthAssessmentData" style="width: 100%">
                  <el-table-column prop="name" label="设备名称" min-width="150" />
                  <el-table-column prop="type" label="设备类型" width="120" />
                  <el-table-column prop="location" label="安装位置" width="120" />
                  <el-table-column label="健康评分" width="120">
                    <template #default="{ row }">
                      <div class="score-cell">
                        <span :class="['score-badge', getScoreClass(row.score)]">{{ row.score }}</span>
                        <span class="score-level">{{ getScoreLevel(row.score) }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="各项评分" min-width="250">
                    <template #default="{ row }">
                      <div class="factor-scores">
                        <el-tooltip content="运行参数">
                          <span class="factor-score">参{{ row.factorScores.operation }}</span>
                        </el-tooltip>
                        <el-tooltip content="设备状态">
                          <span class="factor-score">状{{ row.factorScores.status }}</span>
                        </el-tooltip>
                        <el-tooltip content="历史故障">
                          <span class="factor-score">故{{ row.factorScores.fault }}</span>
                        </el-tooltip>
                        <el-tooltip content="使用年限">
                          <span class="factor-score">龄{{ row.factorScores.age }}</span>
                        </el-tooltip>
                        <el-tooltip content="维护记录">
                          <span class="factor-score">维{{ row.factorScores.maintenance }}</span>
                        </el-tooltip>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="趋势" width="100">
                    <template #default="{ row }">
                      <span :class="['trend-icon', row.trend]">
                        <el-icon v-if="row.trend === 'up'"><Top /></el-icon>
                        <el-icon v-else-if="row.trend === 'down'"><Bottom /></el-icon>
                        <el-icon v-else><Minus /></el-icon>
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column label="建议" width="100">
                    <template #default="{ row }">
                      <el-button link type="primary" size="small" @click="viewSuggestion(row)">
                        查看建议
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
        </template>

        <!-- =============== 预测性维护 =============== -->
        <template v-if="activeMainTab === 'predictive'">
          <div class="predictive-panel">
            <!-- AI预测概览 -->
            <div class="prediction-overview">
              <div class="prediction-card risk-high">
                <div class="prediction-icon">
                  <el-icon><WarningFilled /></el-icon>
                </div>
                <div class="prediction-content">
                  <div class="prediction-label">高风险设备</div>
                  <div class="prediction-value">{{ predictionData.highRisk }}</div>
                  <div class="prediction-desc">预计7天内可能故障</div>
                </div>
              </div>
              <div class="prediction-card risk-medium">
                <div class="prediction-icon">
                  <el-icon><Warning /></el-icon>
                </div>
                <div class="prediction-content">
                  <div class="prediction-label">中风险设备</div>
                  <div class="prediction-value">{{ predictionData.mediumRisk }}</div>
                  <div class="prediction-desc">预计30天内需维护</div>
                </div>
              </div>
              <div class="prediction-card maintenance-due">
                <div class="prediction-icon">
                  <el-icon><Clock /></el-icon>
                </div>
                <div class="prediction-content">
                  <div class="prediction-label">即将到期维护</div>
                  <div class="prediction-value">{{ predictionData.maintenanceDue }}</div>
                  <div class="prediction-desc">按计划需维护</div>
                </div>
              </div>
              <div class="prediction-card life-warning">
                <div class="prediction-icon">
                  <el-icon><Timer /></el-icon>
                </div>
                <div class="prediction-content">
                  <div class="prediction-label">寿命预警</div>
                  <div class="prediction-value">{{ predictionData.lifeWarning }}</div>
                  <div class="prediction-desc">剩余寿命&lt;20%</div>
                </div>
              </div>
            </div>

            <!-- 故障预测列表 -->
            <div class="fault-prediction-panel">
              <div class="panel-header">
                <span class="panel-title">
                  <el-icon><Cpu /></el-icon>
                  AI故障预测分析
                </span>
                <span class="ai-model">模型准确率: 94.5%</span>
              </div>
              <div class="prediction-list">
                <div
                  v-for="item in faultPredictions"
                  :key="item.id"
                  :class="['prediction-item', item.riskLevel]"
                >
                  <div class="prediction-device">
                    <span class="device-name">{{ item.deviceName }}</span>
                    <span class="device-type">{{ item.deviceType }}</span>
                  </div>
                  <div class="prediction-detail">
                    <div class="fault-type">
                      <span class="label">预测故障类型：</span>
                      <span class="value">{{ item.faultType }}</span>
                    </div>
                    <div class="fault-probability">
                      <span class="label">故障概率：</span>
                      <div class="probability-bar">
                        <div class="probability-fill" :style="{ width: item.probability + '%' }"></div>
                      </div>
                      <span class="probability-value">{{ item.probability }}%</span>
                    </div>
                    <div class="fault-time">
                      <span class="label">预计时间：</span>
                      <span class="value">{{ item.predictedTime }}</span>
                    </div>
                  </div>
                  <div class="prediction-actions">
                    <button class="action-btn btn-primary" @click="createMaintenanceOrder(item)">
                      创建维护工单
                    </button>
                    <button class="action-btn btn-secondary" @click="viewPredictionDetail(item)">
                      详情
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 寿命预估 -->
            <div class="life-estimation-panel">
              <div class="panel-header">
                <span class="panel-title">
                  <el-icon><Timer /></el-icon>
                  设备剩余寿命预估
                </span>
                <span class="standard-ref">依据GB/T 37931-2019</span>
              </div>
              <div class="life-table">
                <el-table :data="lifeEstimationData" style="width: 100%">
                  <el-table-column prop="name" label="设备名称" min-width="150" />
                  <el-table-column prop="type" label="类型" width="100" />
                  <el-table-column prop="installDate" label="投运日期" width="110" />
                  <el-table-column prop="designLife" label="设计寿命" width="100">
                    <template #default="{ row }">
                      {{ row.designLife }}年
                    </template>
                  </el-table-column>
                  <el-table-column prop="usedYears" label="已用年限" width="100">
                    <template #default="{ row }">
                      {{ row.usedYears }}年
                    </template>
                  </el-table-column>
                  <el-table-column label="剩余寿命" width="180">
                    <template #default="{ row }">
                      <div class="life-progress">
                        <div class="life-bar">
                          <div
                            class="life-fill"
                            :class="getLifeClass(row.remainingPercent)"
                            :style="{ width: (100 - row.remainingPercent) + '%' }"
                          ></div>
                        </div>
                        <span class="life-text">{{ row.remainingYears }}年 ({{ row.remainingPercent }}%)</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="建议" width="120">
                    <template #default="{ row }">
                      <span :class="['suggestion-tag', row.suggestion.type]">
                        {{ row.suggestion.text }}
                      </span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
        </template>

        <!-- =============== 全生命周期 =============== -->
        <template v-if="activeMainTab === 'lifecycle'">
          <div class="lifecycle-panel">
            <!-- 设备选择 -->
            <div class="device-selector">
              <el-select v-model="selectedDevice" placeholder="选择设备查看生命周期" style="width: 300px">
                <el-option
                  v-for="device in allDevices"
                  :key="device.id"
                  :label="device.name"
                  :value="device.id"
                />
              </el-select>
            </div>

            <!-- 生命周期时间线 -->
            <div class="lifecycle-timeline" v-if="selectedDeviceInfo">
              <div class="timeline-header">
                <div class="device-info">
                  <span class="device-name">{{ selectedDeviceInfo.name }}</span>
                  <span class="device-type">{{ selectedDeviceInfo.type }}</span>
                </div>
                <div class="lifecycle-summary">
                  <div class="summary-item">
                    <span class="label">投运日期</span>
                    <span class="value">{{ selectedDeviceInfo.installDate }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">运行天数</span>
                    <span class="value">{{ selectedDeviceInfo.runDays }}天</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">维护次数</span>
                    <span class="value">{{ selectedDeviceInfo.maintenanceCount }}次</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">故障次数</span>
                    <span class="value">{{ selectedDeviceInfo.faultCount }}次</span>
                  </div>
                </div>
              </div>

              <div class="timeline-content">
                <div class="timeline-line"></div>
                <div
                  v-for="event in lifecycleEvents"
                  :key="event.id"
                  :class="['timeline-event', event.type]"
                >
                  <div class="event-dot"></div>
                  <div class="event-date">{{ event.date }}</div>
                  <div class="event-card">
                    <div class="event-header">
                      <el-icon><component :is="getEventIcon(event.type)" /></el-icon>
                      <span class="event-title">{{ event.title }}</span>
                    </div>
                    <div class="event-content">{{ event.content }}</div>
                    <div class="event-operator" v-if="event.operator">
                      操作人：{{ event.operator }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 维护统计 -->
            <div class="maintenance-stats" v-if="selectedDeviceInfo">
              <div class="stats-header">
                <span class="stats-title">维护统计分析</span>
              </div>
              <div class="stats-grid">
                <div class="stats-card">
                  <div class="stats-label">计划维护</div>
                  <div class="stats-value">{{ maintenanceStats.planned }}</div>
                  <div class="stats-desc">按期完成率 {{ maintenanceStats.plannedRate }}%</div>
                </div>
                <div class="stats-card">
                  <div class="stats-label">故障维修</div>
                  <div class="stats-value">{{ maintenanceStats.fault }}</div>
                  <div class="stats-desc">平均修复时间 {{ maintenanceStats.avgRepairTime }}h</div>
                </div>
                <div class="stats-card">
                  <div class="stats-label">预防性维护</div>
                  <div class="stats-value">{{ maintenanceStats.preventive }}</div>
                  <div class="stats-desc">避免故障 {{ maintenanceStats.preventedFaults }} 次</div>
                </div>
                <div class="stats-card">
                  <div class="stats-label">维护成本</div>
                  <div class="stats-value">¥{{ maintenanceStats.totalCost }}</div>
                  <div class="stats-desc">年均 ¥{{ maintenanceStats.avgYearlyCost }}</div>
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
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Cpu, CircleCheck, SuccessFilled, WarningFilled, CircleCloseFilled, Tools,
  Grid, Warning, Refresh, DataAnalysis, Download, Clock, Timer,
  Top, Bottom, Minus, Setting, Monitor, Odometer, Lightning,
  Document, List, Search, Location, Sunny, VideoCamera, Aim
} from '@element-plus/icons-vue'

// ========== 基础数据 ==========
const activeMainTab = ref('overview')
const viewMode = ref<'report' | 'list'>('report')
const selectedRoom = ref('room1')
const dateRange = ref<[Date, Date] | null>(null)
const healthFilter = ref('all')
const selectedDevice = ref('')
const listSearchKeyword = ref('')
const listStatusFilter = ref('')
const listCategoryFilter = ref('')

const rooms = [
  { id: 'room1', name: '圆心配电室' },
  { id: 'room2', name: '通州配电室' },
  { id: 'room3', name: '北理工配电室' }
]

// ========== 设备状态总览数据 ==========
const overviewData = ref({
  totalDevices: 156,
  deviceTypes: 12,
  onlineDevices: 152,
  onlineRate: 97.4,
  healthyDevices: 138,
  healthRate: 88.5,
  warningDevices: 12,
  faultDevices: 3,
  maintenanceDevices: 3
})

const deviceCategories = ref([
  { id: 1, name: '变压器', icon: 'Odometer', count: 6, healthRate: 95, healthy: 5, warning: 1, fault: 0, status: 'healthy' },
  { id: 2, name: '高压开关柜', icon: 'Monitor', count: 24, healthRate: 92, healthy: 22, warning: 1, fault: 1, status: 'warning' },
  { id: 3, name: '低压开关柜', icon: 'Monitor', count: 36, healthRate: 89, healthy: 32, warning: 3, fault: 1, status: 'warning' },
  { id: 4, name: '电容补偿柜', icon: 'Lightning', count: 8, healthRate: 100, healthy: 8, warning: 0, fault: 0, status: 'healthy' },
  { id: 5, name: '直流屏', icon: 'Cpu', count: 4, healthRate: 100, healthy: 4, warning: 0, fault: 0, status: 'healthy' },
  { id: 6, name: '环境传感器', icon: 'Sunny', count: 48, healthRate: 96, healthy: 46, warning: 2, fault: 0, status: 'healthy' },
  { id: 7, name: '摄像头', icon: 'VideoCamera', count: 18, healthRate: 94, healthy: 17, warning: 1, fault: 0, status: 'healthy' },
  { id: 8, name: '巡检机器人', icon: 'Aim', count: 2, healthRate: 100, healthy: 2, warning: 0, fault: 0, status: 'healthy' }
])

const criticalDevices = ref([
  { id: 1, name: '1#主变压器', status: 'healthy', temperature: 52, loadRate: 68, runHours: 25680, healthScore: 92 },
  { id: 2, name: '2#主变压器', status: 'healthy', temperature: 48, loadRate: 55, runHours: 25680, healthScore: 95 },
  { id: 3, name: '10kV进线柜', status: 'warning', temperature: 42, loadRate: 78, runHours: 18520, healthScore: 76 },
  { id: 4, name: '10kV出线柜-1', status: 'healthy', temperature: 38, loadRate: 62, runHours: 18520, healthScore: 88 },
  { id: 5, name: '10kV出线柜-2', status: 'fault', temperature: 65, loadRate: 0, runHours: 18520, healthScore: 45 },
  { id: 6, name: '低压总进线柜', status: 'healthy', temperature: 35, loadRate: 72, runHours: 18520, healthScore: 91 }
])

// 列表视图数据
const deviceListData = computed(() => {
  const allDevicesList = [
    { id: 1, name: '1#主变压器', status: 'healthy', category: '变压器', categoryType: 'transformer', icon: 'Odometer', temperature: 52, loadRate: 68, runHours: 25680, healthScore: 92, location: '变压器室' },
    { id: 2, name: '2#主变压器', status: 'healthy', category: '变压器', categoryType: 'transformer', icon: 'Odometer', temperature: 48, loadRate: 55, runHours: 25680, healthScore: 95, location: '变压器室' },
    { id: 3, name: '10kV进线柜', status: 'warning', category: '高压开关柜', categoryType: 'switchgear', icon: 'Monitor', temperature: 42, loadRate: 78, runHours: 18520, healthScore: 76, location: '高压室' },
    { id: 4, name: '10kV出线柜-1', status: 'healthy', category: '高压开关柜', categoryType: 'switchgear', icon: 'Monitor', temperature: 38, loadRate: 62, runHours: 18520, healthScore: 88, location: '高压室' },
    { id: 5, name: '10kV出线柜-2', status: 'fault', category: '高压开关柜', categoryType: 'switchgear', icon: 'Monitor', temperature: 65, loadRate: 0, runHours: 18520, healthScore: 45, location: '高压室' },
    { id: 6, name: '低压总进线柜', status: 'healthy', category: '低压开关柜', categoryType: 'switchgear', icon: 'Monitor', temperature: 35, loadRate: 72, runHours: 18520, healthScore: 91, location: '低压室' },
    { id: 7, name: '低压配电柜-1', status: 'healthy', category: '低压开关柜', categoryType: 'switchgear', icon: 'Monitor', temperature: 32, loadRate: 58, runHours: 18520, healthScore: 89, location: '低压室' },
    { id: 8, name: '低压配电柜-2', status: 'healthy', category: '低压开关柜', categoryType: 'switchgear', icon: 'Monitor', temperature: 34, loadRate: 62, runHours: 18520, healthScore: 87, location: '低压室' },
    { id: 9, name: '电容补偿柜-1', status: 'healthy', category: '电容柜', categoryType: 'switchgear', icon: 'Lightning', temperature: 28, healthScore: 94, location: '电容室' },
    { id: 10, name: '直流屏', status: 'healthy', category: '直流屏', categoryType: 'switchgear', icon: 'Cpu', temperature: 30, healthScore: 96, location: '直流室' },
    { id: 11, name: '温湿度传感器-1', status: 'healthy', category: '环境传感器', categoryType: 'sensor', icon: 'Sunny', healthScore: 98, location: '变压器室' },
    { id: 12, name: '温湿度传感器-2', status: 'warning', category: '环境传感器', categoryType: 'sensor', icon: 'Sunny', healthScore: 72, location: '高压室' },
    { id: 13, name: '红外测温仪', status: 'healthy', category: '环境传感器', categoryType: 'sensor', icon: 'Monitor', healthScore: 90, location: '变压器室' },
    { id: 14, name: '巡检机器人', status: 'healthy', category: '智能设备', categoryType: 'sensor', icon: 'Aim', runHours: 5200, healthScore: 95, location: '配电室' }
  ]

  return allDevicesList.filter(device => {
    const matchKeyword = !listSearchKeyword.value ||
      device.name.includes(listSearchKeyword.value) ||
      device.category.includes(listSearchKeyword.value)
    const matchStatus = !listStatusFilter.value || device.status === listStatusFilter.value
    const matchCategory = !listCategoryFilter.value || device.categoryType === listCategoryFilter.value
    return matchKeyword && matchStatus && matchCategory
  })
})

// ========== 健康评估数据 ==========
const healthAssessmentData = ref([
  {
    id: 1, name: '1#主变压器', type: '油浸式变压器', location: '变压器室',
    score: 92, trend: 'stable',
    factorScores: { operation: 95, status: 90, fault: 88, age: 85, maintenance: 98 }
  },
  {
    id: 2, name: '2#主变压器', type: '油浸式变压器', location: '变压器室',
    score: 95, trend: 'up',
    factorScores: { operation: 96, status: 94, fault: 92, age: 90, maintenance: 98 }
  },
  {
    id: 3, name: '10kV进线柜', type: '高压开关柜', location: '高压室',
    score: 76, trend: 'down',
    factorScores: { operation: 72, status: 78, fault: 70, age: 82, maintenance: 85 }
  },
  {
    id: 4, name: '10kV出线柜-1', type: '高压开关柜', location: '高压室',
    score: 88, trend: 'stable',
    factorScores: { operation: 90, status: 86, fault: 85, age: 88, maintenance: 92 }
  },
  {
    id: 5, name: '10kV出线柜-2', type: '高压开关柜', location: '高压室',
    score: 45, trend: 'down',
    factorScores: { operation: 30, status: 40, fault: 55, age: 65, maintenance: 70 }
  },
  {
    id: 6, name: '低压总进线柜', type: '低压开关柜', location: '低压室',
    score: 91, trend: 'up',
    factorScores: { operation: 92, status: 90, fault: 88, age: 90, maintenance: 95 }
  }
])

// ========== 预测性维护数据 ==========
const predictionData = ref({
  highRisk: 2,
  mediumRisk: 5,
  maintenanceDue: 8,
  lifeWarning: 3
})

const faultPredictions = ref([
  {
    id: 1, deviceName: '10kV进线柜', deviceType: '高压开关柜',
    faultType: '触头过热', probability: 78, predictedTime: '7天内',
    riskLevel: 'high'
  },
  {
    id: 2, deviceName: '10kV出线柜-2', deviceType: '高压开关柜',
    faultType: '绝缘老化', probability: 85, predictedTime: '3天内',
    riskLevel: 'high'
  },
  {
    id: 3, deviceName: '低压配电柜-5', deviceType: '低压开关柜',
    faultType: '接触不良', probability: 62, predictedTime: '15天内',
    riskLevel: 'medium'
  },
  {
    id: 4, deviceName: '电容补偿柜-2', deviceType: '电容柜',
    faultType: '电容器老化', probability: 55, predictedTime: '30天内',
    riskLevel: 'medium'
  }
])

const lifeEstimationData = ref([
  { id: 1, name: '1#主变压器', type: '变压器', installDate: '2018-05-15', designLife: 25, usedYears: 6.5, remainingYears: 18.5, remainingPercent: 74, suggestion: { type: 'normal', text: '正常使用' } },
  { id: 2, name: '2#主变压器', type: '变压器', installDate: '2018-05-15', designLife: 25, usedYears: 6.5, remainingYears: 18.5, remainingPercent: 74, suggestion: { type: 'normal', text: '正常使用' } },
  { id: 3, name: '10kV进线柜', type: '开关柜', installDate: '2015-08-20', designLife: 20, usedYears: 9.3, remainingYears: 10.7, remainingPercent: 54, suggestion: { type: 'attention', text: '加强监测' } },
  { id: 4, name: '10kV出线柜-2', type: '开关柜', installDate: '2012-03-10', designLife: 20, usedYears: 12.7, remainingYears: 7.3, remainingPercent: 37, suggestion: { type: 'warning', text: '计划更换' } },
  { id: 5, name: '低压总进线柜', type: '开关柜', installDate: '2019-11-08', designLife: 20, usedYears: 5.1, remainingYears: 14.9, remainingPercent: 75, suggestion: { type: 'normal', text: '正常使用' } }
])

// ========== 全生命周期数据 ==========
const allDevices = ref([
  { id: 1, name: '1#主变压器' },
  { id: 2, name: '2#主变压器' },
  { id: 3, name: '10kV进线柜' },
  { id: 4, name: '10kV出线柜-1' },
  { id: 5, name: '10kV出线柜-2' },
  { id: 6, name: '低压总进线柜' }
])

const selectedDeviceInfo = computed(() => {
  if (!selectedDevice.value) return null
  return {
    name: '1#主变压器',
    type: '油浸式变压器 S11-1000/10',
    installDate: '2018-05-15',
    runDays: 2395,
    maintenanceCount: 28,
    faultCount: 2
  }
})

const lifecycleEvents = ref([
  { id: 1, type: 'install', date: '2018-05-15', title: '设备安装', content: '完成安装调试，通过验收', operator: '张工' },
  { id: 2, type: 'maintenance', date: '2019-05-20', title: '年度维护', content: '常规年度维护保养，更换绝缘油', operator: '李工' },
  { id: 3, type: 'inspection', date: '2019-11-10', title: '专项检测', content: '红外测温检测，结果正常', operator: '王工' },
  { id: 4, type: 'fault', date: '2020-07-22', title: '故障处理', content: '冷却风扇故障，更换风扇电机', operator: '赵工' },
  { id: 5, type: 'maintenance', date: '2020-05-18', title: '年度维护', content: '常规年度维护保养', operator: '李工' },
  { id: 6, type: 'upgrade', date: '2021-03-05', title: '改造升级', content: '加装在线监测装置', operator: '张工' },
  { id: 7, type: 'maintenance', date: '2024-05-12', title: '年度维护', content: '常规年度维护保养，油样检测合格', operator: '李工' }
])

const maintenanceStats = ref({
  planned: 24,
  plannedRate: 95.8,
  fault: 2,
  avgRepairTime: 4.5,
  preventive: 6,
  preventedFaults: 3,
  totalCost: 45600,
  avgYearlyCost: 7600
})

// ========== 辅助函数 ==========
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    healthy: '正常', warning: '预警', fault: '故障', offline: '离线', maintenance: '维护中'
  }
  return map[status] || status
}

const getTempClass = (temp: number) => {
  if (temp > 70) return 'danger'
  if (temp > 55) return 'warning'
  return 'normal'
}

const getLoadClass = (load: number) => {
  if (load > 90) return 'danger'
  if (load > 75) return 'warning'
  return 'normal'
}

const getScoreClass = (score: number) => {
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 60) return 'normal'
  return 'poor'
}

const getScoreLevel = (score: number) => {
  if (score >= 90) return '优秀'
  if (score >= 75) return '良好'
  if (score >= 60) return '一般'
  return '较差'
}

const getLifeClass = (percent: number) => {
  if (percent <= 20) return 'danger'
  if (percent <= 40) return 'warning'
  return 'normal'
}

const getEventIcon = (type: string) => {
  const map: Record<string, any> = {
    install: Setting,
    maintenance: Tools,
    inspection: Monitor,
    fault: Warning,
    upgrade: Cpu
  }
  return map[type] || Setting
}

const selectCategory = (category: any) => {
  ElMessage.info(`查看 ${category.name} 详情`)
}

const refreshDevices = () => {
  ElMessage.success('设备状态已刷新')
}

const exportHealthReport = () => {
  ElMessage.success('健康评估报告导出成功')
}

const viewSuggestion = (row: any) => {
  ElMessage.info(`查看 ${row.name} 维护建议`)
}

const createMaintenanceOrder = (item: any) => {
  ElMessage.success(`已创建 ${item.deviceName} 维护工单`)
}

const viewPredictionDetail = (item: any) => {
  ElMessage.info(`查看 ${item.deviceName} 预测详情`)
}
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

.device-health-page {
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

/* ========== 设备状态总览 ========== */
.overview-stats {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.stat-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s;
}

.stat-card:hover {
  border-color: var(--tech-primary);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.2);
}

.stat-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  border: 1px solid;
}

.stat-card.total .stat-icon { color: var(--tech-primary); border-color: var(--tech-primary); background: rgba(0, 240, 255, 0.1); }
.stat-card.online .stat-icon { color: #60a5fa; border-color: #60a5fa; background: rgba(96, 165, 250, 0.1); }
.stat-card.healthy .stat-icon { color: var(--status-success); border-color: var(--status-success); background: rgba(0, 230, 118, 0.1); }
.stat-card.warning .stat-icon { color: var(--status-warning); border-color: var(--status-warning); background: rgba(255, 214, 0, 0.1); }
.stat-card.fault .stat-icon { color: var(--status-danger); border-color: var(--status-danger); background: rgba(255, 46, 99, 0.1); }
.stat-card.maintenance .stat-icon { color: #a78bfa; border-color: #a78bfa; background: rgba(167, 139, 250, 0.1); }

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 12px;
  color: var(--text-sub);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-bright);
  font-family: 'DIN Alternate', sans-serif;
}

.stat-sub {
  font-size: 12px;
  color: var(--tech-primary);
  margin-top: 4px;
}

/* 设备分类面板 */
.device-category-panel, .critical-devices-panel {
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

.standard-ref, .ai-model, .model-version {
  font-size: 11px;
  color: var(--text-muted);
  padding: 2px 8px;
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 20px;
}

.category-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.15);
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-card:hover {
  border-color: var(--tech-primary);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.2);
}

.category-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: 1px solid;
}

.category-icon.healthy { color: var(--status-success); border-color: var(--status-success); background: rgba(0, 230, 118, 0.1); }
.category-icon.warning { color: var(--status-warning); border-color: var(--status-warning); background: rgba(255, 214, 0, 0.1); }
.category-icon.fault { color: var(--status-danger); border-color: var(--status-danger); background: rgba(255, 46, 99, 0.1); }

.category-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-bright);
}

.category-count {
  font-size: 12px;
  color: var(--text-sub);
}

.category-health {
  display: flex;
  align-items: center;
  gap: 10px;
}

.health-bar {
  flex: 1;
  height: 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  overflow: hidden;
}

.health-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--status-success), var(--tech-primary));
  border-radius: 3px;
}

.health-text {
  font-size: 12px;
  color: var(--tech-primary);
  font-family: 'DIN Alternate', sans-serif;
}

.category-status-dots {
  display: flex;
  gap: 8px;
}

.status-dot {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 2px;
}

.status-dot.healthy { background: rgba(0, 230, 118, 0.2); color: var(--status-success); }
.status-dot.warning { background: rgba(255, 214, 0, 0.2); color: var(--status-warning); }
.status-dot.fault { background: rgba(255, 46, 99, 0.2); color: var(--status-danger); }

/* 关键设备卡片 */
.critical-devices-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 20px;
}

.device-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.15);
  padding: 16px;
  position: relative;
}

.device-card.healthy { border-left: 3px solid var(--status-success); }
.device-card.warning { border-left: 3px solid var(--status-warning); }
.device-card.fault { border-left: 3px solid var(--status-danger); }

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.device-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-bright);
}

.device-status-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 2px;
}

.device-status-tag.healthy { background: rgba(0, 230, 118, 0.2); color: var(--status-success); }
.device-status-tag.warning { background: rgba(255, 214, 0, 0.2); color: var(--status-warning); }
.device-status-tag.fault { background: rgba(255, 46, 99, 0.2); color: var(--status-danger); }

.device-metrics {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.metric-label { color: var(--text-sub); }
.metric-value { color: var(--text-bright); font-family: 'DIN Alternate', sans-serif; }
.metric-value.normal { color: var(--status-success); }
.metric-value.warning { color: var(--status-warning); }
.metric-value.danger { color: var(--status-danger); }

.device-health-score {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.score-ring {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid;
}

.score-ring.excellent { border-color: var(--status-success); color: var(--status-success); }
.score-ring.good { border-color: var(--tech-primary); color: var(--tech-primary); }
.score-ring.normal { border-color: var(--status-warning); color: var(--status-warning); }
.score-ring.poor { border-color: var(--status-danger); color: var(--status-danger); }

.score-value {
  font-size: 16px;
  font-weight: 700;
  font-family: 'DIN Alternate', sans-serif;
}

.score-label {
  font-size: 10px;
  color: var(--text-muted);
}

/* ========== 健康评估 ========== */
.health-assessment-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.assessment-model {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  padding: 20px;
}

.model-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--tech-primary);
  margin-bottom: 16px;
}

.model-factors {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.factor-item {
  padding: 12px;
  background: rgba(0, 240, 255, 0.05);
  border: 1px solid rgba(0, 240, 255, 0.1);
}

.factor-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-bright);
  display: block;
  margin-bottom: 4px;
}

.factor-weight {
  font-size: 11px;
  color: var(--tech-primary);
  display: block;
  margin-bottom: 8px;
}

.factor-desc {
  font-size: 11px;
  color: var(--text-sub);
  line-height: 1.4;
}

.assessment-results {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
}

.results-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--tech-primary);
}

.results-actions {
  display: flex;
  gap: 12px;
}

.assessment-table {
  padding: 16px;
}

.score-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-badge {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  font-family: 'DIN Alternate', sans-serif;
  border: 2px solid;
}

.score-badge.excellent { border-color: var(--status-success); color: var(--status-success); background: rgba(0, 230, 118, 0.1); }
.score-badge.good { border-color: var(--tech-primary); color: var(--tech-primary); background: rgba(0, 240, 255, 0.1); }
.score-badge.normal { border-color: var(--status-warning); color: var(--status-warning); background: rgba(255, 214, 0, 0.1); }
.score-badge.poor { border-color: var(--status-danger); color: var(--status-danger); background: rgba(255, 46, 99, 0.1); }

.score-level {
  font-size: 12px;
  color: var(--text-sub);
}

.factor-scores {
  display: flex;
  gap: 6px;
}

.factor-score {
  font-size: 11px;
  padding: 2px 6px;
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.2);
  color: var(--tech-primary);
  cursor: pointer;
}

.trend-icon {
  font-size: 18px;
}

.trend-icon.up { color: var(--status-success); }
.trend-icon.down { color: var(--status-danger); }
.trend-icon.stable { color: var(--text-sub); }

/* ========== 预测性维护 ========== */
.predictive-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.prediction-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.prediction-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.prediction-card.risk-high { border-left: 3px solid var(--status-danger); }
.prediction-card.risk-medium { border-left: 3px solid var(--status-warning); }
.prediction-card.maintenance-due { border-left: 3px solid var(--tech-primary); }
.prediction-card.life-warning { border-left: 3px solid #a78bfa; }

.prediction-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.prediction-card.risk-high .prediction-icon { color: var(--status-danger); }
.prediction-card.risk-medium .prediction-icon { color: var(--status-warning); }
.prediction-card.maintenance-due .prediction-icon { color: var(--tech-primary); }
.prediction-card.life-warning .prediction-icon { color: #a78bfa; }

.prediction-label {
  font-size: 12px;
  color: var(--text-sub);
  margin-bottom: 4px;
}

.prediction-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-bright);
  font-family: 'DIN Alternate', sans-serif;
}

.prediction-desc {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
}

/* 故障预测列表 */
.fault-prediction-panel, .life-estimation-panel {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.prediction-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.prediction-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.1);
}

.prediction-item.high { border-left: 3px solid var(--status-danger); }
.prediction-item.medium { border-left: 3px solid var(--status-warning); }

.prediction-device {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.prediction-device .device-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-bright);
}

.prediction-device .device-type {
  font-size: 12px;
  color: var(--text-sub);
}

.prediction-detail {
  display: flex;
  gap: 24px;
}

.prediction-detail .label {
  font-size: 12px;
  color: var(--text-sub);
}

.prediction-detail .value {
  font-size: 12px;
  color: var(--text-bright);
}

.fault-probability {
  display: flex;
  align-items: center;
  gap: 8px;
}

.probability-bar {
  width: 80px;
  height: 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  overflow: hidden;
}

.probability-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--status-warning), var(--status-danger));
  border-radius: 3px;
}

.probability-value {
  font-size: 12px;
  color: var(--status-danger);
  font-weight: 600;
}

.prediction-actions {
  display: flex;
  gap: 10px;
}

/* 寿命预估表格 */
.life-table {
  padding: 16px;
}

.life-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.life-bar {
  flex: 1;
  height: 8px;
  background: rgba(0, 240, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.life-fill {
  height: 100%;
  border-radius: 4px;
}

.life-fill.normal { background: var(--status-success); }
.life-fill.warning { background: var(--status-warning); }
.life-fill.danger { background: var(--status-danger); }

.life-text {
  font-size: 12px;
  color: var(--text-bright);
  white-space: nowrap;
}

.suggestion-tag {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 2px;
}

.suggestion-tag.normal { background: rgba(0, 230, 118, 0.2); color: var(--status-success); }
.suggestion-tag.attention { background: rgba(0, 240, 255, 0.2); color: var(--tech-primary); }
.suggestion-tag.warning { background: rgba(255, 214, 0, 0.2); color: var(--status-warning); }
.suggestion-tag.danger { background: rgba(255, 46, 99, 0.2); color: var(--status-danger); }

/* ========== 全生命周期 ========== */
.lifecycle-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.device-selector {
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.lifecycle-timeline {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  padding: 20px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  margin-bottom: 20px;
}

.device-info .device-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-bright);
}

.device-info .device-type {
  font-size: 12px;
  color: var(--text-sub);
  margin-left: 12px;
}

.lifecycle-summary {
  display: flex;
  gap: 24px;
}

.lifecycle-summary .summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.lifecycle-summary .label {
  font-size: 11px;
  color: var(--text-sub);
}

.lifecycle-summary .value {
  font-size: 14px;
  font-weight: 600;
  color: var(--tech-primary);
  font-family: 'DIN Alternate', sans-serif;
}

.timeline-content {
  position: relative;
  padding-left: 100px;
}

.timeline-line {
  position: absolute;
  left: 90px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(0, 240, 255, 0.2);
}

.timeline-event {
  position: relative;
  margin-bottom: 24px;
}

.event-dot {
  position: absolute;
  left: -14px;
  top: 8px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--tech-primary);
  border: 2px solid rgba(13, 18, 26, 1);
}

.timeline-event.install .event-dot { background: var(--status-success); }
.timeline-event.maintenance .event-dot { background: var(--tech-primary); }
.timeline-event.inspection .event-dot { background: #60a5fa; }
.timeline-event.fault .event-dot { background: var(--status-danger); }
.timeline-event.upgrade .event-dot { background: #a78bfa; }

.event-date {
  position: absolute;
  left: -100px;
  width: 80px;
  font-size: 12px;
  color: var(--text-sub);
  text-align: right;
}

.event-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.15);
  padding: 12px 16px;
  margin-left: 10px;
}

.event-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.event-header .el-icon {
  color: var(--tech-primary);
}

.event-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-bright);
}

.event-content {
  font-size: 12px;
  color: var(--text-sub);
  margin-bottom: 4px;
}

.event-operator {
  font-size: 11px;
  color: var(--text-muted);
}

/* 维护统计 */
.maintenance-stats {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.stats-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
}

.stats-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--tech-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 20px;
}

.stats-card {
  text-align: center;
  padding: 16px;
  background: rgba(0, 240, 255, 0.05);
  border: 1px solid rgba(0, 240, 255, 0.1);
}

.stats-label {
  font-size: 12px;
  color: var(--text-sub);
  margin-bottom: 8px;
}

.stats-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--tech-primary);
  font-family: 'DIN Alternate', sans-serif;
}

.stats-desc {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
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

.list-card.healthy {
  border-left: 3px solid var(--status-success);
}

.list-card.warning {
  border-left: 3px solid var(--status-warning);
}

.list-card.fault {
  border-left: 3px solid var(--status-danger);
}

.list-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  background: rgba(0, 240, 255, 0.03);
}

.card-device-info {
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

.status-indicator.healthy { background: var(--status-success); }
.status-indicator.warning { background: var(--status-warning); }
.status-indicator.fault { background: var(--status-danger); }

.list-card .device-name {
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

.list-card .card-status.healthy {
  background: rgba(0, 230, 118, 0.15);
  color: var(--status-success);
}

.list-card .card-status.warning {
  background: rgba(255, 214, 0, 0.15);
  color: var(--status-warning);
}

.list-card .card-status.fault {
  background: rgba(255, 46, 99, 0.15);
  color: var(--status-danger);
}

.list-card .card-body {
  padding: 16px;
}

.device-category {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.2);
  margin-bottom: 14px;
  font-size: 13px;
  color: var(--text-sub);
}

.device-category .el-icon {
  color: var(--tech-primary);
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
  font-size: 16px;
  font-weight: 700;
  color: var(--text-bright);
  font-family: 'DIN Alternate', sans-serif;
}

.metric-item .metric-value.normal { color: var(--status-success); }
.metric-item .metric-value.warning { color: var(--status-warning); }
.metric-item .metric-value.danger { color: var(--status-danger); }

.list-card .card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid rgba(0, 240, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.health-score-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.health-score-display .score-label {
  font-size: 12px;
  color: var(--text-muted);
}

.health-score-display .score-value {
  font-size: 20px;
  font-weight: 700;
  font-family: 'DIN Alternate', sans-serif;
}

.health-score-display .score-value.excellent { color: var(--status-success); }
.health-score-display .score-value.good { color: var(--tech-primary); }
.health-score-display .score-value.normal { color: var(--status-warning); }
.health-score-display .score-value.poor { color: var(--status-danger); }

.location-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-sub);
}

.location-info .el-icon {
  color: var(--tech-primary);
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
.device-health-page .el-table {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(0, 240, 255, 0.05);
  --el-table-header-text-color: #00f3ff;
  --el-table-text-color: #e2e8f0;
  --el-table-border-color: rgba(0, 240, 255, 0.15);
  --el-table-row-hover-bg-color: rgba(0, 240, 255, 0.08);
  background: transparent !important;
}

.device-health-page .el-table th.el-table__cell {
  background: rgba(0, 240, 255, 0.05) !important;
  color: #00f3ff !important;
  font-weight: 700;
  font-size: 12px;
  border-bottom: 2px solid rgba(0, 240, 255, 0.2) !important;
}

.device-health-page .el-table td.el-table__cell {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  color: #e2e8f0;
  font-size: 13px;
}

.device-health-page .el-select__wrapper {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 240, 255, 0.2);
  box-shadow: none;
}

.device-health-page .el-date-editor {
  --el-input-bg-color: rgba(0, 0, 0, 0.3);
  --el-input-border-color: rgba(0, 240, 255, 0.2);
}
</style>
