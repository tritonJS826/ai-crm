import random

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.settings import settings

from app.db import db

pytestmark = pytest.mark.asyncio(loop_scope="session")


@pytest.mark.asyncio
@pytest.mark.parametrize("index", range(1, 6))  # 5 users
async def test_multiple_users_personal(index):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=settings.base_url) as client:
        # 1 register user
        email = f"personal_user_{index}@example.com"
        password = f"PersonalPass{index}!"
        name = f"PersonalUser {index}"
        role = random.choice(["PATIENT", "DOCTOR"])
        user_data = {"email": email, "password": password, "name": name, "role": role}
        await client.post("/br-general/auth/register", json=user_data)

        # 2 login
        form_data = {"username": email, "password": password}
        response = await client.post("/br-general/auth/login", data=form_data)
        assert response.status_code == 200, response.text
        tokens = response.json()["tokens"]

        # 3 call /me/personal
        headers = {"Authorization": f"Bearer {tokens['access_token']}"}
        response = await client.get("/br-general/users/me/personal", headers=headers)

        # 4 assertions
        assert response.status_code == 200, response.text
        data = response.json()
        assert data["email"] == email
        assert data["name"] == name
        assert data["role"] == role


@pytest.fixture(autouse=True)
async def cleanup_users():
    """Cleans up test users after each test file."""
    yield
    # cleanup after test
    await db.user.delete_many(where={"email": {"contains": "personal_user_"}})
