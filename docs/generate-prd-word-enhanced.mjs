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

// 创建左对齐的单元格
function createLeftCell(text, isHeader = false) {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, bold: isHeader, size: 20 })],
      alignment: AlignmentType.LEFT,
    })],
    borders: tableBorders,
  });
}

// 创建表格行
function createRow(cells, isHeader = false) {
  return new TableRow({
    children: cells.map((cell, index) => createCell(cell, isHeader)),
  });
}

// 创建带左对齐描述的行
function createDescRow(cells) {
  return new TableRow({
    children: [
      createCell(cells[0], false),
      createCell(cells[1], false),
      createCell(cells[2], false),
      createLeftCell(cells[3], false),
    ],
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
        spacing: { after: 800 }
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Product Requirements Document', size: 28, italics: true, color: '666666' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 1500 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '—— 详细版 ——', size: 24, color: '0066CC' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 1500 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '文档版本：V1.1', size: 24 })],
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
          createRow(['V1.1', '2025-12-08', '增加详细描述：用户故事、业务流程、数据规格、异常处理', '产品经理', '技术总监']),
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
      new Paragraph({ children: [new TextRun({ text: '• 产品团队：需求分析、优先级排序、版本规划', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 设计团队：UI/UX设计、交互原型设计', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 开发团队：前端开发、后端开发、接口设计', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 测试团队：测试用例设计、功能验收', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 运维团队：系统部署、运行维护', size: 22 })] }),

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
        children: [new TextRun({ text: '（1）人力成本高昂：', bold: true, size: 22 }), new TextRun({ text: '传统配电室需要24小时人工值班，按照三班倒制度，每个配电室至少需要配置6名值班人员。以某企业管理的20个配电室为例，仅值班人员成本每年超过500万元。', size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '（2）故障响应滞后：', bold: true, size: 22 }), new TextRun({ text: '依赖人工巡检发现故障，巡检周期通常为2-4小时。统计数据显示，约35%的设备故障发生在巡检间隔期间，平均故障发现时间超过45分钟，可能导致设备损坏或停电事故扩大。', size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '（3）数据孤岛严重：', bold: true, size: 22 }), new TextRun({ text: '电力监控系统、视频监控系统、门禁系统、环境监测系统各自独立运行，数据格式不统一，无法进行综合分析。运维人员需要在多个系统间切换，工作效率低下。', size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '（4）安全风险管控难：', bold: true, size: 22 }), new TextRun({ text: '配电室属于高危作业场所，涉及高压电操作风险。传统纸质两票管理存在流程不规范、审批不及时、归档困难等问题。人员违规操作难以追溯，安全隐患难以及时发现。', size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '（5）决策支持不足：', bold: true, size: 22 }), new TextRun({ text: '缺乏精细化的数据分析，设备健康状态无法量化评估，维保计划主要依赖经验制定，存在过度维护或维护不足的问题，难以实现精准运维和预测性维护。', size: 22 })],
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
          createRow(['术语', '英文', '定义说明'], true),
          createRow(['配电室', 'Substation', '安装有高低压配电设备，进行电能分配和控制的专用建筑或场所，通常包含变压器、高压开关柜、低压开关柜等设备']),
          createRow(['变压器', 'Transformer', '将高压电（10kV）转换为低压电（0.4kV）的电力设备，是配电室的核心设备，常见型号如S11-1000/10表示1000kVA容量']),
          createRow(['开关柜', 'Switchgear', '用于控制、保护和隔离电力线路和设备的成套柜体，分为高压开关柜（10kV）和低压开关柜（0.4kV）']),
          createRow(['数字孪生', 'Digital Twin', '利用数字技术构建物理设备在虚拟空间的映射，实现设备状态实时同步、运行仿真和故障预测']),
          createRow(['工单', 'Work Order', '记录运维任务信息的电子单据，包含任务类型、描述、执行人、计划时间、完成时间等关键信息']),
          createRow(['两票', 'Two Permits', '工作票和操作票的统称，是电力系统保证安全作业的重要管理手段，用于规范高压电气设备的操作流程']),
          createRow(['有功功率', 'Active Power', '电路中实际消耗并转化为其他形式能量的功率，单位为kW（千瓦），是衡量用电量的主要指标']),
          createRow(['无功功率', 'Reactive Power', '在电路中往返交换但不做功的功率，单位为kVar（千乏），过高会导致线路损耗增加']),
          createRow(['功率因数', 'Power Factor', '有功功率与视在功率的比值，反映电能利用效率，一般要求≥0.9，低于此值可能面临电费罚款']),
          createRow(['负荷率', 'Load Factor', '实际负荷与变压器额定容量的比值，反映变压器利用程度，一般建议控制在40%-80%之间']),
          createRow(['三相不平衡', 'Phase Imbalance', '三相电流或电压的不平衡程度，过大会导致变压器发热、损耗增加，一般要求不超过15%']),
        ]
      }),

      new Paragraph({
        text: '1.4 参考标准',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '本系统设计和开发遵循以下国家标准、行业标准和北京市地方标准：', size: 22 })],
        spacing: { after: 150 }
      }),

      // 北京市地方标准
      new Paragraph({
        children: [new TextRun({ text: '【北京市地方标准】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['标准编号', '标准名称', '适用范围'], true),
          createRow(['DB11/T 527-2021', '配电室安全管理规范', '本标准为系统核心参考标准，规定了配电室值班记录表格式（2小时/次）、巡检项目、安全用具配置、消防器材要求等']),
          createRow(['DB11/T 1028-2021', '供配电系统运行维护规范', '规定了供配电系统的运行管理、巡视检查、维护保养、故障处理等要求']),
          createRow(['DB11/T 1729-2020', '电力用户供配电设施运行维护规范', '规定了用户侧供配电设施的运维管理要求，包括设备台账、运行监测、定期检查等']),
          createRow(['DB11/T 1504-2017', '城镇配电网技术导则', '规定了城镇配电网规划设计、建设改造的技术要求']),
          createRow(['DB11/T 852-2012', '安全生产等级评定技术规范 第3部分：电力企业', '规定了电力企业安全生产等级评定的指标和方法']),
        ]
      }),
      new Paragraph({ text: '', spacing: { after: 200 } }),

      // 国家标准
      new Paragraph({
        children: [new TextRun({ text: '【国家标准（GB）】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['标准编号', '标准名称', '适用范围'], true),
          createRow(['GB 50054-2011', '低压配电设计规范', '低压配电系统设计、设备选型、安装要求']),
          createRow(['GB 50053-2013', '20kV及以下变电所设计规范', '配电室建筑设计、电气布置、防火要求']),
          createRow(['GB 50052-2009', '供配电系统设计规范', '供配电系统整体设计、负荷计算、无功补偿']),
          createRow(['GB/T 50065-2011', '交流电气装置的接地设计规范', '配电室接地系统设计、接地电阻要求']),
          createRow(['GB 50150-2016', '电气装置安装工程 电气设备交接试验标准', '设备验收试验项目和标准']),
          createRow(['GB/T 14549-1993', '电能质量 公用电网谐波', '电能质量谐波限值、测量方法']),
          createRow(['GB/T 15543-2008', '电能质量 三相电压不平衡', '三相不平衡度限值和测量方法']),
          createRow(['GB/T 12325-2008', '电能质量 供电电压偏差', '电压偏差允许范围（±7%）']),
          createRow(['GB/T 15945-2008', '电能质量 电力系统频率偏差', '频率偏差允许范围（±0.2Hz）']),
          createRow(['GB/T 22239-2019', '信息安全技术 网络安全等级保护基本要求', '系统安全设计和防护要求']),
          createRow(['GB/T 35273-2020', '信息安全技术 个人信息安全规范', '用户数据保护和隐私合规']),
        ]
      }),
      new Paragraph({ text: '', spacing: { after: 200 } }),

      // 行业标准
      new Paragraph({
        children: [new TextRun({ text: '【电力行业标准（DL/T）】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['标准编号', '标准名称', '适用范围'], true),
          createRow(['DL/T 596-2021', '电力设备预防性试验规程', '设备维护保养周期、试验项目、判断标准']),
          createRow(['DL/T 572-2021', '电力变压器运行规程', '变压器运行监测参数、保护定值、运维要求']),
          createRow(['DL/T 593-2016', '高压开关设备和控制设备标准的共用技术要求', '高压开关柜技术参数和运维要求']),
          createRow(['DL/T 5352-2018', '高压配电装置设计规范', '高压配电设备布置、安全距离、防护要求']),
          createRow(['DL/T 599-2016', '城市中低压配电网改造技术导则', '配电网改造的技术要求和评估方法']),
          createRow(['DL/T 1100-2019', '电力系统的时间同步系统', '系统时间同步精度要求（用于数据采集）']),
        ]
      }),
      new Paragraph({ text: '', spacing: { after: 200 } }),

      // 国家电网企业标准
      new Paragraph({
        children: [new TextRun({ text: '【国家电网企业标准（Q/GDW）】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['标准编号', '标准名称', '适用范围'], true),
          createRow(['Q/GDW 11612-2017', '低压配电网运维规程', '低压配电网巡检、维护、故障处理']),
          createRow(['Q/GDW 11597-2016', '配电自动化技术导则', '配电自动化系统功能、通信协议、数据格式']),
          createRow(['Q/GDW 10370-2016', '配电网运行监测技术规范', '配电网在线监测、数据采集、告警规则']),
          createRow(['Q/GDW 11314-2015', '用电信息采集系统技术规范', '用电数据采集、通信协议、数据格式']),
        ]
      }),
      new Paragraph({ text: '', spacing: { after: 200 } }),

      // 标准应用说明
      new Paragraph({
        children: [new TextRun({ text: '【标准应用说明】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '1. DB11/T 527-2021是本系统最核心的参考标准，系统中的"配电室值班记录表"功能完全按照该标准附录A的表格格式设计，采集周期为2小时/次，记录项目包括：变压器高低压侧三相电压电流、有功无功功率、变压器温度、环境温湿度、安全用具和消防器材状态等。', size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '2. 系统告警阈值设置参考GB/T 12325-2008（电压偏差±7%）、GB/T 15543-2008（三相不平衡度<15%）等电能质量标准。', size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '3. 设备巡检周期和维保计划参考DL/T 596-2021预防性试验规程，变压器油色谱分析周期、开关柜检修周期等均按该标准执行。', size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '4. 系统安全设计符合GB/T 22239-2019网络安全等级保护二级要求，包括身份认证、访问控制、安全审计、数据加密等。', size: 22 })],
        spacing: { after: 100 }
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
      new Paragraph({ children: [new TextRun({ text: '• 一屏掌控：集成驾驶舱大屏，实现运维态势一目了然，管理者无需在多个系统间切换', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 智能预警：AI驱动的故障预测和风险预警，将被动响应转变为主动预防，防患于未然', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 远程运维：视频巡检+远程控制，大幅减少现场人工干预，实现"无人值班、少人值守"', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 数据决策：多维度报表分析，沉淀运维数据资产，支撑精准化运维决策和持续优化', size: 22 })] }),

      new Paragraph({
        text: '2.2 目标用户与用户故事',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '本系统面向以下六类核心用户，每类用户有其特定的使用场景和核心诉求：', size: 22 })],
        spacing: { after: 150 }
      }),

      // 用户角色表格
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['用户角色', '职责描述', '核心需求', '典型场景'], true),
          createRow(['运维管理人员', '统筹管理多个配电室的日常运维工作', '全局监控、资源调度、绩效考核', '每日查看驾驶舱了解整体运维态势']),
          createRow(['值班监控人员', '7×24小时监控配电室运行状态', '实时告警、快速响应、事件处置', '收到告警后5分钟内完成初步判断']),
          createRow(['现场巡检人员', '执行现场巡检、维修和保养任务', '任务清单、操作指引、记录上报', '按巡检计划执行并上报结果']),
          createRow(['设备资产管理员', '管理配电设备的资产台账信息', '资产登记、生命周期、维保计划', '设备入库登记和维保计划制定']),
          createRow(['系统管理员', '系统配置、用户管理、权限分配', '灵活配置、安全管控、日志审计', '配置告警规则和用户权限']),
          createRow(['企业管理层', '查看运维报表、了解运行状况', '数据可视化、KPI达成、决策支持', '月度运维报告汇报和决策']),
        ]
      }),

      new Paragraph({ text: '', spacing: { after: 200 } }),
      new Paragraph({
        children: [new TextRun({ text: '【用户故事示例】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: 'US-001 运维管理人员-全局监控', bold: true, size: 22 })],
        spacing: { after: 50 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '作为运维管理人员，我希望在一个页面上看到所有配电室的运行状态和关键指标，以便快速掌握整体运维态势，及时发现需要关注的问题。', size: 22 })],
        spacing: { after: 50 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '验收标准：①一屏展示所有KPI指标 ②支持按状态筛选配电室 ③异常站点自动高亮显示 ④数据30秒自动刷新', size: 22, italics: true, color: '666666' })],
        spacing: { after: 150 }
      }),

      new Paragraph({
        children: [new TextRun({ text: 'US-002 值班人员-告警处理', bold: true, size: 22 })],
        spacing: { after: 50 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '作为值班监控人员，我希望收到告警时能立即看到告警详情和处置建议，以便快速判断告警严重程度并采取相应措施。', size: 22 })],
        spacing: { after: 50 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '验收标准：①告警产生后3秒内推送到页面 ②声音提醒 ③显示告警等级和处置建议 ④支持一键转工单', size: 22, italics: true, color: '666666' })],
        spacing: { after: 150 }
      }),

      new Paragraph({
        children: [new TextRun({ text: 'US-003 巡检人员-任务执行', bold: true, size: 22 })],
        spacing: { after: 50 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '作为现场巡检人员，我希望在移动端查看今日待执行的巡检任务，并按照标准化检查清单逐项执行和记录，以便规范完成巡检工作。', size: 22 })],
        spacing: { after: 50 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '验收标准：①显示任务清单和优先级 ②提供标准化检查项 ③支持拍照上传 ④异常可直接上报', size: 22, italics: true, color: '666666' })],
        spacing: { after: 150 }
      }),

      new Paragraph({
        text: '2.3 产品目标',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['目标维度', '具体目标', '量化指标', '测量方法'], true),
          createRow(['降本增效', '减少人工值班投入，提升运维效率', '人力成本降低50%以上', '对比实施前后值班人员配置']),
          createRow(['故障响应', '缩短故障发现和处理时间', '平均响应时间<5分钟', '统计告警产生到确认的时间差']),
          createRow(['设备可靠', '降低设备故障率，延长使用寿命', '非计划停电减少30%以上', '统计年度非计划停电次数']),
          createRow(['安全管控', '规范作业流程，消除安全隐患', '安全事故零发生', '安全事故统计']),
          createRow(['数据价值', '沉淀运维数据，支撑智能决策', '数据采集完整率>99%', '统计数据采集成功率']),
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
        children: [new TextRun({ text: '（1）设备接入层：', bold: true, size: 22 }), new TextRun({ text: '通过MQTT、Modbus、IEC 61850等协议接入各类传感器、智能设备和视频设备。支持主流品牌的智能电表、环境传感器、门禁控制器、网络摄像机等设备的数据采集。', size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '（2）数据服务层：', bold: true, size: 22 }), new TextRun({ text: '提供数据采集、存储、处理和分析服务。采用时序数据库存储海量监测数据，关系数据库存储业务数据，Redis缓存热点数据，支持数据清洗、聚合、告警规则引擎等处理逻辑。', size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '（3）业务应用层：', bold: true, size: 22 }), new TextRun({ text: '实现监控、告警、工单、资产、报表等核心业务功能。采用微服务架构，各服务独立部署、独立扩展，通过API网关统一对外提供RESTful接口。', size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '（4）用户交互层：', bold: true, size: 22 }), new TextRun({ text: 'Web端应用界面，采用Vue 3 + TypeScript + Element Plus技术栈开发。支持主流浏览器，响应式布局适配大屏投放和普通PC显示器。', size: 22 })],
        spacing: { after: 200 }
      }),

      new Paragraph({
        text: '3.2 功能模块架构',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '系统功能划分为六大核心模块，共计27个页面：', size: 22 })],
        spacing: { after: 150 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['模块名称', '功能定位', '包含页面', '页面数量'], true),
          createRow(['驾驶舱模块', '全局运维态势感知中心', '智慧运维中心、指挥中心、AI安全态势', '3']),
          createRow(['智能监控模块', '多维度实时监控能力', '站点地图、站点列表、视频巡视、环境安防、配电室详情', '5']),
          createRow(['运维作业模块', '运维任务全流程管理', '告警中心、工单管理、巡检管理、两票管理、知识库', '5']),
          createRow(['资产台账模块', '设备资产全生命周期', '配电室台账、设备台账、备品备件', '3']),
          createRow(['分析报表模块', '数据分析与决策支持', '运维报表、电能质量、设备健康、负荷分析、值班记录、电能报表', '6']),
          createRow(['系统管理模块', '系统配置与权限管理', '用户权限、告警策略、数据字典', '3']),
        ]
      }),

      new Paragraph({
        text: '3.3 技术架构',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '前端技术栈详细说明：', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['技术', '版本', '用途', '选型理由'], true),
          createRow(['Vue', '3.5.24', '渐进式JavaScript框架', '组合式API提升代码复用性，性能优异']),
          createRow(['TypeScript', '5.9.3', '类型安全的JavaScript超集', '编译时类型检查，减少运行时错误']),
          createRow(['Vite', '7.2.2', '下一代前端构建工具', '冷启动极快，HMR热更新体验好']),
          createRow(['Vue Router', '4.6.3', '官方路由管理器', '支持路由守卫、懒加载、嵌套路由']),
          createRow(['Pinia', '3.0.4', '新一代状态管理库', '比Vuex更简洁，完美支持TypeScript']),
          createRow(['Element Plus', '2.11.8', '企业级UI组件库', '组件丰富、文档完善、社区活跃']),
          createRow(['ECharts', '6.0.0', '数据可视化图表库', '功能强大，支持多种图表类型']),
          createRow(['Three.js', '0.181.2', '3D图形渲染引擎', '用于3D数字孪生和拓扑图展示']),
        ]
      }),

      new Paragraph({
        text: '3.4 数据流架构',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '系统数据流分为三类：', size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '（1）实时数据流：', bold: true, size: 22 }), new TextRun({ text: '设备采集数据 → MQTT消息队列 → 数据处理服务 → 时序数据库 → WebSocket推送 → 前端展示。延迟要求<5秒。', size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '（2）告警数据流：', bold: true, size: 22 }), new TextRun({ text: '实时数据 → 规则引擎判断 → 告警生成 → 消息推送（WebSocket+短信+邮件）→ 告警存储。延迟要求<3秒。', size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '（3）业务数据流：', bold: true, size: 22 }), new TextRun({ text: '用户操作 → API网关 → 业务服务 → 关系数据库 → 响应返回。响应时间<500ms。', size: 22 })],
        spacing: { after: 100 }
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
        children: [new TextRun({ text: '智慧运维中心是系统的核心驾驶舱页面，采用"一屏总览"的设计理念，将全域配电室的关键运维指标、实时状态、告警信息、工单进度等核心数据集中展示，帮助运维管理人员快速掌握整体运维态势。本页面适用于大屏投放（推荐4K分辨率）和普通PC显示器。', size: 22 })],
        spacing: { after: 150 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '【页面布局】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({ children: [new TextRun({ text: '• 顶部区域（Header，高度80px）：5个KPI核心指标卡片横向排列，每个卡片包含指标名称、当前值、变化趋势', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 左侧区域（20%宽度）：设备健康度饼图面板 + 环境监测参数概览面板', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 中央区域（60%宽度）：GIS地图核心展示区，支持高德/百度地图底图切换', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 右侧区域（20%宽度）：实时告警滚动列表 + 工单统计卡片面板', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 底部区域（Footer，高度200px）：24小时负荷趋势折线图 + 运维成效分析图表', size: 22 })] }),
      new Paragraph({ text: '', spacing: { after: 150 } }),

      new Paragraph({
        children: [new TextRun({ text: '【功能需求清单】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createDescRow(['DC-001', 'KPI卡片-安全运行天数', 'P0', '显示系统持续安全运行的天数，从上线日期开始累计计算。遇重大安全事故（如人员伤亡、重大设备损坏）归零重计。数据来源：系统配置表。显示格式：整数+\"天\"。']),
          createDescRow(['DC-002', 'KPI卡片-站点在线率', 'P0', '显示当前在线配电室数量/总配电室数量的百分比。在线判断标准：最近5分钟内有数据上报。显示格式：百分比，保留一位小数。低于95%时红色高亮警示。']),
          createDescRow(['DC-003', 'KPI卡片-今日告警数', 'P0', '显示今日0:00至当前时间产生的告警总数。分类显示：严重/一般/提示。点击跳转至告警中心页面，自动筛选今日告警。']),
          createDescRow(['DC-004', 'KPI卡片-待处理急单', 'P0', '显示当前状态为\"待处理\"或\"处理中\"且优先级为\"紧急\"的工单数量。数量>0时红色高亮并闪烁。点击跳转工单管理页面，自动筛选紧急待处理工单。']),
          createDescRow(['DC-005', 'KPI卡片-实时总负荷', 'P0', '显示所有配电室当前有功功率之和。数据每5秒刷新一次。显示格式：数值+\"kW\"，超过1000显示为\"MW\"。同时显示相对额定容量的百分比。']),
          createDescRow(['DC-006', 'GIS地图展示', 'P0', '在地图上标注所有配电室位置。支持地图缩放（鼠标滚轮/按钮）、拖拽移动。默认显示全部站点的最佳视野范围。支持标准地图/卫星地图切换。']),
          createDescRow(['DC-007', '地图状态标记', 'P0', '根据配电室状态显示不同颜色图标：绿色-正常运行、橙色-存在告警、红色-严重故障、灰色-通信离线。状态判断优先级：离线>故障>告警>正常。']),
          createDescRow(['DC-008', '设备健康度饼图', 'P0', '环形饼图展示全部设备的健康状态分布。分为三类：健康（绿色，健康评分≥80）、注意（橙色，60≤评分<80）、异常（红色，评分<60）。显示各类数量和占比。']),
          createDescRow(['DC-009', '环境参数概览', 'P1', '显示所有配电室环境参数的极值统计。包括：最高/最低温度、最高/最低湿度、异常站点数量。异常标准：温度>40℃或<0℃，湿度>80%或<20%。']),
          createDescRow(['DC-010', '实时告警滚动列表', 'P0', '显示最新10条告警信息，按时间倒序排列。每5秒检查新告警，新告警从顶部插入，自动滚动。显示字段：时间、等级图标、配电室名称、告警内容摘要（20字）。']),
          createDescRow(['DC-011', '工单统计卡片', 'P1', '分三栏显示工单数量：待处理（橙色）、进行中（蓝色）、今日完成（绿色）。点击各栏跳转工单管理页面并应用对应筛选条件。']),
          createDescRow(['DC-012', '24小时负荷曲线', 'P1', '折线图展示过去24小时的系统总负荷变化趋势。X轴：时间（每小时一个点），Y轴：负荷值（kW）。显示最大值、最小值、当前值标注。']),
          createDescRow(['DC-013', '数据自动刷新', 'P0', '页面数据每30秒自动刷新（可配置10-60秒）。刷新时显示加载指示器。支持手动刷新按钮，点击立即刷新全部数据。']),
          createDescRow(['DC-014', '全屏展示模式', 'P1', '支持F11快捷键进入全屏展示。全屏模式下隐藏浏览器工具栏和系统侧边栏。适配16:9宽高比大屏幕。ESC键退出全屏。']),
        ]
      }),
      new Paragraph({ text: '', spacing: { after: 150 } }),

      new Paragraph({
        children: [new TextRun({ text: '【交互说明】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({ children: [new TextRun({ text: '1. KPI卡片交互：鼠标悬停显示详细说明tooltip，点击跳转至对应详情页面。', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '2. 地图标记交互：鼠标悬停显示站点名称，单击弹出信息卡片（名称、状态、告警数、负荷率、进入详情按钮），双击直接跳转详情页。', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '3. 告警列表交互：点击某条告警弹出告警详情弹窗，显示完整告警信息和处理建议。', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '4. 全屏模式：点击右上角全屏按钮或按F11进入，再次点击或按ESC退出。', size: 22 })] }),

      new Paragraph({ text: '', spacing: { after: 150 } }),
      new Paragraph({
        children: [new TextRun({ text: '【异常处理】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({ children: [new TextRun({ text: '1. 数据加载失败：显示"数据加载失败，请检查网络连接"提示，提供重试按钮。', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '2. 地图加载失败：显示静态备用地图图片，提示"地图服务暂时不可用"。', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '3. WebSocket断连：自动重连（最多3次，间隔5秒），超过后提示用户刷新页面。', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '4. 无数据状态：各面板显示"暂无数据"占位符，不影响其他模块正常展示。', size: 22 })] }),

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
        children: [new TextRun({ text: '面向运维调度的指挥中心，重点关注异常站点和紧急事项，支持快速指令下发和任务调度。适用于值班室大屏展示，帮助值班人员快速定位问题站点并协调处置。', size: 22 })],
        spacing: { after: 150 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createDescRow(['DC-020', '异常站点看板', 'P0', '突出显示存在告警或故障的配电室列表，按严重程度排序（严重故障>一般告警>通信异常）。显示站点名称、异常类型、持续时间、负责人。']),
          createDescRow(['DC-021', '紧急事件列表', 'P0', '展示需要紧急处理的事件，包括严重告警和紧急工单。支持一键派单：选择执行人后自动创建工单并推送通知。']),
          createDescRow(['DC-022', '3D拓扑可视化', 'P1', '配电网络拓扑的3D可视化展示，显示变压器、开关柜、线路连接关系。支持旋转、缩放、点击设备查看详情。']),
          createDescRow(['DC-023', '指令下发功能', 'P2', '向指定人员发送调度指令（短信/APP推送/系统消息）。指令模板：巡检、抢修、确认、汇报等。指令需记录日志。']),
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
        children: [new TextRun({ text: 'AI驱动的智能安全分析面板，通过机器学习算法分析设备运行数据，提供风险预警和趋势预测。帮助运维团队从"被动响应"转向"主动预防"。', size: 22 })],
        spacing: { after: 150 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createDescRow(['DC-030', '威胁等级分布', 'P1', '展示AI识别的威胁等级分布饼图（高危/中危/低危/安全）。高危设备列表展示，点击查看详细风险分析报告。']),
          createDescRow(['DC-031', '异常事件热力图', 'P1', '时间（X轴，24小时）-设备类型（Y轴）维度的异常事件热力分布图。颜色深浅表示异常频率，帮助发现规律。']),
          createDescRow(['DC-032', '故障趋势预测', 'P2', '基于历史数据和机器学习模型预测未来7天可能发生故障的设备清单。显示预测置信度、建议维护措施。']),
          createDescRow(['DC-033', '根因分析报告', 'P2', 'AI辅助的故障根因分析，输入故障现象，系统推荐可能原因和处置方案。基于历史工单和知识库学习。']),
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
        children: [new TextRun({ text: 'GIS地图展示所有配电室的地理位置分布和实时运行状态，支持多种交互操作，是站点定位和状态总览的核心页面。', size: 22 })],
        spacing: { after: 150 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '【页面布局】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({ children: [new TextRun({ text: '• 左侧面板（宽度280px，可收起）：配电室搜索框 + 状态筛选器（复选框：正常/告警/故障/离线）+ 站点树形列表', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 中央区域：GIS地图主显示区，占据剩余全部宽度', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 右侧浮层：选中站点的信息详情卡片（点击站点后显示）', size: 22 })] }),
      new Paragraph({ text: '', spacing: { after: 150 } }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createDescRow(['SM-001', '地图底图', 'P0', '集成高德地图（备选百度地图），支持标准视图/卫星视图切换。地图API Key可配置，支持私有化部署。']),
          createDescRow(['SM-002', '站点标记', 'P0', '在地图上标注所有配电室位置，使用自定义图标（区分不同类型配电室）。标记可点击、可悬停。']),
          createDescRow(['SM-003', '状态着色', 'P0', '根据运行状态显示不同颜色：绿色正常、橙色告警（有未处理告警）、红色故障（有严重告警或设备故障）、灰色离线（>5分钟无数据）。']),
          createDescRow(['SM-004', '标记点击', 'P0', '点击标记弹出信息卡片，显示：站点名称、状态标签、当前告警数、设备总数、实时负荷、负荷率进度条、\"进入详情\"按钮。']),
          createDescRow(['SM-005', '搜索定位', 'P1', '输入配电室名称或编号进行模糊搜索，选择结果后地图自动缩放并居中显示该站点，高亮闪烁3秒。']),
          createDescRow(['SM-006', '状态筛选', 'P1', '复选框筛选：勾选状态后地图只显示符合条件的站点，其他站点隐藏或半透明显示。']),
          createDescRow(['SM-007', '聚合显示', 'P2', '地图缩小到一定级别时，自动聚合临近站点为一个聚合点，显示聚合数量。点击聚合点自动放大展开。']),
          createDescRow(['SM-008', '快捷跳转', 'P0', '信息卡片提供快捷入口：\"进入详情\"跳转配电室详情页、\"视频监控\"跳转视频页面并定位到该站点摄像头。']),
        ]
      }),

      new Paragraph({ text: '', spacing: { after: 150 } }),
      new Paragraph({
        children: [new TextRun({ text: '【业务规则】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({ children: [new TextRun({ text: '1. 状态判断优先级：离线（最高）> 故障 > 告警 > 正常（最低）', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '2. 离线判断：连续5分钟无数据上报判定为离线', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '3. 故障判断：存在未解决的"严重"等级告警', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '4. 告警判断：存在未解决的"一般"或"提示"等级告警', size: 22 })] }),

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
        children: [new TextRun({ text: '以表格形式展示所有配电室的运行状态，便于批量查看、筛选和排序。适用于需要精确数据对比的场景。', size: 22 })],
        spacing: { after: 150 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createDescRow(['SL-001', '列表展示', 'P0', '表格列：序号、站点名称、站点编号、地址、运行状态（带颜色标签）、当前告警数、设备总数、实时负荷(kW)、负荷率(%)、操作按钮。']),
          createDescRow(['SL-002', '状态标识', 'P0', '状态列使用Element Plus标签组件显示：正常(type=success)、告警(type=warning)、故障(type=danger)、离线(type=info)。']),
          createDescRow(['SL-003', '关键字搜索', 'P0', '支持按名称、编号模糊搜索，输入时实时过滤，无需点击搜索按钮。搜索框支持清空按钮。']),
          createDescRow(['SL-004', '状态筛选', 'P0', '下拉选择框筛选不同状态的配电室：全部/正常/告警/故障/离线，默认显示全部。']),
          createDescRow(['SL-005', '列排序', 'P1', '支持按告警数、负荷率、设备数等数值列点击表头升序/降序排序。当前排序列高亮显示排序方向图标。']),
          createDescRow(['SL-006', '分页功能', 'P0', '支持分页显示，可选每页10/20/50/100条。显示总记录数和当前页码。支持跳转到指定页。']),
          createDescRow(['SL-007', '批量导出', 'P2', '导出当前筛选结果为Excel文件（.xlsx格式），包含表格中所有列数据，文件名：站点列表_导出时间.xlsx。']),
          createDescRow(['SL-008', '操作入口', 'P0', '每行提供操作按钮组：\"查看详情\"跳转配电室详情页、\"视频监控\"跳转视频页面。按钮使用图标+文字形式。']),
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
        children: [new TextRun({ text: '多画面视频监控系统，支持远程视频巡检，减少现场巡检频次。可同时查看多路视频，支持云台控制和录像回放。', size: 22 })],
        spacing: { after: 150 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '【页面布局】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({ children: [new TextRun({ text: '• 左侧面板（宽度240px）：摄像头树形导航，一级节点为配电室，二级节点为摄像头，显示在线/离线状态', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 中央区域：视频墙播放区，支持1/4/9/16分屏布局切换', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 底部工具栏：布局切换按钮、云台控制面板、截图/录制按钮、全屏按钮', size: 22 })] }),
      new Paragraph({ text: '', spacing: { after: 150 } }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createDescRow(['VM-001', '摄像头树', 'P0', '树形结构展示所有摄像头，支持展开/收起。显示在线状态图标（绿点在线、灰点离线）。支持搜索过滤。']),
          createDescRow(['VM-002', '多布局切换', 'P0', '支持1分屏（单画面）、4分屏（2×2）、9分屏（3×3）、16分屏（4×4）布局切换。切换时保留已播放的视频。']),
          createDescRow(['VM-003', '拖拽播放', 'P0', '将摄像头从树形列表拖拽到视频窗口即可开始播放。已有视频的窗口拖入新摄像头会替换原视频。']),
          createDescRow(['VM-004', '实时预览', 'P0', '播放摄像头实时视频流，支持RTSP/HLS/WebRTC协议。视频延迟<2秒。显示加载中状态和播放失败提示。']),
          createDescRow(['VM-005', '云台控制', 'P1', 'PTZ控制面板：方向键（上/下/左/右/左上/右上/左下/右下）、变焦（放大/缩小）、光圈调节。需摄像头支持PTZ。']),
          createDescRow(['VM-006', '截图功能', 'P1', '对当前选中画面截图，保存为PNG格式到本地。文件名：摄像头名称_截图时间.png。显示截图成功提示。']),
          createDescRow(['VM-007', '录制功能', 'P2', '手动启停录制当前画面，录制时显示红点和时长。保存为MP4格式。单次录制上限30分钟。']),
          createDescRow(['VM-008', '全屏播放', 'P1', '双击视频窗口进入单画面全屏播放模式。ESC键或再次双击退出全屏。全屏模式下保留云台控制功能。']),
          createDescRow(['VM-009', '轮询巡视', 'P2', '设置巡视方案：选择摄像头列表和切换间隔（10-120秒），系统自动按顺序轮换播放。支持暂停/继续。']),
          createDescRow(['VM-010', '历史回放', 'P2', '选择摄像头和时间段，回放历史录像。支持播放/暂停、快进（2x/4x/8x）、进度条拖拽。需后端存储支持。']),
        ]
      }),

      new Paragraph({ text: '', spacing: { after: 150 } }),
      new Paragraph({
        children: [new TextRun({ text: '【异常处理】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({ children: [new TextRun({ text: '1. 视频加载失败：显示"视频加载失败"提示和重试按钮，5秒后自动重试一次。', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '2. 摄像头离线：显示"摄像头离线"提示图片，不可播放。', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '3. 网络中断：显示"网络连接中断"提示，恢复后自动重连。', size: 22 })] }),

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
        children: [new TextRun({ text: '实时告警监控和处理中心，是值班人员日常工作的核心页面。提供告警的查看、确认、处理、转工单等完整处置流程。', size: 22 })],
        spacing: { after: 150 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '【页面布局】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({ children: [new TextRun({ text: '• 顶部区域：4个统计卡片横向排列（严重告警数-红色、一般告警数-橙色、AI识别数-蓝色、今日总数-灰色）', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 筛选工具栏：告警类型下拉框 + 告警等级下拉框 + 处理状态下拉框 + 时间范围选择器 + 关键字搜索框 + 查询按钮 + 重置按钮', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 主体区域：告警列表表格，支持展开行查看详情', size: 22 })] }),
      new Paragraph({ text: '', spacing: { after: 150 } }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createDescRow(['AL-001', '告警统计卡片', 'P0', '四个卡片分别统计：严重告警（待处理+处理中）、一般告警、AI智能识别告警、今日产生总数。点击卡片应用对应筛选。']),
          createDescRow(['AL-002', '实时告警推送', 'P0', '新告警产生时通过WebSocket实时推送到页面。新告警从列表顶部插入，行背景闪烁3次提醒。浏览器通知弹窗+声音提醒（可配置）。']),
          createDescRow(['AL-003', '类型筛选', 'P0', '下拉多选：电力告警（过压/欠压/过流/过载等）、环境告警（温度/湿度/SF6等）、AI识别（视觉识别异常）、安防告警（门禁/入侵等）。']),
          createDescRow(['AL-004', '等级筛选', 'P0', '下拉单选：全部/严重（红色）/一般（橙色）/提示（蓝色）。严重：需立即处理；一般：需关注；提示：仅记录。']),
          createDescRow(['AL-005', '状态筛选', 'P0', '下拉单选：全部/待处理/处理中/已解决。默认显示"待处理"，方便值班人员快速查看需要处理的告警。']),
          createDescRow(['AL-006', '告警列表', 'P0', '表格列：告警时间、告警类型（带图标）、告警等级（带颜色标签）、配电室名称、设备名称、告警内容、持续时间、处理状态、操作按钮。']),
          createDescRow(['AL-007', '告警详情', 'P0', '点击行展开或弹窗显示详细信息：告警参数值、阈值设置、历史趋势图、相关设备信息、处置建议、历史同类告警记录。']),
          createDescRow(['AL-008', '确认告警', 'P0', '将"待处理"告警标记为"处理中"，记录确认人和确认时间。需填写简要处理说明（选填）。']),
          createDescRow(['AL-009', '解决告警', 'P0', '将告警标记为"已解决"，必须填写处理结果说明（100字以内）。记录处理人和处理完成时间。']),
          createDescRow(['AL-010', '转工单', 'P1', '将告警转为工单：自动填充告警信息到工单描述，选择工单类型和执行人后创建。告警状态变为"已转工单"。']),
          createDescRow(['AL-011', '告警导出', 'P1', '导出当前筛选条件下的告警记录为Excel文件。包含所有列数据和处理记录。支持选择时间范围。']),
        ]
      }),
      new Paragraph({ text: '', spacing: { after: 150 } }),
      new Paragraph({
        children: [new TextRun({ text: '【告警处理流程】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '告警产生 → 待处理状态 → 值班人员确认（填写处理说明）→ 处理中状态 → 现场处理或远程恢复 → 标记已解决（必填处理结果）→ 已解决状态', size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '特殊流程：告警自动恢复（如温度恢复正常、电压恢复正常）时，系统自动将告警标记为"已解决"，处理结果记录为"系统自动恢复"。', size: 22, italics: true })],
      }),

      new Paragraph({ text: '', spacing: { after: 150 } }),
      new Paragraph({
        children: [new TextRun({ text: '【告警等级定义】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['等级', '颜色', '定义', '响应要求', '通知方式'], true),
          createRow(['严重', '红色', '设备故障、安全隐患、可能导致停电或人身伤害', '立即处理，5分钟内响应', '系统弹窗+声音+短信+电话']),
          createRow(['一般', '橙色', '参数越限、设备异常、需要关注但不紧急', '30分钟内确认，当班处理', '系统弹窗+声音']),
          createRow(['提示', '蓝色', '信息提示、轻微偏差、供参考', '可在日报中统一查看', '仅系统记录']),
        ]
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
        children: [new TextRun({ text: '工单全生命周期管理，覆盖工单创建、分配、执行、完成全流程。支持多种工单类型，实现运维任务的规范化管理。', size: 22 })],
        spacing: { after: 150 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createDescRow(['WO-001', '工单统计', 'P0', '顶部统计卡片：总数、待处理（黄色）、进行中（蓝色）、已完成（绿色）、已超时（红色）。点击跳转对应筛选。']),
          createDescRow(['WO-002', '创建工单', 'P0', '弹窗表单：工单标题（必填）、工单类型（必选）、优先级（必选）、关联配电室（必选）、关联设备（选填）、详细描述（必填）、计划完成时间（必填）、附件上传（选填）。']),
          createDescRow(['WO-003', '工单类型', 'P0', '四种类型：维修工单（设备故障维修）、保养工单（定期维护保养）、巡检工单（巡检任务）、紧急工单（紧急抢修）。不同类型显示不同图标。']),
          createDescRow(['WO-004', '优先级设置', 'P0', '四个等级：紧急（红色，4小时内）、高（橙色，8小时内）、中（蓝色，24小时内）、低（灰色，72小时内）。括号内为建议完成时限。']),
          createDescRow(['WO-005', '工单列表', 'P0', '表格列：工单编号、标题、类型、优先级、配电室、状态、创建人、执行人、创建时间、计划完成时间、操作。支持排序和筛选。']),
          createDescRow(['WO-006', '工单分配', 'P0', '将工单指派给责任人。选择执行人下拉框（显示人员姓名和当前工单数）。分配后系统自动发送通知给执行人。']),
          createDescRow(['WO-007', '状态流转', 'P0', '状态流转：待处理→已分配（指派执行人）→进行中（执行人开始处理）→已完成（执行人标记完成）。支持取消工单（需填写原因）。']),
          createDescRow(['WO-008', '工单详情', 'P0', '详情页/弹窗显示：基本信息、关联告警、处理记录时间线、附件列表、操作按钮。处理记录包含操作人、操作时间、操作说明。']),
          createDescRow(['WO-009', '超时预警', 'P1', '临近超时（距计划完成时间<2小时）：行背景黄色。已超时：行背景红色。列表默认排序：超时优先、紧急优先。']),
          createDescRow(['WO-010', '处理记录', 'P1', '工单处理过程中的操作日志：创建、分配、开始处理、添加备注、上传附件、完成、取消等操作均记录时间线。']),
        ]
      }),
      new Paragraph({ text: '', spacing: { after: 150 } }),
      new Paragraph({
        children: [new TextRun({ text: '【工单状态流转图】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '创建 → 待处理 → 已分配（指派责任人）→ 进行中（开始执行）→ 已完成', size: 22 })],
        spacing: { after: 50 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '　　　　↓　　　　　　↓　　　　　　　↓', size: 22 })],
        spacing: { after: 50 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '　　　已取消　　　已取消　　　　　已取消', size: 22 })],
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // --- 4.5 分析报表模块 - 值班记录表 ---
      new Paragraph({
        text: '4.5 分析报表模块',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),

      new Paragraph({
        text: '4.5.5 配电室值班记录表',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 250, after: 150 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '【功能概述】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '依据DB11/T 527-2021标准，提供标准格式的配电室值班记录表，支持每2小时自动采集数据，替代传统手工记录方式。本功能是实现"无人值班"的核心支撑。', size: 22 })],
        spacing: { after: 150 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '【数据采集规格】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({ children: [new TextRun({ text: '• 采集周期：每2小时采集一次，采集时间点为0:00、2:00、4:00...22:00，共12次/天', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 采集方式：系统自动从数据采集服务获取，无需人工干预', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 数据来源：智能电表、温度传感器、湿度传感器、变压器温控器', size: 22 })] }),
      new Paragraph({ text: '', spacing: { after: 150 } }),

      new Paragraph({
        children: [new TextRun({ text: '【记录表数据字段】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['字段分组', '字段名称', '数据类型', '单位', '采集来源'], true),
          createRow(['时间', '记录时间', 'DateTime', '-', '系统时钟']),
          createRow(['1#变压器高压侧', 'A/B/C相电压', 'Float', 'kV', '高压侧电压互感器']),
          createRow(['1#变压器高压侧', 'A/B/C相电流', 'Float', 'A', '高压侧电流互感器']),
          createRow(['1#变压器高压侧', '有功功率', 'Float', 'kW', '高压侧多功能电表']),
          createRow(['1#变压器高压侧', '无功功率', 'Float', 'kVar', '高压侧多功能电表']),
          createRow(['1#变压器低压侧', 'A/B/C相电压', 'Float', 'V', '低压侧电压互感器']),
          createRow(['1#变压器低压侧', 'A/B/C相电流', 'Float', 'A', '低压侧电流互感器']),
          createRow(['1#变压器低压侧', '有功功率', 'Float', 'kW', '低压侧多功能电表']),
          createRow(['1#变压器低压侧', '无功功率', 'Float', 'kVar', '低压侧多功能电表']),
          createRow(['1#变压器', '变压器温度', 'Float', '℃', '变压器温控器']),
          createRow(['2#变压器', '（同1#变压器）', '-', '-', '-']),
          createRow(['环境', '环境温度', 'Float', '℃', '温度传感器']),
          createRow(['环境', '环境湿度', 'Float', '%', '湿度传感器']),
          createRow(['状态', '安全用具状态', 'Enum', '-', '人工检查/AI识别']),
          createRow(['状态', '消防器材状态', 'Enum', '-', '人工检查/AI识别']),
          createRow(['记录', '值班人员', 'String', '-', '班次排班表']),
          createRow(['记录', '备注说明', 'String', '-', '人工输入']),
        ]
      }),
      new Paragraph({ text: '', spacing: { after: 150 } }),

      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['需求编号', '功能点', '优先级', '详细描述'], true),
          createDescRow(['DR-001', '双变压器支持', 'P0', '支持1#、2#两台变压器的数据记录。如配电室只有单台变压器，2#变压器列显示"-"或隐藏。']),
          createDescRow(['DR-002', '三相电压电流', 'P0', '记录高低压侧A/B/C三相电压和电流。高压侧单位kV和A，低压侧单位V和A。保留小数：电压2位，电流1位。']),
          createDescRow(['DR-003', '有功无功功率', 'P0', '记录高低压侧有功功率(kW)和无功功率(kVar)。保留整数位。用于计算功率因数和负荷率。']),
          createDescRow(['DR-004', '变压器温度', 'P0', '记录变压器绕组温度，单位℃，保留整数。超过75℃黄色警示，超过85℃红色警示。']),
          createDescRow(['DR-005', '环境温湿度', 'P0', '记录配电室环境温度(℃)和湿度(%)。温度范围0-50℃，湿度范围20%-80%为正常。']),
          createDescRow(['DR-006', '安全用具状态', 'P0', '检查安全用具（绝缘手套、绝缘靴、验电器等）是否齐全完好。状态：正常(✓)/缺失(!)/损坏(✕)。']),
          createDescRow(['DR-007', '消防器材状态', 'P0', '检查消防器材（灭火器、消防沙等）是否齐全有效。状态：正常(✓)/需检查(!)/失效(✕)。']),
          createDescRow(['DR-008', '备注手动输入', 'P0', '支持值班人员在每个时段记录备注说明。输入框内联编辑，最大100字符。自动保存。']),
          createDescRow(['DR-009', '值班人员信息', 'P1', '显示当前班次值班人员姓名。白班08:00-20:00，夜班20:00-次日08:00。支持签名确认。']),
          createDescRow(['DR-010', '统计摘要', 'P1', '自动统计当日数据：最大/最小/平均负荷、负载率、功率因数范围、环境温湿度范围、异常次数、采集完成率。']),
          createDescRow(['DR-011', '视图切换', 'P1', '支持两种视图：报表视图（标准表格形式，适合打印）和列表视图（卡片形式，适合移动端查看）。']),
          createDescRow(['DR-012', '报表导出', 'P0', '导出Excel格式（保持表格结构）和PDF格式（标准报表样式）。支持打印预览和直接打印。']),
          createDescRow(['DR-013', '班次筛选', 'P1', '支持按班次筛选数据：全天（12条记录）、白班（08:00-18:00，6条）、夜班（20:00-06:00，6条）。']),
        ]
      }),

      new Paragraph({ text: '', spacing: { after: 150 } }),
      new Paragraph({
        children: [new TextRun({ text: '【数据异常处理】', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({ children: [new TextRun({ text: '1. 采集失败：显示"-"并标记单元格为灰色，记录失败原因到系统日志。', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '2. 数据越限：超出正常范围的数据显示对应警示颜色（黄色注意/红色异常）。', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '3. 通信中断：连续3个时段采集失败，触发"数据采集异常"告警通知值班人员。', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '4. 数据补录：支持人工补录缺失数据，需记录补录人和补录时间，数据标记为"人工录入"。', size: 22 })] }),

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
          createRow(['性能指标', '要求', '测试方法', '备注'], true),
          createRow(['首屏加载时间', '< 3秒', 'Chrome DevTools Performance', '网络良好(>10Mbps)条件下']),
          createRow(['接口响应时间', '普通接口 < 500ms', 'JMeter压测', '复杂查询接口 < 2秒']),
          createRow(['并发用户数', '≥ 500', 'JMeter并发测试', '同时在线用户数']),
          createRow(['实时数据刷新', '≤ 5秒', '端到端测试', '设备数据到页面展示延迟']),
          createRow(['告警推送延迟', '≤ 3秒', '端到端测试', '告警产生到页面展示延迟']),
          createRow(['统计数据刷新', '30秒', '配置参数', '可配置10-60秒']),
          createRow(['视频延迟', '< 2秒', '实测', '实时视频流延迟']),
          createRow(['页面切换时间', '< 1秒', 'Performance监测', '路由切换响应时间']),
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
          createRow(['系统可用性', '99.9%', '年度不可用时间 < 8.76小时，不含计划内维护']),
          createRow(['数据备份', '每日自动备份', '保留30天，支持异地备份']),
          createRow(['故障恢复目标(RTO)', '< 4小时', '从故障发生到系统恢复的时间']),
          createRow(['数据恢复目标(RPO)', '< 1小时', '故障时可容忍的最大数据丢失量']),
          createRow(['计划内维护窗口', '每月1次，凌晨2:00-4:00', '提前3天通知用户']),
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
          createRow(['安全需求', '描述', '实现方式'], true),
          createRow(['身份认证', '用户名密码登录', '支持LDAP/AD集成，密码加密存储(bcrypt)']),
          createRow(['权限控制', '基于角色的访问控制(RBAC)', '预置6个角色，支持自定义角色']),
          createRow(['数据传输', 'HTTPS加密传输', 'TLS 1.2+，强制HTTPS']),
          createRow(['操作审计', '关键操作记录日志', '登录、告警处理、工单操作、配置变更等']),
          createRow(['会话管理', '登录超时自动退出', '默认30分钟，可配置15-120分钟']),
          createRow(['密码策略', '强密码要求', '最小8位，包含大小写字母+数字+特殊字符']),
          createRow(['登录保护', '防暴力破解', '连续5次失败锁定账户15分钟']),
          createRow(['SQL注入防护', '参数化查询', '所有数据库操作使用ORM']),
          createRow(['XSS防护', '输出编码', 'Vue默认转义+CSP策略']),
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
          createRow(['兼容类型', '支持范围', '说明'], true),
          createRow(['浏览器', 'Chrome 80+、Edge 80+、Firefox 75+、Safari 13+', '推荐使用Chrome最新版']),
          createRow(['分辨率', '最低1366×768，推荐1920×1080', '支持4K(3840×2160)大屏']),
          createRow(['网络带宽', '≥ 10Mbps', '含视频监控场景，纯数据场景≥2Mbps']),
          createRow(['操作系统', 'Windows 10+、macOS 10.15+', '前端跨平台']),
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
      new Paragraph({ children: [new TextRun({ text: '• 视觉特点：深色背景、青绿色高亮、科技感边框、流光动效、切角造型', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 设计理念：信息密度高但层次分明，重要数据突出显示，次要信息弱化处理', size: 22 })] }),

      new Paragraph({
        text: '6.2 配色规范',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['用途', '色值', 'CSS变量', '说明'], true),
          createRow(['主色', '#00F0FF', '--tech-primary', '科技青绿色，用于重点强调、高亮边框']),
          createRow(['背景深色', '#0D121A', '--bg-deep', '深蓝黑，页面主背景色']),
          createRow(['背景浅色', '#1A2332', '--bg-card', '卡片、面板背景色']),
          createRow(['文字主色', '#E0E6ED', '--text-bright', '主要文字颜色']),
          createRow(['文字次色', '#8B9AAD', '--text-sub', '次要文字、说明文字']),
          createRow(['文字弱色', '#5A6A7D', '--text-muted', '占位符、禁用文字']),
          createRow(['成功色', '#00E676', '--status-success', '正常、成功、在线状态']),
          createRow(['警告色', '#FFD600', '--status-warning', '警告、注意、需关注状态']),
          createRow(['危险色', '#FF2E63', '--status-danger', '错误、故障、严重告警']),
          createRow(['信息色', '#60A5FA', '--status-info', '提示、离线、信息状态']),
        ]
      }),

      new Paragraph({
        text: '6.3 布局规范',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({ children: [new TextRun({ text: '• 顶部导航栏高度：60px', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 侧边菜单宽度：展开240px / 收起64px', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 内容区边距：24px（大屏）/ 16px（普通屏）', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 卡片间距：16px', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 卡片圆角：4px（科技风格偏小圆角）', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 栅格系统：24栏', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 最小内容宽度：1200px', size: 22 })] }),

      new Paragraph({
        text: '6.4 组件规范',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: '按钮样式：', bold: true, size: 22 })],
        spacing: { after: 100 }
      }),
      new Paragraph({ children: [new TextRun({ text: '• 主要按钮：青绿色边框+透明背景，悬停时发光效果，切角造型', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 次要按钮：灰色边框+透明背景，悬停变青绿色', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 危险按钮：红色边框+透明背景，用于删除等危险操作', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 按钮高度：32px（小）/ 36px（默认）/ 40px（大）', size: 22 })] }),

      new Paragraph({
        children: [new TextRun({ text: '表格样式：', bold: true, size: 22 })],
        spacing: { before: 150, after: 100 }
      }),
      new Paragraph({ children: [new TextRun({ text: '• 表头背景：rgba(0, 240, 255, 0.08)', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 表格边框：1px solid rgba(0, 240, 255, 0.15)', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 行高：48px', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 悬停行：背景变浅', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 选中行：左侧青绿色边框', size: 22 })] }),

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
      new Paragraph({ children: [new TextRun({ text: '• P0需求（核心功能）：100%实现并通过测试', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• P1需求（重要功能）：90%以上实现并通过测试', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• P2需求（增强功能）：可延期到后续版本', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 核心业务流程：完整可用，无阻塞性问题', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 各角色操作：覆盖所有用户故事的主流程', size: 22 })] }),

      new Paragraph({
        text: '7.2 质量验收标准',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['缺陷等级', '定义', '验收要求'], true),
          createRow(['阻塞型(S1)', '系统崩溃、核心功能不可用', '0个']),
          createRow(['严重(S2)', '主要功能异常、数据错误', '修复率100%']),
          createRow(['一般(S3)', '次要功能异常、界面问题', '修复率≥95%']),
          createRow(['轻微(S4)', '建议优化、体验提升', '可延期处理']),
        ]
      }),

      new Paragraph({
        text: '7.3 性能验收标准',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({ children: [new TextRun({ text: '• 通过5.1节定义的所有性能指标测试', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 500并发用户压力测试通过，无系统崩溃', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 连续72小时稳定性测试通过，无内存泄漏', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 无严重性能问题（响应时间超标、页面卡顿等）', size: 22 })] }),

      new Paragraph({
        text: '7.4 安全验收标准',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({ children: [new TextRun({ text: '• 通过OWASP Top 10安全漏洞扫描', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 权限控制有效，无越权访问漏洞', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 敏感数据加密存储和传输', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• 操作审计日志完整可追溯', size: 22 })] }),

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
      new Paragraph({ children: [new TextRun({ text: '• GB/T 50065-2011 交流电气装置的接地设计规范', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• DL/T 596-2021 电力设备预防性试验规程', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• Element Plus官方设计规范', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• Vue 3官方文档', size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: '• ECharts官方示例库', size: 22 })] }),

      new Paragraph({
        text: '附录B 页面清单',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['序号', '页面名称', '路由路径', '所属模块', '优先级'], true),
          createRow(['1', '登录页', '/login', '公共', 'P0']),
          createRow(['2', '智慧运维中心', '/dashboard/integrated-ops', '驾驶舱', 'P0']),
          createRow(['3', '无人配电指挥中心', '/dashboard/command-center', '驾驶舱', 'P0']),
          createRow(['4', 'AI安全态势', '/dashboard/ai-security', '驾驶舱', 'P1']),
          createRow(['5', '站点监控地图', '/monitoring/site-map', '智能监控', 'P0']),
          createRow(['6', '站点列表监控', '/monitoring/site-list', '智能监控', 'P0']),
          createRow(['7', '视频巡视中心', '/monitoring/video', '智能监控', 'P1']),
          createRow(['8', '环境与安防总览', '/monitoring/environment', '智能监控', 'P1']),
          createRow(['9', '配电室详情', '/room/detail/:id', '智能监控', 'P0']),
          createRow(['10', '告警与事件中心', '/om/alarms', '运维作业', 'P0']),
          createRow(['11', '工单管理', '/om/work-orders', '运维作业', 'P0']),
          createRow(['12', '巡检管理', '/om/inspection', '运维作业', 'P0']),
          createRow(['13', '两票管理', '/om/tickets', '运维作业', 'P1']),
          createRow(['14', '知识库', '/om/knowledge', '运维作业', 'P1']),
          createRow(['15', '配电室台账', '/assets/rooms', '资产台账', 'P0']),
          createRow(['16', '设备台账', '/assets/devices', '资产台账', 'P0']),
          createRow(['17', '备品备件管理', '/assets/spares', '资产台账', 'P1']),
          createRow(['18', '运维报表', '/analytics/operation', '分析报表', 'P0']),
          createRow(['19', '电能质量报表', '/analytics/power-quality', '分析报表', 'P1']),
          createRow(['20', '设备健康报告', '/analytics/health', '分析报表', 'P1']),
          createRow(['21', '负荷趋势分析', '/analytics/load', '分析报表', 'P0']),
          createRow(['22', '配电室值班记录表', '/analytics/duty-record', '分析报表', 'P0']),
          createRow(['23', '电能报表', '/analytics/energy-report', '分析报表', 'P1']),
          createRow(['24', '用户与权限管理', '/system/users', '系统管理', 'P0']),
          createRow(['25', '告警与AI策略', '/system/strategies', '系统管理', 'P0']),
          createRow(['26', '数据字典', '/system/dictionary', '系统管理', 'P1']),
          createRow(['27', '全屏监控大屏', '/bigscreen', '公共', 'P1']),
        ]
      }),

      new Paragraph({
        text: '附录C 接口清单（部分）',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createRow(['接口名称', '请求方式', '路径', '说明'], true),
          createRow(['获取配电室列表', 'GET', '/api/rooms', '支持分页、筛选、排序']),
          createRow(['获取配电室详情', 'GET', '/api/rooms/:id', '包含实时数据']),
          createRow(['获取告警列表', 'GET', '/api/alarms', '支持分页、筛选']),
          createRow(['确认告警', 'PUT', '/api/alarms/:id/confirm', '更新状态为处理中']),
          createRow(['创建工单', 'POST', '/api/work-orders', '返回工单ID']),
          createRow(['获取值班记录', 'GET', '/api/duty-records', '按日期和配电室筛选']),
          createRow(['导出值班记录', 'GET', '/api/duty-records/export', '返回Excel文件']),
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
fs.writeFileSync('/Users/maruilian/无人配电室运维系统/power-room-platform/docs/无人配电室智慧运维系统_产品需求文档PRD_详细版.docx', buffer);
console.log('详细版PRD文档已生成：无人配电室智慧运维系统_产品需求文档PRD_详细版.docx');
