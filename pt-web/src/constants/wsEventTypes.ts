export enum WsEventType {
  // Enumeration of WebSocket event types.

  // System events
  HEALTH_PING = "health_ping",
  ERROR = "error",

  // Outgoing events

  // subscribe for new message event
  SUBSCRIBE = "subscribe",

  // Incoming events

  // successful subscription event
  SUBSCRIBED = "subscribed",

  // Chat events
  NEW_MESSAGE = "new_message",
  CONVERSATION_UPDATED = "conversation_updated",

  // Order events
  ORDER_CREATED = "order_created",

  // Check event
  CHECK_EVENT = "check_event",
}
