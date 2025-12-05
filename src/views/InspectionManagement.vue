<template>
  <div class="inspection-page">
    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 页面标题区 -->
      <div class="page-header">
        <div class="main-tabs-container">
          <div class="main-tabs">
            <div
              :class="['main-tab-item', { active: activeMainTab === 'tasks' }]"
              @click="activeMainTab = 'tasks'"
            >
              巡检任务
            </div>
            <div
              :class="['main-tab-item', { active: activeMainTab === 'records' }]"
              @click="activeMainTab = 'records'"
            >
              巡检记录
            </div>
            <div
              :class="['main-tab-item', { active: activeMainTab === 'plans' }]"
              @click="activeMainTab = 'plans'"
            >
              巡检计划
            </div>
            <div
              :class="['main-tab-item', { active: activeMainTab === 'routes' }]"
              @click="activeMainTab = 'routes'"
            >
              巡检路线
            </div>
            <div
              :class="['main-tab-item', { active: activeMainTab === 'standards' }]"
              @click="activeMainTab = 'standards'"
            >
              巡检标准
            </div>
          </div>

          <!-- 配电室选择 -->
          <div class="header-actions">
            <el-select v-model="selectedRoom" placeholder="选择配电室" style="width: 200px">
              <el-option
                v-for="room in rooms"
                :key="room.id"
                :label="room.name"
                :value="room.id"
              />
            </el-select>
            <el-date-picker
              v-if="activeMainTab === 'records'"
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
        <!-- =============== 巡检任务 =============== -->
        <template v-if="activeMainTab === 'tasks'">
          <!-- 任务统计概览 -->
          <div class="task-overview">
            <div class="stat-card today">
              <div class="stat-icon">
                <el-icon><Calendar /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-label">今日待巡检</div>
                <div class="stat-value">{{ taskStats.todayPending }}</div>
                <div class="stat-sub">任务数</div>
              </div>
            </div>
            <div class="stat-card progress">
              <div class="stat-icon">
                <el-icon><Loading /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-label">进行中</div>
                <div class="stat-value">{{ taskStats.inProgress }}</div>
                <div class="stat-sub">正在执行</div>
              </div>
            </div>
            <div class="stat-card completed">
              <div class="stat-icon">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-label">今日已完成</div>
                <div class="stat-value">{{ taskStats.todayCompleted }}</div>
                <div class="stat-sub">完成率 {{ taskStats.completionRate }}%</div>
              </div>
            </div>
            <div class="stat-card abnormal">
              <div class="stat-icon">
                <el-icon><WarningFilled /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-label">发现异常</div>
                <div class="stat-value">{{ taskStats.abnormalCount }}</div>
                <div class="stat-sub">待处理</div>
              </div>
            </div>
            <div class="stat-card overdue">
              <div class="stat-icon">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-label">超期任务</div>
                <div class="stat-value">{{ taskStats.overdueCount }}</div>
                <div class="stat-sub">需立即处理</div>
              </div>
            </div>
            <div class="stat-card robot">
              <div class="stat-icon">
                <el-icon><Cpu /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-label">机器人巡检</div>
                <div class="stat-value">{{ taskStats.robotTasks }}</div>
                <div class="stat-sub">自动执行</div>
              </div>
            </div>
          </div>

          <!-- 任务列表 -->
          <div class="task-list-panel">
            <div class="panel-header">
              <span class="panel-title">
                <el-icon><List /></el-icon>
                巡检任务列表
              </span>
              <div class="panel-actions">
                <el-radio-group v-model="taskFilter" size="small">
                  <el-radio-button label="all">全部</el-radio-button>
                  <el-radio-button label="pending">待执行</el-radio-button>
                  <el-radio-button label="progress">进行中</el-radio-button>
                  <el-radio-button label="completed">已完成</el-radio-button>
                </el-radio-group>
                <button class="action-btn btn-primary" @click="createTask">
                  <el-icon><Plus /></el-icon>
                  <span>创建任务</span>
                </button>
              </div>
            </div>
            <div class="task-list">
              <div
                v-for="task in filteredTasks"
                :key="task.id"
                :class="['task-card', task.status, { urgent: task.isUrgent }]"
              >
                <div class="task-header">
                  <div class="task-info">
                    <span class="task-type-tag" :class="task.type">{{ getTaskTypeText(task.type) }}</span>
                    <span class="task-name">{{ task.name }}</span>
                    <span v-if="task.isUrgent" class="urgent-tag">紧急</span>
                  </div>
                  <span :class="['task-status-tag', task.status]">{{ getTaskStatusText(task.status) }}</span>
                </div>
                <div class="task-body">
                  <div class="task-detail">
                    <div class="detail-item">
                      <el-icon><Location /></el-icon>
                      <span>{{ task.location }}</span>
                    </div>
                    <div class="detail-item">
                      <el-icon><User /></el-icon>
                      <span>{{ task.assignee || '未分配' }}</span>
                    </div>
                    <div class="detail-item">
                      <el-icon><Clock /></el-icon>
                      <span>{{ task.scheduledTime }}</span>
                    </div>
                    <div class="detail-item">
                      <el-icon><Document /></el-icon>
                      <span>{{ task.checkPoints }} 个检查点</span>
                    </div>
                  </div>
                  <div class="task-progress" v-if="task.status === 'progress'">
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: task.progress + '%' }"></div>
                    </div>
                    <span class="progress-text">{{ task.progress }}%</span>
                  </div>
                </div>
                <div class="task-footer">
                  <div class="task-meta">
                    <span v-if="task.robotAssist" class="robot-tag">
                      <el-icon><Cpu /></el-icon>
                      机器人协助
                    </span>
                    <span class="create-time">创建于 {{ task.createTime }}</span>
                  </div>
                  <div class="task-actions">
                    <button
                      v-if="task.status === 'pending'"
                      class="action-btn btn-primary"
                      @click="startTask(task)"
                    >
                      开始巡检
                    </button>
                    <button
                      v-if="task.status === 'progress'"
                      class="action-btn btn-primary"
                      @click="continueTask(task)"
                    >
                      继续执行
                    </button>
                    <button
                      v-if="task.status === 'completed'"
                      class="action-btn btn-secondary"
                      @click="viewTaskResult(task)"
                    >
                      查看结果
                    </button>
                    <button class="action-btn btn-secondary" @click="viewTaskDetail(task)">
                      详情
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- =============== 巡检记录 =============== -->
        <template v-if="activeMainTab === 'records'">
          <div class="records-panel">
            <!-- 记录统计 -->
            <div class="records-stats">
              <div class="stats-card">
                <div class="stats-label">本月巡检次数</div>
                <div class="stats-value">{{ recordStats.monthTotal }}</div>
              </div>
              <div class="stats-card">
                <div class="stats-label">发现问题数</div>
                <div class="stats-value warning">{{ recordStats.issueCount }}</div>
              </div>
              <div class="stats-card">
                <div class="stats-label">整改完成率</div>
                <div class="stats-value highlight">{{ recordStats.rectifyRate }}%</div>
              </div>
              <div class="stats-card">
                <div class="stats-label">平均巡检时长</div>
                <div class="stats-value">{{ recordStats.avgDuration }}分钟</div>
              </div>
            </div>

            <!-- 记录筛选 -->
            <div class="records-toolbar">
              <div class="filter-group">
                <el-select v-model="recordFilter.type" placeholder="巡检类型" style="width: 140px" clearable>
                  <el-option label="日常巡检" value="daily" />
                  <el-option label="专项巡检" value="special" />
                  <el-option label="夜间巡检" value="night" />
                  <el-option label="机器人巡检" value="robot" />
                </el-select>
                <el-select v-model="recordFilter.result" placeholder="巡检结果" style="width: 140px" clearable>
                  <el-option label="正常" value="normal" />
                  <el-option label="有异常" value="abnormal" />
                </el-select>
              </div>
              <button class="action-btn btn-primary" @click="exportRecords">
                <el-icon><Download /></el-icon>
                <span>导出记录</span>
              </button>
            </div>

            <!-- 记录表格 -->
            <div class="records-table">
              <el-table :data="inspectionRecords" style="width: 100%">
                <el-table-column prop="id" label="记录编号" width="130" />
                <el-table-column prop="taskName" label="巡检任务" min-width="150" />
                <el-table-column prop="type" label="巡检类型" width="100">
                  <template #default="{ row }">
                    <span :class="['type-tag', row.type]">{{ getTaskTypeText(row.type) }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="location" label="巡检位置" width="120" />
                <el-table-column prop="inspector" label="巡检人员" width="100" />
                <el-table-column prop="startTime" label="开始时间" width="160" />
                <el-table-column prop="duration" label="时长(分钟)" width="100" />
                <el-table-column prop="checkCount" label="检查项" width="80" />
                <el-table-column label="结果" width="100">
                  <template #default="{ row }">
                    <span :class="['result-tag', row.result]">
                      {{ row.result === 'normal' ? '正常' : '有异常' }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="issueCount" label="问题数" width="80">
                  <template #default="{ row }">
                    <span :class="{ 'issue-count': row.issueCount > 0 }">{{ row.issueCount }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120" fixed="right">
                  <template #default="{ row }">
                    <el-button link type="primary" size="small" @click="viewRecord(row)">
                      查看详情
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </template>

        <!-- =============== 巡检计划 =============== -->
        <template v-if="activeMainTab === 'plans'">
          <div class="plans-panel">
            <!-- 计划概览 -->
            <div class="plans-overview">
              <div class="plan-card">
                <div class="plan-header">
                  <span class="plan-title">日常巡检计划</span>
                  <span class="plan-status active">执行中</span>
                </div>
                <div class="plan-body">
                  <div class="plan-item">
                    <span class="item-label">执行频次</span>
                    <span class="item-value">每日2次（08:00, 16:00）</span>
                  </div>
                  <div class="plan-item">
                    <span class="item-label">覆盖范围</span>
                    <span class="item-value">全部配电室</span>
                  </div>
                  <div class="plan-item">
                    <span class="item-label">检查项目</span>
                    <span class="item-value">68项</span>
                  </div>
                  <div class="plan-item">
                    <span class="item-label">依据标准</span>
                    <span class="item-value standard">DB11/T 527-2021</span>
                  </div>
                </div>
                <div class="plan-footer">
                  <span class="plan-meta">本月已执行 {{ planStats.dailyExecuted }} 次</span>
                  <button class="action-btn btn-secondary" @click="editPlan('daily')">编辑</button>
                </div>
              </div>

              <div class="plan-card">
                <div class="plan-header">
                  <span class="plan-title">周巡检计划</span>
                  <span class="plan-status active">执行中</span>
                </div>
                <div class="plan-body">
                  <div class="plan-item">
                    <span class="item-label">执行频次</span>
                    <span class="item-value">每周一次（周一 09:00）</span>
                  </div>
                  <div class="plan-item">
                    <span class="item-label">覆盖范围</span>
                    <span class="item-value">主要设备</span>
                  </div>
                  <div class="plan-item">
                    <span class="item-label">检查项目</span>
                    <span class="item-value">126项（含红外测温）</span>
                  </div>
                  <div class="plan-item">
                    <span class="item-label">依据标准</span>
                    <span class="item-value standard">DL/T 596-2021</span>
                  </div>
                </div>
                <div class="plan-footer">
                  <span class="plan-meta">本月已执行 {{ planStats.weeklyExecuted }} 次</span>
                  <button class="action-btn btn-secondary" @click="editPlan('weekly')">编辑</button>
                </div>
              </div>

              <div class="plan-card">
                <div class="plan-header">
                  <span class="plan-title">月度专项巡检</span>
                  <span class="plan-status active">执行中</span>
                </div>
                <div class="plan-body">
                  <div class="plan-item">
                    <span class="item-label">执行频次</span>
                    <span class="item-value">每月1次（1日 10:00）</span>
                  </div>
                  <div class="plan-item">
                    <span class="item-label">覆盖范围</span>
                    <span class="item-value">全部设备+安全设施</span>
                  </div>
                  <div class="plan-item">
                    <span class="item-label">检查项目</span>
                    <span class="item-value">256项（含试验）</span>
                  </div>
                  <div class="plan-item">
                    <span class="item-label">依据标准</span>
                    <span class="item-value standard">GB/T 37931-2019</span>
                  </div>
                </div>
                <div class="plan-footer">
                  <span class="plan-meta">本月已执行 {{ planStats.monthlyExecuted }} 次</span>
                  <button class="action-btn btn-secondary" @click="editPlan('monthly')">编辑</button>
                </div>
              </div>

              <div class="plan-card">
                <div class="plan-header">
                  <span class="plan-title">机器人自动巡检</span>
                  <span class="plan-status active">执行中</span>
                </div>
                <div class="plan-body">
                  <div class="plan-item">
                    <span class="item-label">执行频次</span>
                    <span class="item-value">每4小时一次</span>
                  </div>
                  <div class="plan-item">
                    <span class="item-label">覆盖范围</span>
                    <span class="item-value">可达区域</span>
                  </div>
                  <div class="plan-item">
                    <span class="item-label">检查项目</span>
                    <span class="item-value">红外测温+表计识别+外观</span>
                  </div>
                  <div class="plan-item">
                    <span class="item-label">依据标准</span>
                    <span class="item-value standard">T/CEC 182-2018</span>
                  </div>
                </div>
                <div class="plan-footer">
                  <span class="plan-meta">今日已执行 {{ planStats.robotExecuted }} 次</span>
                  <button class="action-btn btn-secondary" @click="editPlan('robot')">编辑</button>
                </div>
              </div>
            </div>

            <!-- 计划日历 -->
            <div class="plan-calendar-panel">
              <div class="panel-header">
                <span class="panel-title">
                  <el-icon><Calendar /></el-icon>
                  巡检计划日历
                </span>
                <div class="calendar-nav">
                  <button class="nav-btn" @click="prevMonth">&lt;</button>
                  <span class="current-month">{{ currentMonth }}</span>
                  <button class="nav-btn" @click="nextMonth">&gt;</button>
                </div>
              </div>
              <div class="calendar-grid">
                <div class="calendar-header">
                  <span v-for="day in weekDays" :key="day" class="weekday">{{ day }}</span>
                </div>
                <div class="calendar-body">
                  <div
                    v-for="(date, index) in calendarDates"
                    :key="index"
                    :class="['calendar-cell', {
                      'other-month': date.isOtherMonth,
                      'today': date.isToday,
                      'has-task': date.tasks.length > 0
                    }]"
                  >
                    <span class="date-num">{{ date.day }}</span>
                    <div class="date-tasks">
                      <span
                        v-for="task in date.tasks.slice(0, 2)"
                        :key="task.id"
                        :class="['task-dot', task.type]"
                        :title="task.name"
                      ></span>
                      <span v-if="date.tasks.length > 2" class="more-tasks">+{{ date.tasks.length - 2 }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="calendar-legend">
                <span class="legend-item"><span class="legend-dot daily"></span>日常巡检</span>
                <span class="legend-item"><span class="legend-dot special"></span>专项巡检</span>
                <span class="legend-item"><span class="legend-dot robot"></span>机器人巡检</span>
              </div>
            </div>
          </div>
        </template>

        <!-- =============== 巡检路线 =============== -->
        <template v-if="activeMainTab === 'routes'">
          <div class="routes-panel">
            <!-- 路线列表 -->
            <div class="routes-list-panel">
              <div class="panel-header">
                <span class="panel-title">
                  <el-icon><Guide /></el-icon>
                  巡检路线配置
                </span>
                <button class="action-btn btn-primary" @click="createRoute">
                  <el-icon><Plus /></el-icon>
                  <span>新建路线</span>
                </button>
              </div>
              <div class="routes-list">
                <div
                  v-for="route in inspectionRoutes"
                  :key="route.id"
                  :class="['route-card', { active: selectedRoute?.id === route.id }]"
                  @click="selectRoute(route)"
                >
                  <div class="route-header">
                    <span class="route-name">{{ route.name }}</span>
                    <span :class="['route-status', route.status]">
                      {{ route.status === 'active' ? '启用' : '停用' }}
                    </span>
                  </div>
                  <div class="route-info">
                    <div class="info-item">
                      <el-icon><Location /></el-icon>
                      <span>{{ route.pointCount }} 个巡检点</span>
                    </div>
                    <div class="info-item">
                      <el-icon><Clock /></el-icon>
                      <span>预计 {{ route.estimatedTime }} 分钟</span>
                    </div>
                    <div class="info-item">
                      <el-icon><Document /></el-icon>
                      <span>{{ route.checkItems }} 个检查项</span>
                    </div>
                  </div>
                  <div class="route-meta">
                    <span class="use-count">已使用 {{ route.useCount }} 次</span>
                    <span class="update-time">更新于 {{ route.updateTime }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 路线详情 -->
            <div class="route-detail-panel" v-if="selectedRoute">
              <div class="panel-header">
                <span class="panel-title">
                  <el-icon><Position /></el-icon>
                  {{ selectedRoute.name }} - 巡检点配置
                </span>
                <div class="panel-actions">
                  <button class="action-btn btn-secondary" @click="editRoute">
                    <el-icon><Edit /></el-icon>
                    编辑
                  </button>
                  <button class="action-btn btn-primary" @click="testRoute">
                    <el-icon><VideoPlay /></el-icon>
                    模拟执行
                  </button>
                </div>
              </div>
              <div class="route-points">
                <div
                  v-for="(point, index) in selectedRoute.points"
                  :key="point.id"
                  class="route-point"
                >
                  <div class="point-order">{{ index + 1 }}</div>
                  <div class="point-connector" v-if="index < selectedRoute.points.length - 1"></div>
                  <div class="point-content">
                    <div class="point-header">
                      <span class="point-name">{{ point.name }}</span>
                      <span class="point-type">{{ point.deviceType }}</span>
                    </div>
                    <div class="point-checks">
                      <div class="check-item" v-for="check in point.checks" :key="check.id">
                        <el-icon><CircleCheck /></el-icon>
                        <span>{{ check.name }}</span>
                        <span class="check-method">{{ check.method }}</span>
                      </div>
                    </div>
                    <div class="point-meta">
                      <span class="check-count">{{ point.checks.length }} 项检查</span>
                      <span class="estimated-time">约 {{ point.estimatedTime }} 分钟</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- =============== 巡检标准 =============== -->
        <template v-if="activeMainTab === 'standards'">
          <div class="standards-panel">
            <!-- 标准概述 -->
            <div class="standards-overview">
              <div class="standard-card main">
                <div class="standard-icon">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="standard-content">
                  <div class="standard-name">DB11/T 527-2021</div>
                  <div class="standard-title">配电室安全管理规范</div>
                  <div class="standard-desc">北京市地方标准，规定了配电室巡检的基本要求和检查项目</div>
                </div>
              </div>
              <div class="standard-card">
                <div class="standard-content">
                  <div class="standard-name">DL/T 596-2021</div>
                  <div class="standard-title">电力设备预防性试验规程</div>
                  <div class="standard-desc">规定设备预防性试验周期和方法</div>
                </div>
              </div>
              <div class="standard-card">
                <div class="standard-content">
                  <div class="standard-name">GB/T 37931-2019</div>
                  <div class="standard-title">设备健康管理通用要求</div>
                  <div class="standard-desc">设备状态评估和健康管理标准</div>
                </div>
              </div>
              <div class="standard-card">
                <div class="standard-content">
                  <div class="standard-name">T/CEC 182-2018</div>
                  <div class="standard-title">智能巡检机器人技术条件</div>
                  <div class="standard-desc">机器人巡检技术规范</div>
                </div>
              </div>
            </div>

            <!-- 巡检项目标准 -->
            <div class="check-items-panel">
              <div class="panel-header">
                <span class="panel-title">
                  <el-icon><List /></el-icon>
                  巡检项目标准 (依据 DB11/T 527-2021)
                </span>
                <el-select v-model="standardCategory" placeholder="选择分类" style="width: 160px">
                  <el-option label="全部分类" value="all" />
                  <el-option label="变压器" value="transformer" />
                  <el-option label="高压开关柜" value="hv-switchgear" />
                  <el-option label="低压开关柜" value="lv-switchgear" />
                  <el-option label="电缆及线路" value="cable" />
                  <el-option label="安全设施" value="safety" />
                  <el-option label="环境条件" value="environment" />
                </el-select>
              </div>
              <div class="check-items-table">
                <el-table :data="checkItemStandards" style="width: 100%">
                  <el-table-column prop="category" label="设备类别" width="120" />
                  <el-table-column prop="item" label="检查项目" min-width="200" />
                  <el-table-column prop="method" label="检查方法" width="120" />
                  <el-table-column prop="standard" label="标准要求" min-width="200" />
                  <el-table-column prop="frequency" label="检查频次" width="100" />
                  <el-table-column prop="recordReq" label="记录要求" width="120" />
                </el-table>
              </div>
            </div>

            <!-- 巡检周期要求 -->
            <div class="frequency-panel">
              <div class="panel-header">
                <span class="panel-title">
                  <el-icon><Calendar /></el-icon>
                  巡检周期要求 (依据 DB11/T 527-2021 第6.2条)
                </span>
              </div>
              <div class="frequency-table">
                <el-table :data="frequencyStandards" style="width: 100%">
                  <el-table-column prop="type" label="巡检类型" width="150" />
                  <el-table-column prop="frequency" label="频次要求" width="200" />
                  <el-table-column prop="content" label="主要内容" min-width="300" />
                  <el-table-column prop="requirement" label="特殊要求" min-width="200" />
                </el-table>
              </div>
            </div>

            <!-- 异常处置标准 -->
            <div class="exception-panel">
              <div class="panel-header">
                <span class="panel-title">
                  <el-icon><Warning /></el-icon>
                  异常处置标准 (依据 DB11/T 527-2021 第7条)
                </span>
              </div>
              <div class="exception-list">
                <div class="exception-item" v-for="item in exceptionStandards" :key="item.id">
                  <div class="exception-header">
                    <span :class="['exception-level', item.level]">{{ item.levelText }}</span>
                    <span class="exception-name">{{ item.name }}</span>
                  </div>
                  <div class="exception-body">
                    <div class="exception-desc">
                      <span class="label">异常现象：</span>
                      <span class="value">{{ item.phenomenon }}</span>
                    </div>
                    <div class="exception-action">
                      <span class="label">处置措施：</span>
                      <span class="value">{{ item.action }}</span>
                    </div>
                    <div class="exception-time">
                      <span class="label">处置时限：</span>
                      <span class="value">{{ item.timeLimit }}</span>
                    </div>
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
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Calendar, Loading, CircleCheck, WarningFilled, Clock, Cpu,
  List, Plus, Location, User, Document, Download, Guide,
  Position, Edit, VideoPlay, Warning
} from '@element-plus/icons-vue'

// ========== 基础数据 ==========
const activeMainTab = ref('tasks')
const selectedRoom = ref('room1')
const dateRange = ref<[Date, Date] | null>(null)
const taskFilter = ref('all')
const standardCategory = ref('all')

const rooms = [
  { id: 'room1', name: '圆心配电室' },
  { id: 'room2', name: '通州配电室' },
  { id: 'room3', name: '北理工配电室' }
]

// ========== 任务统计 ==========
const taskStats = ref({
  todayPending: 5,
  inProgress: 2,
  todayCompleted: 8,
  completionRate: 61.5,
  abnormalCount: 3,
  overdueCount: 1,
  robotTasks: 6
})

// ========== 任务列表 ==========
const inspectionTasks = ref([
  {
    id: 1, name: '日常巡检-上午', type: 'daily', status: 'completed', isUrgent: false,
    location: '圆心配电室', assignee: '张工', scheduledTime: '08:00-10:00',
    checkPoints: 32, progress: 100, robotAssist: false, createTime: '2024-12-04 07:30'
  },
  {
    id: 2, name: '高压设备专项检查', type: 'special', status: 'progress', isUrgent: false,
    location: '圆心配电室', assignee: '李工', scheduledTime: '10:00-12:00',
    checkPoints: 48, progress: 65, robotAssist: true, createTime: '2024-12-04 09:00'
  },
  {
    id: 3, name: '变压器红外测温', type: 'special', status: 'progress', isUrgent: true,
    location: '通州配电室', assignee: '王工', scheduledTime: '11:00-12:00',
    checkPoints: 12, progress: 30, robotAssist: true, createTime: '2024-12-04 10:30'
  },
  {
    id: 4, name: '日常巡检-下午', type: 'daily', status: 'pending', isUrgent: false,
    location: '圆心配电室', assignee: '张工', scheduledTime: '16:00-18:00',
    checkPoints: 32, progress: 0, robotAssist: false, createTime: '2024-12-04 07:30'
  },
  {
    id: 5, name: '机器人自动巡检', type: 'robot', status: 'pending', isUrgent: false,
    location: '圆心配电室', assignee: '巡检机器人', scheduledTime: '14:00-14:30',
    checkPoints: 56, progress: 0, robotAssist: true, createTime: '2024-12-04 00:00'
  },
  {
    id: 6, name: '夜间安全巡检', type: 'night', status: 'pending', isUrgent: false,
    location: '全部配电室', assignee: '值班人员', scheduledTime: '22:00-23:00',
    checkPoints: 24, progress: 0, robotAssist: false, createTime: '2024-12-04 07:30'
  }
])

const filteredTasks = computed(() => {
  if (taskFilter.value === 'all') return inspectionTasks.value
  const statusMap: Record<string, string> = {
    pending: 'pending',
    progress: 'progress',
    completed: 'completed'
  }
  return inspectionTasks.value.filter(t => t.status === statusMap[taskFilter.value])
})

// ========== 巡检记录 ==========
const recordStats = ref({
  monthTotal: 156,
  issueCount: 12,
  rectifyRate: 91.7,
  avgDuration: 45
})

const recordFilter = ref({
  type: '',
  result: ''
})

const inspectionRecords = ref([
  { id: 'INS-20241204-001', taskName: '日常巡检-上午', type: 'daily', location: '圆心配电室', inspector: '张工', startTime: '2024-12-04 08:05', duration: 52, checkCount: 32, result: 'normal', issueCount: 0 },
  { id: 'INS-20241203-003', taskName: '高压设备专项检查', type: 'special', location: '圆心配电室', inspector: '李工', startTime: '2024-12-03 10:12', duration: 85, checkCount: 48, result: 'abnormal', issueCount: 2 },
  { id: 'INS-20241203-002', taskName: '日常巡检-下午', type: 'daily', location: '通州配电室', inspector: '王工', startTime: '2024-12-03 16:08', duration: 48, checkCount: 32, result: 'normal', issueCount: 0 },
  { id: 'INS-20241203-001', taskName: '机器人自动巡检', type: 'robot', location: '圆心配电室', inspector: '巡检机器人', startTime: '2024-12-03 14:00', duration: 25, checkCount: 56, result: 'abnormal', issueCount: 1 },
  { id: 'INS-20241202-004', taskName: '夜间安全巡检', type: 'night', location: '全部配电室', inspector: '赵工', startTime: '2024-12-02 22:05', duration: 38, checkCount: 24, result: 'normal', issueCount: 0 }
])

// ========== 巡检计划 ==========
const planStats = ref({
  dailyExecuted: 58,
  weeklyExecuted: 4,
  monthlyExecuted: 1,
  robotExecuted: 5
})

const currentMonth = ref('2024年12月')
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const calendarDates = ref([
  { day: 1, isOtherMonth: false, isToday: false, tasks: [{ id: 1, name: '月度专项巡检', type: 'special' }] },
  { day: 2, isOtherMonth: false, isToday: false, tasks: [{ id: 2, name: '日常巡检', type: 'daily' }] },
  { day: 3, isOtherMonth: false, isToday: false, tasks: [{ id: 3, name: '日常巡检', type: 'daily' }] },
  { day: 4, isOtherMonth: false, isToday: true, tasks: [{ id: 4, name: '日常巡检', type: 'daily' }, { id: 5, name: '机器人巡检', type: 'robot' }] },
  { day: 5, isOtherMonth: false, isToday: false, tasks: [{ id: 6, name: '日常巡检', type: 'daily' }] },
  { day: 6, isOtherMonth: false, isToday: false, tasks: [{ id: 7, name: '日常巡检', type: 'daily' }] },
  { day: 7, isOtherMonth: false, isToday: false, tasks: [{ id: 8, name: '日常巡检', type: 'daily' }] },
  // ... 简化显示
  { day: 8, isOtherMonth: false, isToday: false, tasks: [] },
  { day: 9, isOtherMonth: false, isToday: false, tasks: [{ id: 9, name: '周巡检', type: 'special' }] },
  { day: 10, isOtherMonth: false, isToday: false, tasks: [] },
  { day: 11, isOtherMonth: false, isToday: false, tasks: [] },
  { day: 12, isOtherMonth: false, isToday: false, tasks: [] },
  { day: 13, isOtherMonth: false, isToday: false, tasks: [] },
  { day: 14, isOtherMonth: false, isToday: false, tasks: [] }
])

// ========== 巡检路线 ==========
const inspectionRoutes = ref([
  { id: 1, name: '日常巡检路线A', status: 'active', pointCount: 12, estimatedTime: 45, checkItems: 68, useCount: 156, updateTime: '2024-11-15' },
  { id: 2, name: '高压设备巡检路线', status: 'active', pointCount: 8, estimatedTime: 60, checkItems: 86, useCount: 48, updateTime: '2024-11-20' },
  { id: 3, name: '低压配电巡检路线', status: 'active', pointCount: 15, estimatedTime: 50, checkItems: 72, useCount: 89, updateTime: '2024-11-18' },
  { id: 4, name: '机器人巡检路线', status: 'active', pointCount: 20, estimatedTime: 30, checkItems: 56, useCount: 320, updateTime: '2024-12-01' }
])

const selectedRoute = ref<any>(null)

// ========== 巡检标准 ==========
const checkItemStandards = ref([
  { category: '变压器', item: '油位检查', method: '目视', standard: '油位在正常刻度范围内', frequency: '每日', recordReq: '记录油位刻度' },
  { category: '变压器', item: '油温检查', method: '温度计', standard: '上层油温≤85°C', frequency: '每日', recordReq: '记录温度值' },
  { category: '变压器', item: '外观检查', method: '目视', standard: '无渗漏、变形、锈蚀', frequency: '每日', recordReq: '异常时拍照' },
  { category: '变压器', item: '红外测温', method: '红外仪', standard: '接头温升≤50K', frequency: '每周', recordReq: '记录热像图' },
  { category: '高压开关柜', item: '柜体检查', method: '目视', standard: '无异响、异味、放电', frequency: '每日', recordReq: '记录异常' },
  { category: '高压开关柜', item: '指示灯检查', method: '目视', standard: '指示正确、灯具完好', frequency: '每日', recordReq: '记录异常' },
  { category: '高压开关柜', item: 'SF6气压', method: '压力表', standard: '在绿色区域内', frequency: '每日', recordReq: '记录压力值' },
  { category: '低压开关柜', item: '开关状态', method: '目视', standard: '与运行方式一致', frequency: '每日', recordReq: '记录状态' },
  { category: '环境条件', item: '温度检查', method: '温度计', standard: '5°C～40°C', frequency: '每日', recordReq: '记录温度' },
  { category: '环境条件', item: '湿度检查', method: '湿度计', standard: '相对湿度≤70%', frequency: '每日', recordReq: '记录湿度' },
  { category: '安全设施', item: '消防设施', method: '目视', standard: '完好、有效期内', frequency: '每日', recordReq: '记录检查结果' },
  { category: '安全设施', item: '安全标识', method: '目视', standard: '清晰、完整', frequency: '每周', recordReq: '记录缺失项' }
])

const frequencyStandards = ref([
  { type: '日常巡检', frequency: '每日不少于2次', content: '设备外观、运行状态、仪表指示、环境条件、安全设施', requirement: '白班、夜班各一次' },
  { type: '周巡检', frequency: '每周不少于1次', content: '设备详细检查、红外测温、接地检查、保护装置', requirement: '由专业人员执行' },
  { type: '月度巡检', frequency: '每月不少于1次', content: '全面检查、预防性试验、设备状态评估', requirement: '形成书面报告' },
  { type: '特殊巡检', frequency: '根据需要', content: '恶劣天气后、设备异常后、重大活动前', requirement: '24小时内完成' },
  { type: '夜间巡检', frequency: '每日1次', content: '安全检查、消防设施、门禁状态、视频监控', requirement: '22:00-06:00期间' }
])

const exceptionStandards = ref([
  { id: 1, level: 'critical', levelText: '紧急', name: '设备故障停运', phenomenon: '设备跳闸、保护动作、无法合闸', action: '立即汇报、隔离故障、组织抢修', timeLimit: '立即处置' },
  { id: 2, level: 'critical', levelText: '紧急', name: '火灾/烟雾告警', phenomenon: '烟感报警、可见烟雾、明火', action: '立即报警、切断电源、组织灭火', timeLimit: '立即处置' },
  { id: 3, level: 'major', levelText: '重要', name: '设备过热', phenomenon: '红外测温超标、温升异常', action: '降低负荷、加强监测、安排检修', timeLimit: '4小时内' },
  { id: 4, level: 'major', levelText: '重要', name: '绝缘异常', phenomenon: '放电声、焦糊味、绝缘电阻降低', action: '降低负荷、申请停电检修', timeLimit: '24小时内' },
  { id: 5, level: 'minor', levelText: '一般', name: '环境异常', phenomenon: '温湿度超标、照明故障', action: '调节空调、维修设备', timeLimit: '48小时内' },
  { id: 6, level: 'minor', levelText: '一般', name: '标识缺失', phenomenon: '安全标识不清或缺失', action: '补充完善标识', timeLimit: '7天内' }
])

// ========== 辅助函数 ==========
const getTaskTypeText = (type: string) => {
  const map: Record<string, string> = {
    daily: '日常巡检',
    special: '专项巡检',
    night: '夜间巡检',
    robot: '机器人巡检'
  }
  return map[type] || type
}

const getTaskStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待执行',
    progress: '进行中',
    completed: '已完成',
    overdue: '已超期'
  }
  return map[status] || status
}

