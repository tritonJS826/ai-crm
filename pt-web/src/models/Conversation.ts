import {ConversationStatus} from "src/constants/conversationStatus";
import {MessageDirection} from "src/constants/messageDirection";
import {Platform} from "src/constants/platform";
import {Contact} from "src/models/Contact";

// Schema for message data in responses.
export type Message = {
    id: string;
    conversationId: string;
    direction: MessageDirection;
    fromUserId?: string;
    platform: Platform;
    text?: string;
    mediaUrl?: string;
    remoteMessageId?: string;
    createdAt: Date;
}

// Schema for conversation data in responses.
export type Conversation = {
    id: string;
    contactId: string;
    status: ConversationStatus;
    lastMessageAt: Date;
    createdAt: Date;
}

// Schema for conversation with nested contact data.
export type ConversationWithContact = Conversation & {
    contact: Contact;
}

// Schema for conversation with nested messages.
export type ConversationWithMessages = Conversation & {
    messages: Message[];
}

// Schema for paginated conversation list.
export type ConversationListModel = {
    items: ConversationWithContact[];
    total: number;
    limit: number;
    offset: number;
}

// Schema for sending a message.
export type SendMessageRequest={
    conversationId: string;
    text?: string;
    imageUrl?: string;
}

// Schema for send message response.
export type SendMessageResponse = {
    message: Message;
    remoteMessageId?: string;
}

// Schema for suggestion data in responses.
export type Suggestion = {
    id: string;
    conversationId: string;
    text: string;
    createdAt: Date;
}
