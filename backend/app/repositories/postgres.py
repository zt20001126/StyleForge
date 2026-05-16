from datetime import datetime
from typing import Literal
from uuid import UUID as ParsedUUID

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    MetaData,
    Numeric,
    String,
    Table,
    Text,
    create_engine,
    delete,
    desc,
    func,
    insert,
    select,
    text,
    update,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.engine import Engine, RowMapping
from sqlalchemy.exc import IntegrityError

from app.core.errors import AppError
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
    UserDesignSelection,
)

metadata = MetaData()

trend_analyses = Table(
    "trend_analyses",
    metadata,
    Column("id", UUID(as_uuid=False), primary_key=True, server_default=func.gen_random_uuid()),
    Column("category", String(100), nullable=False),
    Column("target_user", String(255), nullable=False),
    Column("scene", String(255), nullable=False),
    Column("style", String(255), nullable=False),
    Column("analysis_prompt", Text, nullable=False),
    Column("raw_response", Text),
    Column("result_json", JSONB),
    Column("base_prompt", Text),
    Column("status", String(20), nullable=False, server_default=text("'processing'")),
    Column("error_message", Text),
    Column("created_at", DateTime(timezone=True), nullable=False, server_default=func.now()),
    Column("updated_at", DateTime(timezone=True), nullable=False, server_default=func.now()),
    CheckConstraint("status IN ('processing', 'success', 'failed')", name="ck_trend_analyses_status"),
)

design_plans = Table(
    "design_plans",
    metadata,
    Column("id", UUID(as_uuid=False), primary_key=True, server_default=func.gen_random_uuid()),
    Column("analysis_id", UUID(as_uuid=False), ForeignKey("trend_analyses.id", ondelete="RESTRICT"), nullable=False),
    Column("selection_json", JSONB, nullable=False),
    Column("design_summary", Text, nullable=False),
    Column("style_description", Text),
    Column("recommended_direction", String(255)),
    Column("popularity_score", Integer),
    Column("ai_prompt", Text, nullable=False),
    Column("warnings", JSONB, nullable=False, server_default=text("'[]'::jsonb")),
    Column("is_favorite", Boolean, nullable=False, server_default=text("false")),
    Column("created_at", DateTime(timezone=True), nullable=False, server_default=func.now()),
    Column("updated_at", DateTime(timezone=True), nullable=False, server_default=func.now()),
    CheckConstraint("popularity_score IS NULL OR popularity_score BETWEEN 0 AND 100", name="ck_design_plans_score"),
)

generation_tasks = Table(
    "generation_tasks",
    metadata,
    Column("id", UUID(as_uuid=False), primary_key=True, server_default=func.gen_random_uuid()),
    Column("analysis_id", UUID(as_uuid=False), ForeignKey("trend_analyses.id", ondelete="RESTRICT")),
    Column("design_plan_id", UUID(as_uuid=False), ForeignKey("design_plans.id", ondelete="RESTRICT")),
    Column("task_type", String(30), nullable=False),
    Column("prompt", Text, nullable=False),
    Column("negative_prompt", Text),
    Column("model_name", String(100)),
    Column("request_json", JSONB, nullable=False, server_default=text("'{}'::jsonb")),
    Column("response_json", JSONB),
    Column("status", String(20), nullable=False, server_default=text("'processing'")),
    Column("error_message", Text),
    Column("created_at", DateTime(timezone=True), nullable=False, server_default=func.now()),
    Column("updated_at", DateTime(timezone=True), nullable=False, server_default=func.now()),
    Column("completed_at", DateTime(timezone=True)),
    CheckConstraint("status IN ('processing', 'success', 'failed')", name="ck_generation_tasks_status"),
    CheckConstraint(
        "task_type IN ('text_to_image', 'image_to_image', 'text_to_video', 'pattern')",
        name="ck_generation_tasks_task_type",
    ),
    CheckConstraint("analysis_id IS NOT NULL OR design_plan_id IS NOT NULL", name="ck_generation_tasks_parent"),
)

