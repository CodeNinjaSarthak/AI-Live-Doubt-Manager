# Runbook: YouTube Quota Exceeded

**Severity:** P3 Medium
**Last updated:** 2026-03-01

## Symptom

- YouTube polling stops delivering new comments
- Backend logs show `YouTube API 403 quotaExceeded`
- Teacher dashboard shows comments stopping mid-session
- `YouTubePostingFailed` — answers not being posted to YouTube chat
- `YouTubeQuotaHigh` Prometheus alert may have fired before this

## Detect

1. **Check backend/worker logs** for:
   ```
   HttpError 403: {quotaExceeded}
   ```

2. **Check current quota usage** via Redis:
   ```bash
   redis-cli GET yt_quota:{date}   # verify key name from quota.py
   ```

3. **Check Google Cloud Console:**
   - APIs & Services → YouTube Data API v3 → Quotas
   - Default: 10,000 units/day, resets at midnight Pacific time

4. **Check Grafana YouTube Quota dashboard** for burn rate.

## Respond

1. **Stop polling immediately** (if not already stopped by quota enforcement):
   - Stop the `youtube_polling` worker: `kill` the process
   - The backend's Redis quota check should already be blocking calls

2. **Notify the teacher** (if there is a session running):
   - Teacher should be aware comments are no longer being ingested
   - Answers that were generated can still be approved and will post when quota resets

3. **Check quota reset time:**
   - YouTube quota resets at **midnight Pacific time**
   - Calculate time remaining

4. **Resume polling after reset:**
   - Restart the `youtube_polling` worker after midnight Pacific time
   - Monitor: `redis-cli GET yt_quota:{new_date}` should start at 0

5. **If session is critical and cannot wait:**
   - Consider requesting a quota increase (see below)
   - Or manually input key questions via the ManualInput component in the dashboard
     (manual questions do not use YouTube API quota)

## Root Cause

YouTube Data API v3 has a default limit of 10,000 units/day per Google Cloud project.

| Operation | Cost | To exhaust 10k units |
|-----------|------|---------------------|
| poll (per call) | 5 units | 2,000 polls |
| post message | 50 units | 200 posts |
| get chat ID | 1 unit | 10,000 calls |

A single active session polling every 5 seconds = 720 polls/hour = 3,600 units/hour.
After ~2.8 hours of active polling the quota is exhausted.

See [data/quota-model.md](../../data/quota-model.md) for the full quota model.

## Requesting a Quota Increase

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services → YouTube Data API v3 → Quotas
3. Click "Edit Quotas" → submit an increase request
4. Increases typically take 1–3 business days to be approved

## Escalate

If the session is business-critical and cannot wait for the quota reset:
- Use ManualInput as a workaround for key questions
- Escalate quota increase request to the team owner of the Google Cloud project
