import {useEffect} from "react";
import {useAtomValue} from "jotai";
import {socketAtom} from "src/socket/socketAtoms";
import {WsEvent} from "src/socket/WsEvent";
import {WsEventType} from "src/socket/WsEventTypes";

export function useOnSocketMessage<T>(
  messageType: WsEventType,
  onCb: (msgPayload: WsEvent<T>) => void,
) {
  const socket = useAtomValue(socketAtom);

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on(messageType, onCb);

    return () => {
      socket.off(messageType, onCb);
    };
  }, [socket, messageType, onCb]);
}
