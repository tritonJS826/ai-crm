import {WsEvent} from "src/socket/WsEvent";

const RECONNECT_DELAY = 1000;
const MAX_RECONNECT_ATTEMPTS = 5;
class SocketService {

  private static instance: SocketService;

  private socket: WebSocket | null = null;

  private url: string | null = null;

  private reconnectAttempts = 0;

  private messageQueue: string[] = [];

  private isManuallyClosed = false;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }

    return SocketService.instance;
  }

  public getSocket() {
    return this.socket;
  }

  public connect(url: string) {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return this.socket;
    }

    this.url = url;
    this.isManuallyClosed = false;

    this.socket = new WebSocket(url);

    this.socket.addEventListener("open", () => {
      this.reconnectAttempts = 0;
      this.flushQueue();
    });

    this.socket.addEventListener("close", () => {
      if (!this.isManuallyClosed) {
        this.tryReconnect();
      }
    });

    this.socket.addEventListener("error", (err) => {
      // eslint-disable-next-line no-console
      console.error("WS error", err);
    });

    return this.socket;
  }

  public disconnect() {
    this.isManuallyClosed = true;

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.messageQueue = [];
  }

  public socketEmit<T>(payload: WsEvent<T>) {
    const message = JSON.stringify(payload);

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(message);

      return;
    }

    this.messageQueue.push(message);
  }

  private flushQueue() {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      return;
    }

    while (this.messageQueue.length) {
      const msg = this.messageQueue.shift();
      if (msg) {
        this.socket.send(msg);
      }
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
      this.connect(this.url);
    }, RECONNECT_DELAY);
  }

}

export const socketService = SocketService.getInstance();
