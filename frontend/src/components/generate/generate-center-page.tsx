import Link from "next/link";
import { ArrowRight, Clapperboard, ImageIcon, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const generationModes = [
  {
    href: "/generate/image",
    title: "AI 生图",
    description: "把设计方案 Prompt 转成款式图、细节图、电商主图方向。",
    icon: ImageIcon,
    badge: "Mock ready",
    stats: ["款式图", "细节图", "场景图"],
  },
  {
    href: "/generate/video",
    title: "AI 视频",
    description: "预留从方案到短视频分镜、镜头运动和生成任务的流程。",
    icon: Clapperboard,
    badge: "预留流程",
    stats: ["6s", "9:16", "产品镜头"],
  },
];

export function GenerateCenterPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 lg:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">AI Generation</p>
          <h1 className="text-2xl font-semibold">AI 生成</h1>
        </div>
        <Badge>Mock mode</Badge>
      </div>

      <section className="glass-panel rounded-xl p-5">
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Sparkles className="size-5" />
            </div>
            <h2 className="text-xl font-semibold">从趋势方案进入视觉生成</h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              当前先搭建 AI 生图和视频生成的页面入口与 Mock 交互，后续可以直接接入真实生成接口。
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {["Prompt 复用", "图片结果", "视频任务"].map((item) => (
              <div key={item} className="rounded-lg border bg-background/45 p-4">
                <div className="text-sm font-medium">{item}</div>
                <div className="mt-2 text-xs text-muted-foreground">Generation workflow</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {generationModes.map((mode) => (
          <Card key={mode.href} className="glass-panel">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                    <mode.icon className="size-5" />
                  </div>
                  <div>
                    <CardTitle>{mode.title}</CardTitle>
                    <div className="mt-1 text-sm text-muted-foreground">{mode.description}</div>
                  </div>
                </div>
                <Badge variant="secondary">{mode.badge}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {mode.stats.map((item) => (
                  <Badge key={item}>{item}</Badge>
                ))}
              </div>
              <Button asChild>
                <Link href={mode.href}>
                  进入{mode.title}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
