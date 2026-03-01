# WebSocket Events

> Purpose: All 14 event types with exact JSON payloads and the base envelope.

<!-- Populate from: backend/app/services/websocket/, workers that emit events -->
<!-- This is the SINGLE source of truth for WS event shapes. -->

## Connection

```
ws://{host}/ws/sessions/{session_id}?token={access_token}
```

**Auth:** Optional `?token=` query param.
- Missing/invalid token: close code `4001`
- Session not owned by user: close code `4003`

See [api/error-codes.md](error-codes.md) for WS close codes.

## Base Envelope

All events follow this envelope:

```json
{
  "type": "event_type_string",
  "session_id": "uuid",
  "timestamp": "ISO 8601 UTC",
  "data": { ... }
}
```

## Event Types

### 1. `comment_received`
Emitted when a new comment (YouTube or manual) is ingested.

```json
{
  "type": "comment_received",
  "session_id": "uuid",
  "timestamp": "...",
  "data": {
    "comment_id": "uuid",
    "text": "string",
    "author": "string",
    "youtube_comment_id": "string"
  }
}
```

---

### 2. `comment_classified`
Emitted after classification worker processes a comment.

```json
{
  "type": "comment_classified",
  "session_id": "uuid",
  "timestamp": "...",
  "data": {
    "comment_id": "uuid",
    "is_question": true,
    "confidence_score": 0.95
  }
}
```

---

### 3. `comment_embedded`
<!-- Populate payload -->

---

### 4. `cluster_created`
<!-- Populate payload -->

---

### 5. `cluster_updated`
<!-- Populate payload: cluster_id, new comment count, updated centroid? -->

---

### 6. `answer_generated`
Emitted when answer_generation worker creates an Answer record.

```json
{
  "type": "answer_generated",
  "session_id": "uuid",
  "timestamp": "...",
  "data": {
    "answer_id": "uuid",
    "cluster_id": "uuid",
    "text": "string",
    "is_posted": false
  }
}
```

---

### 7. `answer_approved`
<!-- Populate payload -->

---

### 8. `answer_edited`
<!-- Populate payload -->

---

### 9. `answer_posted`
Emitted by youtube_posting worker after successfully posting to YouTube.

```json
{
  "type": "answer_posted",
  "session_id": "uuid",
  "timestamp": "...",
  "data": {
    "answer_id": "uuid",
    "cluster_id": "uuid",
    "posted_at": "ISO 8601 UTC"
  }
}
```

---

### 10–14. `...`
<!-- Populate remaining event types from source code -->

## Heartbeat

<!-- Heartbeat event shape and interval, if applicable -->
