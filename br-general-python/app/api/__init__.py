# Description: API router for the application, including health, user, and email endpoints.

from . import users, health, email, auth, tests, payments, stats
from fastapi import APIRouter
from app.settings import settings

api_router = APIRouter()
api_router.include_router(health.router, prefix="/br-general/health", tags=["health"])
api_router.include_router(auth.router, prefix="/br-general/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/br-general/users", tags=["users"])
api_router.include_router(tests.router, prefix="/br-general/tests", tags=["tests"])
api_router.include_router(
    payments.router, prefix="/br-general/payment", tags=["payments"]
)
api_router.include_router(stats.router, prefix="/br-general/stats", tags=["stats"])
# For production, disable email send and user create endpoints
if settings.env_type != "prod":
    api_router.include_router(email.router, prefix="/br-general/email", tags=["email"])
