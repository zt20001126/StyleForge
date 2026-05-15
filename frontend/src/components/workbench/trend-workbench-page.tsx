"use client";

import { useEffect, useState } from "react";
import { Heart, Loader2, Square, WandSparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendAnalysisResultView } from "@/components/workbench/trend-analysis-result-view";
import { useWorkbenchStore } from "@/store/workbench-store";

const inputFields = [
  {
    key: "category",
    label: "品类",
    examples: ["女款防晒衣", "男款冲锋衣", "通勤衬衫", "轻量风衣"],
  },
  {
    key: "target_user",
    label: "目标人群",
    examples: ["18-30岁城市通勤女性", "轻户外运动人群", "高客单价通勤女性", "周末短途旅行用户"],
  },
  {
    key: "scene",
    label: "使用场景",
    examples: ["通勤", "轻户外", "旅行 / 周末短途", "办公室到户外切换"],
  },
  {
    key: "style",
    label: "风格方向",
    examples: ["轻机能", "极简科技风", "高级运动风", "冷感未来风"],
  },
] as const;

type InputFieldKey = (typeof inputFields)[number]["key"];

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
  const [placeholderIndexes, setPlaceholderIndexes] = useState<Record<InputFieldKey, number>>({
    category: 0,
    target_user: 0,
    scene: 0,
    style: 0,
  });

  useEffect(() => {
    const placeholderTimer = window.setInterval(() => {
      setPlaceholderIndexes((currentIndexes) => ({
        category: (currentIndexes.category + 1) % inputFields[0].examples.length,
        target_user: (currentIndexes.target_user + 1) % inputFields[1].examples.length,
        scene: (currentIndexes.scene + 1) % inputFields[2].examples.length,
        style: (currentIndexes.style + 1) % inputFields[3].examples.length,
      }));
    }, 6000);

    return () => window.clearInterval(placeholderTimer);
  }, []);

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
            {inputFields.map((field) => (
              <label key={field.key} className="space-y-2">
                <span className="text-sm text-muted-foreground">{field.label}</span>
                <input
                  className="h-11 w-full rounded-md border bg-background/60 px-3 text-sm outline-none transition focus:border-primary"
                  value={input[field.key]}
                  placeholder={`例如：${field.examples[placeholderIndexes[field.key]]}`}
                  onChange={(event) => setInput({ ...input, [field.key]: event.target.value })}
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

      <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-auto">
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
