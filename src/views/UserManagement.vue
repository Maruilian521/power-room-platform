<template>
  <div class="user-management-page">
    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 页面标题区 -->
      <div class="page-header">
        <div class="main-tabs-container">
          <div class="main-tabs">
            <div
              :class="['main-tab-item', { active: activeMainTab === 'users' }]"
              @click="activeMainTab = 'users'"
            >
              用户管理
            </div>
            <div
              :class="['main-tab-item', { active: activeMainTab === 'roles' }]"
              @click="activeMainTab = 'roles'"
            >
              角色权限
            </div>
          </div>

          <!-- 员工状态标签 -->
          <div class="status-tabs-inline" v-if="activeMainTab === 'users'">
            <div
              :class="['status-tab-inline', { active: activeStatus === 'active' }]"
              @click="activeStatus = 'active'"
            >
              员工 <span class="count">(23)</span>
            </div>
            <div
              :class="['status-tab-inline', { active: activeStatus === 'disabled' }]"
              @click="activeStatus = 'disabled'"
            >
              停用员工 <span class="count">(1)</span>
            </div>
            <div
              :class="['status-tab-inline', { active: activeStatus === 'resigned' }]"
              @click="activeStatus = 'resigned'"
            >
              离职员工 <span class="count">(2)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 内容区容器 -->
      <div class="content-wrapper">
        <!-- 用户管理：左侧组织树 -->
        <div class="left-tree-panel" v-if="activeMainTab === 'users'">
          <!-- 顶部创建按钮 -->
          <div class="tree-header">
            <button class="create-btn">
              <el-icon><Plus /></el-icon>
              <span>创建部门/员工</span>
            </button>
          </div>

          <div class="tree-item expandable">
            <el-icon class="expand-icon"><CaretRight /></el-icon>
            <span class="tree-label">招聘员工/教工</span>
          </div>

          <div class="tree-item expandable expanded">
            <el-icon class="expand-icon"><CaretBottom /></el-icon>
            <span class="tree-label">潜阳网配管理</span>
          </div>
          <div class="tree-item child">
            <el-icon class="child-icon"><CaretRight /></el-icon>
            <span class="tree-label">运行/维修班组</span>
          </div>
          <div class="tree-item child">
            <el-icon class="child-icon"><CaretRight /></el-icon>
            <span class="tree-label">物资中心/屋室中心</span>
          </div>

          <div class="tree-item expandable">
            <el-icon class="expand-icon"><CaretRight /></el-icon>
            <span class="tree-label">质检中心/屋室中心</span>
          </div>

          <div class="tree-item expandable">
            <el-icon class="expand-icon"><CaretRight /></el-icon>
            <span class="tree-label">质量管理部门</span>
          </div>

          <div class="tree-item expandable">
            <el-icon class="expand-icon"><CaretRight /></el-icon>
            <span class="tree-label">销售管理/行政部门</span>
          </div>
        </div>

        <!-- 用户管理：右侧内容区 -->
        <div class="right-content-panel" v-if="activeMainTab === 'users'">
          <!-- 操作按钮栏 -->
          <div class="action-buttons-bar">
            <div class="left-actions">
              <button class="action-btn btn-primary">
                <el-icon><Key /></el-icon>
                <span>修改密码</span>
              </button>
              <button class="action-btn btn-success">
                <el-icon><Check /></el-icon>
                <span>常用员工</span>
              </button>
              <button class="action-btn btn-warning">
                <el-icon><DeleteFilled /></el-icon>
                <span>删除部门</span>
              </button>
            </div>
            <div class="right-actions">
              <div class="search-box">
                <el-icon class="search-icon"><Search /></el-icon>
                <input type="text" placeholder="搜索用户" v-model="searchText" />
              </div>
              <button class="action-btn btn-export">
                导入/导出
                <el-icon class="dropdown-icon"><CaretBottom /></el-icon>
              </button>
            </div>
          </div>

          <!-- 用户列表表格 -->
          <div class="user-table-container">
            <el-table
              :data="displayUsers"
              style="width: 100%"
              @selection-change="handleSelectionChange"
              row-key="id"
            >
              <el-table-column type="selection" width="50" />
              <el-table-column type="index" label="序号" width="70" />
              <el-table-column label="姓名（账户名）" min-width="160">
                <template #default="{ row }">
                  <div class="name-cell">
                    <span class="user-name">{{ row.name }}</span>
                    <span class="user-account">（{{ row.account }}）</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="phone" label="联系电话" width="130" />
              <el-table-column prop="email" label="邮箱" min-width="180">
                <template #default="{ row }">
                  <span class="email-cell">{{ row.email || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="department" label="部门" width="100" />
              <el-table-column label="证书" width="120">
                <template #default="{ row }">
                  <span v-if="row.certificate" class="certificate-badge">{{ row.certificate }}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="权限" min-width="140">
                <template #default="{ row }">
                  <span class="role-tag">{{ row.roleName }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="140" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="openEditUserDialog(row)">编辑</el-button>
                  <el-button link type="warning" size="small" @click="openPermissionDialog(row)">权限</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 分页 -->
          <div class="pagination-bar">
            <div class="pagination-container">
              <button class="page-btn active">1</button>
              <button class="page-btn" @click="currentPage = 2">2</button>
              <button class="page-btn" @click="currentPage = 3">3</button>
              <span class="page-separator">|</span>
              <span class="page-info">1/3</span>
              <span class="page-separator">|</span>
              <button class="page-btn nav-btn">跳</button>
              <input type="text" class="page-input" placeholder="1" v-model="jumpPage" />
            </div>
          </div>
        </div>

        <!-- 角色权限：主内容区 -->
        <div class="roles-content-panel" v-if="activeMainTab === 'roles'">
          <!-- 角色状态标签 + 搜索框 -->
          <div class="role-status-tabs">
            <div class="tabs-left">
              <div
                :class="['status-tab', { active: activeRoleStatus === 'all' }]"
                @click="activeRoleStatus = 'all'"
              >
                全部角色 ({{ roles.length }})
              </div>
              <div
                :class="['status-tab', { active: activeRoleStatus === 'disabled' }]"
                @click="activeRoleStatus = 'disabled'"
              >
                停用角色 (1)
              </div>
              <div
                :class="['status-tab', { active: activeRoleStatus === 'deleted' }]"
                @click="activeRoleStatus = 'deleted'"
              >
                删除角色 (2)
              </div>
            </div>
            <div class="tabs-right">
              <div class="search-box">
                <el-icon class="search-icon"><Search /></el-icon>
                <input type="text" placeholder="搜索角色名称" v-model="roleSearchText" />
              </div>
              <button class="search-btn">搜索</button>
            </div>
          </div>

          <!-- 主体内容：左右布局 -->
          <div class="roles-main-content">
            <!-- 左侧角色列表 -->
            <div class="roles-left-panel">
              <button class="create-role-btn">
                <el-icon><Plus /></el-icon>
                <span>创建角色</span>
              </button>

              <div
                v-for="role in roles"
                :key="role.id"
                :class="['role-item', { active: activeRoleId === role.id }]"
                @click="activeRoleId = role.id"
              >
                {{ role.name }}
              </div>
            </div>

            <!-- 右侧权限配置区 -->
            <div class="roles-right-panel">
              <!-- 权限类型标签 -->
              <div class="permission-type-tabs">
                <button
                  :class="['permission-tab', 'tab-menu', { active: activePermissionTab === 'menu' }]"
                  @click="activePermissionTab = 'menu'"
                >
                  <el-icon><Key /></el-icon>
                  <span>菜单权限</span>
                </button>
                <button
                  :class="['permission-tab', 'tab-view', { active: activePermissionTab === 'view' }]"
                  @click="activePermissionTab = 'view'"
                >
                  <el-icon><Search /></el-icon>
                  <span>查看权限</span>
                </button>
                <button
                  :class="['permission-tab', 'tab-operation', { active: activePermissionTab === 'operation' }]"
                  @click="activePermissionTab = 'operation'"
                >
                  <el-icon><Setting /></el-icon>
                  <span>操作权限</span>
                </button>
              </div>

              <!-- 权限内容区域 -->
              <div class="permissions-content">
                <!-- 菜单权限（表格布局） -->
                <div v-if="activePermissionTab === 'menu'" class="menu-permissions-table">
                  <div
                    v-for="menu in menuPermissions"
                    :key="menu.id"
                    class="menu-row"
                  >
                    <div class="menu-category">{{ menu.name }}</div>
                    <div class="menu-items">
                      <label
                        v-for="child in menu.children"
                        :key="child.id"
                        class="menu-checkbox-item"
                      >
                        <input type="checkbox" v-model="child.checked" />
                        <span>{{ child.name }}</span>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- 查看权限（横向布局） -->
                <div v-if="activePermissionTab === 'view'" class="view-permissions-grid">
                  <label
                    v-for="view in viewPermissions"
                    :key="view.id"
                    class="permission-checkbox-item"
                  >
                    <input type="checkbox" v-model="view.checked" />
                    <span>{{ view.name }}</span>
                  </label>
                </div>

                <!-- 操作权限（横向布局） -->
                <div v-if="activePermissionTab === 'operation'" class="operation-permissions-grid">
                  <label
                    v-for="op in operationPermissions"
                    :key="op.id"
                    class="permission-checkbox-item"
                  >
                    <input type="checkbox" v-model="op.checked" />
                    <span>{{ op.name }}</span>
                  </label>
                </div>
              </div>

              <!-- 底部按钮 -->
              <div class="permission-actions">
                <button class="btn-all" @click="handlePermissionSelectAll">全选</button>
                <button class="btn-confirm">确定</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 用户编辑弹窗 ==================== -->
    <el-dialog
      v-model="editUserDialogVisible"
      :title="isEditMode ? '编辑用户' : '新增用户'"
      width="600px"
      :close-on-click-modal="false"
      class="user-edit-dialog"
    >
      <div class="dialog-form">
        <div class="form-row">
          <div class="form-item">
            <label class="form-label required">姓名</label>
            <el-input v-model="editUserForm.name" placeholder="请输入姓名" />
          </div>
          <div class="form-item">
            <label class="form-label required">账户名</label>
            <el-input v-model="editUserForm.account" placeholder="请输入账户名" :disabled="isEditMode" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-item">
            <label class="form-label required">联系电话</label>
            <el-input v-model="editUserForm.phone" placeholder="请输入联系电话" />
          </div>
          <div class="form-item">
            <label class="form-label">邮箱</label>
            <el-input v-model="editUserForm.email" placeholder="请输入邮箱" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-item full-width">
            <label class="form-label required">所属部门</label>
            <div class="department-select">
              <el-select
                v-model="editUserForm.departments"
                multiple
                placeholder="请选择部门（可多选）"
                style="width: 100%"
              >
                <el-option
                  v-for="dept in departmentOptions"
                  :key="dept.id"
                  :label="dept.name"
                  :value="dept.id"
                />
              </el-select>
            </div>
            <div class="selected-departments" v-if="editUserForm.departments.length > 0">
              <span
                v-for="deptId in editUserForm.departments"
                :key="deptId"
                class="dept-tag"
              >
                {{ getDepartmentName(deptId) }}
                <el-icon class="remove-dept" @click="removeDepartment(deptId)"><Close /></el-icon>
              </span>
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-item">
            <label class="form-label">职位</label>
            <el-input v-model="editUserForm.position" placeholder="请输入职位" />
          </div>
          <div class="form-item">
            <label class="form-label">证书</label>
            <el-select v-model="editUserForm.certificate" placeholder="选择证书" clearable>
              <el-option label="高级电工证" value="高级电工证" />
              <el-option label="中级电工证" value="中级电工证" />
              <el-option label="初级电工证" value="初级电工证" />
            </el-select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-item">
            <label class="form-label required">角色</label>
            <el-select v-model="editUserForm.roleId" placeholder="选择角色">
              <el-option
                v-for="role in roles"
                :key="role.id"
                :label="role.name"
                :value="role.id"
              />
            </el-select>
          </div>
          <div class="form-item">
            <label class="form-label">状态</label>
            <el-select v-model="editUserForm.status" placeholder="选择状态">
              <el-option label="在职" value="active" />
              <el-option label="停用" value="disabled" />
              <el-option label="离职" value="resigned" />
            </el-select>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <button class="action-btn btn-secondary" @click="editUserDialogVisible = false">取消</button>
          <button class="action-btn btn-primary" @click="saveUser">
            <el-icon><Check /></el-icon>
            确认保存
          </button>
        </div>
      </template>
    </el-dialog>

    <!-- ==================== 权限分配弹窗 ==================== -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="用户权限分配"
      width="800px"
      :close-on-click-modal="false"
      class="permission-dialog"
    >
      <div class="permission-dialog-content">
        <!-- 用户信息头 -->
        <div class="user-info-header">
          <div class="user-avatar">
            <el-icon><User /></el-icon>
          </div>
          <div class="user-details">
            <div class="user-name">{{ currentPermissionUser?.name }}</div>
            <div class="user-meta">
              <span>账号: {{ currentPermissionUser?.account }}</span>
              <span>部门: {{ currentPermissionUser?.department }}</span>
              <span>职位: {{ currentPermissionUser?.position }}</span>
            </div>
          </div>
          <div class="current-role">
            <span class="role-label">当前角色</span>
            <span class="role-value">{{ currentPermissionUser?.roleName }}</span>
          </div>
        </div>

        <!-- 权限配置区 -->
        <div class="permission-config-area">
          <!-- 快速角色选择 -->
          <div class="quick-role-section">
            <div class="section-header">
              <el-icon><UserFilled /></el-icon>
              <span>快速分配角色</span>
            </div>
            <div class="role-cards">
              <div
                v-for="role in roles"
                :key="role.id"
                :class="['role-card', { active: userPermissionForm.roleId === role.id }]"
                @click="selectQuickRole(role)"
              >
                <div class="role-name">{{ role.name }}</div>
                <div class="role-count">{{ role.userCount }} 人使用</div>
              </div>
            </div>
          </div>

          <!-- 详细权限配置 -->
          <div class="detail-permission-section">
            <div class="section-header">
              <el-icon><Key /></el-icon>
              <span>详细权限配置</span>
              <el-switch
                v-model="showDetailPermission"
                active-text="展开"
                inactive-text="收起"
                :active-color="'#00f3ff'"
                :inactive-color="'#3E5878'"
              />
            </div>

            <div class="detail-permissions" v-if="showDetailPermission">
              <!-- 菜单权限 -->
              <div class="permission-group">
                <div class="group-title">
                  <el-icon><Menu /></el-icon>
                  菜单权限
                </div>
                <div class="permission-checkboxes">
                  <template v-for="menu in userMenuPermissions" :key="menu.id">
                    <label class="permission-checkbox parent">
                      <input type="checkbox" v-model="menu.checked" @change="toggleParentMenu(menu)" />
                      <span>{{ menu.name }}</span>
                    </label>
                    <label
                      v-for="child in menu.children"
                      :key="child.id"
                      class="permission-checkbox child"
                    >
                      <input type="checkbox" v-model="child.checked" />
                      <span>{{ child.name }}</span>
                    </label>
                  </template>
                </div>
              </div>

              <!-- 查看权限 -->
              <div class="permission-group">
                <div class="group-title">
                  <el-icon><View /></el-icon>
                  配电室查看权限
                </div>
                <div class="permission-checkboxes inline">
                  <label
                    v-for="view in userViewPermissions"
                    :key="view.id"
                    class="permission-checkbox"
                  >
                    <input type="checkbox" v-model="view.checked" />
                    <span>{{ view.name }}</span>
                  </label>
                </div>
              </div>

              <!-- 操作权限 -->
              <div class="permission-group">
                <div class="group-title">
                  <el-icon><Operation /></el-icon>
                  操作权限
                </div>
                <div class="permission-checkboxes inline">
                  <label
                    v-for="op in userOperationPermissions"
                    :key="op.id"
                    class="permission-checkbox"
                  >
                    <input type="checkbox" v-model="op.checked" />
                    <span>{{ op.name }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <button class="action-btn btn-secondary" @click="permissionDialogVisible = false">取消</button>
          <button class="action-btn btn-warning" @click="resetPermissions">
            <el-icon><Refresh /></el-icon>
            重置权限
          </button>
          <button class="action-btn btn-primary" @click="savePermissions">
            <el-icon><Check /></el-icon>
            保存权限
          </button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search, Key, Check, DeleteFilled, CaretRight, CaretBottom, Plus, Setting, User,
  Close, Refresh, UserFilled, Menu, View, Operation
} from '@element-plus/icons-vue'

const activeMainTab = ref('users')
const activeStatus = ref('active')
const searchText = ref('')
const roleSearchText = ref('')
const currentPage = ref(1)
const jumpPage = ref('')
const activeRoleId = ref(1)
const activePermissionTab = ref('menu')
const activeRoleStatus = ref('all')

interface User {
  id: number
  name: string
  account: string
  phone: string
  email?: string
  department: string
  departments?: number[] // 多部门支持
  position: string
  certificate?: string
  status: string
  roleId: number // 关联角色ID
  roleName: string // 角色名称
  selected?: boolean // 是否选中
}

// 部门选项
interface Department {
  id: number
  name: string
  parentId?: number
}

const departmentOptions = ref<Department[]>([
  { id: 1, name: '运维部' },
  { id: 2, name: '人事部' },
  { id: 3, name: '财务部' },
  { id: 4, name: '行政部' },
  { id: 5, name: '运行/维修班组', parentId: 1 },
  { id: 6, name: '物资中心', parentId: 1 },
  { id: 7, name: '质检中心' },
  { id: 8, name: '销售管理部' }
])

// ========== 用户编辑弹窗 ==========
const editUserDialogVisible = ref(false)
const isEditMode = ref(false)
const editUserForm = ref({
  id: 0,
  name: '',
  account: '',
  phone: '',
  email: '',
  departments: [] as number[],
  position: '',
  certificate: '',
  roleId: 0,
  status: 'active'
})

const openEditUserDialog = (user?: User) => {
  if (user) {
    isEditMode.value = true
    editUserForm.value = {
      id: user.id,
      name: user.name,
      account: user.account,
      phone: user.phone,
      email: user.email || '',
      departments: user.departments || [departmentOptions.value.find(d => d.name === user.department)?.id || 1],
      position: user.position,
      certificate: user.certificate || '',
      roleId: user.roleId,
      status: user.status
    }
  } else {
    isEditMode.value = false
    editUserForm.value = {
      id: 0,
      name: '',
      account: '',
      phone: '',
      email: '',
      departments: [],
      position: '',
      certificate: '',
      roleId: 0,
      status: 'active'
    }
  }
  editUserDialogVisible.value = true
}

const getDepartmentName = (deptId: number) => {
  return departmentOptions.value.find(d => d.id === deptId)?.name || ''
}

const removeDepartment = (deptId: number) => {
  editUserForm.value.departments = editUserForm.value.departments.filter(id => id !== deptId)
}

const saveUser = () => {
  if (!editUserForm.value.name) {
    ElMessage.warning('请输入姓名')
    return
  }
  if (!editUserForm.value.account) {
    ElMessage.warning('请输入账户名')
    return
  }
  if (!editUserForm.value.phone) {
    ElMessage.warning('请输入联系电话')
    return
  }
  if (editUserForm.value.departments.length === 0) {
    ElMessage.warning('请选择至少一个部门')
    return
  }
  if (!editUserForm.value.roleId) {
    ElMessage.warning('请选择角色')
    return
  }

  if (isEditMode.value) {
    // 更新用户
    const index = users.value.findIndex(u => u.id === editUserForm.value.id)
    if (index > -1) {
      const role = roles.value.find(r => r.id === editUserForm.value.roleId)
      users.value[index] = {
        ...users.value[index],
        name: editUserForm.value.name,
        phone: editUserForm.value.phone,
        email: editUserForm.value.email || undefined,
        department: getDepartmentName(editUserForm.value.departments[0]),
        departments: editUserForm.value.departments,
        position: editUserForm.value.position,
        certificate: editUserForm.value.certificate || undefined,
        roleId: editUserForm.value.roleId,
        roleName: role?.name || '',
        status: editUserForm.value.status
      }
    }
    ElMessage.success('用户信息已更新')
  } else {
    // 新增用户
    const role = roles.value.find(r => r.id === editUserForm.value.roleId)
    users.value.push({
      id: users.value.length + 1,
      name: editUserForm.value.name,
      account: editUserForm.value.account,
      phone: editUserForm.value.phone,
      email: editUserForm.value.email || undefined,
      department: getDepartmentName(editUserForm.value.departments[0]),
      departments: editUserForm.value.departments,
      position: editUserForm.value.position,
      certificate: editUserForm.value.certificate || undefined,
      roleId: editUserForm.value.roleId,
      roleName: role?.name || '',
      status: editUserForm.value.status
    })
    ElMessage.success('用户已创建')
  }
  editUserDialogVisible.value = false
}

// ========== 权限分配弹窗 ==========
const permissionDialogVisible = ref(false)
const currentPermissionUser = ref<User | null>(null)
const showDetailPermission = ref(false)
const userPermissionForm = ref({
  roleId: 0
})

// 用户菜单权限（独立副本）
const userMenuPermissions = ref([
  {
    id: 1, name: '驾驶舱', checked: false,
    children: [
      { id: 101, name: '电器图', checked: false },
      { id: 102, name: '智慧运维中心', checked: false },
      { id: 103, name: '无人配电指挥中心', checked: false },
      { id: 104, name: 'AI安全态势', checked: false }
    ]
  },
  {
    id: 2, name: '智能监控中心', checked: false,
    children: [
      { id: 201, name: '站点列表监控', checked: false },
      { id: 202, name: '视频巡视中心', checked: false },
      { id: 203, name: '环境与安防', checked: false },
      { id: 204, name: '站点监控地图', checked: false }
    ]
  },
  {
    id: 3, name: '运维作业中心', checked: false,
    children: [
      { id: 301, name: '告警与事件', checked: false },
      { id: 302, name: '工单管理', checked: false },
      { id: 303, name: '巡检管理', checked: false },
      { id: 304, name: '两票管理', checked: false },
      { id: 305, name: '知识库', checked: false }
    ]
  },
  {
    id: 4, name: '资产台账管理', checked: false,
    children: [
      { id: 401, name: '配电室台账', checked: false },
      { id: 402, name: '设备台账', checked: false },
      { id: 403, name: '商品备件', checked: false }
    ]
  },
  {
    id: 5, name: '分析与报表', checked: false,
    children: [
      { id: 501, name: '运维报表', checked: false },
      { id: 502, name: '电能质量', checked: false },
      { id: 503, name: '设备健康', checked: false },
      { id: 504, name: '负荷分析', checked: false }
    ]
  },
  {
    id: 6, name: '系统配置', checked: false,
    children: [
      { id: 601, name: '邮件提醒', checked: false },
      { id: 602, name: '系统提醒', checked: false }
    ]
  }
])

const userViewPermissions = ref([
  { id: 1, name: '圆心配电室', checked: false },
  { id: 2, name: '通州配电室', checked: false },
  { id: 3, name: '北理工配电室', checked: false },
  { id: 4, name: '圆心配电室3', checked: false },
  { id: 5, name: '圆心配电室4', checked: false },
  { id: 6, name: '顺义配电室', checked: false }
])

const userOperationPermissions = ref([
  { id: 1, name: '处置报警', checked: false },
  { id: 2, name: '导出报表', checked: false },
  { id: 3, name: '新增', checked: false },
  { id: 4, name: '删除', checked: false },
  { id: 5, name: '修改', checked: false },
  { id: 6, name: '查询', checked: false }
])

const openPermissionDialog = (user: User) => {
  currentPermissionUser.value = user
  userPermissionForm.value.roleId = user.roleId
  showDetailPermission.value = false
  permissionDialogVisible.value = true
}

const selectQuickRole = (role: Role) => {
  userPermissionForm.value.roleId = role.id
  ElMessage.info(`已选择角色: ${role.name}`)
}

const toggleParentMenu = (menu: any) => {
  menu.children?.forEach((child: any) => {
    child.checked = menu.checked
  })
}

const resetPermissions = () => {
  userMenuPermissions.value.forEach(menu => {
    menu.checked = false
    menu.children?.forEach(child => {
      child.checked = false
    })
  })
  userViewPermissions.value.forEach(v => v.checked = false)
  userOperationPermissions.value.forEach(o => o.checked = false)
  ElMessage.info('权限已重置')
}

const savePermissions = () => {
  if (!currentPermissionUser.value) return

  const role = roles.value.find(r => r.id === userPermissionForm.value.roleId)
  if (role) {
    currentPermissionUser.value.roleId = role.id
    currentPermissionUser.value.roleName = role.name

    // 更新用户列表中的数据
    const index = users.value.findIndex(u => u.id === currentPermissionUser.value?.id)
    if (index > -1) {
      users.value[index].roleId = role.id
      users.value[index].roleName = role.name
    }
  }

  ElMessage.success('权限已保存')
  permissionDialogVisible.value = false
}

// 选中的用户
const selectedUsers = ref<User[]>([])

// 处理表格选择变化
const handleSelectionChange = (selection: User[]) => {
  selectedUsers.value = selection
}

const users = ref<User[]>([
  {
    id: 1,
    name: '马瑞莲',
    account: 'maruilian',
    phone: '15501298576',
    email: 'maruilian@example.com',
    department: '运维部',
    position: '运维总监',
    certificate: '高级电工证',
    status: 'active',
    roleId: 1,
    roleName: '超级管理员',
    selected: false
  },
  {
    id: 2,
    name: '张伟',
    account: 'zhangwei',
    phone: '13800138001',
    email: 'zhangwei@example.com',
    department: '运维部',
    position: '系统管理员',
    status: 'active',
    roleId: 2,
    roleName: '系统设置管理员',
    selected: false
  },
  {
    id: 3,
    name: '李明',
    account: 'liming',
    phone: '13900139002',
    email: 'liming@example.com',
    department: '人事部',
    position: '人事主管',
    status: 'active',
    roleId: 3,
    roleName: '员工与部门管理员',
    selected: false
  },
  {
    id: 4,
    name: '王芳',
    account: 'wangfang',
    phone: '13700137003',
    email: 'wangfang@example.com',
    department: '运维部',
    position: '审批专员',
    certificate: '中级电工证',
    status: 'active',
    roleId: 4,
    roleName: '业务审批管理员',
    selected: false
  },
  {
    id: 5,
    name: '刘强',
    account: 'liuqiang',
    phone: '13600136004',
    email: 'liuqiang@example.com',
    department: '行政部',
    position: '办公室主任',
    status: 'active',
    roleId: 5,
    roleName: '办公室管理员',
    selected: false
  },
  {
    id: 6,
    name: '陈静',
    account: 'chenjing',
    phone: '13500135005',
    email: 'chenjing@example.com',
    department: '运维部',
    position: '值班员',
    certificate: '初级电工证',
    status: 'active',
    roleId: 2,
    roleName: '系统设置管理员',
    selected: false
  },
  {
    id: 7,
    name: '赵磊',
    account: 'zhaolei',
    phone: '13400134006',
    email: 'zhaolei@example.com',
    department: '运维部',
    position: '巡检员',
    status: 'active',
    roleId: 4,
    roleName: '业务审批管理员',
    selected: false
  },
  {
    id: 8,
    name: '孙丽',
    account: 'sunli',
    phone: '13300133007',
    email: 'sunli@example.com',
    department: '财务部',
    position: '财务主管',
    status: 'active',
    roleId: 5,
    roleName: '办公室管理员',
    selected: false
  }
])

const displayUsers = computed(() => {
  return users.value.filter(u => u.status === activeStatus.value)
})

// 角色接口定义
interface Role {
  id: number
  name: string
  code: string
  userCount: number
  permissions: string[]
}

// 角色数据
const roles = ref<Role[]>([
  {
    id: 1,
    name: '超级管理员',
    code: 'ADMIN',
    userCount: 3,
    permissions: ['系统管理员', '数据查看', '设备操作', '工单管理', '报表导出']
  },
  {
    id: 2,
    name: '系统设置管理员',
    code: 'SYSTEM_ADMIN',
    userCount: 12,
    permissions: ['数据查看', '设备操作', '工单管理']
  },
  {
    id: 3,
    name: '员工与部门管理员',
    code: 'HR_ADMIN',
    userCount: 5,
    permissions: ['数据查看', '报表导出']
  },
  {
    id: 4,
    name: '业务审批管理员',
    code: 'APPROVAL_ADMIN',
    userCount: 8,
    permissions: ['数据查看']
  },
  {
    id: 5,
    name: '办公室管理员',
    code: 'OFFICE_ADMIN',
    userCount: 6,
    permissions: ['数据查看', '设备操作', '工单管理', '报表导出']
  }
])

// 权限全选功能
const handlePermissionSelectAll = () => {
  if (activePermissionTab.value === 'menu') {
    const allChecked = menuPermissions.value.every(menu =>
      menu.children?.every(child => child.checked)
    )
    menuPermissions.value.forEach(menu => {
      menu.checked = !allChecked
      menu.children?.forEach(child => {
        child.checked = !allChecked
      })
    })
  } else if (activePermissionTab.value === 'view') {
    const allChecked = viewPermissions.value.every(v => v.checked)
    viewPermissions.value.forEach(v => {
      v.checked = !allChecked
    })
  } else if (activePermissionTab.value === 'operation') {
    const allChecked = operationPermissions.value.every(o => o.checked)
    operationPermissions.value.forEach(o => {
      o.checked = !allChecked
    })
  }
}

// 权限项接口
interface PermissionItem {
  id: number
  name: string
  checked: boolean
}

// 菜单权限树形结构
interface MenuPermissionTree {
  id: number
  name: string
  checked: boolean
  children?: PermissionItem[]
}

// 菜单权限（两级结构）- 与设计图一致
const menuPermissions = ref<MenuPermissionTree[]>([
  {
    id: 1,
    name: '驾驶舱',
    checked: false,
    children: [
      { id: 101, name: '电器图', checked: false },
      { id: 102, name: '智慧运维中心', checked: false },
      { id: 103, name: '无人配电指挥中心', checked: false },
      { id: 104, name: 'AI安全态势', checked: false }
    ]
  },
  {
    id: 2,
    name: '智能监控中心',
    checked: false,
    children: [
      { id: 201, name: '站点列表监控', checked: false },
      { id: 202, name: '视频巡视中心', checked: false },
      { id: 203, name: '环境与安防', checked: false },
      { id: 204, name: '站点监控地图', checked: false }
    ]
  },
  {
    id: 3,
    name: '运维作业中心',
    checked: false,
    children: [
      { id: 301, name: '告警与事件', checked: false },
      { id: 302, name: '工单管理', checked: false },
      { id: 303, name: '巡检管理', checked: false },
      { id: 304, name: '两票管理', checked: false },
      { id: 305, name: '知识库', checked: false }
    ]
  },
  {
    id: 4,
    name: '资产台账管理',
    checked: false,
    children: [
      { id: 401, name: '配电室台账', checked: false },
      { id: 402, name: '设备台账', checked: false },
      { id: 403, name: '商品备件', checked: false }
    ]
  },
  {
    id: 5,
    name: '分析与报表',
    checked: false,
    children: [
      { id: 501, name: '运维报表', checked: false },
      { id: 502, name: '电能质量', checked: false },
      { id: 503, name: '设备健康', checked: false },
      { id: 504, name: '负荷分析', checked: false }
    ]
  },
  {
    id: 6,
    name: '系统配置',
    checked: true,
    children: [
      { id: 601, name: '邮件提醒', checked: true },
      { id: 602, name: '系统提醒', checked: true }
    ]
  }
])

// 查看权限（设计稿中的查看权限）- 配电室站点
const viewPermissions = ref<PermissionItem[]>([
  { id: 1, name: '圆心配电室', checked: false },
  { id: 2, name: '通州配电室', checked: false },
  { id: 3, name: '北理工配电室', checked: false },
  { id: 4, name: '圆心配电室3', checked: false },
  { id: 5, name: '圆心配电室4', checked: false },
  { id: 6, name: '圆心配电室5', checked: false },
  { id: 7, name: '顺义配电室', checked: false },
  { id: 8, name: '有待更新', checked: false }
])

// 操作权限（设计稿中的操作权限）
const operationPermissions = ref<PermissionItem[]>([
  { id: 1, name: '处置报警', checked: false },
  { id: 2, name: '导出报表', checked: false },
  { id: 3, name: '新增', checked: false },
  { id: 4, name: '删除', checked: false },
  { id: 5, name: '修改', checked: false },
  { id: 6, name: '查询', checked: false }
])

// 根据权限类型返回不同的样式类
const getPermissionClass = (permission: string) => {
  if (permission.includes('管理员') || permission.includes('系统')) {
    return 'permission-admin'
  } else if (permission.includes('操作') || permission.includes('设备')) {
    return 'permission-operate'
  } else if (permission.includes('工单')) {
    return 'permission-ticket'
  } else if (permission.includes('导出') || permission.includes('报表')) {
    return 'permission-export'
  } else {
    return 'permission-view'
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

/* 全局动画 */
@keyframes scanline {
  0% { background-position: 0% 0%; }
  100% { background-position: 0% 200%; }
}

@keyframes border-pulse {
  0% { box-shadow: 0 0 5px #00F0FF, inset 0 0 5px rgba(0, 240, 255, 0.1); }
  50% { box-shadow: 0 0 15px #00F0FF, inset 0 0 10px rgba(0, 240, 255, 0.3); }
  100% { box-shadow: 0 0 5px #00F0FF, inset 0 0 5px rgba(0, 240, 255, 0.1); }
}

@keyframes corner-flicker {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; filter: drop-shadow(0 0 5px #00F0FF); }
}

.user-management-page {
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

/* 主标签容器 - SC2风格 */
.main-tabs-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  background: transparent;
  gap: 20px;
}

/* 内容包装器 */
.content-wrapper {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 主标签 - 科技切角风格 */
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
  position: relative;
  backdrop-filter: blur(10px);
}

.main-tab-item::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  background: linear-gradient(180deg, rgba(0, 240, 255, 0) 0%, rgba(0, 240, 255, 0.3) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s;
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
  box-shadow: inset 0 0 20px rgba(0, 240, 255, 0.1);
}

.main-tab-item.active::before {
  opacity: 1;
}

/* 内联员工状态标签 - 科技风格 */
.status-tabs-inline {
  display: flex;
  gap: 8px;
}

.status-tab-inline {
  padding: 8px 20px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  color: var(--text-sub);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
}

.status-tab-inline:hover {
  border-color: var(--tech-primary);
  color: var(--tech-primary);
}

.status-tab-inline.active {
  background: rgba(0, 240, 255, 0.15);
  border-color: var(--tech-primary);
  color: var(--text-bright);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
}

.status-tab-inline .count {
  color: var(--tech-primary);
  margin-left: 4px;
  font-family: 'DIN Alternate', sans-serif;
}

/* 主容器 - 科技卡片风格 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(13, 18, 26, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 240, 255, 0.2);
  box-shadow:
    inset 0 0 20px rgba(0, 0, 0, 0.5),
    0 5px 15px rgba(0, 0, 0, 0.3);
  position: relative;
  clip-path: polygon(
    20px 0, 100% 0,
    100% calc(100% - 20px), calc(100% - 20px) 100%,
    0 100%, 0 20px
  );
}

/* 扫描边框效果 */
.main-container::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  background: linear-gradient(180deg,
    rgba(0, 240, 255, 0.1) 0%,
    rgba(0, 240, 255, 0.6) 50%,
    rgba(0, 240, 255, 0.1) 100%
  );
  background-size: 100% 200%;
  animation: scanline 4s linear infinite;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0.6;
}

/* 角落装饰 */
.main-container::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, #00F0FF 15px, transparent 0) top left,
    linear-gradient(-45deg, #00F0FF 15px, transparent 0) bottom right;
  background-size: 25px 25px;
  background-repeat: no-repeat;
  pointer-events: none;
  opacity: 0.4;
  animation: corner-flicker 3s infinite alternate;
}

/* 左侧树 - 科技面板 */
.left-tree-panel {
  width: 220px;
  background: rgba(0, 0, 0, 0.2);
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(0, 240, 255, 0.1);
  position: relative;
}

.tree-header {
  padding: 0;
  margin-bottom: 16px;
  background: transparent;
  border: none;
}

.create-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(0, 240, 255, 0.05);
  border: 1px solid rgba(0, 240, 255, 0.3);
  color: var(--tech-primary);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s;
  clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
}

.create-btn:hover {
  background: rgba(0, 240, 255, 0.15);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
  transform: translateY(-1px);
}

.tree-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  color: var(--text-sub);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  margin: 2px 0;
  border-left: 2px solid transparent;
  position: relative;
}

.tree-item:hover {
  background: rgba(0, 240, 255, 0.05);
  color: var(--text-bright);
  border-left-color: var(--tech-primary);
  padding-left: 16px;
}

.tree-item.child {
  padding-left: 32px;
}

.tree-item.child:hover {
  padding-left: 36px;
}

.expand-icon,
.child-icon {
  font-size: 12px;
  margin-right: 8px;
  color: var(--tech-primary);
  filter: drop-shadow(0 0 3px rgba(0, 240, 255, 0.5));
}

.tree-item.expanded .expand-icon {
  transform: rotate(0deg);
}

/* 右侧内容 */
.right-content-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: transparent;
  padding: 24px;
  overflow: hidden;
  gap: 16px;
}

/* 操作按钮栏 */
.action-buttons-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-actions,
.right-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

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
  backdrop-filter: blur(5px);
  clip-path: polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px);
  position: relative;
}

.action-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0;
  background: currentColor;
  transition: opacity 0.2s;
}

.action-btn:hover::before {
  opacity: 0.1;
}

.btn-primary {
  border-color: var(--tech-primary);
  color: var(--tech-primary);
}

.btn-primary:hover {
  border-color: var(--tech-primary);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
  text-shadow: 0 0 5px rgba(0, 240, 255, 0.5);
}

.btn-success {
  border-color: var(--status-success);
  color: var(--status-success);
}

.btn-success:hover {
  box-shadow: 0 0 10px rgba(0, 255, 157, 0.3);
}

.btn-warning {
  border-color: var(--status-warning);
  color: var(--status-warning);
}

.btn-warning:hover {
  box-shadow: 0 0 10px rgba(255, 179, 0, 0.3);
}

.btn-export {
  border-color: var(--tech-primary);
  color: var(--tech-primary);
}

.btn-export:hover {
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}

.dropdown-icon {
  font-size: 12px;
  margin-left: 4px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  width: 260px;
  clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
  transition: all 0.3s;
}

.search-box:focus-within {
  border-color: var(--tech-primary);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.2);
}

.search-icon {
  color: var(--tech-primary);
  font-size: 14px;
}

.search-box input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-bright);
  font-size: 13px;
  font-family: 'Rajdhani', sans-serif;
}

