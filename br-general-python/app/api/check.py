from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
import uuid

from app.events.domain import publish_event

from ..settings import settings

router = APIRouter()


@router.post("/ping")
async def ping(payload: dict):
    await publish_event(
        event_type="check_event",
        payload=payload,
    )

    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.post("/inbound-message")
async def inbound_message(payload: dict):
    message = {
        "id": str(uuid.uuid4()),
        "direction": "in",
        "text": payload["text"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await publish_event(
        event_type="new_message",
        payload={
            "conversation_id": payload["conversation_id"],
            "message": message,
        },
    )

    return {"status": "ok"}


@router.post("/broadcast")
async def broadcast_event(payload: dict):
    if not settings.enable_ws_broadcast_endpoint:
        raise HTTPException(status_code=404)

    await publish_event(
        event_type="check_event",
        payload=payload,
    )

    return {"status": "ok"}
