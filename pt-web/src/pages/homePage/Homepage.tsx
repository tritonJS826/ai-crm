import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";

type HomeDictionary = {
  title: string;
};

export function HomePage() {
  const dictionary = useDictionary(DictionaryKey.HOME) as HomeDictionary | null;

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
      </div>
    </section>
  );
}
