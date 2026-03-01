# ADR-005: React 19 + Vite 7 (not Static HTML)

> Status: Accepted
> Date: Phase 4
> Deciders: Phase 4 implementation

## Context

Phase 3 shipped a static HTML/CSS/JS frontend served by FastAPI StaticFiles. As the
dashboard grew in complexity (real-time WebSocket updates, component state, auth flows),
maintaining vanilla JS became unwieldy. Phase 4 migrated to a proper framework.

## Decision

Migrate to React 19 + Vite 7, served from `frontend/dist/` via FastAPI StaticFiles
when `FRONTEND_DIR` is set. Dev server runs on `:5173` with a proxy to `:8000`.

## Alternatives Considered

| Alternative | Reason Rejected |
|-------------|----------------|
| Continue static HTML/JS | State management complexity growing; no component reuse; difficult to maintain |
| Vue 3 | React ecosystem familiarity; no strong reason to prefer Vue |
| Next.js / SSR | Overkill for a teacher dashboard; server-side rendering adds backend coupling |
| Svelte | Smaller ecosystem; team familiarity consideration |

## Consequences

**Positive:**
- Component-based architecture enables reuse (SessionList, QuestionsFeed, ClustersPanel, etc.)
- React context + hooks manage auth and WebSocket state cleanly
- Vite HMR makes development fast
- Clear separation: API client in `services/api.js`, WebSocket in `hooks/useWebSocket.js`

**Negative / Trade-offs:**
- Build step required before deployment (npm run build → frontend/dist/)
- `FRONTEND_DIR` must be set correctly in production for StaticFiles to mount
- CORS must include `http://localhost:5173` in development

## References

- `frontend/` — React app root
- [frontend/overview.md](../../frontend/overview.md) — routing, AuthProvider, Vite proxy
- `backend/app/main.py` — StaticFiles mount using `FRONTEND_DIR`
