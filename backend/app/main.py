from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import design_plans_router, trend_analyses_router
from app.core.config import get_settings
from app.core.errors import AppError

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="StyleForge AI fashion trend analysis and design co-creation MVP backend.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trend_analyses_router)
app.include_router(design_plans_router)


@app.get("/health")
def health() -> dict[str, str | bool]:
    return {
        "status": "ok",
        "app_name": settings.app_name,
        "environment": settings.environment,
        "use_mock_ai": settings.use_mock_ai,
        "storage_mode": settings.storage_mode,
    }


@app.exception_handler(AppError)
async def app_error_handler(_: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": exc.code,
            "message": exc.message,
            "request_id": f"req_{uuid4().hex[:12]}",
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content={
            "code": "VALIDATION_ERROR",
            "message": "Request validation failed",
            "details": exc.errors(),
            "request_id": f"req_{uuid4().hex[:12]}",
        },
    )
