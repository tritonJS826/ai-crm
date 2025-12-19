# Description: API router for the application, including health, user, and email endpoints.

from . import check
from fastapi import APIRouter

api_router = APIRouter()
api_router.include_router(check.router, prefix="/br-general/check", tags=["check"])
