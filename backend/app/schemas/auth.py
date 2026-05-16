from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator


PHONE_PATTERN = r"^1[3-9]\d{9}$"


class UserPublic(BaseModel):
    id: str
    phone: str
    username: str
    avatar_url: str
    role: str = "designer"
    status: str = "active"
    created_at: datetime
    last_login_at: datetime | None = None


class RegisterRequest(BaseModel):
    phone: str = Field(pattern=PHONE_PATTERN)
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if not any(char.isalpha() for char in value) or not any(char.isdigit() for char in value):
            raise ValueError("Password must contain letters and numbers")
        return value


class PasswordLoginRequest(BaseModel):
    phone: str = Field(pattern=PHONE_PATTERN)
    password: str = Field(min_length=1, max_length=128)


class SendSmsCodeRequest(BaseModel):
    phone: str = Field(pattern=PHONE_PATTERN)
    purpose: Literal["login", "register"]


class SmsLoginRequest(BaseModel):
    phone: str = Field(pattern=PHONE_PATTERN)
    sms_code: str = Field(pattern=r"^\d{6}$")


class LogoutRequest(BaseModel):
    refresh_token: str = Field(min_length=16)


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserPublic


class SendSmsCodeResponse(BaseModel):
    success: bool
    expires_in: int
    dev_code: str | None = None


class SuccessResponse(BaseModel):
    success: bool