.search-box input::placeholder {
  color: var(--text-sub);
}

/* 表格容器 - SC2风格 */
.user-table-container {
  flex: 1;
  border: 1px solid rgba(0, 240, 255, 0.15);
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);
  position: relative;
}

/* 表格容器边框光效 */
.user-table-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--tech-primary), transparent);
  box-shadow: 0 0 10px var(--tech-primary);
  opacity: 0.5;
  pointer-events: none;
  z-index: 10;
}

.name-cell {
  display: flex;
  flex-direction: row;
  gap: 2px;
  align-items: center;
}

.user-name {
  color: var(--text-bright);
  font-weight: 600;
  font-size: 14px;
}

.user-account {
  color: var(--text-sub);
  font-size: 12px;
  font-family: 'DIN Alternate', monospace;
}

/* 角色标签样式 */
.role-tag {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(180deg, rgba(0, 243, 255, 0.15), rgba(0, 100, 150, 0.1));
  border: 1px solid #00f3ff;
  color: #00f3ff;
  font-size: 12px;
  font-weight: 600;
  text-shadow: 0 0 8px rgba(0, 243, 255, 0.5);
  white-space: nowrap;
}

.email-cell {
  color: #6d8bad;
  font-size: 12px;
  font-family: 'Roboto', monospace;
}

