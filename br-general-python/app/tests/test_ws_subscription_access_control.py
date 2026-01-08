import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.ws.manager import ws_manager
from app.api import websocket as ws_api


@pytest.fixture
def client():
    with TestClient(app) as client:
        yield client


def test_ws_subscribe_allowed(monkeypatch, client):
    monkeypatch.setattr(
        ws_api.auth_service,
        "decode_token",
        lambda _: {"sub": "u1", "exp": 9999999999, "role": "user"},
    )

    async def allow(**_):
        return True

    monkeypatch.setattr(
        "app.api.websocket.can_user_access_conversation",
        allow,
    )

    import time

    with client.websocket_connect("/br-general/ws/ws?token=fake") as ws:
        ws.send_json(
            {
                "type": "subscribe",
                "scope": "conversation",
                "id": "c1",
            }
        )

        # Wait (briefly) until the server processes the subscribe
        for _ in range(20):  # ~200ms max
            if ws_manager._scopes_by_connection:
                break
            time.sleep(0.01)

        conn = next(iter(ws_manager.connections.values()))
        assert "ws:conversation:c1" in ws_manager._scopes_by_connection[conn.id]


def test_ws_subscribe_admin_bypass(monkeypatch, client):
    monkeypatch.setattr(
        ws_api.auth_service,
        "decode_token",
        lambda _: {"sub": "admin1", "exp": 9999999999, "role": "admin"},
    )

    # ACL should NOT be called for admin
    called = {"count": 0}

    async def forbidden(**_):
        called["count"] += 1
        return False

    monkeypatch.setattr(
        "app.api.websocket.can_user_access_conversation",
        forbidden,
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
        assert called["count"] == 0


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
        "app.api.websocket.can_user_access_conversation",
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
