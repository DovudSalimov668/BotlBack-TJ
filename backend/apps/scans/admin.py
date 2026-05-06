from django.contrib import admin
from .models import Scan

@admin.register(Scan)
class ScanAdmin(admin.ModelAdmin):
    list_display = ('scan_type', 'bottle', 'user', 'region', 'points_awarded', 'created_at')
    list_filter = ('scan_type', 'region')
    search_fields = ('bottle__qr_code', 'user__phone')
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'
