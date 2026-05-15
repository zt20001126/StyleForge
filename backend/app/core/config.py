from functools import lru_cache

from pydantic import AliasChoices, BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class AIProviderConfig(BaseModel):
    provider: str
    api_key: str | None = None
    base_url: str
    model: str
    timeout_seconds: int


class ObjectStorageConfig(BaseModel):
    provider: str
    endpoint: str | None = None
    access_key: str | None = None
    secret_key: str | None = None
    bucket: str | None = None
    region: str = "us-east-1"
    secure: bool = False


class Settings(BaseSettings):
    app_name: str = "StyleForge Backend"
    environment: str = "development"
    use_mock_ai: bool = True
    storage_mode: str = "memory"
    frontend_origin: str = "http://localhost:3000"
    cors_allow_origins: str | None = None
    database_url: str | None = None
    redis_url: str | None = None

    ai_provider: str = "mock"
    default_text_model_provider: str = "openai"
    default_image_model_provider: str = "ark"
    default_video_model_provider: str = "ark"
    ai_api_key: str | None = Field(default=None, validation_alias=AliasChoices("OPENAI_API_KEY", "AI_API_KEY"))
    ai_base_url: str = Field(default="https://api.example.com/v1", validation_alias=AliasChoices("OPENAI_BASE_URL", "AI_BASE_URL"))
    ai_model: str = Field(default="mock-fashion-trend", validation_alias=AliasChoices("OPENAI_MODEL", "AI_MODEL"))
    ai_timeout_seconds: int = Field(default=60, ge=1, le=300)
    ark_api_key: str | None = Field(default=None, validation_alias=AliasChoices("ARK_API_KEY", "VOLCENGINE_ARK_API_KEY"))
    ark_base_url: str = "https://ark.cn-beijing.volces.com/api/v3"
    ark_text_model: str | None = None
    ark_image_model: str | None = None
    ark_video_model: str | None = None
    dashscope_api_key: str | None = Field(default=None, validation_alias=AliasChoices("DASHSCOPE_API_KEY", "ALIYUN_DASHSCOPE_API_KEY"))
    dashscope_base_url: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    dashscope_text_model: str | None = None
    dashscope_image_model: str | None = None

    object_storage_provider: str = "local"
    minio_endpoint: str | None = None
    minio_access_key: str | None = None
    minio_secret_key: str | None = None
    minio_bucket: str | None = None
    minio_region: str = "us-east-1"
    minio_secure: bool = False
    oss_endpoint: str | None = None
    oss_access_key_id: str | None = None
    oss_access_key_secret: str | None = None
    oss_bucket: str | None = None
    oss_region: str | None = None

    log_dir: str = "logs"
    log_level: str = "INFO"
    log_retention_days: int = Field(default=30, ge=1, le=3650)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )

    @property
    def cors_origins(self) -> list[str]:
        configured = self.cors_allow_origins or self.frontend_origin
        origins = [origin.strip() for origin in configured.split(",") if origin.strip()]
        if "http://127.0.0.1:3000" not in origins:
            origins.append("http://127.0.0.1:3000")
        return origins

    def get_ai_provider_config(self, provider: str | None = None, model: str | None = None) -> AIProviderConfig:
        selected_provider = (provider or self.ai_provider or self.default_text_model_provider).lower()
        if selected_provider == "mock":
            selected_provider = self.default_text_model_provider.lower()

        if selected_provider in {"openai", "openai-compatible", "legacy"}:
            return AIProviderConfig(
                provider="openai",
                api_key=self.ai_api_key,
                base_url=self.ai_base_url,
                model=model or self.ai_model,
                timeout_seconds=self.ai_timeout_seconds,
            )
        if selected_provider in {"ark", "volcengine", "seedream", "seedance"}:
            return AIProviderConfig(
                provider="ark",
                api_key=self.ark_api_key,
                base_url=self.ark_base_url,
                model=model or self.ark_text_model or self.ark_image_model or self.ark_video_model or "",
                timeout_seconds=self.ai_timeout_seconds,
            )
        if selected_provider in {"dashscope", "aliyun", "wanx"}:
            return AIProviderConfig(
                provider="dashscope",
                api_key=self.dashscope_api_key,
                base_url=self.dashscope_base_url,
                model=model or self.dashscope_text_model or self.dashscope_image_model or "",
                timeout_seconds=self.ai_timeout_seconds,
            )
        return AIProviderConfig(
            provider=selected_provider,
            api_key=None,
            base_url="",
            model=model or "",
            timeout_seconds=self.ai_timeout_seconds,
        )

    @property
    def object_storage(self) -> ObjectStorageConfig:
        provider = self.object_storage_provider.lower()
        if provider == "minio":
            return ObjectStorageConfig(
                provider="minio",
                endpoint=self.minio_endpoint,
                access_key=self.minio_access_key,
                secret_key=self.minio_secret_key,
                bucket=self.minio_bucket,
                region=self.minio_region,
                secure=self.minio_secure,
            )
        if provider == "oss":
            return ObjectStorageConfig(
                provider="oss",
                endpoint=self.oss_endpoint,
                access_key=self.oss_access_key_id,
                secret_key=self.oss_access_key_secret,
                bucket=self.oss_bucket,
                region=self.oss_region or "cn-hangzhou",
                secure=True,
            )
        return ObjectStorageConfig(provider=provider)


@lru_cache
def get_settings() -> Settings:
    return Settings()
