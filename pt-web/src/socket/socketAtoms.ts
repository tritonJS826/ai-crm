import {atom} from "jotai";
import {Socket} from "socket.io-client";

export const socketAtom = atom<Socket | null>(null);
export const isConnectedAtom = atom(false);
export const socketErrorAtom = atom<string | null>(null);

export const socketStateAtom = atom((get) => ({
  socket: get(socketAtom),
  isConnected: get(isConnectedAtom),
  error: get(socketErrorAtom),
}));
