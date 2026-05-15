from app.core.config import get_settings
from app.repositories.memory import MemoryRepository

settings = get_settings()

if settings.storage_mode.lower() in {"postgres", "postgresql", "database"}:
    if not settings.database_url:
        raise RuntimeError("DATABASE_URL is required when STORAGE_MODE is postgres")
    from app.repositories.postgres import PostgresRepository

    repository = PostgresRepository(settings.database_url)
else:
    repository = MemoryRepository()

__all__ = ["MemoryRepository", "repository"]
