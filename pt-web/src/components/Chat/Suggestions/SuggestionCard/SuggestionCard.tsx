
import {MessageOut} from "src/services/conversationService";
import {toChatDateString} from "src/utils/dateFormat";
import styles from "src/components/Chat/Suggestions/SuggestionCard/SuggestionCard.module.scss";

export type MessageCardProps = {
  message: MessageOut;
  contactName: string;
  own: boolean;
}

export function SuggestionCard({message, contactName, own = true}: MessageCardProps) {

  return (
    <li className={`${styles.suggestionCard} ${own && styles.own}`}>
      <div className={styles.avatarWrapper}>
        <p className={styles.avatar}>
          {contactName[0].toUpperCase()}
        </p>
      </div>
      <div className={styles.messageWrapper}>
        <p className={styles.createdAt}>
          {toChatDateString(message.createdAt.toString())}
        </p>
        <p className={`${styles.messageText}  ${own && styles.own}`}>
          {message.text}
        </p>
      </div>
    </li>
  );
}
