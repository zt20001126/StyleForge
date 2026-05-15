from datetime import datetime, timezone
from typing import Literal
from uuid import uuid4

from app.core.errors import NotFoundError
from app.schemas.trend import (
    DesignPlanCreate,
    DesignPlanCreateResponse,
    DesignPlanDetail,
    PaginatedTrendAnalyses,
    Pagination,
    TrendAnalysisDetail,
    TrendAnalysisInput,
    TrendAnalysisResult,
    TrendAnalysisSummary,
)


class MemoryRepository:
    def __init__(self) -> None:
        self._trend_analyses: dict[str, TrendAnalysisDetail] = {}
        self._design_plans: dict[str, DesignPlanDetail] = {}

    def create_trend_analysis(
        self,
        input_data: TrendAnalysisInput,
        result: TrendAnalysisResult | None,
        status: Literal["processing", "success", "failed"] = "success",
        error_message: str | None = None,
        analysis_prompt: str | None = None,
        raw_response: str | None = None,
    ) -> TrendAnalysisDetail:
        now = _now()
        analysis = TrendAnalysisDetail(
            analysis_id=str(uuid4()),
            status=status,
            input=input_data,
            result=result,
            error_message=error_message,
            created_at=now,
            updated_at=now,
        )
        self._trend_analyses[analysis.analysis_id] = analysis
        return analysis

    def get_trend_analysis(self, analysis_id: str) -> TrendAnalysisDetail:
        analysis = self._trend_analyses.get(analysis_id)
        if analysis is None:
            raise NotFoundError("Trend analysis not found")
        return analysis

    def list_trend_analyses(
        self,
        page: int,
        page_size: int,
        status: str | None = None,
    ) -> PaginatedTrendAnalyses:
        items = list(self._trend_analyses.values())
        if status:
            items = [item for item in items if item.status == status]
        items.sort(key=lambda item: item.created_at, reverse=True)
        total = len(items)
        start = (page - 1) * page_size
        end = start + page_size
        summaries = [
            TrendAnalysisSummary(
                analysis_id=item.analysis_id,
                category=item.input.category,
                target_user=item.input.target_user,
                scene=item.input.scene,
                style=item.input.style,
                status=item.status,
                created_at=item.created_at,
            )
            for item in items[start:end]
        ]
        return PaginatedTrendAnalyses(
            list=summaries,
            pagination=Pagination(page=page, page_size=page_size, total=total),
        )

    def create_design_plan(self, payload: DesignPlanCreate) -> DesignPlanCreateResponse:
        now = _now()
        design_plan_id = str(uuid4())
        selection = payload.normalized_selection()
        detail = DesignPlanDetail(
            design_plan_id=design_plan_id,
            analysis_id=payload.analysis_id,
            selection=selection,
            design_summary=payload.design_summary,
            style_description=payload.style_description,
            recommended_direction=payload.recommended_direction,
            popularity_score=payload.popularity_score,
            ai_prompt=payload.ai_prompt,
            warnings=payload.warnings,
            is_favorite=payload.is_favorite,
            created_at=now,
            updated_at=now,
        )
        self._design_plans[design_plan_id] = detail
        return DesignPlanCreateResponse(
            design_plan_id=design_plan_id,
            analysis_id=payload.analysis_id,
            is_favorite=payload.is_favorite,
            created_at=now,
        )

    def get_design_plan(self, design_plan_id: str) -> DesignPlanDetail:
        plan = self._design_plans.get(design_plan_id)
        if plan is None:
            raise NotFoundError("Design plan not found")
        return plan

    def clear(self) -> None:
        self._trend_analyses.clear()
        self._design_plans.clear()


def _now() -> datetime:
    return datetime.now(timezone.utc)


repository = MemoryRepository()
