
import {useEffect} from "react";
import {useAtomValue, useSetAtom} from "jotai";
import {WsEventType} from "src/constants/wsEventTypes";
import {useSubscribe} from "src/hooks/useSubscribe";
import {MessageOut} from "src/services/conversation";
import {NewMessage} from "src/services/conversationWs";
import {socketClient} from "src/services/websocketClient";
import {
  conversationWithContactStateAtom,
  loadConversationWithContactAtom,
  updateConversationWithContactByNewMessageEventAtom,
} from "src/state/conversationWithContactAtom";
import {loadMessageListAtom, messageListStateAtom, updateMessageListByNewMessageEventAtom} from "src/state/messageListAtom";
import styles from "src/components/MessageList/MessageList.module.scss";

export type MessageListProps = {
  conversation_id: string;
}

export function MessageList({conversation_id}: MessageListProps) {
  const {messageList, messageListLoading, messageListError} = useAtomValue(messageListStateAtom);
  const loadMessageList = useSetAtom(loadMessageListAtom);
  const updateMessageListByNewMessageEvent = useSetAtom(updateMessageListByNewMessageEventAtom);

  const {conversationWithContact, conversationWithContactLoading, conversationWithContactError}
  = useAtomValue(conversationWithContactStateAtom);
  const loadConversationWithContact = useSetAtom(loadConversationWithContactAtom);
  const updateConversationWithContactByNewMessageEvent = useSetAtom(updateConversationWithContactByNewMessageEventAtom);

  // Add ws listeners for NEW_MESSAGE event
  useSubscribe<NewMessage>(WsEventType.NEW_MESSAGE, (event) => {
    updateMessageListByNewMessageEvent(event);
    updateConversationWithContactByNewMessageEvent(event);
  });

  // Emit for sending NEW_MESSAGE events by server
  useEffect(() => {
    // SocketClient.emit<string>({action: WsActionType.SUBSCRIBE, conversation_id});
  }, [conversation_id]);

  // TODO: remove this temporal Emit for sending NEW_MESSAGE events by server
  useEffect(() => {
    setTimeout(() => {
      socketClient.getSocket()?.send(JSON.stringify({type: "subscribe", scope: "conversation", id: "1"}));
    // eslint-disable-next-line no-magic-numbers
    }, 4000);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await loadMessageList(conversation_id);
      await loadConversationWithContact(conversation_id);
    };
    fetchData();
  }, [conversation_id]);

  const messageListElement = messageList.map((message: MessageOut) => (
    <li key={message.id}>
      {conversationWithContact?.contact.name}
      -
      {message.text}
    </li>));

  return (
    <div className={styles.messageList}>
      <h1>
        MessageList
      </h1>
      <h2>
        {conversationWithContact?.contact.name}
      </h2>
      <ul>
        {messageListElement}
      </ul>
      {(messageListLoading || conversationWithContactLoading) && <p>
        loading...
      </p>}
      {messageListError && <p>
        {messageListError}
      </p>}
      {conversationWithContactError && <p>
        {conversationWithContactError}
      </p>}
    </div>
  );
}
