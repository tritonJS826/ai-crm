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

const conversationWithContactAtom = atom<ConversationModel | null>(null);
const conversationWithContactLoadingAtom = atom<boolean>(false);
const conversationWithContactErrorAtom = atom<string | null>(null);

export const conversationWithContactStateAtom = atom((get) => ({
  conversationWithContact: get(conversationWithContactAtom),
  conversationWithContactLoading: get(conversationWithContactLoadingAtom),
  conversationWithContactError: get(conversationWithContactErrorAtom),
}));

export const loadConversationWithContactAtom = atom(
  null,
  async (_get, set, conversationId: string): Promise<void> => {
    set(conversationWithContactLoadingAtom, true);
    set(conversationWithContactErrorAtom, null);

    try {
      const conversationWithContact: ConversationModel = await getConversation(conversationId);

      set(conversationWithContactAtom, conversationWithContact);
    } catch (error) {
      set(
        conversationWithContactErrorAtom,
        error instanceof Error ? error.message : "Unknown fetch error",
      );
      set(conversationWithContactAtom, null);
    } finally {
      set(conversationWithContactLoadingAtom, false);
    }
  },
);

export const updateConversationWithContactByNewMessageEventAtom = atom(
  null,
  async (get, set, event: WsEvent<NewMessage>): Promise<void> => {
    let conversationWithContact = get(conversationWithContactAtom);

    // Load list if missing
    if (!conversationWithContact) {
      await set(loadConversationWithContactAtom, event.data.conversation_id);
      conversationWithContact = get(conversationWithContactAtom);
      if (!conversationWithContact) {
        set(conversationWithContactErrorAtom, "conversationWithContact not init");

        return;
      }
    }

    // ConversationWithContact.id !== event.data.conversation_id -> return
    if (conversationWithContact.id !== event.data.conversation_id) {
      return;
    }

    // Update existing conversationWithContact immutably
    set(conversationWithContactAtom, {
      ...conversationWithContact,
      lastMessageAt: event.timestamp,
    });
  },

);
