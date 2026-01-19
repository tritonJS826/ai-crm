"""
Conversation-related Pydantic schemas for request/response validation.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List

from pydantic import BaseModel, Field

from app.schemas.contact import ContactOut, Platform


class ConversationStatus(str, Enum):
    """Conversation status options."""

    OPEN = "OPEN"
    CLOSED = "CLOSED"


class MessageOut(BaseModel):
    id: str
    conversation_id: str = Field(..., alias="conversationId")
    from_user_id: Optional[str] = Field(default=None, alias="fromUserId")
    platform: Platform
    text: Optional[str] = None
    media_url: Optional[str] = Field(default=None, alias="mediaUrl")
    remote_message_id: Optional[str] = Field(default=None, alias="remoteMessageId")
    created_at: datetime = Field(..., alias="createdAt")

    model_config = {"from_attributes": True, "populate_by_name": True}


class ConversationOut(BaseModel):
    """Schema for conversation data in responses."""

    id: str
    contact_id: str = Field(..., alias="contactId")
    status: ConversationStatus
    last_message_at: datetime = Field(..., alias="lastMessageAt")
    created_at: datetime = Field(..., alias="createdAt")

    model_config = {"from_attributes": True, "populate_by_name": True}


class ConversationWithContact(ConversationOut):
    """Schema for conversation with nested contact data."""

    contact: ContactOut


class ConversationWithMessages(ConversationOut):
    messages: List[MessageOut] = Field(default_factory=list)


class ConversationListResponse(BaseModel):
    """Schema for paginated conversation list."""

    items: List[ConversationWithContact]
    total: int
    limit: int
    offset: int


class SendMessageRequest(BaseModel):
    """Schema for sending a message."""

    conversation_id: str = Field(..., alias="conversationId")
    text: Optional[str] = None
    image_url: Optional[str] = Field(default=None, alias="imageUrl")
    # agent_user_id: # Optional agent user ID.
    # If null, message is treated as a system message.
    agent_user_id: Optional[str] = Field(default=None, alias="agentUserId")

    model_config = {"populate_by_name": True}


class SendMessageResponse(BaseModel):
    """Schema for send message response."""

    message: MessageOut
    remote_message_id: Optional[str] = Field(default=None, alias="remoteMessageId")

    model_config = {"populate_by_name": True}
