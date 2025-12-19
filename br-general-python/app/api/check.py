from fastapi import APIRouter
from app.ws.manager import ws_manager
from app.ws.events import ws_event
from datetime import datetime
import uuid

router = APIRouter(prefix="/check", tags=["check"])


@router.post("/ping")
async def ping(payload: dict):
    await ws_manager.broadcast(ws_event("check_event", payload))
    return {"status": "ok"}


@router.post("/inbound-message")
async def inbound_message(payload: dict):
    message = {
        "id": str(uuid.uuid4()),
        "direction": "in",
        "text": payload["text"],
        "created_at": datetime.utcnow().isoformat(),
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
