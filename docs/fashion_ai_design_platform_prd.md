# 服装行业 AI 趋势分析与共创设计平台 PRD

## 1. 项目目标

### 1.1 产品定位

本产品定位为“AI 趋势分析决策看板 + 可交互服装设计工作台”，面向服装设计师、电商卖家、品牌企划、ODM/OEM 工厂，帮助用户从模糊需求快速进入可执行的服装设计方案。

产品不是聊天机器人，也不是静态趋势报告页，而是一个围绕“趋势池 -> 用户筛选 -> 实时生成我的设计方案”的 AI 服装设计决策平台。

### 1.2 核心目标

用户输入基础需求后，系统通过 AI 分析市场趋势，生成结构化趋势池。用户在前端通过可视化方式筛选风格、版型、结构、颜色、面料、卖点，系统实时组合生成最终设计方案，并为后续 AI 生图、款式开发、图案生成、Tech Pack 输出提供标准化输入。

### 1.3 用户打开页面后应立即理解

- 现在流行什么
- 我应该选择什么设计方向
- 我的款式方案是什么
- 下一步可以直接进入设计动作

### 1.4 产品核心价值

- 将 AI 趋势分析从“文本报告”升级为“可交互决策看板”
- 将趋势信息拆解为可组合设计要素
- 帮助用户从趋势判断进入款式方案生成
- 为后续 AI 生图、款式图、图案、Tech Pack 提供结构化 Prompt 和设计数据

## 2. 用户角色

### 2.1 服装设计师

需求特点：

- 需要快速了解某品类当前设计方向
- 关注版型、结构、色彩、面料、细节、风格统一性
- 希望 AI 输出能直接用于款式开发和生图

核心使用场景：

- 新款企划前的趋势判断
- 系列款开发前的方向筛选
- 从趋势关键词组合出具体款式方案

### 2.2 电商卖家

需求特点：

- 关注爆款方向、卖点、目标人群、视觉差异化
- 需要快速形成可上架、可投放、可测款的商品方向
- 更关注市场接受度和爆款指数

核心使用场景：

- 选品前判断品类机会
- 生成多套差异化商品方向
- 对比不同方案的卖点和推荐指数

### 2.3 品牌企划

需求特点：

- 关注风格方向、系列主题、人群定位、季节场景
- 需要将趋势分析转化为企划语言
- 需要导出方案用于内部评审

核心使用场景：

- 季度企划方向制定
- 品类矩阵规划
- 内部提案和设计评审

### 2.4 ODM / OEM 工厂

需求特点：

- 关注可生产性、结构复杂度、面料建议、卖点包装
- 需要快速给客户提供方案
- 希望通过 AI 提升打样前的方案沟通效率

核心使用场景：

- 给客户生成趋势款推荐
- 将客户模糊需求转成款式开发方向
- 输出可生产沟通的设计摘要

## 3. 核心业务流程

### 3.1 总流程

```text
用户输入需求
  -> 后端调用 AI 趋势分析
  -> 返回结构化趋势池
  -> 前端可视化展示趋势池
  -> 用户交互选择设计要素
  -> 实时生成我的设计方案
  -> 收藏 / 对比 / 导出 / 生成图片 / 生成图案
```

### 3.2 Step 1：用户输入需求

用户进入页面后填写固定 4 项基础需求：

```json
{
  "category": "女款防晒衣",
  "target_user": "18-30女性",
  "scene": "通勤 / 户外",
  "style": "轻户外"
}
```

字段说明：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| category | string | 是 | 品类，例如女款防晒衣、连衣裙、卫衣 |
| target_user | string | 是 | 目标人群，例如 18-30 女性 |
| scene | string | 是 | 使用场景，例如通勤、户外、约会 |
| style | string | 是 | 风格方向，例如轻户外、法式、通勤简约 |

### 3.3 Step 2：后端调用 AI 趋势分析

后端基于用户输入组装固定 Prompt，调用 AI 大模型，要求返回结构化 JSON。

