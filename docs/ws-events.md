# WebSocket Events

This document defines all server → client WebSocket events.

## Event Envelope

All events follow this structure:

```json
{
  "v": 1,
  "type": "<event_type>",
  "ts": "<ISO-8601 timestamp>",
  "data": { ... }
}
```

## Events

### `health_ping`

Emitted when the backend health endpoint is called.

**Payload**
```json
{
  "users": number,
  "timestamp": string
}
```

---

## Notes

- Clients must ignore unknown event types.
- Event version `v` is reserved for future breaking changes.
- No guarantees are made about event ordering.