const selectRoute = (route: any) => {
  selectedRoute.value = {
    ...route,
    points: [
      {
        id: 1, name: '1#进线柜', deviceType: '高压开关柜', estimatedTime: 5,
        checks: [
          { id: 1, name: '柜体外观检查', method: '目视' },
          { id: 2, name: '指示灯状态', method: '目视' },
          { id: 3, name: 'SF6气压', method: '读数' }
        ]
      },
      {
        id: 2, name: '1#变压器', deviceType: '油浸式变压器', estimatedTime: 8,
        checks: [
          { id: 4, name: '油位检查', method: '目视' },
          { id: 5, name: '油温检查', method: '读数' },
          { id: 6, name: '外观检查', method: '目视' },
          { id: 7, name: '红外测温', method: '仪器' }
        ]
      },
      {
        id: 3, name: '低压总进线柜', deviceType: '低压开关柜', estimatedTime: 5,
        checks: [
          { id: 8, name: '开关状态', method: '目视' },
          { id: 9, name: '电流读数', method: '读数' },
          { id: 10, name: '接头温度', method: '仪器' }
        ]
      }
    ]
  }
}

const createTask = () => ElMessage.success('创建巡检任务')
const startTask = (task: any) => ElMessage.success(`开始执行: ${task.name}`)
const continueTask = (task: any) => ElMessage.info(`继续执行: ${task.name}`)
const viewTaskResult = (task: any) => ElMessage.info(`查看结果: ${task.name}`)
const viewTaskDetail = (task: any) => ElMessage.info(`查看详情: ${task.name}`)
const exportRecords = () => ElMessage.success('导出巡检记录成功')
const viewRecord = (row: any) => ElMessage.info(`查看记录: ${row.id}`)
const editPlan = (type: string) => ElMessage.info(`编辑计划: ${type}`)
const prevMonth = () => ElMessage.info('上一月')
const nextMonth = () => ElMessage.info('下一月')
const createRoute = () => ElMessage.success('创建巡检路线')
const editRoute = () => ElMessage.info('编辑路线')
const testRoute = () => ElMessage.info('模拟执行路线')
</script>

