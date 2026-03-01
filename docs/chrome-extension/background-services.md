# Chrome Extension Background Services

> Purpose: Each of the 5 background modules — auth.ts, youtubePoller.ts, websocket.ts, quota.ts, index.ts.

<!-- Populate from: chrome-extension/background/ (verify path) -->

## auth.ts

**Purpose:** Manage OAuth tokens for the backend API.

- Token storage: `chrome.storage.local`
- Auto-refresh: on 401 response
- Methods: `getToken()`, `refreshToken()`, `clearToken()`

## youtubePoller.ts

**Purpose:** Poll YouTube Live Chat API from the extension background.

<!-- Note: This may duplicate what the backend youtube_polling worker does, or may serve a different purpose -->
<!-- Clarify the relationship between this module and the backend worker -->

- Polling interval: <!-- N seconds -->
- Quota tracking: delegates to `quota.ts`
- On new comments: sends to backend via WebSocket or REST

## websocket.ts

**Purpose:** Maintain a WebSocket connection to the backend for real-time events.

- Reconnection: exponential backoff
- Auth: `?token=` parameter from `auth.ts`
- Events handled: <!-- list event types the extension acts on -->

## quota.ts

**Purpose:** Client-side YouTube API quota tracking (mirrors backend quota state).

- Storage: `chrome.storage.local`
- Prevents calls when quota is known to be exhausted
- Syncs with backend quota status on connect

See [data/quota-model.md](../data/quota-model.md) for quota cost definitions.

## index.ts

**Purpose:** Service Worker entry point. Wires all modules together.

- Registers Chrome Alarms for keep-alive
- Initializes all background services on install/startup
- Routes `chrome.runtime.onMessage` to appropriate handlers
