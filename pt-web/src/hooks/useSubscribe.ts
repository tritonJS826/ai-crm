import {useEffect} from "react";
import {WsEventType} from "src/constants/wsEventTypes";
import {socketClient, WsEvent} from "src/services/websocketClient";

export function useSubscribe<T>(
  eventType: WsEventType,
  eventHandler: (event: WsEvent<T>) => void,
) {
  const socket = socketClient.connect();

  useEffect(() => {
    if (
      !socket || (socket.readyState !== WebSocket.OPEN &&
        socket.readyState !== WebSocket.CONNECTING)
    ) {
      throw new Error("Socket not ready");
    }

    const handler = (event: MessageEvent) => {
      const parsed = JSON.parse(event.data) as WsEvent<T>;

      if (parsed.type === eventType) {
        eventHandler(parsed);
      }
    };

    socket.addEventListener("message", handler);

    return () => {
      socket.removeEventListener("message", handler);
    };
  }, [socket, eventType, eventHandler]);
}