AI 应返回：

- 趋势总结
- 风格方向
- 热门版型
- 核心结构
- 热门颜色
- 面料趋势
- 核心卖点
- 推荐设计方向
- AI Prompt

### 3.4 Step 3：前端可视化展示

前端不以长文本报告为主，而以可选趋势池为核心。

展示重点：

- 哪些风格正在流行
- 哪些版型值得做
- 哪些结构适合当前场景
- 哪些颜色更适合目标人群
- 哪些面料和卖点更容易被市场接受

### 3.5 Step 4：用户可交互选择

用户可选择：

- 风格
- 版型
- 结构
- 颜色
- 面料
- 卖点

每一项选择都会更新“我的设计方案”。

### 3.6 Step 5：实时生成我的设计方案

系统根据用户选择自动生成：

- 最终设计摘要
- 款式描述
- 推荐款式方向
- 爆款指数
- AI Prompt

此步骤是产品从“AI 分析工具”升级为“AI 服装设计决策平台”的关键。

### 3.7 Step 6：后续动作

用户可对当前方案执行：

- 收藏方案
- 对比方案
- 导出方案
- 一键生成款式图
- 一键生成图案
- 后续进入 Tech Pack 生成

## 4. 页面信息架构

### 4.1 页面名称

AI 服装趋势分析与共创设计工作台

### 4.2 页面结构

```text
页面顶部
  - 用户输入概览区
  - 操作入口：重新分析 / 导出 / 收藏

主内容区
  - AI 趋势总结 Hero Banner
  - 趋势池区
    - 风格方向
    - 热门版型
    - 核心结构
    - 热门颜色
    - 面料趋势
    - 核心卖点
  - 推荐方案区
    - 方案 A
    - 方案 B
    - 方案 C

右侧或底部 Sticky 区
  - 我的设计方案
  - 当前设计组合
  - 推荐指数
  - AI Prompt
  - 操作按钮
```

### 4.3 页面布局建议

桌面端：

- 顶部为输入概览和趋势总结
- 左侧或中间为趋势池
- 右侧为 Sticky Summary Panel，实时展示我的设计方案
- 推荐方案区放在趋势池下方

移动端：

- 顶部展示输入概览
- 趋势总结优先展示
- 趋势池按 Tabs 或折叠面板展示
- 我的设计方案固定在底部抽屉中

## 5. 页面模块拆解

### 5.1 用户输入概览区

目标：

让用户明确当前分析是基于什么条件生成的。

展示内容：

- 品类
- 目标人群
- 使用场景
- 风格方向

交互：

- 支持点击“修改条件”
- 修改后重新发起 AI 分析
- 修改前提示用户当前选择方案可能被重置

推荐 UI：

- 紧凑型信息条
- 使用 Badge 展示 4 个输入条件
- 右侧放置“重新分析”按钮

示例：

```text
当前分析：女款防晒衣 / 18-30女性 / 通勤 + 户外 / 轻户外
[修改条件] [重新分析]
```

### 5.2 AI 趋势总结区

目标：

在首屏用 Hero Banner 形式告诉用户“市场正在往哪里走”。

展示内容：

- 趋势总结一句话
- 当前主流风格
- 推荐切入方向
- 机会点
- 风险提示

推荐 UI：

- Hero Banner
- 左侧为趋势总结和推荐方向
- 右侧为关键指标，例如爆款潜力、竞争热度、场景匹配度

不建议：

- 不要做成长篇报告
- 不要把 AI 原文大段展示在首屏

### 5.3 趋势池区

目标：

将 AI 趋势分析拆成可交互、可选择、可组合的设计要素。

趋势池模块包括：

- 风格方向，多选
- 热门版型，多选
- 核心结构，多选
- 热门颜色，色卡选择
- 面料趋势，标签选择
- 核心卖点，标签选择

每个趋势项建议包含：