<style scoped>
* {
  box-sizing: border-box;
}

@keyframes scanline {
  0% { background-position: 0% 0%; }
  100% { background-position: 0% 200%; }
}

.inspection-page {
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

/* ========== 任务统计卡片 ========== */
.task-overview {
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

.stat-card.today .stat-icon { color: var(--tech-primary); border-color: var(--tech-primary); background: rgba(0, 240, 255, 0.1); }
.stat-card.progress .stat-icon { color: #60a5fa; border-color: #60a5fa; background: rgba(96, 165, 250, 0.1); }
.stat-card.completed .stat-icon { color: var(--status-success); border-color: var(--status-success); background: rgba(0, 230, 118, 0.1); }
.stat-card.abnormal .stat-icon { color: var(--status-warning); border-color: var(--status-warning); background: rgba(255, 214, 0, 0.1); }
.stat-card.overdue .stat-icon { color: var(--status-danger); border-color: var(--status-danger); background: rgba(255, 46, 99, 0.1); }
.stat-card.robot .stat-icon { color: #a78bfa; border-color: #a78bfa; background: rgba(167, 139, 250, 0.1); }

.stat-content { flex: 1; }
.stat-label { font-size: 12px; color: var(--text-sub); margin-bottom: 4px; }
.stat-value { font-size: 28px; font-weight: 700; color: var(--text-bright); font-family: 'DIN Alternate', sans-serif; }
.stat-sub { font-size: 12px; color: var(--tech-primary); margin-top: 4px; }

/* ========== 任务列表 ========== */
.task-list-panel {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  flex: 1;
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

.panel-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.task-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: calc(100vh - 450px);
  overflow-y: auto;
}

.task-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.15);
  padding: 16px;
  transition: all 0.3s;
}

.task-card:hover {
  border-color: var(--tech-primary);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.15);
}

.task-card.urgent {
  border-left: 3px solid var(--status-danger);
}

.task-card.completed {
  opacity: 0.7;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.task-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.task-type-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 2px;
}

.task-type-tag.daily { background: rgba(0, 240, 255, 0.2); color: var(--tech-primary); }
.task-type-tag.special { background: rgba(167, 139, 250, 0.2); color: #a78bfa; }
.task-type-tag.night { background: rgba(96, 165, 250, 0.2); color: #60a5fa; }
.task-type-tag.robot { background: rgba(0, 230, 118, 0.2); color: var(--status-success); }

.task-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-bright);
}

.urgent-tag {
  font-size: 10px;
  padding: 2px 6px;
  background: var(--status-danger);
  color: white;
  border-radius: 2px;
}

.task-status-tag {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 2px;
}

.task-status-tag.pending { background: rgba(255, 214, 0, 0.2); color: var(--status-warning); }
.task-status-tag.progress { background: rgba(96, 165, 250, 0.2); color: #60a5fa; }
.task-status-tag.completed { background: rgba(0, 230, 118, 0.2); color: var(--status-success); }

.task-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.task-detail {
  display: flex;
  gap: 24px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-sub);
}

.detail-item .el-icon {
  color: var(--tech-primary);
}

.task-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 200px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--tech-primary), var(--status-success));
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 12px;
  color: var(--tech-primary);
  font-family: 'DIN Alternate', sans-serif;
  min-width: 40px;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 240, 255, 0.1);
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.robot-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #a78bfa;
  padding: 2px 8px;
  background: rgba(167, 139, 250, 0.1);
  border: 1px solid rgba(167, 139, 250, 0.3);
}

