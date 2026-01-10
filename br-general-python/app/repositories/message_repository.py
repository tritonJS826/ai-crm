"""
Repository for Message database operations.
"""

from typing import Optional, List

from prisma import Prisma
from prisma.models import Message

from app.schemas.platform import Platform
from app.schemas.message import MessageDirection


class MessageRepository:
    """Repository for Message CRUD operations."""

    async def create(
        self,
        db: Prisma,
        *,
        conversation_id: str,
        platform: Platform,
        direction: MessageDirection,
        from_user_id: Optional[str] = None,
        text: Optional[str] = None,
        media_url: Optional[str] = None,
        remote_message_id: Optional[str] = None,
    ) -> Message:
        """Create a new message."""
        return await db.message.create(
            data={
                "conversationId": conversation_id,
                "direction": direction.value,
                "fromUserId": from_user_id,
                "platform": platform.value,
                "text": text,
                "mediaUrl": media_url,
                "remoteMessageId": remote_message_id,
            }
        )

    async def get_by_conversation(
        self,
        db: Prisma,
        conversation_id: str,
        limit: int = 50,
        cursor: Optional[str] = None,
    ) -> List[Message]:
        """Get messages for a conversation with cursor pagination."""
        if cursor:
            return await db.message.find_many(
                where={"conversationId": conversation_id},
                order={"createdAt": "asc"},
                take=limit,
                cursor={"id": cursor},
                skip=1,
            )

        return await db.message.find_many(
            where={"conversationId": conversation_id},
            order={"createdAt": "asc"},
            take=limit,
        )

    async def get_recent(
        self,
        db: Prisma,
        conversation_id: str,
        limit: int = 10,
    ) -> List[Message]:
        """Get recent messages for AI context (chronological)."""
        messages = await db.message.find_many(
            where={"conversationId": conversation_id},
            order={"createdAt": "desc"},
            take=limit,
        )
        return list(reversed(messages))

    async def get_by_id(
        self,
        db: Prisma,
        message_id: str,
    ) -> Optional[Message]:
        """Get message by ID."""
        return await db.message.find_unique(where={"id": message_id})


message_repo = MessageRepository()
