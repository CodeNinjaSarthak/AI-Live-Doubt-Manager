# Clustering Worker

> Purpose: ClusteringPayload → cosine similarity at threshold 0.8 → Cluster CRUD → enqueue to answer_generation.

<!-- Populate from: workers/clustering/worker.py, workers/common/schemas.py -->

## Input Payload

`ClusteringPayload` (from `workers/common/schemas.py`):

```json
{
  "comment_id": "uuid",
  "session_id": "uuid"
}
```

## Processing

1. Load `Comment.embedding` from DB
2. Query existing `Cluster` centroids for this session (pgvector cosine similarity)
3. If similarity ≥ 0.8: assign comment to that cluster, update centroid
4. If no cluster found: create a new `Cluster` with this comment as seed
5. Enqueue `AnswerGenerationPayload` to `QUEUE_ANSWER_GENERATION`

## Similarity Threshold

Default: `0.8` (cosine similarity). Higher = stricter grouping.

<!-- Is this configurable via settings? Document config key if so. -->

## Centroid Update

<!-- How is the cluster centroid recalculated when a new comment is added? Mean of all embeddings? -->

## DB Operations

| Operation | Condition |
|-----------|-----------|
| `UPDATE Cluster.centroid` | Comment assigned to existing cluster |
| `INSERT Cluster` | No matching cluster found |
| `INSERT ClusterComment` (or FK update) | Always — links comment to cluster |

For field definitions see [data/schema.md](../data/schema.md).

## Output

Enqueues to `QUEUE_ANSWER_GENERATION`. See [workers/answer-generation.md](answer-generation.md).
