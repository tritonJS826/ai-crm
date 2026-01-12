import {WsEventType} from "src/constants/wsEventTypes";
import {localStorageWorker, Token as LSToken} from "src/globalServices/localStorageWorker";
import {env} from "src/utils/env/env";

export type WsEvent<T> = {
  type: WsEventType;
  ts: Date;
  data: T;
}

export const defaultWsEvent = {ts: new Date()};

const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;
class SocketClient {

  private static instance: SocketClient;

  private socket: WebSocket | null = null;

  private url: string | null = null;

  private reconnectAttempts = 0;

  private isManuallyClosed = false;

  private constructor() {}

  public static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient();
    }

    return SocketClient.instance;
  }

  public getSocket() {
    return this.socket;
  }

  public connect() {

    const accessObj = localStorageWorker.getItemByKey<LSToken>("accessToken");
    if (!accessObj?.token) {
      // eslint-disable-next-line no-console
      console.log("WS error during connect: access token not found.");
      this.disconnect();

      return;
    }

    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return this.socket;
    }

    this.url = `${env.WS_PATH}?token=${accessObj.token}`;
    this.isManuallyClosed = false;

    this.socket = new WebSocket(this.url);

    this.socket.addEventListener("open", () => {
      this.reconnectAttempts = 0;
    });

    this.socket.addEventListener("close", () => {
      if (!this.isManuallyClosed) {
        this.tryReconnect();
        this.connect();
      }
    });

    this.socket.addEventListener("error", (err) => {
      throw new Error("Websocket error: " + err);
    });

    return this.socket;

  }

  public disconnect() {
    this.isManuallyClosed = true;

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  public emit<T>(payload: WsEvent<T>) {
    const socket = this.connect();
    const message = JSON.stringify(payload);

    try {
      if (!socket) {
      // eslint-disable-next-line no-console
        console.log("WS error during emit message: socket not init");

        return;
      }
      socket.send(message);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("WS error during emit message: ", error);

      setTimeout(() => {
        if (!socket) {
          // eslint-disable-next-line no-console
          console.log("WS error during emit message: socket not init");

          return;
        }
        socket.send(message);
      }, RECONNECT_DELAY);
    }
  }

  private tryReconnect() {
    if (!this.url) {
      return;
    }

    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      return;
    }

    this.reconnectAttempts++;

    setTimeout(() => {
      if (!this.url) {
        return;
      }
      this.connect();
    }, RECONNECT_DELAY);
  }

}

export const socketClient = SocketClient.getInstance();