| 字段 | 说明 |
| --- | --- |
| id | 趋势项唯一 ID |
| name | 趋势名称 |
| description | 简短说明 |
| score | 推荐分 |
| reason | 推荐理由 |
| selected | 是否已选 |

#### 5.3.1 风格方向

展示方式：

- 环形图展示风格占比或推荐权重
- 旁边配合可选风格 Chips

交互：

- 支持多选
- 点击风格后右侧设计方案更新
- 鼠标悬停显示推荐理由

示例：

```text
轻户外 35%
通勤机能 25%
防晒运动 20%
甜酷街头 12%
极简基础 8%
```

#### 5.3.2 热门版型

展示方式：

- 标签云或横向卡片
- 标签大小或颜色深浅表示推荐权重

交互：

- 支持多选
- 最多建议选择 1-3 个
- 选择冲突版型时给出提示，例如“修身短款”和“宽松长款”不建议同时作为主廓形

#### 5.3.3 核心结构

展示方式：

- 结构卡片 Grid
- 每张卡展示结构名称、功能价值、适用场景

交互：

- 支持多选
- 可按功能筛选，例如防晒、透气、收纳、可调节

示例：

```text
可拆卸帽檐
高领防晒结构
腋下透气拼接
袖口拇指孔
轻量收纳袋
```

#### 5.3.4 热门颜色

展示方式：

- 色卡矩阵
- 每个色卡展示颜色名称、色值、推荐理由

交互：

- 支持选择主色和辅助色
- 主色最多 1 个，辅助色最多 2-3 个
- 选择后在“我的设计方案”中生成配色描述

示例：

```json
[
  { "name": "冰川白", "hex": "#F5F7F2" },
  { "name": "雾霾蓝", "hex": "#A9BBCB" },
  { "name": "浅灰绿", "hex": "#B8C3B1" }
]
```

#### 5.3.5 面料趋势

展示方式：

- 标签组
- 可按照面料功能分组

分组建议：

- 防晒类
- 轻量类
- 透气类
- 弹力类
- 肌理类

交互：

- 支持多选
- 鼠标悬停展示面料优势和适用场景

#### 5.3.6 核心卖点

展示方式：

- Icon Grid
- 每个卖点配一个图标、短标题和一句说明

交互：

- 支持多选
- 选择后影响推荐指数和款式描述

示例：

```text
UPF 防晒
轻量便携
通勤友好
户外防风
显瘦剪裁
易收纳
```

### 5.4 我的设计方案区

目标：

实时承接用户选择结果，形成用户自己的最终设计方案。

展示内容：

- 当前选择组合
- 款式描述
- 推荐款式方向
- 爆款指数
- AI Prompt
- 后续动作按钮

推荐 UI：

- 桌面端使用右侧 Sticky Summary Panel
- 移动端使用底部抽屉
- 内容随用户选择实时更新

更新规则：

- 用户选择任意趋势项后立即更新
- 如果用户选择不足，展示“待完善项”
- 如果用户选择冲突，展示优化建议
- 选择完整后生成完整方案摘要和 Prompt

示例输出：

```text
我的设计方案：
面向 18-30 女性的轻户外女款防晒衣，采用宽松短款廓形，结合高领防晒结构、可拆卸帽檐、腋下透气拼接，以冰川白为主色，辅以浅灰绿细节点缀，主打 UPF 防晒、轻量便携和通勤户外双场景。

爆款指数：86/100
推荐方向：轻户外通勤防晒夹克
```

### 5.5 推荐方案区

目标：

AI 自动生成多个可直接参考的方案方向，让用户快速选择起点。

默认生成：

- 方案 A：高爆款潜力方向
- 方案 B：差异化设计方向
- 方案 C：低成本量产方向

每个方案展示：

- 方案名称
- 目标人群
- 风格定位
- 版型建议
- 颜色建议
- 面料建议
- 核心卖点
- 爆款指数
- 适合场景

交互：

- 点击“应用方案”后自动勾选对应趋势池项目
- 点击“加入对比”后进入对比区
- 点击“生成图片”进入款式图生成流程

