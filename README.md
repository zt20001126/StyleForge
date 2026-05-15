# StyleForge

StyleForge 是一个面向服装行业的 AI 爆款趋势分析与设计共创平台。项目目标是帮助用户从品类、人群、场景和风格方向出发，生成结构化趋势分析结果，并进一步组合出可保存、可复用、可用于后续 AI 生图的设计方案。

当前 MVP 已包含：

- 趋势分析接口：根据用户输入生成结构化趋势结果。
- 设计方案生成：基于风格、版型、结构、颜色、面料、卖点等选择生成方案。
- 设计方案保存与读取：支持保存用户选择、设计摘要、爆款指数和 AI 绘图提示词。
- 历史记录基础能力：趋势分析记录和设计方案可持久化保存。
- PostgreSQL 持久化：支持通过 Docker Compose 快速启动本地 PostgreSQL 数据库。
- AI 生成 - 以文生款前端页：支持模型选择、款式描述、生成张数、最近任务、精选案例回填和 mock 生成结果展示，真实后端接口暂未接入。

## 项目结构

```text
StyleForge/
  backend/                 FastAPI 后端服务
    app/                   API、业务服务、schema、repository
    db/schema.sql          PostgreSQL 建表脚本
    requirements.txt       后端 Python 依赖
    .env.example           后端环境变量示例
  frontend/                Next.js 前端应用
    src/                   页面、组件、状态和 API 封装
    package.json           前端依赖和脚本
  docs/                    产品需求和开发文档
  docker-compose.yml       本地 PostgreSQL 和 MinIO Docker 配置
  README.md                项目启动说明
```

## 技术栈

- 后端：FastAPI、Pydantic v2、SQLAlchemy、psycopg、pytest
- 数据库：PostgreSQL 16
- 对象存储：MinIO（S3 兼容，用于后续图片、视频和生成产物存储）
- 前端：Next.js、React、TypeScript、Tailwind CSS、Zustand、Recharts
- 本地环境：Docker Compose

## 一、本地 PostgreSQL 数据库

项目推荐使用 Docker Compose 启动 PostgreSQL。这样不同电脑上的数据库版本、端口、用户名、密码和初始化表结构都保持一致，方便团队协作和快速配置。

### 1. 启动数据库

在项目根目录执行：

```bash
docker compose up -d
```

首次启动时，PostgreSQL 容器会自动执行：

```text
backend/db/schema.sql
```

并创建以下核心表：

- `trend_analyses`
- `design_plans`
- `generation_tasks`
- `generated_assets`

### 2. 数据库连接信息

Docker 容器内部 PostgreSQL 端口是 `5432`，映射到本机端口为 `55432`，用于避开你电脑上可能已经存在的本机 PostgreSQL `5432` 端口冲突。

| 配置项 | 值 |
| --- | --- |
| Host | `localhost` |
| Port | `55432` |
| Database | `styleforge_dev` |
| User | `styleforge_user` |
| Password | `styleforge_password` |
| Driver | PostgreSQL |

后端使用的 SQLAlchemy 连接串：

```env
postgresql+psycopg://styleforge_user:styleforge_password@localhost:55432/styleforge_dev
```

部分数据库可视化软件使用的普通 PostgreSQL URL：

```env
postgresql://styleforge_user:styleforge_password@localhost:55432/styleforge_dev
```

### 3. 常用数据库命令

查看容器是否启动：

```bash
docker ps
```

停止数据库：

```bash
docker compose down
```

重新启动数据库：

```bash
docker compose up -d
```

进入 PostgreSQL 命令行：

```bash
docker exec -it styleforge-postgres psql -U styleforge_user -d styleforge_dev
```

进入后查看表：

```sql
\dt
```

退出 PostgreSQL 命令行：

```sql
\q
```

彻底删除数据库数据并重新初始化：

```bash
docker compose down -v
docker compose up -d
```

注意：`docker compose down -v` 会删除 PostgreSQL volume，数据库中的已有数据会被清空。

## 二、本地 MinIO 对象存储

MinIO 是一个兼容 S3 API 的对象存储服务，适合在本地开发环境中保存图片、视频、用户上传文件、AI 生成结果和任务产物。StyleForge 后续会实现图片生成、图片编辑、视频生成、用户上传图片/视频等能力，这些文件不适合直接放进 PostgreSQL，应该由对象存储保存文件本体，再由数据库保存文件路径、URL、类型、大小和任务关联信息。

当前阶段只配置 MinIO 基础环境，不实现上传接口，也不接入真实图片/视频生成业务。

### 1. 启动 MinIO

在项目根目录执行：

```bash
docker compose up -d
```

该命令会同时启动 PostgreSQL 和 MinIO。MinIO API 端口默认映射到本机 `9000`，控制台端口默认映射到本机 `9001`。

### 2. MinIO 控制台访问地址

浏览器访问：

```text
http://localhost:9001
```

默认本地开发账号：

```text
styleforge_minio
```

默认本地开发密码：

```text
styleforge_minio_password
```

注意：这些只是本地开发默认值。真实环境的账号密码不要提交到 Git。

