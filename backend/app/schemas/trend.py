from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ErrorResponse(BaseModel):
    code: str
    message: str
    request_id: str | None = None


class TrendAnalysisInput(BaseModel):
    category: str = Field(..., min_length=1, max_length=100)
    target_user: str = Field(..., min_length=1, max_length=255)
    scene: str = Field(..., min_length=1, max_length=255)
    style: str = Field(..., min_length=1, max_length=255)

    @field_validator("category", "target_user", "scene", "style")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Field cannot be empty")
        return value


class TrendOption(BaseModel):
    id: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    score: int = Field(..., ge=0, le=100)
    reason: str = Field(..., min_length=1)
    tags: list[str] = Field(default_factory=list)


class ColorOption(BaseModel):
    id: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1)
    hex: str = Field(..., pattern=r"^#[0-9A-Fa-f]{6}$")
    role: Literal["primary", "secondary", "accent"]
    score: int = Field(..., ge=0, le=100)
    reason: str = Field(..., min_length=1)


class RecommendedDirection(BaseModel):
    id: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1)
    positioning: str = Field(..., min_length=1)
    target_user: str = Field(..., min_length=1)
    style_ids: list[str]
    silhouette_ids: list[str]
    structure_ids: list[str]
    color_ids: list[str]
    fabric_ids: list[str]
    selling_point_ids: list[str]
    design_summary: str = Field(..., min_length=1)
    popularity_score: int = Field(..., ge=0, le=100)
    cost_complexity: Literal["low", "medium", "high"]
    ai_prompt: str = Field(..., min_length=1)


class TrendAnalysisResult(BaseModel):
    summary: str = Field(..., min_length=1)
    opportunity: str = Field(..., min_length=1)
    risk: str = Field(..., min_length=1)
    style_directions: list[TrendOption] = Field(..., min_length=1)
    silhouettes: list[TrendOption] = Field(..., min_length=1)
    core_structures: list[TrendOption] = Field(..., min_length=1)
    color_palette: list[ColorOption] = Field(..., min_length=1)
    fabric_trends: list[TrendOption] = Field(..., min_length=1)
    selling_points: list[TrendOption] = Field(..., min_length=1)
    recommended_directions: list[RecommendedDirection] = Field(..., min_length=1)
    base_prompt: str = Field(..., min_length=1)


class TrendAnalysisCreateResponse(BaseModel):
    analysis_id: str
    status: Literal["processing", "success", "failed"]
    input: TrendAnalysisInput
    result: TrendAnalysisResult


class TrendAnalysisDetail(TrendAnalysisCreateResponse):
    error_message: str | None = None
    created_at: datetime
    updated_at: datetime


class TrendAnalysisSummary(BaseModel):
    analysis_id: str
    category: str
    target_user: str
    scene: str
    style: str
    status: Literal["processing", "success", "failed"]
    created_at: datetime


class Pagination(BaseModel):
    page: int
    page_size: int
    total: int


class PaginatedTrendAnalyses(BaseModel):
    list: list[TrendAnalysisSummary]
    pagination: Pagination


class UserDesignSelection(BaseModel):
    analysis_id: str
    selected_style_ids: list[str] = Field(default_factory=list)
    selected_silhouette_ids: list[str] = Field(default_factory=list)
    selected_structure_ids: list[str] = Field(default_factory=list)
    selected_color_ids: list[str] = Field(default_factory=list)
    selected_fabric_ids: list[str] = Field(default_factory=list)
    selected_selling_point_ids: list[str] = Field(default_factory=list)


class MyDesignPlan(BaseModel):
    id: str | None = None
    analysis_id: str
    design_summary: str
    style_description: str
    recommended_direction: str
    popularity_score: int = Field(..., ge=0, le=100)
    ai_prompt: str
    selected_items: UserDesignSelection
    warnings: list[str] = Field(default_factory=list)
    created_at: datetime | None = None
    updated_at: datetime | None = None


class DesignPlanCreate(BaseModel):
    analysis_id: str
    selection: UserDesignSelection | None = None
    selected_items: UserDesignSelection | None = None
    design_summary: str
    style_description: str | None = None
    recommended_direction: str | None = None
    popularity_score: int | None = Field(default=None, ge=0, le=100)
    ai_prompt: str
    warnings: list[str] = Field(default_factory=list)
    is_favorite: bool = False

    def normalized_selection(self) -> UserDesignSelection:
        selection = self.selection or self.selected_items
        if selection is None:
            raise ValueError("selection or selected_items is required")
        return selection


class DesignPlanCreateResponse(BaseModel):
    design_plan_id: str
    analysis_id: str
    is_favorite: bool
    created_at: datetime


class DesignPlanDetail(BaseModel):
    design_plan_id: str
    analysis_id: str
    selection: UserDesignSelection
    design_summary: str
    style_description: str | None = None
    recommended_direction: str | None = None
    popularity_score: int | None = None
    ai_prompt: str
    warnings: list[str] = Field(default_factory=list)
    is_favorite: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
