# AI 服装趋势分析与共创设计平台 MVP 开发文档

## 1. 项目目标与 MVP 边界

### 1.1 产品定位

本 MVP 定位为“AI 趋势分析决策看板 + 可交互服装设计工作台”。

用户输入服装品类、目标人群、使用场景、风格方向后，系统调用 AI 生成结构化趋势池。前端将趋势池可视化为可选择的设计要素，用户选择风格、版型、结构、颜色、面料、卖点后，系统生成“我的设计方案”，并保存可用于后续 AI 生图、导出和款式开发的标准化数据。

### 1.2 MVP 必须实现

- 用户填写 4 项基础需求。
- 后端调用 AI 返回结构化趋势池 JSON。
- 前端展示趋势总结、趋势池、推荐方案。
- 用户可选择风格、版型、结构、颜色、面料、卖点。
- 用户选择后实时更新“我的设计方案”。
- 用户可应用 AI 推荐方案。
- 用户可收藏设计方案。
- 用户可导出 JSON 或 Markdown。
- 系统保存趋势分析记录和设计方案记录。
- 系统输出可传给后续生图模块的 `ai_prompt`。

### 1.3 MVP 不做

- 登录与权限。
- 支付。
- 团队协作。
- 图案生成。
- Tech Pack 生成。
- 真实调用生图模块。
- PDF 导出。
- 复杂异步任务队列。
- 多模型管理后台。
- 趋势数据源接入。

### 1.4 推荐技术栈

前端：

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts 或 ECharts
- Zustand

后端：

- FastAPI
- PostgreSQL
- SQLAlchemy
- Pydantic
- Alembic

AI：

- OpenAI 兼容 Chat Completions 接口
- 使用结构化 JSON 输出
- MVP 阶段默认同步返回
- 预留异步任务扩展，但 P0 不引入 Redis/Celery

环境变量：

```env
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/styleforge
AI_API_KEY=your_api_key
AI_BASE_URL=https://api.example.com/v1
AI_MODEL=gpt-4o-mini
AI_TIMEOUT_SECONDS=60
```

## 2. 统一业务流程

### 2.1 主流程

```text
用户填写 4 项基础需求
  -> 前端调用 POST /api/trend-analyses
  -> 后端校验参数
  -> 后端创建 trend_analysis 记录，status=processing
  -> 后端组装 Prompt
  -> 后端调用 AI
  -> 后端解析并校验 AI JSON
  -> 后端保存 raw_response 和 result_json，status=success
  -> 前端进入趋势工作台
  -> 前端展示趋势总结、趋势池、推荐方案
  -> 用户选择趋势项
  -> 前端实时派生预览版 MyDesignPlan
  -> 用户点击保存、收藏或导出
  -> 前端调用后端生成/保存正式 design_plan
```

### 2.2 推荐方案应用流程

```text
用户点击推荐方案“应用方案”
  -> 前端读取 recommended_directions 中的各类 *_ids
  -> 覆盖当前 UserDesignSelection
  -> Sticky Panel 更新设计摘要、爆款指数、AI Prompt
  -> 用户可继续手动调整
```

### 2.3 收藏方案流程

```text
用户点击“收藏方案”
  -> 如当前没有已保存 design_plan，先调用 POST /api/design-plans
  -> 如当前已有 design_plan，调用更新收藏状态接口或重新保存为收藏方案
  -> 按钮状态显示为“已收藏”
```

MVP 可简化为：`POST /api/design-plans` 创建时直接带 `is_favorite=true`。

### 2.4 导出流程

```text
用户点击“导出 JSON”
  -> 前端基于当前 MyDesignPlan 直接下载 JSON

用户点击“导出 Markdown”
  -> 前端基于当前 MyDesignPlan 生成 Markdown 文本并下载
```

MVP 阶段导出可由前端完成，不要求后端生成文件。

## 3. 前端页面结构

### 3.1 页面路由

建议路由：

