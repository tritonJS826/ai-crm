import {atom} from "jotai";
import {getSuggestions, Suggestion} from "src/services/suggestionService";

// Suggestion = {
//     id: string;
//     conversationId: string;
//     text: string;
//     createdAt: Date;
// }

// TODO: remove this temporal init
const suggestionListInit: Suggestion[] = [
  {
    id: "1",
    conversationId: "1",
    text: "#1 Of friendship on inhabiting diminution discovered as. "
    + "Did friendly eat breeding building few nor. Object he barton no effect played valley afford.",
    createdAt: new Date(),
  },
  {
    id: "2",
    conversationId: "1",
    text: "#2 Of friendship on inhabiting diminution discovered as. "
    + "Did friendly eat breeding building few nor. Object he barton no effect played valley afford.",
    createdAt: new Date(),
  },
  {
    id: "3",
    conversationId: "1",
    text: "#3 Of friendship on inhabiting diminution discovered as. "
    + "Did friendly eat breeding building few nor. Object he barton no effect played valley afford.",
    createdAt: new Date(),
  },
  {
    id: "4",
    conversationId: "1",
    text: "#4 Of friendship on inhabiting diminution discovered as. "
    + "Did friendly eat breeding building few nor. Object he barton no effect played valley afford.",
    createdAt: new Date(),
  },
];

const suggestionListAtom = atom<Suggestion[]>(suggestionListInit);
const suggestionListLoadingAtom = atom<boolean>(false);
const suggestionListErrorAtom = atom<string | null>(null);

export const suggestionListStateAtom = atom((get) => ({
  suggestionList: get(suggestionListAtom),
  suggestionListLoading: get(suggestionListLoadingAtom),
  suggestionListError: get(suggestionListErrorAtom),
}));

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
