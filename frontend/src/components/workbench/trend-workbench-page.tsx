"use client";

import { useSyncExternalStore } from "react";
import { Download, Heart, Loader2, WandSparkles } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useWorkbenchStore } from "@/store/workbench-store";
import type { ColorOption, RecommendedDirection, TrendOption } from "@/lib/types/trend";

const chartData = [
  { month: "Jan", value: 42 },
  { month: "Feb", value: 54 },
  { month: "Mar", value: 63 },
  { month: "Apr", value: 76 },
  { month: "May", value: 91 },
  { month: "Jun", value: 86 },
];

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function TrendWorkbenchPage() {
  const { input, setInput, analysis, myDesignPlan, loading, error, submitAnalysis, saveCurrentPlan, exportJson, exportMarkdown } =
    useWorkbenchStore();
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  return (
    <div className="mx-auto grid max-w-7xl gap-6 p-4 lg:grid-cols-[1fr_380px] lg:p-6">
      <div className="space-y-6">
        <section className="glass-panel rounded-xl p-5">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Trend Workbench</p>
              <h1 className="text-2xl font-semibold">AI 爆款趋势分析工作台</h1>
            </div>
            <Badge>Next.js + shadcn/ui style</Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["category", "品类", "例如：女款防晒夹克"],
              ["target_user", "目标人群", "例如：18-30 岁城市通勤女性"],
              ["scene", "使用场景", "例如：通勤 / 轻户外"],
              ["style", "风格方向", "例如：轻机能、高级运动"],
            ].map(([key, label, placeholder]) => (
              <label key={key} className="space-y-2">
                <span className="text-sm text-muted-foreground">{label}</span>
                <input
                  className="h-11 w-full rounded-md border bg-background/60 px-3 text-sm outline-none transition focus:border-primary"
                  value={input[key as keyof typeof input]}
                  placeholder={placeholder}
                  onChange={(event) => setInput({ ...input, [key]: event.target.value })}
                />
              </label>
            ))}
          </div>
          {error && <div className="mt-4 rounded-md border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</div>}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button onClick={submitAnalysis} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <WandSparkles className="size-4" />}
              生成趋势分析
            </Button>
            <Button variant="outline" onClick={exportMarkdown} disabled={!myDesignPlan}>
              <Download className="size-4" />
              导出 Markdown
            </Button>
          </div>
        </section>

        {analysis && (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <MetricCard label="趋势摘要" value="6 维" text={analysis.result.summary} />
              <MetricCard label="机会" value="High" text={analysis.result.opportunity} tone="success" />
              <MetricCard label="风险" value="Watch" text={analysis.result.risk} tone="warning" />
            </section>

            <section className="grid gap-4 lg:grid-cols-5">
              <Card className="glass-panel lg:col-span-3">
                <CardHeader>
                  <CardTitle>趋势热度走势</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="trend" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.55} />
                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.18)" />
                        <XAxis dataKey="month" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid rgba(148,163,184,.24)" }} />
                        <Area type="monotone" dataKey="value" stroke="#22d3ee" fill="url(#trend)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full rounded-lg bg-muted/40" />
                  )}
                </CardContent>
              </Card>
              <Card className="glass-panel lg:col-span-2">
                <CardHeader>
                  <CardTitle>卖点评分</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analysis.result.selling_points.map((item) => ({ name: item.name, score: item.score }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.18)" />
                        <XAxis dataKey="name" hide />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid rgba(148,163,184,.24)" }} />
                        <Bar dataKey="score" fill="#a78bfa" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full rounded-lg bg-muted/40" />
                  )}
                </CardContent>
              </Card>
            </section>

            <TrendPool />
            <RecommendedDirectionCards directions={analysis.result.recommended_directions} />
          </>
        )}
      </div>

      <aside className="lg:sticky lg:top-22 lg:self-start">
        <Card className="glass-panel">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">My Design Plan</p>
                <CardTitle>{myDesignPlan?.recommended_direction ?? "等待生成方案"}</CardTitle>
              </div>
              <Badge variant="success">{myDesignPlan?.popularity_score ?? 0}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {myDesignPlan ? (
              <>
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">爆款指数</span>
                    <span className="font-medium tabular-nums">{myDesignPlan.popularity_score}/100</span>
                  </div>
                  <Progress value={myDesignPlan.popularity_score} />
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{myDesignPlan.design_summary}</p>
                <div className="rounded-lg border bg-background/50 p-3">
                  <div className="mb-2 text-xs uppercase text-muted-foreground">AI Prompt</div>
                  <p className="text-sm leading-6">{myDesignPlan.ai_prompt}</p>
                </div>
                {myDesignPlan.warnings.length > 0 && (
                  <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">
                    {myDesignPlan.warnings.join(" ")}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={saveCurrentPlan}>
                    <Heart className="size-4" />
                    收藏
                  </Button>
                  <Button variant="outline" onClick={exportJson}>
                    JSON
                  </Button>
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">提交分析后生成设计方案。</div>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function MetricCard({ label, value, text, tone = "default" }: { label: string; value: string; text: string; tone?: "default" | "success" | "warning" }) {
  return (
    <Card className="glass-panel">
      <CardHeader>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Badge variant={tone === "success" ? "success" : tone === "warning" ? "warning" : "default"}>{value}</Badge>
        </div>
      </CardHeader>
      <CardContent className="text-sm leading-6 text-muted-foreground">{text}</CardContent>
    </Card>
  );
}

function TrendPool() {
  const { analysis } = useWorkbenchStore();
  if (!analysis) return null;
  const result = analysis.result;

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Trend Pool</p>
        <h2 className="text-xl font-semibold">可视化趋势池</h2>
      </div>
      <TrendOptionSection title="风格方向" field="selected_style_ids" items={result.style_directions} max={2} />
      <TrendOptionSection title="版型廓形" field="selected_silhouette_ids" items={result.silhouettes} max={2} />
      <TrendOptionSection title="核心结构" field="selected_structure_ids" items={result.core_structures} max={4} />
      <ColorPaletteSection items={result.color_palette} />
      <TrendOptionSection title="面料趋势" field="selected_fabric_ids" items={result.fabric_trends} max={3} />
      <TrendOptionSection title="卖点表达" field="selected_selling_point_ids" items={result.selling_points} max={4} />
    </section>
  );
}

function TrendOptionSection({
  title,
  field,
  items,
  max,
}: {
  title: string;
  field:
    | "selected_style_ids"
    | "selected_silhouette_ids"
    | "selected_structure_ids"
    | "selected_fabric_ids"
    | "selected_selling_point_ids";
  items: TrendOption[];
  max: number;
}) {
  const { selection, toggleSelection } = useWorkbenchStore();
  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {items.map((item) => {
          const selected = selection?.[field].includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleSelection(field, item.id, max)}
              className={cn(
                "rounded-lg border bg-background/45 p-4 text-left transition hover:border-primary/60",
                selected && "border-primary bg-primary/10 shadow-lg shadow-cyan-500/10",
              )}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{item.description}</div>
                </div>
                <Badge>{item.score}</Badge>
              </div>
              <p className="mb-3 text-xs leading-5 text-muted-foreground">{item.reason}</p>
              <div className="flex flex-wrap gap-2">
                {item.tags?.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function ColorPaletteSection({ items }: { items: ColorOption[] }) {
  const { selection, toggleSelection } = useWorkbenchStore();
  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle>颜色矩阵</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const selected = selection?.selected_color_ids.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleSelection("selected_color_ids", item.id, 3)}
              className={cn(
                "rounded-lg border bg-background/45 p-3 text-left transition hover:border-primary/60",
                selected && "border-primary bg-primary/10",
              )}
            >
              <div className="mb-3 h-16 rounded-md border" style={{ backgroundColor: item.hex }} />
              <div className="flex items-center justify-between">
                <span className="font-medium">{item.name}</span>
                <Badge>{item.score}</Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{item.role} / {item.hex}</p>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function RecommendedDirectionCards({ directions }: { directions: RecommendedDirection[] }) {
  const { applyRecommendedDirection } = useWorkbenchStore();
  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">AI Recommended Directions</p>
        <h2 className="text-xl font-semibold">推荐方案</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {directions.map((direction) => (
          <Card key={direction.id} className="glass-panel">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="leading-6">{direction.name}</CardTitle>
                <Badge variant={direction.cost_complexity === "high" ? "warning" : "success"}>{direction.popularity_score}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">{direction.design_summary}</p>
              <Button className="w-full" variant="outline" onClick={() => applyRecommendedDirection(direction)}>
                应用方案
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
