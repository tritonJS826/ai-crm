import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.settings import settings

pytestmark = pytest.mark.asyncio(loop_scope="session")


async def test_check_broadcast_endpoint(monkeypatch):
    # enable endpoint explicitly for this test
    monkeypatch.setattr(settings, "enable_ws_broadcast_endpoint", True)

    transport = ASGITransport(app=app)

    async with AsyncClient(
        transport=transport,
        base_url=settings.base_url,
    ) as client:
        response = await client.post(
            "/br-general/check/broadcast",
            json={"ping": "test"},
        )

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
