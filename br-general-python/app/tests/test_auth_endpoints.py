import pytest
from httpx import AsyncClient, ASGITransport

from jose import jwt
from datetime import datetime, timedelta, timezone

from app.main import app
from app.db import db
from app.settings import settings
from app.services.auth_service import AuthService

auth_service = AuthService()

pytestmark = pytest.mark.asyncio(loop_scope="session")


async def perform_user_flow(client, email, password, name, role="PATIENT"):
    # 1. Register user
    user_data = {"email": email, "password": password, "name": name, "role": role}
    response = await client.post("/br-general/auth/register", json=user_data)
    assert response.status_code in (200, 400), response.text  # ok if already exists

    # 2. Login
    form_data = {"username": email, "password": password}
    response = await client.post("/br-general/auth/login", data=form_data)
    assert response.status_code == 200, response.text
    tokens = response.json()["tokens"]

    # 3. /me check
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}
    response = await client.get("/br-general/users/me", headers=headers)
    assert response.status_code == 200, response.text
    me_data = response.json()
    assert me_data["user"]["email"] == email

    # 4. /refresh check
    payload = {
        "access_token": tokens["access_token"],
        "refresh_token": tokens["refresh_token"],
    }
    response = await client.post("/br-general/auth/refresh", json=payload)
    assert response.status_code == 200, response.text
    new_tokens = response.json()["tokens"]
    assert new_tokens["access_token"] != tokens["access_token"]
    return new_tokens


@pytest.mark.asyncio
@pytest.mark.parametrize("index", range(1, 6))  # 5 users
async def test_multiple_users(index):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=settings.base_url) as client:
        email = f"multi_user_{index}@example.com"
        password = f"StrongPass{index}!"
        name = f"User {index}"

        new_tokens = await perform_user_flow(client, email, password, name)

        # Optional: test that tokens decode correctly
        decoded = jwt.decode(
            new_tokens["access_token"],
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        assert "sub" in decoded


@pytest.mark.asyncio
async def test_register_and_login_and_me():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=settings.base_url) as client:
        # register user
        user_data = {
            "email": "test_expire@example.com",
            "password": "strongpass123",
            "name": "Expire Test",
            "role": "PATIENT",
        }
        response = await client.post("/br-general/auth/register", json=user_data)
        assert response.status_code in (200, 400)  # 400 if already exists

        # login user
        form_data = {"username": user_data["email"], "password": user_data["password"]}
        response = await client.post("/br-general/auth/login", data=form_data)
        assert response.status_code == 200, response.text
        tokens = response.json()["tokens"]
        assert "access_token" in tokens
        assert "refresh_token" in tokens

        # get /me using access token
        headers = {"Authorization": f"Bearer {tokens['access_token']}"}
        response = await client.get("/br-general/users/me", headers=headers)
        assert response.status_code == 200, response.text
        me_data = response.json()
        assert me_data["user"]["email"] == user_data["email"]

        # call /refresh
        payload = {
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
        }
        response = await client.post("/br-general/auth/refresh", json=payload)
        assert response.status_code == 200, response.text
        new_tokens = response.json()["tokens"]
        assert new_tokens["access_token"] != tokens["access_token"]

        # test /me with expired or invalid token (simulate)
        bad_headers = {"Authorization": "Bearer invalidtoken123"}
        response = await client.get("/br-general/users/me", headers=bad_headers)
        assert response.status_code == 401


@pytest.mark.asyncio
async def test_auto_refresh_on_expired_token():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=settings.base_url) as client:
        # Register user (if not exists)
        user_data = {
            "email": "test_expire@example.com",
            "password": "strongpass123",
            "name": "Expire Test",
            "role": "PATIENT",
        }
        await client.post("/br-general/auth/register", json=user_data)

        # Login user
        form_data = {"username": user_data["email"], "password": user_data["password"]}
        response = await client.post("/br-general/auth/login", data=form_data)
        assert response.status_code == 200
        tokens = response.json()["tokens"]

        decoded = jwt.decode(
            tokens["access_token"],
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        user_id = decoded["sub"]

        # Create expired token for that user
        payload = {
            "sub": user_id,
            "exp": datetime.now(timezone.utc) - timedelta(minutes=10),
            "type": "access",
        }
        expired_access = jwt.encode(
            payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
        )

        # Call /me with expired token and valid refresh token
        headers = {
            "Authorization": f"Bearer {expired_access}",
            "x-refresh-token": tokens["refresh_token"],
        }
        response = await client.get("/br-general/users/me", headers=headers)

        assert response.status_code == 200, response.text
        body = response.json()

        # The backend should have issued new tokens
        assert "tokens" in body
        assert body["tokens"]["access_token"] != expired_access
        assert body["tokens"]["refresh_token"] == tokens["refresh_token"]


@pytest.fixture(autouse=True)
async def cleanup_users():
    """Cleans up test users after each test file."""
    yield
    await db.user.delete_many(where={"email": {"contains": "multi_user_"}})
    await db.user.delete_many(where={"email": {"contains": "test_expire@"}})