推荐 UI：

- 卡片轮播
- 桌面端 3 卡并列
- 移动端横向滑动

### 5.6 操作区

操作按钮：

- 收藏方案
- 加入对比
- 导出方案
- 生成款式图
- 生成图案

按钮优先级：

1. 生成款式图
2. 收藏方案
3. 导出方案
4. 加入对比
5. 生成图案

操作说明：

- 收藏方案：保存当前用户选择和生成结果
- 加入对比：将当前方案加入对比列表
- 导出方案：导出 Markdown、PDF 或 JSON
- 生成款式图：将当前 Prompt 传给图像生成模块
- 生成图案：将风格、颜色、卖点传给图案生成模块

## 6. 用户交互逻辑

### 6.1 首次进入页面

状态：

- 展示输入表单
- 趋势池为空
- 我的设计方案为空

用户动作：

- 填写 4 项需求
- 点击“生成趋势分析”

系统反馈：

- 显示分析中状态
- 可展示 Skeleton Loading
- 请求成功后进入工作台视图

### 6.2 AI 分析完成

系统动作：

- 渲染 AI 趋势总结
- 渲染趋势池
- 渲染推荐方案
- 默认选择 AI 推荐的主方案或高分趋势项
- 自动生成初始“我的设计方案”

默认选择策略：

- 风格方向默认选择推荐分最高的 1-2 个
- 热门版型默认选择推荐分最高的 1 个
- 核心结构默认选择推荐分最高的 2-4 个
- 热门颜色默认选择主色 1 个、辅助色 1 个
- 面料趋势默认选择推荐分最高的 1-2 个
- 核心卖点默认选择推荐分最高的 2-3 个

### 6.3 用户选择趋势项

触发条件：

- 点击风格 Chip
- 点击版型标签
- 点击结构卡片
- 点击色卡
- 点击面料标签
- 点击卖点 Icon

系统动作：

- 更新 selected 状态
- 重新计算设计方案摘要
- 重新计算爆款指数
- 重新生成 AI Prompt
- 更新 Sticky Summary Panel

### 6.4 方案冲突提示

冲突示例：

- 同时选择“极简基础”和“重工装饰”
- 同时选择“修身短款”和“宽松长款”
- 选择“低成本量产”但结构选择过多
- 选择“夏季户外”但面料选择厚重

提示方式：

- 在我的设计方案区展示轻提示
- 冲突项用橙色边框提示
- 给出“自动优化”按钮

### 6.5 推荐方案应用

用户点击推荐方案的“应用方案”后：

- 清空当前选择或二次确认
- 自动勾选方案中的趋势池项目
- 更新我的设计方案
- 将该方案标记为当前方案来源

### 6.6 收藏与对比

收藏：

- 保存当前设计组合、方案摘要、Prompt、爆款指数
- 收藏后按钮状态变为已收藏

对比：

- 最多加入 3-5 个方案
- 对比维度包括风格、版型、颜色、面料、卖点、爆款指数、成本复杂度

### 6.7 导出与生成

导出：

- MVP 支持导出 Markdown 或 JSON
- 后续支持 PDF 和 Tech Pack

生成款式图：

- 将当前设计 Prompt 传给图像生成模块
- 保留当前方案 ID，方便追溯

生成图案：

- 将风格、颜色、图案偏好、目标人群传给图案生成模块

## 7. 数据结构设计

### 7.1 前端输入字段

```ts
interface TrendAnalysisInput {
  category: string;
  target_user: string;
  scene: string;
  style: string;
}
```

### 7.2 后端 AI 分析结果字段

```ts
interface TrendAnalysisResult {
  summary: string;
  opportunity: string;
  risk: string;
  style_directions: TrendOption[];
  silhouettes: TrendOption[];
  core_structures: TrendOption[];
  color_palette: ColorOption[];
  fabric_trends: TrendOption[];
  selling_points: TrendOption[];
  recommended_directions: RecommendedDirection[];
  base_prompt: string;
}
```

