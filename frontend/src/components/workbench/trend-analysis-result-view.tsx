"use client";

import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ColorOption, RecommendedDirection, TrendAnalysisResult, TrendOption, UserDesignSelection } from "@/lib/types/trend";

const MAX_VISIBLE_OPTIONS = 4;

type SelectionField =
  | "selected_style_ids"
  | "selected_silhouette_ids"
  | "selected_structure_ids"
  | "selected_fabric_ids"
  | "selected_selling_point_ids";

interface TrendAnalysisResultViewProps {
  result: TrendAnalysisResult;
  selection?: UserDesignSelection | null;
  onToggleSelection?: (field: SelectionField | "selected_color_ids", id: string, max?: number) => void;
  onApplyDirection?: (direction: RecommendedDirection) => void;
  onExport?: () => void;
  showPromptDetails?: boolean;
}

export function TrendAnalysisResultView({
  result,
  selection,
  onToggleSelection,
  onApplyDirection,
  onExport,
  showPromptDetails = false,
}: TrendAnalysisResultViewProps) {
  return (
    <>
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="趋势摘要" value="6 组" text={result.summary} />
        <MetricCard label="机会" value="High" text={result.opportunity} tone="success" />
        <MetricCard label="风险" value="Watch" text={result.risk} tone="warning" />
      </section>

      <TrendPool result={result} selection={selection} onToggleSelection={onToggleSelection} />
      <RecommendedDirectionCards
        directions={result.recommended_directions}
        onApplyDirection={onApplyDirection}
        onExport={onExport}
        showPromptDetails={showPromptDetails}
      />

      {showPromptDetails && (
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-base">基础生成提示词</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border bg-background/50 p-3 text-sm leading-6 text-muted-foreground">{result.base_prompt}</div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function MetricCard({
  label,
  value,
  text,
  tone = "default",
}: {
  label: string;
  value: string;
  text: string;
  tone?: "default" | "success" | "warning";
}) {
  return (
    <Card className="glass-panel">
      <CardHeader>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Badge variant={tone === "success" ? "success" : tone === "warning" ? "warning" : "default"}>{value}</Badge>
        </div>
      </CardHeader>
      <CardContent className="text-sm leading-6 text-muted-foreground">{text}</CardContent>
    </Card>
  );
}

function TrendPool({
  result,
  selection,
  onToggleSelection,
}: {
  result: TrendAnalysisResult;
  selection?: UserDesignSelection | null;
  onToggleSelection?: (field: SelectionField | "selected_color_ids", id: string, max?: number) => void;
}) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Trend Pool</p>
        <h2 className="text-xl font-semibold">可视化趋势池</h2>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <TrendOptionSection
          title="风格方向"
          field="selected_style_ids"
          items={result.style_directions}
          max={1}
          selection={selection}
          onToggleSelection={onToggleSelection}
        />
        <TrendOptionSection
          title="版型廓形"
          field="selected_silhouette_ids"
          items={result.silhouettes}
          max={1}
          selection={selection}
          onToggleSelection={onToggleSelection}
        />
        <TrendOptionSection
          title="核心结构"
          field="selected_structure_ids"
          items={result.core_structures}
          max={4}
          selection={selection}
          onToggleSelection={onToggleSelection}
        />
        <ColorPaletteSection items={result.color_palette} selection={selection} onToggleSelection={onToggleSelection} />
        <TrendOptionSection
          title="面料趋势"
          field="selected_fabric_ids"
          items={result.fabric_trends}
          max={1}
          selection={selection}
          onToggleSelection={onToggleSelection}
        />
        <TrendOptionSection
          title="卖点表达"
          field="selected_selling_point_ids"
          items={result.selling_points}
          max={4}
          selection={selection}
          onToggleSelection={onToggleSelection}
        />
      </div>
    </section>
  );
}

function TrendOptionSection({
  title,
  field,
  items,
  max,
  selection,
  onToggleSelection,
}: {
  title: string;
  field: SelectionField;
  items: TrendOption[];
  max: number;
  selection?: UserDesignSelection | null;
  onToggleSelection?: (field: SelectionField, id: string, max?: number) => void;
}) {
  return (
    <Card className="glass-panel">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {items.slice(0, MAX_VISIBLE_OPTIONS).map((item) => {
          const selected = selection?.[field].includes(item.id);
          const interactive = Boolean(onToggleSelection);
          const Element = interactive ? "button" : "div";
          return (
            <Element
              key={item.id}
              type={interactive ? "button" : undefined}
              onClick={interactive ? () => onToggleSelection?.(field, item.id, max) : undefined}
              className={cn(
                "min-h-36 rounded-lg border bg-background/45 p-3 text-left transition",
                interactive && "hover:border-primary/60",
                selected && "border-primary bg-primary/10 shadow-lg shadow-cyan-500/10",
              )}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium leading-5">{item.name}</div>
                  <div className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{item.description}</div>
                </div>
                <Badge>{item.score}</Badge>
              </div>
              <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">{item.reason}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {item.tags?.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Element>
          );
        })}
      </CardContent>
    </Card>
  );
}

function ColorPaletteSection({
  items,
  selection,
  onToggleSelection,
}: {
  items: ColorOption[];
  selection?: UserDesignSelection | null;
  onToggleSelection?: (field: "selected_color_ids", id: string, max?: number) => void;
}) {
  return (
    <Card className="glass-panel">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">颜色矩阵</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {items.slice(0, MAX_VISIBLE_OPTIONS).map((item) => {
          const selected = selection?.selected_color_ids.includes(item.id);
          const interactive = Boolean(onToggleSelection);
          const Element = interactive ? "button" : "div";
          return (
            <Element
              key={item.id}
              type={interactive ? "button" : undefined}
              onClick={interactive ? () => onToggleSelection?.("selected_color_ids", item.id, 3) : undefined}
              className={cn(
                "rounded-lg border bg-background/45 p-3 text-left transition",
                interactive && "hover:border-primary/60",
                selected && "border-primary bg-primary/10",
              )}
            >
              <div className="mb-3 h-12 rounded-md border" style={{ backgroundColor: item.hex }} />
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium leading-5">{item.name}</span>
                <Badge>{item.score}</Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {item.role} / {item.hex}
              </p>
            </Element>
          );
        })}
      </CardContent>
    </Card>
  );
}

function RecommendedDirectionCards({
  directions,
  onApplyDirection,
  onExport,
  showPromptDetails,
}: {
  directions: RecommendedDirection[];
  onApplyDirection?: (direction: RecommendedDirection) => void;
  onExport?: () => void;
  showPromptDetails: boolean;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">AI Recommended Directions</p>
          <h2 className="text-xl font-semibold">推荐方案</h2>
        </div>
        {onExport && (
          <Button variant="outline" onClick={onExport}>
            <Download className="size-4" />
            导出趋势报告
          </Button>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {directions.slice(0, MAX_VISIBLE_OPTIONS).map((direction) => (
          <Card key={direction.id} className="glass-panel">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base leading-6">{direction.name}</CardTitle>
                <Badge variant={direction.cost_complexity === "high" ? "warning" : "success"}>{direction.popularity_score}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{direction.design_summary}</p>
              {showPromptDetails && <div className="rounded-md border bg-background/50 p-3 text-xs leading-5 text-muted-foreground">{direction.ai_prompt}</div>}
              {onApplyDirection && (
                <Button className="w-full" variant="outline" onClick={() => onApplyDirection(direction)}>
                  应用方案
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
