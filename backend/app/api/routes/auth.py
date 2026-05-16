import hmac
import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Header, Request

from app.core.config import get_settings
from app.core.errors import AppError, ValidationAppError
from app.repositories import repository
from app.schemas.auth import (
    AuthResponse,
    LogoutRequest,
    PasswordLoginRequest,
    RegisterRequest,
    SendSmsCodeRequest,
    SendSmsCodeResponse,
    SmsLoginRequest,
    SuccessResponse,
    UserPublic,
)
from app.services.auth import (
    build_auth_response,
    check_login_rate_limit,
    clear_login_failures,
    generate_sms_code,
    generate_user_profile,
    hash_password,
    hash_sms_code,
    hash_token,
    record_login_failure,
    verify_access_token,
    verify_password,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])
settings = get_settings()


@router.post("/register", response_model=AuthResponse)
def register(payload: RegisterRequest) -> AuthResponse:
    if payload.password != payload.confirm_password:
        raise ValidationAppError("Passwords do not match")
    if repository.get_user_by_phone(payload.phone) is not None:
        raise AppError("PHONE_ALREADY_REGISTERED", "Phone number is already registered", 409)

    username, avatar_url = generate_user_profile(payload.phone)
    user = repository.create_user(
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        username=username,
        avatar_url=avatar_url,
    )
    user = repository.update_user_last_login(user.id)
    return build_auth_response(user, repository, settings)


@router.post("/login", response_model=AuthResponse)
def login(payload: PasswordLoginRequest, request: Request) -> AuthResponse:
    client_key = _client_key(request)
    check_login_rate_limit(payload.phone, client_key)
    row = repository.get_user_by_phone(payload.phone)
    if row is None or row["status"] != "active" or not verify_password(payload.password, row["password_hash"]):
        record_login_failure(payload.phone, client_key)
        raise AppError("INVALID_CREDENTIALS", "Invalid phone number or password", 401)

    clear_login_failures(payload.phone, client_key)
    user = repository.update_user_last_login(str(row["id"]))
    return build_auth_response(user, repository, settings)


@router.post("/send-sms-code", response_model=SendSmsCodeResponse)
def send_sms_code(payload: SendSmsCodeRequest) -> SendSmsCodeResponse:
    user = repository.get_user_by_phone(payload.phone)
    if payload.purpose == "login" and user is None:
        raise AppError("USER_NOT_FOUND", "Phone number is not registered", 404)
    if payload.purpose == "register" and user is not None:
        raise AppError("PHONE_ALREADY_REGISTERED", "Phone number is already registered", 409)

    now = _now()
    latest_code = repository.get_latest_sms_code(payload.phone, payload.purpose)
    if latest_code is not None and latest_code["created_at"] > now - timedelta(seconds=60):
        raise AppError("RATE_LIMITED", "Please wait before requesting another SMS code", 429)
    if repository.count_recent_sms_codes(payload.phone, now - timedelta(hours=1)) >= 5:
        raise AppError("RATE_LIMITED", "Too many SMS code requests, please try again later", 429)

    code = generate_sms_code()
    expires_at = now + timedelta(minutes=settings.sms_code_expire_minutes)
    repository.create_sms_code(payload.phone, payload.purpose, hash_sms_code(payload.phone, payload.purpose, code, settings), expires_at)
    logger.info("mock sms code generated phone=%s purpose=%s expires_at=%s", payload.phone, payload.purpose, expires_at.isoformat())
    return SendSmsCodeResponse(
        success=True,
        expires_in=settings.sms_code_expire_minutes * 60,
        dev_code=code if settings.auth_mock_sms_enabled and settings.environment != "production" else None,
    )


@router.post("/login/sms", response_model=AuthResponse)
def login_with_sms(payload: SmsLoginRequest, request: Request) -> AuthResponse:
    client_key = _client_key(request)
    check_login_rate_limit(payload.phone, client_key)
    row = repository.get_user_by_phone(payload.phone)
    if row is None or row["status"] != "active":
        record_login_failure(payload.phone, client_key)
        raise AppError("INVALID_SMS_CODE", "Invalid or expired SMS code", 401)

    code = repository.get_latest_sms_code(payload.phone, "login")
    if code is None or code["expires_at"] < _now() or code["attempt_count"] >= 5:
        record_login_failure(payload.phone, client_key)
        raise AppError("INVALID_SMS_CODE", "Invalid or expired SMS code", 401)

    repository.increment_sms_attempt(str(code["id"]))
    expected_hash = hash_sms_code(payload.phone, "login", payload.sms_code, settings)
    if not hmac.compare_digest(expected_hash, code["code_hash"]):
        record_login_failure(payload.phone, client_key)
        raise AppError("INVALID_SMS_CODE", "Invalid or expired SMS code", 401)

    repository.mark_sms_code_used(str(code["id"]))
    clear_login_failures(payload.phone, client_key)
    user = repository.update_user_last_login(str(row["id"]))
    return build_auth_response(user, repository, settings)


@router.get("/me", response_model=UserPublic)
def get_me(authorization: str | None = Header(default=None)) -> UserPublic:
    user_id = _user_id_from_authorization(authorization)
    row = repository.get_user_by_id(user_id)
    if row is None or row["status"] != "active":
        raise AppError("UNAUTHORIZED", "Invalid or expired token", 401)
    return _user_public_from_row(row)


@router.post("/logout", response_model=SuccessResponse)
def logout(payload: LogoutRequest) -> SuccessResponse:
    repository.revoke_auth_session(hash_token(payload.refresh_token))
    return SuccessResponse(success=True)


def _user_id_from_authorization(authorization: str | None) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise AppError("UNAUTHORIZED", "Missing bearer token", 401)
    return verify_access_token(authorization.split(" ", 1)[1].strip(), settings)


def _user_public_from_row(row) -> UserPublic:
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


def _client_key(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def _now() -> datetime:
    return datetime.now(timezone.utc)