### 7.3 趋势项字段

```ts
interface TrendOption {
  id: string;
  name: string;
  description: string;
  score: number;
  reason: string;
  tags?: string[];
}
```

### 7.4 色卡字段

```ts
interface ColorOption {
  id: string;
  name: string;
  hex: string;
  role: "primary" | "secondary" | "accent";
  score: number;
  reason: string;
}
```

### 7.5 推荐方案字段

```ts
interface RecommendedDirection {
  id: string;
  name: string;
  positioning: string;
  target_user: string;
  style_ids: string[];
  silhouette_ids: string[];
  structure_ids: string[];
  color_ids: string[];
  fabric_ids: string[];
  selling_point_ids: string[];
  design_summary: string;
  popularity_score: number;
  cost_complexity: "low" | "medium" | "high";
  ai_prompt: string;
}
```

### 7.6 用户当前选择字段

```ts
interface UserDesignSelection {
  analysis_id: string;
  selected_style_ids: string[];
  selected_silhouette_ids: string[];
  selected_structure_ids: string[];
  selected_color_ids: string[];
  selected_fabric_ids: string[];
  selected_selling_point_ids: string[];
}
```

### 7.7 我的设计方案字段

```ts
interface MyDesignPlan {
  id?: string;
  analysis_id: string;
  design_summary: string;
  style_description: string;
  recommended_direction: string;
  popularity_score: number;
  ai_prompt: string;
  selected_items: UserDesignSelection;
  warnings: string[];
  created_at?: string;
  updated_at?: string;
}
```

### 7.8 API 设计建议

#### 创建 AI 趋势分析

```http
POST /api/trend-analyses
```

请求：

```json
{
  "category": "女款防晒衣",
  "target_user": "18-30女性",
  "scene": "通勤 / 户外",
  "style": "轻户外"
}
```

响应：

```json
{
  "analysis_id": "ta_001",
  "input": {
    "category": "女款防晒衣",
    "target_user": "18-30女性",
    "scene": "通勤 / 户外",
    "style": "轻户外"
  },
  "result": {
    "summary": "女款防晒衣正在从单一防晒功能转向轻户外、通勤化、轻量便携的多场景设计。",
    "opportunity": "轻户外通勤人群增长，兼顾防晒和日常搭配的款式更易形成爆款。",
    "risk": "过度户外化会降低通勤穿搭接受度。",
    "style_directions": [],
    "silhouettes": [],
    "core_structures": [],
    "color_palette": [],
    "fabric_trends": [],
    "selling_points": [],
    "recommended_directions": [],
    "base_prompt": "..."
  }
}
```

#### 根据选择生成我的设计方案

```http
POST /api/design-plans/generate
```

请求：

```json
{
  "analysis_id": "ta_001",
  "selected_style_ids": ["style_light_outdoor"],
  "selected_silhouette_ids": ["silhouette_short_loose"],
  "selected_structure_ids": ["structure_sun_hood", "structure_vent"],
  "selected_color_ids": ["color_glacier_white", "color_mist_green"],
  "selected_fabric_ids": ["fabric_light_uv"],
  "selected_selling_point_ids": ["sp_upf", "sp_commute_outdoor"]
}
```

响应：

```json
{
  "design_summary": "面向 18-30 女性的轻户外通勤防晒衣，采用短款微宽松廓形，结合高领防晒帽、腋下透气结构和轻量防晒面料。",
  "style_description": "整体风格轻户外但不过度机能，适合通勤、城市户外和短途出行。",
  "recommended_direction": "轻户外通勤防晒夹克",
  "popularity_score": 86,
  "ai_prompt": "生成一款女款轻户外防晒衣...",
  "warnings": []
}
```

#### 收藏方案

```http
POST /api/design-plans
```

#### 查询方案详情

```http
GET /api/design-plans/{id}
```

#### 查询历史分析

```http
GET /api/trend-analyses
```

