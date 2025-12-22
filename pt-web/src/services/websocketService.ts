import { ManagerOptions, SocketOptions } from "socket.io-client";
import { WsEventType } from "src/constants/wsEventTypes";
import { WsEvent } from "src/socket/WsEvent";

class SocketService {

  private static instance: SocketService;

  private socket: WebSocket | null = null;

  private constructor() { }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }

    return SocketService.instance;
  }

  public connect(url: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return this.socket;
    }

    this.socket = new WebSocket(url);

    return this.socket;
  }

  public getSocket(): WebSocket | null {
    return this.socket;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  public socketEmit<T>(messageType: WsEventType, payload: WsEvent<T>) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }
    const message = {messageType, payload};
    this.socket?.send(JSON.stringify(message));
  }

}

export const socketService = SocketService.getInstance();