.create-time {
  font-size: 11px;
  color: var(--text-muted);
}

.task-actions {
  display: flex;
  gap: 10px;
}

/* ========== 巡检记录 ========== */
.records-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.records-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stats-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  padding: 20px;
  text-align: center;
}

.stats-label { font-size: 12px; color: var(--text-sub); margin-bottom: 8px; }
.stats-value { font-size: 28px; font-weight: 700; color: var(--text-bright); font-family: 'DIN Alternate', sans-serif; }
.stats-value.highlight { color: var(--status-success); }
.stats-value.warning { color: var(--status-warning); }

.records-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-group {
  display: flex;
  gap: 12px;
}

.records-table {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.15);
  padding: 16px;
}

.type-tag {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 2px;
}

.type-tag.daily { background: rgba(0, 240, 255, 0.2); color: var(--tech-primary); }
.type-tag.special { background: rgba(167, 139, 250, 0.2); color: #a78bfa; }
.type-tag.night { background: rgba(96, 165, 250, 0.2); color: #60a5fa; }
.type-tag.robot { background: rgba(0, 230, 118, 0.2); color: var(--status-success); }

.result-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 2px;
}

.result-tag.normal { background: rgba(0, 230, 118, 0.2); color: var(--status-success); }
.result-tag.abnormal { background: rgba(255, 214, 0, 0.2); color: var(--status-warning); }

.issue-count { color: var(--status-danger); font-weight: 600; }

/* ========== 巡检计划 ========== */
.plans-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.plans-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.plan-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  padding: 16px;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
}

