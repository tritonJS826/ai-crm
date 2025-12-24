import {atom} from "jotai";
import {Language} from "src/dictionary/dictionaryLoader";
import {localStorageWorker} from "src/globalServices/localStorageWorker";

const storedLang = localStorageWorker.getItemByKey<Language>("language");
const initialLang: Language = storedLang === "en" ? "en" : "en";

export const languageAtom = atom<Language>(initialLang);

export const languageAtomWithPersistence = atom(
  (get) => get(languageAtom),
  (_get, set) => {
    set(languageAtom, "en");
    localStorageWorker.setItemByKey("language", "en");
  },
);
