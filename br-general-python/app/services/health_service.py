from datetime import datetime, timezone

from app.ws.event_types import WSEventType

from app.db import db
from app.ws.dispatcher import emit


async def get_health_status() -> dict:
    users_count = await db.user.count()
    timestamp = datetime.now(timezone.utc).isoformat()

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
        "users": users_count,
    }
