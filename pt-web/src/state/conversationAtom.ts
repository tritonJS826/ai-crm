import {atom} from "jotai";
import {ConversationModel} from "src/models/Conversation";
import {getConversation} from "src/services/conversationService";
import {NewMessage} from "src/services/conversationWsService";
import {WsEvent} from "src/services/websocketClient";

// ConversationWithContact = {
//     id: string;
//     contact_id: string;
//     status: "OPEN" | "CLOSED";
//     last_message_at: Date;
//     created_at: Date;
//     contact: {
//         platform: "WHATSAPP" | "MESSENGER" | "INSTAGRAM";
//         platform_user_id: string;
//         phone?: string;
//         name?: string;
//         id: string;
//         opt_out: boolean;
//         created_at: Date;
//         updated_at: Date;
//     };
// }

const conversationAtom = atom<ConversationModel | null>(null);
const conversationLoadingAtom = atom<boolean>(false);
const conversationErrorAtom = atom<string | null>(null);

export const conversationStateAtom = atom((get) => ({
  conversation: get(conversationAtom),
  conversationLoading: get(conversationLoadingAtom),
  conversationError: get(conversationErrorAtom),
}));

export const loadConversationAtom = atom(
  null,
  async (_get, set, conversationId: string): Promise<void> => {
    set(conversationLoadingAtom, true);
    set(conversationErrorAtom, null);

    try {
      const conversationWithContact: ConversationModel = await getConversation(conversationId);

      set(conversationAtom, conversationWithContact);
    } catch (error) {
      set(
        conversationErrorAtom,
        error instanceof Error ? error.message : "Unknown fetch error",
      );
      set(conversationAtom, null);
    } finally {
      set(conversationLoadingAtom, false);
    }
  },
);

export const updateConversationByNewMessageEventAtom = atom(
  null,
  async (get, set, event: WsEvent<NewMessage>): Promise<void> => {
    let conversation = get(conversationAtom);

    // Load list if missing
    if (!conversation) {
      await set(loadConversationAtom, event.data.conversation_id);
      conversation = get(conversationAtom);
      if (!conversation) {
        set(conversationErrorAtom, "conversationWithContact not init");

        return;
      }
    }

    // ConversationWithContact.id !== event.data.conversation_id -> return
    if (conversation.id !== event.data.conversation_id) {
      return;
    }

    // Update existing conversationWithContact immutably
    set(conversationAtom, {
      ...conversation,
      lastMessageAt: event.timestamp,
    });
  },

);
