import logging
import time
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import design_plans_router, trend_analyses_router
from app.core.config import get_settings
from app.core.errors import AppError
from app.core.logging import setup_logging

settings = get_settings()
setup_logging(settings)
logger = logging.getLogger(__name__)

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


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    request_id = f"req_{uuid4().hex[:12]}"
    request.state.request_id = request_id
    start_time = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start_time) * 1000
    response.headers["X-Request-ID"] = request_id
    logger.info(
        "request method=%s path=%s status_code=%s duration_ms=%.2f",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
        extra={"request_id": request_id},
    )
    return response


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
async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    request_id = _get_request_id(request)
    log_method = logger.error if exc.status_code >= 500 else logger.warning
    log_method(
        "application error code=%s message=%s status_code=%s",
        exc.code,
        exc.message,
        exc.status_code,
        extra={"request_id": request_id},
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": exc.code,
            "message": exc.message,
            "request_id": request_id,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    request_id = _get_request_id(request)
    logger.warning(
        "request validation failed details=%s",
        exc.errors(),
        extra={"request_id": request_id},
    )
    return JSONResponse(
        status_code=400,
        content={
            "code": "VALIDATION_ERROR",
            "message": "Request validation failed",
            "details": exc.errors(),
            "request_id": request_id,
        },
    )


@app.exception_handler(Exception)
async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
    request_id = _get_request_id(request)
    logger.exception("unhandled exception", exc_info=exc, extra={"request_id": request_id})
    return JSONResponse(
        status_code=500,
        content={
            "code": "INTERNAL_ERROR",
            "message": "Internal server error",
            "request_id": request_id,
        },
    )


def _get_request_id(request: Request) -> str:
    return getattr(request.state, "request_id", f"req_{uuid4().hex[:12]}")
