import {useEffect} from "react";
import {WsEventType} from "src/constants/wsEventTypes";
import {socketClient, WsEvent} from "src/services/websocketClient";

export function useSubscribe<T>(
  eventType: WsEventType,
  eventHandler: (event: WsEvent<T>) => void,
) {
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const parsed = JSON.parse(event.data) as WsEvent<T>;

      if (parsed.type === WsEventType.NEW_MESSAGE) {
        eventHandler(parsed);
      }
    };

    const socket = socketClient.connect();

    if (!socket) {
      // eslint-disable-next-line no-console
      console.log("WS error during subscribe: socket not init");

      return;
    }

    if (socket.readyState === WebSocket.OPEN) {
      socket.addEventListener("message", handler);
    } else {
      socket.onopen = () => {
        socket.addEventListener("message", handler);
      };
    }

    return () => {
      socket.removeEventListener("message", handler);
    };
  }, [eventType, eventHandler]);
}
