import pytest

from httpx import AsyncClient, ASGITransport
from app.main import app

from datetime import datetime, timezone

from app.ws.event_types import WSEventType
from app.ws.dispatcher import emit

from app.settings import settings
from app.db import db

pytestmark = pytest.mark.asyncio(loop_scope="session")


@pytest.mark.asyncio
async def get_health_status() -> dict:
    timestamp = datetime.now(timezone.utc).isoformat()

    try:
        users_count = await db.user.count()
    except Exception as e:
        # Any DB failure is considered unhealthy
        raise RuntimeError("Database health check failed") from e

    await emit(
        WSEventType.HEALTH_PING,
        {
            "users": users_count,
            "timestamp": timestamp,
        },
    )

    return {
        "status": "ok",
        "timestamp": timestamp,
        "users": users_count,
    }


class FakeUserModel:
    async def count(self):
        raise Exception("Simulated DB failure")


@pytest.mark.asyncio
async def test_health_check_always_ok():
    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport,
        base_url=settings.base_url,
    ) as client:
        response = await client.get("/br-general/health/")
        assert response.status_code == 200


@pytest.mark.asyncio
async def test_ready_check_failure(monkeypatch):
    async def broken_execute_raw(*args, **kwargs):
        raise Exception("Simulated DB failure")

    monkeypatch.setattr(type(db), "execute_raw", broken_execute_raw)

    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport,
        base_url=settings.base_url,
    ) as client:
        response = await client.get("/br-general/ready-db")
        assert response.status_code == 503


@pytest.fixture(autouse=True)
async def cleanup_users():
    """Cleans up test users after each test file."""
    yield
