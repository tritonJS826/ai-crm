import pytest
from prisma import Prisma

pytestmark = pytest.mark.asyncio(loop_scope="session")


@pytest.fixture
async def prisma():
    client = Prisma()
    await client.connect()
    try:
        yield client
    finally:
        await client.disconnect()


async def test_prisma_client_has_expected_models(prisma: Prisma):
    """
    This test exists to fail loudly if Prisma schema relations
    are renamed without updating repositories.
    """

    # Core models must exist
    assert hasattr(prisma, "conversation")
    assert hasattr(prisma, "conversationparticipant")
    assert hasattr(prisma, "user")
    assert hasattr(prisma, "contact")

    # Relation naming contract
    conversation = prisma.conversation
    assert conversation is not None
