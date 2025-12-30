from fastapi import APIRouter, HTTPException

from app.ws.dispatcher import emit
from app.ws.event_types import WSEventType
from app.ws.manager import ws_manager
from app.ws.events import ws_event
from datetime import datetime
import uuid

from ..settings import settings

router = APIRouter()


@router.post("/ping")
async def ping(payload: dict):
    await ws_manager.broadcast(ws_event("check_event", payload))
    timestamp = datetime.utcnow().isoformat()
    return {"status": "ok", "timestamp": timestamp}


@router.post("/inbound-message")
async def inbound_message(payload: dict):
    message = {
        "id": str(uuid.uuid4()),
        "direction": "in",
        "text": payload["text"],
        "created_at": datetime.now(datetime.UTC).isoformat(),
    }

    await ws_manager.broadcast(
        ws_event(
            "new_message",
            {
                "conversation_id": payload["conversation_id"],
                "message": message,
            },
        )
    )

    return {"status": "ok"}


@router.post("/broadcast")
async def broadcast_event(payload: dict):
    if not settings.enable_ws_broadcast_endpoint:
        raise HTTPException(status_code=404)

    await emit(
        WSEventType.CHECK_EVENT,
        payload,
    )
    return {"status": "ok"}