```text
/trend-workbench
```

### 3.2 页面模块

```text
TrendWorkbenchPage
  - AnalysisInputForm
  - InputSummaryBar
  - TrendHero
  - TrendPool
    - StyleDirectionSelector
    - SilhouetteSelector
    - CoreStructureSelector
    - ColorPaletteSelector
    - FabricTrendSelector
    - SellingPointSelector
  - RecommendedDirectionCards
  - MyDesignPlanPanel
  - HistoryDrawer 或 HistoryPage
```

### 3.3 页面初始状态

首次进入：

- 展示 `AnalysisInputForm`。
- 趋势池为空。
- 我的设计方案为空。
- 历史入口可展示最近记录。

提交中：

- 表单按钮 loading。
- 工作台区域展示 Skeleton。
- 禁止重复提交。

分析成功：

- 展示 `InputSummaryBar`。
- 展示 `TrendHero`。
- 渲染趋势池。
- 渲染推荐方案。
- 根据默认选择策略初始化 `UserDesignSelection`。
- 自动生成初始 `MyDesignPlan`。

分析失败：

- 表单保留用户输入。
- 显示后端返回的 `message`。
- 提供“重新生成”按钮。

### 3.4 默认选择策略

AI 分析成功后，前端按以下规则初始化选择：

- `style_directions`：选择 `score` 最高的 1-2 个。
- `silhouettes`：选择 `score` 最高的 1 个。
- `core_structures`：选择 `score` 最高的 2-4 个。
- `color_palette`：选择 `role=primary` 且 `score` 最高的 1 个；选择 `role=secondary` 或 `role=accent` 中 `score` 最高的 1-2 个。
- `fabric_trends`：选择 `score` 最高的 1-2 个。
- `selling_points`：选择 `score` 最高的 2-3 个。

## 4. 核心数据结构

### 4.1 TrendAnalysisInput

```ts
export interface TrendAnalysisInput {
  category: string;
  target_user: string;
  scene: string;
  style: string;
}
```

校验规则：

| 字段 | 类型 | 必填 | 长度 | 说明 |
| --- | --- | --- | --- | --- |
| category | string | 是 | 1-100 | 品类 |
| target_user | string | 是 | 1-255 | 目标人群 |
| scene | string | 是 | 1-255 | 使用场景 |
| style | string | 是 | 1-255 | 风格方向 |

### 4.2 TrendAnalysisResult

```ts
export interface TrendAnalysisResult {
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

### 4.3 TrendOption

```ts
export interface TrendOption {
  id: string;
  name: string;
  description: string;
  score: number;
  reason: string;
  tags?: string[];
}
```

字段规则：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | string | 是 | 当前分析结果内唯一 |
| name | string | 是 | 展示名称 |
| description | string | 是 | 简短说明 |
| score | number | 是 | 0-100 推荐分 |
| reason | string | 是 | 推荐理由 |
| tags | string[] | 否 | 功能或分类标签 |

### 4.4 ColorOption

```ts
export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  role: "primary" | "secondary" | "accent";
  score: number;
  reason: string;
}
```

字段规则：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | string | 是 | 当前分析结果内唯一 |
| name | string | 是 | 颜色名称 |
| hex | string | 是 | HEX 色值，例如 `#F5F7F2` |
| role | string | 是 | `primary` / `secondary` / `accent` |
| score | number | 是 | 0-100 推荐分 |
| reason | string | 是 | 推荐理由 |

### 4.5 RecommendedDirection

