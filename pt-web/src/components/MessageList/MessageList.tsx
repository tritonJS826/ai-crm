
import {useEffect, useState} from "react";
import {useAtomValue, useSetAtom} from "jotai";
import {WsEventType} from "src/constants/wsEventTypes";
import {useSubscribe} from "src/hooks/useSubscribe";
import {MessageOut, sendMessage} from "src/services/conversationService";
import {NewMessage} from "src/services/conversationWsService";
import {defaultWsEvent, socketClient} from "src/services/websocketClient";
import {
  conversationWithContactStateAtom,
  loadConversationWithContactAtom,
  updateConversationWithContactByNewMessageEventAtom,
} from "src/state/conversationWithContactAtom";
import {loadMessageListAtom, messageListStateAtom, updateMessageListByNewMessageEventAtom} from "src/state/messageListAtom";
import styles from "src/components/MessageList/MessageList.module.scss";

export type MessageListProps = {
  conversationId: string;
}

export function MessageList({conversationId = "1"}: MessageListProps) {
  const {messageList, messageListLoading, messageListError} = useAtomValue(messageListStateAtom);
  const loadMessageList = useSetAtom(loadMessageListAtom);
  const updateMessageListByNewMessageEvent = useSetAtom(updateMessageListByNewMessageEventAtom);

  const {conversationWithContact, conversationWithContactLoading, conversationWithContactError}
  = useAtomValue(conversationWithContactStateAtom);
  const loadConversationWithContact = useSetAtom(loadConversationWithContactAtom);
  const updateConversationWithContactByNewMessageEvent = useSetAtom(updateConversationWithContactByNewMessageEventAtom);

  const [text, setText] = useState<string>("");

  // Add ws listeners for NEW_MESSAGE event
  useSubscribe<NewMessage>(WsEventType.NEW_MESSAGE, (event) => {
    updateMessageListByNewMessageEvent(event);
    updateConversationWithContactByNewMessageEvent(event);
  });

  // Emit for sending NEW_MESSAGE events by server
  useEffect(() => {
    socketClient.emit({...defaultWsEvent, type: WsEventType.SUBSCRIBE, data: {scope: "conversation", id: conversationId}});
  }, [conversationId]);

  useEffect(() => {
    const fetchData = async () => {
      await loadMessageList(conversationId);
      await loadConversationWithContact(conversationId);
    };
    fetchData();
  }, [conversationId]);

  const handler = () => {
    sendMessage({conversationId: "1", text});
  };

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
      <input
        type={"text"}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
        }}
      />
      <button
        type="button"
        onClick={handler}
      >
        SEND
      </button>
      {(messageListLoading || conversationWithContactLoading) && <p>
        loading...
      </p>}
      {messageListError && <p>
        ERROR
        {" "}
        {messageListError}
      </p>}
      {conversationWithContactError && <p>
        ERROR
        {" "}
        {conversationWithContactError}
      </p>}
    </div>
  );
}
