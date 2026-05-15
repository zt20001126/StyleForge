"use client";

import Link from "next/link";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import { mockPlans } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function GalleryPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 lg:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">AI Result Gallery</p>
          <h1 className="text-2xl font-semibold">方案库</h1>
        </div>
        <Button asChild>
          <Link href="/trend-workbench">
            新建趋势分析 <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      {mockPlans.length === 0 ? (
        <Card className="glass-panel">
          <CardContent className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
            <Sparkles className="size-8 text-primary" />
            <h2 className="text-lg font-semibold">暂无方案</h2>
            <p className="max-w-md text-sm text-muted-foreground">完成一次趋势分析后，收藏的设计方案会出现在这里。</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mockPlans.map((plan, index) => (
            <Card key={plan.id} className="glass-panel overflow-hidden">
              <div className="h-44 bg-gradient-to-br from-cyan-300/25 via-violet-300/20 to-lime-300/10 p-4">
                <div className="flex h-full flex-col justify-between rounded-lg border border-white/15 bg-background/35 p-4 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <Badge variant="success">{plan.popularity_score}</Badge>
                    {plan.is_favorite && <Heart className="size-4 fill-rose-300 text-rose-300" />}
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">StyleForge Concept {index + 1}</div>
                    <div className="font-semibold">{plan.recommended_direction}</div>
                  </div>
                </div>
              </div>
              <CardHeader>
                <CardTitle>{plan.recommended_direction}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{plan.design_summary}</p>
                <Progress value={plan.popularity_score} />
                <div className="rounded-md border bg-background/50 p-3 text-xs leading-5 text-muted-foreground">
                  {plan.ai_prompt}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
