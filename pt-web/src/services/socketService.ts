import {io, ManagerOptions, Socket, SocketOptions} from "socket.io-client";
import {WsEventType} from "src/constants/wsEventTypes";
import {WsEvent} from "src/socket/WsEvent";

type WSOptions = Partial<Pick<ManagerOptions & SocketOptions, "autoConnect">>;
class SocketService {

  private static instance: SocketService;

  private socket: Socket | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }

    return SocketService.instance;
  }

  public connect(url: string, options?: WSOptions) {
    if (!this.socket) {
      this.socket = io(url, options);
    }

    if (!this.socket.connected) {
      this.socket.connect();
    }

    return this.socket;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  public socketEmit<T>(messageType: WsEventType, payload: WsEvent<T>) {
    if (!this.socket) {
      return;
    }
    this.socket?.emit(messageType, payload);
  }

}

export const socketService = SocketService.getInstance();
