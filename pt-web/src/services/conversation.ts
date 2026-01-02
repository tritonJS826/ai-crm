import {ConversationStatus} from "src/constants/conversationStatuses";
import {Platform} from "src/constants/platform";
import {ContactOut} from "src/services/contact";

// Schema for message data in responses.
export type MessageOut = {
    id: string;
    conversation_id: string;
    from_user_id?: string;
    platform: Platform;
    text?: string;
    media_url?: string;
    remote_message_id?: string;
    created_at: Date;
}

// Schema for conversation data in responses.
export type ConversationOut = {
    id: string;
    contact_id: string;
    status: ConversationStatus;
    last_message_at: Date;
    created_at: Date;
}

// Schema for conversation with nested contact data.
export type ConversationWithContact = ConversationOut & {
    contact: ContactOut;
}

// Schema for conversation with nested messages.
export type ConversationWithMessages = ConversationOut & {
    messages: MessageOut[];
}

// Schema for paginated conversation list.
export type ConversationListResponse = {
    items: ConversationWithContact[];
    total: number;
    limit: number;
    offset: number;
}

// Schema for sending a message.
export type SendMessageRequest={
    conversation_id: string;
    text?: string;
    image_url?: string;
}

// Schema for send message response.
export type SendMessageResponse = {
    message: MessageOut;
    remote_message_id?: string;
}

