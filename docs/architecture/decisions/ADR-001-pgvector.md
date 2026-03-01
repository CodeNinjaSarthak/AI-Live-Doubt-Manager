# ADR-001: PostgreSQL + pgvector (not Pinecone/Qdrant)

> Status: Accepted
> Date: 2024-Q4
> Deciders: Initial architecture team

## Context

<!-- Why was a vector store needed? What were the operational constraints? -->

The system needs to store and query 1536-dimensional embeddings for comment clustering
(cosine similarity search) and RAG document retrieval. The question was whether to use
a dedicated vector database or extend the existing PostgreSQL instance.

## Decision

Use PostgreSQL with the `pgvector` extension for vector storage and similarity search.

## Alternatives Considered

| Alternative | Reason Rejected |
|-------------|----------------|
| Pinecone | External managed service; adds latency, cost, and a new operational dependency |
| Qdrant | Another separate service to deploy, monitor, and keep in sync with PostgreSQL state |
| Weaviate | Same concern as Qdrant; overkill for expected data volumes |

## Consequences

**Positive:**
- Single database to operate, back up, and monitor
- Transactional consistency between relational data and vector data
- No cross-service synchronization bugs
- Sufficient performance at expected data volumes

**Negative / Trade-offs:**
- Vector search performance degrades at very large scale (100M+ vectors) compared to
  dedicated ANN indexes in Pinecone/Qdrant
- pgvector's approximate nearest neighbor (HNSW/IVFFlat) requires manual index tuning
- Migrating away later would require data migration of all vector columns

## References

- `backend/app/db/models/` — models with `Vector(1536)` columns
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [data/schema.md](../../data/schema.md) — field definitions
