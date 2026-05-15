export interface TrendAnalysisInput {
  category: string;
  target_user: string;
  scene: string;
  style: string;
}

export interface TrendOption {
  id: string;
  name: string;
  description: string;
  score: number;
  reason: string;
  tags?: string[];
}

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  role: "primary" | "secondary" | "accent";
  score: number;
  reason: string;
}

export interface RecommendedDirection {
  id: string;
  name: string;
  positioning: string;
  target_user: string;
  style_ids: string[];
  silhouette_ids: string[];
  structure_ids: string[];
  color_ids: string[];
  fabric_ids: string[];
  selling_point_ids: string[];
  design_summary: string;
  popularity_score: number;
  cost_complexity: "low" | "medium" | "high";
  ai_prompt: string;
}

export interface TrendAnalysisResult {
  summary: string;
  opportunity: string;
  risk: string;
  style_directions: TrendOption[];
  silhouettes: TrendOption[];
  core_structures: TrendOption[];
  color_palette: ColorOption[];
  fabric_trends: TrendOption[];
  selling_points: TrendOption[];
  recommended_directions: RecommendedDirection[];
  base_prompt: string;
}

export interface TrendAnalysisResponse {
  analysis_id: string;
  status: "processing" | "success" | "failed";
  input: TrendAnalysisInput;
  result: TrendAnalysisResult;
  created_at?: string;
}

export interface UserDesignSelection {
  analysis_id: string;
  selected_style_ids: string[];
  selected_silhouette_ids: string[];
  selected_structure_ids: string[];
  selected_color_ids: string[];
  selected_fabric_ids: string[];
  selected_selling_point_ids: string[];
}

export interface MyDesignPlan {
  id?: string;
  analysis_id: string;
  design_summary: string;
  style_description: string;
  recommended_direction: string;
  popularity_score: number;
  ai_prompt: string;
  selected_items: UserDesignSelection;
  warnings: string[];
  created_at?: string;
  updated_at?: string;
  is_favorite?: boolean;
}
