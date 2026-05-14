from django.db import connection
from django.http import JsonResponse
from django.views import View


class HealthView(View):
    def get(self, request):
        db_ok = True
        try:
            connection.ensure_connection()
        except Exception:
            db_ok = False

        payload = {
            'status': 'ok' if db_ok else 'degraded',
            'db': 'ok' if db_ok else 'error',
            'version': '1.0.0',
        }
        return JsonResponse(payload, status=200 if db_ok else 503)