.plan-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-bright);
}

.plan-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 2px;
}

.plan-status.active { background: rgba(0, 230, 118, 0.2); color: var(--status-success); }
.plan-status.inactive { background: rgba(255, 255, 255, 0.1); color: var(--text-muted); }

.plan-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.plan-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.item-label { color: var(--text-sub); }
.item-value { color: var(--text-bright); }
.item-value.standard { color: var(--tech-primary); }

.plan-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 240, 255, 0.1);
}

.plan-meta {
  font-size: 11px;
  color: var(--text-muted);
}

/* 日历 */
.plan-calendar-panel {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-btn {
  width: 28px;
  height: 28px;
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.3);
  color: var(--tech-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: rgba(0, 240, 255, 0.2);
}

.current-month {
  font-size: 14px;
  color: var(--text-bright);
  min-width: 100px;
  text-align: center;
}

.calendar-grid {
  padding: 20px;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 10px;
}

.weekday {
  text-align: center;
  font-size: 12px;
  color: var(--text-sub);
  padding: 8px;
}

.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-cell {
  aspect-ratio: 1;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.calendar-cell.other-month {
  opacity: 0.4;
}

.calendar-cell.today {
  border-color: var(--tech-primary);
  background: rgba(0, 240, 255, 0.1);
}

.calendar-cell.has-task {
  border-color: rgba(0, 240, 255, 0.3);
}

.date-num {
  font-size: 14px;
  color: var(--text-bright);
  font-family: 'DIN Alternate', sans-serif;
}

.date-tasks {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.task-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.task-dot.daily { background: var(--tech-primary); }
.task-dot.special { background: #a78bfa; }
.task-dot.robot { background: var(--status-success); }

.more-tasks {
  font-size: 10px;
  color: var(--text-muted);
}

.calendar-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 16px;
  border-top: 1px solid rgba(0, 240, 255, 0.1);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-sub);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot.daily { background: var(--tech-primary); }
.legend-dot.special { background: #a78bfa; }
.legend-dot.robot { background: var(--status-success); }

/* ========== 巡检路线 ========== */
.routes-panel {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 20px;
  height: calc(100vh - 220px);
}

.routes-list-panel {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  display: flex;
  flex-direction: column;
}

.routes-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.route-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.15);
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.route-card:hover, .route-card.active {
  border-color: var(--tech-primary);
  background: rgba(0, 240, 255, 0.05);
}

.route-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.route-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-bright);
}

.route-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 2px;
}

