# WebSocket Broadcasting (Frontend Guide)

This document describes how frontend clients should use WebSockets
to receive broadcast events from the backend.

This is MVP-level functionality. Auth and advanced filtering will be added later.

---

## 1. WebSocket endpoint

Connect to:

ws://<API_HOST>/ws

Example (browser):

```js
const ws = new WebSocket("ws://localhost:8000/ws");
```

---

## 2. Message format (server → client)

All events sent by the server follow this structure:

```json
{
  "type": "event_name",
  "payload": { }
}
```

Examples:

```json
{
  "type": "system_event",
  "payload": {
    "text": "hello"
  }
}
```

```json
{
  "type": "new_message",
  "payload": {
    "conversation_id": "123",
    "message": {
      "id": "uuid",
      "text": "hi",
      "created_at": "2026-01-01T12:00:00Z"
    }
  }
}
```

---

## 3. Global broadcasts

Some events are broadcast to all connected clients.

Frontend does not need to do anything special to receive them.
Just stay connected.

---

## 4. Channel / conversation subscriptions

To receive events for a specific conversation,
the client must subscribe after connecting.

### Subscribe message (client → server)

```json
{
  "action": "subscribe",
  "conversation_id": "123"
}
```

Example:

```js
ws.onopen = () => {
  ws.send(JSON.stringify({
    action: "subscribe",
    conversation_id: "123",
  }));
};
```

---

## 5. Delivery guarantees

- Best-effort delivery
- No retries
- No ordering guarantees across connections
- If the connection drops, the client must reconnect and re-subscribe

---

## 6. Authentication (not yet implemented)

WebSocket authentication is not enabled yet.

Planned next step:
- authentication during WS connection
- user-based filtering of broadcasts

---

## 7. Error handling (frontend responsibility)

Frontend should:
- handle unexpected disconnects
- reconnect if needed
- re-send subscription messages after reconnect

Server will silently drop dead connections.
