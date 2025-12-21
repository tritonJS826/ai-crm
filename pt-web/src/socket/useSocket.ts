import {useEffect} from "react";
import {useAtom, useSetAtom} from "jotai";
import {
  connectSocketAtom,
  disconnectSocketAtom,
  emitSocketAtom,
} from "src/socket/socketActions";
import {
  isConnectedAtom,
  socketAtom,
  socketErrorAtom,
} from "src/socket/socketAtoms";
import {WsEvent} from "src/socket/WsEvent";
import {WsEventType} from "src/socket/WsEventTypes";

export function useSocket() {
  const [socket] = useAtom(socketAtom);
  const [isConnected] = useAtom(isConnectedAtom);
  const [error] = useAtom(socketErrorAtom);

  const connect = useSetAtom(connectSocketAtom);
  const disconnect = useSetAtom(disconnectSocketAtom);
  const emitRaw = useSetAtom(emitSocketAtom);

  const emit = <T>(messageType: WsEventType, payload: WsEvent<T>) => {
    emitRaw({messageType, payload});
  };

  useEffect(() => {
    connect();
  }, []);

  return {
    socket,
    isConnected,
    error,
    connect,
    disconnect,
    emit,
  };
}
