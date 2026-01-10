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


conversation_participant_repository = ConversationParticipantRepository()
