# Quota Model

> Purpose: Application quota vs YouTube API quota — costs, reset schedule, and enforcement code path.

<!-- Populate from: docs/_archive/quota_model.md (migrate as-is, then extend) -->
<!-- This is the SINGLE source of truth for quota costs. Do NOT duplicate in workers/youtube-posting.md -->

## Two Quota Systems

This system enforces two distinct quota mechanisms:

| System | What it limits | Storage | Enforcement |
|--------|---------------|---------|-------------|
| **Application Quota** | Per-teacher API usage (questions, sessions) | PostgreSQL | DB checks in API handlers |
| **YouTube API Quota** | YouTube Data API v3 calls (units/day) | Redis | `backend/app/services/youtube/quota.py` |

---

## Application Quota

<!-- Populate: per-teacher limits, what counts, reset period, enforcement location -->

| Resource | Limit | Reset |
|----------|-------|-------|
| Active sessions | <!-- N --> | n/a |
| Questions per session | <!-- N --> | n/a |
| Documents uploaded | <!-- N --> | n/a |

---

## YouTube API Quota

YouTube Data API v3 provides **10,000 units per day** per project (default).

### Cost Per Operation

| Operation | Units | Method |
|-----------|-------|--------|
| Poll live chat | 5 | `YouTubeClient.poll_live_chat()` |
| Post message | 50 | `YouTubeClient.post_message()` |
| Get chat ID | 1 | `YouTubeClient.get_live_chat_id()` |

### Enforcement

`backend/app/services/youtube/quota.py`:
- Redis key tracks daily unit consumption
- Before each API call: check remaining units
- If insufficient: raise quota exceeded error (do not call YouTube)
- Reset: daily at midnight Pacific time (YouTube's reset schedule)

Redis key pattern: <!-- document the key -->

### Quota Exceeded Behavior

- Polling: stops until reset; teacher is notified via WebSocket event
- Posting: answer queued but not posted; teacher sees "pending" state
- See [state/runbooks/youtube-quota-exceeded.md](../state/runbooks/youtube-quota-exceeded.md)

### Requesting Quota Increase

<!-- Link to Google Cloud Console quota increase procedure -->
