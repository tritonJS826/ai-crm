import {useEffect} from "react";
import {useAtomValue, useSetAtom} from "jotai";
import {ConversationCard} from "src/components/Chat/ConversationList/ConversationCard/ConversationCard";
import {WsEventType} from "src/constants/wsEventTypes";
import {DictionaryKey} from "src/dictionary/dictionaryLoader";
import {useDictionary} from "src/dictionary/useDictionary";
import {useSubscribe} from "src/hooks/useSubscribe";
import {ConversationWithContact} from "src/services/conversationService";
import {NewMessage} from "src/services/conversationWsService";
import {
  conversationListStateAtom,
  loadConversationListAtom,
  updateConversationListByNewMessageEventAtom,
} from "src/state/conversationListAtom";
import styles from "src/components/Chat/ConversationList/ConversationList.module.scss";

interface ConversationListProps {
  onCardClickHandler: (conversationId: string) => void;
}

export function ConversationList({onCardClickHandler}: ConversationListProps) {
  const dictionary = useDictionary(DictionaryKey.CHAT);
  const {conversationList, conversationListLoading, conversationListError} = useAtomValue(conversationListStateAtom);
  const loadConversationList = useSetAtom(loadConversationListAtom);
  const updateConversationListByNewMessageEvent = useSetAtom(updateConversationListByNewMessageEventAtom);

  // Add ws listeners for NEW_MESSAGE event
  useSubscribe<NewMessage>(WsEventType.NEW_MESSAGE, async (event) => {
    await updateConversationListByNewMessageEvent(event);
  });

  useEffect(() => {
    loadConversationList();
  }, []);

  if (!dictionary) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  const conversationListElement = conversationList
    ? conversationList.items.map((item: ConversationWithContact) => (
      <ConversationCard
        key={item.id}
        conversation={item}
        onCardClick = {() => onCardClickHandler(item.id)}
      />
    ))
    : [];

  return (
    <div className={styles.conversationList}>
      <div className={styles.searchWrapper}>
        <input
          className={styles.search}
          type="text"
          placeholder={dictionary.conversationList.searchPlaceholder}
          name="search"
        />
      </div>

      <ul>
        {conversationListElement.length > 0 ? conversationListElement : dictionary.conversationList.infoEmptyList}
      </ul>
      {conversationListLoading && <p>
        loading...
      </p>}
      {conversationListError && <p>
        ERROR
        {" "}
        {conversationListError}
      </p>}
    </div>
  );
}
