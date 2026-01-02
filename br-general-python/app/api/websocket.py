from fastapi import APIRouter, WebSocket
from app.ws.manager import ws_manager

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    connection_id = await ws_manager.connect(websocket)

    try:
        while True:
            data = await websocket.receive_json()

            if data.get("action") == "subscribe":
                ws_manager.subscribe(
                    connection_id,
                    data["conversation_id"],
                )
    except Exception:
        ws_manager.disconnect(connection_id)