## 8. 可视化方案设计

### 8.1 总体原则

可视化的目的不是装饰，而是帮助用户做选择。

设计原则：

- 把复杂趋势拆成可选设计因子
- 用图形表达权重、热度、推荐程度
- 用交互状态表达用户当前选择
- 用 Sticky Summary Panel 承接选择结果
- 每个视觉组件都应回答“我该选什么”

### 8.2 数据与展示方式映射

| 数据类型 | 推荐展示方式 | 目的 |
| --- | --- | --- |
| 趋势总结 | Hero Banner | 快速建立整体判断 |
| 风格趋势 | 环形图 + Chips | 展示风格权重并支持选择 |
| 热门版型 | 标签云 / 横向卡片 | 快速比较版型热度 |
| 核心结构 | 卡片 Grid | 展示结构功能和适用场景 |
| 热门颜色 | 色卡矩阵 | 直观看到配色方向 |
| 面料趋势 | 分组标签 | 按功能理解面料选择 |
| 核心卖点 | Icon Grid | 让卖点更容易被扫描和选择 |
| 用户选择 | Sticky Summary Panel | 实时反馈当前方案 |
| 推荐方案 | 卡片轮播 | 快速应用 AI 推荐组合 |
| 爆款指数 | 仪表盘 / 进度环 | 直观展示推荐程度 |
| 方案对比 | 对比表格 | 支持多方案决策 |

### 8.3 风格趋势可视化

组件：

- ECharts Donut Chart 或 Recharts PieChart
- 旁边放可点击 Chips

展示字段：

- 风格名称
- 推荐权重
- 推荐理由

交互：

- 点击环形图分区可选中风格
- 点击 Chip 同步高亮图表
- Hover 显示理由 Tooltip

### 8.4 热门版型可视化

组件：

- 标签云
- 或权重卡片

展示逻辑：

- 推荐分越高，标签越突出
- 标签颜色表示热度等级

交互：

- 多选
- 超出建议数量时提示
- 冲突项高亮提醒

### 8.5 热门颜色可视化

组件：

- 色卡矩阵

展示字段：

- 颜色名称
- HEX 色值
- 主色 / 辅助色 / 点缀色
- 推荐理由

交互：

- 点击设置为主色
- Shift 或二次操作设置为辅助色
- 显示已选配色条

### 8.6 核心卖点可视化

组件：

- Icon Grid

图标建议：

- 防晒：Sun icon
- 轻量：Feather icon
- 收纳：Package icon
- 透气：Wind icon
- 通勤：Briefcase icon
- 户外：Mountain icon

交互：

- 点击选择卖点
- 选择后在我的设计方案中生成卖点文案

### 8.7 Sticky Summary Panel

组件定位：

- 桌面端固定在右侧
- 移动端固定底部，可展开

展示内容：

- 当前选择数量
- 设计摘要
- 爆款指数
- AI Prompt 折叠区
- 操作按钮

交互：

- 用户选择任意趋势项后平滑更新
- 使用 Framer Motion 做轻量过渡
- Prompt 默认折叠，点击展开

## 9. MVP 优先级

### 9.1 P0 必须实现

- 用户输入 4 项基础需求
- 后端调用 AI 返回结构化趋势池
- 趋势总结展示
- 风格、版型、结构、颜色、面料、卖点选择
- 我的设计方案实时更新
- 推荐方案 A/B/C
- 收藏方案
- 基础导出 Markdown 或 JSON

### 9.2 P1 建议实现

- 方案对比
- 爆款指数解释
- 冲突检测和自动优化
- 一键生成款式图
- 历史记录
- PDF 导出

### 9.3 P2 后续实现

- 图案生成
- Tech Pack 生成
- 团队协作
- 品牌素材库
- 面料库
- 款式库
- 数据看板
- 多模型选择

## 10. 技术架构建议

### 10.1 前端技术栈

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- ECharts 或 Recharts
- Framer Motion
- Zustand 或 Jotai 管理页面选择状态