generated_assets = Table(
    "generated_assets",
    metadata,
    Column("id", UUID(as_uuid=False), primary_key=True, server_default=func.gen_random_uuid()),
    Column("generation_task_id", UUID(as_uuid=False), ForeignKey("generation_tasks.id", ondelete="RESTRICT"), nullable=False),
    Column("analysis_id", UUID(as_uuid=False), ForeignKey("trend_analyses.id", ondelete="RESTRICT")),
    Column("design_plan_id", UUID(as_uuid=False), ForeignKey("design_plans.id", ondelete="RESTRICT")),
    Column("asset_type", String(30), nullable=False),
    Column("storage_path", Text, nullable=False),
    Column("public_url", Text),
    Column("mime_type", String(100)),
    Column("file_size_bytes", BigInteger),
    Column("width", Integer),
    Column("height", Integer),
    Column("duration_seconds", Numeric(10, 2)),
    Column("metadata_json", JSONB, nullable=False, server_default=text("'{}'::jsonb")),
    Column("is_favorite", Boolean, nullable=False, server_default=text("false")),
    Column("created_at", DateTime(timezone=True), nullable=False, server_default=func.now()),
    CheckConstraint("asset_type IN ('image', 'video', 'document')", name="ck_generated_assets_type"),
)

users = Table(
    "users",
    metadata,
    Column("id", UUID(as_uuid=False), primary_key=True, server_default=func.gen_random_uuid()),
    Column("phone", String(20), nullable=False),
    Column("password_hash", String(255), nullable=False),
    Column("username", String(50), nullable=False),
    Column("avatar_url", String(255), nullable=False),
    Column("role", String(30), nullable=False, server_default=text("'designer'")),
    Column("status", String(20), nullable=False, server_default=text("'active'")),
    Column("last_login_at", DateTime(timezone=True)),
    Column("created_at", DateTime(timezone=True), nullable=False, server_default=func.now()),
    Column("updated_at", DateTime(timezone=True), nullable=False, server_default=func.now()),
    CheckConstraint("phone ~ '^1[3-9][0-9]{9}$'", name="ck_users_phone"),
    CheckConstraint("status IN ('active', 'disabled')", name="ck_users_status"),
)

sms_codes = Table(
    "sms_codes",
    metadata,
    Column("id", UUID(as_uuid=False), primary_key=True, server_default=func.gen_random_uuid()),
    Column("phone", String(20), nullable=False),
    Column("code_hash", String(255), nullable=False),
    Column("purpose", String(20), nullable=False),
    Column("expires_at", DateTime(timezone=True), nullable=False),
    Column("used_at", DateTime(timezone=True)),
    Column("attempt_count", Integer, nullable=False, server_default=text("0")),
    Column("created_at", DateTime(timezone=True), nullable=False, server_default=func.now()),
    CheckConstraint("purpose IN ('login', 'register')", name="ck_sms_codes_purpose"),
)

