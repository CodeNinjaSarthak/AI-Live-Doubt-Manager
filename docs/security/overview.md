# Security Overview

> Purpose: Summary of all security controls — JWT, CORS, ORM parameterization, rate limiting, quota enforcement.

<!-- Populate from: backend/app/core/security.py, backend/app/main.py, docs/_archive/architecture.md (security section) -->

## Security Controls

| Control | Implementation | Details |
|---------|---------------|---------|
| **Authentication** | JWT (HTTPBearer) | Access: 30min, Refresh: 7d. See [backend/auth.md](../backend/auth.md) |
| **Password Hashing** | bcrypt, cost 12 | Never store plaintext passwords |
| **Token Blacklist** | Redis `blacklist:{jti}` | Invalidated tokens rejected on next use |
| **CORS** | FastAPI CORSMiddleware | Allowlist in `CORS_ORIGINS`. See [infra/configuration-reference.md](../infra/configuration-reference.md) |
| **SQL Injection** | SQLAlchemy ORM | All DB access via ORM; no raw string SQL interpolation |
| **Rate Limiting** | Redis-backed | Per-IP/per-user limits. See [api/error-codes.md](../api/error-codes.md) for 429 headers |
| **YouTube Token Encryption** | `encrypt_data`/`decrypt_data` | OAuth tokens encrypted at rest in DB. See [security/secrets-management.md](secrets-management.md) |
| **Session Ownership** | JOIN + teacher_id check | All session endpoints verify `teacher_id == current_user.id` |
| **YouTube OAuth CSRF** | Redis state tokens | 10min TTL CSRF protection. See [security/youtube-oauth.md](youtube-oauth.md) |
| **HTTPS** | Required in production | YouTube OAuth redirect URI must be HTTPS |

## Threat Model

<!-- Brief: who are the users, what data is sensitive, what are the trust boundaries -->

| Threat | Mitigation |
|--------|-----------|
| Unauthorized session access | JWT auth + session ownership check on every endpoint |
| Cross-site request forgery (YouTube OAuth) | CSRF state token in Redis |
| Token replay after logout | Token blacklist in Redis |
| Credential exposure | bcrypt hashing; secrets never logged |
| SQL injection | SQLAlchemy ORM (no raw SQL) |
| Excessive API usage | Rate limiting + YouTube quota enforcement |
| Secret exposure | `.gitignore` rules; encrypted token storage |

## Not In Scope (Current)

- End-to-end encryption of comment content
- Audit logging of teacher actions
- Multi-tenancy isolation (currently single-tenant per deployment)
