# Grafana Dashboards

> Purpose: 4 Grafana dashboards — panels, data sources, and import procedure.

<!-- Populate from: infra/grafana/ (verify path), docs/_archive/failure_modes.md (Grafana section) -->

## Access

- Development: `http://localhost:3000`
- Default credentials: `admin` / `admin` (change on first login)

## Data Sources

| Name | Type | URL |
|------|------|-----|
| Prometheus | Prometheus | `http://prometheus:9090` |
| PostgreSQL | PostgreSQL | `postgresql://...` |

## Dashboard 1: System Overview
**File:** `infra/grafana/dashboards/system-overview.json` (verify path)

| Panel | Metric | Description |
|-------|--------|-------------|
| Request Rate | `rate(http_requests_total[5m])` | Requests per second |
| Error Rate | `rate(http_requests_total{status_code=~"5.."}[5m])` | 5xx errors per second |
| P95 Latency | `histogram_quantile(0.95, ...)` | 95th percentile response time |
| <!-- more --> | | |

## Dashboard 2: Queue Health
**File:** <!-- path -->

| Panel | Description |
|-------|-------------|
| Queue depths per worker | Items in each queue |
| DLQ sizes | Failed items per queue |
| Worker processing rate | Tasks/minute per worker |

## Dashboard 3: YouTube Quota
**File:** <!-- path -->

| Panel | Description |
|-------|-------------|
| Quota used today | Units consumed vs 10,000 daily limit |
| Quota by operation | Breakdown: poll vs post vs get_chat_id |
| Quota burn rate | Units/hour projection |

## Dashboard 4: Session Activity
**File:** <!-- path -->

| Panel | Description |
|-------|-------------|
| Active sessions | Count of sessions with is_active=True |
| Comments/minute | Real-time ingestion rate |
| Questions classified | is_question=True rate |
| Answers posted | Posted vs pending answers |

## Import Procedure

1. Open Grafana → Dashboards → Import
2. Upload JSON file from `infra/grafana/dashboards/`
3. Select `Prometheus` as the data source when prompted
4. Click Import

## Alert Rules

Alerting rules linked to these dashboards: [observability/alerting.md](alerting.md)
