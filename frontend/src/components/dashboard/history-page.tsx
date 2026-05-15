"use client";

import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { mockAnalysis } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const rows = [
  mockAnalysis,
  {
    ...mockAnalysis,
    analysis_id: "mock-analysis-styleforge-002",
    status: "processing" as const,
    input: {
      category: "瑜伽通勤套装",
      target_user: "25-35 岁新中产女性",
      scene: "健身 / 通勤 / 旅行",
      style: "松弛感运动、高级基础",
    },
    created_at: "2026-05-14T21:48:00+08:00",
  },
  {
    ...mockAnalysis,
    analysis_id: "mock-analysis-styleforge-003",
    status: "failed" as const,
    input: {
      category: "男款机能衬衫",
      target_user: "都市户外男性",
      scene: "通勤 / 出差",
      style: "低调机能",
    },
    created_at: "2026-05-14T20:10:00+08:00",
  },
];

export function HistoryPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 lg:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Trend Analysis History</p>
          <h1 className="text-2xl font-semibold">分析历史</h1>
        </div>
        <Button asChild>
          <Link href="/trend-workbench">
            回到工作台 <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <Card className="glass-panel">
        <CardContent className="p-0">
          <div className="hidden grid-cols-[1.2fr_1fr_1fr_1fr_120px] border-b px-5 py-3 text-xs text-muted-foreground md:grid">
            <span>品类</span>
            <span>目标人群</span>
            <span>场景</span>
            <span>风格</span>
            <span>状态</span>
          </div>
          <div className="divide-y">
            {rows.map((row) => (
              <div key={row.analysis_id} className="grid gap-3 px-5 py-4 md:grid-cols-[1.2fr_1fr_1fr_1fr_120px] md:items-center">
                <div>
                  <div className="font-medium">{row.input.category}</div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 className="size-3" />
                    {row.created_at}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">{row.input.target_user}</div>
                <div className="text-sm text-muted-foreground">{row.input.scene}</div>
                <div className="text-sm text-muted-foreground">{row.input.style}</div>
                <StatusBadge status={row.status} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: "success" | "processing" | "failed" }) {
  if (status === "success") return <Badge variant="success">success</Badge>;
  if (status === "processing") return <Badge variant="warning">processing</Badge>;
  return <Badge variant="danger">failed</Badge>;
}
