import {atom} from "jotai";
import {localStorageWorker, Token} from "src/globalServices/localStorageWorker";

export const accessTokenAtom = atom<Token | null>(
  localStorageWorker.getItemByKey<Token>("accessToken") ?? {token: null},
);

export const refreshTokenAtom = atom<Token | null>(
  localStorageWorker.getItemByKey<Token>("refreshToken") ?? {token: null},
);

export const accessTokenAtomWithPersistence = atom(
  (get) => get(accessTokenAtom),
  (_get, set, update: Token | null) => {
    set(accessTokenAtom, update);

    if (update?.token) {
      localStorageWorker.setItemByKey("accessToken", update);
    } else {
      localStorageWorker.removeItemByKey("accessToken");
    }
  },
);

export const refreshTokenAtomWithPersistence = atom(
  (get) => get(refreshTokenAtom),
  (_get, set, update: Token | null) => {
    set(refreshTokenAtom, update);

    if (update?.token) {
      localStorageWorker.setItemByKey("refreshToken", update);
    } else {
      localStorageWorker.removeItemByKey("refreshToken");
    }
  },
);

export const clearTokensAtom = atom(null, (_get, set) => {
  set(accessTokenAtom, {token: null});
  set(refreshTokenAtom, {token: null});

  localStorageWorker.removeItemByKey("accessToken");
  localStorageWorker.removeItemByKey("refreshToken");
});
