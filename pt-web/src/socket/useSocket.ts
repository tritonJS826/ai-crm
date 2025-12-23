import {useEffect} from "react";
import {useAtomValue, useSetAtom} from "jotai";
import {
  connectSocketAtom,
  disconnectSocketAtom,
  emitSocketAtom,
} from "src/socket/socketActions";
import {socketStateAtom} from "src/socket/socketAtoms";
import {WsEvent} from "src/socket/WsEvent";

export function useSocket() {
  const {socket, isConnected, error} = useAtomValue(socketStateAtom);

  const connect = useSetAtom(connectSocketAtom);
  const disconnect = useSetAtom(disconnectSocketAtom);
  const emitRaw = useSetAtom(emitSocketAtom);

  const emit = <T>(payload: WsEvent<T>) => {
    emitRaw(payload);
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
