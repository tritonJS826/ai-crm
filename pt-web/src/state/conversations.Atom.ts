import {atom} from "jotai";
import {ConversationList} from "src/services/conversation";

export const conversationListAtom = atom<ConversationList | null>(null);
