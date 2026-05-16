"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Images,
  Layers3,
  LineChart,
  Palette,
  PenTool,
  Shirt,
  Sparkles,
} from "lucide-react";
import { AppFooter } from "@/components/landing/app-footer";
import { AuthDialog } from "@/components/landing/auth-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { type AuthResponse, toUserSession } from "@/lib/api/auth";
import { writeStoredAuthSession } from "@/lib/auth-session";
import { showDreamAssistantNotification } from "@/store/assistant-notification-store";

const brand = {
  name: "DM StyleForge",
  tagline: "AI Fashion Platform",
};

const navItems = [
  { label: "趋势分析", href: "#trend" },
  { label: "AI 设计工具", href: "#tools" },
  { label: "案例方案", href: "#cases" },
  { label: "方案库", href: "/gallery" },
];

const capabilities = [
  {
    icon: LineChart,
    title: "趋势洞察",
    text: "把品类、人群、场景和风格转化为可决策的趋势热度、机会点与风险提示。",
  },
  {
    icon: PenTool,
    title: "文生款式",
    text: "用自然语言快速生成款式方向、结构细节、卖点组合和可复用 Prompt。",
  },
  {
    icon: Layers3,
    title: "系列延展",
    text: "基于已有款式扩展同系列方向，沉淀更完整的产品企划矩阵。",
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
    title: "虚拟上身",
    text: "承接方案 Prompt，后续可进入款式图、试穿图和电商展示图生成流程。",
  },
];

const cases = [
  {
    title: "轻机能防晒夹克",
    audience: "18-30 城市通勤女性",
    style: "轻户外 + 都市机能",
    score: 91,
    palette: ["#f5f7f2", "#a9bbcb", "#9eb6a3"],
    result: "短款微宽松防晒夹克，强化高领遮阳、背部透气与 UPF 卖点。",
  },
  {
    title: "低饱和周末户外",
    audience: "都市周末出行",
    style: "自然色 + 功能层次",
    score: 87,
    palette: ["#d8ded2", "#768b7a", "#27343b"],
    result: "生成同系列外套、半裙、背心方向，适合小批量测试。",
  },
  {
    title: "电商爆款企划",
    audience: "内容种草渠道",
    style: "甜酷街头 + 高频上新",
    score: 84,
    palette: ["#f3d7de", "#262a36", "#c7f06a"],
    result: "提炼主图卖点、差异化结构和快速上架的商品标题方向。",
  },
];

const trendBars = [42, 54, 62, 76, 88, 91, 86];
const selectedElements = ["冰川白主色", "高领遮阳帽", "背部隐形透气", "UPF 50+"];

