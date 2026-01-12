from app.repositories.conversation_participant_repository import (
    conversation_participant_repository,
)


async def can_user_access_conversation(
    db,
    *,
    user_id: str,
    conversation_id: str,
) -> bool:
    return await conversation_participant_repository.exists(
        db,
        user_id=user_id,
        conversation_id=conversation_id,
    )