.certificate-badge {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.4);
  color: var(--tech-primary);
  font-size: 11px;
  font-weight: 600;
  clip-path: polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px);
  text-shadow: 0 0 5px rgba(0, 240, 255, 0.3);
}

/* 权限标签容器 */
.permissions-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  justify-content: flex-start;
}

/* 权限标签基础样式 - SC2风格 */
.permission-tag {
  display: inline-block;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.2s;
  clip-path: polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px);
  position: relative;
}

/* 管理员权限 - 红色 */
.permission-admin {
  background: rgba(255, 42, 77, 0.15);
  border: 1px solid rgba(255, 42, 77, 0.4);
  color: var(--status-danger);
  text-shadow: 0 0 5px rgba(255, 42, 77, 0.3);
}

.permission-admin:hover {
  background: rgba(255, 42, 77, 0.25);
  border-color: var(--status-danger);
  box-shadow: 0 0 8px rgba(255, 42, 77, 0.3);
}

/* 操作权限 - 橙色 */
.permission-operate {
  background: rgba(255, 179, 0, 0.15);
  border: 1px solid rgba(255, 179, 0, 0.4);
  color: var(--status-warning);
  text-shadow: 0 0 5px rgba(255, 179, 0, 0.3);
}

.permission-operate:hover {
  background: rgba(255, 179, 0, 0.25);
  border-color: var(--status-warning);
  box-shadow: 0 0 8px rgba(255, 179, 0, 0.3);
}

