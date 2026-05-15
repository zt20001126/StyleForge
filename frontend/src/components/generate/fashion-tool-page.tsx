"use client";

import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ImageIcon, Loader2, Sparkles, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FieldConfig =
  | {
      kind: "textarea";
      label: string;
      value: string;
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

export interface FashionToolPageConfig {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  primaryAction: string;
  resultTitle: string;
  resultPrefix: string;
  tags: string[];
  fields: FieldConfig[];
}

export function FashionToolPage({ config }: { config: FashionToolPageConfig }) {
  const [loading, setLoading] = useState(false);
  const [generatedAt, setGeneratedAt] = useState("Mock ready");
  const [values, setValues] = useState<Record<string, string | number>>(() =>
    Object.fromEntries(config.fields.map((field) => [field.label, field.value])),
  );

  const resultCount = Number(values["数量"] ?? values["生成数量"] ?? 4);
  const results = useMemo(
    () =>
      Array.from({ length: Math.min(6, Math.max(1, resultCount || 1)) }, (_, index) => ({
        id: `${config.resultPrefix}-${index + 1}`,
        title: `${config.resultPrefix} ${index + 1}`,
        palette:
          index % 3 === 0
            ? "from-cyan-300/30 via-slate-100/20 to-lime-300/20"
            : index % 3 === 1
              ? "from-violet-300/25 via-cyan-200/20 to-slate-500/20"
              : "from-rose-300/20 via-amber-200/20 to-cyan-300/20",
      })),
    [config.resultPrefix, resultCount],
  );

  const handleGenerate = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 650));
    setGeneratedAt("刚刚生成");
    setLoading(false);
  };

  const mainText = Object.values(values)
    .filter((value) => typeof value === "string" && value.trim())
    .slice(0, 2)
    .join(" / ");

  return (
    <div className="mx-auto grid max-w-7xl gap-6 p-4 lg:grid-cols-[420px_1fr] lg:p-6">
      <section className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">{config.eyebrow}</p>
          <h1 className="text-2xl font-semibold">{config.title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{config.description}</p>
        </div>

        <Card className="glass-panel">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                  <config.icon className="size-5" />
                </div>
                <CardTitle>生成参数</CardTitle>
              </div>
              <Badge>Mock</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {config.fields.map((field) => (
              <ToolField
                key={field.label}
                field={field}
                value={values[field.label]}
                onChange={(value) => setValues((current) => ({ ...current, [field.label]: value }))}
              />
            ))}

            <div className="flex flex-wrap gap-2">
              {config.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            <Button className="w-full" onClick={handleGenerate} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {config.primaryAction}
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Mock Results</p>
            <h2 className="text-xl font-semibold">{config.resultTitle}</h2>
          </div>
          <Badge variant="success">{generatedAt}</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((item, index) => (
            <Card key={item.id} className="glass-panel overflow-hidden">
              <div className={`aspect-[4/5] bg-gradient-to-br ${item.palette} p-4`}>
                <div className="flex h-full flex-col justify-between rounded-lg border border-white/15 bg-background/30 p-4 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <Badge variant="success">preview</Badge>
                    <ImageIcon className="size-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">StyleForge Mock {index + 1}</div>
                    <div className="mt-1 text-lg font-semibold">{item.title}</div>
                  </div>
                </div>
              </div>
              <CardContent className="space-y-3 pt-5">
                <div className="flex flex-wrap gap-2">
                  {config.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
                <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {mainText || "当前为前端占位预览，后续接入真实生成任务后显示生成结果。"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function ToolField({
  field,
  value,
  onChange,
}: {
  field: FieldConfig;
  value: string | number;
  onChange: (value: string | number) => void;
}) {
  if (field.kind === "textarea") {
    return (
      <label className="space-y-2">
        <span className="text-sm text-muted-foreground">{field.label}</span>
        <textarea
          className="min-h-32 w-full rounded-md border bg-background/60 px-3 py-3 text-sm leading-6 outline-none transition focus:border-primary"
          value={String(value)}
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
          className="h-10 w-full rounded-md border bg-background/60 px-3 text-sm outline-none focus:border-primary"
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
      <label className="space-y-2">
        <span className="text-sm text-muted-foreground">{field.label}</span>
        <input
          className="h-10 w-full rounded-md border bg-background/60 px-3 text-sm outline-none focus:border-primary"
          type="number"
          min={field.min}
          max={field.max}
          value={Number(value)}
          onChange={(event) => onChange(Math.min(field.max, Math.max(field.min, Number(event.target.value) || field.min)))}
        />
      </label>
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
