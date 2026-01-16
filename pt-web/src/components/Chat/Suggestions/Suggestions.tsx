
import {useEffect, useState} from "react";
import {useAtom, useAtomValue, useSetAtom} from "jotai";
import {SuggestionCard} from "src/components/Chat/Suggestions/SuggestionCard/SuggestionCard";
import {WsEventType} from "src/constants/wsEventTypes";
import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import {useSubscribe} from "src/hooks/useSubscribe";
import {ConversationWithContact, MessageOut, sendMessage} from "src/services/conversationService";
import {NewMessage} from "src/services/conversationWsService";
import {UserProfile} from "src/services/profileService";
import {defaultWsEvent, socketClient} from "src/services/websocketClient";
import {
  conversationWithContactStateAtom,
  loadConversationWithContactAtom,
  updateConversationWithContactByNewMessageEventAtom,
} from "src/state/conversationWithContactAtom";
import {loadMessageListAtom, messageListStateAtom, updateMessageListByNewMessageEventAtom} from "src/state/messageListAtom";
import {userProfileAtom} from "src/state/userProfileAtoms";
import styles from "src/components/Chat/Suggestions/Suggestions.module.scss";

const DEFAULT_AVATAR_SYMBOL = "?";

const getFromUserName = (
  userProfile: UserProfile | null,
  conversationWithContact: ConversationWithContact | null,
  fromUserId: string | undefined,
): string => {

  if (!userProfile) {
    return DEFAULT_AVATAR_SYMBOL;
  }
  if (userProfile.id === fromUserId) {
    return userProfile.name;
  }
  if (!conversationWithContact) {
    return DEFAULT_AVATAR_SYMBOL;
  }
  if (conversationWithContact.contact.id === fromUserId) {
    return conversationWithContact.contact.name ?? DEFAULT_AVATAR_SYMBOL;
  }

  return DEFAULT_AVATAR_SYMBOL;
};

export type SuggestionsProps = {
  conversationId: string;
}

export function Suggestions({conversationId}: SuggestionsProps) {
  const dictionary = useDictionary(DictionaryKey.CHAT);
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

  if (!dictionary) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  const handler = () => {
    sendMessage({conversationId, text});
    setText("");
  };

  const suggestionsElement = [...messageList].reverse().map((message: MessageOut) => (
    <SuggestionCard
      key={message.id}
      message={message}
      contactName={getFromUserName(userProfile, conversationWithContact, message.fromUserId)}
      own={message.fromUserId === userProfile?.id}
    />));

  return (
    <div className={styles.suggestions}>
      <div>
        <h2 className={styles.header}>
          {dictionary.suggestions.title}
        </h2>
      </div>

      <div className={styles.content}>
        <ul className={styles.messageElementsWrapper}>
          {suggestionsElement}
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
