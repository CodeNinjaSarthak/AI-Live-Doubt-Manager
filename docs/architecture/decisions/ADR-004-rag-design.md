# ADR-004: Human Approval Before Post (not Autonomous)

> Status: Accepted
> Date: Phase 2
> Deciders: Phase 2 implementation

## Context

When the system generates an answer, it could either post it automatically to YouTube
or require a teacher to approve it first. This ADR records the choice.

## Decision

Answers are generated and stored with `is_posted=False`. A teacher must explicitly
approve (and optionally edit) the answer via the dashboard before it is posted to
YouTube chat.

## Alternatives Considered

| Alternative | Reason Rejected |
|-------------|----------------|
| Fully autonomous posting | Risk of incorrect or inappropriate answers being posted publicly without human oversight |
| Confidence-threshold gating | More complex; still risks edge cases near the threshold; teacher context matters more than confidence score |

## Consequences

**Positive:**
- Teacher maintains full control over what is posted to their live audience
- Incorrect AI answers caught before they cause confusion
- Teachers can personalize/edit answers before posting
- Builds teacher trust in the system

**Negative / Trade-offs:**
- Adds latency between question and posted answer (human approval step)
- Requires teachers to actively monitor the dashboard during a live session
- Volume may become unmanageable if many questions arrive simultaneously

## References

- `backend/app/api/v1/dashboard.py` — approve and edit endpoints
- [api/rest.md](../../api/rest.md) — approve/edit endpoint specs
- [workers/answer-generation.md](../../workers/answer-generation.md) — Answer record creation
