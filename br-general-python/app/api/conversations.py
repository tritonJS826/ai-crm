"""
API endpoints for conversations and messages.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.api.users import get_current_user
from app.db import db
from app.repositories.conversation_repository import conversation_repo
from app.repositories.message_repository import message_repo
from app.repositories.contact_repository import contact_repo
from app.repositories.product_repository import product_repo
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

router = APIRouter()


@router.get("", response_model=ConversationListResponse)
async def list_conversations(
    status: Optional[ConversationStatus] = None,
    limit: int = 50,
    offset: int = 0,
    current_user=Depends(get_current_user),
):
    """List all conversations with pagination."""
    conversations, total = await conversation_repo.list_conversations(
        db,
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
    """Get a specific conversation by ID."""
    conversation = await conversation_repo.get_by_id(db, conversation_id)

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    return ConversationWithContact(
        id=conversation.id,
        contactId=conversation.contactId,
        status=ConversationStatus(conversation.status),
        lastMessageAt=conversation.lastMessageAt,
        createdAt=conversation.createdAt,
        contact=conversation.contact,
    )


@router.get("/{conversation_id}/messages", response_model=list[MessageOut])
async def get_messages(
    conversation_id: str,
    limit: int = 50,
    cursor: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    """Get messages for a conversation with cursor pagination."""
    # Verify conversation exists
    conversation = await conversation_repo.get_by_id(db, conversation_id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    messages = await message_repo.get_by_conversation(
        db,
        conversation_id=conversation_id,
        limit=limit,
        cursor=cursor,
    )

    return messages


@router.post("/send", response_model=SendMessageResponse)
async def send_message(
    payload: SendMessageRequest,
    _current_user: dict = Depends(get_current_user),
) -> SendMessageResponse:
    """Send a message to a conversation."""
    if not payload.text and not payload.image_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message must contain text or image_url",
        )
    try:
        result = await message_service.send_outbound_message(
            conversation_id=payload.conversation_id,
            text=payload.text,
            image_url=payload.image_url,
        )

        message = await db.message.find_unique(where={"id": result["message_id"]})

        return SendMessageResponse(
            message=message,
            remoteMessageId=result.get("remote_message_id"),
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/{conversation_id}/close", status_code=status.HTTP_204_NO_CONTENT)
async def close_conversation(
    conversation_id: str,
    current_user=Depends(get_current_user),
):
    """Close a conversation."""
    conversation = await conversation_repo.get_by_id(db, conversation_id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    await conversation_repo.close(db, conversation_id)


@router.patch("/contacts/{contact_id}/optout", status_code=status.HTTP_204_NO_CONTENT)
async def update_contact_opt_out(
    contact_id: str,
    payload: ContactOptOutUpdate,
    current_user=Depends(get_current_user),
):
    """Update contact opt-out status."""
    contact = await contact_repo.get_by_id(db, contact_id)
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found",
        )

    await contact_repo.update_opt_out(db, contact_id, payload.opt_out)


@router.post("/{conversation_id}/send-product")
async def send_product_to_conversation(
    conversation_id: str,
    product_id: str = Query(..., description="Product ID to send"),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Send a product card to a conversation."""
    conversation = await conversation_repo.get_by_id(db, conversation_id)
    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    product = await product_repo.get_by_id(db, product_id)
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    if not product.isActive:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product is not active",
        )

    contact = conversation.contact
    if contact.optOut:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot send to opted-out contact",
        )

    checkout_url = (
        f"{settings.app_base_url}/br-general/checkout"
        f"?product_id={product.id}&conv_id={conversation_id}&contact_id={contact.id}"
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

    if remote_id is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send product card",
        )

    message = await message_repo.create(
        db,
        conversation_id=conversation_id,
        platform=platform,
        from_user_id=None,  # from agent
        text=f"[Product Card] {product.title} - {price_str}",
        remote_message_id=remote_id,
    )

    await conversation_repo.update_last_message_at(db, conversation_id)

    return {
        "message_id": message.id,
        "remote_message_id": remote_id,
        "product_id": product.id,
    }
