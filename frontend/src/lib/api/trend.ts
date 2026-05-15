import { mockAnalysis, mockPlans } from "@/lib/mock-data";
import type { MyDesignPlan, TrendAnalysisInput, TrendAnalysisResponse, UserDesignSelection } from "@/lib/types/trend";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function createTrendAnalysis(input: TrendAnalysisInput): Promise<TrendAnalysisResponse> {
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 450));
    return {
      ...mockAnalysis,
      input,
    };
  }

  return request<TrendAnalysisResponse>("/api/trend-analyses", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function listTrendAnalyses(): Promise<TrendAnalysisResponse[]> {
  if (USE_MOCKS) {
    return [mockAnalysis];
  }

  const response = await request<{ list: TrendAnalysisResponse[] }>("/api/trend-analyses?page=1&page_size=20");
  return response.list;
}

export async function generateDesignPlan(selection: UserDesignSelection): Promise<MyDesignPlan> {
  if (USE_MOCKS) {
    return mockPlans[0];
  }

  return request<MyDesignPlan>("/api/design-plans/generate", {
    method: "POST",
    body: JSON.stringify(selection),
  });
}

export async function saveDesignPlan(plan: MyDesignPlan): Promise<{ design_plan_id: string }> {
  if (USE_MOCKS) {
    return { design_plan_id: plan.id ?? "mock-saved-plan" };
  }

  return request<{ design_plan_id: string }>("/api/design-plans", {
    method: "POST",
    body: JSON.stringify(plan),
  });
}
