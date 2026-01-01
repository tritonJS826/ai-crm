from app.events.domain import (
    publish_event,
    get_published_events,
    clear_event_sink,
)

import pytest


@pytest.mark.asyncio
async def test_domain_event_is_published():
    clear_event_sink()

    await publish_event("user_created", {"id": "123"})

    events = get_published_events()
    assert events == [("user_created", {"id": "123"})]
