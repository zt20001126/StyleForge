import base64
import hashlib
import hmac
import json
import logging
import secrets
from datetime import datetime, timedelta, timezone
from uuid import uuid4

try:
    from argon2 import PasswordHasher
    from argon2.exceptions import VerifyMismatchError, VerificationError
except ModuleNotFoundError:  # pragma: no cover - exercised only in minimal local environments
    PasswordHasher = None
    VerifyMismatchError = VerificationError = Exception

from app.core.config import Settings
from app.core.errors import AppError, ValidationAppError
from app.schemas.auth import AuthResponse, UserPublic

logger = logging.getLogger(__name__)
password_hasher = PasswordHasher() if PasswordHasher is not None else None
_login_failures: dict[str, list[datetime]] = {}


def ensure_passwords_match(password: str, confirm_password: str) -> None:
    if password != confirm_password:
        raise ValidationAppError("Passwords do not match")


def hash_password(password: str) -> str:
    if password_hasher is None:
        salt = secrets.token_hex(16)
        digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 200_000).hex()
        return f"pbkdf2_sha256$200000${salt}${digest}"
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    if password_hash.startswith("pbkdf2_sha256$"):
        try:
            _, iterations, salt, expected = password_hash.split("$", 3)
            digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), int(iterations)).hex()
        except ValueError:
            return False
        return hmac.compare_digest(digest, expected)
    if password_hasher is None:
        return False
    try:
        return password_hasher.verify(password_hash, password)
    except (VerifyMismatchError, VerificationError):
        return False


def generate_user_profile(phone: str) -> tuple[str, str]:
    digest = hashlib.sha256(phone.encode("utf-8")).hexdigest()
    prefixes = ["Pattern", "Atelier", "Draping", "Loom", "Studio", "Runway"]
    themes = ["版型", "织造", "廓形", "配色", "面料", "工坊"]
    username = f"{prefixes[int(digest[:2], 16) % len(prefixes)]}-{themes[int(digest[2:4], 16) % len(themes)]}{int(digest[4:8], 16) % 10000:04d}"
    avatar_url = f"/avatars/styleforge/{digest[:12]}.svg"
    return username, avatar_url


def generate_sms_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_sms_code(phone: str, purpose: str, code: str, settings: Settings) -> str:
    message = f"{phone}:{purpose}:{code}".encode("utf-8")
    return hmac.new(settings.auth_sms_pepper.encode("utf-8"), message, hashlib.sha256).hexdigest()


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def build_auth_response(user: UserPublic, repository, settings: Settings) -> AuthResponse:
    access_token = create_access_token(user.id, settings)
    refresh_token = secrets.token_urlsafe(48)
    expires_at = _now() + timedelta(days=settings.refresh_token_expire_days)
    repository.create_auth_session(user.id, hash_token(refresh_token), expires_at)
    return AuthResponse(access_token=access_token, refresh_token=refresh_token, user=user)


def create_access_token(user_id: str, settings: Settings) -> str:
    now = _now()
    payload = {
        "sub": user_id,
        "typ": "access",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=settings.access_token_expire_minutes)).timestamp()),
        "jti": uuid4().hex,
    }
    return _encode_jwt(payload, settings.jwt_secret_key)


def verify_access_token(token: str, settings: Settings) -> str:
    try:
        payload = _decode_jwt(token, settings.jwt_secret_key)
    except ValueError as exc:
        raise AppError("UNAUTHORIZED", "Invalid or expired token", 401) from exc
    if payload.get("typ") != "access" or not payload.get("sub"):
        raise AppError("UNAUTHORIZED", "Invalid or expired token", 401)
    return str(payload["sub"])


def check_login_rate_limit(phone: str, client_key: str) -> None:
    key = f"{phone}:{client_key}"
    cutoff = _now() - timedelta(minutes=10)
    attempts = [item for item in _login_failures.get(key, []) if item > cutoff]
    _login_failures[key] = attempts
    if len(attempts) >= 8:
        raise AppError("RATE_LIMITED", "Too many login attempts, please try again later", 429)


def record_login_failure(phone: str, client_key: str) -> None:
    key = f"{phone}:{client_key}"
    _login_failures.setdefault(key, []).append(_now())


def clear_login_failures(phone: str, client_key: str) -> None:
    _login_failures.pop(f"{phone}:{client_key}", None)


def _encode_jwt(payload: dict, secret: str) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    header_segment = _b64url(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_segment = _b64url(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_segment}.{payload_segment}".encode("ascii")
    signature = hmac.new(secret.encode("utf-8"), signing_input, hashlib.sha256).digest()
    return f"{header_segment}.{payload_segment}.{_b64url(signature)}"


def _decode_jwt(token: str, secret: str) -> dict:
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("Invalid token")
    signing_input = f"{parts[0]}.{parts[1]}".encode("ascii")
    expected_signature = hmac.new(secret.encode("utf-8"), signing_input, hashlib.sha256).digest()
    if not hmac.compare_digest(_b64url(expected_signature), parts[2]):
        raise ValueError("Invalid signature")
    payload = json.loads(_b64decode(parts[1]).decode("utf-8"))
    if int(payload.get("exp", 0)) < int(_now().timestamp()):
        raise ValueError("Expired token")
    return payload


def _b64url(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("ascii")


def _b64decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(f"{value}{padding}")


def _now() -> datetime:
    return datetime.now(timezone.utc)
