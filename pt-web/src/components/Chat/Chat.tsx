import {useState} from "react";
import {CompanionProfile} from "src/components/Chat/CompanionProfile/CompanionProfile";
import {ConversationList} from "src/components/Chat/ConversationList/ConversationList";
import {MessageList} from "src/components/Chat/MessageList/MessageList";
import styles from "src/components/Chat/Chat.module.scss";

export function Chat() {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const onCardClickHandler = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  return (
    <div className={styles.chat}>
      <ConversationList onCardClickHandler = {onCardClickHandler} />
      {currentConversationId && <MessageList conversationId={currentConversationId} />}
      {currentConversationId && <CompanionProfile />}
    </div>
  );
}
