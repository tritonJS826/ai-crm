import {useEffect} from "react";
import {useAtomValue, useSetAtom} from "jotai";
import {ConversationWithContact} from "src/services/conversation";
import {conversationListStateAtom, loadConversationListAtom} from "src/state/conversations.Atom";
import styles from "src/components/ConversationList/ConversationList.module.scss";

export function ConversationList() {
  const {conversationList, conversationListLoading, conversationListError} = useAtomValue(conversationListStateAtom);
  const loadConversationList = useSetAtom(loadConversationListAtom);

  useEffect(() => {
    const fetchData = async () => {
      await loadConversationList();
    };
    fetchData();
  }, []);

  const conversationListElement = conversationList
    ? conversationList.items.map((item: ConversationWithContact) => (
      <li key={item.id}>
        {item.contact.name}
      </li>))
    : "";

  return (
    <div className={styles.conversationList}>
      <h1>
        ConversationList
      </h1>
      <ul>
        {conversationListElement}
      </ul>
      {conversationListLoading && <p>
        loading...
      </p>}
      {conversationListError && <p>
        {conversationListError}
      </p>}
    </div>
  );
}
