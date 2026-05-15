from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "StyleForge Backend"
    environment: str = "development"
    use_mock_ai: bool = True
    storage_mode: str = "memory"
    frontend_origin: str = "http://localhost:3000"
    database_url: str | None = None
    ai_api_key: str | None = None
    ai_base_url: str = "https://api.example.com/v1"
    ai_model: str = "gpt-4o-mini"
    ai_timeout_seconds: int = Field(default=60, ge=1, le=300)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
