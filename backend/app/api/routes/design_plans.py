from fastapi import APIRouter

from app.core.errors import ValidationAppError
from app.repositories import repository
from app.schemas.trend import (
    DesignPlanCreate,
    DesignPlanCreateResponse,
    DesignPlanDetail,
    MyDesignPlan,
    UserDesignSelection,
)
from app.services.design_plan import generate_design_plan

router = APIRouter(prefix="/api/design-plans", tags=["design-plans"])


@router.post("/generate", response_model=MyDesignPlan)
def generate_my_design_plan(selection: UserDesignSelection) -> MyDesignPlan:
    analysis = repository.get_trend_analysis(selection.analysis_id)
    return generate_design_plan(analysis, selection)


@router.post("", response_model=DesignPlanCreateResponse)
def create_design_plan(payload: DesignPlanCreate) -> DesignPlanCreateResponse:
    try:
        selection = payload.normalized_selection()
    except ValueError as exc:
        raise ValidationAppError(str(exc)) from exc
    if payload.analysis_id != selection.analysis_id:
        raise ValidationAppError("analysis_id does not match selection.analysis_id")
    repository.get_trend_analysis(payload.analysis_id)
    return repository.create_design_plan(payload)


@router.get("/{design_plan_id}", response_model=DesignPlanDetail)
def get_design_plan(design_plan_id: str) -> DesignPlanDetail:
    if not design_plan_id.strip():
        raise ValidationAppError("design_plan_id is required")
    return repository.get_design_plan(design_plan_id)
