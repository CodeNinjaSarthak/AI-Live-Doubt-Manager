# Runbook: Worker Crash

**Severity:** P2 High
**Last updated:** 2026-03-01

## Symptom

- Comments stop being processed (no new questions appearing in dashboard)
- Queue depth grows (see [queue-overflow.md](queue-overflow.md))
- DLQ accumulates items
- Worker process no longer running (heartbeat gap in monitoring)

## Detect

1. **Check running worker processes:**
   ```bash
   ps aux | grep runner.py
   ```

2. **Check DLQ size:**
   ```bash
   redis-cli ZCARD classification:dlq
   redis-cli ZCARD embedding:dlq
   redis-cli ZCARD clustering:dlq
   redis-cli ZCARD answer_generation:dlq
   redis-cli ZCARD youtube_posting:dlq
   ```

3. **Check worker logs** for the last exception before crash

4. **Check Grafana Queue Health dashboard** for processing rate drop to zero

## Respond

1. **Restart the crashed worker:**
   ```bash
   cd workers
   python runner.py {worker_name}  # e.g., classification
   ```

2. **Review DLQ items** to understand what caused failures:
   ```bash
   # Inspect DLQ items (do NOT delete without understanding them)
   redis-cli ZRANGE classification:dlq 0 5 WITHSCORES
   ```

3. **Replay DLQ items** after fixing the root cause:
   ```bash
   # Move DLQ items back to the main queue (manual operation)
   # redis-cli ZUNIONSTORE classification 2 classification classification:dlq
   # Then clear DLQ: redis-cli DEL classification:dlq
   ```
   > **Warning:** Only replay after the root cause is fixed, or items will crash again.

4. **Monitor** that the worker processes items successfully after restart:
   ```bash
   watch -n 5 'redis-cli ZCARD classification'
   ```

## Root Cause

Common causes:
- Uncaught exception in worker code (Python error)
- Gemini API returning unexpected response format
- DB connection lost during processing (see [db-connection-loss.md](db-connection-loss.md))
- Out of memory (worker consuming too much RAM)
- Malformed payload in queue (corrupted data)

## Escalate

If worker crashes repeatedly after restart:
- Collect the full traceback from worker logs
- Check if the DLQ item causing the crash can be identified and removed
- Escalate with: worker name, last 50 lines of logs, DLQ sample item
