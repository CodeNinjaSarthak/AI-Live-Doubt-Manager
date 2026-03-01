# Alerting

> Purpose: prometheus/rules.yml explained, alert thresholds table, and incident checklist.

<!-- Populate from: infra/prometheus/rules.yml, docs/_archive/failure_modes.md -->

## Rules File

`infra/prometheus/rules.yml` — loaded by Prometheus via `rule_files` in `prometheus.yml`.

## Alert Rules

| Alert Name | Condition | Severity | For | Action |
|-----------|-----------|----------|-----|--------|
| `HighErrorRate` | `rate(http_requests_total{status_code=~"5.."}[5m]) > 0.05` | critical | 5m | See [state/runbooks/worker-crash.md](../state/runbooks/worker-crash.md) |
| `HighLatency` | `histogram_quantile(0.95, ...) > 2` | warning | 10m | Investigate slow endpoints |
| `QueueDepthHigh` | <!-- metric > threshold --> | warning | 5m | Scale workers or pause ingestion |
| `DLQNonEmpty` | <!-- DLQ metric > 0 --> | warning | 1m | See [state/runbooks/worker-crash.md](../state/runbooks/worker-crash.md) |
| `DatabaseDown` | <!-- health probe fails --> | critical | 1m | See [state/runbooks/db-connection-loss.md](../state/runbooks/db-connection-loss.md) |
| `YouTubeQuotaHigh` | <!-- quota > 9000 units --> | warning | 5m | See [state/runbooks/youtube-quota-exceeded.md](../state/runbooks/youtube-quota-exceeded.md) |
| <!-- more --> | | | | |

## Thresholds Table

| Resource | Warning | Critical |
|----------|---------|---------|
| HTTP 5xx rate | > 1% | > 5% |
| P95 latency | > 1s | > 2s |
| Queue depth | > 1000 | > 5000 |
| DLQ size | > 0 | > 10 |
| YouTube quota used | > 8000 units | > 9500 units |

## Metric Definitions

Metric names referenced here are defined in: [observability/metrics.md](metrics.md)
Do not re-define metrics in this file.

## Incident Checklist

For any production alert:

1. **Acknowledge** the alert in your alerting tool
2. **Identify** the affected component (backend, worker, DB, YouTube API)
3. **Check logs:** `LOG_JSON` structured logs with the relevant `request_id` or `task_id`
4. **Check dashboards:** System Overview or Queue Health Grafana dashboard
5. **Follow runbook:** Navigate to the relevant `state/runbooks/*.md`
6. **Resolve or escalate:** Document the resolution in `state/known-issues.md` if a recurring issue

See [state/runbooks/README.md](../state/runbooks/README.md) for the full incident response template.
