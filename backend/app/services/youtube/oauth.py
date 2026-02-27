"""YouTube OAuth service."""

from google_auth_oauthlib.flow import Flow

from app.core.config import settings
from app.services.youtube.client import YouTubeClient

SCOPES = [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.force-ssl",
]


class YouTubeOAuthService:
    """Service for handling YouTube OAuth flow."""

    def _build_flow(self) -> Flow:
        client_config = {
            "web": {
                "client_id": settings.youtube_client_id,
                "client_secret": settings.youtube_client_secret,
                "redirect_uris": [settings.youtube_redirect_uri],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        }
        return Flow.from_client_config(
            client_config,
            scopes=SCOPES,
            redirect_uri=settings.youtube_redirect_uri,
        )

    def get_authorization_url(self) -> tuple[str, str]:
        """Get YouTube OAuth authorization URL and state.

        Returns:
            Tuple of (authorization_url, state).
        """
        flow = self._build_flow()
        url, state = flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
        )
        return url, state

    def exchange_code_for_token(self, code: str) -> dict:
        """Exchange authorization code for access token.

        Args:
            code: Authorization code from OAuth callback.

        Returns:
            Token data dictionary.
        """
        flow = self._build_flow()
        flow.fetch_token(code=code)
        creds = flow.credentials
        return {
            "access_token": creds.token,
            "refresh_token": creds.refresh_token,
            "expires_at": creds.expiry,
            "scope": " ".join(creds.scopes or []),
        }

    def refresh_token(self, refresh_token: str) -> dict:
        """Refresh an expired access token.

        Args:
            refresh_token: Refresh token string.

        Returns:
            New token data dictionary.
        """
        return YouTubeClient.refresh_access_token(refresh_token)
