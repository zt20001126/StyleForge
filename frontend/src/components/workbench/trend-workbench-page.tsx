"use client";

import { Heart, Loader2, Square, WandSparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendAnalysisResultView } from "@/components/workbench/trend-analysis-result-view";
import { useWorkbenchStore } from "@/store/workbench-store";

export function TrendWorkbenchPage() {
  const {
    input,
    setInput,
    analysis,
    selection,
    myDesignPlan,
    loading,
    error,
    submitAnalysis,
    cancelAnalysis,
    toggleSelection,
    applyRecommendedDirection,
    saveCurrentPlan,
    exportJson,
    exportMarkdown,
  } = useWorkbenchStore();
  const trendResult = analysis?.result ?? null;

  return (
    <div className="mx-auto grid max-w-7xl gap-6 p-4 lg:grid-cols-[1fr_380px] lg:p-6">
      <div className="space-y-6">
        <section className="glass-panel rounded-xl p-5">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Trend Workbench</p>
              <h1 className="text-2xl font-semibold">爆款服装趋势分析工作台</h1>
            </div>
            <Button asChild variant="outline">
              <Link href="/trend-reports">查看历史趋势报告</Link>
            </Button>
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
            {loading && (
              <Button variant="outline" onClick={cancelAnalysis}>
                <Square className="size-4" />
                取消生成
              </Button>
            )}
          </div>
        </section>

        {loading && <GenerationStatus />}

        {trendResult && (
          <TrendAnalysisResultView
            result={trendResult}
            selection={selection}
            onToggleSelection={toggleSelection}
            onApplyDirection={applyRecommendedDirection}
            onExport={exportMarkdown}
          />
        )}
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
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

function GenerationStatus() {
  return (
    <section className="glass-panel rounded-xl border border-primary/20 p-4">
      <div className="flex items-start gap-3">
        <Loader2 className="mt-1 size-4 animate-spin text-primary" />
        <div className="space-y-1">
          <p className="font-medium">正在生成爆款趋势报告...</p>
          <p className="text-sm text-muted-foreground">预计需要等待一段时间，可点击取消停止生成。已生成的结果会继续保留。</p>
        </div>
      </div>
    </section>
  );
}
