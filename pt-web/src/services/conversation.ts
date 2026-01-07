import {ConversationStatus} from "src/constants/conversationStatuses";
import {Platform} from "src/constants/platform";
import {apiClient} from "src/services/apiClient";
import {ContactOptOutUpdate, ContactOut} from "src/services/contact";

// Schema for message data in responses.
export type MessageOut = {
    id: string;
    conversationId: string;
    fromUserId?: string;
    platform: Platform;
    text?: string;
    mediaUrl?: string;
    remoteMessageId?: string;
    createdAt: Date;
}

// Schema for conversation data in responses.
export type ConversationOut = {
    id: string;
    contactId: string;
    status: ConversationStatus;
    lastMessageAt: Date;
    createdAt: Date;
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
    conversationId: string;
    text?: string;
    imageUrl?: string;
}

// Schema for send message response.
export type SendMessageResponse = {
    message: MessageOut;
    remoteMessageId?: string;
}

export async function getConversationList(
  status?: ConversationStatus,
  offset?: number,
  limit?: number): Promise<ConversationListResponse> {

  const searchParams: Record<string, string> = {};
  if (status) {
    searchParams.status = status;
  }
  if (offset) {
    searchParams.offset = String(offset);
  }
  if (limit) {
    searchParams.limit = String(limit);
  }

  return apiClient.get<ConversationListResponse>("/conversations?" + new URLSearchParams(searchParams));
}

export async function getConversation(conversationId: string): Promise<ConversationWithContact> {
  return apiClient.get<ConversationWithContact>(`/conversations/${conversationId}`);
}

export async function getMessages(conversationId: string, limit?: number, cursor?: string): Promise<MessageOut[]> {
  const searchParams: Record<string, string> = {};
  if (limit) {
    searchParams.limit = String(limit);
  }
  if (cursor) {
    searchParams.cursor = cursor;
  }

  return apiClient.get<MessageOut[]>(`/conversations/${conversationId}/messages`);
}

export async function sendMessage(payload: SendMessageRequest): Promise<SendMessageResponse> {
  return apiClient.post<SendMessageResponse>("/conversations/send", payload);
}

export async function closeConversation(conversationId: string): Promise<void> {
  return apiClient.post<void>(`/conversations/${conversationId}/close`);
}

export async function updateContactOptOut(contactId: string, payload: ContactOptOutUpdate): Promise<void> {
  return apiClient.patch<void>(`/conversations/contacts/${contactId}/optout`, payload);
}

export async function sendProductToConversation(conversationId: string, productId: string): Promise<{
  message_id: string;
  remote_message_id: string;
  product_id: string;}> {
  return apiClient.post<{
    message_id: string;
    remote_message_id: string;
    product_id: string;}>(`/conversations/${conversationId}/send-product`, {productId});
}
