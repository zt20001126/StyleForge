"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, GalleryVerticalEnd, LineChart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const capabilities = [
  {
    icon: LineChart,
    title: "爆款趋势分析",
    text: "把品类、场景和用户画像转成可选择的趋势池、评分和风险信号。",
  },
  {
    icon: Sparkles,
    title: "AI 设计共创",
    text: "从风格、版型、结构、颜色、面料、卖点组合出标准化设计方案。",
  },
  {
    icon: BrainCircuit,
    title: "Prompt 资产沉淀",
    text: "每个方案自动生成可复用 AI prompt，便于后续生图和款式开发。",
  },
  {
    icon: GalleryVerticalEnd,
    title: "方案库管理",
    text: "收藏高潜方案，沉淀趋势历史和设计决策依据。",
  },
];

export function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="grid-glow pointer-events-none absolute inset-0" />
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">
            SF
          </div>
          <div>
            <div className="text-sm font-semibold">StyleForge</div>
            <div className="text-xs text-muted-foreground">AI Fashion SaaS</div>
          </div>
        </Link>
        <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#capabilities" className="hover:text-foreground">能力</a>
          <a href="#workflow" className="hover:text-foreground">流程</a>
          <Link href="/gallery" className="hover:text-foreground">方案库</Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm">
            <Link href="/trend-workbench">进入工作台</Link>
          </Button>
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-84px)] max-w-7xl items-center gap-10 px-5 pb-10 pt-8 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col gap-7">
          <Badge className="w-fit">AI 趋势洞察 + 服装设计共创</Badge>
          <div className="space-y-5">
            <h1 className="max-w-4xl text-5xl font-semibold leading-tight md:text-7xl">
              StyleForge
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
              面向服装行业的 AI 爆款趋势分析与设计 SaaS。把市场机会、设计要素和生成式 AI prompt 收束进一个可执行工作台。
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/trend-workbench">
                开始趋势分析 <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/history">查看分析历史</Link>
            </Button>
          </div>
          <div className="grid max-w-2xl grid-cols-3 gap-3">
            {[
              ["91", "爆款潜力"],
              ["6", "趋势维度"],
              ["3", "推荐方向"],
            ].map(([value, label]) => (
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
          <div className="rounded-lg border bg-background/50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Trend Intelligence</p>
                <h2 className="font-semibold">女款防晒夹克 / 轻机能通勤</h2>
              </div>
              <Badge variant="success">Live</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-card/70 p-4">
                <div className="mb-3 text-sm text-muted-foreground">趋势热度</div>
                <div className="flex h-36 items-end gap-2">
                  {[42, 54, 62, 76, 88, 91, 86].map((height, index) => (
                    <div key={index} className="flex-1 rounded-t bg-gradient-to-t from-cyan-400/35 to-violet-300" style={{ height: `${height}%` }} />
                  ))}
                </div>
              </div>
              <div className="rounded-lg border bg-card/70 p-4">
                <div className="mb-3 text-sm text-muted-foreground">AI 设计方案</div>
                <div className="space-y-3">
                  {["冰川白主色", "高领防晒帽", "背部隐形透气", "UPF 50+"].map((item) => (
                    <div key={item} className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2 text-sm">
                      <span>{item}</span>
                      <span className="text-cyan-300">selected</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-4 text-sm text-muted-foreground">
              女款城市轻户外防晒夹克，短款微宽松，冰川白与雾感蓝，高领防晒帽，背部隐形透气，高级冷感科技风。
            </div>
          </div>
        </motion.div>
      </section>

      <section id="capabilities" className="relative z-10 mx-auto grid max-w-7xl gap-4 px-5 py-16 md:grid-cols-4">
        {capabilities.map((item) => (
          <div key={item.title} className="glass-panel rounded-lg p-5">
            <item.icon className="mb-5 size-6 text-cyan-300" />
            <h3 className="mb-2 font-semibold">{item.title}</h3>
            <p className="text-sm leading-6 text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </section>

      <section id="workflow" className="relative z-10 mx-auto max-w-7xl px-5 pb-20">
        <div className="glass-panel grid gap-5 rounded-xl p-6 md:grid-cols-4">
          {["输入需求", "生成趋势池", "组合设计方案", "导出 Prompt"].map((item, index) => (
            <div key={item} className="flex items-center gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">{index + 1}</div>
              <div>
                <div className="font-medium">{item}</div>
                <div className="text-sm text-muted-foreground">StyleForge workflow</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
