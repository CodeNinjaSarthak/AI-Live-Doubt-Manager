# Architecture Decision Records (ADRs)

> Purpose: Index of all architectural decisions and instructions for adding a new record.

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](ADR-001-pgvector.md) | PostgreSQL + pgvector (not Pinecone/Qdrant) | Accepted | 2024-Q4 |
| [ADR-002](ADR-002-redis-queues.md) | Custom Redis sorted sets (not Celery/SQS) | Accepted | 2024-Q4 |
| [ADR-003](ADR-003-gemini-not-openai.md) | Gemini replaced OpenAI | Accepted | Phase 2 |
| [ADR-004](ADR-004-rag-design.md) | Human approval before post (not autonomous) | Accepted | Phase 2 |
| [ADR-005](ADR-005-react-vite-frontend.md) | React 19 + Vite 7 (not static HTML) | Accepted | Phase 4 |

## How to Add a New ADR

1. Copy the template below into a new file: `ADR-00N-short-title.md`
2. Increment N from the last entry in the index above
3. Fill in all sections — do not leave placeholders in merged ADRs
4. Update the index table in this README
5. ADRs are **immutable once merged** — if a decision is superseded, create a new ADR
   referencing the old one; update the old one's Status to "Superseded by ADR-00N"

## ADR Template

```markdown
# ADR-00N: [Decision Title]

> Status: [Proposed | Accepted | Superseded by ADR-00N]
> Date: [YYYY-MM-DD]
> Deciders: [names or roles]

## Context

[What is the situation? What forces are at play?]

## Decision

[What was decided?]

## Alternatives Considered

| Alternative | Reason Rejected |
|-------------|----------------|
| Option A | ... |
| Option B | ... |

## Consequences

**Positive:**
- ...

**Negative / Trade-offs:**
- ...

## References

- [Link to relevant code or external resource]
```