export function LandingPage() {
  const router = useRouter();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  function enterGuestWorkbench() {
    const now = new Date().toISOString();
    writeStoredAuthSession({
      isAuthenticated: false,
      authMode: "guest",
      token: null,
      refreshToken: null,
      user: null,
      guestId: `guest-${Date.now()}`,
      guestStartedAt: now,
      guestLimits: { canSaveToCloud: false, maxTrendAnalyses: 3 },
      workspaceId: "guest-workspace",
      plan: "guest",
      permissions: {
        canSaveToCloud: false,
        canViewHistory: false,
        canExport: true,
        canGenerate: true,
      },
      preferences: {
        notificationSoundEnabled: true,
        voiceNotificationEnabled: true,
      },
    });
    setIsAuthDialogOpen(false);
    router.push("/trend-workbench");
  }

  function handleAuthenticated(auth: AuthResponse) {
    writeStoredAuthSession(toUserSession(auth));
    showDreamAssistantNotification({
      type: "success",
      title: "欢迎回来",
      message: "登录成功，我可以帮你继续生成设计方案啦。",
      actionText: "开始创作",
      returnText: "今天也来做爆款灵感吧。",
      voiceText: "欢迎回来，开始你的爆款创作吧",
      voiceType: "login",
    });
    setIsAuthDialogOpen(false);
    router.push("/trend-workbench");
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="grid-glow pointer-events-none absolute inset-0" />

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative flex size-10 items-center justify-center overflow-hidden rounded-lg border border-cyan-300/50 bg-gradient-to-br from-cyan-300/20 via-slate-950/50 to-violet-400/25 text-sm font-black tracking-wide text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.24)]">
            <span className="absolute inset-0 bg-[linear-gradient(135deg,transparent_12%,rgba(255,255,255,0.22)_45%,transparent_58%)] opacity-50" />
            <span className="relative">DM</span>
          </div>
          <div>
            <div className="text-sm font-semibold">{brand.name}</div>
            <div className="text-xs text-muted-foreground">{brand.tagline}</div>
          </div>
        </Link>

        <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
          {navItems.map((item) =>
            item.href.startsWith("#") ? (
              <a key={item.href} href={item.href} className="rounded-full border border-transparent px-3 py-1.5 transition hover:border-primary/30 hover:bg-primary/10 hover:text-foreground">
                {item.label}
              </a>
            ) : (
              <Link key={item.href} href={item.href} className="rounded-full border border-transparent px-3 py-1.5 transition hover:border-primary/30 hover:bg-primary/10 hover:text-foreground">
                {item.label}
              </Link>
            ),
          )}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setAuthMode("login");
              setIsAuthDialogOpen(true);
            }}
            className="group relative overflow-hidden bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500 text-slate-950 shadow-[0_0_28px_rgba(34,211,238,0.42)] transition hover:-translate-y-0.5 hover:scale-[1.03] hover:brightness-110"
          >
            <span className="absolute inset-y-0 -left-10 w-10 rotate-12 bg-white/35 blur-md transition-all duration-500 group-hover:left-full" />
            <Sparkles className="size-4" />
            进入工作台
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </nav>

      <AnimatePresence>
        {isAuthDialogOpen && (
          <AuthDialog
            brandName={brand.name}
            initialMode={authMode}
            onClose={() => setIsAuthDialogOpen(false)}
            onGuest={enterGuestWorkbench}
            onAuthenticated={handleAuthenticated}
          />
        )}
      </AnimatePresence>

      <section id="trend" className="relative z-10 mx-auto grid min-h-[calc(100vh-84px)] max-w-7xl items-center gap-10 px-5 pb-16 pt-8 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col gap-7">
          <Badge className="w-fit">趋势分析 + AI 设计工作台</Badge>
          <div className="space-y-5">
            <h1 className="max-w-4xl text-5xl font-semibold leading-tight md:text-7xl">StyleForge</h1>
            <p className="max-w-2xl text-xl font-medium leading-8 md:text-2xl">从趋势洞察到 AI 服装方案生成</p>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              面向设计师、电商卖家和品牌企划的 AI 服装趋势决策平台，把市场机会、设计要素和生成式 Prompt 收束到可执行的方案工作流。
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() => {
                setAuthMode("login");
                setIsAuthDialogOpen(true);
              }}
            >
              开始趋势分析
              <ArrowRight className="size-4" />
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#cases">查看案例方案</a>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/generate">进入 AI 设计工具</Link>
            </Button>
          </div>
          <div className="grid max-w-2xl grid-cols-3 gap-3">
            {[
              ["91", "趋势热度"],
              ["6", "设计维度"],
              ["3", "推荐方案"],
            ].map(([value, label]) => (
              <div key={label} className="glass-panel rounded-lg p-4">
                <div className="text-2xl font-semibold tabular-nums">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="glass-panel relative rounded-xl p-4">
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
                    <div key={index} className="flex-1 rounded-t bg-gradient-to-t from-cyan-400/35 to-violet-300" style={{ height: `${height}%` }} />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InfoTile icon={BarChart3} label="机会点" value="通勤 + 户外双场景" />
                <InfoTile icon={Palette} label="AI 推荐" value="轻量防晒机能风" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg border bg-card">
                <div className="relative h-64 bg-gradient-to-br from-cyan-50 via-white to-violet-100 dark:from-slate-900 dark:via-slate-950 dark:to-cyan-950">
                  <div className="absolute left-1/2 top-8 h-36 w-28 -translate-x-1/2 rounded-t-[42px] rounded-b-xl border border-cyan-500/20 bg-white/80 shadow-2xl shadow-cyan-500/15 dark:bg-slate-100/90" />
                  <div className="absolute left-[27%] top-20 h-28 w-12 -rotate-12 rounded-full border border-cyan-500/20 bg-white/70 dark:bg-slate-100/80" />
                  <div className="absolute right-[27%] top-20 h-28 w-12 rotate-12 rounded-full border border-cyan-500/20 bg-white/70 dark:bg-slate-100/80" />
                  <div className="absolute bottom-5 left-5 rounded-md border bg-background/80 px-3 py-2 text-xs shadow-lg">AI 款式预览</div>
                  <div className="absolute right-5 top-5 rounded-full border bg-background/80 px-3 py-1 text-xs text-primary">UPF 50+</div>
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
          </div>
        </motion.div>
      </section>

      <section id="tools" className="relative z-10 mx-auto max-w-7xl px-5 py-16">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge className="mb-4 w-fit">Core Capabilities</Badge>
            <h2 className="text-3xl font-semibold md:text-4xl">从趋势判断到设计生成的完整工具矩阵</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">不同角色都能找到对应的业务动作：分析趋势、生成款式、延展系列、沉淀方案。</p>
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
                    <span key={color} className="h-9 flex-1 rounded-md border" style={{ backgroundColor: color }} />
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

      <AppFooter />
    </main>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: typeof BarChart3; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card/75 p-4">
      <Icon className="mb-3 size-5 text-primary" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
