from app.db import db
from app.repositories.conversation_repository import conversation_repo
from app.repositories.conversation_participant_repository import (
    conversation_participant_repository,
)
from app.repositories.user_repository import user_repo


class ConversationService:
    async def start_for_contact(self, *, contact_id: str):
        """
        Create conversation if needed and add ALL admins as participants
        on first creation only.
        """

        conversation = await conversation_repo.get_or_create(db, contact_id)

        # Check if ANY participant already exists
        existing_count = (
            await conversation_participant_repository.count_by_conversation(
                conversation_id=conversation.id,
            )
        )

        if existing_count == 0:
            # FIRST message → attach all admins
            admins = await user_repo.list_admins(db)

            admin_ids = [admin.id for admin in admins]

            if not admin_ids:
                raise RuntimeError("No admin users found")

            await conversation_participant_repository.add_many(
                db,
                conversation_id=conversation.id,
                user_ids=admin_ids,
            )

        return conversation

    async def assign_to_user(
        self,
        *,
        conversation_id: str,
        user_id: str,
    ) -> None:
        user = await user_repo.get_by_id(db, user_id)
        if not user:
            raise ValueError("User not found")

        await conversation_participant_repository.replace_assignee(
            db,
            conversation_id=conversation_id,
            new_user_id=user_id,
        )


conversation_service = ConversationService()
