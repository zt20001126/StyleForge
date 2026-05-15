"use client";

import { useMemo, useState } from "react";
import { Download, ImageIcon, Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockPlans } from "@/lib/mock-data";

const aspectRatios = ["1:1", "3:4", "4:5", "9:16"];
const styles = ["电商主图", "款式设计图", "细节特写", "场景大片"];

export function ImageGenerationPage() {
  const defaultPrompt = mockPlans[0]?.ai_prompt ?? "女款城市轻户外防晒夹克，短款微宽松，高级冷感科技风。";
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [negativePrompt, setNegativePrompt] = useState("低清晰度，变形人体，多余手指，廉价面料质感，杂乱背景");
  const [aspectRatio, setAspectRatio] = useState("4:5");
  const [style, setStyle] = useState("款式设计图");
  const [count, setCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [generatedAt, setGeneratedAt] = useState("刚刚");

  const results = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        id: `mock-image-${index + 1}`,
        title: `${style} ${index + 1}`,
        palette: index % 2 === 0 ? "from-cyan-300/30 via-slate-100/20 to-lime-300/20" : "from-violet-300/25 via-cyan-200/20 to-slate-500/20",
      })),
    [count, style],
  );

  const handleGenerate = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 650));
    setGeneratedAt("刚刚");
    setLoading(false);
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 p-4 lg:grid-cols-[420px_1fr] lg:p-6">
      <section className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Image Generation</p>
          <h1 className="text-2xl font-semibold">AI 生图</h1>
        </div>

        <Card className="glass-panel">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>生成参数</CardTitle>
              <Badge>Mock</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="space-y-2">
              <span className="text-sm text-muted-foreground">正向 Prompt</span>
              <textarea
                className="min-h-36 w-full rounded-md border bg-background/60 px-3 py-3 text-sm leading-6 outline-none transition focus:border-primary"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-muted-foreground">负向 Prompt</span>
              <textarea
                className="min-h-24 w-full rounded-md border bg-background/60 px-3 py-3 text-sm leading-6 outline-none transition focus:border-primary"
                value={negativePrompt}
                onChange={(event) => setNegativePrompt(event.target.value)}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-muted-foreground">画幅</span>
                <select
                  className="h-10 w-full rounded-md border bg-background/60 px-3 text-sm outline-none focus:border-primary"
                  value={aspectRatio}
                  onChange={(event) => setAspectRatio(event.target.value)}
                >
                  {aspectRatios.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm text-muted-foreground">数量</span>
                <input
                  className="h-10 w-full rounded-md border bg-background/60 px-3 text-sm outline-none focus:border-primary"
                  type="number"
                  min={1}
                  max={6}
                  value={count}
                  onChange={(event) => setCount(Math.min(6, Math.max(1, Number(event.target.value) || 1)))}
                />
              </label>
            </div>

            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">生成类型</span>
              <div className="grid grid-cols-2 gap-2">
                {styles.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setStyle(item)}
                    className={`rounded-md border px-3 py-2 text-sm transition hover:border-primary/60 ${
                      style === item ? "border-primary bg-primary/10 text-primary" : "bg-background/45 text-muted-foreground"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <Button className="w-full" onClick={handleGenerate} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              生成图片
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Mock Results</p>
            <h2 className="text-xl font-semibold">图片结果</h2>
          </div>
          <Badge variant="success">{generatedAt}</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((item, index) => (
            <Card key={item.id} className="glass-panel overflow-hidden">
              <div className={`aspect-[4/5] bg-gradient-to-br ${item.palette} p-4`}>
                <div className="flex h-full flex-col justify-between rounded-lg border border-white/15 bg-background/30 p-4 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <Badge variant="success">success</Badge>
                    <ImageIcon className="size-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">StyleForge Image {index + 1}</div>
                    <div className="mt-1 text-lg font-semibold">{item.title}</div>
                  </div>
                </div>
              </div>
              <CardContent className="space-y-3 pt-5">
                <div className="flex flex-wrap gap-2">
                  <Badge>{aspectRatio}</Badge>
                  <Badge variant="secondary">{style}</Badge>
                </div>
                <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{prompt}</p>
                <Button variant="outline" className="w-full">
                  <Download className="size-4" />
                  下载占位
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
