import {WsEventType} from "src/constants/wsEventTypes";

export interface WsEvent<T> {
  v: number;
  type: WsEventType;
  ts: Date;
  data: T;
}
