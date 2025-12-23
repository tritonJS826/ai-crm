import {useEffect} from "react";
import {useAtomValue} from "jotai";
import {WsEventType} from "src/constants/wsEventTypes";
import {socketAtom} from "src/socket/socketAtoms";
import {WsEvent} from "src/socket/WsEvent";

export function useOnSocketMessage<T>(
  messageType: WsEventType,
  onCb: (event: WsEvent<T>) => void,
) {
  const socket = useAtomValue(socketAtom);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handler = (event: MessageEvent) => {
      const parsed = JSON.parse(event.data) as WsEvent<T>;

      if (parsed.type === messageType) {
        onCb(parsed);
      }
    };

    socket.addEventListener("message", handler);

    return () => {
      socket.removeEventListener("message", handler);
    };
  }, [socket, messageType, onCb]);
}