### 3. 创建 bucket

首次登录 MinIO 控制台后，手动创建 bucket：

```text
styleforge-assets
```

该 bucket 后续用于保存：

- AI 生成图片
- AI 编辑后的图片
- AI 生成视频
- 用户上传图片和视频
- 任务中间产物和最终产物

### 4. Docker Compose 环境变量

根目录 `.env.example` 提供了 Docker Compose 使用的 MinIO 示例配置。如果需要覆盖默认值，可以复制为 `.env`：

```powershell
copy .env.example .env
```

Windows PowerShell 也可以使用：

```powershell
Copy-Item .env.example .env
```

默认配置如下：

```env
MINIO_ROOT_USER=styleforge_minio
MINIO_ROOT_PASSWORD=styleforge_minio_password
MINIO_API_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_BUCKET=styleforge-assets
```

### 5. 后端连接 MinIO 的配置

后端的 `backend/.env.example` 已预留 MinIO 连接信息。后续实现文件存储服务时，可以在 `backend/.env` 中配置：

```env
OBJECT_STORAGE_PROVIDER=minio
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=styleforge_minio
MINIO_SECRET_KEY=styleforge_minio_password
MINIO_BUCKET=styleforge-assets
MINIO_REGION=us-east-1
MINIO_SECURE=false
```

后续接入建议：

- 在 `backend/app/services/file_storage.py` 中封装对象存储客户端。
- 上传图片/视频后，将文件本体保存到 MinIO。
- 在 PostgreSQL 的 `generated_assets.storage_path` 中保存对象 key，例如 `generated-assets/{task_id}/{asset_id}.png`。
- 仅在需要公开访问或临时访问时生成 `public_url` 或预签名 URL。

### 6. MinIO 常用命令

查看容器状态：

```bash
docker ps
```

查看 MinIO 日志：

```bash
docker logs styleforge-minio
```

停止容器但保留数据：

```bash
docker compose down
```

停止并删除容器、网络和 volume 数据：

```bash
docker compose down -v
```

注意：`docker compose down -v` 会删除 PostgreSQL 和 MinIO 的本地 volume，数据库数据和 MinIO 文件都会被清空。

Windows PowerShell 常用命令：

```powershell
docker compose up -d
docker ps
docker logs styleforge-minio
docker compose down
docker compose down -v
```

## 三、使用数据库可视化软件连接

你可以使用任意 PostgreSQL 可视化工具连接本地 Docker 数据库，例如：

- DBeaver
- DataGrip
- pgAdmin
- Navicat

新建 PostgreSQL 连接时填写：

| 配置项 | 填写内容 |
| --- | --- |
| Host | `localhost` |
| Port | `55432` |
| Database | `styleforge_dev` |
| Username | `styleforge_user` |
| Password | `styleforge_password` |
| Driver | PostgreSQL |

如果工具要求填写 JDBC URL，可使用类似格式：

```text
jdbc:postgresql://localhost:55432/styleforge_dev
```

如果工具要求填写 PostgreSQL URL，可使用：

```text
postgresql://styleforge_user:styleforge_password@localhost:55432/styleforge_dev
```

连接成功后，可以在 `public` schema 下看到项目表。

## 四、后端启动方式

后端位于 `backend/`，使用 FastAPI。

### 1. 创建并激活虚拟环境

Windows PowerShell：

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

如果使用 Git Bash、macOS 或 Linux：

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 配置环境变量

复制示例配置：

```bash
copy .env.example .env
```

如果使用 macOS 或 Linux：

```bash
cp .env.example .env
```

确认 `.env` 中至少包含：

```env
USE_MOCK_AI=true
STORAGE_MODE=postgres
DATABASE_URL=postgresql+psycopg://styleforge_user:styleforge_password@localhost:55432/styleforge_dev
FRONTEND_ORIGIN=http://localhost:3000
```

如果暂时不想连接 PostgreSQL，也可以使用内存模式：

```env
STORAGE_MODE=memory
DATABASE_URL=
```

内存模式的数据会在后端进程重启后丢失。

### 4. 启动后端服务

```bash
uvicorn app.main:app --reload
```

默认后端地址：

```text
http://localhost:8000
```

健康检查地址：

```text
http://localhost:8000/health
```

## 五、前端启动方式

前端位于 `frontend/`，使用 Next.js。

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 配置前端连接后端

如果要连接真实后端接口，建议在 `frontend/.env.local` 中配置：

