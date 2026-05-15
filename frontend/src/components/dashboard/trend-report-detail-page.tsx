"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { getTrendAnalysis } from "@/lib/api/trend";
import type { TrendAnalysisResponse } from "@/lib/types/trend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendAnalysisResultView } from "@/components/workbench/trend-analysis-result-view";

export function TrendReportDetailPage() {
  const params = useParams<{ analysis_id: string }>();
  const analysisId = params.analysis_id;
  const [analysis, setAnalysis] = useState<TrendAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function loadReport() {
      if (!analysisId) {
        setError("缺少趋势报告 ID");
        setLoading(false);
        return;
      }

      try {
        const report = await getTrendAnalysis(analysisId);
        if (!ignore) {
          setAnalysis(report);
          setError(null);
        }
      } catch (error) {
        if (!ignore) {
          setError(error instanceof Error ? error.message : "加载趋势报告失败");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadReport();
    return () => {
      ignore = true;
    };
  }, [analysisId]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 lg:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Trend Report Detail</p>
          <h1 className="text-2xl font-semibold">{analysis?.input.category ?? "历史趋势报告"}</h1>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline">
            <Link href="/trend-reports">
              <ArrowLeft className="size-4" />
              返回历史趋势报告
            </Link>
          </Button>
          <Button asChild>
            <Link href="/trend-workbench">
              <Plus className="size-4" />
              新建趋势分析
            </Link>
          </Button>
        </div>
      </div>

      {loading && <CardMessage message="正在加载趋势报告..." />}
      {error && <CardMessage tone="danger" message={error} />}
      {!loading && !error && analysis && <ReportContent analysis={analysis} />}
    </div>
  );
}

function ReportContent({ analysis }: { analysis: TrendAnalysisResponse }) {
  return (
    <div className="space-y-6">
      <Card className="glass-panel">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle>{analysis.input.category}</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                {analysis.input.target_user} / {analysis.input.scene} / {analysis.input.style}
              </p>
            </div>
            <StatusBadge status={analysis.status} />
          </div>
        </CardHeader>
        {analysis.error_message && <CardContent className="text-sm text-rose-300">{analysis.error_message}</CardContent>}
      </Card>

      {analysis.status === "failed" && (
        <Card className="glass-panel border-rose-400/30">
          <CardHeader>
            <CardTitle className="text-base">生成失败</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            {analysis.error_message ?? "这条趋势分析没有生成成功，因此没有可展示的趋势池和推荐方案。"}
          </CardContent>
        </Card>
      )}

      {analysis.status !== "failed" && analysis.result && <TrendAnalysisResultView result={analysis.result} showPromptDetails />}
      {analysis.status !== "failed" && !analysis.result && <CardMessage message="这条趋势报告暂时没有可展示的结果。" />}
    </div>
  );
}

function CardMessage({ message, tone = "default" }: { message: string; tone?: "default" | "danger" }) {
  return (
    <Card className="glass-panel">
      <CardContent className={tone === "danger" ? "px-5 py-8 text-sm text-rose-300" : "px-5 py-8 text-sm text-muted-foreground"}>
        {message}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: "success" | "processing" | "failed" }) {
  if (status === "success") return <Badge variant="success">success</Badge>;
  if (status === "processing") return <Badge variant="warning">processing</Badge>;
  return <Badge variant="danger">failed</Badge>;
}
