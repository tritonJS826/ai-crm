import {Chat} from "src/components/Chat/Chat";
import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import styles from "src/pages/chatPage/ChatPage.module.scss";

export function ChatPage() {
  const dictionary = useDictionary(DictionaryKey.CHAT);

  if (!dictionary) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  return (
    <section
      aria-label={dictionary.title}
      className={styles.chatPage}
    >
      <Chat />
    </section>
  );
}
