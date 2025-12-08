import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, PageBreak } from 'docx';
import * as fs from 'fs';

// 创建表格边框样式
const tableBorders = {
  top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
};

// 创建表格单元格
function createCell(text, isHeader = false, width = null) {
  const cellOptions = {
    children: [new Paragraph({
      children: [new TextRun({ text, bold: isHeader, size: 20 })],
      alignment: AlignmentType.CENTER,
    })],
    borders: tableBorders,
  };
  if (width) {
    cellOptions.width = { size: width, type: WidthType.PERCENTAGE };
  }
  return new TableCell(cellOptions);
}

// 创建表格行
function createRow(cells, isHeader = false) {
  return new TableRow({
    children: cells.map((cell, index) => createCell(cell, isHeader)),
  });
}

// 创建文档
const doc = new Document({
  sections: [{
    properties: {},
    children: [
      // ==================== 封面 ====================
      new Paragraph({ text: '', spacing: { after: 2000 } }),
      new Paragraph({
        children: [new TextRun({ text: '无人配电室智慧运维系统', bold: true, size: 56 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '产品需求文档（PRD）', bold: true, size: 44 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 1200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Product Requirements Document', size: 28, italics: true, color: '666666' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 2000 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '文档版本：V1.0', size: 24 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '编写日期：2025年12月8日', size: 24 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '文档状态：正式发布', size: 24 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '密级：内部公开', size: 24 })],
        alignment: AlignmentType.CENTER,
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ==================== 修订历史 ====================
      new Paragraph({
        text: '修订历史',
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 300 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['版本', '日期', '修订内容', '修订人', '审核人'], true),
          createRow(['V1.0', '2025-12-08', '初版发布，完成全部功能需求定义', '产品经理', '技术总监']),
        ]
      }),
      new Paragraph({ text: '', spacing: { after: 400 } }),

      new Paragraph({ children: [new PageBreak()] }),

      // ==================== 目录占位 ====================
      new Paragraph({
        text: '目  录',
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      }),
      new Paragraph({ children: [new TextRun({ text: '（请在Word中插入自动目录）', italics: true, color: '999999' })] }),

      new Paragraph({ children: [new PageBreak()] }),

      // ==================== 第一章 文档概述 ====================
      new Paragraph({
        text: '第一章 文档概述',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 300 }
      }),

      new Paragraph({
        text: '1.1 编写目的',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '本文档是《无人配电室智慧运维系统》的产品需求规格说明书，旨在明确定义产品的功能范围、业务流程、交互设计、数据需求及非功能性需求，为产品设计、开发、测试和运营提供统一的需求基准。', size: 22 })],
        spacing: { after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '本文档适用于以下团队和角色：', size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({ children: [new TextRun({ text: '• 产品团队：需求分析、优先级排序、版本规划', size: 22 })], bullet: { level: 0 } }),
      new Paragraph({ children: [new TextRun({ text: '• 设计团队：UI/UX设计、交互原型设计', size: 22 })], bullet: { level: 0 } }),
      new Paragraph({ children: [new TextRun({ text: '• 开发团队：前端开发、后端开发、接口设计', size: 22 })], bullet: { level: 0 } }),
      new Paragraph({ children: [new TextRun({ text: '• 测试团队：测试用例设计、功能验收', size: 22 })], bullet: { level: 0 } }),
      new Paragraph({ children: [new TextRun({ text: '• 运维团队：系统部署、运行维护', size: 22 })], bullet: { level: 0 } }),

      new Paragraph({
        text: '1.2 项目背景',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '随着电力行业数字化转型的深入推进，传统配电室运维模式面临诸多挑战：', size: 22 })],
        spacing: { after: 150 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '（1）人力成本高昂：', bold: true, size: 22 }), new TextRun({ text: '传统配电室需要24小时人工值班，人力投入大，运维成本居高不下。', size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '（2）故障响应滞后：', bold: true, size: 22 }), new TextRun({ text: '依赖人工巡检发现故障，响应时间长，可能导致设备损坏或停电事故扩大。', size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '（3）数据孤岛严重：', bold: true, size: 22 }), new TextRun({ text: '各类监控系统独立运行，数据分散，缺乏统一的管理和分析平台。', size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '（4）安全风险管控难：', bold: true, size: 22 }), new TextRun({ text: '人员进出频繁，操作规范难以监督，安全隐患难以及时发现。', size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '（5）决策支持不足：', bold: true, size: 22 }), new TextRun({ text: '缺乏精细化的数据分析，管理决策主要依赖经验，难以实现精准运维。', size: 22 })],
        spacing: { after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '基于以上背景，本项目旨在建设一套集"监、管、控、维"于一体的智慧运维平台，通过物联网数据采集、AI智能分析、3D数字孪生等先进技术，实现配电室的远程监控、智能预警、自动化运维和数据化决策，推动配电室从"有人值守"向"无人值班、少人值守"转型升级。', size: 22 })],
        spacing: { after: 200 }
      }),

      new Paragraph({
        text: '1.3 术语定义',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['术语', '定义说明'], true),
          createRow(['配电室', '安装有高低压配电设备，进行电能分配和控制的专用建筑或场所']),
          createRow(['变压器', '将高压电（10kV）转换为低压电（0.4kV）的电力设备']),
          createRow(['开关柜', '用于控制、保护和隔离电力线路和设备的成套柜体']),
          createRow(['数字孪生', '利用数字技术构建物理设备在虚拟空间的映射，实现实时同步和仿真预测']),
          createRow(['工单', '记录运维任务信息的电子单据，包含任务描述、执行人、时间等']),
          createRow(['两票', '工作票和操作票的统称，是电力系统保证安全作业的重要管理手段']),
          createRow(['有功功率', '电路中实际消耗的功率，单位为kW（千瓦）']),
          createRow(['无功功率', '在电路中往返交换但不做功的功率，单位为kVar（千乏）']),
          createRow(['功率因数', '有功功率与视在功率的比值，反映电能利用效率']),
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ==================== 第二章 产品概述 ====================
      new Paragraph({
        text: '第二章 产品概述',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 300 }
      }),

      new Paragraph({
        text: '2.1 产品定位',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '无人配电室智慧运维系统', bold: true, size: 22 }), new TextRun({ text: '是一款面向电力行业的企业级B端SaaS平台，采用"平台+应用"的架构模式，通过统一的数据采集、智能分析和可视化展示，为用户提供配电室全生命周期的智慧化运维管理服务。', size: 22 })],
        spacing: { after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '核心价值主张：', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({ children: [new TextRun({ text: '• 一屏掌控：集成驾驶舱大屏，实现运维态势一目了然', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 智能预警：AI驱动的故障预测和风险预警，防患于未然', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 远程运维：视频巡检+远程控制，减少现场人工干预', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 数据决策：多维度报表分析，支撑精准化运维决策', size: 22 })] }),

      new Paragraph({
        text: '2.2 目标用户',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['用户角色', '职责描述', '核心需求'], true),
          createRow(['运维管理人员', '统筹管理多个配电室的日常运维工作', '全局监控、资源调度、绩效考核']),
          createRow(['值班监控人员', '7×24小时监控配电室运行状态', '实时告警、快速响应、事件处置']),
          createRow(['现场巡检人员', '执行现场巡检、维修和保养任务', '任务清单、操作指引、记录上报']),
          createRow(['设备资产管理员', '管理配电设备的资产台账信息', '资产登记、生命周期、维保计划']),
          createRow(['系统管理员', '系统配置、用户管理、权限分配', '灵活配置、安全管控、日志审计']),
          createRow(['企业管理层', '查看运维报表、了解运行状况', '数据可视化、KPI达成、决策支持']),
        ]
      }),

      new Paragraph({
        text: '2.3 产品目标',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['目标维度', '具体目标', '量化指标'], true),
          createRow(['降本增效', '减少人工值班投入，提升运维效率', '人力成本降低50%以上']),
          createRow(['故障响应', '缩短故障发现和处理时间', '平均响应时间<5分钟']),
          createRow(['设备可靠', '降低设备故障率，延长使用寿命', '非计划停电减少30%以上']),
          createRow(['安全管控', '规范作业流程，消除安全隐患', '安全事故零发生']),
          createRow(['数据价值', '沉淀运维数据，支撑智能决策', '数据采集完整率>99%']),
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ==================== 第三章 系统架构 ====================
      new Paragraph({
        text: '第三章 系统架构',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 300 }
      }),

      new Paragraph({
        text: '3.1 整体架构',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '系统采用分层架构设计，从下至上依次为：', size: 22 })],
        spacing: { after: 150 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '（1）设备接入层：', bold: true, size: 22 }), new TextRun({ text: '通过MQTT、Modbus、IEC 61850等协议接入各类传感器、智能设备和视频设备。', size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '（2）数据服务层：', bold: true, size: 22 }), new TextRun({ text: '提供数据采集、存储、处理和分析服务，包括时序数据库、关系数据库、缓存等。', size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '（3）业务应用层：', bold: true, size: 22 }), new TextRun({ text: '实现监控、告警、工单、资产、报表等核心业务功能。', size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '（4）用户交互层：', bold: true, size: 22 }), new TextRun({ text: 'Web端应用界面，采用Vue 3 + TypeScript + Element Plus技术栈。', size: 22 })],
        spacing: { after: 200 }
      }),

      new Paragraph({
        text: '3.2 功能模块架构',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '系统功能划分为六大核心模块：', size: 22 })],
        spacing: { after: 150 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['模块名称', '功能定位', '包含页面'], true),
          createRow(['驾驶舱模块', '全局运维态势感知中心', '智慧运维中心、指挥中心、AI安全态势']),
          createRow(['智能监控模块', '多维度实时监控能力', '站点地图、站点列表、视频巡视、环境安防、配电室详情']),
          createRow(['运维作业模块', '运维任务全流程管理', '告警中心、工单管理、巡检管理、两票管理、知识库']),
          createRow(['资产台账模块', '设备资产全生命周期', '配电室台账、设备台账、备品备件']),
          createRow(['分析报表模块', '数据分析与决策支持', '运维报表、电能质量、设备健康、负荷分析、值班记录、电能报表']),
          createRow(['系统管理模块', '系统配置与权限管理', '用户权限、告警策略、数据字典']),
        ]
      }),

      new Paragraph({
        text: '3.3 技术架构',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '前端技术栈：', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['技术', '版本', '用途'], true),
          createRow(['Vue', '3.5.24', '渐进式JavaScript框架']),
          createRow(['TypeScript', '5.9.3', '类型安全的JavaScript超集']),
          createRow(['Vite', '7.2.2', '下一代前端构建工具']),
          createRow(['Vue Router', '4.6.3', '官方路由管理器']),
          createRow(['Pinia', '3.0.4', '新一代状态管理库']),
          createRow(['Element Plus', '2.11.8', '企业级UI组件库']),
          createRow(['ECharts', '6.0.0', '数据可视化图表库']),
          createRow(['Three.js', '0.181.2', '3D图形渲染引擎']),
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ==================== 第四章 功能需求详述 ====================
      new Paragraph({
        text: '第四章 功能需求详述',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 300 }
      }),

      // --- 4.1 驾驶舱模块 ---
      new Paragraph({
        text: '4.1 驾驶舱模块',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),

      new Paragraph({
        text: '4.1.1 智慧运维中心',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 250, after: 150 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '【功能概述】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '智慧运维中心是系统的核心驾驶舱页面，采用"一屏总览"的设计理念，将全域配电室的关键运维指标、实时状态、告警信息、工单进度等核心数据集中展示，帮助运维管理人员快速掌握整体运维态势。', size: 22 })],
        spacing: { after: 150 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '【页面布局】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({ children: [new TextRun({ text: '• 顶部区域（Header）：5个KPI核心指标卡片横向排列', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 左侧区域（20%宽度）：设备健康度面板 + 环境监测面板', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 中央区域（60%宽度）：GIS地图核心展示区', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 右侧区域（20%宽度）：实时告警列表 + 工单统计面板', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 底部区域（Footer）：负荷趋势图 + 运维成效分析', size: 22 })] }),
      new Paragraph({ text: '', spacing: { after: 150 } }),
      new Paragraph({
        children: [new TextRun({ text: '【功能需求清单】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createRow(['DC-001', 'KPI卡片-安全运行天数', 'P0', '显示系统持续安全运行的天数，从上线日期开始累计，遇重大安全事故归零重计']),
          createRow(['DC-002', 'KPI卡片-站点在线率', 'P0', '显示当前在线配电室数量/总配电室数量的百分比，实时更新']),
          createRow(['DC-003', 'KPI卡片-今日告警数', 'P0', '显示今日0点至当前时间产生的告警总数，点击可跳转告警中心']),
          createRow(['DC-004', 'KPI卡片-待处理急单', 'P0', '显示当前待处理的紧急工单数量，红色高亮显示']),
          createRow(['DC-005', 'KPI卡片-实时总负荷', 'P0', '显示所有配电室当前负荷之和，单位kW，每5秒刷新']),
          createRow(['DC-006', 'GIS地图展示', 'P0', '在地图上标注所有配电室位置，支持缩放、拖拽、点击查看详情']),
          createRow(['DC-007', '地图状态标记', 'P0', '根据配电室状态显示不同颜色标记：绿色-正常、橙色-告警、红色-故障、灰色-离线']),
          createRow(['DC-008', '设备健康度饼图', 'P0', '饼图展示设备健康/注意/异常三种状态的数量占比']),
          createRow(['DC-009', '环境参数概览', 'P1', '显示各配电室温度、湿度的最高/最低/平均值']),
          createRow(['DC-010', '实时告警滚动列表', 'P0', '显示最新10条告警，自动滚动，支持点击查看详情']),
          createRow(['DC-011', '工单统计卡片', 'P1', '显示待处理、进行中、今日完成的工单数量']),
          createRow(['DC-012', '24小时负荷曲线', 'P1', '折线图展示过去24小时的负荷变化趋势']),
          createRow(['DC-013', '数据自动刷新', 'P0', '页面数据每30秒自动刷新，支持手动刷新按钮']),
          createRow(['DC-014', '全屏展示模式', 'P1', '支持F11全屏展示，适配大屏幕投放场景']),
        ]
      }),
      new Paragraph({ text: '', spacing: { after: 150 } }),
      new Paragraph({
        children: [new TextRun({ text: '【交互说明】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({ children: [new TextRun({ text: '1. 点击KPI卡片可跳转至对应的详情页面（如点击"今日告警"跳转告警中心）', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '2. 点击地图标记点弹出配电室信息卡片，显示名称、状态、告警数、负荷率等', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '3. 信息卡片提供"进入详情"按钮，点击跳转配电室详情页', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '4. 告警列表点击某条告警，弹出告警详情弹窗', size: 22 })] }),

      new Paragraph({ text: '', spacing: { after: 300 } }),

      new Paragraph({
        text: '4.1.2 无人配电指挥中心',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 250, after: 150 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '【功能概述】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '面向运维调度的指挥中心，重点关注异常站点和紧急事项，支持快速指令下发和任务调度。', size: 22 })],
        spacing: { after: 150 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createRow(['DC-020', '异常站点看板', 'P0', '突出显示存在告警或故障的配电室，按严重程度排序']),
          createRow(['DC-021', '紧急事件列表', 'P0', '展示需要紧急处理的事件，支持一键派单']),
          createRow(['DC-022', '3D拓扑可视化', 'P1', '配电网络拓扑的3D可视化展示']),
          createRow(['DC-023', '指令下发功能', 'P2', '向指定人员发送调度指令']),
        ]
      }),

      new Paragraph({ text: '', spacing: { after: 300 } }),

      new Paragraph({
        text: '4.1.3 AI安全态势',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 250, after: 150 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '【功能概述】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: 'AI驱动的智能安全分析面板，通过机器学习算法分析设备运行数据，提供风险预警和趋势预测。', size: 22 })],
        spacing: { after: 150 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createRow(['DC-030', '威胁等级分布', 'P1', '展示AI识别的威胁等级分布（高危/中危/低危）']),
          createRow(['DC-031', '异常事件热力图', 'P1', '时间-设备维度的异常事件热力分布图']),
          createRow(['DC-032', '故障趋势预测', 'P2', '基于历史数据预测未来可能发生的故障']),
          createRow(['DC-033', '根因分析报告', 'P2', 'AI辅助的故障根因分析和处置建议']),
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // --- 4.2 智能监控模块 ---
      new Paragraph({
        text: '4.2 智能监控模块',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),

      new Paragraph({
        text: '4.2.1 站点监控地图',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 250, after: 150 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '【功能概述】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: 'GIS地图展示所有配电室的地理位置分布和实时运行状态，支持多种交互操作。', size: 22 })],
        spacing: { after: 150 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '【页面布局】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({ children: [new TextRun({ text: '• 左侧面板（收起/展开）：配电室搜索框 + 状态筛选器 + 站点列表', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 中央区域：GIS地图主显示区', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 右侧浮层：选中站点的信息详情卡片', size: 22 })] }),
      new Paragraph({ text: '', spacing: { after: 150 } }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createRow(['SM-001', '地图底图', 'P0', '集成高德/百度地图，支持标准/卫星视图切换']),
          createRow(['SM-002', '站点标记', 'P0', '在地图上标注所有配电室位置，显示自定义图标']),
          createRow(['SM-003', '状态着色', 'P0', '根据运行状态显示不同颜色：绿色正常、橙色告警、红色故障、灰色离线']),
          createRow(['SM-004', '标记点击', 'P0', '点击标记弹出信息卡片，显示配电室概要信息']),
          createRow(['SM-005', '搜索定位', 'P1', '输入配电室名称或编号，自动定位并高亮显示']),
          createRow(['SM-006', '状态筛选', 'P1', '按正常/告警/故障/离线状态筛选显示']),
          createRow(['SM-007', '聚合显示', 'P2', '地图缩小时自动聚合临近站点，显示聚合数量']),
          createRow(['SM-008', '快捷跳转', 'P0', '信息卡片提供"进入详情"、"视频监控"快捷入口']),
        ]
      }),

      new Paragraph({ text: '', spacing: { after: 300 } }),

      new Paragraph({
        text: '4.2.2 站点列表监控',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 250, after: 150 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '【功能概述】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '以表格形式展示所有配电室的运行状态，便于批量查看、筛选和排序。', size: 22 })],
        spacing: { after: 150 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createRow(['SL-001', '列表展示', 'P0', '表格列：序号、名称、编号、地址、状态、告警数、设备数、负荷率、操作']),
          createRow(['SL-002', '状态标识', 'P0', '状态列使用不同颜色标签显示：正常(绿)、告警(橙)、故障(红)、离线(灰)']),
          createRow(['SL-003', '关键字搜索', 'P0', '支持按名称、编号模糊搜索']),
          createRow(['SL-004', '状态筛选', 'P0', '下拉选择筛选不同状态的配电室']),
          createRow(['SL-005', '列排序', 'P1', '支持按告警数、负荷率等列升序/降序排序']),
          createRow(['SL-006', '分页功能', 'P0', '支持分页显示，可选每页10/20/50/100条']),
          createRow(['SL-007', '批量导出', 'P2', '导出当前筛选结果为Excel文件']),
          createRow(['SL-008', '操作入口', 'P0', '每行提供"查看详情"、"视频监控"操作按钮']),
        ]
      }),

      new Paragraph({ text: '', spacing: { after: 300 } }),

      new Paragraph({
        text: '4.2.3 视频巡视中心',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 250, after: 150 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '【功能概述】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '多画面视频监控系统，支持远程视频巡检，减少现场巡检频次。', size: 22 })],
        spacing: { after: 150 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '【页面布局】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({ children: [new TextRun({ text: '• 左侧面板（240px）：摄像头树形导航，按配电室分组', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 中央区域：视频墙，支持多种分屏布局', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 右侧/底部工具栏：云台控制、截图、录制等功能按钮', size: 22 })] }),
      new Paragraph({ text: '', spacing: { after: 150 } }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createRow(['VM-001', '摄像头树', 'P0', '树形结构展示，一级为配电室，二级为摄像头']),
          createRow(['VM-002', '多布局切换', 'P0', '支持1分屏、4分屏、9分屏、16分屏布局切换']),
          createRow(['VM-003', '拖拽播放', 'P0', '将摄像头拖拽到视频窗口即可播放']),
          createRow(['VM-004', '实时预览', 'P0', '播放摄像头实时视频流，延迟<2秒']),
          createRow(['VM-005', '云台控制', 'P1', '支持PTZ控制：上、下、左、右、放大、缩小']),
          createRow(['VM-006', '截图功能', 'P1', '对当前画面截图并保存']),
          createRow(['VM-007', '录制功能', 'P2', '手动启停录制，保存视频片段']),
          createRow(['VM-008', '全屏播放', 'P1', '双击视频窗口进入全屏播放']),
          createRow(['VM-009', '轮询巡视', 'P2', '按预设顺序自动轮换播放不同摄像头']),
          createRow(['VM-010', '历史回放', 'P2', '选择时间段回放历史录像']),
        ]
      }),

      new Paragraph({ text: '', spacing: { after: 300 } }),

      new Paragraph({
        text: '4.2.4 环境与安防总览',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 250, after: 150 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '【功能概述】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '环境参数和安防设备的综合监测面板。', size: 22 })],
        spacing: { after: 150 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createRow(['EM-001', '温度监测', 'P0', '实时显示各配电室温度值，超阈值告警']),
          createRow(['EM-002', '湿度监测', 'P0', '实时显示各配电室湿度值，超阈值告警']),
          createRow(['EM-003', 'SF6监测', 'P1', 'SF6气体浓度监测，泄漏告警']),
          createRow(['EM-004', '烟雾监测', 'P0', '烟雾传感器状态监测，触发告警']),
          createRow(['EM-005', '水浸监测', 'P1', '水浸传感器状态监测']),
          createRow(['EM-006', '门禁状态', 'P0', '门禁开关状态实时显示，异常开门告警']),
          createRow(['EM-007', '阈值配置', 'P1', '支持配置各参数的告警阈值']),
          createRow(['EM-008', '趋势图表', 'P1', '展示温湿度24小时变化趋势']),
        ]
      }),

      new Paragraph({ text: '', spacing: { after: 300 } }),

      new Paragraph({
        text: '4.2.5 配电室详情',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 250, after: 150 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '【功能概述】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '单个配电室的完整信息视图，是系统中信息最详尽的页面。', size: 22 })],
        spacing: { after: 150 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '【页面布局】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({ children: [new TextRun({ text: '• 顶部区域：配电室基本信息 + 状态概览卡片', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 主体区域：Tab标签页切换（一次接线、设备列表、环境监测、视频监控、工单记录、告警历史）', size: 22 })] }),
      new Paragraph({ text: '', spacing: { after: 150 } }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createRow(['RD-001', '基本信息', 'P0', '显示名称、编号、地址、容量、投运日期、运维负责人等']),
          createRow(['RD-002', '状态概览', 'P0', '显示运行状态、当前告警数、今日能耗、实时负荷等']),
          createRow(['RD-003', '一次接线图', 'P0', '展示配电系统电气一次接线拓扑图']),
          createRow(['RD-004', '设备列表', 'P0', '该配电室所有设备清单及实时状态']),
          createRow(['RD-005', '环境雷达图', 'P1', '多维度环境参数雷达图展示']),
          createRow(['RD-006', '视频监控', 'P1', '该配电室的摄像头视频播放']),
          createRow(['RD-007', '工单记录', 'P1', '该配电室相关的历史工单']),
          createRow(['RD-008', '告警历史', 'P1', '该配电室的历史告警记录']),
          createRow(['RD-009', '返回导航', 'P0', '提供返回上一级（地图/列表）的导航']),
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // --- 4.3 运维作业模块 ---
      new Paragraph({
        text: '4.3 运维作业模块',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),

      new Paragraph({
        text: '4.3.1 告警与事件中心',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 250, after: 150 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '【功能概述】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '实时告警监控和处理中心，是运维人员日常工作的核心页面。', size: 22 })],
        spacing: { after: 150 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '【页面布局】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({ children: [new TextRun({ text: '• 顶部区域：4个统计卡片（严重告警、一般告警、AI识别、今日总数）', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 筛选工具栏：类型筛选、等级筛选、状态筛选、时间范围、搜索框', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 主体区域：告警列表表格', size: 22 })] }),
      new Paragraph({ text: '', spacing: { after: 150 } }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createRow(['AL-001', '告警统计卡片', 'P0', '分别统计严重、一般、AI识别、今日总数告警数量']),
          createRow(['AL-002', '实时告警推送', 'P0', '新告警产生时实时推送到页面，声音提醒']),
          createRow(['AL-003', '类型筛选', 'P0', '按类型筛选：电力告警、环境告警、AI识别、安防告警']),
          createRow(['AL-004', '等级筛选', 'P0', '按等级筛选：严重、一般、提示']),
          createRow(['AL-005', '状态筛选', 'P0', '按状态筛选：待处理、处理中、已解决']),
          createRow(['AL-006', '告警列表', 'P0', '表格列：时间、类型、等级、配电室、设备、告警内容、状态、操作']),
          createRow(['AL-007', '告警详情', 'P0', '展开或弹窗显示告警详细信息']),
          createRow(['AL-008', '确认告警', 'P0', '将待处理告警标记为处理中']),
          createRow(['AL-009', '解决告警', 'P0', '将告警标记为已解决，填写处理说明']),
          createRow(['AL-010', '转工单', 'P1', '将告警转为工单，自动关联告警信息']),
          createRow(['AL-011', '告警导出', 'P1', '导出告警记录为Excel文件']),
        ]
      }),
      new Paragraph({ text: '', spacing: { after: 150 } }),
      new Paragraph({
        children: [new TextRun({ text: '【告警处理流程】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '告警产生 → 待处理状态 → 值班人员确认 → 处理中状态 → 处理完成/自动恢复 → 已解决状态', size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '注：告警自动恢复（如温度恢复正常）时，系统自动将告警标记为已解决。', size: 22, italics: true })],
      }),

      new Paragraph({ text: '', spacing: { after: 300 } }),

      new Paragraph({
        text: '4.3.2 工单管理',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 250, after: 150 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '【功能概述】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '工单全生命周期管理，覆盖工单创建、分配、执行、完成全流程。', size: 22 })],
        spacing: { after: 150 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createRow(['WO-001', '工单统计', 'P0', '统计总数、待处理、进行中、已完成数量']),
          createRow(['WO-002', '创建工单', 'P0', '手动创建工单，填写类型、优先级、配电室、描述等']),
          createRow(['WO-003', '工单类型', 'P0', '支持维修、保养、巡检、紧急四种类型']),
          createRow(['WO-004', '优先级设置', 'P0', '紧急、高、中、低四个优先级']),
          createRow(['WO-005', '工单列表', 'P0', '表格展示所有工单及状态']),
          createRow(['WO-006', '工单分配', 'P0', '将工单指派给责任人']),
          createRow(['WO-007', '状态流转', 'P0', '待处理→已分配→进行中→已完成/已取消']),
          createRow(['WO-008', '工单详情', 'P0', '查看工单完整信息和处理记录']),
          createRow(['WO-009', '超时预警', 'P1', '临近超时（黄色）和已超时（红色）工单高亮']),
          createRow(['WO-010', '处理记录', 'P1', '记录工单处理过程中的操作日志']),
        ]
      }),
      new Paragraph({ text: '', spacing: { after: 150 } }),
      new Paragraph({
        children: [new TextRun({ text: '【工单状态流转】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '创建 → 待处理 → 已分配（指派责任人）→ 进行中（开始执行）→ 已完成/已取消', size: 22 })],
      }),

      new Paragraph({ text: '', spacing: { after: 300 } }),

      new Paragraph({
        text: '4.3.3 巡检管理',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 250, after: 150 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createRow(['IP-001', '巡检计划', 'P0', '创建周期性巡检计划（日检/周检/月检）']),
          createRow(['IP-002', '巡检任务', 'P0', '根据计划自动生成巡检任务']),
          createRow(['IP-003', '巡检清单', 'P0', '定义巡检项目检查清单']),
          createRow(['IP-004', '执行记录', 'P0', '记录巡检执行情况（正常/异常）']),
          createRow(['IP-005', '异常上报', 'P1', '巡检发现问题可直接上报并转工单']),
          createRow(['IP-006', '巡检报告', 'P1', '自动生成巡检报告']),
        ]
      }),

      new Paragraph({ text: '', spacing: { after: 300 } }),

      new Paragraph({
        text: '4.3.4 两票管理',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 250, after: 150 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createRow(['TK-001', '工作票管理', 'P1', '创建、审批、执行、终结工作票']),
          createRow(['TK-002', '操作票管理', 'P1', '创建、审核、执行操作票']),
          createRow(['TK-003', '票据模板', 'P1', '预设常用票据模板']),
          createRow(['TK-004', '审批流程', 'P1', '多级审批流程配置']),
          createRow(['TK-005', '票据归档', 'P2', '历史票据查询和归档']),
        ]
      }),

      new Paragraph({ text: '', spacing: { after: 300 } }),

      new Paragraph({
        text: '4.3.5 知识库',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 250, after: 150 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createRow(['KB-001', '知识分类', 'P1', '按类型分类：故障排查、操作手册、应急预案、最佳实践']),
          createRow(['KB-002', '知识搜索', 'P1', '关键词全文搜索']),
          createRow(['KB-003', '知识详情', 'P1', '查看知识文档内容']),
          createRow(['KB-004', '知识收藏', 'P2', '收藏常用知识便于快速访问']),
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // --- 4.4 资产台账模块 ---
      new Paragraph({
        text: '4.4 资产台账模块',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),

      new Paragraph({
        text: '4.4.1 配电室台账',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 250, after: 150 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createRow(['RL-001', '台账列表', 'P0', '所有配电室基本信息列表']),
          createRow(['RL-002', '台账搜索', 'P0', '按名称、编号搜索']),
          createRow(['RL-003', '台账详情', 'P0', '配电室完整档案（基本信息、资产清单、维保历史）']),
          createRow(['RL-004', '台账导出', 'P1', '导出台账Excel/PDF']),
        ]
      }),

      new Paragraph({ text: '', spacing: { after: 300 } }),

      new Paragraph({
        text: '4.4.2 设备台账',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 250, after: 150 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createRow(['DL-001', '设备列表', 'P0', '所有设备清单及基本信息']),
          createRow(['DL-002', '设备分类', 'P0', '按类型分类（变压器/开关柜/传感器等）']),
          createRow(['DL-003', '设备搜索', 'P0', '按名称、型号、编号搜索']),
          createRow(['DL-004', '设备详情', 'P0', '设备完整参数和档案']),
          createRow(['DL-005', '设备导出', 'P1', '批量导出设备清单']),
        ]
      }),

      new Paragraph({ text: '', spacing: { after: 300 } }),

      new Paragraph({
        text: '4.4.3 备品备件管理',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 250, after: 150 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createRow(['SP-001', '库存查询', 'P1', '查看备件库存数量']),
          createRow(['SP-002', '库存预警', 'P1', '低库存自动预警']),
          createRow(['SP-003', '出入库记录', 'P1', '记录出库入库流水']),
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // --- 4.5 分析报表模块 ---
      new Paragraph({
        text: '4.5 分析报表模块',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),

      new Paragraph({
        text: '4.5.1 运维报表',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 250, after: 150 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createRow(['OR-001', '告警处理率', 'P0', '统计告警处理及时率']),
          createRow(['OR-002', '工单完成率', 'P0', '统计工单按时完成率']),
          createRow(['OR-003', '设备可用率', 'P0', '统计设备正常运行时间占比']),
          createRow(['OR-004', '时间维度', 'P1', '支持日/周/月/年维度查看']),
          createRow(['OR-005', '报表导出', 'P1', '导出Excel/PDF报表']),
        ]
      }),

      new Paragraph({ text: '', spacing: { after: 300 } }),

      new Paragraph({
        text: '4.5.2 配电室值班记录表',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 250, after: 150 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '【功能概述】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '依据DB11/T 527-2021标准，提供标准格式的配电室值班记录表，支持每2小时自动采集数据。', size: 22 })],
        spacing: { after: 150 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createRow(['DR-001', '双变压器支持', 'P0', '支持1#、2#变压器数据记录']),
          createRow(['DR-002', '三相电压电流', 'P0', '记录高低压侧A/B/C三相电压和电流']),
          createRow(['DR-003', '有功无功功率', 'P0', '记录高低压侧有功功率和无功功率']),
          createRow(['DR-004', '变压器温度', 'P0', '记录变压器运行温度']),
          createRow(['DR-005', '环境温湿度', 'P0', '记录配电室环境温度和湿度']),
          createRow(['DR-006', '安全用具状态', 'P0', '检查安全用具是否齐全完好']),
          createRow(['DR-007', '消防器材状态', 'P0', '检查消防器材是否齐全有效']),
          createRow(['DR-008', '备注手动输入', 'P0', '支持值班人员手动输入备注说明']),
          createRow(['DR-009', '值班人员信息', 'P1', '记录白班/夜班值班人员及签名']),
          createRow(['DR-010', '统计摘要', 'P1', '自动统计当日负荷、功率因数、环境参数等']),
          createRow(['DR-011', '视图切换', 'P1', '支持报表视图和列表视图切换']),
          createRow(['DR-012', '报表导出', 'P0', '导出Excel/PDF格式，支持打印']),
          createRow(['DR-013', '班次筛选', 'P1', '支持按全天/白班/夜班筛选数据']),
        ]
      }),

      new Paragraph({ text: '', spacing: { after: 300 } }),

      new Paragraph({
        text: '4.5.3 其他报表',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 250, after: 150 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['报表名称', '主要内容', '优先级'], true),
          createRow(['电能质量报表', '电压合格率、功率因数、谐波分析、三相不平衡度', 'P1']),
          createRow(['设备健康报告', '设备健康评分、趋势分析、维保建议', 'P1']),
          createRow(['负荷趋势分析', '负荷曲线、峰谷分析、负荷预测、容量利用率', 'P0']),
          createRow(['电能报表', '用电统计、成本分析、同比环比、节能评估', 'P1']),
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // --- 4.6 系统管理模块 ---
      new Paragraph({
        text: '4.6 系统管理模块',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),

      new Paragraph({
        text: '4.6.1 用户与权限管理',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 250, after: 150 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createRow(['UM-001', '用户列表', 'P0', '查看所有系统用户']),
          createRow(['UM-002', '创建用户', 'P0', '新建用户账户']),
          createRow(['UM-003', '编辑用户', 'P0', '编辑用户信息']),
          createRow(['UM-004', '禁用/启用', 'P0', '禁用或启用用户账户']),
          createRow(['UM-005', '角色管理', 'P0', '创建和管理角色']),
          createRow(['UM-006', '权限分配', 'P0', '为角色分配功能权限']),
          createRow(['UM-007', '操作日志', 'P1', '查看用户操作日志']),
        ]
      }),

      new Paragraph({ text: '', spacing: { after: 300 } }),

      new Paragraph({
        text: '4.6.2 告警与AI策略',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 250, after: 150 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createRow(['SC-001', '告警规则', 'P0', '配置告警触发条件和阈值']),
          createRow(['SC-002', '告警等级', 'P0', '配置告警等级定义']),
          createRow(['SC-003', '通知设置', 'P1', '配置告警通知方式（短信/邮件/推送）']),
          createRow(['SC-004', 'AI参数', 'P2', 'AI模型参数调优']),
        ]
      }),

      new Paragraph({ text: '', spacing: { after: 300 } }),

      new Paragraph({
        text: '4.6.3 数据字典',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 250, after: 150 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createRow(['DD-001', '字典分类', 'P1', '按类型分类管理字典']),
          createRow(['DD-002', '字典项管理', 'P1', '增删改查字典项']),
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ==================== 第五章 非功能需求 ====================
      new Paragraph({
        text: '第五章 非功能需求',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 300 }
      }),

      new Paragraph({
        text: '5.1 性能需求',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['性能指标', '要求', '说明'], true),
          createRow(['首屏加载时间', '< 3秒', '网络良好条件下']),
          createRow(['接口响应时间', '普通接口 < 500ms', '复杂查询 < 2秒']),
          createRow(['并发用户数', '≥ 500', '同时在线用户']),
          createRow(['实时数据刷新', '5秒', '设备状态、告警等实时数据']),
          createRow(['统计数据刷新', '30秒', 'KPI、统计图表等']),
          createRow(['视频延迟', '< 2秒', '实时视频流']),
        ]
      }),

      new Paragraph({
        text: '5.2 可用性需求',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['可用性指标', '要求', '说明'], true),
          createRow(['系统可用性', '99.9%', '年度不可用时间 < 8.76小时']),
          createRow(['数据备份', '每日自动备份', '保留30天']),
          createRow(['故障恢复目标(RTO)', '< 4小时', '系统恢复时间']),
          createRow(['数据恢复目标(RPO)', '< 1小时', '数据丢失容忍度']),
        ]
      }),

      new Paragraph({
        text: '5.3 安全需求',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['安全需求', '描述'], true),
          createRow(['身份认证', '用户名密码登录，支持LDAP集成']),
          createRow(['权限控制', '基于角色的访问控制(RBAC)']),
          createRow(['数据传输', 'HTTPS加密传输']),
          createRow(['操作审计', '关键操作记录日志']),
          createRow(['会话管理', '登录超时自动退出（默认30分钟）']),
          createRow(['密码策略', '最小8位，包含字母和数字']),
        ]
      }),

      new Paragraph({
        text: '5.4 兼容性需求',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['兼容类型', '支持范围'], true),
          createRow(['浏览器', 'Chrome 80+、Edge 80+、Firefox 75+、Safari 13+']),
          createRow(['分辨率', '最低1366×768，推荐1920×1080，支持4K']),
          createRow(['网络带宽', '≥ 10Mbps（含视频监控）']),
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ==================== 第六章 界面设计规范 ====================
      new Paragraph({
        text: '第六章 界面设计规范',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 300 }
      }),

      new Paragraph({
        text: '6.1 设计风格',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({ children: [new TextRun({ text: '• 主题风格：SC2（星际争霸2）科幻运维中心主题', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 整体调性：专业、科技、沉浸、高效', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 视觉特点：深色背景、青绿色高亮、科技感边框和动效', size: 22 })] }),

      new Paragraph({
        text: '6.2 配色规范',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['用途', '色值', '说明'], true),
          createRow(['主色', '#00F0FF', '科技青绿色，用于重点强调']),
          createRow(['背景深色', '#0D121A', '深蓝黑，主背景色']),
          createRow(['背景浅色', '#1A2332', '卡片、面板背景']),
          createRow(['文字主色', '#E0E6ED', '主要文字颜色']),
          createRow(['文字次色', '#8B9AAD', '次要文字颜色']),
          createRow(['成功色', '#00E676', '正常、成功状态']),
          createRow(['警告色', '#FFD600', '警告、注意状态']),
          createRow(['危险色', '#FF2E63', '错误、严重告警']),
        ]
      }),

      new Paragraph({
        text: '6.3 布局规范',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({ children: [new TextRun({ text: '• 顶部导航栏高度：60px', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 内容区边距：24px', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 卡片圆角：4px（科技风格偏小圆角）', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 栅格系统：24栏', size: 22 })] }),

      new Paragraph({ children: [new PageBreak()] }),

      // ==================== 第七章 验收标准 ====================
      new Paragraph({
        text: '第七章 验收标准',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 300 }
      }),

      new Paragraph({
        text: '7.1 功能验收标准',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({ children: [new TextRun({ text: '• P0需求：100%实现并通过测试', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• P1需求：90%以上实现并通过测试', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 核心业务流程：完整可用，无阻塞性问题', size: 22 })] }),

      new Paragraph({
        text: '7.2 质量验收标准',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({ children: [new TextRun({ text: '• 阻塞型缺陷：0个', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 严重缺陷修复率：100%', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 一般缺陷修复率：≥95%', size: 22 })] }),

      new Paragraph({
        text: '7.3 性能验收标准',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({ children: [new TextRun({ text: '• 通过性能测试各项指标', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 无严重性能问题', size: 22 })] }),

      new Paragraph({ children: [new PageBreak()] }),

      // ==================== 附录 ====================
      new Paragraph({
        text: '附录',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 300 }
      }),

      new Paragraph({
        text: '附录A 参考文档',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({ children: [new TextRun({ text: '• DB11/T 527-2021 配电室安全管理规范', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 国家电网企业标准', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• Element Plus设计规范', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• Vue 3官方文档', size: 22 })] }),

      new Paragraph({
        text: '附录B 页面清单',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['序号', '页面名称', '路由路径', '所属模块'], true),
          createRow(['1', '登录页', '/login', '公共']),
          createRow(['2', '智慧运维中心', '/dashboard/integrated-ops', '驾驶舱']),
          createRow(['3', '无人配电指挥中心', '/dashboard/command-center', '驾驶舱']),
          createRow(['4', 'AI安全态势', '/dashboard/ai-security', '驾驶舱']),
          createRow(['5', '站点监控地图', '/monitoring/site-map', '智能监控']),
          createRow(['6', '站点列表监控', '/monitoring/site-list', '智能监控']),
          createRow(['7', '视频巡视中心', '/monitoring/video', '智能监控']),
          createRow(['8', '环境与安防总览', '/monitoring/environment', '智能监控']),
          createRow(['9', '配电室详情', '/room/detail/:id', '智能监控']),
          createRow(['10', '告警与事件中心', '/om/alarms', '运维作业']),
          createRow(['11', '工单管理', '/om/work-orders', '运维作业']),
          createRow(['12', '巡检管理', '/om/inspection', '运维作业']),
          createRow(['13', '两票管理', '/om/tickets', '运维作业']),
          createRow(['14', '知识库', '/om/knowledge', '运维作业']),
          createRow(['15', '配电室台账', '/assets/rooms', '资产台账']),
          createRow(['16', '设备台账', '/assets/devices', '资产台账']),
          createRow(['17', '备品备件管理', '/assets/spares', '资产台账']),
          createRow(['18', '运维报表', '/analytics/operation', '分析报表']),
          createRow(['19', '电能质量报表', '/analytics/power-quality', '分析报表']),
          createRow(['20', '设备健康报告', '/analytics/health', '分析报表']),
          createRow(['21', '负荷趋势分析', '/analytics/load', '分析报表']),
          createRow(['22', '配电室值班记录表', '/analytics/duty-record', '分析报表']),
          createRow(['23', '电能报表', '/analytics/energy-report', '分析报表']),
          createRow(['24', '用户与权限管理', '/system/users', '系统管理']),
          createRow(['25', '告警与AI策略', '/system/strategies', '系统管理']),
          createRow(['26', '数据字典', '/system/dictionary', '系统管理']),
          createRow(['27', '全屏监控大屏', '/bigscreen', '公共']),
        ]
      }),

      new Paragraph({ text: '', spacing: { after: 400 } }),
      new Paragraph({
        children: [new TextRun({ text: '— 文档结束 —', size: 22, italics: true })],
        alignment: AlignmentType.CENTER,
      }),
    ],
  }],
});

// 生成文档
const buffer = await Packer.toBuffer(doc);
fs.writeFileSync('/Users/maruilian/无人配电室运维系统/power-room-platform/docs/无人配电室智慧运维系统_产品需求文档PRD.docx', buffer);
console.log('Word文档已生成：无人配电室智慧运维系统_产品需求文档PRD.docx');
