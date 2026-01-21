from datetime import datetime, UTC

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.user import Role
from app.services.ai_service import AISuggestionError

from app.api.auth import oauth2_scheme
from app.api.users import get_current_user

client = TestClient(app)


@pytest.fixture
def auth_override_factory():
    def set_user(role):
        class FakeUser:
            def __init__(self, role):
                self.id = "user-id"
                self.role = role

        app.dependency_overrides[oauth2_scheme] = lambda: "fake-token"
        app.dependency_overrides[get_current_user] = lambda: FakeUser(role=role)

    yield set_user
    app.dependency_overrides.clear()


class FakeConversation:
    id = "test-conv-id"
    contactId = "contact-id"
    status = "open"
    lastMessageAt = None
    createdAt = None
    contact = None


def _auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def agent_token():
    # reuse whatever helper / fixture you already use in other tests
    return "agent-token"


@pytest.fixture
def user_token():
    return "user-token"


@pytest.mark.asyncio
async def test_agent_can_create_suggestions(monkeypatch, auth_override_factory):
    set_user = auth_override_factory  # ✅ get callable
    set_user(Role.AGENT)  # ✅ call callable

    async def fake_generate(*_, **__):
        return ["Test suggestion"]

    monkeypatch.setattr(
        "app.api.conversations.ai_service.generate_agent_suggestions",
        fake_generate,
    )

    async def fake_get_by_id(*_):
        return FakeConversation()

    monkeypatch.setattr(
        "app.api.conversations.conversation_repo.get_by_id",
        fake_get_by_id,
    )

    async def fake_can_access(*_, **__):
        return True

    monkeypatch.setattr(
        "app.api.conversations.can_user_access_conversation",
        fake_can_access,
    )

    async def fake_get_messages(*_, **__):
        return []

    monkeypatch.setattr(
        "app.api.conversations.message_repo.get_by_conversation",
        fake_get_messages,
    )

    async def fake_create_suggestion(*_, **__):
        return {
            "id": "suggestion-id",
            "conversationId": "test-conv-id",
            "text": "Test suggestion",
            "createdAt": datetime.now(UTC),
        }

    monkeypatch.setattr(
        "app.api.conversations.suggestion_repo.create",
        fake_create_suggestion,
    )

    response = client.post(
        "/br-general/conversations/test-conv-id/suggestions",
        headers={"Authorization": "Bearer fake"},
    )

    assert response.status_code == 200


@pytest.mark.asyncio
async def test_non_agent_forbidden(monkeypatch, auth_override_factory):
    set_user = auth_override_factory
    set_user("customer")  # non-agent role

    async def fake_generate(*_, **__):
        return ["Test suggestion"]

    monkeypatch.setattr(
        "app.api.conversations.ai_service.generate_agent_suggestions",
        fake_generate,
    )

    async def fake_get_by_id(*_):
        return FakeConversation()

    monkeypatch.setattr(
        "app.api.conversations.conversation_repo.get_by_id",
        fake_get_by_id,
    )

    async def fake_can_access(*_, **__):
        return True

    monkeypatch.setattr(
        "app.api.conversations.can_user_access_conversation",
        fake_can_access,
    )

    response = client.post(
        "/br-general/conversations/test-conv-id/suggestions",
        headers={"Authorization": "Bearer fake"},
    )

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_ai_failure_maps_to_503(monkeypatch, auth_override_factory):
    set_user = auth_override_factory
    set_user(Role.AGENT)

    async def fake_generate(*_, **__):
        raise AISuggestionError("boom")

    monkeypatch.setattr(
        "app.api.conversations.ai_service.generate_agent_suggestions",
        fake_generate,
    )

    async def fake_get_by_id(*_):
        return FakeConversation()

    monkeypatch.setattr(
        "app.api.conversations.conversation_repo.get_by_id",
        fake_get_by_id,
    )
    monkeypatch.setattr(
        "app.api.conversations.can_user_access_conversation",
        lambda *_, **__: True,
    )

    async def fake_can_access(*_, **__):
        return True

    monkeypatch.setattr(
        "app.api.conversations.can_user_access_conversation",
        fake_can_access,
    )

    async def fake_get_messages(*_, **__):
        return []

    monkeypatch.setattr(
        "app.api.conversations.message_repo.get_by_conversation",
        fake_get_messages,
    )

    response = client.post(
        "/br-general/conversations/test-conv-id/suggestions",
        headers={"Authorization": "Bearer fake"},
    )

    assert response.status_code == 503
    assert response.json()["detail"] == "AI suggestions temporarily unavailable"
