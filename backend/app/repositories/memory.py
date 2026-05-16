from datetime import datetime, timezone
from typing import Literal
from uuid import uuid4

from app.core.errors import NotFoundError
from app.schemas.auth import UserPublic
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
        self._users: dict[str, dict] = {}
        self._sms_codes: dict[str, dict] = {}
        self._auth_sessions: dict[str, dict] = {}

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
        self._users.clear()
        self._sms_codes.clear()
        self._auth_sessions.clear()

    def create_user(self, phone: str, password_hash: str, username: str, avatar_url: str) -> UserPublic:
        if self.get_user_by_phone(phone) is not None:
            from app.core.errors import AppError

            raise AppError("PHONE_ALREADY_REGISTERED", "Phone number is already registered", 409)
        now = _now()
        user_id = str(uuid4())
        row = {
            "id": user_id,
            "phone": phone,
            "password_hash": password_hash,
            "username": username,
            "avatar_url": avatar_url,
            "role": "designer",
            "status": "active",
            "last_login_at": None,
            "created_at": now,
            "updated_at": now,
        }
        self._users[user_id] = row
        return _user_from_row(row)

    def get_user_by_phone(self, phone: str) -> dict | None:
        return next((user for user in self._users.values() if user["phone"] == phone), None)

    def get_user_by_id(self, user_id: str) -> dict | None:
        return self._users.get(user_id)

    def update_user_last_login(self, user_id: str) -> UserPublic:
        row = self._users[user_id]
        row["last_login_at"] = _now()
        row["updated_at"] = row["last_login_at"]
        return _user_from_row(row)

    def create_sms_code(self, phone: str, purpose: str, code_hash: str, expires_at: datetime) -> None:
        code_id = str(uuid4())
        self._sms_codes[code_id] = {
            "id": code_id,
            "phone": phone,
            "purpose": purpose,
            "code_hash": code_hash,
            "expires_at": expires_at,
            "used_at": None,
            "attempt_count": 0,
            "created_at": _now(),
        }

    def get_latest_sms_code(self, phone: str, purpose: str) -> dict | None:
        codes = [
            code
            for code in self._sms_codes.values()
            if code["phone"] == phone and code["purpose"] == purpose and code["used_at"] is None
        ]
        codes.sort(key=lambda item: item["created_at"], reverse=True)
        return codes[0] if codes else None

    def count_recent_sms_codes(self, phone: str, since: datetime) -> int:
        return sum(1 for code in self._sms_codes.values() if code["phone"] == phone and code["created_at"] >= since)

    def increment_sms_attempt(self, code_id: str) -> None:
        self._sms_codes[code_id]["attempt_count"] += 1

    def mark_sms_code_used(self, code_id: str) -> None:
        self._sms_codes[code_id]["used_at"] = _now()

    def create_auth_session(self, user_id: str, refresh_token_hash: str, expires_at: datetime) -> None:
        session_id = str(uuid4())
        self._auth_sessions[session_id] = {
            "id": session_id,
            "user_id": user_id,
            "refresh_token_hash": refresh_token_hash,
            "expires_at": expires_at,
            "revoked_at": None,
            "created_at": _now(),
        }

    def revoke_auth_session(self, refresh_token_hash: str) -> None:
        for session in self._auth_sessions.values():
            if session["refresh_token_hash"] == refresh_token_hash and session["revoked_at"] is None:
                session["revoked_at"] = _now()
                return


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _user_from_row(row: dict) -> UserPublic:
    return UserPublic(
        id=str(row["id"]),
        phone=row["phone"],
        username=row["username"],
        avatar_url=row["avatar_url"],
        role=row["role"],
        status=row["status"],
        created_at=row["created_at"],
        last_login_at=row["last_login_at"],
    )


repository = MemoryRepository()