/* 工单权限 - 紫色 */
.permission-ticket {
  background: rgba(138, 43, 226, 0.15);
  border: 1px solid rgba(138, 43, 226, 0.4);
  color: #a78bfa;
  text-shadow: 0 0 5px rgba(138, 43, 226, 0.3);
}

.permission-ticket:hover {
  background: rgba(138, 43, 226, 0.25);
  border-color: #a78bfa;
  box-shadow: 0 0 8px rgba(138, 43, 226, 0.3);
}

/* 导出权限 - 绿色 */
.permission-export {
  background: rgba(0, 255, 157, 0.15);
  border: 1px solid rgba(0, 255, 157, 0.4);
  color: var(--status-success);
  text-shadow: 0 0 5px rgba(0, 255, 157, 0.3);
}

.permission-export:hover {
  background: rgba(0, 255, 157, 0.25);
  border-color: var(--status-success);
  box-shadow: 0 0 8px rgba(0, 255, 157, 0.3);
}

/* 查看权限 - 蓝色 */
.permission-view {
  background: rgba(0, 240, 255, 0.15);
  border: 1px solid rgba(0, 240, 255, 0.4);
  color: var(--tech-primary);
  text-shadow: 0 0 5px rgba(0, 240, 255, 0.3);
}

.permission-view:hover {
  background: rgba(0, 240, 255, 0.25);
  border-color: var(--tech-primary);
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
}

