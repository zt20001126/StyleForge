"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Download,
  Library,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  UploadCloud,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type DesignTaskStatus = "idle" | "processing" | "success" | "failed" | "cancelled";

export type DesignTask = {
  taskId: string;
  toolType: string;
  prompt: string;
  inputImages: string[];
  model: string;
  params: Record<string, string | number>;
  status: DesignTaskStatus;
  resultImages: string[];
  createdAt: string;
  updatedAt: string;
};

export type ReferenceCase = {
  id: string;
  toolType: string;
  imageUrl: string;
  title: string;
  description: string;
  prompt?: string;
  params?: Record<string, string | number>;
};

type WorkbenchField =
  | {
      kind: "textarea";
      label: string;
      value: string;
      placeholder?: string;
    }
  | {
      kind: "select";
      label: string;
      value: string;
      options: string[];
    }
  | {
      kind: "number";
      label: string;
      value: number;
      min: number;
      max: number;
    }
  | {
      kind: "upload";
      label: string;
      value: string;
    };

export type FashionWorkbenchConfig = {
  toolType: string;
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  primaryAction: string;
  resultTitle: string;
  resultPrefix: string;
  emptyTitle: string;
  emptyDescription: string;
  fields: WorkbenchField[];
  tags: string[];
  modelOptions?: string[];
  defaultModel?: string;
  resultImages?: string[];
  referenceCases: ReferenceCase[];
  reuseActionText?: string;
};

const defaultModelOptions = ["FS1.0", "FS1.5", "FS2.0"];

const recentTasks = [
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

const fallbackImages = [
  "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
];

export function FashionWorkbenchPage({ config }: { config: FashionWorkbenchConfig }) {
  const modelOptions = config.modelOptions ?? defaultModelOptions;
  const [model, setModel] = useState(config.defaultModel ?? modelOptions[0]);
  const [notice, setNotice] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "result">("idle");
  const [task, setTask] = useState<DesignTask | null>(null);
  const [appliedCaseId, setAppliedCaseId] = useState<string | null>(null);
  const [isFormHighlighted, setIsFormHighlighted] = useState(false);
  const [values, setValues] = useState<Record<string, string | number>>(() =>
    Object.fromEntries(config.fields.map((field) => [field.label, field.value])),
  );

  const resultCount = Number(values["生成数量"] ?? values["生成张数"] ?? 4);
  const prompt = useMemo(
    () =>
      Object.entries(values)
        .filter(([, value]) => typeof value === "string" && value.trim())
        .map(([label, value]) => `${label}: ${value}`)
        .join("\n"),
    [values],
  );

  const results = task?.resultImages ?? [];

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  }

  function handleNewTask() {
    setModel(config.defaultModel ?? modelOptions[0]);
    setValues(Object.fromEntries(config.fields.map((field) => [field.label, field.value])));
    setStatus("idle");
    setTask(null);
    setAppliedCaseId(null);
    setIsFormHighlighted(false);
    showNotice("已新建任务");
  }

  function handleUseReferenceCase(item: ReferenceCase) {
    setValues((currentValues) => {
      const nextValues = { ...currentValues, ...item.params };
      if (item.prompt && "文字描述" in currentValues) {
        nextValues["文字描述"] = item.prompt;
      }
      return nextValues;
    });
    setStatus("idle");
    setTask(null);
    setAppliedCaseId(item.id);
    setIsFormHighlighted(true);
    showNotice("已填入，可继续修改");
    window.setTimeout(() => setAppliedCaseId(null), 1800);
    window.setTimeout(() => setIsFormHighlighted(false), 900);
  }

  async function handleGenerate() {
    setStatus("loading");
    setTask(null);
    await new Promise((resolve) => setTimeout(resolve, 760));

    const now = new Date().toISOString();
    const images = config.resultImages ?? fallbackImages;
    const count = Math.min(6, Math.max(1, resultCount || 1));

    setTask({
      taskId: `mock-${config.toolType}-${Date.now()}`,
      toolType: config.toolType,
      prompt,
      inputImages: [],
      model,
      params: values,
      status: "success",
      resultImages: Array.from({ length: count }, (_, index) => images[index % images.length]),
      createdAt: now,
      updatedAt: now,
    });
    setStatus("result");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground lg:h-[calc(100vh-4rem)] lg:min-h-0 lg:overflow-hidden">
      <div className="grid min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.12),transparent_28rem),radial-gradient(circle_at_92%_18%,rgba(167,139,250,0.12),transparent_26rem)] lg:h-full lg:min-h-0 lg:grid-cols-[96px_330px_minmax(0,1fr)]">
        <RecentTaskPanel onNewTask={handleNewTask} />
        <WorkbenchFormPanel
          config={config}
          model={model}
          modelOptions={modelOptions}
          notice={notice}
          values={values}
          loading={status === "loading"}
          highlighted={isFormHighlighted}
          onModelChange={setModel}
          onValueChange={(label, value) => setValues((current) => ({ ...current, [label]: value }))}
          onGenerate={handleGenerate}
        />
        <main className="min-w-0 px-4 py-6 sm:px-5 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:px-8 lg:py-8 lg:pb-28">
          {status === "idle" && (
            <ReferenceCaseGallery
              config={config}
              appliedCaseId={appliedCaseId}
              onUseCase={handleUseReferenceCase}
            />
          )}
          {status === "loading" && <WorkbenchLoadingState title={config.resultTitle} />}
          {status === "result" && task && (
            <WorkbenchResultGrid config={config} task={task} results={results} onAction={showNotice} onRegenerate={handleGenerate} />
          )}
        </main>
      </div>
    </div>
  );
}

