import {atom} from "jotai";
import {addSuggestions, getSuggestions, Suggestion} from "src/services/suggestionService";

// Suggestion = {
//     id: string;
//     conversationId: string;
//     text: string;
//     createdAt: Date;
// }

const MAX_SUGGESTION_LIST_LENGTH = 10;

const suggestionListAtom = atom<Suggestion[]>([]);
const suggestionListLoadingAtom = atom<boolean>(false);
const suggestionListErrorAtom = atom<string | null>(null);

export const suggestionListStateAtom = atom((get) => ({
  suggestionList: get(suggestionListAtom),
  suggestionListLoading: get(suggestionListLoadingAtom),
  suggestionListError: get(suggestionListErrorAtom),
}));

export const addSuggestionsAtom = atom(
  null,
  async (get, set, conversationId: string): Promise<void> => {
    set(suggestionListLoadingAtom, true);
    set(suggestionListErrorAtom, null);

    try {
      const newSuggestions: Suggestion[] = await addSuggestions(conversationId);
      const suggestionList = get(suggestionListAtom);
      let newSuggestionList = [...newSuggestions, ...suggestionList];
      if (newSuggestionList.length > MAX_SUGGESTION_LIST_LENGTH) {
        newSuggestionList = newSuggestionList.slice(0, MAX_SUGGESTION_LIST_LENGTH);
      }
      set(suggestionListAtom, newSuggestionList);
    } catch (error) {
      set(
        suggestionListErrorAtom,
        error instanceof Error ? error.message : "Unknown fetch error",
      );
    } finally {
      set(suggestionListLoadingAtom, false);
    }
  },
);

export const loadSuggestionListAtom = atom(
  null,
  async (_get, set, conversationId: string): Promise<void> => {
    set(suggestionListLoadingAtom, true);
    set(suggestionListErrorAtom, null);

    try {
      const suggestionList: Suggestion[] = await getSuggestions(conversationId);

      set(suggestionListAtom, suggestionList);
    } catch (error) {
      set(
        suggestionListErrorAtom,
        error instanceof Error ? error.message : "Unknown fetch error",
      );
      set(suggestionListAtom, []);
    } finally {
      set(suggestionListLoadingAtom, false);
    }
  },
);
