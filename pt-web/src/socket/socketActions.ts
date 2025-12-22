import {atom, Getter, Setter} from "jotai";
import {WsEventType} from "src/constants/wsEventTypes";
import {socketService} from "src/services/socketService";
import {
  isConnectedAtom,
  socketAtom,
  socketErrorAtom,
} from "src/socket/socketAtoms";
import {WsEvent} from "src/socket/WsEvent";
import {env} from "src/utils/env/env";

export const connectSocketAtom = atom(null, (get, set) => {
  const existingSocket = get(socketAtom);
  if (existingSocket) {
    return;
  }

  const socket = socketService.connect(env.WS_PATH, {autoConnect: false});

  socket.on("connect", () => {
    set(isConnectedAtom, true);
    set(socketErrorAtom, null);
  });

  socket.on("disconnect", () => {
    set(isConnectedAtom, false);
  });

  socket.on("connect_error", (err) => {
    set(socketErrorAtom, err.message);
    set(isConnectedAtom, false);
  });

  set(socketAtom, socket);
});

export const disconnectSocketAtom = atom(null, (get, set) => {
  socketService.disconnect();
  set(isConnectedAtom, false);
  set(socketAtom, null);
});

export const emitSocketAtom = atom(
  null,
  <T>(
    _get: Getter,
    _set: Setter,
    params: {messageType: WsEventType; payload: WsEvent<T>},
  ) => {
    socketService.socketEmit(params.messageType, params.payload);
  },
);
