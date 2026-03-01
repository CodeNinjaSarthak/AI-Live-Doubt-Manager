# Trigger Monitor Worker

> Purpose: Count/interval thresholds for active sessions → dispatch ClusteringPayload.

<!-- Populate from: workers/trigger_monitor/worker.py (verify path) -->

## Role

The trigger monitor watches active sessions and dispatches clustering jobs when
enough new questions have accumulated, or when a time interval has elapsed.
This prevents over-clustering (every new question triggering a re-cluster) while
ensuring timely processing.

## Thresholds

| Threshold | Default | Config Key |
|-----------|---------|-----------|
| Count threshold | <!-- N --> comments | <!-- key --> |
| Interval threshold | <!-- M --> seconds | <!-- key --> |

<!-- Populate with actual values from worker config -->

## Algorithm

```
For each active session:
  pending_count = count of questions with embedding but no cluster assignment
  time_since_last_cluster = now - session.last_clustered_at

  if pending_count >= COUNT_THRESHOLD or time_since_last_cluster >= INTERVAL_THRESHOLD:
    for each pending comment:
      enqueue ClusteringPayload → QUEUE_CLUSTERING
    session.last_clustered_at = now
```

## Session Tracking

<!-- How does the monitor know which sessions are active? Redis set? DB query? -->

## Relationship to Clustering Worker

The trigger monitor dispatches to `QUEUE_CLUSTERING`.
The clustering worker processes individual comments.
See [workers/clustering.md](clustering.md).
