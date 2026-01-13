import {ConversationList} from "src/components/ConversationList/ConversationList";
import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";

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
    <section aria-label={dictionary.title}>
      <div>
        {dictionary.title}
        <ConversationList />
      </div>
    </section>
  );
}
