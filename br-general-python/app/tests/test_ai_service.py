import pytest

from app.services.ai_service import AIService, AISuggestionError


@pytest.mark.asyncio
async def test_fallback_when_no_api_key():
    """
    When no API key is provided, the service must return fallback suggestions
    and never raise.
    """
    service = AIService(api_key=None)

    result = await service.generate_agent_suggestions(
        messages=[{"direction": "IN", "text": "Hello"}],
        max_suggestions=2,
    )

    assert isinstance(result, list)
    assert len(result) == 2
    assert all(isinstance(item, str) for item in result)


@pytest.mark.asyncio
async def test_fallback_respects_max_suggestions():
    """
    max_suggestions must be respected in fallback mode.
    """
    service = AIService(api_key=None)

    result = await service.generate_agent_suggestions(
        messages=[{"direction": "IN", "text": "Hi"}],
        max_suggestions=1,
    )

    assert len(result) == 1


@pytest.mark.asyncio
async def test_empty_messages_still_return_suggestions():
    """
    Service should be resilient to empty input.
    """
    service = AIService(api_key=None)

    result = await service.generate_agent_suggestions(
        messages=[],
        max_suggestions=3,
    )

    assert len(result) == 3


@pytest.mark.asyncio
async def test_timeout_raises_domain_error(monkeypatch):
    """
    A timeout from the LLM must raise AISuggestionError.
    """

    service = AIService(api_key="fake-key")

    class FakeClient:
        class chat:
            class completions:
                @staticmethod
                def create(*args, **kwargs):
                    raise TimeoutError()

    # Monkeypatch OpenAI client construction
    monkeypatch.setattr(
        "app.services.ai_service.OpenAI",
        lambda api_key: FakeClient(),
    )

    with pytest.raises(AISuggestionError):
        await service.generate_agent_suggestions(
            messages=[{"direction": "IN", "text": "Hello"}],
        )
