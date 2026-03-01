# Local Development Setup

> Purpose: Docker Compose services, ports, volumes, startup order, and all `make` commands.

<!-- Populate from: docker-compose.yml, Makefile, docs/_archive/getting_started.md -->

## Prerequisites

- Docker + Docker Compose
- Python 3.11+
- Node.js 20+
- Redis (or via Docker)
- PostgreSQL (or via Docker)

## Docker Compose Services

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  # Add other services as defined in docker-compose.yml
```

### Startup Order

```bash
# Start infrastructure only
docker-compose up -d postgres redis

# Run migrations
cd backend
DATABASE_URL=postgresql://user:password@localhost:5432/ai_doubt_manager_dev alembic upgrade head

# Start backend
cd backend
uvicorn app.main:app --reload --port 8000

# Start workers (each in a separate terminal)
cd workers && python runner.py classification
cd workers && python runner.py embeddings
cd workers && python runner.py clustering
cd workers && python runner.py answer_generation
cd workers && python runner.py youtube_polling
cd workers && python runner.py youtube_posting
cd workers && python runner.py trigger_monitor

# Start frontend
cd frontend
npm run dev   # → http://localhost:5173
```

## Ports

| Service | Port | URL |
|---------|------|-----|
| FastAPI backend | 8000 | http://localhost:8000 |
| React dev server | 5173 | http://localhost:5173 |
| PostgreSQL | 5432 | postgresql://localhost:5432 |
| Redis | 6379 | redis://localhost:6379 |
| Prometheus | 9090 | http://localhost:9090 |
| Grafana | 3000 | http://localhost:3000 |

## Makefile Commands

<!-- Populate from Makefile -->

```bash
make up          # Start all Docker services
make down        # Stop all Docker services
make migrate     # Run Alembic migrations
make test        # Run test suite
make lint        # Run linters
# Add more as defined
```

## Environment Files

- Backend: `backend/.env.development` (copy from `backend/.env.example`)
- For all env vars, see [infra/configuration-reference.md](configuration-reference.md)

## YouTube OAuth (Local)

YouTube OAuth requires HTTPS in production, but localhost is allowed during development.
See [security/youtube-oauth.md](../security/youtube-oauth.md) for full OAuth setup.
See [docs/_archive/YOUTUBE_SETUP.md](../_archive/YOUTUBE_SETUP.md) for the original Google Console setup guide.
