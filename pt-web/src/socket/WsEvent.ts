import {WsEventType} from "src/socket/WsEventTypes";

export interface WsEvent<T> {
  v: number;
  type: WsEventType;
  ts: Date;
  data: Record<string, T>;
}
