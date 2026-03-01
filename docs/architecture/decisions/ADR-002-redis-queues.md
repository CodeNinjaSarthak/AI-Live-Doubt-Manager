# ADR-002: Custom Redis Sorted Sets (not Celery/SQS)

> Status: Accepted
> Date: 2024-Q4
> Deciders: Initial architecture team

## Context

<!-- Why was a task queue needed? What was the processing model? -->

Workers need to process comments through a pipeline (classify → embed → cluster → answer).
The question was which queuing mechanism to use.

## Decision

Build a custom `QueueManager` backed by Redis sorted sets (score = timestamp for ordering,
with priority support). Workers pull tasks, execute, and retry with exponential backoff.

## Alternatives Considered

| Alternative | Reason Rejected |
|-------------|----------------|
| Celery | Heavyweight; requires broker configuration, worker registration, beat scheduler; adds significant operational complexity |
| AWS SQS | External managed service; adds cloud dependency and cost; not suitable for local dev without LocalStack |
| RQ (Redis Queue) | Simpler than Celery but still opinionated about task registration; custom solution gives more control |
| BullMQ (Node) | Wrong ecosystem — backend is Python |

## Consequences

**Positive:**
- Full control over priority, retry logic, and DLQ behavior
- Redis was already required for other purposes (pub/sub, quota tracking, OAuth state)
- No additional operational dependency
- Simple to reason about: sorted sets give ordered, durable queues

**Negative / Trade-offs:**
- Custom code to maintain (no community support for edge cases)
- No built-in monitoring UI (Celery Flower equivalent would need to be built)
- Retry logic and DLQ must be implemented and tested manually

## References

- `workers/common/queue.py` — QueueManager implementation
- [workers/overview.md](../../workers/overview.md) — mechanics and retry behavior
