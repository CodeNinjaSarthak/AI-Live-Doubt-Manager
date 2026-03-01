# Backend Overview

> Purpose: FastAPI entrypoint, router list, middleware stack, and key dependency functions.

<!-- Populate from: backend/app/main.py, backend/app/api/v1/ -->

## Entrypoint

`backend/app/main.py` — FastAPI app with lifespan context manager.

### Lifespan Sequence
1. <!-- startup steps: DB init, Redis connect, background tasks start -->
2. `_relay_redis_events()` background task subscribes to `ws:session:{id}` channels
3. <!-- shutdown steps -->

## Router List

| Prefix | Module | Description |
|--------|--------|-------------|
| `/api/v1/auth` | `backend/app/api/v1/auth.py` | Register, login, refresh, logout |
| `/api/v1/sessions` | `backend/app/api/v1/sessions.py` | Session CRUD |
| `/api/v1/dashboard` | `backend/app/api/v1/dashboard.py` | Manual question, approve, edit, stats |
| `/api/v1/youtube` | `backend/app/api/v1/youtube.py` | YouTube OAuth + video validation |
| `/api/v1/documents` | `backend/app/api/v1/documents.py` | RAG document upload/list/delete |
| <!-- add more --> | | |

Full endpoint specs: [api/rest.md](../api/rest.md)

## Middleware Stack

<!-- List middleware in order: CORS, rate limiting, request context, etc. -->

## Key Dependencies

| Dependency | Import | Purpose |
|------------|--------|---------|
| `get_db` | `backend/app/db/session.py` | SQLAlchemy session per request |
| `get_current_active_user` | `backend/app/core/security.py` | JWT auth, raises 401/403 |
| <!-- add more --> | | |

## Static Files Mount

When `settings.frontend_dir` is set, FastAPI mounts `frontend/dist/` at `/app` via
`StaticFiles`. The SPA catch-all serves `index.html` for unknown paths.
See [ADR-005](../architecture/decisions/ADR-005-react-vite-frontend.md).
