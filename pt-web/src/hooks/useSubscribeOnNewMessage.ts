
import {useEffect} from "react";
import {Platform} from "src/constants/platform";
import {WsActionType} from "src/constants/wsActionTypes";
import {WsEventType} from "src/constants/wsEventTypes";
import {socketClient, WsIncomingEvent} from "src/services/websocketClient";

// Schema for message data in responses.
export type Message = {
    conversation_id: string;
    message_id: string;
    from_user_id?: string;
    platform: Platform;
    text?: string;
}

export function useSubscribeOnNewMessage(
  conversation_id: string,
  eventHandler: (event: WsIncomingEvent<Message>) => void,
) {
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const parsed = JSON.parse(event.data) as WsIncomingEvent<Message>;

      if (parsed.type === WsEventType.NEW_MESSAGE) {
        eventHandler(parsed);
      }
    };

    const addSubscription = (socket: WebSocket) => {
      socket.addEventListener("message", handler);
      socket.send(JSON.stringify({
        action: WsActionType.SUBSCRIBE,
        conversation_id: conversation_id,
      }));
    };

    const socket = socketClient.connect();

    if (socket.readyState === WebSocket.OPEN) {
      addSubscription(socket);
    } else {
      socket.onopen = () => {
        addSubscription(socket);
      };
    }

    return () => {
      socket.removeEventListener("message", handler);
    };
  }, [conversation_id, eventHandler]);
}
