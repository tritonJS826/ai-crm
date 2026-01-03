import {atom} from "jotai";
import {
  ConversationListResponse,
  getConversation,
  getConversationList,
} from "src/services/conversation";
import {NewMessage} from "src/services/conversationWs";
import {WsIncomingEvent} from "src/services/websocketClient";

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
  async (get, set, event: WsIncomingEvent<NewMessage>): Promise<void> => {
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
      c => c.id === event.data.conversation_id,
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
        ? {...conversation, last_message_at: event.ts}
        : conversation,
    );
    set(conversationListAtom, {
      ...conversationList,
      items: updatedItems,
    });
  },

);