function RecentTaskPanel({ onNewTask }: { onNewTask: () => void }) {
  return (
    <aside className="border-b bg-card/55 px-4 py-5 backdrop-blur-xl lg:h-full lg:min-h-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="text-center text-sm text-muted-foreground">最近任务</div>
      <button
        type="button"
        onClick={onNewTask}
        className="mt-5 flex h-16 w-full flex-col items-center justify-center gap-1 rounded-md border bg-background/60 text-xs font-medium text-foreground shadow-sm transition hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
      >
        <Plus className="size-4" />
        新建任务
      </button>

      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6 lg:block lg:space-y-3">
        {recentTasks.map((task) => (
          <button
            key={task.id}
            type="button"
            className="group w-full overflow-hidden rounded-lg border bg-card/70 text-left shadow-sm transition hover:border-primary/50 hover:shadow-[0_0_24px_rgba(34,211,238,0.16)]"
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

function WorkbenchFormPanel({
  config,
  model,
  modelOptions,
  notice,
  values,
  loading,
  highlighted,
  onModelChange,
  onValueChange,
  onGenerate,
}: {
  config: FashionWorkbenchConfig;
  model: string;
  modelOptions: string[];
  notice: string;
  values: Record<string, string | number>;
  loading: boolean;
  highlighted: boolean;
  onModelChange: (value: string) => void;
  onValueChange: (label: string, value: string | number) => void;
  onGenerate: () => void;
}) {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] flex-col border-b bg-card/70 backdrop-blur-xl transition lg:h-full lg:min-h-0 lg:overflow-hidden lg:border-b-0 lg:border-r data-[highlighted=true]:ring-2 data-[highlighted=true]:ring-primary/60" data-highlighted={highlighted}>
      <div className="shrink-0 px-4 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{config.eyebrow}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal">{config.title}</h1>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{config.description}</p>
          </div>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary shadow-[0_0_24px_rgba(34,211,238,0.16)]">
            <config.icon className="size-4" />
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pb-5">
        <label className="space-y-2">
          <span className="text-sm text-muted-foreground">选择模型</span>
          <select
            value={model}
            onChange={(event) => onModelChange(event.target.value)}
            className="h-11 w-full rounded-md border bg-background/60 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          >
            {modelOptions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

        {config.fields.map((field) => (
          <WorkbenchField
            key={field.label}
            field={field}
            value={values[field.label]}
            onChange={(value) => onValueChange(field.label, value)}
          />
        ))}

        <div className="flex flex-wrap gap-2">
          {config.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>

        {notice && (
          <div className="rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">{notice}</div>
        )}
      </div>

      <div className="shrink-0 border-t bg-card/90 px-4 py-4 backdrop-blur">
        <Button
          type="button"
          size="lg"
          className="w-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500 text-slate-950 shadow-[0_0_28px_rgba(34,211,238,0.28)] hover:brightness-110"
          onClick={onGenerate}
          disabled={loading}
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {config.primaryAction}
        </Button>
      </div>
    </section>
  );
}

function WorkbenchField({
  field,
  value,
  onChange,
}: {
  field: WorkbenchField;
  value: string | number;
  onChange: (value: string | number) => void;
}) {
  if (field.kind === "textarea") {
    return (
      <label className="space-y-2">
        <span className="text-sm text-muted-foreground">{field.label}</span>
        <textarea
          className="min-h-36 w-full resize-none rounded-md border bg-background/60 px-4 py-4 text-sm leading-6 outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
          value={String(value)}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    );
  }

  if (field.kind === "select") {
    return (
      <label className="space-y-2">
        <span className="text-sm text-muted-foreground">{field.label}</span>
        <select
          className="h-11 w-full rounded-md border bg-background/60 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
        >
          {field.options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
    );
  }

  if (field.kind === "number") {
    return (
      <div className="rounded-lg border bg-background/45 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{field.label}</span>
          <span className="font-medium">{Number(value)}</span>
        </div>
        <input
          type="range"
          min={field.min}
          max={field.max}
          step={1}
          value={Number(value)}
          onChange={(event) => onChange(Math.min(field.max, Math.max(field.min, Number(event.target.value) || field.min)))}
          className="mt-3 w-full accent-primary"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <span className="text-sm text-muted-foreground">{field.label}</span>
      <button
        type="button"
        className="flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-background/45 px-4 py-5 text-center text-sm text-muted-foreground transition hover:border-primary/60 hover:text-foreground"
      >
        <UploadCloud className="size-6 text-primary" />
        <span>{String(value)}</span>
      </button>
    </div>
  );
}

function ReferenceCaseGallery({
  config,
  appliedCaseId,
  onUseCase,
}: {
  config: FashionWorkbenchConfig;
  appliedCaseId: string | null;
  onUseCase: (item: ReferenceCase) => void;
}) {
  return (
    <div className="mx-auto max-w-[1660px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">参考案例</p>
          <h2 className="mt-1 text-2xl font-semibold">{config.emptyTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{config.emptyDescription}</p>
        </div>
        <Badge variant="secondary">可一键套用</Badge>
      </div>

      <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 min-[1800px]:grid-cols-5">
        {config.referenceCases.map((item) => (
          <ReferenceCaseCard
            key={item.id}
            item={item}
            actionText={config.reuseActionText ?? "套用方案"}
            applied={appliedCaseId === item.id}
            onUseCase={onUseCase}
          />
        ))}
      </section>
    </div>
  );
}

function ReferenceCaseCard({
  item,
  actionText,
  applied,
  onUseCase,
}: {
  item: ReferenceCase;
  actionText: string;
  applied: boolean;
  onUseCase: (item: ReferenceCase) => void;
}) {
  return (
    <article className="glass-panel group relative overflow-hidden rounded-lg">
      <Image
        src={item.imageUrl}
        alt={item.title}
        width={520}
        height={650}
        className="aspect-[4/5] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-3">
        <div className="min-w-0 text-white">
          <div className="truncate text-sm font-semibold">{item.title}</div>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/78">{item.description}</p>
        </div>
        <button
          type="button"
          onClick={() => onUseCase(item)}
          className="shrink-0 rounded-full bg-black/35 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-primary hover:text-primary-foreground"
        >
          {applied ? "已填入" : actionText}
        </button>
      </div>
    </article>
  );
}

function WorkbenchLoadingState({ title }: { title: string }) {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <div className="glass-panel flex min-w-72 flex-col items-center gap-4 rounded-xl p-8 text-muted-foreground">
        <Loader2 className="size-10 animate-spin text-primary" />
        <div className="text-lg">正在生成{title}...</div>
      </div>
    </div>
  );
}

function WorkbenchResultGrid({
  config,
  task,
  results,
  onAction,
  onRegenerate,
}: {
  config: FashionWorkbenchConfig;
  task: DesignTask;
  results: string[];
  onAction: (message: string) => void;
  onRegenerate: () => void;
}) {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">生成预览</p>
          <h2 className="text-2xl font-semibold">{config.resultTitle}</h2>
        </div>
        <Badge variant="default">task: {task.taskId}</Badge>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {results.map((image, index) => (
          <article key={`${task.taskId}-${image}-${index}`} className="glass-panel overflow-hidden rounded-lg">
            <Image
              src={image}
              alt={`${config.resultTitle} ${index + 1}`}
              width={520}
              height={650}
              className="aspect-[4/5] w-full object-cover"
            />
            <div className="space-y-4 p-4">
              <p className="line-clamp-2 min-h-11 text-sm leading-6 text-muted-foreground">
                {config.resultPrefix} {index + 1} / {task.model}
              </p>
              <div className="grid grid-cols-3 gap-2">
                <ResultAction icon={Download} label="下载" onClick={() => onAction("下载功能开发中")} />
                <ResultAction icon={RefreshCw} label="再生成" onClick={onRegenerate} />
                <ResultAction icon={Library} label="入库" onClick={() => onAction("加入方案库功能开发中")} />
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
      className="flex h-10 items-center justify-center gap-1 rounded-md border bg-background/60 px-2 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-primary"
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}
