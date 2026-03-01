# Runbook: Queue Overflow

**Severity:** P2 High
**Last updated:** 2026-03-01

## Symptom

- Queue depth metric exceeds threshold (> 1000 items in any queue)
- Processing latency increases — comments take minutes instead of seconds to appear in dashboard
- `QueueDepthHigh` Prometheus alert fires
- Teacher dashboard shows stale data

## Detect

```bash
# Check queue depths
redis-cli ZCARD classification
redis-cli ZCARD embedding
redis-cli ZCARD clustering
redis-cli ZCARD answer_generation
redis-cli ZCARD youtube_posting
```

Check [Grafana Queue Health dashboard](../../../observability/dashboards.md).

Alert: `QueueDepthHigh` — see [observability/alerting.md](../../observability/alerting.md).

## Respond

1. **Identify the bottleneck queue** (which queue has the largest backlog?)

2. **Scale workers** for the bottleneck queue:
   ```bash
   # Start additional worker instances for the bottleneck
   python runner.py classification  # run additional instances
   ```

3. **Pause ingestion if necessary** (to prevent further growth while draining):
   - Stop the `youtube_polling` worker temporarily
   - OR reduce polling frequency

4. **Monitor drain rate:**
   ```bash
   watch -n 5 'redis-cli ZCARD classification'
   ```

5. **Inspect DLQ** for failed items that may be re-entering the queue:
   ```bash
   redis-cli ZRANGE classification:dlq 0 -1
   ```
   See [worker-crash.md](worker-crash.md) if DLQ is growing.

## Root Cause

Common causes:
- Worker process crashed (check worker logs)
- Gemini API rate limiting (check classification/embedding worker logs)
- Spike in YouTube comments (sudden viral activity)
- DB slow queries causing workers to back up

## Escalate

If queue does not drain within 30 minutes of scaling:
- Check Gemini API quota and status
- Check DB connection pool (`/health` endpoint returns 503 on DB issues)
- Escalate with: queue depth numbers, worker logs, DB health status
