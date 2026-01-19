import logging
from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient

from app.api import email as email_module
from app.main import app
from app.schemas.user import Role


@pytest.fixture
def client():
    with TestClient(app) as client:
        yield client


def get_test_token(client):
    client.post(
        "/br-general/auth/register",
        json={
            "email": "admin@test.com",
            "password": "password123",
            "name": "Admin",
            "role": Role.ADMIN,
        },
    )

    response = client.post(
        "/br-general/auth/login",
        data={
            "username": "admin@test.com",
            "password": "password123",
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert response.status_code == 200
    return response.json()["access_token"]


def test_send_email_ok(monkeypatch, client):
    """
    Positive scenario: the endpoint returns 202, and the background task
    calls email_service.send(...) exactly once with the expected arguments.
    The TestClient waits for BackgroundTasks to complete.
    """

    mock_send = AsyncMock(return_value=True)
    monkeypatch.setattr(email_module.EmailService, "send", mock_send)
    payload = {
        "to": "user@example.com",
        "subject": "Hello",
        "text": "Plain text",
        "html": "<b>Hi</b>",
        "template": None,
        "params": {},
    }

    access_token = get_test_token(client)

    res = client.post(
        "/br-general/email/send",
        json=payload,
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert res.status_code == 202
    body = res.json()
    assert body["accepted"] is True
    assert body["message"] == "Email scheduled for delivery"

    mock_send.assert_awaited_once()
    mock_send.assert_awaited_with(
        to="user@example.com",
        subject="Hello",
        text="Plain text",
        html="<b>Hi</b>",
        template=None,
        params={},
    )


def test_send_email_logs_on_failure(monkeypatch, caplog, client):
    """
    Negative scenario: email_service.send raises an exception.
    The endpoint still responds with 202 (fire-and-forget),
    and the error must be written to logs.
    """

    # Define a "failing" async function to replace send(...)
    async def boom(**kwargs):
        raise RuntimeError("SMTP down")

    monkeypatch.setattr(email_module.EmailService, "send", boom)
    caplog.set_level(logging.ERROR)
    payload = {
        "to": "user@example.com",
        "subject": "Hello",
        "text": "Plain text",
        "html": None,
        "template": None,
        "params": {},
    }

    access_token = get_test_token(client)

    res = client.post(
        "/br-general/email/send",
        json=payload,
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert res.status_code == 202
    body = res.json()
    assert body["accepted"] is True
    assert body["message"] == "Email scheduled for delivery"
    assert any("Email send failed:" in r.message for r in caplog.records)
