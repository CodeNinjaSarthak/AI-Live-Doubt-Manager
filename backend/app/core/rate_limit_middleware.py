"""ASGI middleware for Redis-based rate limiting."""

from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings
from app.services.rate_limiter import RateLimiter

SKIP_PATHS = {"/", "/health", "/metrics", "/docs", "/openapi.json", "/redoc"}


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.limiter = RateLimiter()

    async def dispatch(self, request, call_next):
        if not settings.rate_limit_enabled or request.url.path in SKIP_PATHS:
            return await call_next(request)

        ip = request.client.host if request.client else "unknown"
        limit = settings.rate_limit_requests_per_minute
        key = f"ratelimit:{ip}"

        allowed = self.limiter.check_rate_limit(key, limit, window=60)
        if not allowed:
            return JSONResponse(
                {"detail": "Rate limit exceeded"},
                status_code=429,
                headers={"Retry-After": "60"},
            )
        return await call_next(request)