auth_sessions = Table(
    "auth_sessions",
    metadata,
    Column("id", UUID(as_uuid=False), primary_key=True, server_default=func.gen_random_uuid()),
    Column("user_id", UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
    Column("refresh_token_hash", String(255), nullable=False),
    Column("expires_at", DateTime(timezone=True), nullable=False),
    Column("revoked_at", DateTime(timezone=True)),
    Column("created_at", DateTime(timezone=True), nullable=False, server_default=func.now()),
)


class PostgresRepository:
    def __init__(self, database_url: str) -> None:
        self.engine = create_engine(database_url, pool_pre_ping=True)

    @classmethod
    def from_engine(cls, engine: Engine) -> "PostgresRepository":
        repository = cls.__new__(cls)
        repository.engine = engine
        return repository

    def create_trend_analysis(
        self,
        input_data: TrendAnalysisInput,
        result: TrendAnalysisResult | None,
        status: Literal["processing", "success", "failed"] = "success",
        error_message: str | None = None,
        analysis_prompt: str | None = None,
        raw_response: str | None = None,
    ) -> TrendAnalysisDetail:
        result_json = result.model_dump(mode="json") if result is not None else None
        values = {
            "category": input_data.category,
            "target_user": input_data.target_user,
            "scene": input_data.scene,
            "style": input_data.style,
            "analysis_prompt": analysis_prompt or "",
            "raw_response": raw_response,
            "result_json": result_json,
            "base_prompt": result.base_prompt if result is not None else None,
            "status": status,
            "error_message": error_message,
        }
        statement = insert(trend_analyses).values(**values).returning(trend_analyses)
        with self.engine.begin() as connection:
            row = connection.execute(statement).mappings().one()
        return _trend_analysis_from_row(row)

    def get_trend_analysis(self, analysis_id: str) -> TrendAnalysisDetail:
        if not _is_uuid(analysis_id):
            raise NotFoundError("Trend analysis not found")
        statement = select(trend_analyses).where(trend_analyses.c.id == analysis_id)
        with self.engine.begin() as connection:
            row = connection.execute(statement).mappings().one_or_none()
        if row is None:
            raise NotFoundError("Trend analysis not found")
        return _trend_analysis_from_row(row)

    def list_trend_analyses(
        self,
        page: int,
        page_size: int,
        status: str | None = None,
    ) -> PaginatedTrendAnalyses:
        filters = []
        if status:
            filters.append(trend_analyses.c.status == status)

        count_statement = select(func.count()).select_from(trend_analyses).where(*filters)
        list_statement = (
            select(
                trend_analyses.c.id,
                trend_analyses.c.category,
                trend_analyses.c.target_user,
                trend_analyses.c.scene,
                trend_analyses.c.style,
                trend_analyses.c.status,
                trend_analyses.c.created_at,
            )
            .where(*filters)
            .order_by(desc(trend_analyses.c.created_at))
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        with self.engine.begin() as connection:
            total = connection.execute(count_statement).scalar_one()
            rows = connection.execute(list_statement).mappings().all()

        return PaginatedTrendAnalyses(
            list=[
                TrendAnalysisSummary(
                    analysis_id=str(row["id"]),
                    category=row["category"],
                    target_user=row["target_user"],
                    scene=row["scene"],
                    style=row["style"],
                    status=row["status"],
                    created_at=row["created_at"],
                )
                for row in rows
            ],
            pagination=Pagination(page=page, page_size=page_size, total=total),
        )

    def create_design_plan(self, payload: DesignPlanCreate) -> DesignPlanCreateResponse:
        selection = payload.normalized_selection()
        values = {
            "analysis_id": payload.analysis_id,
            "selection_json": selection.model_dump(mode="json"),
            "design_summary": payload.design_summary,
            "style_description": payload.style_description,
            "recommended_direction": payload.recommended_direction,
            "popularity_score": payload.popularity_score,
            "ai_prompt": payload.ai_prompt,
            "warnings": payload.warnings,
            "is_favorite": payload.is_favorite,
        }
        statement = insert(design_plans).values(**values).returning(
            design_plans.c.id,
            design_plans.c.analysis_id,
            design_plans.c.is_favorite,
            design_plans.c.created_at,
        )
        with self.engine.begin() as connection:
            row = connection.execute(statement).mappings().one()
        return DesignPlanCreateResponse(
            design_plan_id=str(row["id"]),
            analysis_id=str(row["analysis_id"]),
            is_favorite=row["is_favorite"],
            created_at=row["created_at"],
        )

    def get_design_plan(self, design_plan_id: str) -> DesignPlanDetail:
        if not _is_uuid(design_plan_id):
            raise NotFoundError("Design plan not found")
        statement = select(design_plans).where(design_plans.c.id == design_plan_id)
        with self.engine.begin() as connection:
            row = connection.execute(statement).mappings().one_or_none()
        if row is None:
            raise NotFoundError("Design plan not found")
        return _design_plan_from_row(row)

    def clear(self) -> None:
        with self.engine.begin() as connection:
            connection.execute(delete(auth_sessions))
            connection.execute(delete(sms_codes))
            connection.execute(delete(users))
            connection.execute(delete(generated_assets))
            connection.execute(delete(generation_tasks))
            connection.execute(delete(design_plans))
            connection.execute(delete(trend_analyses))

    def create_user(self, phone: str, password_hash: str, username: str, avatar_url: str) -> UserPublic:
        statement = (
            insert(users)
            .values(phone=phone, password_hash=password_hash, username=username, avatar_url=avatar_url)
            .returning(users)
        )
        try:
            with self.engine.begin() as connection:
                row = connection.execute(statement).mappings().one()
        except IntegrityError as exc:
            raise AppError("PHONE_ALREADY_REGISTERED", "Phone number is already registered", 409) from exc
        return _user_public_from_row(row)

    def get_user_by_phone(self, phone: str) -> RowMapping | None:
        statement = select(users).where(users.c.phone == phone)
        with self.engine.begin() as connection:
            return connection.execute(statement).mappings().one_or_none()

    def get_user_by_id(self, user_id: str) -> RowMapping | None:
        if not _is_uuid(user_id):
            return None
        statement = select(users).where(users.c.id == user_id)
        with self.engine.begin() as connection:
            return connection.execute(statement).mappings().one_or_none()

    def update_user_last_login(self, user_id: str) -> UserPublic:
        statement = (
            update(users)
            .where(users.c.id == user_id)
            .values(last_login_at=func.now(), updated_at=func.now())
            .returning(users)
        )
        with self.engine.begin() as connection:
            row = connection.execute(statement).mappings().one()
        return _user_public_from_row(row)

    def create_sms_code(self, phone: str, purpose: str, code_hash: str, expires_at: datetime) -> None:
        statement = insert(sms_codes).values(phone=phone, purpose=purpose, code_hash=code_hash, expires_at=expires_at)
        with self.engine.begin() as connection:
            connection.execute(statement)

    def get_latest_sms_code(self, phone: str, purpose: str) -> RowMapping | None:
        statement = (
            select(sms_codes)
            .where(sms_codes.c.phone == phone, sms_codes.c.purpose == purpose, sms_codes.c.used_at.is_(None))
            .order_by(desc(sms_codes.c.created_at))
            .limit(1)
        )
        with self.engine.begin() as connection:
            return connection.execute(statement).mappings().one_or_none()

    def count_recent_sms_codes(self, phone: str, since: datetime) -> int:
        statement = select(func.count()).select_from(sms_codes).where(sms_codes.c.phone == phone, sms_codes.c.created_at >= since)
        with self.engine.begin() as connection:
            return connection.execute(statement).scalar_one()

    def increment_sms_attempt(self, code_id: str) -> None:
        statement = update(sms_codes).where(sms_codes.c.id == code_id).values(attempt_count=sms_codes.c.attempt_count + 1)
        with self.engine.begin() as connection:
            connection.execute(statement)

    def mark_sms_code_used(self, code_id: str) -> None:
        statement = update(sms_codes).where(sms_codes.c.id == code_id).values(used_at=func.now())
        with self.engine.begin() as connection:
            connection.execute(statement)

    def create_auth_session(self, user_id: str, refresh_token_hash: str, expires_at: datetime) -> None:
        statement = insert(auth_sessions).values(user_id=user_id, refresh_token_hash=refresh_token_hash, expires_at=expires_at)
        with self.engine.begin() as connection:
            connection.execute(statement)

    def revoke_auth_session(self, refresh_token_hash: str) -> None:
        statement = (
            update(auth_sessions)
            .where(auth_sessions.c.refresh_token_hash == refresh_token_hash, auth_sessions.c.revoked_at.is_(None))
            .values(revoked_at=func.now())
        )
        with self.engine.begin() as connection:
            connection.execute(statement)


def _trend_analysis_from_row(row: RowMapping) -> TrendAnalysisDetail:
    input_data = TrendAnalysisInput(
        category=row["category"],
        target_user=row["target_user"],
        scene=row["scene"],
        style=row["style"],
    )
    result = TrendAnalysisResult.model_validate(row["result_json"]) if row["result_json"] is not None else None
    return TrendAnalysisDetail(
        analysis_id=str(row["id"]),
        status=row["status"],
        input=input_data,
        result=result,
        error_message=row["error_message"],
        created_at=_as_datetime(row["created_at"]),
        updated_at=_as_datetime(row["updated_at"]),
    )


def _design_plan_from_row(row: RowMapping) -> DesignPlanDetail:
    return DesignPlanDetail(
        design_plan_id=str(row["id"]),
        analysis_id=str(row["analysis_id"]),
        selection=UserDesignSelection.model_validate(row["selection_json"]),
        design_summary=row["design_summary"],
        style_description=row["style_description"],
        recommended_direction=row["recommended_direction"],
        popularity_score=row["popularity_score"],
        ai_prompt=row["ai_prompt"],
        warnings=row["warnings"],
        is_favorite=row["is_favorite"],
        created_at=_as_datetime(row["created_at"]),
        updated_at=_as_datetime(row["updated_at"]),
    )


def _user_public_from_row(row: RowMapping) -> UserPublic:
    return UserPublic(
        id=str(row["id"]),
        phone=row["phone"],
        username=row["username"],
        avatar_url=row["avatar_url"],
        role=row["role"],
        status=row["status"],
        created_at=_as_datetime(row["created_at"]),
        last_login_at=row["last_login_at"],
    )


def _as_datetime(value: datetime) -> datetime:
    return value


def _is_uuid(value: str) -> bool:
    try:
        ParsedUUID(value)
    except ValueError:
        return False
    return True
