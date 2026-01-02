from app.repositories.conversation_participant_repository import (
    conversation_participant_repository,
)


async def can_subscribe_to_conversation(
    *,
    user_id: str,
    conversation_id: str,
) -> bool:
    return await conversation_participant_repository.exists(
        user_id=user_id,
        conversation_id=conversation_id,
    )
