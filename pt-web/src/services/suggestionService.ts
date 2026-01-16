import {apiClient} from "src/services/apiClient";

// Schema for suggestion data in responses.
export type Suggestion = {
    id: string;
    conversationId: string;
    text: string;
    createdAt: Date;
}

export async function getMessages(conversationId: string): Promise<Suggestion[]> {
  return apiClient.get<Suggestion[]>(`/conversations/${conversationId}/suggestions`);
}
