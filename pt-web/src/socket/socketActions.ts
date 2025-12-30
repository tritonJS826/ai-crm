import {atom, Getter, Setter} from "jotai";
import {socketService} from "src/services/websocketService";
import {
  isConnectedAtom,
  socketAtom,
  socketErrorAtom,
} from "src/socket/socketAtoms";
import {WsEvent} from "src/socket/WsEvent";

export const connectSocketAtom = atom(null, (get, set) => {
  const existingSocket = get(socketAtom);
  if (existingSocket) {
    return;
  }

  const socket = socketService.connect();

  socket.addEventListener("open", () => {
    set(isConnectedAtom, true);
    set(socketErrorAtom, null);
  });

  socket.addEventListener("close", () => {
    set(isConnectedAtom, false);
  });

  socket.addEventListener("error", (err) => {
    set(socketErrorAtom, String(err));
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
  <T>(_get: Getter, _set: Setter, payload: WsEvent<T>) => {
    socketService.socketEmit(payload);
  },
);
