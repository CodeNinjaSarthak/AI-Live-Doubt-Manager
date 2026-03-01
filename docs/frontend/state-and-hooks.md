# State and Hooks

> Purpose: Hook contracts — useWebSocket (backoff + 100-msg cap), useAuth context values, and other hooks.

<!-- Populate from: frontend/src/hooks/, frontend/src/context/ -->

## useAuth

`frontend/src/hooks/useAuth.js` — consumes `AuthContext`

### Contract

```js
const {
  user,           // { id, email, name } | null
  token,          // string | null — JWT access token
  isLoading,      // bool — true during initial auth check
  login,          // async (email, password) → void (throws on error)
  logout,         // async () → void
  refreshToken,   // async () → string — new access token
} = useAuth()
```

### Usage

Must be used inside `<AuthProvider>`. Throws if called outside context.

---

## useWebSocket

`frontend/src/hooks/useWebSocket.js`

### Contract

```js
const {
  messages,       // array — last 100 events (capped)
  isConnected,    // bool
  lastEvent,      // most recent event object | null
} = useWebSocket(sessionId, token)
```

### Behavior

- **Reconnection:** Exponential backoff on disconnect
  - Initial delay: <!-- populate -->
  - Max delay: <!-- populate -->
  - Gives up after: <!-- populate attempts, or indefinite? -->
- **Message cap:** Caps at 100 messages (oldest dropped on overflow)
  - Prevents memory growth during long sessions
- **Auth:** Passes `?token={token}` in WebSocket URL
- **Cleanup:** Closes connection on component unmount or sessionId change

### Event Handling

Each incoming message is JSON-parsed and pushed to `messages`. Components subscribe
to `lastEvent` or filter `messages` by `type`.

---

## useToast

`frontend/src/hooks/useToast.js` (verify path)

<!-- Populate: toast API contract -->

---

## useKeyboardShortcuts

`frontend/src/hooks/useKeyboardShortcuts.js` (verify path)

<!-- Populate: keyboard shortcut bindings -->

---

## AuthContext

`frontend/src/context/AuthContext.jsx`

Manages token storage and auto-refresh. Token is stored in:
<!-- localStorage key? sessionStorage? -->

Auto-refresh: <!-- on 401 response? on timer? -->
