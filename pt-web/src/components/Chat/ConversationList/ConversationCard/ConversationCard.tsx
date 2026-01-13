import {ConversationWithContact} from "src/services/conversationService";
import {toAgoString} from "src/utils/dateFormat";
import styles from "src/components/Chat/ConversationList/ConversationCard/ConversationCard.module.scss";

interface ConversationCardProps {
  conversation: ConversationWithContact;
}

export function ConversationCard({conversation}: ConversationCardProps) {
  const defaultLastMessage = "Lorem, ipsum dolor sit amet consectetur adipisicing elit";

  return (
    <div className={styles.conversationCard}>
      <div className={styles.avatarWrapper}>
        <p className={styles.avatar}>
          {conversation.contact.name ? conversation.contact.name[0] : "?"}
        </p>
      </div>
      <div className={styles.infoWrapper}>
        <div className={styles.nameWrapper}>
          <p className={styles.name}>
            {conversation.contact.name}
          </p>
          <p className={styles.lastMessageDate}>
            {toAgoString(conversation.lastMessageAt.toString())}
          </p>
        </div>
        <p className={styles.lastMessage}>
          {defaultLastMessage}
        </p>
      </div>
    </div>
  );
}
