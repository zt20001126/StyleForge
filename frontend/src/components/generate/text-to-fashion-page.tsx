"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Download,
  ImageIcon,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Wand2,
  Library,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  generateTextToFashion,
  type TextToFashionGenerateResponse,
} from "@/lib/api/text-to-fashion";

type RecentTask = {
  id: string;
  title: string;
  thumbnail: string;
  createdAt: string;
};

type FashionCase = {
  id: string;
  title: string;
  prompt: string;
  image: string;
};

const modelOptions = ["FS1.0", "FS1.5", "FS2.0"];

const recentTasks: RecentTask[] = [
  {
    id: "recent-1",
    title: "亚麻衬衫裙",
    thumbnail: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=420&q=80",
    createdAt: "10:24",
  },
  {
    id: "recent-2",
    title: "冷感防晒外套",
    thumbnail: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=420&q=80",
    createdAt: "昨天",
  },
  {
    id: "recent-3",
    title: "复古通勤西装",
    thumbnail: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=420&q=80",
    createdAt: "周二",
  },
];

const fashionCases: FashionCase[] = [
  {
    id: "case-1",
    title: "晨雾通勤裙装",
    prompt: "浅雾灰 V 领中长款单排扣亚麻衬衫连衣裙，微宽松腰线，干净通勤风，高级成衣设计图。",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "case-2",
    title: "冷感运动外套",
    prompt: "女款冷感运动防晒外套，雾感蓝与青柠点缀，Boxy 廓形，弧形分割线，轻量透气面料。",
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "case-3",
    title: "复古包袋灵感",
    prompt: "黑棕复古皮革通勤手袋，硬挺方形轮廓，金属扣件，细腻纹理，高级商业摄影质感。",
    image: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "case-4",
    title: "旅行机能箱包",
    prompt: "橄榄绿色轻机能旅行箱，圆角结构，黑色护角，水边假日场景，年轻户外生活方式。",
    image: "https://images.unsplash.com/photo-1581553680321-4fffae59fccd?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "case-5",
    title: "针织帽款",
    prompt: "秋冬羊毛针织渔夫帽，米色拼接孔雀蓝织带，柔软肌理，极简产品图背景。",
    image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "case-6",
    title: "星纹毛线帽",
    prompt: "黑色羊毛针织冷帽，灰白星星提花图案，街头休闲风，柔和棚拍光线。",
    image: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "case-7",
    title: "童装叠穿套装",
    prompt: "青柠绿色童装马甲套装，圆点内搭，轻量棉服结构，可爱明亮的春季产品图。",
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "case-8",
    title: "学院连体衣",
    prompt: "奶油色衬衫搭配焦糖棕背带连体衣，卡通口袋，柔软童装面料，干净平铺图。",
    image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "case-9",
    title: "奶油骑士靴",
    prompt: "奶油白中筒骑士靴，细蝴蝶结绑带，圆润鞋头，少女复古风，暖色棚拍背景。",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "case-10",
    title: "雕塑感高跟鞋",
    prompt: "红棕色尖头穆勒高跟鞋，鳄鱼纹皮革，雕塑感鞋跟，艺术展陈产品摄影。",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "case-11",
    title: "海军领夹克",
    prompt: "深海军蓝短款夹克，米色大翻领，金色纽扣，学院复古运动风，正面款式图。",
    image: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "case-12",
    title: "解构风衣",
    prompt: "蓝白渐变解构风衣，透明覆层，腰带结构，未来感都市通勤风，高级设计稿。",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=80",
  },
];