```env
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

如果不配置，前端默认会使用 mock 数据模式。

### 3. 启动前端服务

```bash
npm run dev
```

默认前端地址：

```text
http://localhost:3000
```

以文生款页面访问地址：

```text
http://localhost:3000/generate/text-to-style
```

该页面当前使用前端 mock 生成逻辑。后续接入真实后端时，替换 `frontend/src/lib/api/text-to-fashion.ts` 中的 `generateTextToFashion(payload)` 即可。

## 六、推荐启动顺序

第一次启动项目时，推荐按下面顺序执行：

```bash
docker compose up -d
```

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

另开一个终端：

```bash
cd frontend
npm install
npm run dev
```

访问：

```text
http://localhost:3000
```

## 七、常用检查命令

后端测试：

```bash
cd backend
python -m pytest
```

前端代码检查：

```bash
cd frontend
npm run lint
```

前端构建：

```bash
cd frontend
npm run build
```

查看 Docker 数据库日志：

```bash
docker logs styleforge-postgres
```

查看 Docker MinIO 日志：

```bash
docker logs styleforge-minio
```

查看 Docker 数据库健康状态：

```bash
docker inspect --format='{{.State.Health.Status}}' styleforge-postgres
```

## 八、常见问题

### 1. 为什么数据库端口是 55432，不是 5432？

因为很多电脑本机已经安装了 PostgreSQL，并占用了 `5432`。本项目把 Docker PostgreSQL 映射到本机 `55432`，可以避免端口冲突。

### 2. 修改了 `schema.sql` 后为什么表结构没有变化？

Docker 官方 PostgreSQL 镜像只会在数据库第一次初始化时执行 `/docker-entrypoint-initdb.d/` 里的 SQL 文件。如果 volume 已经存在，后续启动不会重复执行。

开发阶段如果要完全重建数据库，可以执行：

```bash
docker compose down -v
docker compose up -d
```

注意这会清空已有数据。

### 3. 后端连接不上数据库怎么办？

先确认 Docker 数据库已启动：

```bash
docker ps
```

再确认 `.env` 中连接串使用的是 `55432`：

```env
DATABASE_URL=postgresql+psycopg://styleforge_user:styleforge_password@localhost:55432/styleforge_dev
```

然后确认容器里数据库可用：

```bash
docker exec -it styleforge-postgres psql -U styleforge_user -d styleforge_dev
```

### 4. 前端没有请求后端怎么办？

确认 `frontend/.env.local` 中设置：

```env
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

修改 `.env.local` 后需要重启前端开发服务。

## 九、环境变量说明

后端常用环境变量：

| 变量 | 说明 |
| --- | --- |
| `USE_MOCK_AI` | 是否使用 mock AI，开发阶段建议 `true` |
| `STORAGE_MODE` | 存储模式，`postgres` 表示使用 PostgreSQL，`memory` 表示内存模式 |
| `DATABASE_URL` | 后端 PostgreSQL 连接串 |
| `FRONTEND_ORIGIN` | 允许跨域访问后端的前端地址 |
| `AI_PROVIDER` | AI 服务提供方，当前默认 `mock` |
| `AI_API_KEY` | 真实 AI 服务密钥，不能提交到 Git |
| `AI_BASE_URL` | AI 服务 base URL |
| `AI_MODEL` | AI 模型名称 |
| `OBJECT_STORAGE_PROVIDER` | 后续对象存储提供方，本地开发可使用 `minio` |
| `MINIO_ENDPOINT` | MinIO API 地址，本地默认 `http://localhost:9000` |
| `MINIO_ACCESS_KEY` | MinIO 访问账号，不能在真实环境提交到 Git |
| `MINIO_SECRET_KEY` | MinIO 访问密码，不能在真实环境提交到 Git |
| `MINIO_BUCKET` | MinIO bucket 名称，本地默认 `styleforge-assets` |
| `MINIO_REGION` | S3 兼容区域配置，本地默认 `us-east-1` |
| `MINIO_SECURE` | 是否使用 HTTPS，本地默认 `false` |

前端常用环境变量：

| 变量 | 说明 |
| --- | --- |
| `NEXT_PUBLIC_USE_MOCKS` | 是否使用前端 mock 数据 |
| `NEXT_PUBLIC_API_BASE_URL` | 后端 API 地址 |

## Configuration and Secret Management

StyleForge uses `backend/app/core/config.py` as the single backend configuration entrypoint. Backend code should read settings from `get_settings()` or receive a `Settings` object from its caller; avoid direct `os.getenv()` calls in services, routes, repositories, or storage clients.

Configuration priority:

1. Production and CI/CD secrets injected as environment variables or platform secrets.
2. Local backend values in `backend/.env`.
3. Safe examples in `backend/.env.example` and `frontend/.env.example`.
4. Docker Compose local infrastructure defaults in the root `.env.example`.

Backend-only secrets:

- `OPENAI_API_KEY`, `ARK_API_KEY`, `DASHSCOPE_API_KEY`
- `DATABASE_URL`, `REDIS_URL`
- `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`
- `OSS_ACCESS_KEY_ID`, `OSS_ACCESS_KEY_SECRET`

Frontend-safe variables:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_USE_MOCKS`

Never add provider API keys, database URLs, Redis URLs, MinIO secrets, or OSS secrets to frontend environment variables. Every `NEXT_PUBLIC_*` variable is visible in the browser bundle.

For real model calls, set `USE_MOCK_AI=false` and choose `AI_PROVIDER=openai`, `AI_PROVIDER=ark`, or `AI_PROVIDER=dashscope`. The backend then selects the provider-specific base URL, model, and API key through the central settings object.
