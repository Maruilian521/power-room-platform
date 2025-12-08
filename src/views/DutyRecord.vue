<template>
  <div class="duty-record-page">
    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 页面标题区 -->
      <div class="page-header">
        <div class="header-left">
          <span class="page-title">
            <el-icon><Document /></el-icon>
            配电室值班记录表
          </span>
          <span class="standard-ref">依据 DB11/T 527-2021 | 每2小时采集一次</span>
        </div>
        <div class="header-actions">
          <!-- 视图切换 -->
          <div class="view-switch">
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
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 160px"
          />
          <el-select v-model="selectedShift" placeholder="班次" style="width: 120px">
            <el-option label="全天" value="all" />
            <el-option label="白班 (08:00-20:00)" value="day" />
            <el-option label="夜班 (20:00-08:00)" value="night" />
          </el-select>
          <button class="action-btn btn-primary" @click="refreshData">
            <el-icon><Refresh /></el-icon>
            <span>刷新数据</span>
          </button>
          <button class="action-btn btn-primary" @click="exportRecord">
            <el-icon><Download /></el-icon>
            <span>导出报表</span>
          </button>
        </div>
      </div>

      <!-- 内容区容器 -->
      <div class="content-wrapper">
        <!-- ==================== 报表视图 ==================== -->
        <template v-if="viewMode === 'report'">
        <!-- 记录表信息头 -->
        <div class="record-info-header">
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">配电室名称</span>
              <span class="info-value">{{ currentRoom?.name || '圆心科技配电室' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">配电室编号</span>
              <span class="info-value">{{ currentRoom?.code || 'PDR-HDA-001' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">记录日期</span>
              <span class="info-value">{{ selectedDate }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">变压器型号</span>
              <span class="info-value">{{ currentRoom?.transformerModel || 'S11-1000/10' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">变压器容量</span>
              <span class="info-value">{{ currentRoom?.capacity || '1000' }} kVA</span>
            </div>
            <div class="info-item">
              <span class="info-label">数据采集状态</span>
              <span class="info-value status" :class="dataStatus">
                <span class="status-dot"></span>
                {{ dataStatus === 'online' ? '在线采集中' : '离线' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 主记录表格 -->
        <div class="record-table-panel">
          <div class="panel-header">
            <span class="panel-title">
              <el-icon><Clock /></el-icon>
              配电室值班记录表（2小时/次）
            </span>
            <div class="panel-legend">
              <span class="legend-item normal"><span class="dot"></span>正常</span>
              <span class="legend-item warning"><span class="dot"></span>注意</span>
              <span class="legend-item danger"><span class="dot"></span>异常</span>
            </div>
          </div>
          <div class="table-container">
            <table class="record-table">
              <thead>
                <tr class="header-row-1">
                  <th rowspan="3" class="time-col">时间</th>
                  <th colspan="17" class="group-header transformer1">1#变压器</th>
                  <th colspan="17" class="group-header transformer2">2#变压器</th>
                  <th rowspan="3" class="single-header env-col">环境<br/>温度(℃)</th>
                  <th rowspan="3" class="single-header env-col">环境<br/>湿度(%)</th>
                  <th rowspan="3" class="single-header">安全<br/>用具</th>
                  <th rowspan="3" class="single-header">消防<br/>器材</th>
                  <th rowspan="3" class="single-header">值班人</th>
                  <th rowspan="3" class="remark-col">备注</th>
                </tr>
                <tr class="header-row-2">
                  <th colspan="6" class="group-header hv">高压侧</th>
                  <th rowspan="2" class="single-header power-col">有功<br/>(kW)</th>
                  <th rowspan="2" class="single-header power-col">无功<br/>(kVar)</th>
                  <th colspan="6" class="group-header lv">低压侧</th>
                  <th rowspan="2" class="single-header temp-col">温度<br/>(℃)</th>
                  <th rowspan="2" class="single-header power-col">有功<br/>(kW)</th>
                  <th rowspan="2" class="single-header power-col">无功<br/>(kVar)</th>
                  <th colspan="6" class="group-header hv">高压侧</th>
                  <th rowspan="2" class="single-header power-col">有功<br/>(kW)</th>
                  <th rowspan="2" class="single-header power-col">无功<br/>(kVar)</th>
                  <th colspan="6" class="group-header lv">低压侧</th>
                  <th rowspan="2" class="single-header temp-col">温度<br/>(℃)</th>
                  <th rowspan="2" class="single-header power-col">有功<br/>(kW)</th>
                  <th rowspan="2" class="single-header power-col">无功<br/>(kVar)</th>
                </tr>
                <tr class="header-row-3">
                  <th class="sub-header">A相压</th>
                  <th class="sub-header">B相压</th>
                  <th class="sub-header">C相压</th>
                  <th class="sub-header">A相流</th>
                  <th class="sub-header">B相流</th>
                  <th class="sub-header">C相流</th>
                  <th class="sub-header">A相压</th>
                  <th class="sub-header">B相压</th>
                  <th class="sub-header">C相压</th>
                  <th class="sub-header">A相流</th>
                  <th class="sub-header">B相流</th>
                  <th class="sub-header">C相流</th>
                  <th class="sub-header">A相压</th>
                  <th class="sub-header">B相压</th>
                  <th class="sub-header">C相压</th>
                  <th class="sub-header">A相流</th>
                  <th class="sub-header">B相流</th>
                  <th class="sub-header">C相流</th>
                  <th class="sub-header">A相压</th>
                  <th class="sub-header">B相压</th>
                  <th class="sub-header">C相压</th>
                  <th class="sub-header">A相流</th>
                  <th class="sub-header">B相流</th>
                  <th class="sub-header">C相流</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="record in filteredRecords"
                  :key="record.time"
                  :class="{ 'current-row': isCurrentTime(record.time) }"
                >
                  <td class="time-cell">{{ record.time }}</td>
                  <!-- 1#变压器 高压侧 -->
                  <td>{{ record.t1HvVoltageA || '-' }}</td>
                  <td>{{ record.t1HvVoltageB || '-' }}</td>
                  <td>{{ record.t1HvVoltageC || '-' }}</td>
                  <td>{{ record.t1HvCurrentA || '-' }}</td>
                  <td>{{ record.t1HvCurrentB || '-' }}</td>
                  <td>{{ record.t1HvCurrentC || '-' }}</td>
                  <td class="power-cell">{{ record.t1HvActivePower || '-' }}</td>
                  <td class="power-cell">{{ record.t1HvReactivePower || '-' }}</td>
                  <!-- 1#变压器 低压侧 -->
                  <td>{{ record.t1LvVoltageA || '-' }}</td>
                  <td>{{ record.t1LvVoltageB || '-' }}</td>
                  <td>{{ record.t1LvVoltageC || '-' }}</td>
                  <td>{{ record.t1LvCurrentA || '-' }}</td>
                  <td>{{ record.t1LvCurrentB || '-' }}</td>
                  <td>{{ record.t1LvCurrentC || '-' }}</td>
                  <td :class="getCellClass(record.t1Temp, 'temp')">{{ record.t1Temp || '-' }}</td>
                  <td class="power-cell">{{ record.t1LvActivePower || '-' }}</td>
                  <td class="power-cell">{{ record.t1LvReactivePower || '-' }}</td>
                  <!-- 2#变压器 高压侧 -->
                  <td>{{ record.t2HvVoltageA || '-' }}</td>
                  <td>{{ record.t2HvVoltageB || '-' }}</td>
                  <td>{{ record.t2HvVoltageC || '-' }}</td>
                  <td>{{ record.t2HvCurrentA || '-' }}</td>
                  <td>{{ record.t2HvCurrentB || '-' }}</td>
                  <td>{{ record.t2HvCurrentC || '-' }}</td>
                  <td class="power-cell">{{ record.t2HvActivePower || '-' }}</td>
                  <td class="power-cell">{{ record.t2HvReactivePower || '-' }}</td>
                  <!-- 2#变压器 低压侧 -->
                  <td>{{ record.t2LvVoltageA || '-' }}</td>
                  <td>{{ record.t2LvVoltageB || '-' }}</td>
                  <td>{{ record.t2LvVoltageC || '-' }}</td>
                  <td>{{ record.t2LvCurrentA || '-' }}</td>
                  <td>{{ record.t2LvCurrentB || '-' }}</td>
                  <td>{{ record.t2LvCurrentC || '-' }}</td>
                  <td :class="getCellClass(record.t2Temp, 'temp')">{{ record.t2Temp || '-' }}</td>
                  <td class="power-cell">{{ record.t2LvActivePower || '-' }}</td>
                  <td class="power-cell">{{ record.t2LvReactivePower || '-' }}</td>
                  <!-- 环境与状态 -->
                  <td :class="getCellClass(record.envTemp, 'envTemp')">{{ record.envTemp || '-' }}</td>
                  <td :class="getCellClass(record.envHumidity, 'humidity')">{{ record.envHumidity || '-' }}</td>
                  <td class="status-cell">
                    <span v-if="record.safetyEquipment === 'normal'" class="status-icon normal">✓</span>
                    <span v-else-if="record.safetyEquipment === 'warning'" class="status-icon warning">!</span>
                    <span v-else-if="record.safetyEquipment === 'error'" class="status-icon error">✕</span>
                    <span v-else class="status-icon pending">-</span>
                  </td>
                  <td class="status-cell">
                    <span v-if="record.fireEquipment === 'normal'" class="status-icon normal">✓</span>
                    <span v-else-if="record.fireEquipment === 'warning'" class="status-icon warning">!</span>
                    <span v-else-if="record.fireEquipment === 'error'" class="status-icon error">✕</span>
                    <span v-else class="status-icon pending">-</span>
                  </td>
                  <td class="operator-cell">{{ record.operator || '-' }}</td>
                  <td class="remark-cell">
                    <input
                      type="text"
                      v-model="record.remark"
                      class="remark-input"
                      placeholder="点击输入备注"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 统计摘要 -->
        <div class="stats-summary">
          <div class="summary-card">
            <div class="summary-header">
              <el-icon><TrendCharts /></el-icon>
              <span>今日负荷统计</span>
            </div>
            <div class="summary-body">
              <div class="stat-item">
                <span class="stat-label">最大负荷</span>
                <span class="stat-value highlight">{{ dailyStats.maxLoad }} kW</span>
                <span class="stat-time">{{ dailyStats.maxLoadTime }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">最小负荷</span>
                <span class="stat-value">{{ dailyStats.minLoad }} kW</span>
                <span class="stat-time">{{ dailyStats.minLoadTime }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">平均负荷</span>
                <span class="stat-value">{{ dailyStats.avgLoad }} kW</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">负载率</span>
                <span class="stat-value" :class="getLoadRateClass(dailyStats.loadRate)">{{ dailyStats.loadRate }}%</span>
              </div>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-header">
              <el-icon><Odometer /></el-icon>
              <span>功率因数统计</span>
            </div>
            <div class="summary-body">
              <div class="stat-item">
                <span class="stat-label">最高值</span>
                <span class="stat-value">{{ dailyStats.maxPF }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">最低值</span>
                <span class="stat-value" :class="dailyStats.minPF < 0.9 ? 'warning' : ''">{{ dailyStats.minPF }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">平均值</span>
                <span class="stat-value" :class="dailyStats.avgPF >= 0.9 ? 'good' : 'warning'">{{ dailyStats.avgPF }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">达标情况</span>
                <span class="stat-value" :class="dailyStats.avgPF >= 0.9 ? 'good' : 'warning'">
                  {{ dailyStats.avgPF >= 0.9 ? '达标' : '需优化' }}
                </span>
              </div>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-header">
              <el-icon><Sunny /></el-icon>
              <span>环境参数统计</span>
            </div>
            <div class="summary-body">
              <div class="stat-item">
                <span class="stat-label">温度范围</span>
                <span class="stat-value">{{ dailyStats.tempRange }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">湿度范围</span>
                <span class="stat-value">{{ dailyStats.humidityRange }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">变压器最高温</span>
                <span class="stat-value" :class="dailyStats.maxTransformerTemp > 75 ? 'warning' : ''">
                  {{ dailyStats.maxTransformerTemp }}℃
                </span>
              </div>
              <div class="stat-item">
                <span class="stat-label">环境达标</span>
                <span class="stat-value good">符合标准</span>
              </div>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-header">
              <el-icon><Warning /></el-icon>
              <span>异常记录</span>
            </div>
            <div class="summary-body">
              <div class="stat-item">
                <span class="stat-label">异常次数</span>
                <span class="stat-value" :class="dailyStats.abnormalCount > 0 ? 'warning' : 'good'">
                  {{ dailyStats.abnormalCount }} 次
                </span>
              </div>
              <div class="stat-item">
                <span class="stat-label">告警次数</span>
                <span class="stat-value" :class="dailyStats.warningCount > 0 ? 'warning' : 'good'">
                  {{ dailyStats.warningCount }} 次
                </span>
              </div>
              <div class="stat-item">
                <span class="stat-label">采集完成率</span>
                <span class="stat-value good">{{ dailyStats.completionRate }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">总体状态</span>
                <span class="stat-value good">正常</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 值班信息 -->
        <div class="duty-info-panel">
          <div class="panel-header">
            <span class="panel-title">
              <el-icon><User /></el-icon>
              值班信息
            </span>
          </div>
          <div class="duty-info-content">
            <div class="duty-row">
              <div class="duty-item">
                <span class="duty-label">白班值班人员</span>
                <span class="duty-value">{{ dutyInfo.dayShift.operator }}</span>
              </div>
              <div class="duty-item">
                <span class="duty-label">白班时间</span>
                <span class="duty-value">08:00 - 20:00</span>
              </div>
              <div class="duty-item">
                <span class="duty-label">白班签名</span>
                <span class="duty-value signature">{{ dutyInfo.dayShift.signature || '待签' }}</span>
              </div>
            </div>
            <div class="duty-row">
              <div class="duty-item">
                <span class="duty-label">夜班值班人员</span>
                <span class="duty-value">{{ dutyInfo.nightShift.operator }}</span>
              </div>
              <div class="duty-item">
                <span class="duty-label">夜班时间</span>
                <span class="duty-value">20:00 - 次日08:00</span>
              </div>
              <div class="duty-item">
                <span class="duty-label">夜班签名</span>
                <span class="duty-value signature">{{ dutyInfo.nightShift.signature || '待签' }}</span>
              </div>
            </div>
            <div class="duty-row">
              <div class="duty-item full">
                <span class="duty-label">备注说明</span>
                <span class="duty-value">{{ dutyInfo.remarks || '1. 数据由系统自动采集，每2小时记录一次；2. 异常情况需人工确认并填写备注。' }}</span>
              </div>
            </div>
          </div>
        </div>
        </template>

        <!-- ==================== 列表视图 ==================== -->
        <template v-else>
          <div class="list-view-container">
            <!-- 列表工具栏 -->
            <div class="list-toolbar">
              <div class="toolbar-left">
                <el-input
                  v-model="listSearchKeyword"
                  placeholder="搜索时间、备注..."
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
                  <el-option label="异常" value="error" />
                </el-select>
              </div>
              <div class="toolbar-right">
                <span class="record-count">共 {{ listFilteredRecords.length }} 条记录</span>
              </div>
            </div>

            <!-- 列表卡片 -->
            <div class="list-cards">
              <div
                v-for="record in listFilteredRecords"
                :key="record.time"
                :class="['list-card', getOverallStatus(record), { current: isCurrentTime(record.time) }]"
              >
                <div class="card-header">
                  <div class="card-time">
                    <el-icon><Clock /></el-icon>
                    <span>{{ record.time }}</span>
                  </div>
                  <div :class="['card-status', getOverallStatus(record)]">
                    <span v-if="getOverallStatus(record) === 'normal'">正常</span>
                    <span v-else-if="getOverallStatus(record) === 'warning'">告警</span>
                    <span v-else-if="getOverallStatus(record) === 'error'">异常</span>
                    <span v-else>待采集</span>
                  </div>
                </div>
                <div class="card-body card-body-dual">
                  <!-- 1#变压器 -->
                  <div class="transformer-group">
                    <div class="transformer-title">1#变压器</div>
                    <div class="card-section">
                      <div class="section-title hv">高压侧</div>
                      <div class="section-metrics">
                        <div class="metric">
                          <span class="metric-label">A/B/C相电压</span>
                          <span class="metric-value">{{ record.t1HvVoltageA }}/{{ record.t1HvVoltageB }}/{{ record.t1HvVoltageC }} kV</span>
                        </div>
                        <div class="metric">
                          <span class="metric-label">A/B/C相电流</span>
                          <span class="metric-value">{{ record.t1HvCurrentA }}/{{ record.t1HvCurrentB }}/{{ record.t1HvCurrentC }} A</span>
                        </div>
                        <div class="metric">
                          <span class="metric-label">有功/无功</span>
                          <span class="metric-value highlight">{{ record.t1HvActivePower }}kW / {{ record.t1HvReactivePower }}kVar</span>
                        </div>
                      </div>
                    </div>
                    <div class="card-section">
                      <div class="section-title lv">低压侧</div>
                      <div class="section-metrics">
                        <div class="metric">
                          <span class="metric-label">A/B/C相电压</span>
                          <span class="metric-value">{{ record.t1LvVoltageA }}/{{ record.t1LvVoltageB }}/{{ record.t1LvVoltageC }} V</span>
                        </div>
                        <div class="metric">
                          <span class="metric-label">A/B/C相电流</span>
                          <span class="metric-value highlight">{{ record.t1LvCurrentA }}/{{ record.t1LvCurrentB }}/{{ record.t1LvCurrentC }} A</span>
                        </div>
                        <div class="metric">
                          <span class="metric-label">温度/有功/无功</span>
                          <span class="metric-value highlight">{{ record.t1Temp }}℃ / {{ record.t1LvActivePower }}kW / {{ record.t1LvReactivePower }}kVar</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 2#变压器 -->
                  <div class="transformer-group">
                    <div class="transformer-title">2#变压器</div>
                    <div class="card-section">
                      <div class="section-title hv">高压侧</div>
                      <div class="section-metrics">
                        <div class="metric">
                          <span class="metric-label">A/B/C相电压</span>
                          <span class="metric-value">{{ record.t2HvVoltageA }}/{{ record.t2HvVoltageB }}/{{ record.t2HvVoltageC }} kV</span>
                        </div>
                        <div class="metric">
                          <span class="metric-label">A/B/C相电流</span>
                          <span class="metric-value">{{ record.t2HvCurrentA }}/{{ record.t2HvCurrentB }}/{{ record.t2HvCurrentC }} A</span>
                        </div>
                        <div class="metric">
                          <span class="metric-label">有功/无功</span>
                          <span class="metric-value highlight">{{ record.t2HvActivePower }}kW / {{ record.t2HvReactivePower }}kVar</span>
                        </div>
                      </div>
                    </div>
                    <div class="card-section">
                      <div class="section-title lv">低压侧</div>
                      <div class="section-metrics">
                        <div class="metric">
                          <span class="metric-label">A/B/C相电压</span>
                          <span class="metric-value">{{ record.t2LvVoltageA }}/{{ record.t2LvVoltageB }}/{{ record.t2LvVoltageC }} V</span>
                        </div>
                        <div class="metric">
                          <span class="metric-label">A/B/C相电流</span>
                          <span class="metric-value highlight">{{ record.t2LvCurrentA }}/{{ record.t2LvCurrentB }}/{{ record.t2LvCurrentC }} A</span>
                        </div>
                        <div class="metric">
                          <span class="metric-label">温度/有功/无功</span>
                          <span class="metric-value highlight">{{ record.t2Temp }}℃ / {{ record.t2LvActivePower }}kW / {{ record.t2LvReactivePower }}kVar</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 环境参数 -->
                  <div class="card-section env-section">
                    <div class="section-title env">环境 / 值班</div>
                    <div class="section-metrics">
                      <div class="metric">
                        <span class="metric-label">环境温度</span>
                        <span class="metric-value">{{ record.envTemp || '-' }} ℃</span>
                      </div>
                      <div class="metric">
                        <span class="metric-label">环境湿度</span>
                        <span class="metric-value">{{ record.envHumidity || '-' }} %</span>
                      </div>
                      <div class="metric">
                        <span class="metric-label">值班人</span>
                        <span class="metric-value">{{ record.operator || '-' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card-footer" v-if="record.remark">
                  <el-icon><InfoFilled /></el-icon>
                  <span>{{ record.remark }}</span>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="listFilteredRecords.length === 0" class="empty-state">
              <el-icon><Document /></el-icon>
              <span>暂无符合条件的记录</span>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 导出对话框 -->
    <el-dialog
      v-model="exportDialogVisible"
      title="导出值班记录表"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="export-options">
        <div class="option-group">
          <span class="option-label">导出格式</span>
          <el-radio-group v-model="exportFormat">
            <el-radio label="excel">Excel (.xlsx)</el-radio>
            <el-radio label="pdf">PDF</el-radio>
            <el-radio label="print">直接打印</el-radio>
          </el-radio-group>
        </div>
        <div class="option-group">
          <span class="option-label">导出范围</span>
          <el-radio-group v-model="exportRange">
            <el-radio label="current">当前日期</el-radio>
            <el-radio label="week">本周记录</el-radio>
            <el-radio label="month">本月记录</el-radio>
            <el-radio label="custom">自定义范围</el-radio>
          </el-radio-group>
        </div>
        <div class="option-group" v-if="exportRange === 'custom'">
          <span class="option-label">日期范围</span>
          <el-date-picker
            v-model="exportDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
          />
        </div>
        <div class="option-group">
          <span class="option-label">包含内容</span>
          <el-checkbox-group v-model="exportContent">
            <el-checkbox label="records">运行记录表</el-checkbox>
            <el-checkbox label="stats">统计摘要</el-checkbox>
            <el-checkbox label="duty">值班信息</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <template #footer>
        <button class="action-btn btn-secondary" @click="exportDialogVisible = false">取消</button>
        <button class="action-btn btn-primary" @click="confirmExport">
          <el-icon><Download /></el-icon>
          确认导出
        </button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Document, Refresh, Download, Clock, TrendCharts, Odometer,
  Sunny, Warning, User, List, Search, InfoFilled
} from '@element-plus/icons-vue'

// ========== 基础数据 ==========
const viewMode = ref<'report' | 'list'>('report')
const selectedRoom = ref('room1')
const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedShift = ref('all')
const dataStatus = ref('online')
const exportDialogVisible = ref(false)
const listSearchKeyword = ref('')
const listStatusFilter = ref('')
const exportFormat = ref('excel')
const exportRange = ref('current')
const exportDateRange = ref<[Date, Date] | null>(null)
const exportContent = ref(['records', 'stats', 'duty'])

const rooms = [
  { id: 'room1', name: '圆心科技配电室', code: 'PDR-HDA-001', transformerModel: 'S11-1000/10', capacity: 1000 },
  { id: 'room2', name: '通州数据中心', code: 'PDR-TZA-001', transformerModel: 'S11-2500/10', capacity: 2500 },
  { id: 'room3', name: '北理工配电室', code: 'PDR-HDB-002', transformerModel: 'S11-630/10', capacity: 630 }
]

const currentRoom = computed(() => rooms.find(r => r.id === selectedRoom.value))

// ========== 记录数据类型 ==========
interface DutyRecord {
  time: string
  // 1#变压器 高压侧
  t1HvVoltageA: number
  t1HvVoltageB: number
  t1HvVoltageC: number
  t1HvCurrentA: number
  t1HvCurrentB: number
  t1HvCurrentC: number
  t1HvActivePower: number
  t1HvReactivePower: number
  // 1#变压器 低压侧
  t1LvVoltageA: number
  t1LvVoltageB: number
  t1LvVoltageC: number
  t1LvCurrentA: number
  t1LvCurrentB: number
  t1LvCurrentC: number
  t1Temp: number
  t1LvActivePower: number
  t1LvReactivePower: number
  // 2#变压器 高压侧
  t2HvVoltageA: number
  t2HvVoltageB: number
  t2HvVoltageC: number
  t2HvCurrentA: number
  t2HvCurrentB: number
  t2HvCurrentC: number
  t2HvActivePower: number
  t2HvReactivePower: number
  // 2#变压器 低压侧
  t2LvVoltageA: number
  t2LvVoltageB: number
  t2LvVoltageC: number
  t2LvCurrentA: number
  t2LvCurrentB: number
  t2LvCurrentC: number
  t2Temp: number
  t2LvActivePower: number
  t2LvReactivePower: number
  // 环境与状态
  envTemp: number
  envHumidity: number
  safetyEquipment: string  // 安全用具
  fireEquipment: string    // 消防器材
  operator: string
  remark: string
}

// ========== 记录数据（2小时一次，共12条） ==========
const dutyRecords = ref<DutyRecord[]>([
  {
    time: '00:00',
    t1HvVoltageA: 10.35, t1HvVoltageB: 10.36, t1HvVoltageC: 10.34, t1HvCurrentA: 28.5, t1HvCurrentB: 27.8, t1HvCurrentC: 29.2, t1HvActivePower: 480, t1HvReactivePower: 185,
    t1LvVoltageA: 392, t1LvVoltageB: 394, t1LvVoltageC: 391, t1LvCurrentA: 162, t1LvCurrentB: 158, t1LvCurrentC: 165, t1Temp: 42, t1LvActivePower: 185, t1LvReactivePower: 72,
    t2HvVoltageA: 10.38, t2HvVoltageB: 10.39, t2HvVoltageC: 10.37, t2HvCurrentA: 25.2, t2HvCurrentB: 24.8, t2HvCurrentC: 25.6, t2HvActivePower: 430, t2HvReactivePower: 162,
    t2LvVoltageA: 395, t2LvVoltageB: 396, t2LvVoltageC: 394, t2LvCurrentA: 145, t2LvCurrentB: 142, t2LvCurrentC: 148, t2Temp: 40, t2LvActivePower: 165, t2LvReactivePower: 58,
    envTemp: 22, envHumidity: 48, safetyEquipment: 'normal', fireEquipment: 'normal', operator: '李工', remark: ''
  },
  {
    time: '02:00',
    t1HvVoltageA: 10.38, t1HvVoltageB: 10.39, t1HvVoltageC: 10.37, t1HvCurrentA: 26.8, t1HvCurrentB: 26.2, t1HvCurrentC: 27.4, t1HvActivePower: 455, t1HvReactivePower: 170,
    t1LvVoltageA: 394, t1LvVoltageB: 396, t1LvVoltageC: 393, t1LvCurrentA: 153, t1LvCurrentB: 150, t1LvCurrentC: 155, t1Temp: 40, t1LvActivePower: 175, t1LvReactivePower: 65,
    t2HvVoltageA: 10.40, t2HvVoltageB: 10.41, t2HvVoltageC: 10.39, t2HvCurrentA: 24.5, t2HvCurrentB: 24.0, t2HvCurrentC: 25.0, t2HvActivePower: 415, t2HvReactivePower: 155,
    t2LvVoltageA: 396, t2LvVoltageB: 398, t2LvVoltageC: 395, t2LvCurrentA: 140, t2LvCurrentB: 138, t2LvCurrentC: 142, t2Temp: 38, t2LvActivePower: 158, t2LvReactivePower: 52,
    envTemp: 21, envHumidity: 49, safetyEquipment: 'normal', fireEquipment: 'normal', operator: '李工', remark: ''
  },
  {
    time: '04:00',
    t1HvVoltageA: 10.42, t1HvVoltageB: 10.43, t1HvVoltageC: 10.41, t1HvCurrentA: 24.2, t1HvCurrentB: 23.6, t1HvCurrentC: 24.8, t1HvActivePower: 410, t1HvReactivePower: 158,
    t1LvVoltageA: 396, t1LvVoltageB: 398, t1LvVoltageC: 395, t1LvCurrentA: 138, t1LvCurrentB: 135, t1LvCurrentC: 139, t1Temp: 38, t1LvActivePower: 158, t1LvReactivePower: 55,
    t2HvVoltageA: 10.44, t2HvVoltageB: 10.45, t2HvVoltageC: 10.43, t2HvCurrentA: 22.8, t2HvCurrentB: 22.3, t2HvCurrentC: 23.3, t2HvActivePower: 385, t2HvReactivePower: 148,
    t2LvVoltageA: 398, t2LvVoltageB: 400, t2LvVoltageC: 397, t2LvCurrentA: 130, t2LvCurrentB: 128, t2LvCurrentC: 132, t2Temp: 36, t2LvActivePower: 148, t2LvReactivePower: 48,
    envTemp: 20, envHumidity: 50, safetyEquipment: 'normal', fireEquipment: 'normal', operator: '李工', remark: ''
  },
  {
    time: '06:00',
    t1HvVoltageA: 10.38, t1HvVoltageB: 10.39, t1HvVoltageC: 10.37, t1HvCurrentA: 32.5, t1HvCurrentB: 31.8, t1HvCurrentC: 33.2, t1HvActivePower: 550, t1HvReactivePower: 218,
    t1LvVoltageA: 393, t1LvVoltageB: 395, t1LvVoltageC: 392, t1LvCurrentA: 186, t1LvCurrentB: 182, t1LvCurrentC: 188, t1Temp: 45, t1LvActivePower: 212, t1LvReactivePower: 85,
    t2HvVoltageA: 10.40, t2HvVoltageB: 10.41, t2HvVoltageC: 10.39, t2HvCurrentA: 30.2, t2HvCurrentB: 29.6, t2HvCurrentC: 30.8, t2HvActivePower: 510, t2HvReactivePower: 198,
    t2LvVoltageA: 395, t2LvVoltageB: 397, t2LvVoltageC: 394, t2LvCurrentA: 172, t2LvCurrentB: 170, t2LvCurrentC: 175, t2Temp: 43, t2LvActivePower: 195, t2LvReactivePower: 72,
    envTemp: 21, envHumidity: 48, safetyEquipment: 'normal', fireEquipment: 'normal', operator: '李工', remark: ''
  },
  {
    time: '08:00',
    t1HvVoltageA: 10.32, t1HvVoltageB: 10.33, t1HvVoltageC: 10.31, t1HvCurrentA: 52.8, t1HvCurrentB: 51.5, t1HvCurrentC: 54.1, t1HvActivePower: 880, t1HvReactivePower: 365,
    t1LvVoltageA: 388, t1LvVoltageB: 390, t1LvVoltageC: 387, t1LvCurrentA: 298, t1LvCurrentB: 295, t1LvCurrentC: 302, t1Temp: 58, t1LvActivePower: 338, t1LvReactivePower: 142,
    t2HvVoltageA: 10.34, t2HvVoltageB: 10.35, t2HvVoltageC: 10.33, t2HvCurrentA: 48.5, t2HvCurrentB: 47.3, t2HvCurrentC: 49.7, t2HvActivePower: 815, t2HvReactivePower: 328,
    t2LvVoltageA: 390, t2LvVoltageB: 392, t2LvVoltageC: 389, t2LvCurrentA: 275, t2LvCurrentB: 272, t2LvCurrentC: 278, t2Temp: 55, t2LvActivePower: 312, t2LvReactivePower: 125,
    envTemp: 23, envHumidity: 45, safetyEquipment: 'normal', fireEquipment: 'normal', operator: '张工', remark: ''
  },
  {
    time: '10:00',
    t1HvVoltageA: 10.28, t1HvVoltageB: 10.29, t1HvVoltageC: 10.27, t1HvCurrentA: 68.5, t1HvCurrentB: 66.8, t1HvCurrentC: 70.2, t1HvActivePower: 1140, t1HvReactivePower: 478,
    t1LvVoltageA: 385, t1LvVoltageB: 387, t1LvVoltageC: 384, t1LvCurrentA: 386, t1LvCurrentB: 382, t1LvCurrentC: 390, t1Temp: 65, t1LvActivePower: 438, t1LvReactivePower: 185,
    t2HvVoltageA: 10.30, t2HvVoltageB: 10.31, t2HvVoltageC: 10.29, t2HvCurrentA: 62.3, t2HvCurrentB: 60.8, t2HvCurrentC: 63.8, t2HvActivePower: 1045, t2HvReactivePower: 432,
    t2LvVoltageA: 387, t2LvVoltageB: 389, t2LvVoltageC: 386, t2LvCurrentA: 355, t2LvCurrentB: 352, t2LvCurrentC: 358, t2Temp: 62, t2LvActivePower: 402, t2LvReactivePower: 165,
    envTemp: 25, envHumidity: 42, safetyEquipment: 'normal', fireEquipment: 'normal', operator: '张工', remark: ''
  },
  {
    time: '12:00',
    t1HvVoltageA: 10.26, t1HvVoltageB: 10.27, t1HvVoltageC: 10.25, t1HvCurrentA: 72.3, t1HvCurrentB: 70.5, t1HvCurrentC: 74.1, t1HvActivePower: 1210, t1HvReactivePower: 515,
    t1LvVoltageA: 384, t1LvVoltageB: 386, t1LvVoltageC: 383, t1LvCurrentA: 408, t1LvCurrentB: 405, t1LvCurrentC: 412, t1Temp: 68, t1LvActivePower: 465, t1LvReactivePower: 198,
    t2HvVoltageA: 10.28, t2HvVoltageB: 10.29, t2HvVoltageC: 10.27, t2HvCurrentA: 66.8, t2HvCurrentB: 65.2, t2HvCurrentC: 68.4, t2HvActivePower: 1115, t2HvReactivePower: 465,
    t2LvVoltageA: 386, t2LvVoltageB: 388, t2LvVoltageC: 385, t2LvCurrentA: 378, t2LvCurrentB: 375, t2LvCurrentC: 380, t2Temp: 65, t2LvActivePower: 428, t2LvReactivePower: 178,
    envTemp: 26, envHumidity: 40, safetyEquipment: 'normal', fireEquipment: 'normal', operator: '张工', remark: ''
  },
  {
    time: '14:00',
    t1HvVoltageA: 10.24, t1HvVoltageB: 10.25, t1HvVoltageC: 10.23, t1HvCurrentA: 78.6, t1HvCurrentB: 76.5, t1HvCurrentC: 80.7, t1HvActivePower: 1315, t1HvReactivePower: 565,
    t1LvVoltageA: 382, t1LvVoltageB: 384, t1LvVoltageC: 381, t1LvCurrentA: 445, t1LvCurrentB: 440, t1LvCurrentC: 447, t1Temp: 72, t1LvActivePower: 505, t1LvReactivePower: 218,
    t2HvVoltageA: 10.26, t2HvVoltageB: 10.27, t2HvVoltageC: 10.25, t2HvCurrentA: 72.5, t2HvCurrentB: 70.8, t2HvCurrentC: 74.2, t2HvActivePower: 1210, t2HvReactivePower: 508,
    t2LvVoltageA: 384, t2LvVoltageB: 386, t2LvVoltageC: 383, t2LvCurrentA: 410, t2LvCurrentB: 408, t2LvCurrentC: 412, t2Temp: 69, t2LvActivePower: 465, t2LvReactivePower: 195,
    envTemp: 27, envHumidity: 38, safetyEquipment: 'normal', fireEquipment: 'warning', operator: '张工', remark: '灭火器需检查'
  },
  {
    time: '16:00',
    t1HvVoltageA: 10.28, t1HvVoltageB: 10.29, t1HvVoltageC: 10.27, t1HvCurrentA: 71.2, t1HvCurrentB: 69.5, t1HvCurrentC: 72.9, t1HvActivePower: 1190, t1HvReactivePower: 498,
    t1LvVoltageA: 385, t1LvVoltageB: 387, t1LvVoltageC: 384, t1LvCurrentA: 402, t1LvCurrentB: 398, t1LvCurrentC: 406, t1Temp: 69, t1LvActivePower: 458, t1LvReactivePower: 192,
    t2HvVoltageA: 10.30, t2HvVoltageB: 10.31, t2HvVoltageC: 10.29, t2HvCurrentA: 65.8, t2HvCurrentB: 64.2, t2HvCurrentC: 67.4, t2HvActivePower: 1098, t2HvReactivePower: 448,
    t2LvVoltageA: 387, t2LvVoltageB: 389, t2LvVoltageC: 386, t2LvCurrentA: 372, t2LvCurrentB: 370, t2LvCurrentC: 375, t2Temp: 66, t2LvActivePower: 422, t2LvReactivePower: 172,
    envTemp: 26, envHumidity: 40, safetyEquipment: 'normal', fireEquipment: 'normal', operator: '张工', remark: ''
  },
  {
    time: '18:00',
    t1HvVoltageA: 10.32, t1HvVoltageB: 10.33, t1HvVoltageC: 10.31, t1HvCurrentA: 62.5, t1HvCurrentB: 61.0, t1HvCurrentC: 64.0, t1HvActivePower: 1045, t1HvReactivePower: 435,
    t1LvVoltageA: 388, t1LvVoltageB: 390, t1LvVoltageC: 387, t1LvCurrentA: 353, t1LvCurrentB: 350, t1LvCurrentC: 355, t1Temp: 63, t1LvActivePower: 402, t1LvReactivePower: 168,
    t2HvVoltageA: 10.34, t2HvVoltageB: 10.35, t2HvVoltageC: 10.33, t2HvCurrentA: 58.2, t2HvCurrentB: 56.8, t2HvCurrentC: 59.6, t2HvActivePower: 972, t2HvReactivePower: 395,
    t2LvVoltageA: 390, t2LvVoltageB: 392, t2LvVoltageC: 389, t2LvCurrentA: 328, t2LvCurrentB: 325, t2LvCurrentC: 330, t2Temp: 60, t2LvActivePower: 372, t2LvReactivePower: 152,
    envTemp: 25, envHumidity: 43, safetyEquipment: 'normal', fireEquipment: 'normal', operator: '张工', remark: ''
  },
  {
    time: '20:00',
    t1HvVoltageA: 10.35, t1HvVoltageB: 10.36, t1HvVoltageC: 10.34, t1HvCurrentA: 48.2, t1HvCurrentB: 47.0, t1HvCurrentC: 49.4, t1HvActivePower: 808, t1HvReactivePower: 332,
    t1LvVoltageA: 391, t1LvVoltageB: 393, t1LvVoltageC: 390, t1LvCurrentA: 273, t1LvCurrentB: 270, t1LvCurrentC: 275, t1Temp: 55, t1LvActivePower: 312, t1LvReactivePower: 128,
    t2HvVoltageA: 10.37, t2HvVoltageB: 10.38, t2HvVoltageC: 10.36, t2HvCurrentA: 44.5, t2HvCurrentB: 43.4, t2HvCurrentC: 45.6, t2HvActivePower: 745, t2HvReactivePower: 298,
    t2LvVoltageA: 393, t2LvVoltageB: 395, t2LvVoltageC: 392, t2LvCurrentA: 252, t2LvCurrentB: 250, t2LvCurrentC: 255, t2Temp: 52, t2LvActivePower: 285, t2LvReactivePower: 115,
    envTemp: 24, envHumidity: 45, safetyEquipment: 'normal', fireEquipment: 'normal', operator: '李工', remark: ''
  },
  {
    time: '22:00',
    t1HvVoltageA: 10.38, t1HvVoltageB: 10.39, t1HvVoltageC: 10.37, t1HvCurrentA: 35.8, t1HvCurrentB: 34.9, t1HvCurrentC: 36.7, t1HvActivePower: 602, t1HvReactivePower: 248,
    t1LvVoltageA: 393, t1LvVoltageB: 395, t1LvVoltageC: 392, t1LvCurrentA: 203, t1LvCurrentB: 200, t1LvCurrentC: 205, t1Temp: 48, t1LvActivePower: 232, t1LvReactivePower: 95,
    t2HvVoltageA: 10.40, t2HvVoltageB: 10.41, t2HvVoltageC: 10.39, t2HvCurrentA: 32.5, t2HvCurrentB: 31.7, t2HvCurrentC: 33.3, t2HvActivePower: 548, t2HvReactivePower: 218,
    t2LvVoltageA: 395, t2LvVoltageB: 397, t2LvVoltageC: 394, t2LvCurrentA: 185, t2LvCurrentB: 182, t2LvCurrentC: 188, t2Temp: 45, t2LvActivePower: 210, t2LvReactivePower: 82,
    envTemp: 23, envHumidity: 47, safetyEquipment: 'normal', fireEquipment: 'normal', operator: '李工', remark: ''
  }
])

const getHourFromTime = (time: string): number => {
  return parseInt(time.split(':')[0])
}

const filteredRecords = computed((): DutyRecord[] => {
  if (selectedShift.value === 'all') return dutyRecords.value
  if (selectedShift.value === 'day') {
    return dutyRecords.value.filter(r => {
      const hour = getHourFromTime(r.time)
      return hour >= 8 && hour < 20
    })
  }
  if (selectedShift.value === 'night') {
    return dutyRecords.value.filter(r => {
      const hour = getHourFromTime(r.time)
      return hour >= 20 || hour < 8
    })
  }
  return dutyRecords.value
})

// ========== 列表视图筛选 ==========
// 获取综合状态（基于安全用具和消防器材）- 用于计算属性
const getRecordStatus = (record: DutyRecord) => {
  if (record.safetyEquipment === 'error' || record.fireEquipment === 'error') {
    return 'error'
  }
  if (record.safetyEquipment === 'warning' || record.fireEquipment === 'warning') {
    return 'warning'
  }
  return 'normal'
}

const listFilteredRecords = computed((): DutyRecord[] => {
  return filteredRecords.value.filter(record => {
    const matchKeyword = !listSearchKeyword.value ||
      record.time.includes(listSearchKeyword.value) ||
      (record.remark && record.remark.includes(listSearchKeyword.value))
    const matchStatus = !listStatusFilter.value || getRecordStatus(record) === listStatusFilter.value
    return matchKeyword && matchStatus
  })
})

// ========== 统计数据 ==========
const dailyStats = ref({
  maxLoad: 856,
  maxLoadTime: '14:00',
  minLoad: 285,
  minLoadTime: '04:00',
  avgLoad: 561,
  loadRate: 56.1,
  maxPF: 0.935,
  minPF: 0.905,
  avgPF: 0.920,
  tempRange: '20℃ ~ 27℃',
  humidityRange: '38% ~ 50%',
  maxTransformerTemp: 72,
  abnormalCount: 0,
  warningCount: 1,
  completionRate: 100
})

// ========== 值班信息 ==========
const dutyInfo = ref({
  dayShift: {
    operator: '张工',
    signature: '张伟'
  },
  nightShift: {
    operator: '李工',
    signature: ''
  },
  remarks: '1. 数据由系统自动采集，每2小时记录一次；2. 14:00时段负荷较高，已加强监控。'
})

// ========== 辅助函数 ==========
const isCurrentTime = (time: string) => {
  const now = new Date()
  const currentHour = now.getHours()
  const recordHour = getHourFromTime(time)
  // 当前时间在该记录时段内（2小时范围）
  return currentHour >= recordHour && currentHour < recordHour + 2
}

// 获取综合状态（基于安全用具和消防器材）
const getOverallStatus = (record: DutyRecord) => {
  if (record.safetyEquipment === 'error' || record.fireEquipment === 'error') {
    return 'error'
  }
  if (record.safetyEquipment === 'warning' || record.fireEquipment === 'warning') {
    return 'warning'
  }
  return 'normal'
}

const getCellClass = (value: number | undefined, type: string) => {
  if (!value) return ''

  const thresholds: Record<string, { warning: number; danger: number; reverse?: boolean }> = {
    hvVoltage: { warning: 10600, danger: 10800 },
    hvCurrent: { warning: 80, danger: 100 },
    lvVoltage: { warning: 380, danger: 370, reverse: true },
    lvCurrent: { warning: 1400, danger: 1600 },
    temp: { warning: 75, danger: 85 },
    pf: { warning: 0.9, danger: 0.85, reverse: true },
    envTemp: { warning: 35, danger: 40 },
    humidity: { warning: 70, danger: 80 }
  }

  const threshold = thresholds[type]
  if (!threshold) return ''

  if (threshold.reverse) {
    if (value < threshold.danger) return 'cell-danger'
    if (value < threshold.warning) return 'cell-warning'
  } else {
    if (value > threshold.danger) return 'cell-danger'
    if (value > threshold.warning) return 'cell-warning'
  }

  return ''
}

const getLoadRateClass = (rate: number) => {
  if (rate > 80) return 'warning'
  if (rate > 90) return 'danger'
  return ''
}

const refreshData = () => {
  ElMessage.success('数据刷新成功')
}

const exportRecord = () => {
  exportDialogVisible.value = true
}

const confirmExport = () => {
  ElMessage.success(`${exportFormat.value === 'excel' ? 'Excel报表' : exportFormat.value === 'pdf' ? 'PDF文件' : '打印任务'}已生成`)
  exportDialogVisible.value = false
}

// 模拟数据更新
let timer: number | null = null

onMounted(() => {
  timer = window.setInterval(() => {
    // 模拟实时数据更新
  }, 60000)
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

.duty-record-page {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px 20px 24px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: var(--tech-primary);
}

.standard-ref {
  font-size: 12px;
  color: var(--text-muted);
  padding: 4px 12px;
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 视图切换按钮 */
.view-switch {
  display: flex;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  padding: 2px;
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

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 0 24px 24px;
  gap: 20px;
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

/* 记录表信息头 */
.record-info-header {
  background: rgba(0, 240, 255, 0.05);
  border: 1px solid rgba(0, 240, 255, 0.2);
  padding: 16px 20px;
}

.info-row {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-label {
  font-size: 12px;
  color: var(--text-sub);
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-bright);
}

.info-value.status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.info-value.status.online .status-dot {
  background: var(--status-success);
}

.info-value.status.offline .status-dot {
  background: var(--status-danger);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 记录表格面板 */
.record-table-panel {
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

.panel-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-sub);
}

.legend-item .dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.legend-item.normal .dot { background: var(--status-success); }
.legend-item.warning .dot { background: var(--status-warning); }
.legend-item.danger .dot { background: var(--status-danger); }

/* 表格容器 */
.table-container {
  overflow-x: auto;
  padding: 16px;
}

.record-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.record-table th,
.record-table td {
  padding: 10px 12px;
  text-align: center;
  border: 1px solid rgba(0, 240, 255, 0.15);
}

.record-table th {
  background: rgba(0, 240, 255, 0.08);
  color: var(--tech-primary);
  font-weight: 600;
  white-space: nowrap;
}

.group-header.hv { background: rgba(255, 107, 107, 0.15); color: #ff6b6b; }
.group-header.lv { background: rgba(0, 230, 118, 0.15); color: var(--status-success); }
.group-header.env { background: rgba(96, 165, 250, 0.15); color: #60a5fa; }
.group-header.transformer1 { background: rgba(255, 165, 0, 0.15); color: #ffa500; }
.group-header.transformer2 { background: rgba(138, 43, 226, 0.15); color: #a78bfa; }

.temp-col, .env-col, .power-col {
  font-size: 11px !important;
}

.power-cell {
  color: var(--tech-primary) !important;
  font-weight: 600;
}

.sub-header {
  background: rgba(0, 240, 255, 0.05) !important;
  font-size: 11px !important;
}

.record-table td {
  background: rgba(0, 0, 0, 0.2);
  color: var(--text-bright);
  font-family: 'DIN Alternate', monospace;
}

.record-table tr:hover td {
  background: rgba(0, 240, 255, 0.08);
}

.record-table tr.current-row td {
  background: rgba(0, 240, 255, 0.15);
  border-color: var(--tech-primary);
}

.time-col {
  width: 70px;
}

.time-cell {
  font-weight: 600;
  color: var(--tech-primary) !important;
}

.remark-col {
  min-width: 120px;
}

.remark-cell {
  font-size: 11px;
  color: var(--text-sub) !important;
  text-align: left !important;
  padding: 4px 8px !important;
}

.remark-input {
  width: 100%;
  min-width: 100px;
  padding: 6px 8px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  color: var(--text-bright);
  font-size: 11px;
  outline: none;
  transition: all 0.2s;
}

.remark-input:hover {
  border-color: rgba(0, 240, 255, 0.4);
}

.remark-input:focus {
  border-color: var(--tech-primary);
  background: rgba(0, 240, 255, 0.05);
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.2);
}

.remark-input::placeholder {
  color: var(--text-muted);
  font-size: 10px;
}

.operator-cell {
  font-size: 12px;
  color: var(--tech-primary) !important;
  white-space: nowrap;
}

.cell-warning {
  background: rgba(255, 214, 0, 0.2) !important;
  color: var(--status-warning) !important;
}

.cell-danger {
  background: rgba(255, 46, 99, 0.2) !important;
  color: var(--status-danger) !important;
}

.status-cell {
  width: 60px;
}

.status-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  font-weight: 700;
}

.status-icon.normal { background: rgba(0, 230, 118, 0.2); color: var(--status-success); }
.status-icon.warning { background: rgba(255, 214, 0, 0.2); color: var(--status-warning); }
.status-icon.error { background: rgba(255, 46, 99, 0.2); color: var(--status-danger); }
.status-icon.pending { background: rgba(255, 255, 255, 0.1); color: var(--text-muted); }

/* 统计摘要 */
.stats-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.summary-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  font-size: 13px;
  font-weight: 600;
  color: var(--tech-primary);
}

.summary-body {
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 11px;
  color: var(--text-sub);
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-bright);
  font-family: 'DIN Alternate', sans-serif;
}

.stat-value.highlight { color: var(--tech-primary); }
.stat-value.good { color: var(--status-success); }
.stat-value.warning { color: var(--status-warning); }
.stat-value.danger { color: var(--status-danger); }

.stat-time {
  font-size: 10px;
  color: var(--text-muted);
}

/* 值班信息 */
.duty-info-panel {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.duty-info-content {
  padding: 16px 20px;
}

.duty-row {
  display: flex;
  gap: 32px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
}

.duty-row:last-child {
  border-bottom: none;
}

.duty-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
}

.duty-item.full {
  flex: 1;
}

.duty-label {
  font-size: 12px;
  color: var(--text-sub);
  white-space: nowrap;
}

.duty-value {
  font-size: 14px;
  color: var(--text-bright);
}

.duty-value.signature {
  color: var(--tech-primary);
  font-style: italic;
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
.content-wrapper::-webkit-scrollbar,
.table-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.content-wrapper::-webkit-scrollbar-track,
.table-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

.content-wrapper::-webkit-scrollbar-thumb,
.table-container::-webkit-scrollbar-thumb {
  background: rgba(0, 240, 255, 0.2);
}

.content-wrapper::-webkit-scrollbar-thumb:hover,
.table-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 240, 255, 0.3);
}

/* ==================== 列表视图样式 ==================== */
.list-view-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
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
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 16px;
  flex: 1;
  overflow-y: auto;
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

.list-card.current {
  border-color: var(--tech-primary);
  background: rgba(0, 240, 255, 0.05);
}

.list-card.warning {
  border-left: 3px solid var(--status-warning);
}

.list-card.error {
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

.card-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: var(--tech-primary);
  font-family: 'DIN Alternate', monospace;
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

.card-status.error {
  background: rgba(255, 46, 99, 0.15);
  color: var(--status-danger);
}

.list-card .card-body {
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.list-card .card-body-dual {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
}

.transformer-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.transformer-title {
  font-size: 12px;
  font-weight: 700;
  padding: 6px 10px;
  background: rgba(0, 240, 255, 0.1);
  border-left: 3px solid var(--tech-primary);
  color: var(--tech-primary);
}

.transformer-group:first-child .transformer-title {
  border-left-color: #ffa500;
  color: #ffa500;
}

.transformer-group:nth-child(2) .transformer-title {
  border-left-color: #a78bfa;
  color: #a78bfa;
}

.env-section {
  grid-column: 1 / -1;
}

.card-section {
  background: rgba(0, 0, 0, 0.2);
  padding: 12px;
}

.section-title {
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-title.hv { color: #ff6b6b; }
.section-title.lv { color: var(--status-success); }
.section-title.power { color: var(--tech-primary); }
.section-title.env { color: #60a5fa; }

.section-metrics {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  font-size: 11px;
  color: var(--text-muted);
}

.metric-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-bright);
  font-family: 'DIN Alternate', monospace;
}

.metric-value.highlight {
  color: var(--tech-primary);
}

.metric-value.warning {
  color: var(--status-warning);
}

.list-card .card-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 214, 0, 0.05);
  border-top: 1px solid rgba(255, 214, 0, 0.2);
  font-size: 12px;
  color: var(--status-warning);
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

/* 导出对话框 */
.export-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-bright);
}
</style>

<style>
/* Element Plus 组件样式覆盖 */
.duty-record-page .el-select__wrapper {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 240, 255, 0.2);
  box-shadow: none;
}

.duty-record-page .el-date-editor {
  --el-input-bg-color: rgba(0, 0, 0, 0.3);
  --el-input-border-color: rgba(0, 240, 255, 0.2);
}

.duty-record-page .el-dialog {
  background: rgba(13, 18, 26, 0.95);
  border: 1px solid rgba(0, 240, 255, 0.3);
}

.duty-record-page .el-dialog__header {
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
}

.duty-record-page .el-dialog__title {
  color: var(--tech-primary);
}

.duty-record-page .el-radio__label,
.duty-record-page .el-checkbox__label {
  color: var(--text-sub);
}

.duty-record-page .el-radio__input.is-checked .el-radio__inner {
  border-color: var(--tech-primary);
  background: var(--tech-primary);
}

.duty-record-page .el-checkbox__input.is-checked .el-checkbox__inner {
  border-color: var(--tech-primary);
  background: var(--tech-primary);
}

.duty-record-page .el-dialog__footer {
  border-top: 1px solid rgba(0, 240, 255, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
