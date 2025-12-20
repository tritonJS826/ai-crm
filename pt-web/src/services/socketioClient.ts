import {io, Socket} from "socket.io-client";
import {env} from "src/utils/env/env";

export type EventPayload = {
  id?: number;
  message?: string;
};

export type EventType =
  | "eventType1"
  | "eventType2"
  | "eventType3"
  | "eventType4";

export class SocketIOClient {

  private static _instance: Socket | undefined;

  constructor() {}

  public static getInstance(): Socket {
    if (!this._instance) {
      this._instance = this.createInstance();
    }

    return this._instance;
  }

  public static emit(eventType: EventType, payload: EventPayload) {
    if (!this._instance) {
      // eslint-disable-next-line no-console
      return console.log("Error: WS instance undefined");
    }
    this._instance.emit(eventType, payload);
  }

  private static createInstance() {
    const socket = io(`${env.WS_PATH}`, {withCredentials: true});

    socket.on("connect", function () {
      // eslint-disable-next-line no-console
      console.log("Socket connected: ", socket.connected);
    });

    socket.on("disconnect", () => {
      // eslint-disable-next-line no-console
      console.log("Disconnected from server");
      // eslint-disable-next-line no-console
      console.log("Socket connected", socket.connected);
      this._instance = undefined;
    });

    socket.on("connect_error", (error) => {
      if (socket.active) {
        // eslint-disable-next-line no-console
        console.log(
          "Temporary failure, the socket will automatically try to reconnect",
        );
      } else {
        // eslint-disable-next-line no-console
        console.log(error.message);
      }
    });

    socket.on("some_event", (arg) => {
      // eslint-disable-next-line no-console
      console.log(arg);
    });

    return socket;
  }

}
