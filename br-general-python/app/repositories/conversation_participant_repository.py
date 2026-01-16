from app.db import db


class ConversationParticipantRepository:
    async def exists(
        self,
        *,
        user_id: str,
        conversation_id: str,
    ) -> bool:
        count = await db.conversationparticipant.count(
            where={
                "conversationId": conversation_id,
                "userId": user_id,
            }
        )
        return count > 0

    async def add(
        self,
        *,
        conversation_id: str,
        user_id: str,
    ) -> None:
        await db.conversationparticipant.create(
            data={
                "conversationId": conversation_id,
                "userId": user_id,
            }
        )

    async def replace_assignee(
        self,
        *,
        conversation_id: str,
        new_user_id: str,
    ) -> None:
        """
        Replace current assignee with a new one.
        """

        # Remove all existing participants
        await db.conversationparticipant.delete_many(
            where={"conversationId": conversation_id}
        )

        # Add new assignee
        await db.conversationparticipant.create(
            data={
                "conversationId": conversation_id,
                "userId": new_user_id,
            }
        )

    async def count_conversations_for_user(
        self,
        *,
        user_id: str,
    ) -> int:
        return await db.conversationparticipant.count(where={"userId": user_id})

    async def count_by_conversation(
        self,
        *,
        conversation_id: str,
    ) -> int:
        return await db.conversationparticipant.count(
            where={"conversationId": conversation_id}
        )

    async def add_many(
        self,
        db,
        *,
        conversation_id: str,
        user_ids: list[str],
    ) -> None:
        await db.conversationparticipant.create_many(
            data=[
                {
                    "conversationId": conversation_id,
                    "userId": user_id,
                }
                for user_id in user_ids
            ],
            skip_duplicates=True,
        )


conversation_participant_repository = ConversationParticipantRepository()
