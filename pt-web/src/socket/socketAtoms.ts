import {atom} from "jotai";

export const socketAtom = atom<WebSocket | null>(null);
export const isConnectedAtom = atom(false);
export const socketErrorAtom = atom<string | null>(null);

export const socketStateAtom = atom((get) => ({
  socket: get(socketAtom),
  isConnected: get(isConnectedAtom),
  error: get(socketErrorAtom),
}));