前端职责：

- 表单输入
- AI 结果展示
- 趋势池交互
- 选择状态管理
- 实时生成方案预览
- 调用后端接口保存、导出、生成图片

### 10.2 后端技术栈

- FastAPI
- PostgreSQL
- Redis
- Celery
- SQLAlchemy
- Pydantic

后端职责：

- 参数校验
- Prompt 组装
- AI 调用
- JSON 解析与校验
- 趋势分析记录保存
- 方案生成与保存
- 异步任务管理
- 导出任务

### 10.3 AI 调用设计

AI 调用使用 OpenAI 兼容接口。

配置项：

```env
AI_API_KEY=your_api_key
AI_BASE_URL=https://api.example.com/v1
AI_MODEL=gpt-4o-mini
```

调用建议：

- 趋势分析使用结构化 JSON 输出
- temperature 建议 0.3-0.6
- 对 JSON 解析失败做一次自动修复重试
- 保存原始 AI 返回内容，方便排查

### 10.4 异步任务设计

MVP 可先同步返回，若 AI 响应较慢，可使用 Celery 异步化。

异步流程：

```text
POST /api/trend-analyses
  -> 创建任务 status=processing
  -> Celery 调用 AI
  -> 更新 status=success/failed
  -> 前端轮询 GET /api/trend-analyses/{id}
```

### 10.5 数据库核心表建议

#### trend_analysis

保存一次 AI 趋势分析。

字段建议：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| category | varchar | 品类 |
| target_user | varchar | 目标人群 |
| scene | varchar | 使用场景 |
| style | varchar | 风格方向 |
| prompt | text | AI 分析 Prompt |
| raw_response | jsonb | AI 原始返回 |
| result_json | jsonb | 校验后的趋势池 |
| status | varchar | processing/success/failed |
| error_message | text | 错误信息 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

#### design_plan

保存用户最终设计方案。

字段建议：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| analysis_id | uuid | 关联 trend_analysis |
| selection_json | jsonb | 用户选择项 |
| design_summary | text | 设计摘要 |
| style_description | text | 款式描述 |
| recommended_direction | varchar | 推荐款式方向 |
| popularity_score | int | 爆款指数 |
| ai_prompt | text | 用于生图或后续生成的 Prompt |
| is_favorite | boolean | 是否收藏 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

### 10.6 前端状态管理建议

页面核心状态：

```ts
type WorkspaceState = {
  input: TrendAnalysisInput;
  analysisResult: TrendAnalysisResult | null;
  selection: UserDesignSelection;
  myDesignPlan: MyDesignPlan | null;
  recommendedDirections: RecommendedDirection[];
  loading: boolean;
  error: string | null;
};
```

状态更新策略：

- AI 分析完成后初始化 `analysisResult`
- 根据推荐分初始化 `selection`
- 用户点击趋势项时更新 `selection`
- 根据 `selection` 派生或请求生成 `myDesignPlan`
- 保存时将 `selection` 和 `myDesignPlan` 提交后端

## 11. 页面原型建议

