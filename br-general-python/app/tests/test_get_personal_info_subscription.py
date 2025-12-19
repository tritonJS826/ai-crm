import random

import pytest
from httpx import AsyncClient, ASGITransport

from jose import jwt
from datetime import datetime, timedelta

from app.main import app
from app.settings import settings

from app.schemas.user import Plan, Role

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
        role = random.choice([Role.PATIENT, Role.DOCTOR])
        user_data = {
            "email": email,
            "password": password,
            "name": name,
            "role": role,
        }
        await client.post("/br-general/auth/register", json=user_data)

        # 2 login
        form_data = {"username": email, "password": password}
        response = await client.post("/br-general/auth/login", data=form_data)
        assert response.status_code == 200, response.text
        tokens = response.json()["tokens"]

        decoded = jwt.decode(
            tokens["access_token"],
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        user_id = decoded["sub"]

        # Check if user already has a subscription
        existing_sub = await db.subscription.find_first(where={"userId": user_id})
        if existing_sub:
            # Optionally skip creation or log info
            # print(f"User {user_id} already has a subscription ({existing_sub.plan}), skipping creation.")
            plan = existing_sub.plan
            consultations_included = existing_sub.consultationsIncluded
            consultations_used = existing_sub.consultationsUsed

        else:
            random_day = random.randint(1, 365)
            started_at = datetime(2025, 1, 1) + timedelta(days=random_day)
            ends_at = started_at + timedelta(days=random.randint(15, 90))
            consultations_included = random.randint(1, 10)
            consultations_used = random.randint(0, 5)
            plan = random.choice([Plan.FREE, Plan.BASIC])

            await db.subscription.create(
                data={
                    "user": {"connect": {"id": user_id}},  # link by relation
                    "plan": plan,
                    "startedAt": started_at,
                    "endsAt": ends_at,
                    "consultationsIncluded": consultations_included,
                    "consultationsUsed": consultations_used,
                }
            )

        # 4 call /me/personal
        headers = {"Authorization": f"Bearer {tokens['access_token']}"}
        response = await client.get("/br-general/users/me/personal", headers=headers)
        assert response.status_code == 200, response.text
        data = response.json()

        # 5 verify subscription exists in DB
        sub = await db.subscription.find_first(where={"userId": user_id})
        assert sub is not None, f"No subscription found for user {user_id}"

        # 6 check consistency between DB record and API response
        assert sub.plan == plan, f"Plan mismatch: {sub.plan} != {plan}"
        assert sub.consultationsUsed == consultations_used
        assert sub.consultationsIncluded == consultations_included

        expected_days_to_end = (sub.endsAt - sub.startedAt).days
        assert data["days_to_end"] == expected_days_to_end, (
            f"Expected {expected_days_to_end}, got {data['days_to_end']}"
        )
        assert 15 <= expected_days_to_end <= 90


@pytest.mark.asyncio
async def test_existing_subscription_branch():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=settings.base_url) as client:
        email = "personal_existing@example.com"
        password = "StrongPass!"
        name = "Existing User"
        role = Role.PATIENT

        await client.post(
            "/br-general/auth/register",
            json={"email": email, "password": password, "name": name, "role": role},
        )

        form_data = {"username": email, "password": password}
        response = await client.post("/br-general/auth/login", data=form_data)
        tokens = response.json()["tokens"]
        decoded = jwt.decode(
            tokens["access_token"],
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        user_id = decoded["sub"]

        # Pre-create subscription
        plan = random.choice([Plan.FREE, Plan.BASIC])
        await db.subscription.create(
            data={
                "user": {"connect": {"id": user_id}},
                "plan": plan,
                "startedAt": datetime(2025, 1, 1),
                "endsAt": datetime(2025, 2, 1),
                "consultationsIncluded": 3,
                "consultationsUsed": 1,
            }
        )

        # Now call /me/personal again (this triggers the "existing_sub" branch)
        headers = {"Authorization": f"Bearer {tokens['access_token']}"}
        response = await client.get("/br-general/users/me/personal", headers=headers)
        assert response.status_code == 200
        data = response.json()

        assert data["plan"] == plan
        assert data["consultations_used"] == 1
        assert data["consultations_included"] == 3


@pytest.fixture(autouse=True)
async def cleanup_users():
    """Cleans up test users after each test file."""
    yield
    # cleanup after test
    await db.user.delete_many(where={"email": {"contains": "personal_user_"}})
