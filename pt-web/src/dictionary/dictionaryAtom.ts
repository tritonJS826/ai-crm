import {atom} from "jotai";
import {Language} from "src/dictionary/dictionaryLoader";
import {localStorageWorker} from "src/globalServices/localStorageWorker";

export const languageAtom = atom<Language>(
  localStorageWorker.getItemByKey<Language>("language") ?? "en",
);

// Optional: sync with localStorage
export const languageAtomWithPersistence = atom(
  (get) => get(languageAtom),
  (get, set, update: Language) => {
    set(languageAtom, update);
    localStorageWorker.setItemByKey("language", update);
  },
);
