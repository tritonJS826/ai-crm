from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.api.auth import auth_service
from app.ws.manager import ws_manager

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008)
        return

    payload = auth_service.decode_token(token)
    if not payload:
        await websocket.close(code=1008)
        return

    user_id = payload.get("sub")
    if not user_id:
        await websocket.close(code=1008)
        return

    await websocket.accept()  # ✅ ACCEPT ONLY HERE

    connection_id = ws_manager.connect(
        websocket=websocket,
        user_id=str(user_id),
    )

    try:
        while True:
            await websocket.receive_json()
    except WebSocketDisconnect:
        ws_manager.disconnect(connection_id)
