from fastapi import APIRouter, Query

from app.core.errors import ValidationAppError
from app.repositories import repository
from app.schemas.trend import (
    PaginatedTrendAnalyses,
    TrendAnalysisCreateResponse,
    TrendAnalysisDetail,
    TrendAnalysisInput,
)
from app.services.mock_ai import generate_mock_trend_result
from app.services.trend_validator import validate_trend_result

router = APIRouter(prefix="/api/trend-analyses", tags=["trend-analyses"])


@router.post("", response_model=TrendAnalysisCreateResponse)
def create_trend_analysis(payload: TrendAnalysisInput) -> TrendAnalysisCreateResponse:
    result = generate_mock_trend_result(payload)
    validate_trend_result(result)
    analysis = repository.create_trend_analysis(payload, result)
    return TrendAnalysisCreateResponse(
        analysis_id=analysis.analysis_id,
        status=analysis.status,
        input=analysis.input,
        result=analysis.result,
    )


@router.get("", response_model=PaginatedTrendAnalyses)
def list_trend_analyses(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    status: str | None = Query(default=None, pattern="^(processing|success|failed)$"),
) -> PaginatedTrendAnalyses:
    return repository.list_trend_analyses(page=page, page_size=page_size, status=status)


@router.get("/{analysis_id}", response_model=TrendAnalysisDetail)
def get_trend_analysis(analysis_id: str) -> TrendAnalysisDetail:
    if not analysis_id.strip():
        raise ValidationAppError("analysis_id is required")
    return repository.get_trend_analysis(analysis_id)
