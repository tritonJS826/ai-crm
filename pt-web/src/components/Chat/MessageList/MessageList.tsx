
import {useEffect, useState} from "react";
import {useAtomValue, useSetAtom} from "jotai";
import {MessageCard} from "src/components/Chat/MessageList/MessageCard/MessageCard";
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
import styles from "src/components/Chat/MessageList/MessageList.module.scss";

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
    <MessageCard
      key={message.id}
      message={message}
      contactName={conversationWithContact?.contact.name || "?"}
      own={false}
    />));

  return (
    <div className={styles.messageList}>
      <div>
        <h2 className={styles.header}>
          {conversationWithContact?.contact.name}
        </h2>
      </div>
      <div className={styles.messageElementsRelativeWrapper}>
        <ul className={styles.messageElementsWrapper}>
          {messageListElement}
        </ul>
      </div>

      <div className={styles.messageInputWrapper}>
        <input
          type={"text"}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
          }}
          name="messageInput"
          placeholder="Type your message here..."
          className={styles.messageInput}
        />

        <button
          type="button"
          onClick={handler}
          className={styles.messageSendButton}
        >
          SEND
        </button>
      </div>

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
