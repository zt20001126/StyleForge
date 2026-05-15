"use client";

import { create } from "zustand";
import { toast } from "sonner";
import { createTrendAnalysis, saveDesignPlan } from "@/lib/api/trend";
import { defaultInput, mockAnalysis } from "@/lib/mock-data";
import type {
  ColorOption,
  MyDesignPlan,
  RecommendedDirection,
  TrendAnalysisInput,
  TrendAnalysisResponse,
  TrendOption,
  UserDesignSelection,
} from "@/lib/types/trend";

type SelectionKey = keyof Omit<UserDesignSelection, "analysis_id">;

interface WorkbenchState {
  input: TrendAnalysisInput;
  analysis: TrendAnalysisResponse | null;
  selection: UserDesignSelection | null;
  myDesignPlan: MyDesignPlan | null;
  loading: boolean;
  error: string | null;
  setInput: (input: TrendAnalysisInput) => void;
  submitAnalysis: () => Promise<void>;
  toggleSelection: (key: SelectionKey, id: string, max?: number) => void;
  applyRecommendedDirection: (direction: RecommendedDirection) => void;
  saveCurrentPlan: () => Promise<void>;
  exportJson: () => void;
  exportMarkdown: () => void;
}

function topIds<T extends TrendOption | ColorOption>(items: T[], count: number) {
  return [...items].sort((a, b) => b.score - a.score).slice(0, count).map((item) => item.id);
}

function buildDefaultSelection(analysis: TrendAnalysisResponse): UserDesignSelection {
  const result = analysis.result;
  return {
    analysis_id: analysis.analysis_id,
    selected_style_ids: topIds(result.style_directions, 1),
    selected_silhouette_ids: topIds(result.silhouettes, 1),
    selected_structure_ids: topIds(result.core_structures, 2),
    selected_color_ids: topIds(result.color_palette, 2),
    selected_fabric_ids: topIds(result.fabric_trends, 1),
    selected_selling_point_ids: topIds(result.selling_points, 3),
  };
}

function getSelectedNames(analysis: TrendAnalysisResponse, selection: UserDesignSelection) {
  const result = analysis.result;
  const byId = new Map<string, { name: string; score: number }>();
  [
    ...result.style_directions,
    ...result.silhouettes,
    ...result.core_structures,
    ...result.color_palette,
    ...result.fabric_trends,
    ...result.selling_points,
  ].forEach((item) => byId.set(item.id, { name: item.name, score: item.score }));

  const ids = [
    ...selection.selected_style_ids,
    ...selection.selected_silhouette_ids,
    ...selection.selected_structure_ids,
    ...selection.selected_color_ids,
    ...selection.selected_fabric_ids,
    ...selection.selected_selling_point_ids,
  ];

  return ids.map((id) => byId.get(id)).filter(Boolean) as { name: string; score: number }[];
}

function buildPlan(analysis: TrendAnalysisResponse, selection: UserDesignSelection): MyDesignPlan {
  const selected = getSelectedNames(analysis, selection);
  const names = selected.map((item) => item.name);
  const popularity = Math.round(selected.reduce((sum, item) => sum + item.score, 0) / Math.max(1, selected.length));
  const direction = analysis.result.recommended_directions.find((item) =>
    item.style_ids.some((id) => selection.selected_style_ids.includes(id)),
  );

  return {
    analysis_id: analysis.analysis_id,
    design_summary: `${analysis.input.target_user} 的 ${analysis.input.category}，融合 ${names.slice(0, 5).join("、")} 等趋势要素。`,
    style_description: `${analysis.input.style} 方向，适用于 ${analysis.input.scene}，强调功能、造型和商业转化的平衡。`,
    recommended_direction: direction?.name ?? "自定义趋势组合方案",
    popularity_score: popularity,
    ai_prompt: `${analysis.result.base_prompt}，${names.join("，")}，高级成衣设计稿，科技感面料，清晰产品结构。`,
    selected_items: selection,
    warnings: popularity < 82 ? ["当前组合爆款指数偏保守，可增加高分卖点或更明确的主色。"] : [],
  };
}

function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export const useWorkbenchStore = create<WorkbenchState>((set, get) => {
  const initialSelection = buildDefaultSelection(mockAnalysis);
  return {
    input: defaultInput,
    analysis: mockAnalysis,
    selection: initialSelection,
    myDesignPlan: buildPlan(mockAnalysis, initialSelection),
    loading: false,
    error: null,
    setInput: (input) => set({ input }),
    submitAnalysis: async () => {
      const { input } = get();
      if (!input.category || !input.target_user || !input.scene || !input.style) {
        set({ error: "请完整填写品类、目标人群、场景和风格方向。" });
        toast.error("请完整填写分析输入");
        return;
      }

      set({ loading: true, error: null });
      try {
        const analysis = await createTrendAnalysis(input);
        const selection = buildDefaultSelection(analysis);
        set({
          analysis,
          selection,
          myDesignPlan: buildPlan(analysis, selection),
          loading: false,
        });
        toast.success("趋势分析已生成");
      } catch (error) {
        set({ loading: false, error: error instanceof Error ? error.message : "趋势分析失败" });
        toast.error("趋势分析失败");
      }
    },
    toggleSelection: (key, id, max = 4) => {
      const { analysis, selection } = get();
      if (!analysis || !selection) return;
      const current = selection[key];
      const exists = current.includes(id);
      const next = exists ? current.filter((item) => item !== id) : [...current.slice(Math.max(0, current.length - max + 1)), id];
      const nextSelection = { ...selection, [key]: next };
      set({ selection: nextSelection, myDesignPlan: buildPlan(analysis, nextSelection) });
    },
    applyRecommendedDirection: (direction) => {
      const { analysis } = get();
      if (!analysis) return;
      const selection: UserDesignSelection = {
        analysis_id: analysis.analysis_id,
        selected_style_ids: direction.style_ids,
        selected_silhouette_ids: direction.silhouette_ids,
        selected_structure_ids: direction.structure_ids,
        selected_color_ids: direction.color_ids,
        selected_fabric_ids: direction.fabric_ids,
        selected_selling_point_ids: direction.selling_point_ids,
      };
      set({ selection, myDesignPlan: buildPlan(analysis, selection) });
      toast.success(`已应用：${direction.name}`);
    },
    saveCurrentPlan: async () => {
      const plan = get().myDesignPlan;
      if (!plan) return;
      await saveDesignPlan({ ...plan, is_favorite: true });
      set({ myDesignPlan: { ...plan, is_favorite: true } });
      toast.success("方案已收藏");
    },
    exportJson: () => {
      const plan = get().myDesignPlan;
      if (!plan) return;
      downloadFile("styleforge-design-plan.json", JSON.stringify(plan, null, 2), "application/json");
      toast.success("JSON 已导出");
    },
    exportMarkdown: () => {
      const plan = get().myDesignPlan;
      if (!plan) return;
      downloadFile(
        "styleforge-design-plan.md",
        `# ${plan.recommended_direction}\n\n${plan.design_summary}\n\n爆款指数：${plan.popularity_score}\n\n## AI Prompt\n\n${plan.ai_prompt}\n`,
        "text/markdown",
      );
      toast.success("Markdown 已导出");
    },
  };
});
