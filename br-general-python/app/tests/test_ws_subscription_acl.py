import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.ws.manager import ws_manager
from app.api import websocket as ws_api


@pytest.fixture
def client():
    return TestClient(app)


def test_ws_subscribe_allowed(monkeypatch, client):
    monkeypatch.setattr(
        ws_api.auth_service,
        "decode_token",
        lambda _: {"sub": "u1", "exp": 9999999999, "role": "user"},
    )

    async def allow(**_):
        return True

    monkeypatch.setattr(
        "app.api.websocket.can_subscribe_to_conversation",
        allow,
    )

    with client.websocket_connect("/br-general/ws/ws?token=fake") as ws:
        ws.send_json(
            {
                "type": "subscribe",
                "scope": "conversation",
                "id": "c1",
            }
        )

        conn = next(iter(ws_manager.connections.values()))
        assert "ws:conversation:c1" in ws_manager._scopes_by_connection[conn.id]


def test_ws_subscribe_forbidden(monkeypatch, client):
    monkeypatch.setattr(
        ws_api.auth_service,
        "decode_token",
        lambda _: {"sub": "u1", "exp": 9999999999, "role": "user"},
    )

    # mock ACL → forbidden
    async def deny(**_):
        return False

    monkeypatch.setattr(
        "app.api.websocket.can_subscribe_to_conversation",
        deny,
    )

    with client.websocket_connect("/br-general/ws/ws?token=fake") as ws:
        ws.send_json(
            {
                "type": "subscribe",
                "scope": "conversation",
                "id": "c1",
            }
        )

        msg = ws.receive_json()
        assert msg["type"] == "error"
        assert msg["code"] == "forbidden"

        with pytest.raises(Exception):
            ws.receive_json()
