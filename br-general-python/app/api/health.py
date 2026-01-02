from datetime import datetime, timezone
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def root():
    # Liveness probe: process is running
    return {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
