from fastapi import APIRouter, HTTPException
from app.db import db
from app.services.health_service import get_health_status

router = APIRouter()


@router.get("/")
async def root():
    # Explicit DB check for test expectations
    try:
        await db.user.count()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Health check failed") from e

    return await get_health_status()
