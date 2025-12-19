import pytest
from httpx import AsyncClient, ASGITransport
from jose import jwt
from datetime import datetime, timedelta, timezone

from app.main import app
from app.settings import settings
from app.db import db

pytestmark = pytest.mark.asyncio(loop_scope="session")


@pytest.mark.asyncio
async def test_login_wrong_password():
    """Invalid password should return 401"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=settings.base_url) as client:
        # Register first
        email = "auth_error@example.com"
        password = "CorrectPass123"
        await client.post(
            "/br-general/auth/register",
            json={
                "email": email,
                "password": password,
                "name": "Auth Err",
                "role": "PATIENT",
            },
        )

        # Wrong password
        form_data = {"username": email, "password": "WrongPass123"}
        response = await client.post("/br-general/auth/login", data=form_data)
        assert response.status_code == 401
        assert (
            "Invalid credentials" in response.text or "invalid" in response.text.lower()
        )


@pytest.mark.asyncio
async def test_refresh_with_invalid_token():
    """Invalid refresh token should return 401"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=settings.base_url) as client:
        # Dummy payload with invalid token
        payload = {"access_token": "fake", "refresh_token": "fake"}
        response = await client.post("/br-general/auth/refresh", json=payload)
        assert response.status_code == 401


@pytest.mark.asyncio
async def test_access_expired_token_with_refresh():
    """Expired access token but valid refresh token should succeed"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=settings.base_url) as client:
        email = "expired_token_user@example.com"
        password = "StrongPass!"
        await client.post(
            "/br-general/auth/register",
            json={
                "email": email,
                "password": password,
                "name": "ExpUser",
                "role": "PATIENT",
            },
        )

        # Login normally
        form_data = {"username": email, "password": password}
        response = await client.post("/br-general/auth/login", data=form_data)
        tokens = response.json()["tokens"]

        # Force-create expired access token
        decoded = jwt.decode(
            tokens["access_token"],
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        expired_payload = {
            "sub": decoded["sub"],
            "exp": datetime.now(timezone.utc) - timedelta(minutes=5),
            "type": "access",
        }
        expired_access = jwt.encode(
            expired_payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
        )

        headers = {
            "Authorization": f"Bearer {expired_access}",
            "x-refresh-token": tokens["refresh_token"],
        }

        response = await client.get("/br-general/users/me", headers=headers)
        # Should automatically refresh and succeed
        assert response.status_code == 200
        body = response.json()
        assert "tokens" in body or "user" in body


@pytest.fixture(autouse=True)
async def cleanup_users():
    """Cleans up test users after each test file."""
    yield
    await db.user.delete_many(where={"email": {"contains": "auth_error@"}})
    await db.user.delete_many(where={"email": {"contains": "expired_token_user@"}})
