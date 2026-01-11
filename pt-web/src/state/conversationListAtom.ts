import {atom} from "jotai";
import {
  ConversationListResponse,
  getConversation,
  getConversationList,
} from "src/services/conversationService";
import {NewMessage} from "src/services/conversationWsService";
import {WsEvent} from "src/services/websocketClient";

// ConversationListResponse = {
//     items: {
//         id: string;
//         contact_id: string;
//         status: "OPEN" | "CLOSED";
//         last_message_at: Date;
//         created_at: Date;
//         contact: {
//             platform: "WHATSAPP" | "MESSENGER" | "INSTAGRAM";
//             platform_user_id: string;
//             phone?: string;
//             name?: string;
//             id: string;
//             opt_out: boolean;
//             created_at: Date;
//             updated_at: Date;
//         };
//     }[];
//     total: number;
//     limit: number;
//     offset: number;
// }

export const conversationListAtom = atom<ConversationListResponse | null>(null);
export const conversationListLoadingAtom = atom<boolean>(false);
export const conversationListErrorAtom = atom<string | null>(null);

export const conversationListStateAtom = atom((get) => ({
  conversationList: get(conversationListAtom),
  conversationListLoading: get(conversationListLoadingAtom),
  conversationListError: get(conversationListErrorAtom),
}));

export const loadConversationListAtom = atom(
  null,
  async (_get, set): Promise<void> => {
    set(conversationListLoadingAtom, true);
    set(conversationListErrorAtom, null);

    try {
      const conversationList: ConversationListResponse = await getConversationList();

      set(conversationListAtom, conversationList);
    } catch (error) {
      set(
        conversationListErrorAtom,
        error instanceof Error ? error.message : "Unknown fetch error",
      );
    } finally {
      set(conversationListLoadingAtom, false);
    }
  },
);

export const updateConversationListByNewMessageEventAtom = atom(
  null,
  async (get, set, event: WsEvent<NewMessage>): Promise<void> => {
    let conversationList = get(conversationListAtom);

    // Load list if missing
    if (!conversationList) {
      await set(loadConversationListAtom);
      conversationList = get(conversationListAtom);
      if (!conversationList) {
        set(conversationListErrorAtom, "conversationListAtom not init");

        return;
      }
    }

    const existingIndex = conversationList.items.findIndex(
      conversation => conversation.id === event.data.conversation_id,
    );

    // Conversation not in list → fetch and append
    const NOT_FOUND_INDEX = -1;
    if (existingIndex === NOT_FOUND_INDEX) {
      set(conversationListLoadingAtom, true);
      set(conversationListErrorAtom, null);

      try {
        const conversationFromRemote = await getConversation(event.data.conversation_id);
        set(conversationListAtom, {
          ...conversationList,
          items: [...conversationList.items, conversationFromRemote],
        });

      } catch (error) {
        set(
          conversationListErrorAtom,
          error instanceof Error ? error.message : "Unknown fetch error",
        );
      } finally {
        set(conversationListLoadingAtom, false);
      }

      return;
    }

    // Update existing conversation immutably
    const updatedItems = conversationList.items.map((conversation, idx) =>
      idx === existingIndex
        ? {...conversation, lastMessageAt: event.ts}
        : conversation,
    );
    set(conversationListAtom, {
      ...conversationList,
      items: updatedItems,
    });
  },

);
