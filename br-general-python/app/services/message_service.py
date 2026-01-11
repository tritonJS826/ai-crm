"""
Service for message business logic.
"""

from typing import Optional

from app.db import db
from app.logging import logger
from app.schemas.contact import Platform
from app.schemas.message import MessageDirection
from app.repositories.contact_repository import contact_repo
from app.repositories.conversation_repository import conversation_repo
from app.repositories.message_repository import message_repo
from app.ws.dispatcher import emit
from app.ws.event_types import WSEventType


# Opt-out keywords (case-insensitive)
OPT_OUT_KEYWORDS = {"stop", "unsubscribe", "отписаться", "стоп"}


class MessageService:
    """Service for handling message operations."""

    async def handle_inbound_message(
        self,
        platform: Platform,
        platform_user_id: str,
        text: Optional[str] = None,
        media_url: Optional[str] = None,
        remote_message_id: Optional[str] = None,
        contact_name: Optional[str] = None,
        contact_phone: Optional[str] = None,
    ) -> dict:
        """
        Process an inbound message from a customer.
        """
        # 1. Upsert contact
        contact = await contact_repo.upsert(
            db,
            platform=platform,
            platform_user_id=platform_user_id,
            phone=contact_phone,
            name=contact_name,
        )

        # 2. Get or create conversation
        conversation = await conversation_repo.get_or_create(db, contact.id)

        # 3. Check for opt-out
        if text and text.strip().lower() in OPT_OUT_KEYWORDS:
            await contact_repo.update_opt_out(db, contact.id, opt_out=True)
            logger.info(f"Contact {contact.id} opted out")

        # 4. Store inbound message (customer → agent)
        message = await message_repo.create(
            db,
            conversation_id=conversation.id,
            direction=MessageDirection.IN,
            platform=platform,
            from_user_id=None,
            text=text,
            media_url=media_url,
            remote_message_id=remote_message_id,
        )

        # 5. Update conversation timestamp
        await conversation_repo.update_last_message_at(db, conversation.id)

        # 6. Emit WebSocket event
        await emit(
            WSEventType.NEW_MESSAGE,
            {
                "conversation_id": conversation.id,
                "message_id": message.id,
                "direction": MessageDirection.IN.value,
                "from_user_id": None,
                "platform": platform.value,
                "text": text,
            },
        )

        return {
            "contact_id": contact.id,
            "conversation_id": conversation.id,
            "message_id": message.id,
        }

    async def send_outbound_message(
        self,
        conversation_id: str,
        agent_user_id: Optional[str],
        text: Optional[str] = None,
        image_url: Optional[str] = None,
    ) -> dict:
        """
        Send an outbound message to a customer.

        agent_user_id:
        - NOT NULL → agent message
        - NULL → system / bot message
        """
        # 1. Get conversation with contact
        conversation = await conversation_repo.get_by_id(db, conversation_id)
        if not conversation:
            raise ValueError(f"Conversation {conversation_id} not found")

        contact = conversation.contact
        platform = Platform(contact.platform)

        # 2. Check opt-out
        if contact.optOut:
            raise ValueError("Cannot send message: contact has opted out")

        # 3. Send via Meta API
        remote_message_id = "2"
        # remote_message_id = await meta_service.send_message(
        #     platform=platform,
        #     to=contact.platformUserId,
        #     text=text,
        #     image_url=image_url,
        # )

        if not remote_message_id:
            raise ValueError("Failed to send message via Meta API")

        # 4. Store outbound message (agent/system → customer)
        message = await message_repo.create(
            db,
            conversation_id=conversation_id,
            direction=MessageDirection.OUT,
            platform=platform,
            from_user_id=agent_user_id,
            text=text,
            media_url=image_url,
            remote_message_id=remote_message_id,
        )

        # 5. Update conversation timestamp
        await conversation_repo.update_last_message_at(db, conversation_id)

        # 6. Emit WebSocket event
        await emit(
            WSEventType.NEW_MESSAGE,
            {
                "conversation_id": conversation_id,
                "message_id": message.id,
                "direction": MessageDirection.OUT.value,
                "from_user_id": agent_user_id,
                "platform": platform.value,
                "text": text,
            },
        )

        return {
            "message_id": message.id,
            "remote_message_id": remote_message_id,
        }

    async def send_order_confirmation(
        self,
        conversation_id: str,
        order_id: str,
        product_title: str,
        amount: str,
    ) -> Optional[str]:
        """
        Send order confirmation as a system message.
        """
        text = (
            f"Payment received!\n\n"
            f"Order #{order_id}\n"
            f"{product_title}\n"
            f"Amount: {amount}\n\n"
            f"Thank you for your purchase!"
        )

        try:
            result = await self.send_outbound_message(
                conversation_id=conversation_id,
                agent_user_id=None,  # system message
                text=text,
            )
            return result.get("message_id")
        except Exception as e:
            logger.error(f"Failed to send order confirmation: {e}")
            return None


message_service = MessageService()
