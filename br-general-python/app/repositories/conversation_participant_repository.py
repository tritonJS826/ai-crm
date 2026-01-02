from app.db import db


class ConversationParticipantRepository:
    async def exists(
        self,
        *,
        user_id: str,
        conversation_id: str,
    ) -> bool:
        record = await db.conversationparticipant.find_first(
            where={
                "conversationId": conversation_id,
                "userId": user_id,
            }
        )
        return record is not None


conversation_participant_repository = ConversationParticipantRepository()
