"""YouTube Live Chat posting service."""

from typing import Optional

from app.services.youtube.client import YouTubeClient


class YouTubePostingService:
    """Service for posting messages to YouTube Live Chat."""

    def post_message(
        self,
        live_chat_id: str,
        message: str,
        access_token: str,
    ) -> Optional[str]:
        """Post a message to YouTube Live Chat.

        Args:
            live_chat_id: Live chat ID.
            message: Message text to post (truncated to 200 chars by client).
            access_token: OAuth access token.

        Returns:
            Posted message ID or None if failed.
        """
        client = YouTubeClient(access_token)
        return client.post_message(live_chat_id, message)