/* 无权限提示 */
.no-permission {
  color: var(--text-muted);
  font-size: 12px;
  font-style: italic;
}


/* 分页 - SC2风格 */
.pagination-bar {
  display: flex;
  justify-content: center;
  padding-top: 16px;
}

.pagination-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  color: var(--text-sub);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  clip-path: polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px);
  font-family: 'DIN Alternate', sans-serif;
}

.page-btn:hover {
  border-color: var(--tech-primary);
  color: var(--tech-primary);
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
}

.page-btn.active {
  background: rgba(0, 240, 255, 0.15);
  border-color: var(--tech-primary);
  color: var(--text-bright);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.4);
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
}

.page-separator {
  color: var(--tech-primary);
  font-size: 14px;
  margin: 0 4px;
  opacity: 0.3;
}

.page-info {
  padding: 0 8px;
  color: var(--text-sub);
  font-size: 13px;
  font-family: 'DIN Alternate', sans-serif;
}

.nav-btn {
  min-width: 44px;
}

.page-input {
  width: 54px;
  height: 36px;
  padding: 0 8px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.2);
  color: var(--text-bright);
  font-size: 13px;
  text-align: center;
  outline: none;
  clip-path: polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px);
  font-family: 'DIN Alternate', sans-serif;
  transition: all 0.2s;
}

