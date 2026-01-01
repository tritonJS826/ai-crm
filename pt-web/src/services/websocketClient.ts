import {WsEventType} from "src/constants/wsEventTypes";
import {env} from "src/utils/env/env";

export interface WsEvent<T> {
  v: number;
  type: WsEventType;
  ts: Date;
  data: T;
}

const RECONNECT_DELAY = 1000;
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

  public connect(url?: string) {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return this.socket;
    }

    this.url = url || env.WS_PATH;
    this.isManuallyClosed = false;

    this.socket = new WebSocket(this.url);

    this.socket.addEventListener("open", () => {
      this.reconnectAttempts = 0;
    });

    this.socket.addEventListener("close", () => {
      if (!this.isManuallyClosed) {
        this.tryReconnect();
        this.connect(this.url || env.WS_PATH);
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
    this.connect();
    const message = JSON.stringify(payload);
    if (this.socket?.readyState === WebSocket.OPEN) {
      return this.socket.send(message);
    }
    if (this.socket?.readyState === WebSocket.CONNECTING) {
      setTimeout(() => {
        if (this.socket?.readyState !== WebSocket.OPEN) {
          throw new Error("Websocket not ready");
        }
        this.socket.send(message);
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
