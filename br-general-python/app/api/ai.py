"""
API endpoints for AI-assisted drafting.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.users import get_current_user
from app.db import db
from app.repositories.conversation_repository import conversation_repo
from app.repositories.message_repository import message_repo
from app.services.ai_service import ai_service

router = APIRouter()


@router.post("/draft")
async def generate_draft(
    conversation_id: str = Query(...),
    style: Optional[str] = Query(None),
    current_user=Depends(get_current_user),
):
    """
    Generate an AI-drafted response for a conversation.

    Args:
        conversation_id: The conversation to generate a draft for
        style: Optional canned prompt style (apologize, thank_you, etc.)

    Returns:
        draft: The generated draft text
    """
    # Verify conversation exists
    conversation = await conversation_repo.get_by_id(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Get recent messages for context
    recent_messages = await message_repo.get_recent(
        db,
        conversation_id=conversation_id,
        limit=10,
    )

    # Format messages for AI
    messages = [
        {"direction": msg.direction, "text": msg.text}
        for msg in recent_messages
        if msg.text
    ]

    # Generate draft
    draft = await ai_service.generate_draft(messages, style)

    return {"draft": draft}


@router.get("/prompts")
async def get_canned_prompts(
    current_user=Depends(get_current_user),
):
    """Get available canned prompt options."""
    return ai_service.get_canned_prompts()
