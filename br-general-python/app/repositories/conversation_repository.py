"""
Repository for Conversation database operations.
"""

from datetime import datetime, timezone
from typing import Optional, Tuple, List

from prisma import Prisma
from prisma.models import Conversation

from app.schemas.conversation import ConversationStatus


class ConversationRepository:
    """Repository for Conversation CRUD operations."""

    async def get_by_id(
        self,
        db: Prisma,
        conversation_id: str,
    ) -> Optional[Conversation]:
        """Get conversation by ID with contact."""
        return await db.conversation.find_unique(
            where={"id": conversation_id},
            include={"contact": True},
        )

    async def get_by_contact(
        self,
        db: Prisma,
        contact_id: str,
    ) -> Optional[Conversation]:
        """Get latest conversation for a contact."""
        return await db.conversation.find_first(
            where={"contactId": contact_id},
            order={"lastMessageAt": "desc"},
        )

    async def list_conversations(
        self,
        db: Prisma,
        *,
        user_id: Optional[str] = None,
        status: Optional[ConversationStatus] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Tuple[List[Conversation], int]:
        where: dict = {}

        if status is not None:
            where["status"] = status.value

        if user_id is not None:
            where["conversationParticipants"] = {
                "some": {
                    "userId": user_id,
                }
            }

        conversations = await db.conversation.find_many(
            where=where if where else None,
            include={"contact": True},
            order={"lastMessageAt": "desc"},
            take=limit,
            skip=offset,
        )

        total = await db.conversation.count(where=where if where else None)
        return conversations, total

    async def create(
        self,
        db: Prisma,
        contact_id: str,
    ) -> Conversation:
        """Create a new conversation for a contact."""
        return await db.conversation.create(
            data={
                "contactId": contact_id,
                "status": ConversationStatus.OPEN.value,
                "lastMessageAt": datetime.now(timezone.utc),
            },
            include={"contact": True},
        )

    async def get_or_create(
        self,
        db: Prisma,
        contact_id: str,
    ) -> Conversation:
        """Get existing open conversation or create new one."""
        existing = await db.conversation.find_first(
            where={
                "contactId": contact_id,
                "status": ConversationStatus.OPEN.value,
            },
            order={"lastMessageAt": "desc"},
        )

        if existing is not None:
            return existing

        return await self.create(db, contact_id)

    async def update_last_message_at(
        self,
        db: Prisma,
        conversation_id: str,
    ) -> Conversation:
        """Update lastMessageAt timestamp."""
        return await db.conversation.update(
            where={"id": conversation_id},
            data={"lastMessageAt": datetime.now(timezone.utc)},
        )

    async def close(
        self,
        db: Prisma,
        conversation_id: str,
    ) -> Conversation:
        """Close a conversation."""
        return await db.conversation.update(
            where={"id": conversation_id},
            data={"status": ConversationStatus.CLOSED.value},
        )

    async def user_has_conversation_with_contact(
        self,
        db: Prisma,
        *,
        user_id: str,
        contact_id: str,
    ) -> bool:
        # Find any conversation for this contact where a participant row exists for user
        return (
            await db.conversation.count(
                where={
                    "contactId": contact_id,
                    "conversationParticipants": {
                        "some": {"userId": user_id},
                    },
                }
            )
            > 0
        )


conversation_repo = ConversationRepository()
