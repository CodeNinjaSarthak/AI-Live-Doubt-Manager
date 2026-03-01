# REST API Reference

> Purpose: Every REST endpoint — method, path, auth required, request schema, response schema, error codes.

<!-- Populate from: backend/app/api/v1/ -->
<!-- This is the SINGLE source of truth for REST schemas. Do NOT duplicate in frontend/api-client.md or backend/*.md -->

## Conventions

- Base path: `/api/v1`
- Auth: `Authorization: Bearer <access_token>` (HTTPBearer) unless noted as public
- All timestamps: ISO 8601 UTC
- All IDs: UUID v4 strings
- Error shape: see [api/error-codes.md](error-codes.md)

---

## Auth Endpoints (`/api/v1/auth`)

### POST /api/v1/auth/register
**Auth:** Public

**Request:**
```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "email": "string",
  "name": "string"
}
```

---

### POST /api/v1/auth/login
**Auth:** Public

**Request:** `application/x-www-form-urlencoded` — `username`, `password`

**Response 200:**
```json
{
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "bearer"
}
```

---

### POST /api/v1/auth/refresh
**Auth:** Bearer refresh_token

**Response 200:** Same as login response

---

### POST /api/v1/auth/logout
**Auth:** Bearer access_token

**Response 200:** `{"detail": "logged out"}`

---

## Session Endpoints (`/api/v1/sessions`)

<!-- Populate: list, create, get, update, delete, activate, comments endpoints -->

### GET /api/v1/sessions
**Auth:** Required

**Response 200:** `[SessionResponse]`

---

### POST /api/v1/sessions
**Auth:** Required

**Request:**
```json
{
  "title": "string",
  "youtube_video_id": "string | null"
}
```

**Response 201:** `SessionResponse`

---

### GET /api/v1/sessions/{session_id}
**Auth:** Required (must own session)

**Response 200:** `SessionResponse`

---

### GET /api/v1/sessions/{session_id}/comments
**Auth:** Required (must own session)

**Query params:** `limit` (default: 100), `offset` (default: 0)

**Response 200:** `[CommentResponse]`

---

## Dashboard Endpoints (`/api/v1/dashboard`)

### POST /api/v1/dashboard/sessions/{session_id}/question
**Auth:** Required (must own session)

Submit a manual question bypassing YouTube polling.

**Request:**
```json
{
  "text": "string"
}
```

**Response 201:** `CommentResponse`

---

### POST /api/v1/dashboard/answers/{answer_id}/approve
**Auth:** Required

**Note:** Takes `answer_id` (not `cluster_id`). See [frontend/api-client.md](../frontend/api-client.md).

**Response 200:** `AnswerResponse`

---

### PUT /api/v1/dashboard/answers/{answer_id}/edit
**Auth:** Required

**Request:**
```json
{
  "text": "string"
}
```

**Response 200:** `AnswerResponse`

---

### GET /api/v1/dashboard/sessions/{session_id}/stats
**Auth:** Required (must own session)

**Response 200:**
```json
{
  "total_comments": 0,
  "total_questions": 0,
  "total_clusters": 0,
  "total_answers": 0,
  "posted_answers": 0
}
```

---

## YouTube Endpoints (`/api/v1/youtube`)

<!-- Populate: auth/url, auth/callback, auth/refresh, auth/status, auth/disconnect, videos/{id}/validate -->

### GET /api/v1/youtube/auth/url
**Auth:** Required

**Response 200:**
```json
{
  "url": "string",
  "state": "string"
}
```

---

### GET /api/v1/youtube/auth/callback
**Auth:** Public (OAuth callback)

Returns HTML that postMessages to opener window.

---

### POST /api/v1/youtube/auth/refresh
### GET /api/v1/youtube/auth/status
### DELETE /api/v1/youtube/auth/disconnect
### GET /api/v1/youtube/videos/{video_id}/validate

<!-- Populate each with request/response shapes -->

---

## Document Endpoints (`/api/v1/documents`)

<!-- Populate: upload, list, delete -->

---

## WebSocket

WebSocket connection and all events are documented in:
[api/websocket-events.md](websocket-events.md)
