from datetime import datetime, timezone

from app.ws.event_types import WSEventType
from app.db import db
from app.ws.dispatcher import emit


from fastapi import HTTPException
from app.logging import logger


async def get_health_status() -> dict:
    timestamp = datetime.now(timezone.utc).isoformat()

    try:
        users_count = await db.user.count()
    except Exception:
        logger.exception("Health check failed: database unavailable")
        raise HTTPException(
            status_code=503,
            detail="Database unavailable",
        )

    await emit(
        WSEventType.HEALTH_PING,
        {
            "users": users_count,
            "timestamp": timestamp,
        },
    )

    return {
        "status": "ok",
        "timestamp": timestamp,
        "db": "ok",
        "users": users_count,
    }
