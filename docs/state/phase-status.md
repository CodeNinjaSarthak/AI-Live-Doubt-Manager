# Phase Status

> **LIVING DOCUMENT** — Update this file as phases complete or priorities change.
> Last updated: 2026-03-01

## Phase Summary

| Phase | Name | Status |
|-------|------|--------|
| 1 | Foundation | ✅ Complete |
| 2 | AI Integration (Gemini) | ✅ Complete |
| 2.5 | Tech Debt Fixes | ✅ Complete |
| 3 | YouTube Integration + Teacher Dashboard | ✅ Complete |
| 4 | React + Vite Frontend Migration | ✅ Complete |
| 5 | TBD | 🔲 Not started |

## Phase 1 — Foundation
**Delivered:**
- FastAPI backend skeleton
- PostgreSQL + pgvector schema
- JWT authentication
- Basic session and comment models
- Redis queue infrastructure

## Phase 2 — AI Integration (Gemini)
**Delivered:**
- Replaced OpenAI with Google Gemini
- Classification worker (is_question + confidence_score)
- Embeddings worker (1536-dim pgvector)
- Clustering worker (cosine similarity at 0.8)
- Answer generation worker (RAG + LLM)
- Human approval flow (is_posted=False by default)

## Phase 2.5 — Tech Debt Fixes
**Delivered:**
- <!-- Populate with what was fixed -->

## Phase 3 — YouTube Integration + Teacher Dashboard
**Delivered:**
- YouTubeClient wrapping google-api-python-client
- YouTube OAuth (popup + postMessage pattern)
- YouTube quota tracking (Redis-backed, 5/50/1 unit costs)
- youtube_polling worker (ThreadPoolExecutor)
- youtube_posting worker (queue-based)
- Dashboard API (manual-question, approve, edit, stats)
- Redis pub/sub relay (`_relay_redis_events()`)
- WebSocket auth (optional `?token=`, codes 4001/4003)

## Phase 4 — React + Vite Frontend Migration
**Delivered:**
- React 19 + Vite 7 replacing static HTML/JS
- BrowserRouter + AuthProvider
- Pages: LandingPage, LoginPage, RegisterPage, DashboardPage, SettingsPage
- Dashboard components: SessionList, YouTubePanel, ManualInput, MetricsCards, QuestionsFeed, ClustersPanel, ActivityLog, AnalyticsPanel
- useWebSocket hook (exponential backoff, 100-msg cap)
- Vite proxy: `/api` → `:8000`, `/ws` → ws://`:8000`

## Current Stubs / Incomplete Items

<!-- Items started but not finished -->
- ActivityLog component — purpose unclear, needs population
- AnalyticsPanel component — purpose unclear, needs population

## Next Priorities

<!-- What should be worked on next? -->
1. <!-- Priority 1 -->
2. <!-- Priority 2 -->

## Known Issues

See [state/known-issues.md](known-issues.md) for active bugs and tech debt.
