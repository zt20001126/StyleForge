"use client";

import { create } from "zustand";
import { createTrendAnalysis, saveDesignPlan } from "@/lib/api/trend";
import { showDreamAssistantNotification } from "@/store/assistant-notification-store";
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

const emptyInput: TrendAnalysisInput = {
  category: "",
  target_user: "",
  scene: "",
  style: "",
};

interface WorkbenchState {
  input: TrendAnalysisInput;
  analysis: TrendAnalysisResponse | null;
  selection: UserDesignSelection | null;
  myDesignPlan: MyDesignPlan | null;
  loading: boolean;
  error: string | null;
  abortController: AbortController | null;
  setInput: (input: TrendAnalysisInput) => void;
  submitAnalysis: () => Promise<void>;
  cancelAnalysis: () => void;
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
  if (!result) {
    throw new Error("Trend analysis result is not available.");
  }
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
  if (!result) {
    throw new Error("Trend analysis result is not available.");
  }
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
  const result = analysis.result;
  if (!result) {
    throw new Error("Trend analysis result is not available.");
  }
  const selected = getSelectedNames(analysis, selection);
  const names = selected.map((item) => item.name);
  const popularity = Math.round(selected.reduce((sum, item) => sum + item.score, 0) / Math.max(1, selected.length));
  const direction = result.recommended_directions.find((item) =>
    item.style_ids.some((id) => selection.selected_style_ids.includes(id)),
  );

  return {
    analysis_id: analysis.analysis_id,
    design_summary: `${analysis.input.target_user} 的 ${analysis.input.category}，融合 ${names.slice(0, 5).join("、")} 等趋势要素。`,
    style_description: `${analysis.input.style} 方向，适用于 ${analysis.input.scene}，强调功能、造型和商业转化的平衡。`,
    recommended_direction: direction?.name ?? "自定义趋势组合方案",
    popularity_score: popularity,
    ai_prompt: `${result.base_prompt}，${names.join("，")}，高级成衣设计稿，科技感面料，清晰产品结构。`,
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
  return {
    input: emptyInput,
    analysis: null,
    selection: null,
    myDesignPlan: null,
    loading: false,
    error: null,
    abortController: null,
    setInput: (input) => set({ input }),
    submitAnalysis: async () => {
      const { input, abortController } = get();
      if (!input.category || !input.target_user || !input.scene || !input.style) {
        set({ error: "请完整填写品类、目标人群、场景和风格方向。" });
        showDreamAssistantNotification({
          type: "warning",
          title: "输入内容还不完整",
          message: "请先补齐品类、目标人群、使用场景和风格方向，我再帮你生成爆款趋势报告。",
          actionText: "我去补充",
          returnText: "补齐信息后再叫我，我继续待命～",
        });
        return;
      }

      abortController?.abort();
      const nextAbortController = new AbortController();
      set({ loading: true, error: null, abortController: nextAbortController });
      showDreamAssistantNotification({
        type: "info",
        title: "趋势分析任务已开始",
        message: "我正在整理爆款趋势、设计方向和推荐方案，生成完成后会第一时间提醒你。",
        actionText: "知道了",
        returnText: "我先回右下角，生成完再来提醒你～",
      });
      try {
        const analysis = await createTrendAnalysis(input, nextAbortController.signal);
        const selection = buildDefaultSelection(analysis);
        set({
          analysis,
          selection,
          myDesignPlan: buildPlan(analysis, selection),
          loading: false,
          abortController: null,
        });
        showDreamAssistantNotification({
          type: "success",
          title: "趋势报告生成完毕",
          message: "爆款服装趋势分析已完成，可以查看趋势摘要、推荐方案和我的设计方案。",
          actionText: "我知道了",
          returnText: "任务提醒完成，我继续待命～",
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          set({ loading: false, error: null, abortController: null });
          return;
        }
        set({ loading: false, abortController: null, error: error instanceof Error ? error.message : "趋势分析失败" });
        showDreamAssistantNotification({
          type: "error",
          title: "趋势分析生成失败",
          message: error instanceof Error ? error.message : "生成过程中遇到异常，请稍后重试。",
          actionText: "稍后再试",
          returnText: "我先回右下角，需要时再叫我～",
        });
      }
    },
    cancelAnalysis: () => {
      const { abortController, loading } = get();
      if (!loading) return;
      abortController?.abort();
      set({ loading: false, error: null, abortController: null });
      showDreamAssistantNotification({
        type: "info",
        title: "趋势分析已取消",
        message: "当前生成任务已停止，已生成的页面内容会继续保留。",
        actionText: "我知道了",
        returnText: "我先回右下角，需要灵感随时叫我！",
      });
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
        selected_style_ids: direction.style_ids.slice(0, 1),
        selected_silhouette_ids: direction.silhouette_ids.slice(0, 1),
        selected_structure_ids: direction.structure_ids,
        selected_color_ids: direction.color_ids,
        selected_fabric_ids: direction.fabric_ids.slice(0, 1),
        selected_selling_point_ids: direction.selling_point_ids,
      };
      set({ selection, myDesignPlan: buildPlan(analysis, selection) });
    },
    saveCurrentPlan: async () => {
      const plan = get().myDesignPlan;
      if (!plan) return;
      await saveDesignPlan({ ...plan, is_favorite: true });
      set({ myDesignPlan: { ...plan, is_favorite: true } });
    },
    exportJson: () => {
      const plan = get().myDesignPlan;
      if (!plan) return;
      downloadFile("styleforge-design-plan.json", JSON.stringify(plan, null, 2), "application/json");
    },
    exportMarkdown: () => {
      const plan = get().myDesignPlan;
      if (!plan) return;
      downloadFile(
        "styleforge-trend-report.md",
        `# ${plan.recommended_direction}\n\n${plan.design_summary}\n\n爆款指数：${plan.popularity_score}\n\n## AI Prompt\n\n${plan.ai_prompt}\n`,
        "text/markdown",
      );
    },
  };
});
