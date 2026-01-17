from typing import List
from prisma import Prisma
from prisma.models import Suggestions


class SuggestionRepository:
    async def create(
        self,
        db: Prisma,
        *,
        conversation_id: str,
        text: str,
    ) -> Suggestions:
        return await db.suggestions.create(
            data={
                "conversationId": conversation_id,
                "text": text,
            }
        )

    async def list_by_conversation(
        self,
        db: Prisma,
        *,
        conversation_id: str,
        limit: int = 10,
    ) -> List[Suggestions]:
        return await db.suggestions.find_many(
            where={"conversationId": conversation_id},
            order={"createdAt": "desc"},
            take=limit,
        )


suggestion_repo = SuggestionRepository()
