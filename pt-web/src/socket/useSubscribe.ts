import {useEffect} from "react";
import {useAtomValue} from "jotai";
import {WsEventType} from "src/constants/wsEventTypes";
import {socketAtom} from "src/socket/socketAtoms";
import {WsEvent} from "src/socket/WsEvent";

export function useSubscribe<T>(
  eventType: WsEventType,
  eventHandler: (event: WsEvent<T>) => void,
) {
  const socket = useAtomValue(socketAtom);

  useEffect(() => {
    if (!socket) {
      return;
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
