import pytest
from app.ws.manager import ws_manager
from app.ws.dispatcher import emit

pytestmark = pytest.mark.asyncio


class FakeWS:
    def __init__(self):
        self.messages = []

    async def send_json(self, data):
        self.messages.append(data)


async def test_global_broadcast():
    ws1 = FakeWS()
    ws2 = FakeWS()

    ws_manager.connections = {
        "c1": type("C", (), {"ws": ws1})(),
        "c2": type("C", (), {"ws": ws2})(),
    }

    await ws_manager.broadcast_all({"type": "ping"})

    assert ws1.messages == [{"type": "ping"}]
    assert ws2.messages == [{"type": "ping"}]


async def test_scope_broadcast_only_to_subscribers():
    ws1 = FakeWS()
    ws2 = FakeWS()

    ws_manager.connections = {
        "c1": type("C", (), {"ws": ws1})(),
        "c2": type("C", (), {"ws": ws2})(),
    }

    ws_manager.subscribe("c1", "ws:conversation:room-1")

    await ws_manager.broadcast_scope(
        "ws:conversation:room-1",
        {"type": "msg"},
    )

    assert ws1.messages == [{"type": "msg"}]
    assert ws2.messages == []


async def test_emit_routes_by_conversation_id(monkeypatch):
    called = {"all": 0, "scope": 0}

    async def fake_all(msg):
        called["all"] += 1

    async def fake_scope(scope, msg):
        called["scope"] += 1
        assert scope == "ws:conversation:123"

    monkeypatch.setattr(ws_manager, "broadcast_all", fake_all)
    monkeypatch.setattr(ws_manager, "broadcast_scope", fake_scope)

    await emit("event", {"conversation_id": "123"})
    await emit("event", {"foo": "bar"})

    assert called["scope"] == 1
    assert called["all"] == 1