export function TextToFashionPage() {
  const [model, setModel] = useState("FS1.0");
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(1);
  const [notice, setNotice] = useState("");
  const [status, setStatus] = useState<"reference" | "loading" | "result">("reference");
  const [result, setResult] = useState<TextToFashionGenerateResponse | null>(null);

  const selectedCase = useMemo(() => fashionCases[0], []);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const handleNewTask = () => {
    setPrompt("");
    setCount(1);
    setStatus("reference");
    setResult(null);
    showNotice("已新建任务");
  };

  const handleUseCase = (item: FashionCase) => {
    setPrompt(item.prompt);
    setStatus("reference");
    setResult(null);
    showNotice("已填入案例描述");
  };

  const handleGenerate = async () => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      showNotice("请输入文字描述");
      return;
    }

    setStatus("loading");
    setResult(null);

    const response = await generateTextToFashion({
      model,
      prompt: trimmedPrompt,
      count,
    });

    setResult(response);
    setStatus("result");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#eef3f9] text-slate-950 dark:bg-background dark:text-foreground">
      <div className="grid min-h-[calc(100vh-4rem)] border-l bg-white/35 dark:bg-transparent lg:grid-cols-[118px_326px_minmax(0,1fr)]">
        <RecentTaskPanel tasks={recentTasks} onNewTask={handleNewTask} />
        <TextToFashionFormPanel
          model={model}
          prompt={prompt}
          count={count}
          notice={notice}
          onModelChange={setModel}
          onPromptChange={setPrompt}
          onCountChange={setCount}
          onGenerate={handleGenerate}
          onFeatureSoon={() => showNotice("功能开发中")}
          loading={status === "loading"}
        />
        <main className="min-w-0 px-5 py-8 lg:px-8">
          {status === "reference" && (
            <FashionReferenceGallery selectedCase={selectedCase} cases={fashionCases} onUseCase={handleUseCase} />
          )}
          {status === "loading" && <FashionGenerateResult status="loading" />}
          {status === "result" && result && (
            <FashionGenerateResult status="result" result={result} onAction={showNotice} onRegenerate={handleGenerate} />
          )}
        </main>
      </div>
    </div>
  );
}

function RecentTaskPanel({ tasks, onNewTask }: { tasks: RecentTask[]; onNewTask: () => void }) {
  return (
    <aside className="border-r bg-white/80 px-4 py-5 dark:bg-card/50">
      <div className="text-center text-sm text-slate-500 dark:text-muted-foreground">最近任务</div>
      <button
        type="button"
        onClick={onNewTask}
        className="mt-5 flex h-16 w-full flex-col items-center justify-center gap-1 rounded-sm border border-slate-200 bg-white text-xs font-medium text-slate-900 shadow-sm transition hover:border-primary hover:text-primary dark:border-border dark:bg-background/50 dark:text-foreground"
      >
        <Plus className="size-4" />
        新建任务
      </button>

      <div className="mt-4 space-y-3">
        {tasks.map((task) => (
          <button
            key={task.id}
            type="button"
            className="group w-full overflow-hidden rounded-sm border border-transparent bg-white text-left shadow-sm transition hover:border-primary/50 dark:bg-background/40"
            title={`${task.title} ${task.createdAt}`}
          >
            <Image
              src={task.thumbnail}
              alt={task.title}
              width={120}
              height={150}
              className="aspect-[4/5] w-full object-cover"
            />
          </button>
        ))}
      </div>
    </aside>
  );
}

function TextToFashionFormPanel({
  model,
  prompt,
  count,
  notice,
  loading,
  onModelChange,
  onPromptChange,
  onCountChange,
  onGenerate,
  onFeatureSoon,
}: {
  model: string;
  prompt: string;
  count: number;
  notice: string;
  loading: boolean;
  onModelChange: (value: string) => void;
  onPromptChange: (value: string) => void;
  onCountChange: (value: number) => void;
  onGenerate: () => void;
  onFeatureSoon: () => void;
}) {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] flex-col border-r bg-white px-4 py-5 dark:bg-card/70">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-normal">以文生款</h1>
        <span className="flex size-5 items-center justify-center rounded-sm border border-primary/30 text-primary">
          <Sparkles className="size-3.5" />
        </span>
      </div>

      <div className="mt-6 space-y-5">
        <label className="space-y-2">
          <span className="text-sm text-slate-600 dark:text-muted-foreground">选择模型</span>
          <select
            value={model}
            onChange={(event) => onModelChange(event.target.value)}
            className="h-11 w-full rounded-sm border-0 bg-slate-50 px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40 dark:bg-background/60"
          >
            {modelOptions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm text-slate-600 dark:text-muted-foreground">文字描述</span>
          <textarea
            value={prompt}
            onChange={(event) => onPromptChange(event.target.value)}
            placeholder="输入款式描述来生成对应的款式（包含类目、风格、材质、设计细节等）如 V领白色中长款单排扣亚麻衬衫连衣裙"
            className="min-h-44 w-full resize-none rounded-sm border-0 bg-slate-50 px-4 py-4 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-primary/40 dark:bg-background/60 dark:placeholder:text-muted-foreground"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onFeatureSoon} className="rounded-sm">
            <Wand2 className="size-4" />
            优化文案
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={onFeatureSoon} className="rounded-sm">
            <ImageIcon className="size-4" />
            图片释义
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-muted-foreground">生成张数</span>
            <span className="font-medium">{count}</span>
          </div>
          <input
            type="range"
            min={1}
            max={4}
            step={1}
            value={count}
            onChange={(event) => onCountChange(Number(event.target.value))}
            className="w-full accent-primary"
          />
        </div>

        {notice && (
          <div className="rounded-sm border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">{notice}</div>
        )}
      </div>

      <div className="mt-auto border-t pt-5">
        <div className="mb-3 flex items-center gap-2 text-sm text-slate-600 dark:text-muted-foreground">
          点数消耗明细：
          <button type="button" className="font-medium text-slate-950 dark:text-foreground">
            {count}
          </button>
        </div>
        <Button type="button" size="lg" className="w-full rounded-full" onClick={onGenerate} disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          立即生成
        </Button>
      </div>
    </section>
  );
}

