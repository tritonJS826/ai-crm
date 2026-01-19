
import {useEffect} from "react";
import {useAtomValue, useSetAtom} from "jotai";
import refreshIcon from "src/assets/suggestionIcons/refresh.avif";
import {SuggestionCard} from "src/components/Chat/SuggestionList/SuggestionCard/SuggestionCard";
import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import {Suggestion} from "src/services/suggestionService";
import {addSuggestionsAtom, loadSuggestionListAtom, suggestionListStateAtom} from "src/state/suggestionListAtom";
import styles from "src/components/Chat/SuggestionList/SuggestionList.module.scss";

export type SuggestionsProps = {
  conversationId: string;
  onCardClickHandler: (suggestionText: string) => void;
}

export function SuggestionList({conversationId, onCardClickHandler}: SuggestionsProps) {
  const dictionary = useDictionary(DictionaryKey.CHAT);

  const {suggestionList, suggestionListError, suggestionListLoading} = useAtomValue(suggestionListStateAtom);
  const loadSuggestionList = useSetAtom(loadSuggestionListAtom);
  const addSuggestions = useSetAtom(addSuggestionsAtom);

  useEffect(() => {
    loadSuggestionList(conversationId);
  }, [conversationId]);

  if (!dictionary) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  const onRefreshClickHandler = () => {
    addSuggestions(conversationId);
  };

  const suggestionsElement = suggestionList.map((suggestion: Suggestion) => (
    <SuggestionCard
      key={suggestion.id}
      suggestion={suggestion}
      onClickHandler={onCardClickHandler}
    />));

  return (
    <div className={styles.suggestions}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {dictionary.suggestions.title}
        </h2>
        <button
          type="button"
          className={styles.refreshButton}
          onClick={onRefreshClickHandler}
        >
          <img
            className={styles.refreshIcon}
            src={refreshIcon}
            alt=""
          />
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.relativeWrapper}>
          <ul className={styles.messageElementsWrapper}>
            {suggestionsElement}
          </ul>
        </div>

      </div>

      {suggestionListLoading && <p>
        loading...
      </p>}
      {suggestionListError && <p>
        ERROR
        {" "}
        {suggestionListError}
      </p>}
    </div>
  );
}
