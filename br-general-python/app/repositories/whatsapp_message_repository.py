from typing import Any
from datetime import datetime, timezone
from prisma.errors import UniqueViolationError
from app.db import db


async def save_inbound_whatsapp_message(data: dict[str, Any]) -> None:
    try:
        await db.messages.create(
            data={
                "platform": "whatsapp",
                "direction": "in",
                "remote_message_id": data["message_id"],
                "text": data.get("text"),
                "created_at": datetime.fromtimestamp(
                    int(data["timestamp"]), tz=timezone.utc
                ),
            }
        )
    except UniqueViolationError:
        # Duplicate webhook delivery — safe to ignore
        return
