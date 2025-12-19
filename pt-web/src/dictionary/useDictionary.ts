import {useEffect, useState} from "react";
import {useAtomValue} from "jotai";
import {languageAtomWithPersistence} from "src/dictionary/dictionaryAtom";
import {DictionaryKey, DictionaryMap, loadDictionary} from "src/dictionary/dictionaryLoader";

export function useDictionary<K extends DictionaryKey>(key: K) {
  const language = useAtomValue(languageAtomWithPersistence);
  const [dict, setDict] = useState<DictionaryMap[K] | null>(null);

  useEffect(() => {
    let active = true;
    loadDictionary(key, language).then((d) => {
      if (active) {
        setDict(d);
      }
    });

    return () => {
      active = false;
    };
  }, [key, language]);

  return dict;
}
