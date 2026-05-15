import { mockAnalysis, mockPlans } from "@/lib/mock-data";
import type {
  ApiErrorResponse,
  MyDesignPlan,
  PaginatedTrendAnalyses,
  TrendAnalysisInput,
  TrendAnalysisResponse,
  TrendAnalysisSummary,
  UserDesignSelection,
} from "@/lib/types/trend";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

export class ApiError extends Error {
  code?: string;
  requestId?: string;
  status: number;
  details?: unknown;

  constructor(status: number, errorBody?: ApiErrorResponse) {
    super(errorBody?.message ?? `Request failed: ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.code = errorBody?.code;
    this.requestId = errorBody?.request_id;
    this.details = errorBody?.details;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorBody(response));
  }

  return response.json() as Promise<T>;
}

async function readErrorBody(response: Response): Promise<ApiErrorResponse | undefined> {
  try {
    return (await response.json()) as ApiErrorResponse;
  } catch {
    return undefined;
  }
}

function toTrendAnalysisSummary(analysis: TrendAnalysisResponse): TrendAnalysisSummary {
  return {
    analysis_id: analysis.analysis_id,
    category: analysis.input.category,
    target_user: analysis.input.target_user,
    scene: analysis.input.scene,
    style: analysis.input.style,
    status: analysis.status,
    created_at: analysis.created_at ?? new Date().toISOString(),
  };
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

export async function listTrendAnalyses(): Promise<TrendAnalysisSummary[]> {
  if (USE_MOCKS) {
    return [toTrendAnalysisSummary(mockAnalysis)];
  }

  const response = await request<PaginatedTrendAnalyses>("/api/trend-analyses?page=1&page_size=20");
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
