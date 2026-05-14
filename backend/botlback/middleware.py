import logging
import time
import uuid

logger = logging.getLogger('botlback.requests')


class SecurityHeadersMiddleware:
    """Adds security headers to every response."""

    CSP = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: blob: https:; "
        "font-src 'self' data:; "
        "connect-src 'self'; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self';"
    )

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response['Permissions-Policy'] = 'camera=(self), geolocation=(self), microphone=()'
        response['Content-Security-Policy'] = self.CSP
        response['X-XSS-Protection'] = '1; mode=block'
        # Only set HSTS when served over HTTPS (avoid breaking local dev)
        if request.is_secure():
            response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        return response


class RequestLoggingMiddleware:
    """Logs every request with timing and a unique request ID."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request_id = str(uuid.uuid4())[:8]
        request.request_id = request_id
        t0 = time.perf_counter()

        response = self.get_response(request)

        ms = int((time.perf_counter() - t0) * 1000)
        user = getattr(request, 'user', None)
        uid = user.id if user and user.is_authenticated else '-'
        logger.info(
            '%s %s %s | %dms | user=%s | id=%s',
            request.method,
            request.path,
            response.status_code,
            ms,
            uid,
            request_id,
        )
        response['X-Request-ID'] = request_id
        return response
