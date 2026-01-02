import time as time_mod
from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.ws.manager import ws_manager
from app.api import websocket as ws_api  # this module holds auth_service + endpoint


@pytest.fixture(autouse=True)
def reset_ws_manager_state():
    # hard reset between tests (in-memory singleton)
    ws_manager.connections.clear()
    ws_manager._scopes_by_connection.clear()
    ws_manager._connections_by_scope.clear()
    yield
    ws_manager.connections.clear()
    ws_manager._scopes_by_connection.clear()
    ws_manager._connections_by_scope.clear()


@pytest.fixture
def client():
    return TestClient(app)


def _mock_decode_token(monkeypatch, *, sub="user-1", exp=None):
    if exp is None:
        exp = int(time_mod.time()) + 3600

    def fake_decode_token(_token: str):
        return {"sub": sub, "exp": exp}

    monkeypatch.setattr(ws_api.auth_service, "decode_token", fake_decode_token)


def _get_single_connection_id() -> str:
    assert len(ws_manager.connections) == 1
    return next(iter(ws_manager.connections.keys()))


def test_ws_closes_when_token_expired(client, monkeypatch):
    # token already expired
    _mock_decode_token(monkeypatch, exp=int(time_mod.time()) - 5)

    with client.websocket_connect("/br-general/ws/ws?token=fake") as ws:
        # trigger the loop (any message works; ping is fine)
        ws.send_json({"type": "ping", "ts": 123})

        msg = ws.receive_json()
        assert msg["type"] == "error"
        assert msg["code"] == "token_expired"

        # after this, server closes; next recv should fail
        with pytest.raises(Exception):
            ws.receive_json()


def test_ws_closes_when_idle_timeout_exceeded(client, monkeypatch):
    # valid token
    _mock_decode_token(monkeypatch, exp=int(time_mod.time()) + 3600)

    with client.websocket_connect("/br-general/ws/ws?token=fake") as ws:
        conn_id = _get_single_connection_id()

        # make connection appear idle for > 2 hours
        ws_manager.connections[conn_id].last_seen = datetime.now(
            timezone.utc
        ) - timedelta(hours=3)

        # send "real" message to trigger idle check (ping does not update last_seen anyway)
        ws.send_json({"type": "subscribe", "scope": "conversation", "id": "abc"})

        msg = ws.receive_json()
        assert msg["type"] == "error"
        assert msg["code"] == "idle_timeout"

        with pytest.raises(Exception):
            ws.receive_json()
