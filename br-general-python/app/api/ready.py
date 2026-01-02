from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone

from app.db import db
from app.logging import logger

router = APIRouter()


@router.get("/ready-db")
async def ready_db():
    try:
        await db.execute_raw("SELECT 1")
    except Exception:
        logger.exception("Readiness check failed: database unavailable")
        raise HTTPException(
            status_code=503,
            detail="Database unavailable",
        )

    return {
        "status": "ready",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