.route-status.active { background: rgba(0, 230, 118, 0.2); color: var(--status-success); }
.route-status.inactive { background: rgba(255, 255, 255, 0.1); color: var(--text-muted); }

.route-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-sub);
}

.info-item .el-icon { color: var(--tech-primary); font-size: 14px; }

.route-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-muted);
  padding-top: 10px;
  border-top: 1px solid rgba(0, 240, 255, 0.1);
}

/* 路线详情 */
.route-detail-panel {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  display: flex;
  flex-direction: column;
}

.route-points {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.route-point {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  position: relative;
}

.point-order {
  width: 32px;
  height: 32px;
  background: rgba(0, 240, 255, 0.2);
  border: 2px solid var(--tech-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--tech-primary);
  flex-shrink: 0;
}

.point-connector {
  position: absolute;
  left: 15px;
  top: 36px;
  width: 2px;
  height: calc(100% + 8px);
  background: rgba(0, 240, 255, 0.3);
}

.point-content {
  flex: 1;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.15);
  padding: 16px;
}

.point-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.point-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-bright);
}

.point-type {
  font-size: 11px;
  color: var(--text-sub);
  padding: 2px 8px;
  background: rgba(0, 240, 255, 0.1);
}

.point-checks {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-sub);
}

.check-item .el-icon { color: var(--status-success); }

