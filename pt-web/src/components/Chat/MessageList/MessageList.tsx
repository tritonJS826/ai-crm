
import {useEffect, useRef, useState} from "react";
import {useAtomValue, useSetAtom} from "jotai";
import {MessageCard} from "src/components/Chat/MessageList/MessageCard/MessageCard";
import {WsEventType} from "src/constants/wsEventTypes";
import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import {useSubscribe} from "src/hooks/useSubscribe";
import {ConversationModel} from "src/models/Conversation";
import {MessageModel} from "src/models/Message";
import {UserProfileModel} from "src/models/UserProfile";
import {sendMessage} from "src/services/conversationService";
import {NewMessage} from "src/services/conversationWsService";
import {defaultWsEvent, socketClient} from "src/services/websocketClient";
import {
  conversationStateAtom,
  loadConversationAtom,
  updateConversationByNewMessageEventAtom,
} from "src/state/conversationAtom";
import {loadMessageListAtom, messageListStateAtom, updateMessageListByNewMessageEventAtom} from "src/state/messageListAtom";
import {userProfileStateAtom} from "src/state/userProfileAtoms";
import styles from "src/components/Chat/MessageList/MessageList.module.scss";

const DEFAULT_AVATAR_SYMBOL = "?";

const getFromUserName = (
  userProfile: UserProfileModel | null,
  conversation: ConversationModel | null,
  fromUserId: string | null | undefined,
): string => {

  if (!userProfile) {
    return DEFAULT_AVATAR_SYMBOL;
  }
  if (userProfile.id === fromUserId) {
    return userProfile.name;
  }
  if (!conversation) {
    return DEFAULT_AVATAR_SYMBOL;
  }
  if (conversation.contact.id === fromUserId) {
    return conversation.contact.name ?? DEFAULT_AVATAR_SYMBOL;
  }

  return DEFAULT_AVATAR_SYMBOL;
};

export type MessageListProps = {
  conversationId: string;
  messageInputValue: string;
}

export function MessageList({conversationId, messageInputValue}: MessageListProps) {
  const dictionary = useDictionary(DictionaryKey.CHAT);
  const {userProfile} = useAtomValue(userProfileStateAtom);

  const {messageList, messageListLoading, messageListError} = useAtomValue(messageListStateAtom);
  const loadMessageList = useSetAtom(loadMessageListAtom);
  const updateMessageListByNewMessageEvent = useSetAtom(updateMessageListByNewMessageEventAtom);

  const {conversation, conversationLoading, conversationError}
  = useAtomValue(conversationStateAtom);
  const loadConversation = useSetAtom(loadConversationAtom);
  const updateConversationByNewMessageEvent = useSetAtom(updateConversationByNewMessageEventAtom);

  const [text, setText] = useState<string>("");

  const messageElementsWrapperRef = useRef<HTMLUListElement>(null);

  // Add ws listeners for NEW_MESSAGE event
  useSubscribe<NewMessage>(WsEventType.NEW_MESSAGE, (event) => {
    updateMessageListByNewMessageEvent(event);
    updateConversationByNewMessageEvent(event);
  });

  // Emit for sending NEW_MESSAGE events by server
  useEffect(() => {
    socketClient.emit({...defaultWsEvent, type: WsEventType.SUBSCRIBE, data: {scope: "conversation", id: conversationId}});
  }, [conversationId]);

  useEffect(() => {
    loadMessageList(conversationId);
    loadConversation(conversationId);
  }, [conversationId]);

  useEffect(() => {
    setText(messageInputValue);
  }, [messageInputValue]);

  useEffect(() => {
    if (!messageElementsWrapperRef.current) {
      return;
    }
    messageElementsWrapperRef.current.scrollTop = messageElementsWrapperRef.current.scrollHeight;
  }, [messageList]);

  if (!dictionary) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  const submitMessage = () => {
    if (text.trim() === "") {
      return;
    }
    sendMessage({conversationId, text});
    setText("");
  };

  const textareaHotkeyHandler = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.ctrlKey && event.key === "Enter") {
      submitMessage();
    }
  };

  const messageListElement = messageList.map((message: MessageModel) => (
    <MessageCard
      key={message.id}
      message={message}
      contactName={getFromUserName(userProfile, conversation, message.fromUserId)}
      own={message.fromUserId === userProfile?.id}
    />));

  return (
    <div className={styles.messageList}>
      <div>
        <h2 className={styles.header}>
          {conversation?.contact.name}
        </h2>
      </div>

      <div className={styles.content}>
        <div className={styles.relativeWrapper}>
          <ul
            className={styles.messageElementsWrapper}
            ref={messageElementsWrapperRef}
          >
            {messageListElement}
          </ul>
        </div>

        <div className={styles.messageInputWrapper}>
          <textarea
            value={text}
            onChange={(event) => {
              setText(event.target.value);
            }}
            name="messageInput"
            placeholder={dictionary.messageList.messageInputPlaceholder}
            className={styles.messageInput}
            onKeyDown={textareaHotkeyHandler}
          />

          <button
            type="button"
            onClick={submitMessage}
            className={styles.messageSendButton}
            title="Ctrl+Enter"
          >
            {dictionary.messageList.sendButtonLabel}
          </button>
        </div>
      </div>

      {(messageListLoading || conversationLoading) && <p>
        loading...
      </p>}
      {messageListError && <p>
        ERROR
        {" "}
        {messageListError}
      </p>}
      {conversationError && <p>
        ERROR
        {" "}
        {conversationError}
      </p>}
    </div>
  );
}