.page-input:focus {
  border-color: var(--tech-primary);
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
}

.page-input::placeholder {
  color: var(--text-muted);
}

/* 滚动条样式 - SC2科技风格 */
.left-tree-panel::-webkit-scrollbar,
.user-table-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.left-tree-panel::-webkit-scrollbar-track,
.user-table-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-left: 1px solid rgba(0, 240, 255, 0.1);
}

.left-tree-panel::-webkit-scrollbar-thumb,
.user-table-container::-webkit-scrollbar-thumb {
  background: rgba(0, 240, 255, 0.2);
  border-left: 1px solid rgba(0, 240, 255, 0.4);
  transition: all 0.2s;
}

.left-tree-panel::-webkit-scrollbar-thumb:hover,
.user-table-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 240, 255, 0.3);
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
}


/* ========== 角色权限页面样式 - SC2科技风格 ========== */
.roles-content-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: transparent;
  padding: 20px 24px;
  overflow: hidden;
  gap: 12px;
}

/* 角色状态标签 - SC2风格 */
.role-status-tabs {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  padding-top: 0;
  border-bottom: 1px solid #1a2a3a;
}

.role-status-tabs .tabs-left {
  display: flex;
  gap: 0;
}

.role-status-tabs .tabs-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.role-status-tabs .search-box {
  width: 240px;
  background: linear-gradient(to bottom, #0a111a, #000000);
  border: 1px solid #1a2a3a;
}

.role-status-tabs .search-box:focus-within {
  border-color: #00f3ff;
  box-shadow: 0 0 15px rgba(0, 243, 255, 0.3);
}

.search-btn {
  padding: 10px 24px;
  background: linear-gradient(180deg, #1E2E42, #0B1420);
  border: 1px solid #3E5878;
  color: #7B98BC;
  font-family: 'Orbitron', sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
}

.search-btn:hover {
  background: linear-gradient(180deg, #2E3E52, #1B2430);
  border-color: #00f3ff;
  color: #fff;
  box-shadow: 0 0 15px rgba(0, 243, 255, 0.3);
}

.status-tab {
  padding: 10px 24px;
  background: linear-gradient(to bottom, #0a111a, #050608);
  border: 1px solid #1a2a3a;
  border-right: none;
  color: #6d8bad;
  font-family: 'Orbitron', sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  position: relative;
}

.status-tab:last-child {
  border-right: 1px solid #1a2a3a;
}

.status-tab:hover {
  color: #d0e0f0;
  background: rgba(255, 255, 255, 0.02);
}

.status-tab.active {
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
  background: linear-gradient(to top, rgba(0, 240, 255, 0.15) 0%, rgba(0, 0, 0, 0) 60%, transparent 100%);
}

.status-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #00f3ff 50%, transparent 100%);
  box-shadow: 0 0 10px 2px #00f3ff;
}

/* 主体内容 - 左右布局 */
.roles-main-content {
  flex: 1;
  display: flex;
  gap: 0;
  overflow: hidden;
  border: 1px solid #1a2a3a;
  background: linear-gradient(to bottom, #0a111a, #000000);
}

/* 左侧角色列表 - SC2风格 */
.roles-left-panel {
  width: 180px;
  background: rgba(0, 0, 0, 0.3);
  border-right: 1px solid #1a2a3a;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.create-role-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  background: linear-gradient(180deg, #1E2E42, #0B1420);
  border: 1px solid #00f3ff;
  color: #00f3ff;
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 12px;
  text-transform: uppercase;
}

.create-role-btn:hover {
  background: linear-gradient(180deg, #2E3E52, #1B2430);
  box-shadow: 0 0 15px rgba(0, 243, 255, 0.4);
  transform: translateY(-1px);
}

.role-item {
  padding: 12px 14px;
  color: #6d8bad;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
  background: transparent;
  position: relative;
}

.role-item:hover {
  background: rgba(255, 255, 255, 0.02);
  color: #d0e0f0;
  border-left-color: #3E5878;
}

.role-item.active {
  background: linear-gradient(to right, rgba(0, 240, 255, 0.1) 0%, transparent 100%);
  color: #fff;
  border-left-color: #00f3ff;
  font-weight: 600;
  text-shadow: 0 0 8px rgba(0, 243, 255, 0.5);
}

.role-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #00f3ff;
  box-shadow: 0 0 10px #00f3ff;
}

/* 右侧权限配置区 - SC2风格 */
.roles-right-panel {
  flex: 1;
  background: transparent;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
}

/* 权限类型标签 - SC2按钮风格 */
.permission-type-tabs {
  display: flex;
  gap: 12px;
}

.permission-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border: 1px solid;
  font-family: 'Orbitron', sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s;
  background: linear-gradient(180deg, #1E2E42, #0B1420);
  text-transform: uppercase;
  position: relative;
  overflow: hidden;
}

.permission-tab.tab-menu {
  color: #00f3ff;
  border-color: #00f3ff;
}

.permission-tab.tab-menu.active {
  background: linear-gradient(180deg, rgba(0, 243, 255, 0.2), rgba(0, 100, 150, 0.1));
  box-shadow: 0 0 20px rgba(0, 243, 255, 0.5), inset 0 0 15px rgba(0, 243, 255, 0.1);
  text-shadow: 0 0 10px #00f3ff;
}

.permission-tab.tab-view {
  color: #00E676;
  border-color: #00E676;
}

.permission-tab.tab-view.active {
  background: linear-gradient(180deg, rgba(0, 230, 118, 0.2), rgba(0, 100, 50, 0.1));
  box-shadow: 0 0 20px rgba(0, 230, 118, 0.5), inset 0 0 15px rgba(0, 230, 118, 0.1);
  text-shadow: 0 0 10px #00E676;
}

.permission-tab.tab-operation {
  color: #FFD600;
  border-color: #FFD600;
}

.permission-tab.tab-operation.active {
  background: linear-gradient(180deg, rgba(255, 214, 0, 0.2), rgba(150, 100, 0, 0.1));
  box-shadow: 0 0 20px rgba(255, 214, 0, 0.5), inset 0 0 15px rgba(255, 214, 0, 0.1);
  text-shadow: 0 0 10px #FFD600;
}

.permission-tab:hover:not(.active) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
}

/* 权限内容区域 - SC2面板风格 */
.permissions-content {
  flex: 1;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #1a2a3a;
  padding: 0;
  position: relative;
}

/* 顶部发光线 */
.permissions-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00f3ff, transparent);
  box-shadow: 0 0 10px #00f3ff;
  opacity: 0.5;
}

/* 菜单权限表格布局 - SC2风格 */
.menu-permissions-table {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.menu-row {
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid #1a2a3a;
  transition: all 0.2s;
}

.menu-row:last-child {
  border-bottom: none;
}

.menu-row:hover {
  background: rgba(0, 243, 255, 0.02);
}

.menu-category {
  width: 120px;
  min-width: 120px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  color: #6d8bad;
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  border-right: 1px solid #1a2a3a;
  text-transform: uppercase;
}

.menu-items {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 12px 20px;
  gap: 20px;
}

.menu-checkbox-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  min-width: 140px;
  padding: 6px 0;
  transition: all 0.2s;
}

.menu-checkbox-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #00f3ff;
  background: #0a111a;
  border: 1px solid #3E5878;
}

