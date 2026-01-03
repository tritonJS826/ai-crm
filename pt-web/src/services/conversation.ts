import {ConversationStatus} from "src/constants/conversationStatuses";
import {Platform} from "src/constants/platform";
import {apiClient} from "src/services/apiClient";
import {ContactOptOutUpdate, ContactOut} from "src/services/contact";

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

export async function getMessages(conversationId: string, limit?: number, cursor?: string): Promise<ConversationWithContact> {
  const searchParams: Record<string, string> = {};
  if (limit) {
    searchParams.limit = String(limit);
  }
  if (cursor) {
    searchParams.cursor = cursor;
  }

  return apiClient.get<ConversationWithContact>(`/conversations/${conversationId}/messages`);
}

export async function sendMessage(payload: SendMessageRequest): Promise<SendMessageResponse> {
  return apiClient.post<SendMessageResponse>("/conversations/send", payload);
}

export async function closeConversation(conversationId: string): Promise<SendMessageResponse> {
  return apiClient.post<SendMessageResponse>(`/conversations/${conversationId}/close`);
}

export async function updateContactCptCut(conversationId: string, payload: ContactOptOutUpdate): Promise<SendMessageResponse> {
  return apiClient.patch<SendMessageResponse>(`/conversations/${conversationId}/optout`, payload);
}

export async function sendProduct(conversationId: string, productId: string): Promise<SendMessageResponse> {
  return apiClient.post<SendMessageResponse>(`/conversations/${conversationId}/send-product`, {productId});
}
