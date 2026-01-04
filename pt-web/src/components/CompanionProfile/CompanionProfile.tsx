
import {useAtomValue} from "jotai";
import {conversationWithContactStateAtom} from "src/state/conversationWithContactAtom";
import styles from "src/components/CompanionProfile/CompanionProfile.module.scss";

export function CompanionProfile() {

  const {conversationWithContact, conversationWithContactLoading, conversationWithContactError}
  = useAtomValue(conversationWithContactStateAtom);

  return (
    <div className={styles.companionProfile}>
      <h1>
        Profile
      </h1>
      <ul>
        {conversationWithContact?.contact.name}
        {conversationWithContact?.contact.phone}
      </ul>
      {(conversationWithContactLoading) && <p>
        loading...
      </p>}
      {conversationWithContactError && <p>
        {conversationWithContactError}
      </p>}
    </div>
  );
}
