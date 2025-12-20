from fastapi import APIRouter, HTTPException
from app.services.health_service import get_health_status

router = APIRouter()


@router.get("/")
async def root():
    try:
        return await get_health_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {e}")
