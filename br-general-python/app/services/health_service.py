from datetime import datetime, timezone

from app.ws.event_types import WSEventType
from app.db import db
from app.ws.dispatcher import emit


async def get_health_status() -> dict:
    timestamp = datetime.now(timezone.utc).isoformat()

    # Sanity check: db.user must look like a model
    if not hasattr(db.user, "count"):
        raise RuntimeError("DB user model is invalid")

    users_count = None
    db_status = "ok"

    try:
        users_count = await db.user.count()
    except Exception:
        # DB unreachable but wiring is intact
        db_status = "unavailable"

    if db_status == "ok":
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
        "db": db_status,
        "users": users_count,
    }
