import {io, ManagerOptions, Socket, SocketOptions} from "socket.io-client";

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

  public connect(url: string, options?: Partial<ManagerOptions & SocketOptions>) {
    if (!this.socket) {
      this.socket = io(url, {
        autoConnect: false,
        ...options,
      });
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

}

export const socketService = SocketService.getInstance();
