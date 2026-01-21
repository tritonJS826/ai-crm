"""
API endpoints for conversations and messages.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status, Security

from app.api.access_control import can_user_access_conversation
from app.api.auth import oauth2_scheme
from app.api.users import get_current_user
from app.db import db
from app.logging import logger
from app.repositories.conversation_repository import conversation_repo
from app.repositories.message_repository import message_repo
from app.repositories.contact_repository import contact_repo
from app.repositories.product_repository import product_repo
from app.repositories.suggestion_repository import suggestion_repo
from app.schemas.source import Source
from app.schemas.suggestion import SuggestionOut
from app.services.message_service import message_service
from app.services.meta_service import meta_service
from app.settings import settings
from app.schemas.conversation import (
    ConversationStatus,
    ConversationListResponse,
    ConversationWithContact,
    SendMessageRequest,
    SendMessageResponse,
    MessageOut,
)
from app.schemas.contact import ContactOptOutUpdate, Platform

from app.services.ai_service import ai_service, AISuggestionError
from app.schemas.user import Role

router = APIRouter(dependencies=[Security(oauth2_scheme)])


# -------------------------------------------------------------------
# Conversations
# -------------------------------------------------------------------


@router.get("", response_model=ConversationListResponse)
async def list_conversations(
    status: Optional[ConversationStatus] = None,
    limit: int = 50,
    offset: int = 0,
    current_user=Depends(get_current_user),
):
    """
    List conversations visible to the current user.
    """
    conversations, total = await conversation_repo.list_conversations(
        db,
        user_id=current_user.id,
        status=status,
        limit=limit,
        offset=offset,
    )

    items = [
        ConversationWithContact(
            id=conv.id,
            contactId=conv.contactId,
            status=ConversationStatus(conv.status),
            lastMessageAt=conv.lastMessageAt,
            createdAt=conv.createdAt,
            contact=conv.contact,
        )
        for conv in conversations
    ]

    return ConversationListResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/{conversation_id}", response_model=ConversationWithContact)
async def get_conversation(
    conversation_id: str,
    current_user=Depends(get_current_user),
):
    """
    Get a single conversation.
    """
    conversation = await conversation_repo.get_by_id(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if not await can_user_access_conversation(
        user_id=current_user.id, conversation_id=conversation_id
    ):
        raise HTTPException(status_code=403, detail="Access denied")

    return ConversationWithContact(
        id=conversation.id,
        contactId=conversation.contactId,
        status=ConversationStatus(conversation.status),
        lastMessageAt=conversation.lastMessageAt,
        createdAt=conversation.createdAt,
        contact=conversation.contact,
    )


@router.post("/{conversation_id}/close", status_code=status.HTTP_204_NO_CONTENT)
async def close_conversation(
    conversation_id: str,
    current_user=Depends(get_current_user),
):
    """
    Close a conversation.
    """
    conversation = await conversation_repo.get_by_id(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if not await can_user_access_conversation(current_user.id, conversation_id):
        raise HTTPException(status_code=403, detail="Access denied")

    await conversation_repo.close(db, conversation_id)


# -------------------------------------------------------------------
# Messages
# -------------------------------------------------------------------


@router.get("/{conversation_id}/messages", response_model=list[MessageOut])
async def get_messages(
    conversation_id: str,
    limit: int = 50,
    cursor: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    """
    Get messages for a conversation.
    """
    conversation = await conversation_repo.get_by_id(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if not await can_user_access_conversation(
        user_id=current_user.id, conversation_id=conversation_id
    ):
        raise HTTPException(status_code=403, detail="Access denied")

    messages = await message_repo.get_by_conversation(
        db,
        conversation_id=conversation_id,
        limit=limit,
        cursor=cursor,
    )

    return [MessageOut.from_orm(msg) for msg in messages]


@router.post("/send", response_model=SendMessageResponse)
async def send_message(
    payload: SendMessageRequest,
    current_user=Depends(get_current_user),
):
    """
    Send an outbound message as the authenticated agent.
    """
    if not payload.text and not payload.image_url:
        raise HTTPException(
            status_code=400,
            detail="Message must contain text or image",
        )

    conversation = await conversation_repo.get_by_id(db, payload.conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if not await can_user_access_conversation(
        user_id=current_user.id, conversation_id=payload.conversation_id
    ):
        raise HTTPException(status_code=403, detail="Access denied")

    result = await message_service.send_outbound_message(
        conversation_id=payload.conversation_id,
        text=payload.text,
        image_url=payload.image_url,
        agent_user_id=current_user.id,
    )

    message = await message_repo.get_by_id(db, result["message_id"])

    return SendMessageResponse(
        message=MessageOut.from_orm(message),
        remoteMessageId=result.get("remote_message_id"),
    )


# -------------------------------------------------------------------
# Contacts
# -------------------------------------------------------------------


@router.patch("/contacts/{contact_id}/optout", status_code=status.HTTP_204_NO_CONTENT)
async def update_contact_opt_out(
    contact_id: str,
    payload: ContactOptOutUpdate,
    current_user=Depends(get_current_user),
):
    """
    Update contact opt-out status.
    """
    contact = await contact_repo.get_by_id(db, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    has_access = await conversation_repo.user_has_conversation_with_contact(
        db,
        user_id=current_user.id,
        contact_id=contact_id,
    )

    if not has_access:
        raise HTTPException(status_code=403, detail="Access denied")

    await contact_repo.update_opt_out(db, contact_id, payload.opt_out)


# -------------------------------------------------------------------
# Products / Checkout
# -------------------------------------------------------------------


@router.post("/{conversation_id}/send-product")
async def send_product_to_conversation(
    conversation_id: str,
    product_id: str = Query(..., description="Product ID"),
    current_user=Depends(get_current_user),
):
    """
    Send a product card into a conversation.
    """
    conversation = await conversation_repo.get_by_id(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if not await can_user_access_conversation(current_user.id, conversation_id):
        raise HTTPException(status_code=403, detail="Access denied")

    product = await product_repo.get_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if not product.isActive:
        raise HTTPException(status_code=400, detail="Product is not active")

    contact = conversation.contact
    if contact.optOut:
        raise HTTPException(status_code=400, detail="Contact has opted out")

    checkout_url = (
        f"{settings.app_base_url}/br-general/stripe/checkout"
        f"?product_id={product.id}"
        f"&conversation_id={conversation_id}"
    )

    price_str = f"{product.priceCents / 100:.2f} {product.currency}"

    platform = Platform(contact.platform)

    remote_id = await meta_service.send_product_card(
        platform=platform,
        to=contact.platformUserId,
        title=product.title,
        price=price_str,
        image_url=product.imageUrl,
        buy_url=checkout_url,
    )

    if not remote_id:
        raise HTTPException(
            status_code=500,
            detail="Failed to send product card",
        )

    message = await message_repo.create(
        db,
        conversation_id=conversation_id,
        platform=platform,
        from_user_id=current_user.id,
        text=f"[Product] {product.title} — {price_str}",
        remote_message_id=remote_id,
        source=Source.AGENT,
    )

    await conversation_repo.update_last_message_at(db, conversation_id)

    return {
        "message_id": message.id,
        "remote_message_id": remote_id,
        "product_id": product.id,
    }


# -------------------------------------------------------------------
# Suggestions
# -------------------------------------------------------------------


@router.get(
    "/{conversation_id}/suggestions",
    response_model=list[SuggestionOut],
)
async def get_suggestions(
    conversation_id: str,
    current_user=Security(get_current_user),
):
    """
    Get suggestions for a conversation.
    AGENT / ADMIN only.
    """

    # 🔒 HARD ROLE GATE
    if current_user.role not in {Role.ADMIN, Role.AGENT}:
        raise HTTPException(
            status_code=403,
            detail="Only agents or admins can access suggestions",
        )

    conversation = await conversation_repo.get_by_id(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if not await can_user_access_conversation(
        user_id=current_user.id,
        conversation_id=conversation_id,
    ):
        raise HTTPException(status_code=403, detail="Access denied")

    return await suggestion_repo.list_by_conversation(
        db,
        conversation_id=conversation_id,
    )


@router.post(
    "/{conversation_id}/suggestions",
    response_model=list[SuggestionOut],
)
async def create_suggestions(
    conversation_id: str,
    current_user=Security(get_current_user),
):
    # 🔒 AGENT / ADMIN ONLY
    if current_user.role not in {Role.ADMIN, Role.AGENT}:
        raise HTTPException(status_code=403, detail="Forbidden")

    conversation = await conversation_repo.get_by_id(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if not await can_user_access_conversation(
        user_id=current_user.id,
        conversation_id=conversation_id,
    ):
        raise HTTPException(status_code=403, detail="Access denied")

    messages = await message_repo.get_by_conversation(
        db,
        conversation_id=conversation_id,
        limit=30,
        cursor=None,
    )

    # map to AI format
    ai_messages = [
        {
            "direction": "OUT" if msg.fromUserId else "IN",
            "text": msg.text,
        }
        for msg in reversed(messages)
        if msg.text
    ]

    try:
        texts = await ai_service.generate_agent_suggestions(ai_messages)
    except AISuggestionError as exc:
        logger.warning("AI suggestions unavailable", exc_info=exc)
        raise HTTPException(
            status_code=503,
            detail="AI suggestions temporarily unavailable",
        )

    created = []
    for t in texts:
        created.append(
            await suggestion_repo.create(
                db,
                conversation_id=conversation_id,
                text=t,
            )
        )

    return created
