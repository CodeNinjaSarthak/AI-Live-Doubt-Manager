# Runbooks

> Template, naming conventions, and severity levels for operational runbooks.

## What Is a Runbook

A runbook is a step-by-step procedure for responding to a specific operational failure.
It is written before an incident, not during one.

## Naming Convention

`{component}-{failure-mode}.md`

Examples:
- `worker-crash.md`
- `db-connection-loss.md`
- `youtube-quota-exceeded.md`
- `queue-overflow.md`

## Severity Levels

| Level | Definition | Response Time |
|-------|-----------|--------------|
| **P1 Critical** | System down or data loss risk | Immediate |
| **P2 High** | Major feature broken; significant user impact | < 1 hour |
| **P3 Medium** | Degraded performance; workaround available | < 4 hours |
| **P4 Low** | Minor issue; cosmetic or edge case | Next sprint |

## Runbook Template

```markdown
# Runbook: {Failure Mode}

**Severity:** P1 / P2 / P3 / P4
**Last updated:** YYYY-MM-DD

## Symptom

What does the failure look like to the user / operator?

## Detect

How do you confirm this is happening?
- Alert name: `...`
- Metrics to check: `...`
- Log signature: `...`

## Respond

Step-by-step actions to restore service:

1. ...
2. ...
3. ...

## Root Cause

What typically causes this? What to investigate after service is restored.

## Escalate

If the above steps don't resolve it in [N minutes], escalate to:
- [person/team]
- Include: symptom, steps taken, relevant log excerpts
```

## Available Runbooks

| Runbook | Severity | Description |
|---------|---------|-------------|
| [queue-overflow.md](queue-overflow.md) | P2 | Queue depth exceeds threshold |
| [worker-crash.md](worker-crash.md) | P2 | Worker process dies or stops processing |
| [db-connection-loss.md](db-connection-loss.md) | P1 | Backend cannot reach PostgreSQL |
| [youtube-quota-exceeded.md](youtube-quota-exceeded.md) | P3 | YouTube API 403 quota exhausted |
