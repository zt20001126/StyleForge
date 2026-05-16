from app.api.routes.auth import router as auth_router
from app.api.routes.design_plans import router as design_plans_router
from app.api.routes.trend_analyses import router as trend_analyses_router

__all__ = ["auth_router", "design_plans_router", "trend_analyses_router"]