function FashionReferenceGallery({
  selectedCase,
  cases,
  onUseCase,
}: {
  selectedCase: FashionCase;
  cases: FashionCase[];
  onUseCase: (item: FashionCase) => void;
}) {
  return (
    <div className="mx-auto max-w-[1660px]">
      <div className="text-center text-lg text-slate-500 dark:text-muted-foreground">
        输入款式描述，快速生成服装灵感图
      </div>

      <section className="mx-auto mt-8 grid max-w-[560px] overflow-hidden rounded-md bg-slate-300 shadow-sm sm:grid-cols-2 dark:bg-muted">
        <div className="relative flex min-h-56 items-center justify-center p-8">
          <Badge className="absolute left-3 top-3 rounded-sm bg-slate-700 text-white">生成前</Badge>
          <p className="text-center text-sm leading-6 text-slate-700 dark:text-muted-foreground">「{selectedCase.prompt}」</p>
        </div>
        <div className="relative min-h-56">
          <Badge className="absolute left-3 top-3 z-10 rounded-sm bg-slate-700 text-white">生成后</Badge>
          <Image
            src={selectedCase.image}
            alt={selectedCase.title}
            width={360}
            height={360}
            className="h-full min-h-56 w-full object-cover"
          />
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-center text-lg font-medium text-slate-500 dark:text-muted-foreground">精选案例</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 min-[1800px]:grid-cols-6">
          {cases.map((item) => (
            <FashionCaseCard key={item.id} item={item} onUseCase={onUseCase} />
          ))}
        </div>
      </section>
    </div>
  );
}

function FashionCaseCard({ item, onUseCase }: { item: FashionCase; onUseCase: (item: FashionCase) => void }) {
  return (
    <article className="group relative overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-slate-200/80 dark:bg-card dark:ring-border">
      <Image
        src={item.image}
        alt={item.title}
        width={420}
        height={525}
        className="aspect-[4/5] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/55 to-transparent p-3">
        <div className="min-w-0 text-white">
          <div className="truncate text-sm font-medium">{item.title}</div>
        </div>
        <button
          type="button"
          onClick={() => onUseCase(item)}
          className="shrink-0 rounded-full bg-black/35 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-primary"
        >
          创同款 <ArrowRight className="inline size-3" />
        </button>
      </div>
    </article>
  );
}

function FashionGenerateResult({
  status,
  result,
  onAction,
  onRegenerate,
}: {
  status: "loading" | "result";
  result?: TextToFashionGenerateResponse;
  onAction?: (message: string) => void;
  onRegenerate?: () => void;
}) {
  if (status === "loading") {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-500 dark:text-muted-foreground">
          <Loader2 className="size-10 animate-spin text-primary" />
          <div className="text-lg">正在生成款式灵感图...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-muted-foreground">Mock Results</p>
          <h2 className="text-2xl font-semibold">生成结果</h2>
        </div>
        <Badge variant="default">task: {result?.taskId}</Badge>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {result?.images.map((image, index) => (
          <article key={image.id} className="overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-slate-200/80 dark:bg-card dark:ring-border">
            <Image
              src={image.url}
              alt={`生成结果 ${index + 1}`}
              width={520}
              height={650}
              className="aspect-[4/5] w-full object-cover"
            />
            <div className="space-y-4 p-4">
              <p className="line-clamp-2 min-h-11 text-sm leading-6 text-slate-600 dark:text-muted-foreground">{image.prompt}</p>
              <div className="grid grid-cols-3 gap-2">
                <ResultAction icon={Download} label="下载" onClick={() => onAction?.("下载功能开发中")} />
                <ResultAction icon={RefreshCw} label="再生成" onClick={onRegenerate} />
                <ResultAction icon={Library} label="加入方案库" onClick={() => onAction?.("加入方案库功能开发中")} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ResultAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-10 items-center justify-center gap-1 rounded-sm border bg-slate-50 px-2 text-xs font-medium text-slate-700 transition hover:border-primary hover:text-primary",
        "dark:bg-background/40 dark:text-muted-foreground",
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}
