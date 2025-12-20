# Description: API router for the application, including health, user, and email endpoints.

from . import check, health
from fastapi import APIRouter

api_router = APIRouter()
api_router.include_router(check.router, prefix="/br-general/check", tags=["check"])
api_router.include_router(health.router, prefix="/br-general/health", tags=["health"])
