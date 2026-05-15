"use client";

import { useMemo, useState } from "react";
import { Clapperboard, Loader2, Play, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { mockPlans } from "@/lib/mock-data";

const motionStyles = ["环绕展示", "模特走动", "细节推近", "电商转场"];
const durations = ["4s", "6s", "8s"];
const videoTasks = [
  { id: "mock-video-001", title: "冷感通勤主视觉", status: "success", progress: 100, ratio: "9:16" },
  { id: "mock-video-002", title: "结构细节推近", status: "processing", progress: 64, ratio: "1:1" },
  { id: "mock-video-003", title: "电商短视频开场", status: "queued", progress: 18, ratio: "4:5" },
];

export function VideoGenerationPage() {
  const defaultPrompt = mockPlans[0]?.ai_prompt ?? "女款城市轻户外防晒夹克，展示面料、廓形和高领防晒结构。";
  const [prompt, setPrompt] = useState(`${defaultPrompt} 镜头干净，高级电商短视频，突出服装结构和冷感面料。`);
  const [duration, setDuration] = useState("6s");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [motionStyle, setMotionStyle] = useState("环绕展示");
  const [loading, setLoading] = useState(false);
  const [createdTasks, setCreatedTasks] = useState(videoTasks);

  const taskList = useMemo(() => createdTasks, [createdTasks]);

  const handleCreateTask = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 650));
    setCreatedTasks((current) => [
      {
        id: `mock-video-${String(current.length + 1).padStart(3, "0")}`,
        title: motionStyle,
        status: "queued",
        progress: 12,
        ratio: aspectRatio,
      },
      ...current,
    ]);
    setLoading(false);
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 p-4 lg:grid-cols-[420px_1fr] lg:p-6">
      <section className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Video Generation</p>
          <h1 className="text-2xl font-semibold">AI 视频</h1>
        </div>

        <Card className="glass-panel">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>视频任务</CardTitle>
              <Badge>Mock</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="space-y-2">
              <span className="text-sm text-muted-foreground">视频 Prompt</span>
              <textarea
                className="min-h-40 w-full rounded-md border bg-background/60 px-3 py-3 text-sm leading-6 outline-none transition focus:border-primary"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-muted-foreground">时长</span>
                <select
                  className="h-10 w-full rounded-md border bg-background/60 px-3 text-sm outline-none focus:border-primary"
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                >
                  {durations.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm text-muted-foreground">画幅</span>
                <select
                  className="h-10 w-full rounded-md border bg-background/60 px-3 text-sm outline-none focus:border-primary"
                  value={aspectRatio}
                  onChange={(event) => setAspectRatio(event.target.value)}
                >
                  {["9:16", "4:5", "1:1", "16:9"].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">镜头运动</span>
              <div className="grid grid-cols-2 gap-2">
                {motionStyles.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMotionStyle(item)}
                    className={`rounded-md border px-3 py-2 text-sm transition hover:border-primary/60 ${
                      motionStyle === item ? "border-primary bg-primary/10 text-primary" : "bg-background/45 text-muted-foreground"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-dashed bg-background/35 p-4 text-sm text-muted-foreground">
              参考图上传入口预留。当前阶段只创建 Mock 视频任务，不上传文件。
            </div>

            <Button className="w-full" onClick={handleCreateTask} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              创建视频任务
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Mock Tasks</p>
            <h2 className="text-xl font-semibold">视频任务列表</h2>
          </div>
          <Badge variant="secondary">{duration}</Badge>
        </div>

        <div className="grid gap-4">
          {taskList.map((task) => (
            <Card key={task.id} className="glass-panel">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                      <Clapperboard className="size-5" />
                    </div>
                    <div>
                      <CardTitle>{task.title}</CardTitle>
                      <div className="mt-1 text-xs text-muted-foreground">{task.id}</div>
                    </div>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                  <div className="flex aspect-video items-center justify-center rounded-lg border bg-gradient-to-br from-cyan-300/20 via-violet-300/15 to-lime-300/10">
                    <Play className="size-8 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge>{task.ratio}</Badge>
                      <Badge variant="secondary">{motionStyle}</Badge>
                    </div>
                    <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{prompt}</p>
                    <Progress value={task.progress} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "success") return <Badge variant="success">success</Badge>;
  if (status === "processing") return <Badge variant="warning">processing</Badge>;
  if (status === "failed") return <Badge variant="danger">failed</Badge>;
  return <Badge variant="secondary">queued</Badge>;
}
