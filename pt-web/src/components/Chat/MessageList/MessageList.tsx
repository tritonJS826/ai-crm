
import {useEffect, useState} from "react";
import {useAtom, useAtomValue, useSetAtom} from "jotai";
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
import {userProfileAtom} from "src/state/userProfileAtoms";
import styles from "src/components/Chat/MessageList/MessageList.module.scss";

export type MessageListProps = {
  conversationId: string;
}

export function MessageList({conversationId}: MessageListProps) {
  const [userProfile] = useAtom(userProfileAtom);

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
    loadMessageList(conversationId);
    loadConversationWithContact(conversationId);
  }, [conversationId]);

  const handler = () => {
    sendMessage({conversationId, text});
    setText("");
  };

  const messageListElement = [...messageList].reverse().map((message: MessageOut) => (
    <MessageCard
      key={message.id}
      message={message}
      contactName={(message.fromUserId === userProfile?.id ? userProfile?.name : conversationWithContact?.contact.name) || "?"}
      own={message.fromUserId === userProfile?.id}
    />));

  return (
    <div className={styles.messageList}>
      <div>
        <h2 className={styles.header}>
          {conversationWithContact?.contact.name}
        </h2>
      </div>

      <div className={styles.content}>
        <ul className={styles.messageElementsWrapper}>
          {messageListElement}
        </ul>

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