.menu-checkbox-item span {
  color: #e2e8f0;
  font-size: 13px;
  user-select: none;
  transition: all 0.2s;
}

.menu-checkbox-item:hover span {
  color: #00f3ff;
  text-shadow: 0 0 8px rgba(0, 243, 255, 0.5);
}

.menu-checkbox-item input[type="checkbox"]:checked + span {
  color: #00f3ff;
  font-weight: 600;
  text-shadow: 0 0 8px rgba(0, 243, 255, 0.5);
}

/* 查看权限和操作权限网格 - SC2风格 */
.view-permissions-grid,
.operation-permissions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 20px;
}

.permission-checkbox-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  min-width: 140px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #1a2a3a;
  transition: all 0.2s;
}

.permission-checkbox-item:hover {
  background: rgba(0, 243, 255, 0.05);
  border-color: #3E5878;
}

.permission-checkbox-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #00f3ff;
}

.permission-checkbox-item span {
  color: #e2e8f0;
  font-size: 13px;
  user-select: none;
  transition: all 0.2s;
}

.permission-checkbox-item:hover span {
  color: #00f3ff;
}

.permission-checkbox-item input[type="checkbox"]:checked + span {
  color: #00f3ff;
  font-weight: 600;
  text-shadow: 0 0 8px rgba(0, 243, 255, 0.5);
}

/* 底部按钮 - SC2风格 */
.permission-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding-top: 16px;
  border-top: 1px solid #1a2a3a;
}

.btn-all,
.btn-confirm {
  padding: 12px 36px;
  font-family: 'Orbitron', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid;
  text-transform: uppercase;
}

.btn-all {
  background: linear-gradient(180deg, #1E2E42, #0B1420);
  border-color: #00f3ff;
  color: #00f3ff;
}

.btn-all:hover {
  background: linear-gradient(180deg, #2E3E52, #1B2430);
  box-shadow: 0 0 20px rgba(0, 243, 255, 0.4);
  transform: translateY(-2px);
}

.btn-confirm {
  background: linear-gradient(180deg, rgba(0, 100, 150, 0.5), rgba(0, 50, 100, 0.3));
  border-color: #00f3ff;
  color: #fff;
  box-shadow: 0 0 10px rgba(0, 243, 255, 0.3);
}

.btn-confirm:hover {
  background: linear-gradient(180deg, rgba(0, 150, 200, 0.6), rgba(0, 100, 150, 0.4));
  box-shadow: 0 0 25px rgba(0, 243, 255, 0.6);
  transform: translateY(-2px);
  text-shadow: 0 0 10px #00f3ff;
}

/* 滚动条样式 - SC2科技风格 */
.permissions-content::-webkit-scrollbar,
.roles-left-panel::-webkit-scrollbar {
  width: 8px;
}

.permissions-content::-webkit-scrollbar-track,
.roles-left-panel::-webkit-scrollbar-track {
  background: #0a111a;
  border-left: 1px solid #1a2a3a;
}

.permissions-content::-webkit-scrollbar-thumb,
.roles-left-panel::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #3E5878, #1a2a3a);
  border: 1px solid #3E5878;
}

.permissions-content::-webkit-scrollbar-thumb:hover,
.roles-left-panel::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #5a7a9a, #3E5878);
  box-shadow: 0 0 10px rgba(0, 243, 255, 0.3);
}
</style>

