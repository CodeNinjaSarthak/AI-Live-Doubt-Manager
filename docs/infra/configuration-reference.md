# Configuration Reference

> Purpose: Master table of ALL environment variables across all services — backend, workers, and infra.

<!-- Populate from: backend/app/core/config.py, workers/common/config.py (verify), docker-compose.yml -->
<!-- This is the SINGLE source of truth for env var defaults. -->

## All Environment Variables

| Variable | Type | Default | Required | Services | Notes |
|----------|------|---------|----------|----------|-------|
| `DATABASE_URL` | str | — | Yes | backend, workers | PostgreSQL connection string |
| `SECRET_KEY` | str | — | Yes | backend | JWT signing; `openssl rand -hex 32` |
| `ALGORITHM` | str | `HS256` | No | backend | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | int | `30` | No | backend | |
| `REFRESH_TOKEN_EXPIRE_DAYS` | int | `7` | No | backend | |
| `REDIS_URL` | str | `redis://localhost:6379` | No | backend, workers | |
| `GEMINI_API_KEY` | str | — | Yes | backend, workers | Google Gemini API key |
| `YOUTUBE_CLIENT_ID` | str | — | Yes (for YouTube) | backend | |
| `YOUTUBE_CLIENT_SECRET` | str | — | Yes (for YouTube) | backend | |
| `YOUTUBE_REDIRECT_URI` | str | — | Yes (for YouTube) | backend | Must match Google Console; HTTPS in prod |
| `FRONTEND_DIR` | str | `""` | No | backend | Path to frontend/dist/ |
| `CORS_ORIGINS` | str (comma-separated) | `http://localhost:5173,http://localhost:8080` | No | backend | |
| `LOG_LEVEL` | str | `INFO` | No | backend, workers | |
| `LOG_JSON` | bool | `False` | No | backend | Structured JSON logging |
| `ENCRYPTION_KEY` | str | — | Yes | backend | For `encrypt_data`/`decrypt_data` |
| `YOUTUBE_POLLING_INTERVAL` | int | <!-- N --> | No | workers | Seconds between polls |
| <!-- add remaining --> | | | | | |

## Notes

- Variables marked "Yes (for YouTube)" are only required if YouTube integration is enabled
- `ENCRYPTION_KEY` is used to encrypt/decrypt YouTube OAuth tokens stored in DB
  See [security/secrets-management.md](../security/secrets-management.md)
- `CORS_ORIGINS` accepts a comma-separated list in production env vars; may be a Python
  list in `.env` files depending on the Pydantic Settings parser

## Per-Service Environment Files

| Service | File (dev) | Notes |
|---------|-----------|-------|
| Backend | `backend/.env.development` | Gitignored |
| Workers | Same or separate (verify) | |

## Secret Variables

Never commit to git:
- `DATABASE_URL` (contains password)
- `SECRET_KEY`
- `GEMINI_API_KEY`
- `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`
- `ENCRYPTION_KEY`

See [security/secrets-management.md](../security/secrets-management.md).
