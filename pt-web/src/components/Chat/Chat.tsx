import {useState} from "react";
import {CompanionProfile} from "src/components/Chat/CompanionProfile/CompanionProfile";
import {ConversationList} from "src/components/Chat/ConversationList/ConversationList";
import {MessageList} from "src/components/Chat/MessageList/MessageList";
import {SuggestionList} from "src/components/Chat/SuggestionList/SuggestionList";
import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import styles from "src/components/Chat/Chat.module.scss";

export function Chat() {
  const dictionary = useDictionary(DictionaryKey.CHAT);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messageInputValue, setMessageInputValue] = useState<string>("");

  if (!dictionary) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  const onCardClickHandler = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  const onSuggestionCardClickHandler = (suggestionText: string) => {
    setMessageInputValue(suggestionText);
  };

  return (
    <div className={styles.chat}>
      <h3 className={styles.title}>
        {dictionary.title}
      </h3>
      <div className={styles.content}>
        <ConversationList onCardClickHandler = {onCardClickHandler} />
        {currentConversationId &&
        <MessageList
          conversationId={currentConversationId}
          messageInputValue={messageInputValue}
        />}
        {currentConversationId && <CompanionProfile />}
        {currentConversationId &&
        <SuggestionList
          conversationId={currentConversationId}
          onCardClickHandler={onSuggestionCardClickHandler}
        />}
      </div>

    </div>
  );
}
