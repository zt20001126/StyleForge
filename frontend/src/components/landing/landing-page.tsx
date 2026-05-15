"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Images,
  Layers3,
  LineChart,
  Palette,
  PenTool,
  Shirt,
  WandSparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AppFooter } from "@/components/landing/app-footer";

const navItems = [
  { label: "趋势分析", href: "#trend" },
  { label: "AI设计工具", href: "#tools" },
  { label: "案例方案", href: "#cases" },
  { label: "方案库", href: "/gallery" },
];

const heroStats = [
  ["91", "趋势热度"],
  ["6", "设计维度"],
  ["3", "推荐方案"],
];

const capabilities = [
  {
    icon: LineChart,
    title: "趋势洞察",
    text: "把品类、人群、场景和风格转化为可决策的趋势热度、机会点与风险提示。",
  },
  {
    icon: PenTool,
    title: "文生款",
    text: "用自然语言快速生成款式方向、结构细节、卖点组合和可复用 Prompt。",
  },
  {
    icon: Layers3,
    title: "以款生款",
    text: "基于已有款式延展同系列方向，沉淀更完整的产品企划矩阵。",
  },
  {
    icon: Palette,
    title: "配色推荐",
    text: "输出主色、辅助色和点缀色，帮助趋势判断快速转成视觉方案。",
  },
  {
    icon: Images,
    title: "图案生成",
    text: "围绕风格、人群和品类生成图案灵感，服务印花、局部图形和系列视觉。",
  },
  {
    icon: Shirt,
    title: "虚拟上身 / 商拍",
    text: "承接方案 Prompt，后续可进入款式图、试穿图和电商展示图生成流程。",
  },
];

const cases = [
  {
    title: "防晒通勤",
    audience: "18-30 女性",
    style: "轻户外 + 城市机能",
    score: 91,
    palette: ["#f5f7f2", "#a9bbcb", "#9eb6a3"],
    result: "短款微宽松防晒夹克，强化高领遮阳、背部透气与 UPF 卖点。",
  },
  {
    title: "轻户外系列",
    audience: "都市周末出行",
    style: "低饱和自然色 + 功能层次",
    score: 87,
    palette: ["#d8ded2", "#768b7a", "#27343b"],
    result: "生成 3 套同系列外套/半裙/背心方向，适合小批量测试。",
  },
  {
    title: "电商品类企划",
    audience: "内容种草渠道",
    style: "甜酷街头 + 高频上新",
    score: 84,
    palette: ["#f3d7de", "#262a36", "#c7f06a"],
    result: "提炼主图卖点、差异化结构和快速上架的商品标题方向。",
  },
];

const businessValues = [
  {
    role: "面向设计师",
    value: "更快形成系列方向",
    text: "从趋势结论直接进入款式组合，减少空白页阶段的反复试错。",
  },
  {
    role: "面向电商卖家",
    value: "更快测试爆款卖点",
    text: "用人群、场景、卖点和热度评分判断哪些商品方向值得先做。",
  },
  {
    role: "面向品牌企划",
    value: "更快输出趋势方案",
    text: "把市场机会、设计语言和方案摘要组织成可沟通的企划材料。",
  },
];

const trendBars = [42, 54, 62, 76, 88, 91, 86];
const selectedElements = ["冰川白主色", "高领遮阳帽", "背部隐形透气", "UPF 50+"];