### 11.1 桌面端文字版结构图

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ 顶部导航：AI 服装趋势分析与共创设计工作台                     历史 / 收藏 │
├────────────────────────────────────────────────────────────────────────────┤
│ 用户输入概览：女款防晒衣 | 18-30女性 | 通勤/户外 | 轻户外   [重新分析] │
├────────────────────────────────────────────────────────────────────────────┤
│ Hero Banner                                                                │
│ 当前趋势总结：轻户外通勤化、防晒功能时装化、轻量便携成为核心机会点        │
│ 爆款潜力 86 | 竞争热度 中高 | 场景匹配度 高                                │
├──────────────────────────────────────────────┬─────────────────────────────┤
│ 趋势池区                                      │ 我的设计方案 Sticky Panel   │
│                                                │                             │
│ [风格趋势环形图] [风格 Chips]                 │ 当前组合                    │
│                                                │ - 轻户外                    │
│ [热门版型标签云]                              │ - 短款微宽松                │
│                                                │ - 冰川白 + 浅灰绿           │
│ [核心结构卡片 Grid]                           │                             │
│                                                │ 款式描述                    │
│ [热门颜色色卡矩阵]                            │ 面向 18-30 女性的...        │
│                                                │                             │
│ [面料趋势标签组]                              │ 爆款指数：86/100            │
│                                                │                             │
│ [核心卖点 Icon Grid]                          │ AI Prompt [展开]            │
│                                                │                             │
│                                                │ [生成款式图] [收藏] [导出]  │
├──────────────────────────────────────────────┴─────────────────────────────┤
│ 推荐方案区                                                                  │
│ [方案 A：高爆款潜力] [方案 B：差异化设计] [方案 C：低成本量产]             │
└────────────────────────────────────────────────────────────────────────────┘
```

### 11.2 移动端文字版结构图

```text
┌──────────────────────────────┐
│ AI 服装趋势工作台             │
├──────────────────────────────┤
│ 输入概览                      │
│ 女款防晒衣 / 18-30女性        │
│ 通勤+户外 / 轻户外            │
├──────────────────────────────┤
│ 趋势总结 Hero                 │
│ 爆款潜力 86                   │
├──────────────────────────────┤
│ Tabs                          │
│ 风格 | 版型 | 结构 | 颜色     │
│ 面料 | 卖点 | 推荐方案        │
├──────────────────────────────┤
│ 当前 Tab 内容                  │
│ Chips / Cards / Color Swatches│
├──────────────────────────────┤
│ 底部固定栏                    │
│ 我的方案：已选 8 项            │
│ 爆款指数 86   [展开]          │
└──────────────────────────────┘
```

## 12. 后续可扩展方向

### 12.1 AI 生图

将我的设计方案中的 AI Prompt 传入图像生成服务，生成：

- 正面款式图
- 背面款式图
- 细节图
- 场景图
- 电商主图

### 12.2 图案生成

基于风格、颜色、目标人群和使用场景生成：

- 印花图案
- 局部图案
- 胸前图案
- 满版图案
- 品牌化图案

### 12.3 Tech Pack

将设计方案转成开发打样资料：

- 款式描述
- 面辅料建议
- 工艺说明
- 尺寸建议
- 结构细节
- 颜色方案
- 生产注意事项

### 12.4 方案对比和评分体系

支持对多个方案进行对比：

- 爆款潜力
- 成本复杂度
- 差异化程度
- 目标人群匹配度
- 场景匹配度
- 生产可行性

### 12.5 企业级能力

后续可扩展：

- 团队协作
- 方案评论
- 设计资产库
- 品牌风格库
- 面料库
- 历史爆款库
- 电商平台数据接入
- 趋势报告自动生成

## 13. 开发落地重点

### 13.1 前端重点

- 页面第一屏必须让用户看懂趋势结论
- 趋势池必须可选、可组合、可反馈
- 我的设计方案必须实时更新
- 不要做成聊天界面
- 不要只做静态报告页
- 可视化组件要服务于选择决策

### 13.2 后端重点

- AI 返回必须结构化
- JSON 解析和字段校验必须稳定
- 保存输入、Prompt、原始返回、校验结果
- 方案生成逻辑要能基于用户选择重新组合
- 为后续生图、导出、Tech Pack 保留标准化字段

### 13.3 MVP 验收标准

MVP 完成后，用户应能完成以下闭环：

1. 输入品类、目标人群、使用场景、风格方向
2. 获取 AI 趋势分析和趋势池
3. 在可视化趋势池中选择设计要素
4. 实时看到自己的设计方案
5. 应用 AI 推荐方案
6. 收藏或导出最终方案
7. 拿到可用于后续 AI 生图的 Prompt

只要这个闭环顺畅，本产品就完成了从“AI 分析工具”到“AI 服装设计决策平台”的 MVP 跃迁。
