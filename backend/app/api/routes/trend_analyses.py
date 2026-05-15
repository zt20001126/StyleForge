import json
import re

from fastapi import APIRouter, Query
from pydantic import ValidationError

from app.core.config import get_settings
from app.core.errors import AICallFailedError, AIResultInvalidError
from app.core.errors import ValidationAppError
from app.repositories import repository
from app.schemas.trend import (
    PaginatedTrendAnalyses,
    TrendAnalysisCreateResponse,
    TrendAnalysisDetail,
    TrendAnalysisInput,
    TrendAnalysisResult,
)
from app.services.ai_client import call_chat_completion
from app.services.mock_ai import generate_mock_trend_result
from app.services.trend_prompt import build_trend_analysis_prompt
from app.services.trend_validator import validate_trend_result

router = APIRouter(prefix="/api/trend-analyses", tags=["trend-analyses"])
settings = get_settings()


@router.post("", response_model=TrendAnalysisCreateResponse)
def create_trend_analysis(payload: TrendAnalysisInput) -> TrendAnalysisCreateResponse:
    analysis_prompt = build_trend_analysis_prompt(payload)

    if settings.use_mock_ai:
        result = generate_mock_trend_result(payload)
        raw_response = result.model_dump_json()
    else:
        raw_response = None
        try:
            raw_response = call_chat_completion(analysis_prompt, settings)
            result = _parse_trend_result(raw_response)
            validate_trend_result(result)
        except (AICallFailedError, AIResultInvalidError) as exc:
            repository.create_trend_analysis(
                payload,
                None,
                status="failed",
                error_message=exc.message,
                analysis_prompt=analysis_prompt,
                raw_response=raw_response,
            )
            raise

    analysis = repository.create_trend_analysis(
        payload,
        result,
        analysis_prompt=analysis_prompt,
        raw_response=raw_response,
    )
    return TrendAnalysisCreateResponse(
        analysis_id=analysis.analysis_id,
        status=analysis.status,
        input=analysis.input,
        result=analysis.result,
        error_message=analysis.error_message,
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


def _parse_trend_result(raw_response: str) -> TrendAnalysisResult:
    try:
        data = json.loads(_strip_markdown_json(raw_response))
    except json.JSONDecodeError as exc:
        raise AIResultInvalidError("AI response was not valid JSON") from exc

    try:
        return TrendAnalysisResult.model_validate(data)
    except ValidationError as exc:
        raise AIResultInvalidError(f"AI response did not match trend result schema: {exc}") from exc


def _strip_markdown_json(raw_response: str) -> str:
    content = raw_response.strip()
    fenced_match = re.fullmatch(r"```(?:json)?\s*(.*?)\s*```", content, flags=re.DOTALL | re.IGNORECASE)
    if fenced_match:
        return fenced_match.group(1).strip()
    return content
