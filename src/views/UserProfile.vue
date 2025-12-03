<template>
  <div class="user-profile-container">
    <!-- 头部信息 -->
    <div class="profile-header">
      <div class="user-basic">
        <div class="avatar-section">
          <img :src="userInfo.avatar || '/logo.png'" alt="用户头像" class="user-avatar" />
        </div>
        <div class="user-identity">
          <div class="user-name-row">
            <span class="user-name">{{ userInfo.name }}</span>
            <span class="user-id">/ {{ userInfo.employeeId }}</span>
            <span class="status-tag active">在职</span>
            <span class="status-tag">离职</span>
            <span class="status-tag">休假</span>
          </div>
          <div class="user-info-tags">
            <span class="info-tag">党员</span>
            <span class="info-tag">{{ userInfo.department }}</span>
            <span class="info-tag">{{ userInfo.position }}</span>
          </div>
        </div>
      </div>
      <div class="header-actions">
        <button class="action-btn">打印</button>
        <button class="action-btn">导出</button>
      </div>
    </div>

    <!-- 标签页导航 -->
    <div class="tabs-container">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-item', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="profile-content">
      <!-- 个人信息 -->
      <section v-show="activeTab === 'personal'" class="section-card personal-info-card">
        <div class="section-header">
          <div class="section-icon" style="background: linear-gradient(135deg, #00F3FF 0%, #0078D7 100%);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="white"/>
            </svg>
          </div>
          <div class="section-header-text">
            <h3 class="section-title">个人信息</h3>
            <p class="section-subtitle">基本资料与入职信息</p>
          </div>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-icon">📅</div>
            <div class="info-content">
              <span class="label">入职日期</span>
              <span class="value">{{ personalInfo.entryDate }}</span>
            </div>
          </div>
          <div class="info-item">
            <div class="info-icon">👤</div>
            <div class="info-content">
              <span class="label">性别</span>
              <span class="value">{{ personalInfo.gender }}</span>
            </div>
          </div>
          <div class="info-item">
            <div class="info-icon">🏛️</div>
            <div class="info-content">
              <span class="label">民族</span>
              <span class="value">{{ personalInfo.nationality }}</span>
            </div>
          </div>
          <div class="info-item">
            <div class="info-icon">📍</div>
            <div class="info-content">
              <span class="label">籍贯</span>
              <span class="value">{{ personalInfo.hometown }}</span>
            </div>
          </div>
          <div class="info-item">
            <div class="info-icon">🎓</div>
            <div class="info-content">
              <span class="label">第一学历</span>
              <span class="value">{{ personalInfo.firstDegree }}</span>
            </div>
          </div>
          <div class="info-item">
            <div class="info-icon">🏫</div>
            <div class="info-content">
              <span class="label">毕业学校</span>
              <span class="value">{{ personalInfo.graduateSchool }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 教育经历 -->
      <section v-show="activeTab === 'personal'" class="section-card education-card">
        <div class="section-header">
          <div class="section-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18ZM12 3L1 9L12 15L21 10.09V17H23V9L12 3Z" fill="white"/>
            </svg>
          </div>
          <div class="section-header-text">
            <h3 class="section-title">教育经历</h3>
            <p class="section-subtitle">学历与学位信息</p>
          </div>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>时间</th>
                <th>院校名称</th>
                <th>学历</th>
                <th>学位</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(edu, index) in educationHistory" :key="index">
                <td>{{ edu.period }}</td>
                <td>{{ edu.school }}</td>
                <td>{{ edu.degree }}</td>
                <td>{{ edu.degreeType }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 工作证书 - 独立标签页 -->
      <section v-show="activeTab === 'certificates'" class="certificates-page">
        <div class="certificates-header">
          <div class="section-icon" style="background: linear-gradient(135deg, #00E676 0%, #00C853 100%);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white"/>
              <circle cx="12" cy="12" r="3" fill="white"/>
            </svg>
          </div>
          <div class="header-info">
            <h2 class="page-title">工作证书</h2>
            <p class="page-desc">专业资质证书与职业认证</p>
          </div>
          <div class="header-stats">
            <div class="stat-item">
              <span class="stat-value">{{ workCertificates.filter(c => c.status === '有效').length }}</span>
              <span class="stat-label">有效证书</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ workCertificates.filter(c => c.status === '已过期').length }}</span>
              <span class="stat-label">已过期</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ workCertificates.length }}</span>
              <span class="stat-label">总计</span>
            </div>
          </div>
        </div>

        <div class="certificates-grid">
          <div
            v-for="(cert, index) in workCertificates"
            :key="index"
            class="certificate-card"
          >
            <div class="certificate-header">
              <div class="certificate-icon">
                <svg width="60" height="60" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="28" fill="#00E676" opacity="0.15"/>
                  <path d="M30 10 L35 25 L50 25 L38 35 L42 50 L30 40 L18 50 L22 35 L10 25 L25 25 Z" fill="#00E676"/>
                  <circle cx="30" cy="30" r="5" fill="#00C853"/>
                  <path d="M27 30 L29 32 L33 28" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="certificate-tags">
                <span :class="['cert-tag', cert.status === '有效' ? 'valid' : 'expired']">
                  {{ cert.status }}
                </span>
                <span v-if="cert.level" class="cert-tag level">{{ cert.level }}</span>
              </div>
            </div>
            <div class="certificate-body">
              <div class="certificate-name">{{ cert.name }}</div>
              <div class="certificate-meta">
                <div class="meta-row">
                  <span class="meta-label">颁发机构</span>
                  <span class="meta-value">{{ cert.organization }}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">颁发日期</span>
                  <span class="meta-value">{{ cert.issueDate }}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">证书编号</span>
                  <span class="meta-value cert-number">{{ cert.number }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 上下级汇报关系 -->
      <section v-show="activeTab === 'reporting'" class="section-card reporting-card">
        <div class="section-header">
          <div class="section-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5.9C13.16 5.9 14.1 6.84 14.1 8C14.1 9.16 13.16 10.1 12 10.1C10.84 10.1 9.9 9.16 9.9 8C9.9 6.84 10.84 5.9 12 5.9ZM12 14.9C14.97 14.9 18.1 16.36 18.1 17V18.1H5.9V17C5.9 16.36 9.03 14.9 12 14.9ZM12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4ZM12 13C9.33 13 4 14.34 4 17V20H20V17C20 14.34 14.67 13 12 13Z" fill="white"/>
            </svg>
          </div>
          <div class="section-header-text">
            <h3 class="section-title">上下级汇报关系</h3>
            <p class="section-subtitle">组织架构与团队关系</p>
          </div>
          <span class="title-action">展开详情 →</span>
        </div>
        <div class="org-chart">
          <div class="org-level">
            <div class="org-node leader">
              <img :src="orgChart.leader.avatar" alt="" class="node-avatar" />
              <div class="node-info">
                <div class="node-name">{{ orgChart.leader.name }}</div>
                <div class="node-title">{{ orgChart.leader.title }}</div>
              </div>
              <div class="node-tags">
                <span class="node-tag">直属上级-直接汇报</span>
              </div>
            </div>
          </div>
          <div class="org-connector"></div>
          <div class="org-level peers">
            <div
              v-for="peer in orgChart.peers"
              :key="peer.id"
              class="org-node"
            >
              <img :src="peer.avatar" alt="" class="node-avatar" />
              <div class="node-info">
                <div class="node-name">{{ peer.name }}</div>
                <div class="node-title">{{ peer.title }}</div>
              </div>
              <div class="node-tags">
                <span class="node-tag">同级-间接汇报</span>
              </div>
            </div>
          </div>
          <div class="org-connector"></div>
          <div class="org-level subordinates">
            <div
              v-for="sub in orgChart.subordinates"
              :key="sub.id"
              class="org-node"
            >
              <img :src="sub.avatar" alt="" class="node-avatar" />
              <div class="node-info">
                <div class="node-name">{{ sub.name }}</div>
                <div class="node-title">{{ sub.title }}</div>
              </div>
              <div class="node-tags">
                <span class="node-tag">个人部署者</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 岗位工作经历 -->
      <section v-show="activeTab === 'experience'" class="section-card experience-card">
        <div class="section-header">
          <div class="section-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 6H16V4C16 2.89 15.11 2 14 2H10C8.89 2 8 2.89 8 4V6H4C2.89 6 2.01 6.89 2.01 8L2 19C2 20.11 2.89 21 4 21H20C21.11 21 22 20.11 22 19V8C22 6.89 21.11 6 20 6ZM14 6H10V4H14V6Z" fill="white"/>
            </svg>
          </div>
          <div class="section-header-text">
            <h3 class="section-title">岗位工作经历</h3>
            <p class="section-subtitle">职业发展历程</p>
          </div>
        </div>
        <div class="timeline">
          <div
            v-for="(exp, index) in workExperience"
            :key="index"
            class="timeline-item"
          >
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-date">{{ exp.startDate }} 至 {{ exp.endDate }}</span>
                <span class="timeline-tag">{{ exp.type }}</span>
              </div>
              <div class="timeline-body">
                <div class="timeline-position">{{ exp.position }}</div>
                <div class="timeline-company">{{ exp.company }}</div>
                <div class="timeline-desc">{{ exp.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 岗位工作职责 -->
      <section v-show="activeTab === 'responsibilities'" class="section-card responsibilities-card">
        <div class="section-header">
          <div class="section-icon" style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 3H14.82C14.4 1.84 13.3 1 12 1C10.7 1 9.6 1.84 9.18 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM12 3C12.55 3 13 3.45 13 4C13 4.55 12.55 5 12 5C11.45 5 11 4.55 11 4C11 3.45 11.45 3 12 3ZM10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="white"/>
            </svg>
          </div>
          <div class="section-header-text">
            <h3 class="section-title">岗位工作职责</h3>
            <p class="section-subtitle">职位职责与工作内容</p>
          </div>
        </div>
        <div class="timeline">
          <div
            v-for="(resp, index) in responsibilities"
            :key="index"
            class="timeline-item"
          >
            <div class="timeline-dot warning"></div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-date">{{ resp.startDate }} 至 {{ resp.endDate }}</span>
              </div>
              <div class="timeline-body">
                <div class="timeline-position">{{ resp.position }}</div>
                <div class="timeline-company">{{ resp.department }}</div>
                <div class="timeline-desc">{{ resp.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 绩效信息 -->
      <section v-show="activeTab === 'performance'" class="section-card performance-card">
        <div class="section-header">
          <div class="section-icon" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M16 11V3H8V9H2V21H22V11H16ZM10 5H14V19H10V5ZM4 11H8V19H4V11ZM20 19H16V13H20V19Z" fill="#333"/>
            </svg>
          </div>
          <div class="section-header-text">
            <h3 class="section-title">绩效信息</h3>
            <p class="section-subtitle">考核成绩与绩效评级</p>
          </div>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>考核周期</th>
                <th>考核名称</th>
                <th>分数</th>
                <th>绩效等级</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(perf, index) in performanceData" :key="index">
                <td>{{ perf.period }}</td>
                <td>{{ perf.name }}</td>
                <td>{{ perf.score }}</td>
                <td>{{ perf.grade }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 奖惩信息 -->
      <section v-show="activeTab === 'rewards'" class="section-card rewards-card">
        <div class="section-header">
          <div class="section-icon" style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#d97706"/>
            </svg>
          </div>
          <div class="section-header-text">
            <h3 class="section-title">奖惩信息</h3>
            <p class="section-subtitle">荣誉奖励与处罚记录</p>
          </div>
        </div>
        <div class="rewards-container">
          <div class="rewards-column">
            <div
              v-for="(reward, index) in rewardsList"
              :key="index"
              class="reward-item"
            >
              <div class="reward-icon success">
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="18" fill="#1890ff" opacity="0.1"/>
                  <text x="20" y="26" text-anchor="middle" fill="#1890ff" font-size="16" font-weight="bold">奖</text>
                </svg>
              </div>
              <div class="reward-info">
                <div class="reward-title">{{ reward.title }}</div>
                <div class="reward-date">{{ reward.date }} {{ reward.type }}</div>
                <div class="reward-desc">{{ reward.description }}</div>
              </div>
            </div>
          </div>
          <div class="rewards-column">
            <div
              v-for="(penalty, index) in penaltiesList"
              :key="index"
              class="reward-item"
            >
              <div class="reward-icon danger">
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="18" fill="#ff4d4f" opacity="0.1"/>
                  <text x="20" y="26" text-anchor="middle" fill="#ff4d4f" font-size="16" font-weight="bold">惩</text>
                </svg>
              </div>
              <div class="reward-info">
                <div class="reward-title">{{ penalty.title }}</div>
                <div class="reward-date">{{ penalty.date }} {{ penalty.type }}</div>
                <div class="reward-desc">{{ penalty.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 学习记录 -->
      <section v-show="activeTab === 'learning'" class="section-card learning-card">
        <div class="section-header">
          <div class="section-icon" style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L1 9L5 11.18V17.18L12 21L19 17.18V11.18L21 10.09V17H23V9L12 3ZM18.82 9L12 12.72L5.18 9L12 5.28L18.82 9ZM17 15.99L12 18.72L7 15.99V12.27L12 15L17 12.27V15.99Z" fill="#ec4899"/>
            </svg>
          </div>
          <div class="section-header-text">
            <h3 class="section-title">学习记录</h3>
            <p class="section-subtitle">培训课程与证书获取</p>
          </div>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>课程</th>
                <th>已完成</th>
                <th>待完成</th>
                <th>完成</th>
                <th>已获证书</th>
                <th>待获证书</th>
                <th>查看详情</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(course, index) in learningRecords" :key="index">
                <td>{{ course.name }}</td>
                <td>{{ course.completed }}</td>
                <td>{{ course.pending }}</td>
                <td>{{ course.total }}</td>
                <td>{{ course.certificatesEarned }}</td>
                <td>{{ course.certificatesPending }}</td>
                <td><a href="#" class="link-btn">查看</a></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 9宫格胜任力模型 -->
      <section v-show="activeTab === 'competency'" class="section-card competency-card">
        <div class="section-header">
          <div class="section-icon" style="background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 13H5V11H3V13ZM3 17H5V15H3V17ZM3 9H5V7H3V9ZM7 13H21V11H7V13ZM7 17H21V15H7V17ZM7 7V9H21V7H7Z" fill="#0ea5e9"/>
            </svg>
          </div>
          <div class="section-header-text">
            <h3 class="section-title">九宫格胜任力模型</h3>
            <p class="section-subtitle">能力与绩效评估矩阵</p>
          </div>
        </div>
        <div class="competency-matrix">
          <div class="matrix-y-axis">
            <div class="axis-label">能力</div>
            <div class="axis-values">
              <div>高</div>
              <div>中</div>
              <div>低</div>
            </div>
          </div>
          <div class="matrix-grid">
            <div
              v-for="(row, rowIndex) in competencyMatrix"
              :key="rowIndex"
              class="matrix-row"
            >
              <div
                v-for="(cell, colIndex) in row"
                :key="colIndex"
                :class="['matrix-cell', cell.level]"
              >
                <span class="cell-label">{{ cell.label }}</span>
              </div>
            </div>
          </div>
          <div class="matrix-x-axis">
            <div class="axis-label">绩效</div>
            <div class="axis-values">
              <div>低</div>
              <div>中</div>
              <div>高</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const activeTab = ref('personal')

const tabs = [
  { key: 'personal', label: '个人信息' },
  { key: 'certificates', label: '工作证书' },
  { key: 'reporting', label: '上下级汇报关系' },
  { key: 'experience', label: '岗位工作经历' },
  { key: 'responsibilities', label: '岗位工作职责' },
  { key: 'performance', label: '绩效信息' },
  { key: 'rewards', label: '奖惩信息' },
  { key: 'learning', label: '学习记录' },
  { key: 'competency', label: '9宫格胜任力模型' }
]

const userInfo = reactive({
  name: '周日',
  employeeId: 'EA30000',
  avatar: '/logo.png',
  department: '移动技术部',
  position: '总裁'
})

const personalInfo = reactive({
  entryDate: '2010/03/02',
  gender: '男性',
  nationality: '汉族',
  hometown: '四川',
  firstDegree: '本科',
  graduateSchool: '北京大学'
})

const educationHistory = ref([
  { period: '2010/09-30~2020/10/30', school: '国防大学', degree: '法律', degreeType: '硕士' },
  { period: '2036/10/30~2036/10/30', school: '理工', degree: '硕士', degreeType: '硕士' },
  { period: '2036/10/30~2036/10/30', school: '理工大学', degree: '硕士', degreeType: '硕士' },
  { period: '2012/06/30~2016/05/30', school: '北京', degree: '硕士', degreeType: '硕士' }
])

const workCertificates = ref([
  {
    name: '高级电气工程师',
    organization: '中国电力企业联合会',
    issueDate: '2020/03/15',
    number: 'CEEC-2020-A-12345',
    status: '有效',
    level: '高级'
  },
  {
    name: '注册安全工程师',
    organization: '应急管理部',
    issueDate: '2019/06/20',
    number: 'RSE-2019-008876',
    status: '有效',
    level: '国家级'
  },
  {
    name: 'PMP项目管理专业人士',
    organization: 'PMI（美国项目管理协会）',
    issueDate: '2018/09/10',
    number: 'PMP-2018-CN-9987',
    status: '有效',
    level: '国际认证'
  },
  {
    name: '配电自动化高级工程师',
    organization: '国家电网公司',
    issueDate: '2021/12/05',
    number: 'SGCC-DA-2021-456',
    status: '有效',
    level: '高级'
  },
  {
    name: '智能电网技术专家',
    organization: '中国电机工程学会',
    issueDate: '2022/04/18',
    number: 'CSEE-SG-2022-1123',
    status: '有效',
    level: '专家级'
  },
  {
    name: '信息系统项目管理师',
    organization: '工业和信息化部',
    issueDate: '2017/11/30',
    number: 'MIIT-ISPM-2017-6789',
    status: '已过期',
    level: '高级'
  }
])

const orgChart = reactive({
  leader: {
    id: 'leader',
    name: 'FabG-e1',
    title: '北京部 Mozno-v',
    avatar: '/logo.png'
  },
  peers: [
    { id: 'peer1', name: 'Lililu', title: '北京 Yan Yang', avatar: '/logo.png' },
    { id: 'peer2', name: 'Bob', title: '北京部 Work Zhang', avatar: '/logo.png' },
    { id: 'peer3', name: 'Dillusion', title: '北京 der du', avatar: '/logo.png' }
  ],
  subordinates: [
    { id: 'sub1', name: 'EE1', title: '北京 Zh Ying', avatar: '/logo.png' },
    { id: 'sub2', name: 'EE2', title: '北京部 John Chan', avatar: '/logo.png' },
    { id: 'sub3', name: 'EE3', title: '北京部 Michael', avatar: '/logo.png' },
    { id: 'sub4', name: 'EE4', title: '北京 Wen Liu', avatar: '/logo.png' },
    { id: 'sub5', name: 'WET EE', title: '北京 Jun Yu', avatar: '/logo.png' }
  ]
})

const workExperience = ref([
  {
    startDate: '2017年1月1日',
    endDate: '2023年3月31日',
    type: '移至其他部',
    position: '项目经理',
    company: '移动技术部',
    description: '这是一个主要负责的项目内容及工作职责，包括但不限于技术支持及技术文档工作中的各项工作，一般从大方向描述具体的工作内容主要职责涉及...'
  },
  {
    startDate: '2017年1月1日',
    endDate: '2026年3月31日',
    type: '转岗或归位',
    position: '项目经理',
    company: '移动技术部',
    description: '这是一个主要负责的项目内容及工作职责，包括但不限于技术支持及技术文档工作中的各项工作，一般从大方向描述具体的工作内容主要职责涉及...'
  },
  {
    startDate: '2017年1月1日',
    endDate: '2026年3月31日',
    type: '转岗或归位',
    position: '项目经理',
    company: '移动技术部',
    description: '这是一个主要负责的项目内容及工作职责，包括但不限于技术支持及技术文档工作中的各项工作，一般从大方向描述具体的工作内容主要职责涉及...'
  }
])

const responsibilities = ref([
  {
    startDate: '2017年1月1日',
    endDate: '2026年3月31日',
    position: '项目经理',
    department: '移动技术部',
    description: '这是一个主要负责的项目内容及工作职责，包括但不限于技术支持及技术文档工作中的各项工作，一般从大方向描述具体的工作内容主要职责涉及...'
  },
  {
    startDate: '2017年1月1日',
    endDate: '2006年3月31日',
    position: '项目经理',
    department: '移动技术部',
    description: '这是一个主要负责的项目内容及工作职责'
  },
  {
    startDate: '2017年1月1日',
    endDate: '2006年3月31日',
    position: '项目经理',
    department: '移动技术部',
    description: '这是一个主要负责的项目内容及工作职责，包括但不限于技术支持及技术文档工作中的各项工作，一般从大方向描述具体的工作内容主要职责涉及...'
  }
])

const performanceData = ref([
  { period: '2025年1季度', name: '1季度', score: '5', grade: 'A' },
  { period: '2025年1季度', name: '2季度', score: '5', grade: 'A' },
  { period: '2025年1季度', name: '3季度', score: '5', grade: 'A' },
  { period: '2025年1季度', name: '4季度', score: '5', grade: 'A' }
])

const rewardsList = ref([
  {
    title: '公司嘉奖通报',
    date: '2019/10/20',
    type: '人力部通报',
    description: '成功落地多重商业项目计划，带领团队完成地区销售目标'
  },
  {
    title: '论文入选',
    date: '2019/10/20',
    type: '人力部通报',
    description: '成功落地多重商业项目计划，带领团队完成地区销售目标'
  }
])

const penaltiesList = ref([
  {
    title: '论文入选',
    date: '2019/10/20',
    type: '人力部通报',
    description: '个人原因晚交出差费用计划，给部门财务结算造成困扰'
  },
  {
    title: '论文入选',
    date: '2019/10/20',
    type: '人力部通报',
    description: '个人原因晚交出差费用计划，给部门财务结算造成困扰'
  }
])

const learningRecords = ref([
  { name: '内部课程', completed: '0', pending: '2', total: '-', certificatesEarned: '0/0%', certificatesPending: '0/0%' },
  { name: '外部课程', completed: '0', pending: '0', total: '2', certificatesEarned: '0/0%', certificatesPending: '0/0%' },
  { name: 'E-learning', completed: '0', pending: '1', total: '-', certificatesEarned: '0/0%', certificatesPending: '0/0%' },
  { name: '专业课程', completed: '3', pending: '3', total: '3', certificatesEarned: '3/0%', certificatesPending: '3/0%' }
])

const competencyMatrix = ref([
  [
    { label: '明星员工', level: 'high' },
    { label: '中等', level: 'medium' },
    { label: '问题员工', level: 'low' }
  ],
  [
    { label: '潜力股', level: 'medium' },
    { label: '中等', level: 'medium active' },
    { label: '勤奋者', level: 'medium' }
  ],
  [
    { label: '待观察', level: 'low' },
    { label: '绩效明星', level: 'medium' },
    { label: '业绩', level: 'low' }
  ]
])
</script>

<style scoped>
.user-profile-container {
  padding: 24px;
  background: var(--bg-primary);
  min-height: 100vh;
}

/* 头部信息 */
.profile-header {
  background: linear-gradient(135deg, var(--bg-secondary) 0%, rgba(24, 144, 255, 0.03) 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border: 2px solid var(--border-color);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.profile-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #00F3FF 0%, #0078D7 25%, #1D4ED8 50%, #00B0FF 75%, #00F3FF 100%);
  background-size: 200% 100%;
  animation: rainbow-shimmer 6s linear infinite;
}

@keyframes rainbow-shimmer {
  0% { background-position: 0% 0; }
  100% { background-position: 200% 0; }
}

.profile-header:hover {
  border-color: var(--primary-color);
  box-shadow: 0 8px 32px rgba(24, 144, 255, 0.15);
}

.user-basic {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.avatar-section {
  flex-shrink: 0;
  position: relative;
}

.avatar-section::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  padding: 4px;
  background: linear-gradient(135deg, #00F3FF, #0078D7, #1D4ED8, #00B0FF);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: avatar-glow 3s linear infinite;
}

@keyframes avatar-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.user-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--bg-secondary);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(24, 144, 255, 0.3);
}

.user-identity {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}

.user-id {
  font-size: 16px;
  color: var(--text-secondary);
}

.status-tag {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.status-tag.active {
  background: #e6f7ff;
  color: #1890ff;
  border-color: #91d5ff;
}

.user-info-tags {
  display: flex;
  gap: 8px;
}

.info-tag {
  padding: 4px 12px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  font-size: 14px;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #00F3FF 0%, #0078D7 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 120, 215, 0.3);
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 243, 255, 0.4);
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn:active {
  transform: translateY(0);
}

/* 标签页 */
.tabs-container {
  display: flex;
  gap: 8px;
  background: var(--bg-secondary);
  padding: 12px 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid var(--border-color);
  overflow-x: auto;
}

.tab-item {
  padding: 8px 20px;
  cursor: pointer;
  white-space: nowrap;
  border-radius: 4px;
  color: var(--text-secondary);
  transition: all 0.3s;
  font-size: 14px;
}

.tab-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.tab-item.active {
  background: var(--primary-color);
  color: white;
}

/* 内容区域 */
.profile-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-card {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 0;
  border: 2px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.section-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #00F3FF 0%, #0078D7 50%, #00F3FF 100%);
  background-size: 200% 100%;
  animation: shimmer 3s linear infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.section-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 8px 24px rgba(24, 144, 255, 0.2);
  transform: translateY(-4px);
}

/* 不同功能区的顶部渐变色 */
.personal-info-card::before {
  background: linear-gradient(90deg, #00F3FF 0%, #0078D7 100%);
}

.education-card::before {
  background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
}

.reporting-card::before {
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
}

.experience-card::before {
  background: linear-gradient(90deg, #fa709a 0%, #fee140 100%);
}

.responsibilities-card::before {
  background: linear-gradient(90deg, #30cfd0 0%, #330867 100%);
}

.performance-card::before {
  background: linear-gradient(90deg, #a8edea 0%, #fed6e3 100%);
}

.rewards-card::before {
  background: linear-gradient(90deg, #ffecd2 0%, #fcb69f 100%);
}

.learning-card::before {
  background: linear-gradient(90deg, #ff9a9e 0%, #fecfef 100%);
}

.competency-card::before {
  background: linear-gradient(90deg, #a1c4fd 0%, #c2e9fb 100%);
}

/* 新的卡片头部设计 */
.section-header {
  padding: 24px 28px;
  background: linear-gradient(135deg, var(--bg-tertiary) 0%, rgba(255, 255, 255, 0.02) 100%);
  border-bottom: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
}

.section-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.section-header-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.section-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 400;
}

.title-action {
  font-size: 13px;
  color: var(--primary-color);
  cursor: pointer;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s;
  white-space: nowrap;
}

.title-action:hover {
  background: rgba(24, 144, 255, 0.1);
  transform: translateX(4px);
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  padding: 28px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.info-item:hover {
  background: linear-gradient(135deg, var(--bg-tertiary) 0%, rgba(24, 144, 255, 0.03) 100%);
  border-color: var(--primary-color);
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.info-icon {
  font-size: 24px;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item .label {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item .value {
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 600;
}

/* 表格 */
.table-container {
  overflow-x: auto;
  padding: 28px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: var(--bg-tertiary);
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
  border: 1px solid var(--border-color);
}

.data-table td {
  padding: 12px;
  color: var(--text-secondary);
  font-size: 14px;
  border: 1px solid var(--border-color);
}

.data-table tr:hover {
  background: var(--bg-tertiary);
}

.link-btn {
  color: var(--primary-color);
  text-decoration: none;
  cursor: pointer;
}

.link-btn:hover {
  text-decoration: underline;
}

/* 组织架构图 */
.org-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 28px;
}

.org-level {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.org-node {
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-width: 200px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

.org-node::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--border-color) 0%, var(--primary-color) 100%);
}

.org-node:hover {
  box-shadow: 0 6px 20px rgba(0, 243, 255, 0.2);
  transform: translateY(-4px);
  border-color: #00F3FF;
}

.org-node.leader {
  border-color: #00F3FF;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, rgba(0, 243, 255, 0.05) 100%);
  box-shadow: 0 4px 16px rgba(0, 243, 255, 0.15);
}

.org-node.leader::before {
  background: linear-gradient(90deg, #00F3FF 0%, #0078D7 100%);
}

.node-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.org-node:hover .node-avatar {
  border-color: #00F3FF;
  box-shadow: 0 4px 12px rgba(0, 243, 255, 0.3);
  transform: scale(1.05);
}

.node-info {
  text-align: center;
}

.node-name {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 15px;
}

.node-title {
  color: var(--text-secondary);
  font-size: 13px;
  margin-top: 4px;
}

.node-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 4px;
}

.node-tag {
  padding: 4px 12px;
  background: linear-gradient(135deg, #e6f7ff 0%, rgba(0, 243, 255, 0.1) 100%);
  color: #0078D7;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid rgba(0, 243, 255, 0.2);
  transition: all 0.3s ease;
}

.org-node:hover .node-tag {
  background: linear-gradient(135deg, rgba(0, 243, 255, 0.15) 0%, rgba(0, 120, 215, 0.15) 100%);
  border-color: #00F3FF;
  color: #00F3FF;
}

.org-connector {
  width: 3px;
  height: 40px;
  background: linear-gradient(180deg, rgba(0, 243, 255, 0.3) 0%, rgba(0, 120, 215, 0.5) 50%, rgba(0, 243, 255, 0.3) 100%);
  border-radius: 2px;
  position: relative;
}

.org-connector::before,
.org-connector::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  background: #00F3FF;
  border: 2px solid var(--bg-secondary);
  border-radius: 50%;
  left: 50%;
  transform: translateX(-50%);
}

.org-connector::before {
  top: -4px;
}

.org-connector::after {
  bottom: -4px;
}

/* 时间线 */
.timeline {
  position: relative;
  padding: 28px;
  padding-left: 58px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 9px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--border-color);
}

.timeline-item {
  position: relative;
  margin-bottom: 24px;
}

.timeline-dot {
  position: absolute;
  left: -26px;
  top: 8px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary-color);
  border: 3px solid var(--bg-secondary);
  z-index: 1;
}

.timeline-dot.warning {
  background: #faad14;
}

.timeline-content {
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid var(--border-color);
}

.timeline-header {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
}

.timeline-date {
  color: var(--text-secondary);
  font-size: 13px;
}

.timeline-tag {
  padding: 2px 8px;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 4px;
  font-size: 12px;
}

.timeline-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timeline-position {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 15px;
}

.timeline-company {
  color: var(--text-secondary);
  font-size: 14px;
}

.timeline-desc {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

/* 奖惩信息 */
.rewards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  padding: 28px;
}

.rewards-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reward-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.3s;
}

.reward-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.reward-icon {
  flex-shrink: 0;
}

.reward-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.reward-title {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 15px;
}

.reward-date {
  color: var(--text-secondary);
  font-size: 13px;
}

.reward-desc {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.5;
}

/* 9宫格胜任力模型 */
.competency-matrix {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
  padding: 48px 28px;
}

.matrix-y-axis {
  display: flex;
  gap: 12px;
  align-items: center;
}

.matrix-y-axis .axis-label {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 16px;
}

.matrix-y-axis .axis-values {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.matrix-y-axis .axis-values div {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 14px;
}

.matrix-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.matrix-row {
  display: flex;
  gap: 8px;
}

.matrix-cell {
  width: 120px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.matrix-cell.high {
  background: linear-gradient(135deg, #bae7ff 0%, #91d5ff 100%);
  color: #0050b3;
}

.matrix-cell.medium {
  background: linear-gradient(135deg, #d9f7be 0%, #b7eb8f 100%);
  color: #389e0d;
}

.matrix-cell.low {
  background: linear-gradient(135deg, #ffe7ba 0%, #ffd591 100%);
  color: #ad6800;
}

.matrix-cell.active {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  transform: scale(1.05);
}

.matrix-cell:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.matrix-x-axis {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.matrix-x-axis .axis-label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 16px;
}

.matrix-x-axis .axis-values {
  display: flex;
  gap: 8px;
}

.matrix-x-axis .axis-values div {
  width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 14px;
}

/* 证书页面 */
.certificates-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.certificates-header {
  background: linear-gradient(135deg, var(--bg-secondary) 0%, rgba(0, 230, 118, 0.03) 100%);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 24px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.certificates-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #00E676 0%, #00C853 100%);
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.page-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.header-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}

/* 证书网格 */
.certificates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

.certificate-card {
  background: var(--bg-secondary);
  border: 4px solid #00E676;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 230, 118, 0.2), inset 0 0 0 1px rgba(0, 230, 118, 0.1);
  position: relative;
}

.certificate-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, #00E676 0%, #00C853 50%, #00E676 100%);
  background-size: 200% 100%;
  animation: shimmer-green 3s linear infinite;
}

@keyframes shimmer-green {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.certificate-card:hover {
  border-color: #00C853;
  box-shadow: 0 8px 32px rgba(0, 230, 118, 0.4), 0 0 30px rgba(0, 230, 118, 0.3), inset 0 0 0 2px rgba(0, 230, 118, 0.2);
  transform: translateY(-6px);
}

.certificate-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, var(--bg-tertiary) 0%, rgba(24, 144, 255, 0.02) 100%);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.certificate-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.certificate-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.cert-tag {
  padding: 5px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.cert-tag.valid {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.cert-tag.expired {
  background: #fff1f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

.cert-tag.level {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.certificate-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.certificate-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;
  margin-bottom: 4px;
}

.certificate-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed var(--border-color);
}

.meta-row:last-child {
  border-bottom: none;
}

.meta-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.meta-value {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.meta-value.cert-number {
  font-family: 'Courier New', monospace;
  background: var(--bg-tertiary);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .user-profile-container {
    padding: 16px;
  }

  .profile-header {
    flex-direction: column;
    gap: 16px;
  }

  .tabs-container {
    padding: 8px 12px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .certificates-grid {
    grid-template-columns: 1fr;
  }

  .certificates-header {
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }

  .header-stats {
    width: 100%;
    gap: 12px;
  }

  .stat-item {
    flex: 1;
    padding: 10px 12px;
  }

  .stat-value {
    font-size: 22px;
  }

  .rewards-container {
    grid-template-columns: 1fr;
  }

  .competency-matrix {
    flex-direction: column;
  }

  .matrix-y-axis {
    flex-direction: row;
  }

  .matrix-y-axis .axis-label {
    writing-mode: horizontal-tb;
  }

  .matrix-y-axis .axis-values {
    flex-direction: row;
  }

  .matrix-y-axis .axis-values div {
    width: 100px;
    height: auto;
  }

  .matrix-cell {
    width: 100px;
    height: 80px;
    font-size: 12px;
  }

  .matrix-x-axis .axis-values div {
    width: 100px;
  }
}
</style>
