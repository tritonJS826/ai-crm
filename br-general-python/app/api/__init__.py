# Description: API router for the application, including health, user, and email endpoints.

from . import auth, check, health, websocket, users, tests, payments, stats, email
from fastapi import APIRouter

from ..settings import settings

api_router = APIRouter()
api_router.include_router(health.router, prefix="/br-general/health", tags=["health"])
api_router.include_router(check.router, prefix="/br-general/check", tags=["check"])

api_router.include_router(users.router, prefix="/br-general/users", tags=["users"])
api_router.include_router(tests.router, prefix="/br-general/tests", tags=["tests"])
api_router.include_router(
    payments.router, prefix="/br-general/payment", tags=["payments"]
)
api_router.include_router(stats.router, prefix="/br-general/stats", tags=["stats"])
# For production, disable email send and user create endpoints
if settings.env_type != "prod":
    api_router.include_router(email.router, prefix="/br-general/email", tags=["email"])

api_router.include_router(websocket.router, prefix="/br-general/ws", tags=["websocket"])
api_router.include_router(auth.router, prefix="/br-general/auth", tags=["auth"])
