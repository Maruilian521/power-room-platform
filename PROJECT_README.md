# 配电室智慧运维平台

一个基于 Vue3 + TypeScript + Element Plus 的配电室智慧运维管理平台。

## 技术栈

- **框架**: Vue 3.5.24 + TypeScript
- **UI 组件库**: Element Plus 2.11.8
- **状态管理**: Pinia 3.0.4
- **路由**: Vue Router 4.6.3
- **图表库**: ECharts 6.0.0
- **3D 渲染**: Three.js 0.181.1
- **Mock 数据**: MockJS 1.1.0
- **构建工具**: Vite 7.2.2

## 项目结构

```
power-room-platform/
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── main.css           # 全局样式
│   ├── mock/
│   │   └── index.ts               # Mock数据配置
│   ├── router/
│   │   └── index.ts               # 路由配置
│   ├── stores/
│   │   └── device.ts              # Pinia设备状态管理
│   ├── types/
│   │   └── index.ts               # TypeScript类型定义
│   ├── views/
│   │   ├── Layout.vue             # 布局组件
│   │   ├── Dashboard.vue          # 监控大屏
│   │   ├── DeviceList.vue         # 设备列表
│   │   ├── AlarmList.vue          # 告警列表
│   │   └── WorkOrder.vue          # 工单管理
│   ├── App.vue                    # 应用根组件
│   └── main.ts                    # 应用入口
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 核心功能

### 1. 监控大屏 (Dashboard)
- **实时统计**: 在线设备、告警设备、严重告警、待处理工单等关键指标
- **趋势图表**:
  - 电压电流24小时趋势图
  - 设备状态分布饼图
  - 告警统计柱状图
- **实时数据监控**: 三相电压、电流、功率、温度实时显示
- **自动刷新**: 每5秒自动更新实时数据

### 2. 设备列表 (DeviceList)
- **设备管理**: 查看所有配电设备的详细信息
- **筛选搜索**: 支持按设备名称、ID、状态筛选
- **设备类型**: 变压器、开关柜、传感器、断路器、电容器
- **实时监控**: 电压、电流、功率、温度实时显示
- **状态管理**: 支持设备启用/停用操作
- **详情查看**: 查看设备完整信息

### 3. 告警列表 (AlarmList)
- **告警分类**: 严重告警、告警预警、一般信息
- **告警管理**: 查看、处理、解决告警
- **筛选功能**: 按告警级别、状态、设备筛选
- **处理流程**: 待处理 → 处理中 → 已解决
- **告警类型**: 温度异常、电压异常、电流异常、设备离线、功率异常、通信故障

### 4. 工单管理 (WorkOrder)
- **工单类型**: 维修、保养、巡检、紧急
- **优先级**: 低、中、高、紧急
- **状态管理**: 待处理、已分配、进行中、已完成、已取消
- **工单操作**: 创建、查看、更新状态
- **负责人分配**: 工单分配给指定负责人

## 设计特点

### 暗色主题
- 专业的电力行业暗色配色方案
- 符合长时间监控场景的视觉舒适度
- 高对比度的数据展示

### 响应式设计
- 支持多种屏幕尺寸
- 自适应网格布局
- 移动端友好

### 数据可视化
- ECharts 图表展示
- 实时数据更新动画
- 颜色编码状态指示

### 用户体验
- 平滑的页面切换动画
- 悬浮卡片效果
- 直观的状态标识
- 完善的加载和空状态提示

## 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:5173 查看应用

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 数据说明

### Mock 数据
项目使用 MockJS 模拟后端数据，包括：
- 24 个设备数据
- 50 条告警记录
- 30 个工单记录
- 实时数据自动更新（每5秒）

### 自动更新机制
- 设备数据每5秒自动更新电压、电流、功率、温度
- Dashboard 页面实时数据每5秒自动刷新
- 统计数据实时同步

## 接口说明

### Mock API 端点
- `GET /api/devices` - 获取设备列表
- `GET /api/devices/:id` - 获取设备详情
- `PUT /api/devices/:id/status` - 更新设备状态
- `GET /api/alarms` - 获取告警列表
- `GET /api/workorders` - 获取工单列表
- `PUT /api/workorders/:id/status` - 更新工单状态
- `GET /api/statistics` - 获取统计数据
- `GET /api/realtime` - 获取实时数据

## 类型定义

### Device - 设备
```typescript
interface Device {
  id: string
  name: string
  type: 'transformer' | 'switch' | 'sensor' | 'breaker' | 'capacitor'
  status: 'online' | 'offline' | 'warning' | 'alarm'
  location: string
  voltage: number
  current: number
  power: number
  temperature: number
  lastUpdate: string
}
```

### Alarm - 告警
```typescript
interface Alarm {
  id: string
  deviceId: string
  deviceName: string
  level: 'critical' | 'warning' | 'info'
  type: string
  message: string
  time: string
  status: 'pending' | 'processing' | 'resolved'
}
```

### WorkOrder - 工单
```typescript
interface WorkOrder {
  id: string
  title: string
  type: 'repair' | 'maintenance' | 'inspection' | 'emergency'
  deviceId: string
  deviceName: string
  description: string
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignee: string
  createTime: string
  updateTime: string
  completeTime?: string
}
```

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 开发说明

### 添加新页面
1. 在 `src/views/` 创建新的 Vue 组件
2. 在 `src/router/index.ts` 添加路由配置
3. 在 `src/views/Layout.vue` 添加菜单项

### 添加新的 Mock 数据
在 `src/mock/index.ts` 中添加新的 Mock 接口

### 修改主题颜色
在 `src/assets/styles/main.css` 中修改 CSS 变量

## 注意事项

- 本项目使用 Mock 数据，生产环境需要替换为真实 API
- 实时数据更新会占用一定性能，可根据需要调整更新频率
- 图表在窗口 resize 时会自动调整大小
- 建议在现代浏览器中运行以获得最佳体验

## 后续优化建议

1. **功能扩展**
   - 添加用户权限管理
   - 实现工单创建和编辑功能
   - 添加数据导出功能
   - 实现设备编辑功能

2. **性能优化**
   - 实现虚拟滚动优化长列表
   - 图表按需加载
   - 组件懒加载

3. **可视化增强**
   - 添加 Three.js 3D 配电室场景
   - 更多图表类型
   - 数据大屏全屏模式

4. **接口对接**
   - 替换 Mock 为真实 API
   - 添加 WebSocket 实时推送
   - 实现文件上传下载

## 许可证

MIT License
