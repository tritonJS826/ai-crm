
import {useAtomValue} from "jotai";
import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import {conversationStateAtom} from "src/state/conversationAtom";
import styles from "src/components/Chat/CompanionProfile/CompanionProfile.module.scss";

const DEFAULT_AVATAR_SYMBOL = "?";

export function CompanionProfile() {
  const dictionary = useDictionary(DictionaryKey.CHAT);
  const {conversation, conversationLoading, conversationError}
  = useAtomValue(conversationStateAtom);

  if (!dictionary) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  return (
    <div className={styles.companionProfile}>
      <div className={styles.headerWrapper}>
        <h1 className={styles.header}>
          {dictionary.companionProfile.title}
        </h1>
      </div>

      <div className={styles.layout}>
        <div className={styles.profile}>
          <div className={styles.avatarWrapper}>
            <p className={styles.avatar}>
              {conversation?.contact.name
                ? conversation?.contact.name[0].toUpperCase()
                : DEFAULT_AVATAR_SYMBOL}
            </p>
          </div>
          <p className={styles.name}>
            {conversation?.contact.name}
          </p>
          <p className={styles.phone}>
            {conversation?.contact.phone}
          </p>
        </div>

        <div className={styles.reassignment}>
          <h1 className={styles.header}>
            {dictionary.companionProfile.reassignmentTitle}
          </h1>
          <select
            name="reassignment"
            className={styles.reassignmentSelect}
          />

        </div>
        <div className={styles.notes}>
          <div className={styles.notesHeaderWrapper}>
            <h1 className={styles.header}>
              {dictionary.companionProfile.notesTitle}
            </h1>
            <button
              type="button"
              className={styles.addNoteButton}
            >
              {dictionary.companionProfile.notesAddButtonLabel}
            </button>
          </div>

          <textarea className={styles.textarea} />
        </div>
      </div>

      {(conversationLoading) && <p>
        loading...
      </p>}
      {conversationError && <p>
        ERROR
        {" "}
        {conversationError}
      </p>}
    </div>
  );
}
