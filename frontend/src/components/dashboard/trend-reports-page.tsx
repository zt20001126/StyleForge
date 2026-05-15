"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock3, FileText } from "lucide-react";
import { listTrendAnalyses } from "@/lib/api/trend";
import type { TrendAnalysisSummary } from "@/lib/types/trend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function TrendReportsPage() {
  const [rows, setRows] = useState<TrendAnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function loadReports() {
      try {
        const reports = await listTrendAnalyses();
        if (!ignore) {
          setRows(reports);
          setError(null);
        }
      } catch (error) {
        if (!ignore) {
          setError(error instanceof Error ? error.message : "加载历史趋势报告失败");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadReports();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 lg:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Trend Reports</p>
          <h1 className="text-2xl font-semibold">历史趋势报告</h1>
        </div>
        <Button asChild>
          <Link href="/trend-workbench">
            新建趋势分析 <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <Card className="glass-panel">
        <CardContent className="p-0">
          <div className="hidden grid-cols-[1.1fr_1fr_1fr_1fr_96px_112px] border-b px-5 py-3 text-xs text-muted-foreground md:grid">
            <span>品类</span>
            <span>目标人群</span>
            <span>场景</span>
            <span>风格方向</span>
            <span>状态</span>
            <span>操作</span>
          </div>
          {error && <div className="border-b px-5 py-3 text-sm text-rose-300">{error}</div>}
          {loading && <div className="px-5 py-8 text-sm text-muted-foreground">加载中...</div>}
          {!loading && !error && rows.length === 0 && <EmptyReports />}
          <div className="divide-y">
            {rows.map((row) => (
              <div key={row.analysis_id} className="grid gap-3 px-5 py-4 md:grid-cols-[1.1fr_1fr_1fr_1fr_96px_112px] md:items-center">
                <div>
                  <div className="font-medium">{row.category}</div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 className="size-3" />
                    {formatDate(row.created_at)}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">{row.target_user}</div>
                <div className="text-sm text-muted-foreground">{row.scene}</div>
                <div className="text-sm text-muted-foreground">{row.style}</div>
                <StatusBadge status={row.status} />
                <Button asChild size="sm" variant="outline">
                  <Link href={`/trend-reports/${row.analysis_id}`}>查看报告</Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyReports() {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-5 py-8 text-center">
      <FileText className="size-8 text-primary" />
      <h2 className="text-lg font-semibold">暂无历史趋势报告</h2>
      <p className="max-w-md text-sm text-muted-foreground">完成一次趋势分析后，数据库中的报告记录会出现在这里。</p>
    </div>
  );
}

function StatusBadge({ status }: { status: "success" | "processing" | "failed" }) {
  if (status === "success") return <Badge variant="success">success</Badge>;
  if (status === "processing") return <Badge variant="warning">processing</Badge>;
  return <Badge variant="danger">failed</Badge>;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", { hour12: false });
}
