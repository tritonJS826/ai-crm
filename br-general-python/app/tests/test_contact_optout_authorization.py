import pytest
from uuid import uuid4

from prisma import Prisma

from app.repositories.conversation_repository import conversation_repo
from app.schemas.conversation import ConversationStatus
from app.schemas.platform import Platform

pytestmark = pytest.mark.asyncio(loop_scope="session")


@pytest.fixture
async def prisma():
    client = Prisma()
    await client.connect()
    try:
        yield client
    finally:
        await client.disconnect()


async def _create_user(prisma: Prisma):
    # NOTE: removed "role" because your schema doesn't have it
    return await prisma.user.create(
        data={
            "id": str(uuid4()),
            "name": "Test User",
            "email": f"test-{uuid4()}@example.com",
            "hashed_password": "fake-hash",
        }
    )


async def _create_contact(prisma: Prisma):
    return await prisma.contact.create(
        data={
            "id": str(uuid4()),
            "name": "Test Contact",
            "platform": Platform.WHATSAPP,
            "platformUserId": str(uuid4()),
            "optOut": False,
        }
    )


async def _create_conversation(prisma: Prisma, *, user_id: str, contact_id: str):
    conversation = await prisma.conversation.create(
        data={
            "id": str(uuid4()),
            "contactId": contact_id,
            "status": ConversationStatus.OPEN,
        }
    )

    await prisma.conversationparticipant.create(
        data={
            "conversationId": conversation.id,
            "userId": user_id,
        }
    )

    return conversation


async def test_user_has_no_access_without_conversation(prisma: Prisma):
    user = await _create_user(prisma)
    contact = await _create_contact(prisma)

    has_access = await conversation_repo.user_has_conversation_with_contact(
        prisma,
        user_id=user.id,
        contact_id=contact.id,
    )

    assert has_access is False


async def test_user_has_access_with_conversation(prisma: Prisma):
    user = await _create_user(prisma)
    contact = await _create_contact(prisma)

    await _create_conversation(prisma, user_id=user.id, contact_id=contact.id)

    has_access = await conversation_repo.user_has_conversation_with_contact(
        prisma,
        user_id=user.id,
        contact_id=contact.id,
    )

    assert has_access is True