.check-method {
  margin-left: auto;
  font-size: 11px;
  color: var(--text-muted);
  padding: 1px 6px;
  background: rgba(0, 0, 0, 0.3);
}

.point-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-muted);
  padding-top: 10px;
  border-top: 1px solid rgba(0, 240, 255, 0.1);
}

/* ========== 巡检标准 ========== */
.standards-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.standards-overview {
  display: grid;
  grid-template-columns: 1.5fr repeat(3, 1fr);
  gap: 16px;
}

.standard-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  padding: 20px;
  display: flex;
  gap: 16px;
}

.standard-card.main {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 0, 0, 0.3));
  border-color: var(--tech-primary);
}

.standard-icon {
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

.standard-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--tech-primary);
  margin-bottom: 4px;
}

.standard-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-bright);
  margin-bottom: 8px;
}

.standard-desc {
  font-size: 12px;
  color: var(--text-sub);
  line-height: 1.5;
}

.check-items-panel, .frequency-panel, .exception-panel {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.check-items-table, .frequency-table {
  padding: 16px;
}

.exception-list {
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.exception-item {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.15);
  padding: 16px;
}

.exception-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.exception-level {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 2px;
}

.exception-level.critical { background: rgba(255, 46, 99, 0.2); color: var(--status-danger); }
.exception-level.major { background: rgba(255, 214, 0, 0.2); color: var(--status-warning); }
.exception-level.minor { background: rgba(0, 240, 255, 0.2); color: var(--tech-primary); }

.exception-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-bright);
}