```ts
export interface RecommendedDirection {
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

### 4.6 UserDesignSelection

```ts
export interface UserDesignSelection {
  analysis_id: string;
  selected_style_ids: string[];
  selected_silhouette_ids: string[];
  selected_structure_ids: string[];
  selected_color_ids: string[];
  selected_fabric_ids: string[];
  selected_selling_point_ids: string[];
}
```

### 4.7 MyDesignPlan

```ts
export interface MyDesignPlan {
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

## 5. AI 返回 JSON Schema

### 5.1 AI 必须返回的 JSON

AI 只允许返回 JSON，不允许返回 Markdown、解释文字或代码块。

```json
{
  "summary": "女款防晒衣正在从单一防晒功能转向轻户外、通勤化、轻量便携的多场景设计。",
  "opportunity": "轻户外通勤人群增长，兼顾防晒和日常搭配的款式更易形成爆款。",
  "risk": "过度户外化会降低通勤穿搭接受度。",
  "style_directions": [
    {
      "id": "style_light_outdoor",
      "name": "轻户外",
      "description": "保留户外功能感，但弱化专业装备感。",
      "score": 92,
      "reason": "兼顾通勤和户外场景，市场接受度高。",
      "tags": ["户外", "通勤"]
    }
  ],
  "silhouettes": [
    {
      "id": "silhouette_short_loose",
      "name": "短款微宽松",
      "description": "利落短款结合适度余量，适合通勤和出行。",
      "score": 88,
      "reason": "更容易搭配高腰裤和半裙。",
      "tags": ["短款", "宽松"]
    }
  ],
  "core_structures": [
    {
      "id": "structure_sun_hood",
      "name": "高领防晒帽",
      "description": "增强颈部和头部防晒覆盖。",
      "score": 90,
      "reason": "功能明确，用户感知强。",
      "tags": ["防晒", "功能"]
    }
  ],
  "color_palette": [
    {
      "id": "color_glacier_white",
      "name": "冰川白",
      "hex": "#F5F7F2",
      "role": "primary",
      "score": 91,
      "reason": "清爽、轻量，适合春夏防晒品类。"
    }
  ],
  "fabric_trends": [
    {
      "id": "fabric_light_uv",
      "name": "轻量防晒面料",
      "description": "轻薄、抗 UV、便携。",
      "score": 94,
      "reason": "直接对应防晒衣核心购买理由。",
      "tags": ["防晒", "轻量"]
    }
  ],
  "selling_points": [
    {
      "id": "sp_upf",
      "name": "UPF 防晒",
      "description": "强调可量化的防晒能力。",
      "score": 95,
      "reason": "卖点清晰，适合电商标题和详情页。",
      "tags": ["功能", "防晒"]
    }
  ],
  "recommended_directions": [
    {
      "id": "direction_high_potential",
      "name": "高爆款潜力方向",
      "positioning": "轻户外通勤防晒夹克",
      "target_user": "18-30 女性",
      "style_ids": ["style_light_outdoor"],
      "silhouette_ids": ["silhouette_short_loose"],
      "structure_ids": ["structure_sun_hood"],
      "color_ids": ["color_glacier_white"],
      "fabric_ids": ["fabric_light_uv"],
      "selling_point_ids": ["sp_upf"],
      "design_summary": "面向 18-30 女性的轻户外通勤防晒衣。",
      "popularity_score": 86,
      "cost_complexity": "medium",
      "ai_prompt": "生成一款女款轻户外通勤防晒夹克..."
    }
  ],
  "base_prompt": "女款防晒衣，18-30 女性，通勤 / 户外，轻户外风格..."
}
```

### 5.2 AI 字段数量要求

| 字段 | 数量要求 |
| --- | --- |
| style_directions | 3-6 |
| silhouettes | 3-6 |
| core_structures | 4-8 |
| color_palette | 4-8 |
| fabric_trends | 3-6 |
| selling_points | 4-8 |
| recommended_directions | 3 |

### 5.3 Prompt 模板

```text
你是一名资深服装趋势分析师和服装产品企划专家。

请根据用户输入，生成一份可用于前端可视化选择的结构化趋势池。

用户输入：
- 品类：{{category}}
- 目标人群：{{target_user}}
- 使用场景：{{scene}}
- 风格方向：{{style}}

要求：
1. 只返回合法 JSON，不要返回 Markdown，不要返回解释性文字。
2. 所有字段名必须使用 snake_case。
3. 所有数组字段必须返回数组，不允许返回字符串。
4. 所有 score 必须是 0-100 的数字。
5. 所有 color_palette.hex 必须是合法 HEX 色值。
6. recommended_directions 必须引用前面趋势池中真实存在的 id。
7. 内容使用中文。
8. 输出必须符合以下 JSON 结构：

{
  "summary": "",
  "opportunity": "",
  "risk": "",
  "style_directions": [],
  "silhouettes": [],
  "core_structures": [],
  "color_palette": [],
  "fabric_trends": [],
  "selling_points": [],
  "recommended_directions": [],
  "base_prompt": ""
}
```

### 5.4 后端校验规则

后端必须校验：

- 返回内容可以被 JSON 解析。
- 必填字段全部存在。
- `style_directions`、`silhouettes`、`core_structures`、`color_palette`、`fabric_trends`、`selling_points`、`recommended_directions` 必须是数组。
- `TrendOption.id` 在同一数组内唯一。
- `ColorOption.hex` 符合 `^#[0-9A-Fa-f]{6}$`。
- `score` 范围为 0-100。
- `recommended_directions` 引用的所有 id 必须存在于对应趋势池。

## 6. 后端接口设计

### 6.1 统一响应规范

成功响应直接返回业务对象。

失败响应统一格式：

```json
{
  "code": "AI_RESULT_INVALID",
  "message": "AI 返回缺少字段：style_directions",
  "request_id": "req_xxx"
}
```

常用错误码：

| code | HTTP 状态码 | 说明 |
| --- | --- | --- |
| VALIDATION_ERROR | 400 | 请求参数错误 |
| NOT_FOUND | 404 | 资源不存在 |
| AI_CALL_FAILED | 502 | AI 接口调用失败 |
| AI_RESULT_NOT_JSON | 502 | AI 返回非 JSON |
| AI_RESULT_INVALID | 502 | AI JSON 字段不合法 |
| DATABASE_ERROR | 500 | 数据库异常 |
| INTERNAL_ERROR | 500 | 未知异常 |

### 6.2 创建趋势分析

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

成功响应：

```json
{
  "analysis_id": "8f1667b5-7f4e-4e71-8b35-ef4d9f9f41e8",
  "status": "success",
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

失败响应：

```json
{
  "code": "AI_RESULT_INVALID",
  "message": "AI 返回缺少字段：style_directions",
  "request_id": "req_001"
}
```

处理要求：

- 创建记录时 `status=processing`。
- AI 调用成功且校验通过后更新 `status=success`。
- AI 调用失败或 JSON 校验失败后更新 `status=failed`，保存 `error_message`。
- 必须保存 `prompt`、`raw_response`、`result_json`。

### 6.3 查询趋势分析详情

```http
GET /api/trend-analyses/{analysis_id}
```

成功响应：

```json
{
  "analysis_id": "8f1667b5-7f4e-4e71-8b35-ef4d9f9f41e8",
  "status": "success",
  "input": {
    "category": "女款防晒衣",
    "target_user": "18-30女性",
    "scene": "通勤 / 户外",
    "style": "轻户外"
  },
  "result": {},
  "error_message": null,
  "created_at": "2026-05-14T20:30:00+08:00",
  "updated_at": "2026-05-14T20:30:10+08:00"
}
```

### 6.4 查询趋势分析历史

```http
GET /api/trend-analyses?page=1&page_size=20
```

查询参数：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| page | number | 否 | 1 | 页码 |
| page_size | number | 否 | 20 | 每页数量，最大 100 |
| status | string | 否 | 无 | `processing` / `success` / `failed` |

成功响应：

```json
{
  "list": [
    {
      "analysis_id": "8f1667b5-7f4e-4e71-8b35-ef4d9f9f41e8",
      "category": "女款防晒衣",
      "target_user": "18-30女性",
      "scene": "通勤 / 户外",
      "style": "轻户外",
      "status": "success",
      "created_at": "2026-05-14T20:30:00+08:00"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 1
  }
}
```

### 6.5 根据选择生成我的设计方案

```http
POST /api/design-plans/generate
```

请求：

```json
{
  "analysis_id": "8f1667b5-7f4e-4e71-8b35-ef4d9f9f41e8",
  "selected_style_ids": ["style_light_outdoor"],
  "selected_silhouette_ids": ["silhouette_short_loose"],
  "selected_structure_ids": ["structure_sun_hood"],
  "selected_color_ids": ["color_glacier_white"],
  "selected_fabric_ids": ["fabric_light_uv"],
  "selected_selling_point_ids": ["sp_upf"]
}
```

成功响应：

```json
{
  "analysis_id": "8f1667b5-7f4e-4e71-8b35-ef4d9f9f41e8",
  "design_summary": "面向 18-30 女性的轻户外通勤防晒衣，采用短款微宽松廓形，结合高领防晒帽和轻量防晒面料。",
  "style_description": "整体风格轻户外但不过度机能，适合通勤、城市户外和短途出行。",
  "recommended_direction": "轻户外通勤防晒夹克",
  "popularity_score": 86,
  "ai_prompt": "生成一款女款轻户外通勤防晒夹克，冰川白主色，短款微宽松廓形...",
  "selected_items": {
    "analysis_id": "8f1667b5-7f4e-4e71-8b35-ef4d9f9f41e8",
    "selected_style_ids": ["style_light_outdoor"],
    "selected_silhouette_ids": ["silhouette_short_loose"],
    "selected_structure_ids": ["structure_sun_hood"],
    "selected_color_ids": ["color_glacier_white"],
    "selected_fabric_ids": ["fabric_light_uv"],
    "selected_selling_point_ids": ["sp_upf"]
  },
  "warnings": []
}
```

处理要求：

- 后端从 `trend_analysis.result_json` 中按 id 查找用户选择项。
- 如果选择 id 不存在，返回 `VALIDATION_ERROR`。
- MVP 可用规则组合生成方案，不强制二次调用 AI。
- `popularity_score` 可基于已选项 `score` 平均值计算，并对选择完整度做轻微加权。

### 6.6 保存设计方案

```http
POST /api/design-plans
```

请求：

```json
{
  "analysis_id": "8f1667b5-7f4e-4e71-8b35-ef4d9f9f41e8",
  "selection": {
    "analysis_id": "8f1667b5-7f4e-4e71-8b35-ef4d9f9f41e8",
    "selected_style_ids": ["style_light_outdoor"],
    "selected_silhouette_ids": ["silhouette_short_loose"],
    "selected_structure_ids": ["structure_sun_hood"],
    "selected_color_ids": ["color_glacier_white"],
    "selected_fabric_ids": ["fabric_light_uv"],
    "selected_selling_point_ids": ["sp_upf"]
  },
  "design_summary": "面向 18-30 女性的轻户外通勤防晒衣...",
  "style_description": "整体风格轻户外但不过度机能...",
  "recommended_direction": "轻户外通勤防晒夹克",
  "popularity_score": 86,
  "ai_prompt": "生成一款女款轻户外通勤防晒夹克...",
  "warnings": [],
  "is_favorite": true
}
```

成功响应：

```json
{
  "design_plan_id": "15dc6c79-b22f-492e-89e9-6d8a47322c33",
  "analysis_id": "8f1667b5-7f4e-4e71-8b35-ef4d9f9f41e8",
  "is_favorite": true,
  "created_at": "2026-05-14T20:40:00+08:00"
}
```

### 6.7 查询设计方案详情

```http
GET /api/design-plans/{design_plan_id}
```

成功响应：

```json
{
  "design_plan_id": "15dc6c79-b22f-492e-89e9-6d8a47322c33",
  "analysis_id": "8f1667b5-7f4e-4e71-8b35-ef4d9f9f41e8",
  "selection": {},
  "design_summary": "面向 18-30 女性的轻户外通勤防晒衣...",
  "style_description": "整体风格轻户外但不过度机能...",
  "recommended_direction": "轻户外通勤防晒夹克",
  "popularity_score": 86,
  "ai_prompt": "生成一款女款轻户外通勤防晒夹克...",
  "warnings": [],
  "is_favorite": true,
  "created_at": "2026-05-14T20:40:00+08:00",
  "updated_at": "2026-05-14T20:40:00+08:00"
}
```

## 7. 数据库设计

### 7.1 trend_analysis

保存一次 AI 趋势分析。

```sql
CREATE TABLE trend_analysis (
  id UUID PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  target_user VARCHAR(255) NOT NULL,
  scene VARCHAR(255) NOT NULL,
  style VARCHAR(255) NOT NULL,
  prompt TEXT NOT NULL,
  raw_response JSONB,
  result_json JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'processing',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trend_analysis_status ON trend_analysis(status);
CREATE INDEX idx_trend_analysis_created_at ON trend_analysis(created_at DESC);
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| id | 趋势分析 ID |
| category | 品类 |
| target_user | 目标人群 |
| scene | 使用场景 |
| style | 风格方向 |
| prompt | 组装后的 AI Prompt |
| raw_response | AI 原始返回 |
| result_json | 校验后的趋势池 JSON |
| status | `processing` / `success` / `failed` |
| error_message | 错误信息 |
| created_at | 创建时间 |
| updated_at | 更新时间 |

### 7.2 design_plan

保存用户最终设计方案。

```sql
CREATE TABLE design_plan (
  id UUID PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES trend_analysis(id),
  selection_json JSONB NOT NULL,
  design_summary TEXT NOT NULL,
  style_description TEXT,
  recommended_direction VARCHAR(255),
  popularity_score INTEGER,
  ai_prompt TEXT NOT NULL,
  warnings JSONB,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_design_plan_analysis_id ON design_plan(analysis_id);
CREATE INDEX idx_design_plan_is_favorite ON design_plan(is_favorite);
CREATE INDEX idx_design_plan_created_at ON design_plan(created_at DESC);
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| id | 设计方案 ID |
| analysis_id | 关联趋势分析 |
| selection_json | 用户选择结果 |
| design_summary | 设计摘要 |
| style_description | 款式描述 |
| recommended_direction | 推荐款式方向 |
| popularity_score | 爆款指数 |
| ai_prompt | 用于后续生图或款式开发的 Prompt |
| warnings | 冲突或待完善提示 |
| is_favorite | 是否收藏 |
| created_at | 创建时间 |
| updated_at | 更新时间 |

## 8. 前端状态管理

### 8.1 Zustand Store

```ts
type WorkspaceState = {
  input: TrendAnalysisInput;
  analysisId: string | null;
  analysisResult: TrendAnalysisResult | null;
  selection: UserDesignSelection | null;
  myDesignPlan: MyDesignPlan | null;
  loading: boolean;
  error: string | null;

  setInput: (input: TrendAnalysisInput) => void;
  submitAnalysis: () => Promise<void>;
  setSelection: (selection: UserDesignSelection) => void;
  applyRecommendedDirection: (direction: RecommendedDirection) => void;
  generateMyDesignPlan: () => Promise<void>;
  saveDesignPlan: (isFavorite?: boolean) => Promise<void>;
  resetWorkspace: () => void;
};
```

### 8.2 前端派生方案规则

前端可以根据当前 `selection` 和 `analysisResult` 派生预览版 `MyDesignPlan`：

- `design_summary`：组合目标人群、风格、版型、结构、颜色、面料、卖点。
- `style_description`：基于风格、场景、卖点生成一句描述。
- `recommended_direction`：优先使用当前应用的推荐方案名称；否则组合风格 + 品类。
- `popularity_score`：对已选项 `score` 求平均。
- `ai_prompt`：使用 `base_prompt` + 已选项名称拼接。
- `warnings`：选择项不足或明显冲突时生成提示。

保存前可调用 `POST /api/design-plans/generate` 获取后端正式方案。

## 9. 可视化数据映射

| 页面组件 | 使用字段 | 展示方式 |
| --- | --- | --- |
| TrendHero | `summary`、`opportunity`、`risk` | Hero Banner |
| StyleDirectionSelector | `style_directions.name/score/reason` | 环形图 + Chips |
| SilhouetteSelector | `silhouettes.name/score/description` | 标签云或横向卡片 |
| CoreStructureSelector | `core_structures.name/description/tags` | 卡片 Grid |
| ColorPaletteSelector | `color_palette.name/hex/role/reason` | 色卡矩阵 |
| FabricTrendSelector | `fabric_trends.name/tags/score` | 分组标签 |
| SellingPointSelector | `selling_points.name/description` | Icon Grid |
| RecommendedDirectionCards | `recommended_directions` | 三张方案卡 |
| MyDesignPlanPanel | `MyDesignPlan` | Sticky Panel |

### 9.1 颜色选择规则

- 主色最多 1 个。
- 辅助色和点缀色合计最多 3 个。
- 如果用户选择第二个主色，自动替换原主色。

### 9.2 趋势项选择规则

- 风格：建议 1-2 个。
- 版型：建议 1-3 个。
- 结构：建议 2-5 个。
- 面料：建议 1-3 个。
- 卖点：建议 2-4 个。

超出建议数量时不强制阻止，但在 `warnings` 中提示。

## 10. 异常状态与空状态

### 10.1 前端状态

| 场景 | 展示 |
| --- | --- |
| 首次进入 | 展示输入表单和空工作台 |
| 表单字段为空 | 字段下方显示校验提示 |
| 分析提交中 | 按钮 loading，趋势池 Skeleton |
| AI 调用失败 | 展示错误提示和重试按钮 |
| 趋势池为空 | 展示“暂无趋势项，请重新生成” |
| 历史记录为空 | 展示空状态 |
| 设计方案生成失败 | Sticky Panel 展示错误提示 |
| 保存失败 | Toast 提示，保留当前选择 |

### 10.2 后端异常处理

| 场景 | 处理 |
| --- | --- |
| 参数缺失 | 返回 400 `VALIDATION_ERROR` |
| 参数过长 | 返回 400 `VALIDATION_ERROR` |
| AI 接口超时 | 更新记录为 failed，返回 502 `AI_CALL_FAILED` |
| AI 返回非 JSON | 更新记录为 failed，返回 502 `AI_RESULT_NOT_JSON` |
| AI 返回字段缺失 | 更新记录为 failed，返回 502 `AI_RESULT_INVALID` |
| AI 返回引用了不存在的 id | 更新记录为 failed，返回 502 `AI_RESULT_INVALID` |
| 查询不存在资源 | 返回 404 `NOT_FOUND` |
| 数据库异常 | 返回 500 `DATABASE_ERROR` |

## 11. MVP 开发顺序

1. 搭建 FastAPI 项目基础结构。
2. 配置 PostgreSQL、SQLAlchemy、Alembic。
3. 创建 `trend_analysis` 和 `design_plan` 表。
4. 定义 Pydantic Schemas。
5. 实现 AI Prompt 组装函数。
6. 实现 AI 调用服务。
7. 实现 AI JSON 解析与校验。
8. 实现 `POST /api/trend-analyses`。
9. 实现 `GET /api/trend-analyses/{analysis_id}`。
10. 实现 `GET /api/trend-analyses`。
11. 实现 `POST /api/design-plans/generate`。
12. 实现 `POST /api/design-plans`。
13. 实现 `GET /api/design-plans/{design_plan_id}`。
14. 搭建 Next.js 前端项目。
15. 实现 `TrendWorkbenchPage`。
16. 实现 Zustand 状态管理。
17. 实现输入表单和趋势分析提交。
18. 实现趋势池可视化选择。
19. 实现推荐方案应用。
20. 实现 Sticky Summary Panel。
21. 实现收藏方案。
22. 实现 JSON/Markdown 前端导出。
23. 联调完整流程。
24. 补充单元测试和接口测试。

## 12. 测试用例与验收标准

### 12.1 后端测试用例

创建趋势分析成功：

- 输入合法 4 字段。
- Mock AI 返回完整趋势池。
- 接口返回 `status=success`。
- 数据库保存 `prompt`、`raw_response`、`result_json`。

AI 返回非 JSON：

- Mock AI 返回普通文本。
- 接口返回 502 `AI_RESULT_NOT_JSON`。
- 数据库记录 `status=failed`。
- `error_message` 保存错误原因。

AI 返回缺少字段：

- Mock AI 返回缺少 `style_directions`。
- 接口返回 502 `AI_RESULT_INVALID`。
- 错误信息包含缺失字段名。

AI 返回字段类型错误：

- Mock AI 返回 `color_palette` 为字符串。
- 接口返回 502 `AI_RESULT_INVALID`。

推荐方案引用不存在 id：

- Mock `recommended_directions.style_ids` 引用不存在的 id。
- 接口返回 502 `AI_RESULT_INVALID`。

生成设计方案成功：

- 使用存在的 `analysis_id`。
- 选择项 id 全部存在。
- 返回 `design_summary`、`popularity_score`、`ai_prompt`。

保存设计方案成功：

- 提交完整 `selection` 和 `ai_prompt`。
- 数据库写入 `selection_json` 和 `ai_prompt`。

历史分页成功：

- 创建多条趋势分析。
- `GET /api/trend-analyses?page=1&page_size=20` 返回分页信息。
- 默认按 `created_at DESC` 排序。

### 12.2 前端测试场景

- 表单字段为空时不能提交。
- 提交中按钮显示 loading。
- 分析成功后展示 Hero、趋势池、推荐方案。
- 趋势池为空时展示空状态。
- 点击趋势项后 Sticky Panel 实时更新。
- 点击推荐方案后自动回填选择项。
- 收藏成功后按钮显示已收藏。
- 导出 JSON 内容包含 `analysis_id`、`selection`、`ai_prompt`。
- 导出 Markdown 内容包含设计摘要、推荐方向、爆款指数、AI Prompt。

### 12.3 MVP 验收标准

用户必须能完成以下闭环：

1. 输入品类、目标人群、使用场景、风格方向。
2. 获得 AI 趋势分析和趋势池。
3. 在可视化趋势池中选择设计要素。
4. 实时看到“我的设计方案”。
5. 应用 AI 推荐方案。
6. 收藏最终方案。
7. 导出 JSON 或 Markdown。
8. 拿到可用于后续 AI 生图的 `ai_prompt`。

只要以上闭环顺畅，即认为 MVP 达到开发验收标准。

## 13. 后续扩展预留

### 13.1 异步任务

当 AI 响应时间较长时，可扩展为：

```text
POST /api/trend-analyses
  -> 返回 analysis_id 和 status=processing
  -> 后端异步执行 AI 调用
  -> 前端轮询 GET /api/trend-analyses/{analysis_id}
```

可选技术：

- Redis
- Celery
- FastAPI BackgroundTasks

### 13.2 AI 生图

后续新增：

```http
POST /api/image-generations
```

请求使用：

- `design_plan_id`
- `ai_prompt`
- 可选图片风格参数

### 13.3 Tech Pack

后续基于 `design_plan` 扩展：

- 款式描述
- 面辅料建议
- 工艺说明
- 结构细节
- 颜色方案
- 生产注意事项

### 13.4 方案对比

后续新增对比功能：

- 最多对比 3-5 个设计方案。
- 对比维度包括风格、版型、结构、颜色、面料、卖点、爆款指数、成本复杂度。
