
import {useAtomValue} from "jotai";
import {conversationWithContactStateAtom} from "src/state/conversationWithContactAtom";
import styles from "src/components/Chat/CompanionProfile/CompanionProfile.module.scss";

const DEFAULT_AVATAR_SYMBOL = "?";

export function CompanionProfile() {

  const {conversationWithContact, conversationWithContactLoading, conversationWithContactError}
  = useAtomValue(conversationWithContactStateAtom);

  return (
    <div className={styles.companionProfile}>
      <div className={styles.headerWrapper}>
        <h1 className={styles.header}>
          Profile
        </h1>
      </div>

      <div className={styles.layout}>
        <div className={styles.profile}>
          <div className={styles.avatarWrapper}>
            <p className={styles.avatar}>
              {conversationWithContact?.contact.name
                ? conversationWithContact?.contact.name[0].toUpperCase()
                : DEFAULT_AVATAR_SYMBOL}
            </p>
          </div>
          <p className={styles.name}>
            {conversationWithContact?.contact.name}
          </p>
          <p className={styles.phone}>
            {conversationWithContact?.contact.phone}
          </p>
        </div>

        <div className={styles.reassignment}>
          <h1 className={styles.header}>
            Reassignment
          </h1>
          <select
            name="reassignment"
            className={styles.reassignmentSelect}
          >
            <option
              value="default"
              selected
            />
          </select>

        </div>
        <div className={styles.notes}>
          <div className={styles.notesHeaderWrapper}>
            <h1 className={styles.header}>
              Notes
            </h1>
            <button
              type="button"
              className={styles.addNoteButton}
            >
              +Add Note
            </button>
          </div>

          <textarea className={styles.textarea} />
        </div>
      </div>

      {(conversationWithContactLoading) && <p>
        loading...
      </p>}
      {conversationWithContactError && <p>
        ERROR
        {" "}
        {conversationWithContactError}
      </p>}
    </div>
  );
}
