import {atom} from "jotai";
import {
  getMessages,
  MessageOut,
} from "src/services/conversationService";
import {NewMessage} from "src/services/conversationWsService";
import {WsEvent} from "src/services/websocketClient";

// MessageOut = {
//     id: string;
//     conversation_id: string;
//     from_user_id?: string;
//     platform: "WHATSAPP" | "MESSENGER" | "INSTAGRAM";
//     text?: string;
//     media_url?: string;
//     remote_message_id?: string;
//     created_at: Date;
// }

const messageListAtom = atom<MessageOut[]>([]);
const messageListLoadingAtom = atom<boolean>(false);
const messageListErrorAtom = atom<string | null>(null);

export const messageListStateAtom = atom((get) => ({
  messageList: get(messageListAtom),
  messageListLoading: get(messageListLoadingAtom),
  messageListError: get(messageListErrorAtom),
}));

export const loadMessageListAtom = atom(
  null,
  async (_get, set, conversationId: string): Promise<void> => {
    set(messageListLoadingAtom, true);
    set(messageListErrorAtom, null);

    try {
      const messageList: MessageOut[] = await getMessages(conversationId);

      set(messageListAtom, messageList);
    } catch (error) {
      set(
        messageListErrorAtom,
        error instanceof Error ? error.message : "Unknown fetch error",
      );
      set(messageListAtom, []);
    } finally {
      set(messageListLoadingAtom, false);
    }
  },
);

export const updateMessageListByNewMessageEventAtom = atom(
  null,
  (get, set, event: WsEvent<NewMessage>): void => {
    const messageList = get(messageListAtom);

    // Message exists in list → return
    if (messageList.find(message => message.id === event.data.message_id)) {
      return;
    }

    // Update existing messageList immutably
    const updatedItem: MessageOut = {
      id: event.data.message_id,
      conversationId: event.data.conversation_id,
      createdAt: event.ts,
      platform: event.data.platform,
      fromUserId: event.data.from_user_id,
      text: event.data.text,
      direction: event.data.direction,
    };
    set(messageListAtom, [
      ...messageList,
      updatedItem,
    ],

    );
  },

);
