import {Suggestion} from "src/services/suggestionService";
import {toChatDateString} from "src/utils/dateFormat";
import styles from "src/components/Chat/SuggestionList/SuggestionCard/SuggestionCard.module.scss";

export type SuggestionCardProps = {
  suggestion: Suggestion;
  onClickHandler: (suggestionText: string) => void;
};

export function SuggestionCard({suggestion, onClickHandler}: SuggestionCardProps) {
  return (
    <li
      className={styles.suggestionCard}
      onClick={() => onClickHandler(suggestion.text)}
    >
      <button
        type="button"
        className={styles.insertButton}
      >
        <img
          className={styles.insertIcon}
          src="src/assets/suggestionIcons/insert.avif"
          alt=""
        />
      </button>
      <div className={styles.messageWrapper}>
        <p className={styles.createdAt}>
          {toChatDateString(suggestion.createdAt.toString())}
        </p>
        <p className={styles.messageText}>
          {suggestion.text}
        </p>
      </div>
    </li>
  );
}