export function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="grid-glow pointer-events-none absolute inset-0" />

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md border border-cyan-300/40 bg-cyan-300/10 text-sm font-semibold text-primary">
            SF
          </div>
          <div>
            <div className="text-sm font-semibold">StyleForge</div>
            <div className="text-xs text-muted-foreground">AI Fashion Platform</div>
          </div>
        </Link>

        <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {navItems.map((item) =>
            item.href.startsWith("#") ? (
              <a key={item.href} href={item.href} className="transition hover:text-foreground">
                {item.label}
              </a>
            ) : (
              <Link key={item.href} href={item.href} className="transition hover:text-foreground">
                {item.label}
              </Link>
            ),
          )}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm">
            <Link href="/trend-workbench">进入工作台</Link>
          </Button>
        </div>
      </nav>

      <section
        id="trend"
        className="relative z-10 mx-auto grid min-h-[calc(100vh-84px)] max-w-7xl items-center gap-10 px-5 pb-16 pt-8 lg:grid-cols-[0.9fr_1.1fr]"
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-7"
        >
          <Badge className="w-fit">趋势分析 + AI设计工作台</Badge>

          <div className="space-y-5">
            <h1 className="max-w-4xl text-5xl font-semibold leading-tight md:text-7xl">StyleForge</h1>
            <p className="max-w-2xl text-xl font-medium leading-8 md:text-2xl">
              从趋势洞察到 AI 服装方案生成
            </p>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              面向设计师、电商卖家和品牌企划的 AI 服装趋势决策平台。把市场机会、设计要素和生成式
              Prompt 收束到一个可执行的方案工作流。
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/trend-workbench">
                开始趋势分析
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#cases">查看案例方案</a>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/generate">进入 AI 设计工具</Link>
            </Button>
          </div>

          <div className="grid max-w-2xl grid-cols-3 gap-3">
            {heroStats.map(([value, label]) => (
              <div key={label} className="glass-panel rounded-lg p-4">
                <div className="text-2xl font-semibold tabular-nums">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="glass-panel relative rounded-xl p-4"
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-300/15 blur-3xl" />
          <div className="absolute -bottom-12 left-10 h-44 w-44 rounded-full bg-violet-300/15 blur-3xl" />

          <div className="relative grid gap-4 rounded-lg border bg-background/60 p-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Trend Intelligence</p>
                  <h2 className="font-semibold">女款防晒夹克 / 轻机能通勤</h2>
                </div>
                <Badge variant="success">Live</Badge>
              </div>

              <div className="rounded-lg border bg-card/75 p-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">趋势热度</span>
                  <span className="font-medium text-primary">91 / 100</span>
                </div>
                <div className="flex h-36 items-end gap-2">
                  {trendBars.map((height, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-t bg-gradient-to-t from-cyan-400/35 to-violet-300"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border bg-card/75 p-4">
                  <BarChart3 className="mb-3 size-5 text-primary" />
                  <p className="text-xs text-muted-foreground">机会点</p>
                  <p className="mt-1 text-sm font-medium">通勤 + 户外双场景</p>
                </div>
                <div className="rounded-lg border bg-card/75 p-4">
                  <Bot className="mb-3 size-5 text-violet-400" />
                  <p className="text-xs text-muted-foreground">AI 推荐</p>
                  <p className="mt-1 text-sm font-medium">轻量防晒机能风</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg border bg-card">
                <div className="relative h-64 bg-gradient-to-br from-cyan-50 via-white to-violet-100 dark:from-slate-900 dark:via-slate-950 dark:to-cyan-950">
                  <div className="absolute left-1/2 top-8 h-36 w-28 -translate-x-1/2 rounded-t-[42px] rounded-b-xl border border-cyan-500/20 bg-white/80 shadow-2xl shadow-cyan-500/15 dark:bg-slate-100/90" />
                  <div className="absolute left-[27%] top-20 h-28 w-12 -rotate-12 rounded-full border border-cyan-500/20 bg-white/70 dark:bg-slate-100/80" />
                  <div className="absolute right-[27%] top-20 h-28 w-12 rotate-12 rounded-full border border-cyan-500/20 bg-white/70 dark:bg-slate-100/80" />
                  <div className="absolute left-1/2 top-16 h-20 w-20 -translate-x-1/2 rounded-full border border-cyan-300/50 bg-cyan-100/70" />
                  <div className="absolute bottom-5 left-5 rounded-md border bg-background/80 px-3 py-2 text-xs shadow-lg">
                    AI 款式预览
                  </div>
                  <div className="absolute right-5 top-5 rounded-full border bg-background/80 px-3 py-1 text-xs text-primary">
                    UPF 50+
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card/75 p-4">
                <div className="mb-3 text-sm text-muted-foreground">AI 款式推荐卡</div>
                <div className="space-y-2">
                  {selectedElements.map((item) => (
                    <div key={item} className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2 text-sm">
                      <span>{item}</span>
                      <CheckCircle2 className="size-4 text-primary" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-4 text-sm leading-6 text-muted-foreground lg:col-span-2">
              推荐方向：女款城市轻户外防晒夹克，短款微宽松，冰川白与雾感蓝，高领遮阳、背部隐形透气，突出高级冷感科技风。
            </div>
          </div>
        </motion.div>
      </section>

      <section id="tools" className="relative z-10 mx-auto max-w-7xl px-5 py-16">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge className="mb-4 w-fit">Core Capabilities</Badge>
            <h2 className="text-3xl font-semibold md:text-4xl">从趋势判断到设计生成的完整工具矩阵</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            不只是进入工作台，而是让不同角色都能找到对应的业务动作：分析趋势、生成款式、延展系列、沉淀方案。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((item) => (
            <div key={item.title} className="glass-panel rounded-lg p-5">
              <item.icon className="mb-5 size-6 text-primary" />
              <h3 className="mb-2 font-semibold">{item.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="cases" className="relative z-10 mx-auto max-w-7xl px-5 py-16">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge className="mb-4 w-fit">Case Library</Badge>
            <h2 className="text-3xl font-semibold md:text-4xl">热门趋势案例方案</h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/gallery">查看方案库</Link>
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {cases.map((item) => (
            <div key={item.title} className="glass-panel flex min-h-[320px] flex-col justify-between rounded-lg p-5">
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <Badge variant="secondary">{item.audience}</Badge>
                  <div className="text-sm font-semibold text-primary">{item.score}</div>
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.style}</p>

                <div className="my-5 flex gap-2">
                  {item.palette.map((color) => (
                    <span
                      key={color}
                      className="h-9 flex-1 rounded-md border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <p className="text-sm leading-6 text-muted-foreground">{item.result}</p>
              </div>

              <div className="mt-6 flex gap-2">
                <Button asChild size="sm">
                  <Link href="/trend-workbench">应用此方案</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/gallery">查看详情</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-20 pt-10">
        <div className="glass-panel grid gap-6 rounded-xl p-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col justify-between gap-6">
            <div>
              <Badge className="mb-4 w-fit">Business Value</Badge>
              <h2 className="text-3xl font-semibold md:text-4xl">让首页从工具入口变成商业转化入口</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                StyleForge 保留轻盈、简洁、科技感的品牌气质，同时用案例、角色价值和清晰 CTA 告诉用户它能带来的业务结果。
              </p>
            </div>
            <Button asChild size="lg" className="w-fit">
              <Link href="/trend-workbench">
                进入工作台
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {businessValues.map((item) => (
              <div key={item.role} className="rounded-lg border bg-background/55 p-5">
                <WandSparkles className="mb-4 size-5 text-primary" />
                <p className="text-xs text-muted-foreground">{item.role}</p>
                <h3 className="mt-2 font-semibold">{item.value}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AppFooter />
    </main>
  );
}
