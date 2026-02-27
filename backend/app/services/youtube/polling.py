"""YouTube Live Chat polling service."""

from typing import Optional

from app.services.youtube.client import YouTubeClient


class YouTubePollingService:
    """Service for polling YouTube Live Chat messages."""

    def get_live_chat_id(self, video_id: str, access_token: str) -> Optional[str]:
        """Get live chat ID for a video.

        Args:
            video_id: YouTube video ID.
            access_token: OAuth access token.

        Returns:
            Live chat ID or None if not found.
        """
        client = YouTubeClient(access_token)
        return client.get_live_chat_id(video_id)

    def fetch_live_chat_messages(
        self,
        live_chat_id: str,
        access_token: str,
        page_token: Optional[str] = None,
    ) -> dict:
        """Fetch live chat messages from YouTube API.

        Args:
            live_chat_id: YouTube live chat ID.
            access_token: OAuth access token.
            page_token: Optional pagination token.

        Returns:
            Dictionary containing messages, next_page_token, polling_interval_ms.
        """
        client = YouTubeClient(access_token)
        return client.list_messages(live_chat_id, page_token)
