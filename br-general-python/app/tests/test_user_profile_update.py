import random
import pytest
from httpx import AsyncClient, ASGITransport
from jose import jwt
from datetime import datetime, timezone
from app.main import app
from app.settings import settings
from app.db import db

pytestmark = pytest.mark.asyncio(loop_scope="session")


@pytest.mark.asyncio
@pytest.mark.parametrize("index", range(1, 6))  # 5 users
async def test_multiple_users_profile_and_tests(index):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=settings.base_url) as client:
        # 1 Register & login
        email = f"test_user_profile_{index}@example.com"
        password = f"StrongPass{index}!"
        name = f"User {index}"

        await client.post(
            "/br-general/auth/register",
            json={
                "email": email,
                "password": password,
                "name": name,
                "role": "PATIENT",
            },
        )

        form_data = {"username": email, "password": password}
        response = await client.post("/br-general/auth/login", data=form_data)
        assert response.status_code == 200
        tokens = response.json()["tokens"]

        decoded = jwt.decode(
            tokens["access_token"],
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        user_id = decoded["sub"]

        headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        # 2 Update profile with random city, phone, language
        update_data = {
            "city": random.choice(
                ["Berlin", "Munich", "Dresden", "Hamburg", "Cologne"]
            ),
            "phone": f"+49 176 {random.randint(10000000, 99999999)}",
            "language": random.choice(["Deutsch", "English", "Deutsch, English"]),
        }
        response = await client.patch(
            "/br-general/users/me/profile", json=update_data, headers=headers
        )
        assert response.status_code == 204, f"Unexpected status: {response.status_code}"

        # 3 Verify DB update
        db_user = await db.user.find_unique(where={"id": user_id})
        assert db_user.city == update_data["city"]
        assert db_user.phone == update_data["phone"]
        assert db_user.language == update_data["language"]

        # 4. create topic (or reuse existing)
        topic_title = "Focus and Attention"
        topic = await db.topic.find_first(where={"title": topic_title})
        if not topic:
            topic = await db.topic.create(data={"title": topic_title})

        # 4.1 create fake test under this topic
        test = await db.test.create(
            data={
                "title": f"TEST-{index} Focus Evaluation",
                "description": f"TEST-{index} Evaluates attention and response speed.",
                "topicId": topic.id,
            }
        )

        num_sessions = random.randint(1, 3)
        for _ in range(num_sessions):
            await db.testsession.create(
                data={
                    "user": {"connect": {"id": user_id}},
                    "test": {"connect": {"id": test.id}},
                    "createdAt": datetime.now(timezone.utc),
                    "finishedAt": datetime.now(timezone.utc),
                }
            )

        # 5 Call /me/tests/{test_id}
        url = f"/br-general/users/me/tests/{test.id}"
        response = await client.get(url, headers=headers)
        assert response.status_code == 200, response.text
        data = response.json()

        # 6 Validate response
        assert data["test_id"] == test.id
        assert data["title"] == test.title
        assert data["description"] == test.description
        assert "sessions" in data
        assert len(data["sessions"]) == num_sessions
        for s in data["sessions"]:
            assert s["created_at"]
            assert s["finished_at"]
            assert "answers" in s
            assert isinstance(s["answers"], list)

        print(f"User {index} ({email}) — Profile & {num_sessions} session(s) OK")


@pytest.fixture(autouse=True)
async def cleanup_users():
    """Cleans up test users after each test file."""
    yield
    # Cleanup test data
    await db.testsession.delete_many(
        where={"user": {"email": {"contains": "test_user_profile_"}}}
    )
    await db.test.delete_many(where={"title": {"contains": "TEST-"}})
    await db.user.delete_many(where={"email": {"contains": "test_user_profile_"}})
