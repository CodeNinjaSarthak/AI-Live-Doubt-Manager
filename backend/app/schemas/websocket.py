"""WebSocket message schemas."""

from typing import (
    Literal,
    Optional,
)

from pydantic import BaseModel


class WebSocketMessage(BaseModel):
    """WebSocket message schema."""

    type: Literal["comment", "cluster", "answer", "status"]
    data: dict
    timestamp: Optional[float] = None


class WebSocketResponse(BaseModel):
    """WebSocket response schema."""

    status: str
    message: Optional[str] = None
