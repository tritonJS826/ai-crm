import pytest
from httpx import AsyncClient, ASGITransport
from fastapi import status
from unittest.mock import patch

from app.schemas.user import Plan
from app.main import app
from app.db import db

pytestmark = pytest.mark.asyncio(loop_scope="session")


@pytest.mark.asyncio
@patch("app.api.payments.requests.post")
async def test_payment_create_with_real_user(mock_post):
    """
    Integration test:
    1. Register user
    2. Login to get access token
    3. Create payment (mocked YooKassa API)
    4. Simulate webhook event to create subscription
    5. Check DB subscription
    """
    transport = ASGITransport(app=app)

    # Mock YooKassa API response
    mock_post.return_value.status_code = 201
    mock_post.return_value.json.return_value = {
        "id": "test_payment_123",
        "status": "pending",
        "amount": {"value": "499.00", "currency": "RUB"},
        "confirmation": {"confirmation_url": "https://test.yookassa.ru/pay/123"},
        "description": "1-month subscription",
        "metadata": {"user_id": None},  # will be update latter
    }

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1 Register test user
        user_data = {
            "email": "pay_test_user@example.com",
            "password": "StrongPass1!",
            "name": "Payment Tester",
            "role": "PATIENT",
        }
        resp = await client.post("/br-general/auth/register", json=user_data)
        assert resp.status_code in (200, 400), resp.text

        # 2 Login to get tokens
        form_data = {"username": user_data["email"], "password": user_data["password"]}
        resp = await client.post("/br-general/auth/login", data=form_data)
        assert resp.status_code == 200, resp.text
        tokens = resp.json()["tokens"]
        access_token = tokens["access_token"]

        # 3 Create payment
        headers = {"Authorization": f"Bearer {access_token}"}
        resp = await client.post("/br-general/payment/create", headers=headers)
        assert resp.status_code == status.HTTP_200_OK, resp.text

        result = resp.json()
        assert "confirmation_url" in result
        assert "payment" in result

        # 4 Simulate webhook event (payment succeeded)
        user = await db.user.find_unique(where={"email": user_data["email"]})
        assert user is not None
        webhook_payload = {
            "event": "payment.succeeded",
            "object": {
                "id": result["payment"]["paymentId"],
                "amount": {"value": "499.00", "currency": "RUB"},
                "metadata": {"user_id": user.id},
            },
        }

        webhook_resp = await client.post(
            "/br-general/payment/webhook", json=webhook_payload
        )
        assert webhook_resp.status_code == 200, webhook_resp.text
        assert "subscription" not in webhook_resp.text or "ok" in webhook_resp.text

        # 5 Verify subscription was created
        subscription = await db.subscription.find_first(
            where={"userId": user.id}, order={"createdAt": "desc"}
        )
        assert subscription is not None
        assert subscription.plan == Plan.BASIC
        assert subscription.consultationsIncluded == 0
        assert subscription.consultationsUsed == 0
        assert subscription.endsAt > subscription.startedAt


@pytest.fixture(autouse=True)
async def cleanup_users():
    """Cleans up test users after each test file."""
    yield
    await db.user.delete_many(where={"email": {"contains": "pay_test_user@"}})
    await db.subscription.delete_many(
        where={"user": {"email": {"contains": "pay_test_user@"}}}
    )
