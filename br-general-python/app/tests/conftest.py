import pytest
from app.db import db


@pytest.fixture(scope="session", autouse=True)
async def prisma_connection():
    """Connect Prisma once per test session."""
    if not getattr(db._internal_engine, "process", None):
        await db.connect()
    yield
    if getattr(db._internal_engine, "process", None):
        await db.disconnect()
