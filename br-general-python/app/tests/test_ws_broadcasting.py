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

    id1 = "c1"
    id2 = "c2"

    ws_manager.connections = {
        id1: type("C", (), {"ws": ws1})(),
        id2: type("C", (), {"ws": ws2})(),
    }

    await ws_manager.broadcast_all({"type": "ping"})

    assert ws1.messages == [{"type": "ping"}]
    assert ws2.messages == [{"type": "ping"}]


async def test_channel_broadcast_only_to_subscribers():
    ws1 = FakeWS()
    ws2 = FakeWS()

    ws_manager.connections = {
        "c1": type("C", (), {"ws": ws1})(),
        "c2": type("C", (), {"ws": ws2})(),
    }

    ws_manager.channels = {"room-1": {"c1"}}

    await ws_manager.broadcast_channel("room-1", {"type": "msg"})

    assert ws1.messages == [{"type": "msg"}]
    assert ws2.messages == []


async def test_emit_routes_by_conversation_id(monkeypatch):
    called = {"all": 0, "channel": 0}

    async def fake_all(msg):
        called["all"] += 1

    async def fake_channel(channel, msg):
        called["channel"] += 1

    monkeypatch.setattr(ws_manager, "broadcast_all", fake_all)
    monkeypatch.setattr(ws_manager, "broadcast_channel", fake_channel)

    await emit("event", {"conversation_id": "123"})
    await emit("event", {"foo": "bar"})

    assert called["channel"] == 1
    assert called["all"] == 1
