# Configuration

> Purpose: Every Pydantic Settings key in core/config.py with type, default, env file, and usage notes.

<!-- Populate from: backend/app/core/config.py -->
<!-- For the master env-var table across ALL services, see: infra/configuration-reference.md -->

## Settings Class

`backend/app/core/config.py` — `class Settings(BaseSettings)`

Loaded from: `.env.development` (dev) or environment variables (prod).

## Keys Reference

| Key | Type | Default | Env File | Notes |
|-----|------|---------|----------|-------|
| `database_url` | str | — | required | PostgreSQL connection string |
| `secret_key` | str | — | required | JWT signing key; generate with `openssl rand -hex 32` |
| `algorithm` | str | `HS256` | optional | JWT algorithm |
| `access_token_expire_minutes` | int | `30` | optional | |
| `refresh_token_expire_days` | int | `7` | optional | |
| `redis_url` | str | `redis://localhost:6379` | optional | |
| `gemini_api_key` | str | — | required | Google Gemini API key |
| `youtube_client_id` | str | — | required for YT | YouTube OAuth client ID |
| `youtube_client_secret` | str | — | required for YT | YouTube OAuth client secret |
| `youtube_redirect_uri` | str | — | required for YT | Must match Google Console |
| `frontend_dir` | str | `""` | optional | Path to frontend/dist/ for StaticFiles |
| `cors_origins` | list[str] | `[http://localhost:5173, http://localhost:8080]` | optional | |
| `log_level` | str | `INFO` | optional | |
| `log_json` | bool | `False` | optional | Structured JSON logging |
| <!-- add remaining keys --> | | | | |

## Generating SECRET_KEY

```bash
openssl rand -hex 32
```

## Environment Files

- Development: `backend/.env.development`
- Production: Set as environment variables (do not commit secrets)
- See [security/secrets-management.md](../security/secrets-management.md)

## All Environment Variables (Cross-Service)

The master table of ALL env vars across backend, workers, and infra lives in:
[infra/configuration-reference.md](../infra/configuration-reference.md)
