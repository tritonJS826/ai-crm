import {atom} from "jotai";
import {ConversationList, getConversationList} from "src/services/conversation";

export const conversationListAtom = atom<ConversationList | null>(null);
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
      const conversationList = await getConversationList();

      set(conversationListAtom, conversationList);
    } catch (error) {
      if (error instanceof Error) {
        set(conversationListErrorAtom, error.message);
      } else {
        set(conversationListErrorAtom, "Unknown fetch error");
      }
    } finally {
      set(conversationListLoadingAtom, false);
    }
  },
);