.exception-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.exception-desc, .exception-action, .exception-time {
  font-size: 12px;
}

.exception-body .label { color: var(--text-sub); }
.exception-body .value { color: var(--text-bright); }

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
.task-list::-webkit-scrollbar,
.routes-list::-webkit-scrollbar,
.route-points::-webkit-scrollbar {
  width: 8px;
}

.content-wrapper::-webkit-scrollbar-track,
.task-list::-webkit-scrollbar-track,
.routes-list::-webkit-scrollbar-track,
.route-points::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

.content-wrapper::-webkit-scrollbar-thumb,
.task-list::-webkit-scrollbar-thumb,
.routes-list::-webkit-scrollbar-thumb,
.route-points::-webkit-scrollbar-thumb {
  background: rgba(0, 240, 255, 0.2);
}

.content-wrapper::-webkit-scrollbar-thumb:hover,
.task-list::-webkit-scrollbar-thumb:hover,
.routes-list::-webkit-scrollbar-thumb:hover,
.route-points::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 240, 255, 0.3);
}
</style>

<style>
/* Element Plus 组件样式覆盖 */
.inspection-page .el-table {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(0, 240, 255, 0.05);
  --el-table-header-text-color: #00f3ff;
  --el-table-text-color: #e2e8f0;
  --el-table-border-color: rgba(0, 240, 255, 0.15);
  --el-table-row-hover-bg-color: rgba(0, 240, 255, 0.08);
  background: transparent !important;
}

.inspection-page .el-table th.el-table__cell {
  background: rgba(0, 240, 255, 0.05) !important;
  color: #00f3ff !important;
  font-weight: 700;
  font-size: 12px;
  border-bottom: 2px solid rgba(0, 240, 255, 0.2) !important;
}

.inspection-page .el-table td.el-table__cell {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  color: #e2e8f0;
  font-size: 13px;
}

.inspection-page .el-radio-button__inner {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 240, 255, 0.2);
  color: var(--text-sub);
}

.inspection-page .el-radio-button__original-radio:checked + .el-radio-button__inner {
  background: rgba(0, 240, 255, 0.15);
  border-color: var(--tech-primary);
  color: var(--tech-primary);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}

.inspection-page .el-select__wrapper {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 240, 255, 0.2);
  box-shadow: none;
}

.inspection-page .el-date-editor {
  --el-input-bg-color: rgba(0, 0, 0, 0.3);
  --el-input-border-color: rgba(0, 240, 255, 0.2);
}
</style>
