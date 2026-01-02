import {useEffect} from "react";
import {useAtomValue, useSetAtom} from "jotai";
import {WsActionType} from "src/constants/wsActionTypes";
import {WsEventType} from "src/constants/wsEventTypes";
import {useSubscribe} from "src/hooks/useSubscribe";
import {apiClient} from "src/services/apiClient";
import {ConversationWithContact} from "src/services/conversation";
import {socketClient} from "src/services/websocketClient";
import {conversationListStateAtom, loadConversationListAtom} from "src/state/conversations.Atom";
import styles from "src/components/ConversationList/ConversationList.module.scss";

export function ConversationList() {
  const {conversationList, conversationListLoading, conversationListError} = useAtomValue(conversationListStateAtom);
  const loadConversationList = useSetAtom(loadConversationListAtom);
  // Example for add ws listeners
  useSubscribe(WsEventType.NEW_MESSAGE, (msg) => {
    // eslint-disable-next-line no-console
    console.log("Received NEW_MESSAGE:", msg);
  });

  // Example for emit event
  useEffect(() => {
    socketClient.emit<string>({action: WsActionType.SUBSCRIBE, conversation_id: "1"});
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await loadConversationList();
    };
    fetchData();
  }, []);

  // TODO: remove this temporal sending new message
  useEffect(() => {
    setTimeout(() => {
      apiClient.post("/conversations/send1",
        {
          conversation_id: "1",
          text: "string",
          image_url: "null",
        },
      );

    // eslint-disable-next-line no-magic-numbers
    }, 2000);
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