<style>
/* el-table SC2 科技风格 - 全局样式 */
.user-management-page .el-table {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(0, 240, 255, 0.05);
  --el-table-header-text-color: #00f3ff;
  --el-table-text-color: #e2e8f0;
  --el-table-border-color: rgba(0, 240, 255, 0.15);
  --el-table-row-hover-bg-color: rgba(0, 240, 255, 0.08);
  --el-table-current-row-bg-color: rgba(0, 240, 255, 0.12);
  background: transparent !important;
}

.user-management-page .el-table th.el-table__cell {
  background: rgba(0, 240, 255, 0.05) !important;
  color: #00f3ff !important;
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 2px solid rgba(0, 240, 255, 0.2) !important;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
}

.user-management-page .el-table td.el-table__cell {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  color: #e2e8f0;
  font-size: 13px;
}

.user-management-page .el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell {
  background: rgba(255, 255, 255, 0.02) !important;
}

.user-management-page .el-table__body tr:hover > td.el-table__cell {
  background: rgba(0, 240, 255, 0.08) !important;
}

.user-management-page .el-table__inner-wrapper::before {
  display: none;
}

/* 复选框样式 */
.user-management-page .el-checkbox__inner {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 240, 255, 0.4);
}

.user-management-page .el-checkbox__input.is-checked .el-checkbox__inner {
  background: #00f3ff;
  border-color: #00f3ff;
}

/* 固定列样式 */
.user-management-page .el-table__fixed-right {
  background: transparent !important;
}

.user-management-page .el-table__fixed-right::before {
  display: none;
}

.user-management-page .el-table__fixed-right .el-table__cell {
  background: rgba(10, 17, 26, 0.95) !important;
}

/* ==================== 用户编辑弹窗样式 ==================== */
.user-management-page .el-dialog {
  background: rgba(10, 17, 26, 0.98) !important;
  border: 1px solid rgba(0, 240, 255, 0.3);
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.2), inset 0 0 30px rgba(0, 0, 0, 0.5);
}

.user-management-page .el-dialog__header {
  background: rgba(0, 240, 255, 0.05);
  border-bottom: 1px solid rgba(0, 240, 255, 0.2);
  padding: 16px 20px;
}

.user-management-page .el-dialog__title {
  color: #00f3ff !important;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
}

.user-management-page .el-dialog__body {
  padding: 24px;
  background: transparent;
}

.user-management-page .el-dialog__footer {
  border-top: 1px solid rgba(0, 240, 255, 0.1);
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.2);
}

.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item.full-width {
  flex: none;
  width: 100%;
}

.form-label {
  font-size: 13px;
  color: #6d8bad;
  font-weight: 600;
}

.form-label.required::before {
  content: '*';
  color: #ff2a4d;
  margin-right: 4px;
}

.user-management-page .el-input__wrapper,
.user-management-page .el-select__wrapper {
  background: rgba(0, 0, 0, 0.4) !important;
  border: 1px solid rgba(0, 240, 255, 0.2) !important;
  box-shadow: none !important;
}

.user-management-page .el-input__wrapper:focus-within,
.user-management-page .el-select__wrapper:focus-within {
  border-color: #00f3ff !important;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.2) !important;
}

.user-management-page .el-input__inner {
  color: #e2e8f0 !important;
}

.user-management-page .el-select .el-select__selected-item {
  color: #e2e8f0 !important;
}

.department-select {
  width: 100%;
}

.selected-departments {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.dept-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.3);
  color: #00f3ff;
  font-size: 12px;
  font-weight: 600;
}

.remove-dept {
  cursor: pointer;
  font-size: 12px;
  opacity: 0.7;
  transition: all 0.2s;
}

.remove-dept:hover {
  opacity: 1;
  color: #ff2a4d;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-secondary {
  border-color: #3E5878;
  color: #6d8bad;
}

.btn-secondary:hover {
  border-color: #00f3ff;
  color: #00f3ff;
}

/* ==================== 权限分配弹窗样式 ==================== */
.permission-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.user-info-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(0, 240, 255, 0.05);
  border: 1px solid rgba(0, 240, 255, 0.15);
}

.user-avatar {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 240, 255, 0.1);
  border: 2px solid #00f3ff;
  font-size: 28px;
  color: #00f3ff;
}

.user-details {
  flex: 1;
}

.user-details .user-name {
  font-size: 18px;
  font-weight: 700;
  color: #e2e8f0;
  margin-bottom: 6px;
}

.user-meta {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #6d8bad;
}

.current-role {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.role-label {
  font-size: 11px;
  color: #6d8bad;
}

.role-value {
  font-size: 14px;
  font-weight: 600;
  color: #00f3ff;
  padding: 4px 12px;
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.3);
}

.permission-config-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.quick-role-section,
.detail-permission-section {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.1);
  padding: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #00f3ff;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
}

.section-header .el-switch {
  margin-left: auto;
}

.role-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.role-card {
  padding: 14px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.15);
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.role-card:hover {
  border-color: #00f3ff;
  background: rgba(0, 240, 255, 0.05);
}

.role-card.active {
  border-color: #00f3ff;
  background: rgba(0, 240, 255, 0.15);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
}

.role-card .role-name {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 6px;
}

.role-card.active .role-name {
  color: #00f3ff;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
}

.role-card .role-count {
  font-size: 11px;
  color: #6d8bad;
}

.detail-permissions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}

.permission-group {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.1);
  padding: 14px;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #00f3ff;
  margin-bottom: 12px;
}

.permission-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.permission-checkboxes.inline {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
}

.permission-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 10px;
  transition: all 0.2s;
}

.permission-checkbox.parent {
  background: rgba(0, 240, 255, 0.05);
  font-weight: 600;
  color: #e2e8f0;
}

.permission-checkbox.child {
  margin-left: 24px;
  color: #6d8bad;
}

.permission-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #00f3ff;
}

.permission-checkbox span {
  font-size: 13px;
  user-select: none;
}

.permission-checkbox:hover {
  background: rgba(0, 240, 255, 0.08);
}

.permission-checkbox:hover span {
  color: #00f3ff;
}

.permission-checkbox input[type="checkbox"]:checked + span {
  color: #00f3ff;
  text-shadow: 0 0 6px rgba(0, 240, 255, 0.4);
}

/* 多选标签样式覆盖 */
.user-management-page .el-select__tags {
  flex-wrap: wrap;
  gap: 4px;
}

.user-management-page .el-tag {
  background: rgba(0, 240, 255, 0.1) !important;
  border-color: rgba(0, 240, 255, 0.3) !important;
  color: #00f3ff !important;
}

.user-management-page .el-tag .el-tag__close {
  color: #00f3ff !important;
}

.user-management-page .el-tag .el-tag__close:hover {
  background: rgba(0, 240, 255, 0.3) !important;
}

/* 下拉菜单样式 */
.user-management-page .el-select-dropdown {
  background: rgba(10, 17, 26, 0.98) !important;
  border: 1px solid rgba(0, 240, 255, 0.2) !important;
}

.user-management-page .el-select-dropdown__item {
  color: #6d8bad !important;
}

.user-management-page .el-select-dropdown__item:hover {
  background: rgba(0, 240, 255, 0.1) !important;
  color: #00f3ff !important;
}

.user-management-page .el-select-dropdown__item.is-selected {
  color: #00f3ff !important;
  font-weight: 600;
}

/* Switch 开关样式 */
.user-management-page .el-switch__label {
  color: #6d8bad !important;
}

.user-management-page .el-switch__label.is-active {
  color: #00f3ff !important;
}
</style>
