import pytest

from httpx import AsyncClient, ASGITransport
from app.main import app
from app.settings import settings
from app.db import db

pytestmark = pytest.mark.asyncio(loop_scope="session")


async def _pgss_installed() -> bool:
    """Checking pg_stat_statements was installed into current db."""
    try:
        rows = await db.query_raw(
            "SELECT COUNT(*)::int AS n FROM pg_extension WHERE extname = 'pg_stat_statements';"
        )
        return rows and rows[0]["n"] > 0
    except Exception:
        return False


@pytest.mark.asyncio
async def test_stats_top_sql_works():
    if not await _pgss_installed():
        pytest.skip("pg_stat_statements is not installed in this database")

    for i in range(15):
        await db.query_raw("SELECT $1::int AS x;", i)
    for _ in range(5):
        await db.query_raw("SELECT now();")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=settings.base_url) as client:
        r = await client.get(
            "/br-general/stats/top-sql?limit=5&sort_by=total&min_calls=1"
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert "items" in data and isinstance(data["items"], list)
        assert len(data["items"]) <= 5
        if data["items"]:
            row = data["items"][0]
            for k in ("query", "calls", "total_ms", "mean_ms"):
                assert k in row

        r2 = await client.get("/br-general/stats/top-sql?limit=3&sort_by=calls")
        assert r2.status_code == 200, r2.text

        r3 = await client.get("/br-general/stats/top-sql?sort_by=bad")
        assert r3.status_code in (400, 422)
