import logging
from django.conf import settings
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger('botlback.errors')


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    request = context.get('request')
    view = context.get('view')
    request_id = getattr(request, 'request_id', '-') if request else '-'

    if response is not None:
        if response.status_code >= 500:
            logger.error(
                'Server error [%s] %s %s: %s',
                request_id,
                getattr(request, 'method', '?'),
                getattr(request, 'path', '?'),
                exc,
                exc_info=exc,
            )
        elif response.status_code >= 400:
            logger.warning(
                'Client error [%s] %s %s %d: %s',
                request_id,
                getattr(request, 'method', '?'),
                getattr(request, 'path', '?'),
                response.status_code,
                exc,
            )

        # In production, strip internal details from 5xx responses
        if not settings.DEBUG and response.status_code >= 500:
            response.data = {'error': 'Internal server error', 'request_id': request_id}
    else:
        # Unhandled exception
        logger.exception(
            'Unhandled exception [%s] %s %s',
            request_id,
            getattr(request, 'method', '?'),
            getattr(request, 'path', '?'),
            exc_info=exc,
        )
        if not settings.DEBUG:
            return Response(
                {'error': 'Internal server error', 'request_id': request_id},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    return response
