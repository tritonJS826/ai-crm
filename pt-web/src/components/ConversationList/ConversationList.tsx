import {useEffect, useState} from "react";
import {useAtomValue, useSetAtom} from "jotai";
import {CompanionProfile} from "src/components/CompanionProfile/CompanionProfile";
import {MessageList} from "src/components/MessageList/MessageList";
import {WsEventType} from "src/constants/wsEventTypes";
import {useSubscribe} from "src/hooks/useSubscribe";
import {ConversationWithContact} from "src/services/conversation";
import {NewMessage} from "src/services/conversationWs";
import {
  conversationListStateAtom,
  loadConversationListAtom,
  updateConversationListByNewMessageEventAtom,
} from "src/state/conversationListAtom";
import styles from "src/components/ConversationList/ConversationList.module.scss";

export function ConversationList() {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const {conversationList, conversationListLoading, conversationListError} = useAtomValue(conversationListStateAtom);
  const loadConversationList = useSetAtom(loadConversationListAtom);
  const updateConversationListByNewMessageEvent = useSetAtom(updateConversationListByNewMessageEventAtom);

  // Add ws listeners for NEW_MESSAGE event
  useSubscribe<NewMessage>(WsEventType.NEW_MESSAGE, async (event) => {
    await updateConversationListByNewMessageEvent(event);
  });

  useEffect(() => {
    const fetchData = async () => {
      await loadConversationList();
    };
    fetchData();
  }, []);

  // Todo: remove this temporal call
  useEffect(() => {
    setCurrentConversationId("1");
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
      {currentConversationId && <>
        <MessageList conversation_id={currentConversationId} />
        <CompanionProfile />
      </>
      }
    </div>
  );
}
