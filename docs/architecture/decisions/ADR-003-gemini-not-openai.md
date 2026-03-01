# ADR-003: Gemini Replaced OpenAI

> Status: Accepted
> Date: Phase 2
> Deciders: Phase 2 implementation

## Context

<!-- Phase 1 used OpenAI. Phase 2 switched to Gemini. What drove the change? -->

Phase 1 was built with OpenAI APIs for classification and embedding. During Phase 2,
the project migrated entirely to Google Gemini.

## Decision

Replace all OpenAI API calls with Google Gemini (classification, embedding, answer generation).

## Alternatives Considered

| Alternative | Reason Rejected |
|-------------|----------------|
| Keep OpenAI | [Populate: cost, quota, or capability reasons] |
| Use both (hybrid) | Operational complexity of managing two AI providers |
| Open-source models (Ollama, HuggingFace) | [Populate: latency, hosting, quality trade-offs] |

## Consequences

**Positive:**
- [Populate: cost, quota, capability, or integration benefits]

**Negative / Trade-offs:**
- Vendor lock-in shifted from OpenAI to Google
- Embedding dimensions changed to 1536 (verify against `backend/app/db/models/`)
- Any code or tests that assumed OpenAI response shapes needed updating

## References

- `backend/app/services/gemini/` — GeminiClient implementation
- [backend/services.md](../../backend/services.md) — service layer overview
